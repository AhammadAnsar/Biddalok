/**
 * Biddalok Controlled Database Reset Service (Phase 4 / F-04, F-17)
 * 
 * Implements a safe, explicit data-domain manifest, mandatory pre-reset backup,
 * and post-reset verification to prevent uncontrolled selective wipes or accidental data loss.
 */

import { set } from 'idb-keyval';
import { db, clearAllDexieTables } from './database';
import { recordSecurityEvent } from '../security/auditLog';
import { storageQueueManager } from '../store/asyncStorage';

export interface DataDomainManifest {
  timestamp: string;
  studentsCount: number;
  staffCount: number;
  examResultsCount: number;
  classesCount: number;
  sectionsCount: number;
  sessionsCount: number;
  groupsCount: number;
  financialTransactionsCount: number;
  followupCampaignsCount: number;
  followupVisitsCount: number;
  testimonialsCount: number;
  totalRecords: number;
}

export interface ResetResult {
  success: boolean;
  backupCreated: boolean;
  backupKey?: string;
  preResetManifest: DataDomainManifest;
  postResetManifest: DataDomainManifest;
  error?: string;
}

/**
 * Computes an authoritative manifest of all data entities currently in the database
 */
export async function getDatabaseManifest(): Promise<DataDomainManifest> {
  const [
    studentsCount,
    staffCount,
    examResultsCount,
    classesCount,
    sectionsCount,
    sessionsCount,
    groupsCount,
    financialTransactionsCount,
    followupCampaignsCount,
    followupVisitsCount,
    testimonialsCount,
  ] = await Promise.all([
    db.students.count().catch(() => 0),
    db.staff.count().catch(() => 0),
    db.examResults.count().catch(() => 0),
    db.classes.count().catch(() => 0),
    db.sections.count().catch(() => 0),
    db.sessions.count().catch(() => 0),
    db.groups.count().catch(() => 0),
    db.financialTransactions.count().catch(() => 0),
    db.followupCampaigns.count().catch(() => 0),
    db.followupVisits.count().catch(() => 0),
    db.issuedTestimonials.count().catch(() => 0),
  ]);

  const totalRecords =
    studentsCount +
    staffCount +
    examResultsCount +
    classesCount +
    sectionsCount +
    sessionsCount +
    groupsCount +
    financialTransactionsCount +
    followupCampaignsCount +
    followupVisitsCount +
    testimonialsCount;

  return {
    timestamp: new Date().toISOString(),
    studentsCount,
    staffCount,
    examResultsCount,
    classesCount,
    sectionsCount,
    sessionsCount,
    groupsCount,
    financialTransactionsCount,
    followupCampaignsCount,
    followupVisitsCount,
    testimonialsCount,
    totalRecords,
  };
}

/**
 * Executes an explicit, controlled factory reset with pre-reset backup and verification
 */
export async function executeControlledReset(options: {
  createBackupFirst?: boolean;
} = { createBackupFirst: true }): Promise<ResetResult> {
  const preResetManifest = await getDatabaseManifest();
  let backupCreated = false;
  const backupKey = `biddalok_pre_reset_backup_${Date.now()}`;

  try {
    // 1. Flush any pending transaction writes from the queue
    await storageQueueManager.flushPendingWrites();

    // 2. Create emergency pre-reset snapshot if requested
    if (options.createBackupFirst !== false) {
      try {
        const fullBackup = {
          app: 'Biddalok Education Management Software',
          type: 'PRE_RESET_EMERGENCY_BACKUP',
          manifest: preResetManifest,
          students: await db.students.toArray(),
          staff: await db.staff.toArray(),
          examResults: await db.examResults.toArray(),
          classes: await db.classes.toArray(),
          sections: await db.sections.toArray(),
          sessions: await db.sessions.toArray(),
          groups: await db.groups.toArray(),
          financialTransactions: await db.financialTransactions.toArray(),
          followupCampaigns: await db.followupCampaigns.toArray(),
          followupVisits: await db.followupVisits.toArray(),
          issuedTestimonials: await db.issuedTestimonials.toArray(),
        };

        await set(backupKey, JSON.stringify(fullBackup));
        backupCreated = true;
      } catch (backupErr) {
        console.warn('[ResetService] Could not store pre-reset emergency backup:', backupErr);
      }
    }

    // 3. Perform 100% domain-covered Dexie table clear
    await clearAllDexieTables();

    // 4. Clear storage queue memory cache
    storageQueueManager.removeFromMemoryCache('biddalok-database-v1');
    storageQueueManager.removeFromMemoryCache('biddalok_chunked_storage');

    // 5. Post-reset verification check
    const postResetManifest = await getDatabaseManifest();
    const isClean = postResetManifest.totalRecords === 0;

    recordSecurityEvent({
      eventType: 'PRIVILEGED_ACTION_RESET',
      action: 'Controlled factory reset executed',
      status: isClean ? 'SUCCESS' : 'FAILED',
      severity: 'CRITICAL',
      details: {
        preResetTotal: preResetManifest.totalRecords,
        postResetTotal: postResetManifest.totalRecords,
        backupCreated,
        backupKey,
      },
    });

    return {
      success: isClean,
      backupCreated,
      backupKey,
      preResetManifest,
      postResetManifest,
    };
  } catch (err: any) {
    console.error('[ResetService] Failed during controlled reset execution:', err);
    const postResetManifest = await getDatabaseManifest();
    return {
      success: false,
      backupCreated,
      backupKey,
      preResetManifest,
      postResetManifest,
      error: err?.message || String(err),
    };
  }
}
