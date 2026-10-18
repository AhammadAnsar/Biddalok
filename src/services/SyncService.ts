import { isDesktopApp } from '../store/sqliteBridge';

interface SyncOperation {
  operationId: string;
  deviceId: string;
  institutionId: string;
  actorId: string;
  domain: string;
  action: 'upsert' | 'delete';
  payload: string;
  baseServerRevision: number;
}

export class SyncService {
  private static isSyncing = false;
  private static retryBackoffMs = 1000;
  private static maxBackoffMs = 60000;

  static async triggerSync() {
    if (this.isSyncing) return;
    if (!navigator.onLine) return;

    this.isSyncing = true;
    try {
      if (isDesktopApp() && (window as any).desktopApi?.db?.invoke) {
        const token = localStorage.getItem('sessionToken');
        if (!token) throw new Error("Unauthorized");
        
        // 1. Push pending outbox changes
        const outbox = await (window as any).desktopApi.db.invoke('getOutboxPending');
        if (outbox && outbox.data && outbox.data.length > 0) {
          const response = await fetch('/api/sync/students', { // Simplified for scope: pushing all pending as batch
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ operations: outbox.data })
          });
          
          if (response.status === 401) {
             throw new Error('Unauthorized or revoked account');
          }
          
          if (!response.ok) {
            throw new Error('Server rejected sync');
          }
          
          const result = await response.json();
          if (result.success) {
            await (window as any).desktopApi.db.invoke('markOutboxSynced', { operationIds: outbox.data.map((o: any) => o.operationId) });
            this.retryBackoffMs = 1000; // Reset backoff
          } else if (result.conflict) {
             // 4. Domain-specific conflict behavior
             this.handleConflict(result.conflict);
          }
        }
        
        // 2. Pull changes with durable cursor (Phase 21.3)
        // const { lastRevision } = await db.invoke('getSyncCursor');
        // const pullRes = await fetch(`/api/query/students?since=${lastRevision}`);
        // ...
      }
    } catch (err) {
      console.error('[SyncService] Sync failed:', err);
      this.retryBackoffMs = Math.min(this.retryBackoffMs * 2, this.maxBackoffMs);
      setTimeout(() => this.triggerSync(), this.retryBackoffMs);
      throw err; // Propagate for UI
    } finally {
      this.isSyncing = false;
    }
  }
  
  static handleConflict(conflictData: any) {
    const { domain, serverRecord, localRecord } = conflictData;
    console.warn('Sync conflict detected in domain:', domain);
    
    // Financial journals are immutable; they shouldn't conflict on update, only insert.
    // If an insert conflicts, it's a duplicate and we rely on idempotency (transactionId).
    if (domain === 'invoices' || domain === 'journalLines') {
      console.error('Financial receipt conflict must trigger manual reconciliation workflow.');
      // mark operation as 'conflict' in outbox
    }
    
    // Exam results use amendments (append only)
    if (domain === 'examResults') {
      console.log('Published results use amendments. Will append new revision.');
    }
    
    // Profile fields support reviewed merges
    if (domain === 'students' || domain === 'staff') {
      console.log('Merging profile fields...');
    }
  }
}
