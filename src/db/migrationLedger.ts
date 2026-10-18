/**
 * Biddalok Database Schema Migration Ledger (Phase 4 / F-04)
 * 
 * Replaces crude localStorage flags (e.g. 'dexie_migrated_v4') with a version-aware,
 * immutable ledger tracking every database migration stage, timestamp, and status.
 */

import { get, set } from 'idb-keyval';

export interface MigrationRecord {
  version: number;
  migratedAt: string;
  status: 'SUCCESS' | 'FAILED' | 'ROLLED_BACK';
  description: string;
  error?: string;
  details?: Record<string, any>;
}

const LEDGER_STORAGE_KEY = 'biddalok_schema_migration_ledger';

/**
 * Retrieves the full migration ledger history
 */
export async function getMigrationLedger(): Promise<MigrationRecord[]> {
  try {
    const raw = await get<MigrationRecord[]>(LEDGER_STORAGE_KEY);
    if (Array.isArray(raw)) {
      return raw;
    }
  } catch (err) {
    console.warn('[MigrationLedger] Could not read from IndexedDB, checking localStorage:', err);
  }

  // Fallback to localStorage
  try {
    const localRaw = localStorage.getItem(LEDGER_STORAGE_KEY);
    if (localRaw) {
      const parsed = JSON.parse(localRaw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }

  // Bridge legacy 'dexie_migrated_v4' if present
  try {
    const legacyV4 = localStorage.getItem('dexie_migrated_v4');
    if (legacyV4 === 'true') {
      const initial: MigrationRecord[] = [
        {
          version: 4,
          migratedAt: new Date().toISOString(),
          status: 'SUCCESS',
          description: 'Legacy Dexie v4 migration flag migrated into versioned ledger',
        },
      ];
      await recordMigration(initial[0]);
      return initial;
    }
  } catch {
    // ignore
  }

  return [];
}

/**
 * Checks if a specific schema version has already been successfully migrated
 */
export async function isVersionMigrated(version: number): Promise<boolean> {
  const ledger = await getMigrationLedger();
  return ledger.some((m) => m.version === version && m.status === 'SUCCESS');
}

/**
 * Records a completed or failed migration record into the persistent ledger
 */
export async function recordMigration(record: MigrationRecord): Promise<void> {
  let ledger: MigrationRecord[] = [];
  try {
    const existing = await get<MigrationRecord[]>(LEDGER_STORAGE_KEY);
    if (Array.isArray(existing)) {
      ledger = existing;
    }
  } catch {
    // ignore
  }

  // Remove existing entry for the same version if overwriting status
  ledger = ledger.filter((m) => m.version !== record.version);
  ledger.push(record);
  ledger.sort((a, b) => a.version - b.version);

  try {
    await set(LEDGER_STORAGE_KEY, ledger);
  } catch (err) {
    console.warn('[MigrationLedger] Failed to persist ledger to IndexedDB, fallback to localStorage:', err);
  }

  try {
    localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(ledger));
  } catch {
    // quota ignore
  }
}
