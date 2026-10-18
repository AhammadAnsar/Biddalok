/**
 * Canonical Backup & Disaster Recovery Service for Biddalok ERP (Phase 04)
 */

import { storageQueueManager } from '../store/asyncStorage';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { recordAuditEvent } from '../security/auditLog';
import { encryptBackupPayload, decryptBackupPayload } from '../security/backupCrypto';
import { 
  BackupManifest, 
  BackupPayload, 
  DryRunValidationResult, 
  RestoreOptions, 
  RestoreResult, 
  ConflictSummary
} from '../types/backup';
import { isDesktopApp } from '../store/sqliteBridge';
import { DOMAIN_REGISTRY } from '../store/domainRegistry';

export const CURRENT_APP_VERSION = '1.1.0';
export const CURRENT_SCHEMA_VERSION = 5;

function getDesktopApi() {
  return typeof window !== 'undefined' ? (window as any).desktopApi : null;
}

export async function createFullInstitutionBackup(password?: string): Promise<{
  envelope: any;
  serialized: string;
  manifest: BackupManifest;
}> {
  await storageQueueManager.flushPendingWrites();

  if (!isDesktopApp() || !getDesktopApi()) {
    throw new Error('Backup is only supported in the desktop application.');
  }

  const token = localStorage.getItem('sessionToken') || '';
  const result = await getDesktopApi().db.backup(token, password);
  if (!result.success) {
    throw new Error('Failed to generate backup: ' + result.error);
  }

  const payload: any = result.payload; 
  
  if (payload.authData && payload.authData.users) {
    payload.authData.users = payload.authData.users.map((u: any) => {
      const safe = { ...u };
      delete safe.passHash;
      delete safe.salt;
      return safe;
    });
  }

  const tableCounts: Record<string, number> = {};
  for (const domain of DOMAIN_REGISTRY) {
    tableCounts[domain] = Array.isArray(payload[domain]) ? payload[domain].length : 0;
  }
  tableCounts.authUsers = payload.authData?.users?.length || 0;

  const totalRecords = Object.values(tableCounts).reduce((a, b) => a + b, 0);

  const manifestPartial = {
    manifestVersion: 1,
    appVersion: CURRENT_APP_VERSION,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAtUTC: new Date().toISOString(),
    tableCounts,
    totalRecords,
    encryptionEnabled: !!password,
    signature: 'unsigned',
    mediaReferences: []
  } as any;

  const { envelope, serialized } = await encryptBackupPayload(payload as any, manifestPartial, password);

  recordAuditEvent({
    eventType: 'PRIVILEGED_ACTION_BACKUP' as any,
    action: 'CREATE_BACKUP',
    status: 'SUCCESS',
    severity: 'HIGH',
    userId: useAuthStore.getState().currentUser?.id,
    details: { records: totalRecords, encryption: !!password }
  });

  return { envelope, serialized, manifest: envelope.manifest as BackupManifest };
}

export async function validateBackupArchive(
  fileContent: string,
  password?: string
): Promise<DryRunValidationResult> {
  try {
    const { payload, manifest, isLegacy } = await decryptBackupPayload(fileContent, password);

    if (manifest && manifest.schemaVersion > CURRENT_SCHEMA_VERSION) {
      return { isValid: false, errors: ['Archive from a newer incompatible version.'] };
    }
    
    // Check conflicts
    const token = localStorage.getItem('sessionToken') || '';
    const currentBackupResult = await getDesktopApi().db.backup(token);
    if (!currentBackupResult.success) throw new Error('Could not read current DB state');
    
    const currentPayload = currentBackupResult.payload as any;
    const conflicts: ConflictSummary = {
      overwriteCount: 0,
      skipCount: 0,
      mergeCount: 0,
      domainBreakdown: {}
    };

    let totalIncoming = 0;
    for (const domain of DOMAIN_REGISTRY) {
      const incomingRows = Array.isArray((payload as any)[domain]) ? (payload as any)[domain] : [];
      const currentRows = Array.isArray(currentPayload[domain]) ? currentPayload[domain] : [];
      totalIncoming += incomingRows.length;
      
      const currentIds = new Set(currentRows.map((r: any) => r.id));
      let overlaps = 0;
      for (const row of incomingRows) {
        if (currentIds.has(row.id)) overlaps++;
      }
      if (overlaps > 0) {
        if (!conflicts.domainBreakdown) conflicts.domainBreakdown = {};
        conflicts.domainBreakdown[domain] = { incoming: incomingRows.length, existing: currentRows.length, overlappingIds: overlaps };
        conflicts.overwriteCount += overlaps;
      }
    }

    return {
      isValid: true,
      manifest,
      requiresPassword: manifest?.encryptionEnabled,
      conflictSummary: conflicts,
      parsedPayload: payload
    };

  } catch (err: any) {
    if (err.message.includes('password') || err.message.includes('MAC')) {
       return { isValid: false, errors: ['Decryption failed. Incorrect password or corrupt data.'] };
    }
    return { isValid: false, errors: [err.message] };
  }
}

export async function restoreInstitutionFromBackup(
  validationResult: DryRunValidationResult,
  options: RestoreOptions
): Promise<RestoreResult> {
  if (!validationResult.isValid || !validationResult.parsedPayload) {
    return { success: false, error: 'Cannot restore from invalid or unverified archive.' };
  }

  if (!isDesktopApp() || !getDesktopApi()) {
    return { success: false, error: 'Restore is only supported in desktop app.' };
  }

  try {
    const token = localStorage.getItem('sessionToken') || '';
    
    if (options.createEmergencyBackupFirst) {
      const { serialized } = await createFullInstitutionBackup();
      if (typeof window !== 'undefined' && getDesktopApi().fs?.writeEmergencyBackup) {
        await getDesktopApi().fs.writeEmergencyBackup(serialized);
      }
    }

    const restoreResult = await getDesktopApi().db.restore(token, validationResult.parsedPayload, options.mergePolicy);
    
    if (!restoreResult.success) {
      return { success: false, error: 'Restore transaction failed: ' + restoreResult.error };
    }

    // Refresh UI
    useAppStore.getState().restoreBackupAsync({ mode: options.mergePolicy, payload: validationResult.parsedPayload });

    recordAuditEvent({
      eventType: 'PRIVILEGED_ACTION_BACKUP' as any,
      action: 'RESTORE_BACKUP',
      status: 'SUCCESS',
      severity: 'CRITICAL',
      userId: useAuthStore.getState().currentUser?.id,
      details: { mode: options.mergePolicy, records: validationResult.manifest?.totalRecords }
    });

    return { success: true, restoredCount: validationResult.manifest?.totalRecords || 0 };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function performEmergencyFactoryReset(): Promise<boolean> {
  if (!isDesktopApp() || !getDesktopApi()) return false;
  
  try {
    const token = localStorage.getItem('sessionToken') || '';
    const res = await getDesktopApi().db.reset(token);
    if (!res.success) return false;

    // Reset UI state
    useAppStore.getState().resetToDefaults();
    
    recordAuditEvent({
      eventType: 'PRIVILEGED_ACTION_RESET' as any,
      action: 'FACTORY_RESET',
      status: 'SUCCESS',
      severity: 'CRITICAL',
      userId: useAuthStore.getState().currentUser?.id,
    });
    return true;
  } catch {
    return false;
  }
}
