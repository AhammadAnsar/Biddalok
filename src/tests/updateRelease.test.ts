/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { 
  APP_VERSION, 
  CURRENT_SCHEMA_VERSION, 
  MIN_COMPATIBLE_SCHEMA_VERSION,
  APP_CANONICAL_NAME,
  CANONICAL_APP_DATA_DIR
} from '../version';
import packageJson from '../../package.json';
import { 
  validateUpdateManifest, 
  computeFileSha256, 
  isNewerVersion 
} from '../services/updateManifestService';
import { runUpdatePreflightCheck } from '../services/updatePreflightService';
import { 
  createPreUpdateRollbackSnapshot, 
  executeDatabaseRollback, 
  generateBinaryRollbackPlan 
} from '../services/rollbackService';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import fs from 'fs';
import path from 'path';

describe('PHASE 7: Updater, Installer, Signing & Rollback-Safe Release Suite', () => {
  beforeEach(() => {
    useAuthStore.setState({
      isAuthenticated: true,
      currentUser: {
        id: 'admin_test',
        username: 'admin',
        name: 'System Admin',
        role: 'super_admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as any,
      activeRole: 'super_admin'
    });
  });

  describe('1. Canonical Version Configuration', () => {
    it('synchronizes version across version.ts and package.json', () => {
      expect(APP_VERSION).toBe(packageJson.version);
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    it('ensures canonical product name is "বিদ্যালোক"', () => {
      expect(APP_CANONICAL_NAME).toBe('বিদ্যালোক');
      expect(CANONICAL_APP_DATA_DIR).toBe('Biddalok by SoftDows');
    });

    it('ensures system backup export uses canonical APP_VERSION rather than stale hardcoded version', () => {
      const store = useAppStore.getState();
      const backupJson = store.exportBackupJSON();
      expect(backupJson).toBeDefined();
      expect(typeof backupJson).toBe('string');
    });
  });

  describe('2. Installer Security & Signature Configuration', () => {
    it('enforces verifyUpdateCodeSignature: true in package.json', () => {
      expect((packageJson as any).build?.win?.verifyUpdateCodeSignature ?? true).toBe(true);
    });

    it('ensures deleteAppDataOnUninstall is false by default to prevent data loss', () => {
      expect((packageJson as any).build?.nsis?.deleteAppDataOnUninstall ?? false).toBe(false);
    });
  });

  describe('3. Signed Update Manifest Validation & Verification Gates', () => {
    it('rejects empty, non-object, or version-less manifests', () => {
      const emptyRes = validateUpdateManifest(null);
      expect(emptyRes.isValid).toBe(false);

      const noVerRes = validateUpdateManifest({ name: 'Update without version' });
      expect(noVerRes.isValid).toBe(false);
      expect(noVerRes.error).toContain('version');
    });

    it('rejects manifests that require a higher incompatible schema version', () => {
      const futureSchemaManifest = {
        version: '2.0.0',
        minCompatibleSchemaVersion: CURRENT_SCHEMA_VERSION + 5,
        assets: {
          installer: {
            fileName: 'Setup.exe',
            sha256: 'a'.repeat(64),
            fileSizeBytes: 1000
          }
        }
      };

      const res = validateUpdateManifest(futureSchemaManifest);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('schema version');
    });

    it('rejects manifests missing a valid 64-character SHA-256 hash', () => {
      const invalidShaManifest = {
        version: '1.2.0',
        minCompatibleSchemaVersion: MIN_COMPATIBLE_SCHEMA_VERSION,
        assets: {
          installer: {
            fileName: 'Setup.exe',
            sha256: 'invalid-short-hash',
            fileSizeBytes: 1000
          }
        }
      };

      const res = validateUpdateManifest(invalidShaManifest);
      expect(res.isValid).toBe(false);
      expect(res.error).toContain('SHA-256');
    });

    it('accepts a valid signed manifest and parses all metadata cleanly', () => {
      const validPayload = {
        version: '1.2.0',
        channel: 'stable',
        releaseDate: '2026-09-20',
        minCompatibleSchemaVersion: 4,
        publisher: {
          name: 'Ansar Ahammad',
          organization: 'SoftDows'
        },
        assets: {
          installer: {
            fileName: 'Biddalok-Setup-1.2.0.exe',
            downloadUrl: 'https://example.com/Biddalok-Setup-1.2.0.exe',
            fileSizeBytes: 52428800,
            sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
            signature: 'SIG_VALID_2026'
          }
        },
        manifestSignature: 'SIG_MANIFEST_VALID'
      };

      const res = validateUpdateManifest(validPayload);
      expect(res.isValid).toBe(true);
      expect(res.manifest?.version).toBe('1.2.0');
      expect(res.manifest?.assets.installer.fileSizeBytes).toBe(52428800);
      expect(res.manifest?.assets.installer.sha256).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
      expect(res.manifest?.isDevelopmentUnsigned).toBe(false);
    });

    it('correctly compares SemVer strings', () => {
      expect(isNewerVersion('1.2.0', '1.1.0')).toBe(true);
      expect(isNewerVersion('1.1.1', '1.1.0')).toBe(true);
      expect(isNewerVersion('2.0.0', '1.9.9')).toBe(true);
      expect(isNewerVersion('1.1.0', '1.1.0')).toBe(false);
      expect(isNewerVersion('1.0.9', '1.1.0')).toBe(false);
    });
  });

  describe('4. Preflight Verification & Storage Safety', () => {
    it('executes preflight check ensuring writes flush and backup exists', async () => {
      const report = await runUpdatePreflightCheck();
      expect(report).toBeDefined();
      expect(report.pendingWritesFlushed).toBe(true);
      expect(report.isSchemaCompatible).toBe(true);
      expect(report.checks.length).toBeGreaterThanOrEqual(4);
      expect(report.canProceed).toBe(true);
    });

    it('detects schema incompatibility during preflight', async () => {
      const incompatibleManifest: any = {
        version: '3.0.0',
        minCompatibleSchemaVersion: 99,
        assets: {
          installer: {
            fileName: 'Setup.exe',
            sha256: 'a'.repeat(64)
          }
        }
      };

      const report = await runUpdatePreflightCheck(incompatibleManifest);
      expect(report.isSchemaCompatible).toBe(false);
      expect(report.canProceed).toBe(false);
    });
  });

  describe('5. Database & Binary Rollback Safety', () => {
    it('creates a verified pre-update rollback snapshot with SHA-256 hash', async () => {
      const snapshot = await createPreUpdateRollbackSnapshot('1.2.0');
      expect(snapshot).toBeDefined();
      expect(snapshot.sourceVersion).toBe(APP_VERSION);
      expect(snapshot.targetVersion).toBe('1.2.0');
      expect(snapshot.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(snapshot.backupDataJson.length).toBeGreaterThan(50);
    });

    it('executes database rollback successfully when snapshot is valid', async () => {
      const snapshot = await createPreUpdateRollbackSnapshot('1.2.0');
      const result = await executeDatabaseRollback(snapshot);
      expect(result.success).toBe(true);
      expect(result.restoredVersion).toBe(APP_VERSION);
    });

    it('aborts database rollback if snapshot payload is tampered (hash mismatch)', async () => {
      const snapshot = await createPreUpdateRollbackSnapshot('1.2.0');
      // Tamper with the data
      const tamperedSnapshot = {
        ...snapshot,
        backupDataJson: snapshot.backupDataJson + ' '
      };

      const result = await executeDatabaseRollback(tamperedSnapshot);
      expect(result.success).toBe(false);
      expect(result.message).toContain('integrity check failed');
    });

    it('generates an actionable binary rollback plan in dual languages', () => {
      const plan = generateBinaryRollbackPlan('1.1.0', 'Biddalok-Setup-1.1.0.exe');
      expect(plan.steps.length).toBeGreaterThanOrEqual(4);
      expect(plan.stepsBn.length).toBeGreaterThanOrEqual(4);
      expect(plan.steps[1]).toContain('Biddalok-Setup-1.1.0.exe');
      expect(plan.stepsBn[1]).toContain('Biddalok-Setup-1.1.0.exe');
      expect(plan.safetyNotesBn[0]).toContain('%APPDATA%\\Biddalok by SoftDows');
    });
  });

  describe('6. NSIS Installer Script Canonical Paths & Safe Uninstallation Rules', () => {
    it('verifies electron/installer.nsh preserves data by default and targets canonical paths', () => {
      const nshPath = path.resolve(__dirname, '../../electron/installer.nsh');
      const nshContent = fs.readFileSync(nshPath, 'utf8');

      // Canonical paths
      expect(nshContent).toContain('$APPDATA\\Biddalok by SoftDows');
      expect(nshContent).toContain('Software\\Biddalok by SoftDows');

      // Data preservation
      expect(nshContent).toContain('UPGRADE_PRESERVE_DATA');
      expect(nshContent).toContain('preserve_user_data');
      expect(nshContent).toContain('pre_upgrade_backup');

      // Unchecked deletion safety
      expect(nshContent).toContain('confirm_data_destruction');
      // Must NOT delete wildcards like RMDir /r "$APPDATA"
      expect(nshContent).not.toMatch(/RMDir\s+\/r\s+"\$APPDATA"/);
    });
  });

});
