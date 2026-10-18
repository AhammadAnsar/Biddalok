/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { checkForAppUpdates, UpdateReleaseInfo } from '../utils/updateService';
import { APP_VERSION } from '../version';
import { SignedUpdateManifest, UpdatePreflightReport } from '../types/update';
import { validateUpdateManifest, computeFileSha256 } from '../services/updateManifestService';
import { runUpdatePreflightCheck } from '../services/updatePreflightService';

interface UpdateStore {
  isChecking: boolean;
  hasUpdate: boolean;
  lastChecked: string | null;
  currentVersion: string;
  latestRelease: UpdateReleaseInfo | null;
  errorMessage: string | null;
  isUpdateModalOpen: boolean;
  bannerDismissed: boolean;
  
  // Preflight state
  preflightReport: UpdatePreflightReport | null;
  isRunningPreflight: boolean;

  // Actions
  checkUpdates: (silent?: boolean) => Promise<void>;
  openUpdateModal: () => void;
  closeUpdateModal: () => void;
  dismissBanner: () => void;
  loadSignedManifest: (manifestJson: any) => { success: boolean; message: string; manifest?: SignedUpdateManifest };
  runPreflight: () => Promise<UpdatePreflightReport>;
  verifyInstallerBuffer: (buffer: ArrayBuffer) => Promise<{
    matched: boolean;
    calculatedSha256: string;
    expectedSha256: string;
    error?: string;
  }>;
}

export const useUpdateStore = create<UpdateStore>((set, get) => ({
  isChecking: false,
  hasUpdate: false,
  lastChecked: null,
  currentVersion: APP_VERSION,
  latestRelease: null,
  errorMessage: null,
  isUpdateModalOpen: false,
  bannerDismissed: false,
  preflightReport: null,
  isRunningPreflight: false,

  checkUpdates: async (silent = false) => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      if (!silent) {
        set({ errorMessage: 'ইন্টারনেট সংযোগ পাওয়া যায়নি। অফলাইন মোডে আছেন।' });
      }
      return;
    }

    set({ isChecking: true, errorMessage: null });
    try {
      const result = await checkForAppUpdates();
      set({
        isChecking: false,
        hasUpdate: result.hasUpdate,
        currentVersion: result.currentVersion,
        latestRelease: result.latestRelease,
        lastChecked: new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }),
        errorMessage: result.error || null,
        bannerDismissed: false
      });
    } catch (err: any) {
      set({
        isChecking: false,
        errorMessage: silent ? null : (err?.message || 'আপডেট চেক করতে সমস্যা হয়েছে')
      });
    }
  },

  openUpdateModal: () => set({ isUpdateModalOpen: true }),
  closeUpdateModal: () => set({ isUpdateModalOpen: false }),
  dismissBanner: () => set({ bannerDismissed: true }),

  loadSignedManifest: (manifestJson: any) => {
    const validation = validateUpdateManifest(manifestJson);
    if (!validation.isValid || !validation.manifest) {
      return {
        success: false,
        message: validation.errorBn || validation.error || 'অকার্যকর বা অননুমোদিত আপডেট ম্যানিফেস্ট।'
      };
    }

    const manifest = validation.manifest;
    set({
      hasUpdate: true,
      latestRelease: {
        version: manifest.version,
        releaseDate: manifest.releaseDate,
        name: `বিদ্যালোক সংস্করণ v${manifest.version}`,
        body: manifest.changelog.bn,
        downloadUrl: manifest.assets.installer.downloadUrl,
        assetName: manifest.assets.installer.fileName,
        fileSizeBytes: manifest.assets.installer.fileSizeBytes,
        sha256: manifest.assets.installer.sha256,
        signature: manifest.assets.installer.signature,
        manifest,
        isDevelopmentUnsigned: manifest.isDevelopmentUnsigned
      },
      bannerDismissed: false
    });

    return {
      success: true,
      message: `ভার্সন v${manifest.version} এর অফিসিয়াল সাইনড ম্যানিফেস্ট সফলভাবে যাচাই হয়েছে।`,
      manifest
    };
  },

  runPreflight: async () => {
    set({ isRunningPreflight: true });
    const targetManifest = get().latestRelease?.manifest;
    const report = await runUpdatePreflightCheck(targetManifest);
    set({ preflightReport: report, isRunningPreflight: false });
    return report;
  },

  verifyInstallerBuffer: async (buffer: ArrayBuffer) => {
    const expected = (get().latestRelease?.sha256 || '').toLowerCase().trim();
    const calculated = await computeFileSha256(buffer);

    if (!expected) {
      return {
        matched: false,
        calculatedSha256: calculated,
        expectedSha256: '',
        error: 'কোনো প্রত্যাশিত SHA-256 চেকসাম কনফিগার করা নেই।'
      };
    }

    return {
      matched: calculated.toLowerCase() === expected,
      calculatedSha256: calculated,
      expectedSha256: expected
    };
  }
}));
