/**
 * Asynchronous Batching & Time-Slicing Utilities
 * Prevents UI thread freezing during heavy computation, Excel parsing, bulk validation, and database updates.
 */

/**
 * Cooperative yield to the main browser thread.
 * Allows the browser to process UI events, repaint frames (60fps), and prevent jank/freezes.
 */
export const yieldToMainThread = async (): Promise<void> => {
  // 1. Modern Chrome / Electron native scheduler yield
  if (typeof window !== 'undefined' && 'scheduler' in window && typeof (window as any).scheduler?.yield === 'function') {
    try {
      await (window as any).scheduler.yield();
      return;
    } catch {
      // fallback
    }
  }

  // 2. MessageChannel macro-task yield (faster and cleaner than setTimeout 0)
  if (typeof MessageChannel !== 'undefined') {
    return new Promise((resolve) => {
      const channel = new MessageChannel();
      channel.port1.onmessage = () => resolve();
      channel.port2.postMessage(null);
    });
  }

  // 3. Fallback to setTimeout 0
  return new Promise((resolve) => setTimeout(resolve, 0));
};

export interface AsyncBatchOptions {
  /** Number of items to process in a single tick before yielding (default: 50) */
  chunkSize?: number;
  /** Optional callback reporting progress percentage (0 - 100) and counts */
  onProgress?: (progressPercent: number, processedCount: number, totalCount: number) => void;
  /** Maximum time slice in milliseconds before yielding to keep 60 FPS (default: 16ms) */
  maxTimeSliceMs?: number;
}

/**
 * Processes an array of items asynchronously in time-sliced batches without blocking the UI thread.
 *
 * @param items Array of items to process
 * @param itemProcessor Async or sync function to process each item
 * @param options Batch options (chunkSize, onProgress, maxTimeSliceMs)
 * @returns Array of processed results
 */
export async function processAsyncBatch<T, R>(
  items: T[],
  itemProcessor: (item: T, index: number, allItems: T[]) => Promise<R> | R,
  options: AsyncBatchOptions = {}
): Promise<R[]> {
  if (!items || items.length === 0) return [];

  const {
    chunkSize = 50,
    onProgress,
    maxTimeSliceMs = 16
  } = options;

  const total = items.length;
  const results: R[] = new Array(total);
  let lastYieldTime = performance.now();

  for (let i = 0; i < total; i++) {
    results[i] = await itemProcessor(items[i], i, items);

    // Update progress if requested
    if (onProgress && (i % 10 === 0 || i === total - 1)) {
      const percent = Math.round(((i + 1) / total) * 100);
      onProgress(percent, i + 1, total);
    }

    // Yield control if chunk boundary reached OR time slice exceeded 16ms (one 60Hz frame)
    const now = performance.now();
    if ((i + 1) % chunkSize === 0 || (now - lastYieldTime) >= maxTimeSliceMs) {
      await yieldToMainThread();
      lastYieldTime = performance.now();
    }
  }

  if (onProgress) {
    onProgress(100, total, total);
  }

  return results;
}

/**
 * Splits an array into manageable chunks for batch processing or paged operations.
 */
export function chunkArray<T>(array: T[], size: number = 50): T[][] {
  if (!array || array.length === 0) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}
