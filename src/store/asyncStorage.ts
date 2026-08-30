import { StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { yieldToMainThread } from '../utils/asyncBatch';

/**
 * Storage Telemetry & Status Interface
 */
export interface StorageStatus {
  isPersisting: boolean;
  pendingWritesCount: number;
  lastPersistedAt: Date | null;
  lastError: string | null;
  totalPersistOperations: number;
}

type StorageStatusListener = (status: StorageStatus) => void;

interface QueueTask {
  id: string;
  type: 'write' | 'delete';
  key: string;
  value?: string;
  resolve: () => void;
  reject: (err: any) => void;
}

/**
 * IndexedDB Serialized Transaction Queue Manager
 * - Guarantees sequential, non-overlapping ACID transactions against IndexedDB
 * - Coalesces rapid sequential writes to the same key into a single disk write
 * - Yields to the main thread between tasks to keep 60 FPS UI responsiveness
 * - Provides immediate L1 in-memory cache mirroring
 */
class IndexedDBTransactionQueueManager {
  private queue: QueueTask[] = [];
  private isProcessing = false;
  private memoryCache = new Map<string, string>();
  private pendingDebounceTimers = new Map<string, any>();
  private pendingResolvers = new Map<string, Array<() => void>>();
  private statusListeners = new Set<StorageStatusListener>();

  private status: StorageStatus = {
    isPersisting: false,
    pendingWritesCount: 0,
    lastPersistedAt: null,
    lastError: null,
    totalPersistOperations: 0,
  };

  /**
   * Subscribe to storage persistence telemetry
   */
  public subscribe(listener: StorageStatusListener): () => void {
    this.statusListeners.add(listener);
    listener({ ...this.status });
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  private notifyStatusChange() {
    const snapshot = { ...this.status };
    this.statusListeners.forEach((listener) => {
      try {
        listener(snapshot);
      } catch (err) {
        console.error('[StorageTelemetry] Listener error:', err);
      }
    });
  }

  public getStatus(): StorageStatus {
    return { ...this.status };
  }

  public getFromMemoryCache(key: string): string | null {
    return this.memoryCache.get(key) || null;
  }

  public setMemoryCache(key: string, value: string): void {
    this.memoryCache.set(key, value);
  }

  public removeFromMemoryCache(key: string): void {
    this.memoryCache.delete(key);
  }

  /**
   * Enqueues a write operation with adaptive debouncing and coalescing.
   * Resolves immediately for callers while ensuring persistent background execution.
   */
  public enqueueWrite(key: string, value: string, debounceMs = 120): Promise<void> {
    // 1. Instant L1 memory cache update
    this.memoryCache.set(key, value);

    return new Promise<void>((resolve) => {
      // Register resolver for this key
      if (!this.pendingResolvers.has(key)) {
        this.pendingResolvers.set(key, []);
      }
      this.pendingResolvers.get(key)!.push(resolve);

      // Cancel existing debounce timer for this key if pending (coalescing)
      if (this.pendingDebounceTimers.has(key)) {
        clearTimeout(this.pendingDebounceTimers.get(key));
      }

      this.status.pendingWritesCount = this.pendingDebounceTimers.size + (this.isProcessing ? 1 : 0);
      this.notifyStatusChange();

      // Schedule debounced flush to transaction queue
      const timer = setTimeout(() => {
        this.pendingDebounceTimers.delete(key);
        const resolvers = this.pendingResolvers.get(key) || [];
        this.pendingResolvers.delete(key);

        this.pushTask({
          id: `${key}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          type: 'write',
          key,
          value,
          resolve: () => {
            resolvers.forEach((res) => res());
          },
          reject: (err) => {
            console.error(`[StorageQueue] Write task failed for key "${key}":`, err);
            resolvers.forEach((res) => res());
          },
        });
      }, debounceMs);

      this.pendingDebounceTimers.set(key, timer);
    });
  }

  /**
   * Enqueues a deletion task.
   */
  public enqueueDelete(key: string): Promise<void> {
    this.memoryCache.delete(key);

    if (this.pendingDebounceTimers.has(key)) {
      clearTimeout(this.pendingDebounceTimers.get(key));
      this.pendingDebounceTimers.delete(key);
    }
    const pendingRes = this.pendingResolvers.get(key);
    if (pendingRes) {
      pendingRes.forEach((res) => res());
      this.pendingResolvers.delete(key);
    }

    return new Promise<void>((resolve, reject) => {
      this.pushTask({
        id: `del_${key}_${Date.now()}`,
        type: 'delete',
        key,
        resolve,
        reject,
      });
    });
  }

  private pushTask(task: QueueTask) {
    // If a write task for the same key is already in queue and not yet executing,
    // coalesce it with the newest payload to avoid redundant I/O writes.
    const existingIndex = this.queue.findIndex((t) => t.key === task.key && t.type === task.type);
    if (existingIndex !== -1 && task.type === 'write') {
      const oldTask = this.queue[existingIndex];
      const oldResolve = oldTask.resolve;
      oldTask.value = task.value;
      oldTask.resolve = () => {
        oldResolve();
        task.resolve();
      };
    } else {
      this.queue.push(task);
    }

    this.status.pendingWritesCount = this.queue.length + this.pendingDebounceTimers.size;
    this.notifyStatusChange();

    this.processNext();
  }

  /**
   * Sequentially processes tasks in the queue with non-blocking time-slicing
   */
  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.status.isPersisting = true;
    this.notifyStatusChange();

    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      this.status.pendingWritesCount = this.queue.length + this.pendingDebounceTimers.size;
      this.notifyStatusChange();

      try {
        if (task.type === 'write' && task.value !== undefined) {
          // Perform async non-blocking write to IndexedDB
          await set(task.key, task.value);
        } else if (task.type === 'delete') {
          await del(task.key);
          try {
            localStorage.removeItem(task.key);
          } catch {
            // ignore
          }
        }

        this.status.lastPersistedAt = new Date();
        this.status.totalPersistOperations++;
        this.status.lastError = null;
        task.resolve();
      } catch (err: any) {
        console.warn(`[StorageQueue] IndexedDB transaction error for key "${task.key}":`, err);
        this.status.lastError = err?.message || String(err);

        // Fallback to localStorage if IndexedDB encounters disk failure/quota
        if (task.type === 'write' && task.value !== undefined) {
          try {
            localStorage.setItem(task.key, task.value);
          } catch (localErr) {
            console.error('[StorageQueue] LocalStorage fallback quota exceeded:', localErr);
          }
        }
        task.reject(err);
      }

      // Cooperative yield to keep UI frame-rate fluid even during heavy consecutive transactions
      if (this.queue.length > 0) {
        await yieldToMainThread();
      }
    }

    this.isProcessing = false;
    this.status.isPersisting = false;
    this.status.pendingWritesCount = this.pendingDebounceTimers.size;
    this.notifyStatusChange();
  }

  /**
   * Forces all pending debounced writes to be flushed to IndexedDB immediately and awaits completion.
   * Useful before critical actions like creating a backup export or system exit.
   */
  public async flushPendingWrites(specificKey?: string): Promise<void> {
    const keysToFlush = specificKey
      ? [specificKey]
      : Array.from(this.pendingDebounceTimers.keys());

    for (const key of keysToFlush) {
      if (this.pendingDebounceTimers.has(key)) {
        clearTimeout(this.pendingDebounceTimers.get(key));
        this.pendingDebounceTimers.delete(key);

        const val = this.memoryCache.get(key);
        const resolvers = this.pendingResolvers.get(key) || [];
        this.pendingResolvers.delete(key);

        if (val !== undefined) {
          this.pushTask({
            id: `flush_${key}_${Date.now()}`,
            type: 'write',
            key,
            value: val,
            resolve: () => resolvers.forEach((res) => res()),
            reject: (err) => {
              resolvers.forEach((res) => res());
            },
          });
        }
      }
    }

    // Wait until the queue is completely drained
    while (this.isProcessing || this.queue.length > 0) {
      await yieldToMainThread();
    }
  }
}

// Singleton Queue Manager instance
export const storageQueueManager = new IndexedDBTransactionQueueManager();

/**
 * Ultra-Fast Non-Blocking Asynchronous Storage Engine with Transaction Queue
 * Conforms to Zustand's StateStorage contract.
 */
export const asyncNonBlockingStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // 1. Check in-memory L1 cache (instant 0ms retrieval)
    const cached = storageQueueManager.getFromMemoryCache(name);
    if (cached !== null) {
      return cached;
    }

    // 2. Read from IndexedDB
    try {
      const val = await get(name);
      if (val !== undefined && val !== null) {
        const str = typeof val === 'string' ? val : JSON.stringify(val);
        storageQueueManager.setMemoryCache(name, str);
        return str;
      }
    } catch (e) {
      console.warn('[Storage] IndexedDB read warning:', e);
    }

    // 3. Fallback to localStorage (e.g. migration from old version)
    try {
      const localVal = localStorage.getItem(name);
      if (localVal) {
        storageQueueManager.setMemoryCache(name, localVal);
        // Silently queue migration write to IndexedDB in background
        storageQueueManager.enqueueWrite(name, localVal, 50).catch(() => {});
        return localVal;
      }
    } catch (err) {
      console.warn('[Storage] LocalStorage read warning:', err);
    }

    return null;
  },

  setItem: (name: string, value: string): Promise<void> => {
    // Enqueue write into the transaction queue manager with non-blocking coalesced debouncing
    return storageQueueManager.enqueueWrite(name, value, 120);
  },

  removeItem: async (name: string): Promise<void> => {
    return storageQueueManager.enqueueDelete(name);
  },
};
