import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../store/useAuthStore';
import { hasRolePermission } from '../security/permissions';

describe('PHASE 3: Authentication & Authorization Tests', () => {
  beforeEach(() => {
    (window as any).desktopApi = {
      auth: {
        login: vi.fn().mockResolvedValue({ success: true, token: '123', user: { role: 'admin' } })
      }
    };
  });

  it('correctly resolves role permissions via new RBAC', () => {
    // Super admin overrides
    expect(hasRolePermission('super_admin', 'students:delete')).toBe(true);
    
    // Explicit empty list means no allowed modules
    expect(hasRolePermission('teacher', 'view:students', [])).toBe(false);
    
    // Undefined inherits defaults
    expect(hasRolePermission('teacher', 'view:students', undefined)).toBe(true);
  });
});
