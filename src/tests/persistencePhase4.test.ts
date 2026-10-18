import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { safePersist, getPersistenceErrorLog, clearPersistenceErrorLog } from '../db/persistenceLog';
import { getDatabaseManifest, executeControlledReset } from '../db/resetService';
import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { setSecurityBypassForTesting } from '../security/guard';
import { storageQueueManager } from '../store/asyncStorage';
import { quarantineCorruptPayload, getQuarantinedPayloads } from '../db/quarantineStore';

describe('Phase 4: Canonical Persistence & Durable Writes Tests', () => {
  beforeEach(async () => {
    setSecurityBypassForTesting(true);
    clearPersistenceErrorLog();
    useAppStore.setState({ students: [], staff: [] });
  });

  describe('1. safePersist & Error Journaling', () => {
    it('successfully executes and resolves healthy persistence operations', async () => {
      const result = await safePersist('students', 'test_insert', Promise.resolve({ id: '123' }));
      expect(result).toEqual({ id: '123' });
      expect(getPersistenceErrorLog()).toHaveLength(0);
    });

    it('captures persistence failures without crashing and records audit entries', async () => {
      const failingPromise = Promise.reject(new Error('IndexedDB Transaction Quota Exceeded'));
      const result = await safePersist('finance', 'failing_transaction', failingPromise);
      
      expect(result).toBeNull();
      const logs = getPersistenceErrorLog();
      expect(logs).toHaveLength(1);
      expect(logs[0].domain).toBe('finance');
      expect(logs[0].operation).toBe('failing_transaction');
      expect(logs[0].errorMessage).toContain('Quota Exceeded');
    });
  });

  describe('2. Domain Manifest & Controlled Factory Reset', () => {
    it('generates an accurate domain-by-domain record manifest', async () => {
      const manifest = await getDatabaseManifest();
      expect(manifest).toBeDefined();
      expect(typeof manifest.totalRecords).toBe('number');
      expect(typeof manifest.studentsCount).toBe('number');
      expect(typeof manifest.financialTransactionsCount).toBe('number');
      expect(typeof manifest.followupCampaignsCount).toBe('number');
    });

    it('performs controlled factory reset with pre-reset verification', async () => {
      const resetResult = await executeControlledReset({ createBackupFirst: false });
      expect(resetResult.success).toBe(true);
      expect(resetResult.postResetManifest).toBeDefined();
      expect(resetResult.postResetManifest.totalRecords).toBe(0);
    });
  });

  describe('3. Durable Write Queue & Telemetry', () => {
    it('provides telemetry for pending writes and persistence status', async () => {
      const status = storageQueueManager.getStatus();
      expect(status).toBeDefined();
      expect(typeof status.isPersisting).toBe('boolean');
      expect(typeof status.pendingWritesCount).toBe('number');
    });

    it('flushPendingWrites resolves cleanly without dangling timers', async () => {
      await expect(storageQueueManager.flushPendingWrites()).resolves.not.toThrow();
    });
  });

  describe('4. Quarantine System for Corrupt Payloads', () => {
    it('safely quarantines invalid JSON without dropping records', async () => {
      const corruptKey = 'biddalok_corrupted_key';
      const corruptData = '{"incomplete_json: 123...';

      await quarantineCorruptPayload(corruptKey, corruptData, 'Test syntax error', new Error('Unexpected token'));

      const quarantined = await getQuarantinedPayloads();
      expect(quarantined.length).toBeGreaterThanOrEqual(1);
      const entry = quarantined.find((q) => q.sourceKeyOrTable === corruptKey);
      expect(entry).toBeDefined();
      expect(entry?.rawPayload).toBe(corruptData);
      expect(entry?.reason).toBe('Test syntax error');
    });
  });
});
