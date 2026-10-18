/**
 * Biddalok Persistence Error & Audit Logger (Phase 4 / F-04, F-17)
 * 
 * Eliminates silent .catch(() => {}) across repository & store layers.
 * Records actionable persistence diagnostics and system audit alerts.
 */

import { recordSecurityEvent } from '../security/auditLog';

export interface PersistenceAlert {
  id: string;
  domain: string;
  operation: string;
  timestamp: string;
  errorMessage: string;
  stack?: string;
}

const persistenceAlerts: PersistenceAlert[] = [];

/**
 * Handles errors during storage or database synchronization without silently swallowing them.
 */
export function handlePersistenceError(domain: string, operation: string, err: any): void {
  const message = err?.message || String(err || 'Unknown persistence error');
  console.error(`[Persistence Failure] Domain: ${domain} | Operation: ${operation} ->`, err);

  const alert: PersistenceAlert = {
    id: `perr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    domain,
    operation,
    timestamp: new Date().toISOString(),
    errorMessage: message,
    stack: err?.stack,
  };

  persistenceAlerts.unshift(alert);
  if (persistenceAlerts.length > 50) {
    persistenceAlerts.pop();
  }

  // Record into security & integrity audit log
  recordSecurityEvent({
    eventType: 'PERMISSION_DENIED_MUTATION',
    action: `Persistence failure in ${domain}.${operation}`,
    status: 'FAILED',
    severity: 'HIGH',
    details: { domain, operation, message },
  });
}

/**
 * Executes a persistence action with centralized error tracking and audit telemetry
 */
export async function safePersist<T>(
  domain: string,
  operation: string,
  persistPromise: Promise<T>
): Promise<T | null> {
  try {
    return await persistPromise;
  } catch (err) {
    handlePersistenceError(domain, operation, err);
    return null;
  }
}

/**
 * Retrieves recent persistence alerts for system administration and telemetry diagnostics
 */
export function getRecentPersistenceAlerts(): PersistenceAlert[] {
  return [...persistenceAlerts];
}

export const getPersistenceErrorLog = getRecentPersistenceAlerts;

export function clearPersistenceErrorLog(): void {
  persistenceAlerts.length = 0;
}

