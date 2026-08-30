import { create } from 'zustand';
import { checkForAppUpdates, UpdateReleaseInfo } from '../utils/updateService';
import packageJson from '../../package.json';

interface UpdateStore {
  isChecking: boolean;
  hasUpdate: boolean;
  lastChecked: string | null;
  currentVersion: string;
  latestRelease: UpdateReleaseInfo | null;
  errorMessage: string | null;
  isUpdateModalOpen: boolean;
  bannerDismissed: boolean;
  
  // Actions
  checkUpdates: (silent?: boolean) => Promise<void>;
  openUpdateModal: () => void;
  closeUpdateModal: () => void;
  dismissBanner: () => void;
  applyManualUpdatePackage: (manifestJson: any) => { success: boolean; message: string };
}

export const useUpdateStore = create<UpdateStore>((set, get) => ({
  isChecking: false,
  hasUpdate: false,
  lastChecked: null,
  currentVersion: packageJson.version,
  latestRelease: null,
  errorMessage: null,
  isUpdateModalOpen: false,
  bannerDismissed: false,

  checkUpdates: async (silent = false) => {
    if (!navigator.onLine) {
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
        // If an update is detected, show notification
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

  applyManualUpdatePackage: (manifestJson: any) => {
    try {
      if (!manifestJson || typeof manifestJson !== 'object') {
        return { success: false, message: 'ভুল ফাইল ফরম্যাট। একটি বৈধ JSON আপডেট প্যাকেজ ফাইল দিন।' };
      }
      
      const newVersion = manifestJson.version;
      if (!newVersion) {
        return { success: false, message: 'প্যাকেজের ভেতর ভার্সন নম্বর পাওয়া যায়নি।' };
      }

      set({
        hasUpdate: true,
        latestRelease: {
          version: newVersion,
          releaseDate: manifestJson.releaseDate || new Date().toLocaleDateString('bn-BD'),
          name: manifestJson.name || `বিদ্যালোক ভার্সন ${newVersion}`,
          body: manifestJson.changelog || manifestJson.description || 'ম্যানুয়াল আপডেট প্যাকেজ সফলভাবে লোড হয়েছে।',
          downloadUrl: manifestJson.downloadUrl,
          assetName: manifestJson.assetName,
          htmlUrl: manifestJson.htmlUrl
        },
        bannerDismissed: false
      });

      return { 
        success: true, 
        message: `ভার্সন ${newVersion} এর আপডেট প্যাকেজ সফলভাবে লোড হয়েছে!` 
      };
    } catch (e: any) {
      return { success: false, message: e?.message || 'আপডেট প্যাকেজ প্রক্রিয়াকরণ ব্যর্থ হয়েছে।' };
    }
  }
}));
