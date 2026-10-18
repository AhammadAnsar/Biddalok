/**
 * ============================================================================
 * Bidyalok (বিদ্যালোক) - Feature Flags & Environment Configuration
 * 
 * Strict Enforcement:
 * 1. Demo & sample data is strictly isolated to explicit demo mode.
 * 2. In standard production and fresh institutional deployments, records
 *    (Students, Staff, Financial vouchers, Exam results) start completely empty.
 * 3. 100% Offline Autonomy is guaranteed for all core educational records.
 * 4. Truthful Representation: Never simulate dummy data for unreleased modules.
 * ============================================================================
 */

export interface FeatureFlagConfig {
  /** Enables explicit demo/sample data seeding (strictly disabled in production unless user toggles demo mode) */
  ENABLE_DEMO_DATA: boolean;
  /** Enables online capabilities (e.g. GitHub release checks, map lookups) */
  ENABLE_ONLINE_SERVICES: boolean;
  /** Enables active beta features (e.g. Virtual Finance Ledger, Staff Attendance) */
  ENABLE_BETA_MODULES: boolean;
  /** Enables roadmap previews for 83 planned modules with full truthful disclosure */
  ENABLE_ROADMAP_PREVIEWS: boolean;
  /** Enforces strict 100% offline-first operation */
  STRICT_OFFLINE_AUTONOMY: boolean;
  /** Strict ban on hardcoded dummy fallbacks for institutions, students and signatories */
  STRICT_TRUTHFUL_DATA: boolean;
}

// Environment Detection
export const IS_DEVELOPMENT = Boolean(import.meta.env?.DEV);
export const IS_PRODUCTION = Boolean(import.meta.env?.PROD);
export const IS_TEST = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';

// Check if user has explicitly activated Demo Mode in local storage
export const isExplicitDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem('biddalok_demo_mode') === 'true' || 
           import.meta.env?.VITE_ENABLE_DEMO_MODE === 'true';
  } catch {
    return false;
  }
};

export const setExplicitDemoMode = (enabled: boolean): void => {
  if (typeof window === 'undefined') return;
  try {
    if (enabled) {
      localStorage.setItem('biddalok_demo_mode', 'true');
    } else {
      localStorage.removeItem('biddalok_demo_mode');
    }
  } catch (err) {
    console.error('Failed to set demo mode flag in localStorage', err);
  }
};

// Global Centralized Feature Flags
export const FEATURE_FLAGS: FeatureFlagConfig = {
  // Demo data is ONLY allowed when explicit demo mode is set
  ENABLE_DEMO_DATA: isExplicitDemoMode(),
  ENABLE_ONLINE_SERVICES: true,
  ENABLE_BETA_MODULES: true,
  ENABLE_ROADMAP_PREVIEWS: true,
  STRICT_OFFLINE_AUTONOMY: true,
  STRICT_TRUTHFUL_DATA: true,
};

export const isFeatureEnabled = (flag: keyof FeatureFlagConfig): boolean => {
  if (flag === 'ENABLE_DEMO_DATA') {
    return isExplicitDemoMode();
  }
  return FEATURE_FLAGS[flag];
};

export const getEnvironmentManifest = () => {
  return {
    environment: IS_PRODUCTION ? 'production' : IS_DEVELOPMENT ? 'development' : 'test',
    isDemoMode: isExplicitDemoMode(),
    offlineAutonomy: FEATURE_FLAGS.STRICT_OFFLINE_AUTONOMY,
    truthfulDataEnforced: FEATURE_FLAGS.STRICT_TRUTHFUL_DATA,
    betaModulesEnabled: FEATURE_FLAGS.ENABLE_BETA_MODULES,
    roadmapPreviewsEnabled: FEATURE_FLAGS.ENABLE_ROADMAP_PREVIEWS,
  };
};
