import { useState, useEffect, useCallback } from 'react';

/**
 * Checks synchronous navigator online status.
 */
export function getIsOnline(): boolean {
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return navigator.onLine;
  }
  return true;
}

/**
 * Safely opens a web URL in the system's default external browser (Chrome/Edge/Firefox)
 * using Electron shell if running inside desktop app, or standard new tab in web mode.
 */
export function openInExternalBrowser(url: string): void {
  try {
    if (typeof window !== 'undefined' && (window as any).electron?.openExternal) {
      (window as any).electron.openExternal(url);
      return;
    }
  } catch (err) {
    console.warn('Could not open URL via electron bridge:', err);
  }

  // Fallback to web browser new window/tab
  if (typeof window !== 'undefined') {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

/**
 * React hook providing reactive online/offline status with timeout probing.
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(getIsOnline());
  const [isProbing, setIsProbing] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Actively probes connectivity with a strict timeout (default 4500ms).
   */
  const probeConnectivity = useCallback(async (timeoutMs = 4500): Promise<boolean> => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setIsOnline(false);
      return false;
    }

    setIsProbing(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Probe a reliable zero-content 204 endpoint or local health check
      const response = await fetch('https://www.google.com/generate_204', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      setIsOnline(true);
      return true;
    } catch {
      // In strict offline environment or aborted timeout
      setIsOnline(false);
      return false;
    } finally {
      setIsProbing(false);
    }
  }, []);

  return {
    isOnline,
    isProbing,
    probeConnectivity,
  };
}
