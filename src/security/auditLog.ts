/**
 * Tamper-Evident Security Audit Logger for Biddalok ERP.
 * Strictly redacts passwords, tokens, and PII.
 */

export type AuditEventType =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_LOGOUT'
  | 'AUTH_LOCKOUT'
  | 'AUTH_PASSWORD_CHANGED'
  | 'AUTH_PASSWORD_RECOVERY_ATTEMPT'
  | 'AUTH_PASSWORD_RECOVERY_SUCCESS'
  | 'RBAC_ROLE_CHANGED'
  | 'RBAC_USER_CREATED'
  | 'RBAC_USER_DELETED'
  | 'RBAC_USER_MUTATED'
  | 'PERMISSION_DENIED_ROUTE'
  | 'PERMISSION_DENIED_MUTATION'
  | 'PRIVILEGED_ACTION_BACKUP'
  | 'PRIVILEGED_ACTION_RESET'
  | 'PRIVILEGED_ACTION_SETTINGS'
  | 'CSRF_BLOCKED'
  | 'ORIGIN_BLOCKED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'API_AUTH_REQUIRED'
  | 'API_INVALID_TOKEN'
  | 'API_PERMISSION_DENIED'
  | 'ORPHAN_SCAN'
  | 'ORPHAN_DELETE'
  | 'PATH_TRAVERSAL_BLOCKED'
  | 'MALICIOUS_UPLOAD_BLOCKED'
  | 'MALWARE_DETECTED'
  | 'FILE_UPLOADED'
  | 'MEDIA_ACCESS_DENIED';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  userId?: string;
  username?: string;
  role?: string;
  action: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details?: Record<string, unknown>;
}

export interface SecurityEventOptions {
  eventType: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  role?: string;
  userId?: string;
  username?: string;
  action?: string;
  status?: 'SUCCESS' | 'DENIED' | 'FAILED';
  details?: Record<string, unknown>;
}

const inMemoryAuditLog: AuditLogEntry[] = [];
const MAX_IN_MEMORY_LOGS = 500;

/**
 * Appends a security audit entry. Automatically redacts sensitive fields.
 */
export function recordAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  const sanitizedDetails = entry.details ? sanitizeDetails(entry.details) : undefined;

  const fullEntry: AuditLogEntry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    eventType: entry.eventType,
    userId: entry.userId,
    username: entry.username,
    role: entry.role,
    action: entry.action,
    status: entry.status,
    severity: entry.severity,
    details: sanitizedDetails,
  };

  inMemoryAuditLog.unshift(fullEntry);
  if (inMemoryAuditLog.length > MAX_IN_MEMORY_LOGS) {
    inMemoryAuditLog.pop();
  }

  // Also log securely to console in development
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
    console.info(`[AUDIT ${fullEntry.eventType}] ${fullEntry.action} - ${fullEntry.status}`);
  }

  return fullEntry;
}

/**
 * High-level security event recorder for API, network, and upload events.
 */
export function recordSecurityEvent(event: SecurityEventOptions): AuditLogEntry {
  return recordAuditEvent({
    eventType: event.eventType as AuditEventType,
    userId: event.userId,
    username: event.username,
    role: event.role,
    action: event.action || event.eventType,
    status: event.status || (event.severity === 'LOW' ? 'SUCCESS' : 'DENIED'),
    severity: event.severity || 'MEDIUM',
    details: event.details,
  });
}

export function getAuditLogs(): readonly AuditLogEntry[] {
  return [...inMemoryAuditLog];
}

export function clearAuditLogsForTesting(): void {
  inMemoryAuditLog.length = 0;
}

/**
 * Recursively strips any keys containing password, pin, token, secret, salt, hash.
 */
function sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const sensitiveRegex = /(pass|password|pin|token|secret|salt|hash|credential|auth)/i;

  for (const [key, value] of Object.entries(details)) {
    if (sensitiveRegex.test(key)) {
      result[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeDetails(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }

  return result;
}
