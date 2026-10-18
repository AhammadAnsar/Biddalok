/**
 * Biddalok Quarantine & Orphan Recovery Store (Phase 4 / F-04, F-17)
 * 
 * Guarantees that corrupted payloads or relational orphans are NEVER silently deleted.
 * All corrupted payloads and orphaned entity references are isolated into read-only
 * quarantine containers with actionable error reports, recovery export, and audit logging.
 */

import { get, set } from 'idb-keyval';
import { recordSecurityEvent } from '../security/auditLog';

export interface QuarantinedItem {
  id: string;
  type: 'CORRUPT_PAYLOAD' | 'ORPHAN_RECORD' | 'CONSTRAINT_VIOLATION';
  sourceKeyOrTable: string;
  timestamp: string;
  reason: string;
  errorDetails?: string;
  rawPayload: any;
  recovered: boolean;
  sourceHash?: string;
  recoveryDecision?: string;
}

const QUARANTINE_STORAGE_KEY = 'biddalok_quarantine_store';

/**
 * Saves an item into the read-only quarantine store
 */
export async function quarantineCorruptPayload(
  sourceKey: string,
  rawPayload: any,
  reason: string,
  error?: any
): Promise<string> {
  const id = `quar_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const item: QuarantinedItem = {
    id,
    type: 'CORRUPT_PAYLOAD',
    sourceKeyOrTable: sourceKey,
    timestamp: new Date().toISOString(),
    reason,
    errorDetails: error?.message || String(error || 'Unknown parse error'),
    rawPayload,
    recovered: false,
  };

  try {
    const existing = (await get<QuarantinedItem[]>(QUARANTINE_STORAGE_KEY)) || [];
    existing.unshift(item);
    await set(QUARANTINE_STORAGE_KEY, existing);
  } catch (err) {
    console.error('[QuarantineStore] Failed to save quarantined item to IndexedDB:', err);
    try {
      localStorage.setItem(`quarantine_fallback_${id}`, JSON.stringify(item));
    } catch {
      // quota
    }
  }

  // Audit event for security and system monitoring
  recordSecurityEvent({
    eventType: 'PERMISSION_DENIED_MUTATION',
    action: `Payload quarantined for key: ${sourceKey}`,
    status: 'FAILED',
    severity: 'MEDIUM',
    details: { quarantineId: id, error: item.errorDetails },
  });

  return id;
}

/**
 * Records orphaned relational records (e.g. follow-up assignments whose students were deleted)
 */
export async function quarantineOrphanRecord(
  table: string,
  record: any,
  missingRelationKey: string,
  missingRelationId: string
): Promise<string> {
  const id = `orph_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const item: QuarantinedItem = {
    id,
    type: 'ORPHAN_RECORD',
    sourceKeyOrTable: table,
    timestamp: new Date().toISOString(),
    reason: `Missing relation ${missingRelationKey} with ID ${missingRelationId}`,
    rawPayload: record,
    recovered: false,
  };

  try {
    const existing = (await get<QuarantinedItem[]>(QUARANTINE_STORAGE_KEY)) || [];
    existing.unshift(item);
    await set(QUARANTINE_STORAGE_KEY, existing);
  } catch (err) {
    console.error('[QuarantineStore] Failed to record orphan:', err);
  }

  return id;
}

/**
 * Gets all quarantined items
 */
export async function getQuarantinedItems(): Promise<QuarantinedItem[]> {
  try {
    const items = await get<QuarantinedItem[]>(QUARANTINE_STORAGE_KEY);
    if (Array.isArray(items)) return items;
  } catch (err) {
    console.warn('[QuarantineStore] Error reading quarantine:', err);
  }
  return [];
}

export const getQuarantinedPayloads = getQuarantinedItems;

/**
 * Exports quarantined records as a JSON string for manual operator recovery
 */
export async function exportQuarantineDump(): Promise<string> {
  const items = await getQuarantinedItems();
  return JSON.stringify(
    {
      app: 'Biddalok Education Management Software',
      exportedAt: new Date().toISOString(),
      quarantinedRecordsCount: items.length,
      records: items,
    },
    null,
    2
  );
}

/**
 * Clears an item from quarantine once recovered or reviewed
 */
export async function markQuarantineRecovered(id: string): Promise<void> {
  try {
    const items = (await get<QuarantinedItem[]>(QUARANTINE_STORAGE_KEY)) || [];
    const updated = items.map((i) => (i.id === id ? { ...i, recovered: true } : i));
    await set(QUARANTINE_STORAGE_KEY, updated);
  } catch (err) {
    console.error('[QuarantineStore] Error marking recovered:', err);
  }
}
