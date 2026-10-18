/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RollbackSnapshot, RollbackExecutionResult } from '../types/update';
import { useAppStore } from '../store/useAppStore';
import { CURRENT_SCHEMA_VERSION, APP_VERSION } from '../version';
import { computeFileSha256 } from './updateManifestService';

// In-memory / storage key for rollback snapshots
const ROLLBACK_STORAGE_KEY = 'biddalok_rollback_snapshot_v1';

/**
 * Creates a complete, verified snapshot before an update or migration starts.
 */
export async function createPreUpdateRollbackSnapshot(
  targetVersion: string
): Promise<RollbackSnapshot> {
  const store = useAppStore.getState();
  const backupJson = store.exportBackupJSON();

  const encoder = new TextEncoder();
  const sha256 = await computeFileSha256(encoder.encode(backupJson).buffer as ArrayBuffer);

  const snapshot: RollbackSnapshot = {
    snapshotId: `rb_${APP_VERSION}_to_${targetVersion}_${Date.now()}`,
    sourceVersion: APP_VERSION,
    targetVersion,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    totalRecords: (store.students?.length || 0) + (store.staff?.length || 0) + (store.examResults?.length || 0),
    backupDataJson: backupJson,
    sha256
  };

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(ROLLBACK_STORAGE_KEY, JSON.stringify(snapshot));
    }
  } catch (err) {
    console.warn('Could not cache rollback snapshot in localStorage:', err);
  }

  return snapshot;
}

/**
 * Retrieves the stored rollback snapshot if available.
 */
export function getLatestRollbackSnapshot(): RollbackSnapshot | null {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(ROLLBACK_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    }
  } catch {
    // Ignore parse error
  }
  return null;
}

/**
 * Executes an atomic database rollback to the verified pre-update snapshot.
 */
export async function executeDatabaseRollback(
  snapshot?: RollbackSnapshot | null
): Promise<RollbackExecutionResult> {
  const targetSnapshot = snapshot || getLatestRollbackSnapshot();

  if (!targetSnapshot || !targetSnapshot.backupDataJson) {
    return {
      success: false,
      restoredVersion: APP_VERSION,
      restoredRecords: 0,
      message: 'No rollback snapshot available to restore.',
      messageBn: 'রোলব্যাকের জন্য কোনো পূর্ববর্তী স্ন্যাপশট পাওয়া যায়নি।'
    };
  }

  try {
    // Verify SHA-256 integrity of the snapshot payload
    const encoder = new TextEncoder();
    const currentSha = await computeFileSha256(encoder.encode(targetSnapshot.backupDataJson).buffer as ArrayBuffer);
    if (currentSha !== targetSnapshot.sha256) {
      return {
        success: false,
        restoredVersion: targetSnapshot.sourceVersion,
        restoredRecords: 0,
        message: 'Rollback snapshot integrity check failed. SHA-256 mismatch.',
        messageBn: 'রোলব্যাক স্ন্যাপশট যাচাই ব্যর্থ হয়েছে। ডাটা বিকৃত হতে পারে।'
      };
    }

    // Restore data via store
    const store = useAppStore.getState();
    const restored = store.importBackupJSON(targetSnapshot.backupDataJson);

    if (!restored) {
      return {
        success: false,
        restoredVersion: targetSnapshot.sourceVersion,
        restoredRecords: 0,
        message: 'Store failed to restore backup data.',
        messageBn: 'ডাটাবেজ রিস্টোর প্রক্রিয়া সম্পন্ন করা যায়নি।'
      };
    }

    return {
      success: true,
      restoredVersion: targetSnapshot.sourceVersion,
      restoredRecords: targetSnapshot.totalRecords,
      message: `Database rolled back safely to version ${targetSnapshot.sourceVersion}.`,
      messageBn: `ডাটাবেজ সফলভাবে পূর্ববর্তী ভার্সন ${targetSnapshot.sourceVersion}-এ রোলব্যাক করা হয়েছে (${targetSnapshot.totalRecords} টি রেকর্ড অক্ষত)।`
    };
  } catch (err: any) {
    return {
      success: false,
      restoredVersion: targetSnapshot.sourceVersion,
      restoredRecords: 0,
      message: err?.message || 'Unexpected error during database rollback.',
      messageBn: 'রোলব্যাক চলাকালীন অপ্রত্যাশিত ত্রুটি দেখা দিয়েছে।'
    };
  }
}

/**
 * Generates an actionable App Binary Rollback Guide if executable fails to run after an update.
 */
export function generateBinaryRollbackPlan(
  previousVersion: string = APP_VERSION,
  installerFileName?: string
): {
  steps: string[];
  stepsBn: string[];
  safetyNotes: string[];
  safetyNotesBn: string[];
} {
  return {
    steps: [
      '1. Exit and terminate any running Biddalok application process.',
      `2. Download or locate the verified previous installer: ${installerFileName || `Biddalok-Setup-${previousVersion}.exe`}.`,
      '3. Run the installer in "Upgrade / Keep Data" mode.',
      '4. Do NOT select "Clean Install / Wipe Data" so that existing student database is preserved.',
      `5. Launch Biddalok and verify that version displays v${previousVersion}.`
    ],
    stepsBn: [
      '১. যদি কোনো বিদ্যালোক প্রসেস চালু থাকে তা সম্পূর্ণ বন্ধ করুন।',
      `২. পূর্বের পরিচিত স্থিতিশীল ভার্সনের অফিসিয়াল ইন্সটলার সংগ্রহ করুন: ${installerFileName || `Biddalok-Setup-${previousVersion}.exe`}।`,
      '৩. ইন্সটলার চালু করে "পূর্বের সকল তথ্য অক্ষত রাখুন (Keep Data)" অপশন নির্বাচন করুন।',
      '৪. কোনো অবস্থাতেই "Fresh Install / Wipe Data" নির্বাচন করবেন না, যাতে শিক্ষার্থীর ডাটাবেজ অক্ষত থাকে।',
      `৫. বিদ্যালোক ওপেন করুন এবং ভার্সন v${previousVersion} সফলভাবে চালু হয়েছে কি না নিশ্চিত করুন।`
    ],
    safetyNotes: [
      'Your IndexedDB & institutional database will remain intact in %APPDATA%\\Biddalok by SoftDows.',
      'Never run third-party cleaner tools or delete the AppData directory manually.'
    ],
    safetyNotesBn: [
      'আপনার বিদ্যালয় ডাটাবেজ %APPDATA%\\Biddalok by SoftDows ফোল্ডারে সম্পূর্ণ অক্ষত থাকবে।',
      'কোনো অবস্থাতেই তৃতীয় পক্ষের ক্লিনার দিয়ে অ্যাপডাটা ফোল্ডার ডিলিট করবেন না।'
    ]
  };
}
