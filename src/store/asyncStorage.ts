import { StateStorage, PersistStorage, StorageValue } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

export interface StorageStatus {
  isPersisting: boolean;
  pendingWritesCount: number;
  lastPersistedAt: Date | null;
  lastError: string | null;
  totalPersistOperations: number;
}

const memoryStorageFallback = new Map<string, string>();

const statusInfo: StorageStatus = {
  isPersisting: false,
  pendingWritesCount: 0,
  lastPersistedAt: null,
  lastError: null,
  totalPersistOperations: 0
};

export const storageQueueManager = {
  getQueueLength: () => statusInfo.pendingWritesCount,
  flushPendingWrites: async (key?: string) => {},
  addStatusListener: (listener: any) => () => {},
  removeFromMemoryCache: (key: string) => {
    memoryStorageFallback.delete(key);
  },
  getStatus: (): StorageStatus => ({ ...statusInfo })
};

/**
 * Robust non-blocking asynchronous storage adapter backed by IndexedDB via idb-keyval.
 * Includes an in-memory fallback for test runners or non-browser environments.
 */
export const asyncNonBlockingStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    if (typeof indexedDB === 'undefined') {
      return memoryStorageFallback.get(name) ?? null;
    }
    try {
      const val = await get(name);
      if (val === undefined || val === null) return null;
      return typeof val === 'string' ? val : JSON.stringify(val);
    } catch (err) {
      console.warn('[asyncNonBlockingStorage] getItem failed:', err);
      return memoryStorageFallback.get(name) ?? null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    statusInfo.isPersisting = true;
    statusInfo.pendingWritesCount++;
    try {
      if (typeof indexedDB === 'undefined') {
        memoryStorageFallback.set(name, value);
      } else {
        await set(name, value);
      }
      statusInfo.lastPersistedAt = new Date();
      statusInfo.totalPersistOperations++;
      statusInfo.lastError = null;
    } catch (err: any) {
      console.warn('[asyncNonBlockingStorage] setItem failed:', err);
      statusInfo.lastError = err?.message || String(err);
      memoryStorageFallback.set(name, value);
    } finally {
      statusInfo.pendingWritesCount = Math.max(0, statusInfo.pendingWritesCount - 1);
      statusInfo.isPersisting = false;
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      if (typeof indexedDB === 'undefined') {
        memoryStorageFallback.delete(name);
      } else {
        await del(name);
      }
    } catch (err: any) {
      console.warn('[asyncNonBlockingStorage] removeItem failed:', err);
      memoryStorageFallback.delete(name);
    }
  },
};

/**
 * Creates a type-safe JSON PersistStorage conforming to Zustand persist middleware.
 */
export function createSafeJsonStorage<S = any>(getStorage: () => StateStorage): PersistStorage<S> {
  return {
    getItem: async (name: string): Promise<StorageValue<S> | null> => {
      try {
        const storage = getStorage();
        const raw = await storage.getItem(name);
        if (!raw) return null;
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        return parsed as StorageValue<S>;
      } catch (err) {
        console.warn(`[createSafeJsonStorage] Failed to read ${name}:`, err);
        return null;
      }
    },
    setItem: async (name: string, value: StorageValue<S>): Promise<void> => {
      try {
        const storage = getStorage();
        const serialized = JSON.stringify(value);
        await storage.setItem(name, serialized);
      } catch (err) {
        console.warn(`[createSafeJsonStorage] Failed to persist ${name}:`, err);
      }
    },
    removeItem: async (name: string): Promise<void> => {
      try {
        const storage = getStorage();
        await storage.removeItem(name);
      } catch (err) {
        console.warn(`[createSafeJsonStorage] Failed to remove ${name}:`, err);
      }
    },
  };
}

export async function flushStorageToDisk(): Promise<void> {
  await storageQueueManager.flushPendingWrites('biddalok-database-v1');
}
