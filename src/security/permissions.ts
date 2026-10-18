import { Role } from '../types';

/**
 * Granular View/Route and Action/Mutation permissions for Biddalok ERP.
 * Strictly adheres to Default-Deny security model.
 */
export type ViewPermission =
  | 'view:dashboard'
  | 'view:students'
  | 'view:academic'
  | 'view:examination'
  | 'view:testimonial'
  | 'view:finance'
  | 'view:hr'
  | 'view:committee'
  | 'view:scholarships'
  | 'view:communication'
  | 'view:support'
  | 'view:institution'
  | 'view:system_admin';

export type ActionPermission =
  | 'students:create'
  | 'students:edit'
  | 'students:delete'
  | 'students:import'
  | 'students:export'
  | 'academic:manage'
  | 'examination:marks_entry'
  | 'examination:admit_card'
  | 'examination:seat_plan'
  | 'examination:tabulation'
  | 'testimonial:create'
  | 'testimonial:issue'
  | 'testimonial:edit'
  | 'testimonial:delete'
  | 'testimonial:verify'
  | 'finance:create'
  | 'finance:edit'
  | 'finance:delete'
  | 'finance:view_reports'
  | 'hr:manage_staff'
  | 'hr:attendance'
  | 'hr:payroll'
  | 'hr:id_card'
  | 'committee:manage'
  | 'scholarships:manage'
  | 'communication:send_sms'
  | 'communication:notice'
  | 'institution:edit_settings'
  | 'institution:edit_branding'
  | 'backup:export'
  | 'backup:import'
  | 'database:reset'
  | 'users:manage'
  | 'security:audit_view'
  | 'media:upload'
  | 'media:read'
  | 'media:delete';

export type Permission = ViewPermission | ActionPermission;
export type AppRole = Role;
export type { Role };

export const DEFAULT_LEAST_PRIVILEGED_ROLE: Role = 'student';

/**
 * Role-Based Permission Mapping
 * Empty set for undefined/corrupt roles (Default-Deny).
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  super_admin: [
    // All views
    'view:dashboard',
    'view:students',
    'view:academic',
    'view:examination',
    'view:testimonial',
    'view:finance',
    'view:hr',
    'view:committee',
    'view:scholarships',
    'view:communication',
    'view:support',
    'view:institution',
    'view:system_admin',
    // All actions
    'students:create',
    'students:edit',
    'students:delete',
    'students:import',
    'students:export',
    'academic:manage',
    'examination:marks_entry',
    'examination:admit_card',
    'examination:seat_plan',
    'examination:tabulation',
    'testimonial:create',
    'testimonial:issue',
    'testimonial:edit',
    'testimonial:delete',
    'testimonial:verify',
    'finance:create',
    'finance:edit',
    'finance:delete',
    'finance:view_reports',
    'hr:manage_staff',
    'hr:attendance',
    'hr:payroll',
    'hr:id_card',
    'committee:manage',
    'scholarships:manage',
    'communication:send_sms',
    'communication:notice',
    'institution:edit_settings',
    'institution:edit_branding',
    'backup:export',
    'backup:import',
    'database:reset',
    'users:manage',
    'security:audit_view',
    'media:upload',
    'media:read',
    'media:delete',
  ],

  admin: [
    'view:dashboard',
    'view:students',
    'view:academic',
    'view:examination',
    'view:testimonial',
    'view:finance',
    'view:hr',
    'view:committee',
    'view:scholarships',
    'view:communication',
    'view:support',
    'view:institution',
    // Actions for institutional head/admin (no database:reset or system_admin root)
    'students:create',
    'students:edit',
    'students:delete',
    'students:import',
    'students:export',
    'academic:manage',
    'examination:marks_entry',
    'examination:admit_card',
    'examination:seat_plan',
    'examination:tabulation',
    'testimonial:create',
    'testimonial:issue',
    'testimonial:edit',
    'testimonial:delete',
    'testimonial:verify',
    'finance:create',
    'finance:edit',
    'finance:delete',
    'finance:view_reports',
    'hr:manage_staff',
    'hr:attendance',
    'hr:payroll',
    'hr:id_card',
    'committee:manage',
    'scholarships:manage',
    'communication:send_sms',
    'communication:notice',
    'institution:edit_settings',
    'backup:export',
    'users:manage',
    'security:audit_view',
    'media:upload',
    'media:read',
    'media:delete',
  ],

  teacher: [
    'view:dashboard',
    'view:students',
    'view:academic',
    'view:examination',
    'view:communication',
    'view:support',
    // Teacher specific actions
    'examination:marks_entry',
    'examination:admit_card',
    'examination:seat_plan',
    'communication:notice',
    'hr:attendance',
    'media:upload',
    'media:read',
  ],

  accountant: [
    'view:dashboard',
    'view:students',
    'view:finance',
    'view:hr',
    'view:support',
    // Accountant actions
    'finance:create',
    'finance:edit',
    'finance:view_reports',
    'hr:payroll',
    'media:read',
  ],

  staff: [
    'view:dashboard',
    'view:students',
    'view:support',
    'hr:attendance',
    'media:read',
  ],

  student: [],
};

/**
 * Maps module strings (e.g. 'students', 'examination') to required view permissions
 */
export const MODULE_VIEW_PERMISSION_MAP: Record<string, ViewPermission> = {
  dashboard: 'view:dashboard',
  students: 'view:students',
  academic: 'view:academic',
  examination: 'view:examination',
  testimonial: 'view:testimonial',
  finance: 'view:finance',
  hr: 'view:hr',
  committee: 'view:committee',
  scholarships: 'view:scholarships',
  communication: 'view:communication',
  support: 'view:support',
  institution: 'view:institution',
  system: 'view:system_admin',
};

/**
 * Validates whether a given role holds the requested permission.
 * STRICT DEFAULT-DENY:
 * - If role is null, undefined, empty, or unknown -> false
 * - If allowedModules is provided for a delegated user, the module must be present in allowedModules
 */
export function hasRolePermission(
  role: Role | string | null | undefined,
  permission: Permission,
  allowedModules?: string[]
): boolean {
  if (!role || typeof role !== 'string') {
    return false; // Default-Deny: Unauthenticated or missing role
  }

  const rolePerms = ROLE_PERMISSIONS[role as Role];
  if (!rolePerms || !rolePerms.includes(permission)) {
    return false; // Role does not grant this permission
  }

  // Super-admin always bypasses module restrictions
  if (role === 'super_admin') {
    return true;
  }

  // If fine-grained allowedModules are specified on the user, check them
  if (allowedModules && allowedModules.length > 0) {
    // Determine which module corresponds to this permission
    for (const [modKey, viewPerm] of Object.entries(MODULE_VIEW_PERMISSION_MAP)) {
      if (permission === viewPerm) {
        return allowedModules.includes(modKey);
      }
    }

    // Action permission module mapping check
    const prefix = permission.split(':')[0];
    if (prefix && prefix !== 'support') {
      const mappedModule = prefix === 'examination' ? 'examination'
        : prefix === 'backup' || prefix === 'database' || prefix === 'security' || prefix === 'users' ? 'system'
        : prefix;

      if (!allowedModules.includes(mappedModule)) {
        return false;
      }
    }
  }

  return true;
}
