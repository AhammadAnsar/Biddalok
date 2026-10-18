import React, { ComponentType, lazy } from 'react';

/**
 * Resilient lazy loader for offline-first and sandboxed web environments.
 * If a dynamically imported chunk fails due to a network hiccup, container restart,
 * or cache invalidation, it automatically retries with exponential backoff before
 * triggering a full reload once to ensure freshness.
 */
export function lazyWithRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
  retries = 2,
  interval = 1000
): React.LazyExoticComponent<T> {
  return lazy(() =>
    new Promise<{ default: T }>((resolve, reject) => {
      const attempt = (remainingRetries: number) => {
        factory()
          .then(resolve)
          .catch((error: unknown) => {
            if (remainingRetries > 0) {
              setTimeout(() => {
                attempt(remainingRetries - 1);
              }, interval);
            } else {
              // Check if we already reloaded once for this chunk failure to avoid loops
              const key = 'biddalok_chunk_retry_' + window.location.pathname;
              const hasReloaded = sessionStorage.getItem(key);
              if (!hasReloaded) {
                sessionStorage.setItem(key, 'true');
                window.location.reload();
              } else {
                sessionStorage.removeItem(key);
                reject(error);
              }
            }
          });
      };
      attempt(retries);
    })
  );
}
