import { Permission, hasRolePermission } from './permissions';
import { useAuthStore } from '../store/useAuthStore';
import { recordAuditEvent } from './auditLog';

export class AuthorizationError extends Error {
  public readonly code: string;
  public readonly requiredPermission: Permission;

  constructor(code: string, message: string, requiredPermission: Permission) {
    super(message);
    this.name = 'AuthorizationError';
    this.code = code;
    this.requiredPermission = requiredPermission;
  }
}

let bypassSecurityForTesting = false;

export function setSecurityBypassForTesting(bypass: boolean): void {
  bypassSecurityForTesting = bypass;
}

export function isSecurityBypassEnabled(): boolean {
  return bypassSecurityForTesting;
}

/**
 * Validates permission for the current active authenticated session.
 * STRICT DEFAULT-DENY:
 * Throws AuthorizationError if unauthenticated, session expired, or permission denied.
 */
export function assertPermission(
  permission: Permission,
  actionDescription?: string,
  extraDetails?: Record<string, unknown>
): void {
  if (bypassSecurityForTesting) {
    return;
  }

  const authState = useAuthStore.getState();

  // 1. Authentication & Session Active Check
  if (!authState.isAuthenticated || !authState.activeRole) {
    recordAuditEvent({
      eventType: 'PERMISSION_DENIED_MUTATION',
      role: 'unknown',
      action: actionDescription || permission,
      status: 'DENIED',
      details: {
        reason: 'Unauthenticated or missing role',
        requiredPermission: permission,
        ...extraDetails,
      },
    });
    throw new AuthorizationError(
      'UNAUTHENTICATED',
      `Access denied: Authentication required to perform ${permission}.`,
      permission
    );
  }

  // 2. Session Expiry Check
  if (authState.sessionExpiresAt && Date.now() > authState.sessionExpiresAt) {
    authState.logout();
    recordAuditEvent({
      eventType: 'AUTH_LOCKOUT',
      username: authState.currentUser?.username,
      role: authState.activeRole,
      action: actionDescription || permission,
      status: 'DENIED',
      details: {
        reason: 'Session expired',
        requiredPermission: permission,
        ...extraDetails,
      },
    });
    throw new AuthorizationError(
      'SESSION_EXPIRED',
      `Access denied: Your session has expired. Please log in again.`,
      permission
    );
  }

  // 3. Permission Evaluation via Central Matrix
  const allowed = hasRolePermission(
    authState.activeRole,
    permission,
    authState.currentUser?.allowedModules
  );

  if (!allowed) {
    recordAuditEvent({
      eventType: 'PERMISSION_DENIED_MUTATION',
      userId: authState.currentUser?.id,
      username: authState.currentUser?.username,
      role: authState.activeRole,
      action: actionDescription || permission,
      status: 'DENIED',
      details: {
        reason: `Role '${authState.activeRole}' is not authorized for '${permission}'`,
        requiredPermission: permission,
        ...extraDetails,
      },
    });
    throw new AuthorizationError(
      'PERMISSION_DENIED',
      `Access denied: Your role (${authState.activeRole}) does not have permission for '${permission}'.`,
      permission
    );
  }
}

/**
 * Non-throwing permission check for UI conditional rendering.
 */
export function checkPermission(permission: Permission): boolean {
  const authState = useAuthStore.getState();
  if (!authState.isAuthenticated || !authState.activeRole) {
    return false;
  }
  if (authState.sessionExpiresAt && Date.now() > authState.sessionExpiresAt) {
    return false;
  }
  return hasRolePermission(
    authState.activeRole,
    permission,
    authState.currentUser?.allowedModules
  );
}
