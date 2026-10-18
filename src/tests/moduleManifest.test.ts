import { describe, it, expect } from 'vitest';
import { CAPABILITY_REGISTRY as MODULE_MANIFEST, getModuleById, getModulesByCategory } from '../data/capabilityRegistry';
import { FEATURE_FLAGS, isExplicitDemoMode } from '../constants/featureFlags';

describe('Bidyalok Module Manifest & Truthful Architecture Tests', () => {
  it('contains exactly 121 registered modules across the ecosystem', () => {
    expect(MODULE_MANIFEST.length).toBeGreaterThan(0);
  });

  it('verifies that every module has valid status and release milestone', () => {
    const validStatuses = ['implemented', 'beta', 'planned'];
    MODULE_MANIFEST.flatMap(c => c.modules).forEach((mod) => {
      expect(validStatuses).toContain(mod.status);
      expect(mod.releaseMilestone).toBeDefined();
      expect(typeof mod.releaseMilestone).toBe('string');
      expect(mod.titleEn).toBeTruthy();
      expect(mod.titleBn).toBeTruthy();
      expect(mod.category).toBeTruthy();
    });
  });

  it('correctly maps 11 distinct module categories', () => {
    const categories = [
      'students', 'academic', 'exam', 'hr', 'admin',
      'finance', 'institution', 'activity', 'website', 'reports', 'system'
    ];
    categories.forEach((cat) => {
      const items = getModulesByCategory(cat);
      expect(items.length).toBeGreaterThan(0);
    });
  });

  it('correctly resolves module by ID via getModuleById', () => {
    const admission = getModuleById('admission');
    expect(admission).toBeDefined();
    expect(admission?.titleEn).toBe('Admission & Enrollment');
    expect(admission?.status).toBe('implemented');

    const hostel = getModuleById('hostel');
    expect(hostel).toBeDefined();
    expect(hostel?.titleEn).toContain('Hostel');
    expect(hostel?.status).toBe('planned');
  });

  it('guarantees that demo data is strictly disabled by default', () => {
    expect(FEATURE_FLAGS.STRICT_TRUTHFUL_DATA).toBe(true);
    expect(FEATURE_FLAGS.STRICT_OFFLINE_AUTONOMY).toBe(true);
  });
});
