import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore, checkIsOnboarded } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { CAPABILITY_REGISTRY, getModulesByCategory } from '../data/capabilityRegistry';

// In-memory mock for localStorage in node vitest environment
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

(globalThis as any).localStorage = storageMock;
if (typeof window !== 'undefined') {
  (window as any).localStorage = storageMock;
}

describe('Auth & Onboarding Persistence Across Restarts (Bug Fix Verification)', () => {
  beforeEach(() => {
    storageMock.clear();
    useAuthStore.setState({
      _hasHydrated: true,
      isOnboarded: false,
      isAuthenticated: false,
      sessionToken: null,
      currentUser: null,
      activeRole: null,
    });
  });

  it('evaluates checkIsOnboarded as false initially when storage is empty', () => {
    expect(checkIsOnboarded()).toBe(false);
  });

  it('preserves isOnboarded as true once completed in localStorage even if institution state has not hydrated yet', () => {
    localStorage.setItem('isOnboarded', 'true');
    expect(checkIsOnboarded()).toBe(true);
  });

  it('completes onboarding with custom EIIN username and retains credentials for login', async () => {
    const authStore = useAuthStore.getState();
    await authStore.setOnboarded('106103', 'SecretPass123!');

    expect(localStorage.getItem('isOnboarded')).toBe('true');
    expect(useAuthStore.getState().isOnboarded).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().currentUser?.username).toBe('106103');

    // Perform logout
    await useAuthStore.getState().logout();

    // Verify session cleared, BUT isOnboarded is STILL true!
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().currentUser).toBe(null);
    expect(localStorage.getItem('isOnboarded')).toBe('true');
    expect(checkIsOnboarded()).toBe(true);

    // Verify user can log back in with their configured EIIN username and password
    const loginSuccess = await useAuthStore.getState().login('106103', 'SecretPass123!');
    expect(loginSuccess).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().currentUser?.username).toBe('106103');
  });

  it('logout preserves database and does not wipe isOnboarded flag', async () => {
    localStorage.setItem('isOnboarded', 'true');
    useAuthStore.setState({
      isOnboarded: true,
      isAuthenticated: true,
      currentUser: { id: 'usr_admin_001', username: 'admin', name: 'Super Admin', role: 'super_admin', passHash: '', salt: '', isActive: true, mustChangePassword: false },
      activeRole: 'super_admin',
    });

    await useAuthStore.getState().logout();

    expect(localStorage.getItem('isOnboarded')).toBe('true');
    expect(checkIsOnboarded()).toBe(true);
    expect(useAuthStore.getState().isOnboarded).toBe(true);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe('Sidebar Menu Items & Capability Registry Integrity', () => {
  it('ensures all categories in CAPABILITY_REGISTRY have defined icon components (no missing imports)', () => {
    for (const cat of CAPABILITY_REGISTRY) {
      expect(cat.icon).toBeDefined();
      expect(['function', 'object']).toContain(typeof cat.icon);
      for (const mod of cat.modules) {
        expect(mod.icon).toBeDefined();
        expect(['function', 'object']).toContain(typeof mod.icon);
      }
    }
  });

  it('successfully retrieves modules by category without throwing ReferenceError', () => {
    const studentModules = getModulesByCategory('students');
    expect(studentModules.length).toBeGreaterThan(0);

    const academicModules = getModulesByCategory('academic');
    expect(academicModules.length).toBeGreaterThan(0);

    const institutionModules = getModulesByCategory('institution');
    expect(institutionModules.length).toBeGreaterThan(0);

    const examModules = getModulesByCategory('examination');
    expect(examModules.length).toBeGreaterThan(0);
  });
});
