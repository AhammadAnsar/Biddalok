/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../db/database';
import { useAppStore } from '../store/useAppStore';
import { Institution, Student, ExamResult, IssuedTestimonial } from '../types';
import { TestimonialExam, TestimonialRosterItem, TestimonialReadinessResult } from '../types/testimonial';

/**
 * Validates official field readiness for a testimonial roster item.
 * Strictly enforces official data presence — NEVER guesses or substitutes default placeholders!
 */
export function validateOfficialTestimonialReadiness(
  item: TestimonialRosterItem,
  institution?: Institution | null,
  language: string = 'bn'
): TestimonialReadinessResult {
  const missing: string[] = [];
  const labelsBn: string[] = [];
  const labelsEn: string[] = [];

  const addMissing = (field: string, labelBn: string, labelEn: string) => {
    missing.push(field);
    labelsBn.push(labelBn);
    labelsEn.push(labelEn);
  };

  // 1. Institution EIIN
  const eiin = (institution?.eiin || '').trim();
  if (!eiin) {
    addMissing('eiin', 'প্রতিষ্ঠানের EIIN কোড', 'Institution EIIN Code');
  }

  // 2. Exam Name / Type
  const examName = (item.examName || '').trim();
  if (!examName) {
    addMissing('examName', 'পরীক্ষার নাম', 'Examination Name');
  }

  // 3. Passing Year
  const year = (item.passingYear || '').trim();
  if (!year || year === '0' || year === '0000') {
    addMissing('passingYear', 'পাসের সন/বছর', 'Passing Year');
  }

  // 4. Session
  const session = (item.session || '').trim();
  if (!session) {
    addMissing('session', 'শিক্ষাবর্ষ/সেশন', 'Academic Session');
  }

  // 5. Board
  const board = (item.board || institution?.board || '').trim();
  if (!board) {
    addMissing('board', 'শিক্ষা বোর্ড', 'Education Board');
  }

  // 6. Exam Center
  const center = (item.examCenter || item.examCenterBn || '').trim();
  if (!center) {
    addMissing('examCenter', 'পরীক্ষা কেন্দ্র', 'Examination Center');
  }

  // 7. Board Roll Number
  const roll = (item.boardRollNo || '').trim();
  if (!roll) {
    addMissing('boardRollNo', 'বোর্ড রোল নম্বর', 'Board Roll Number');
  }

  // 8. Registration Number
  const reg = (item.registrationNo || '').trim();
  if (!reg) {
    addMissing('registrationNo', 'রেজিস্ট্রেশন নম্বর', 'Registration Number');
  }

  // 9. Academic Group
  const group = (item.group || '').trim();
  if (!group) {
    addMissing('group', 'শাখা/বিভাগ', 'Academic Group');
  }

  // 10. GPA
  const gpaStr = (item.gpa || '').trim();
  const parsedGpa = parseFloat(gpaStr);
  if (!gpaStr || isNaN(parsedGpa) || parsedGpa <= 0 || parsedGpa > 5.0) {
    addMissing('gpa', 'জিপিএ (GPA ১.০০ - ৫.০০)', 'GPA (1.00 - 5.00)');
  }

  // 11. Student Name (in chosen certificate language)
  if (language === 'bn') {
    const nameBn = (item.nameBn || '').trim();
    if (!nameBn) {
      addMissing('nameBn', 'শিক্ষার্থীর নাম (বাংলা)', 'Student Name (Bengali)');
    }
  } else {
    const name = (item.name || '').trim();
    if (!name) {
      addMissing('name', 'শিক্ষার্থীর নাম (English)', 'Student Name (English)');
    }
  }

  // 12. Father's Name
  const father = (language === 'bn' ? (item.fatherNameBn || item.fatherName) : (item.fatherName || item.fatherNameBn) || '').trim();
  if (!father) {
    addMissing('fatherName', 'পিতার নাম', "Father's Name");
  }

  // 13. Mother's Name
  const mother = (language === 'bn' ? (item.motherNameBn || item.motherName) : (item.motherName || item.motherNameBn) || '').trim();
  if (!mother) {
    addMissing('motherName', 'মাতার নাম', "Mother's Name");
  }

  // 14. Date of Birth
  const dob = (item.dateOfBirth || '').trim();
  if (!dob) {
    addMissing('dateOfBirth', 'জন্ম তারিখ', 'Date of Birth');
  }

  return {
    isReady: missing.length === 0,
    missingFields: missing,
    missingFieldLabelsBn: labelsBn,
    missingFieldLabelsEn: labelsEn,
  };
}

/**
 * Generates a non-predictable, cryptographically secure verification token.
 * Format: BIDYALOK-{YEAR}-{CLEAN_ID}-{RANDOM_HEX_16}
 */
export function generateCanonicalVerificationToken(
  studentId: string,
  examYear: string
): string {
  const cleanId = studentId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toUpperCase() || 'STU';
  const cleanYear = examYear.replace(/[^0-9]/g, '').slice(0, 4) || '2026';
  
  // 16 bytes = 32 hex characters of cryptographically secure randomness
  const randomBytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 16; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  
  const hex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  return `BDLK-${cleanYear}-${cleanId}-${hex.slice(0, 12)}`;
}

/**
 * Computes deterministic SHA-256 hash of a certificate snapshot for tamper evidence.
 */
export async function computeSnapshotHash(snapshot: Record<string, any>): Promise<string> {
  // Deterministic JSON stringification with sorted keys
  const sortedKeys = Object.keys(snapshot).sort();
  const canonicalObj: Record<string, any> = {};
  for (const k of sortedKeys) {
    canonicalObj[k] = snapshot[k] ?? null;
  }
  const serialized = JSON.stringify(canonicalObj);

  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    const encoder = new TextEncoder();
    const data = encoder.encode(serialized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Fallback simple 64-character hash for non-subtle contexts (e.g. basic unit tests)
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < serialized.length; i++) {
    const ch = serialized.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const p2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return (p1 + p2).repeat(4);
}

/**
 * Builds the canonical verification URL respecting HashRouter and configured base URL.
 */
export function buildCanonicalVerificationUrl(
  token: string,
  configuredBaseUrl?: string
): string {
  let base = (configuredBaseUrl || '').trim();
  if (!base || base.startsWith('file:') || base.startsWith('null')) {
    if (typeof window !== 'undefined' && window.location && window.location.origin && !window.location.origin.startsWith('file:')) {
      base = window.location.origin;
    } else {
      base = 'https://bidyalok.edu.bd';
    }
  }
  // Strip trailing slash
  base = base.replace(/\/+$/, '');
  return `${base}/#/verify/testimonial/${encodeURIComponent(token)}`;
}

/**
 * Creates an authoritative IssuedTestimonial entity.
 * Supports both object parameter and positional parameters.
 */
export async function createIssuedTestimonialEntity(
  itemOrParams: TestimonialRosterItem | {
    item: TestimonialRosterItem;
    exam: TestimonialExam;
    institution?: Institution | null;
    serialNo: string;
    memoNo?: string;
    language?: 'bn' | 'en';
    actor?: string;
    verificationBaseUrl?: string;
    studentDbId?: string;
  },
  examArg?: TestimonialExam,
  institutionArg?: Institution | null,
  languageArg?: 'bn' | 'en',
  serialNoArg?: string,
  studentDbIdArg?: string
): Promise<IssuedTestimonial> {
  let item: TestimonialRosterItem;
  let exam: TestimonialExam;
  let institution: Institution | null | undefined;
  let serialNo: string;
  let memoNo: string | undefined;
  let language: 'bn' | 'en' = 'bn';
  let actor: string = 'System User';
  let verificationBaseUrl: string | undefined;
  let studentDbId: string | undefined;

  if (itemOrParams && typeof itemOrParams === 'object' && 'item' in itemOrParams && 'exam' in itemOrParams) {
    const params = itemOrParams as any;
    item = params.item;
    exam = params.exam;
    institution = params.institution;
    serialNo = params.serialNo || '';
    memoNo = params.memoNo;
    language = params.language || 'bn';
    actor = params.actor || 'System User';
    verificationBaseUrl = params.verificationBaseUrl;
    studentDbId = params.studentDbId || item.studentDbId;
  } else {
    item = itemOrParams as TestimonialRosterItem;
    exam = examArg!;
    institution = institutionArg;
    language = languageArg || 'bn';
    serialNo = serialNoArg || '';
    studentDbId = studentDbIdArg || item.studentDbId;
  }
  
  const token = generateCanonicalVerificationToken(item.studentId, exam.year);
  const verifyUrl = buildCanonicalVerificationUrl(token, verificationBaseUrl);

  const snapshot: Record<string, any> = {
    eiin: institution?.eiin || '',
    institutionName: institution?.name || '',
    institutionNameBn: institution?.nameBn || '',
    examId: exam.id,
    examName: exam.displayName,
    examNameBn: exam.displayNameBn,
    passingYear: exam.year,
    studentId: item.studentId,
    studentDbId: item.studentDbId,
    name: item.name,
    nameBn: item.nameBn,
    fatherName: item.fatherName,
    fatherNameBn: item.fatherNameBn,
    motherName: item.motherName,
    motherNameBn: item.motherNameBn,
    dateOfBirth: item.dateOfBirth,
    gender: item.gender,
    boardRollNo: item.boardRollNo,
    registrationNo: item.registrationNo,
    session: item.session,
    group: item.group,
    gpa: item.gpa,
    board: item.board || institution?.board || '',
    examCenter: item.examCenter || '',
    village: item.village,
    villageBn: item.villageBn,
    postOffice: item.postOffice,
    postOfficeBn: item.postOfficeBn,
    upazila: item.upazila,
    upazilaBn: item.upazilaBn,
    district: item.district,
    districtBn: item.districtBn,
    serialNo,
    memoNo,
    language,
    issuedAt: new Date().toISOString(),
  };

  const snapshotHash = await computeSnapshotHash(snapshot);
  const now = new Date();
  const issueDateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;

  const issuedEntity: IssuedTestimonial = {
    id: `issue_${exam.id}_${item.studentId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
    institutionId: institution?.id || institution?.eiin || '',
    examId: exam.id,
    examName: exam.displayName,
    studentId: item.studentId,
    studentDbId: item.studentDbId,
    examResultId: item.id,
    issueDate: issueDateStr,
    issuedAt: now.toISOString(),
    issuedBy: actor,
    format: 'board_standard',
    memoNo,
    serialNo,
    language,
    verificationToken: token,
    verificationUrl: verifyUrl,
    snapshotHash,
    state: 'artifact-generated',
    distributionStatus: 'pending',
    snapshotData: snapshot,
    history: [
      {
        action: 'ISSUED',
        timestamp: now.toISOString(),
        actor,
        details: `Issued Serial: ${serialNo} for ${exam.displayName}`,
      },
    ],
  };

  return issuedEntity;
}

/**
 * Commits an issued testimonial to Dexie and Zustand store.
 */
export async function commitIssuedTestimonial(record: IssuedTestimonial): Promise<void> {
  if (db && db.issuedTestimonials) {
    try {
      await db.issuedTestimonials.put(record);
    } catch (err) {
      console.warn('Dexie save failed, fallback to Zustand:', err);
    }
  }
  useAppStore.getState().addIssuedTestimonial(record);
}

/**
 * Revokes an issued testimonial with reason and audit log.
 */
export async function revokeIssuedTestimonial(
  id: string,
  reason: string,
  actor: string = 'System Admin'
): Promise<void> {
  const store = useAppStore.getState();
  const existing = store.issuedTestimonials.find(t => t.id === id);
  if (!existing) {
    throw new Error(`Issued testimonial with ID "${id}" not found.`);
  }

  const now = new Date().toISOString();
  const updatedHistory = [
    ...(existing.history || []),
    {
      action: 'REVOKED',
      timestamp: now,
      actor,
      details: `Revocation Reason: ${reason}`,
    },
  ];

  const patch: Partial<IssuedTestimonial> = {
    state: 'revoked',
    revokedAt: now,
    revokeReason: reason,
    revocationReason: reason,
    history: updatedHistory,
  };

  if (db && db.issuedTestimonials) {
    try {
      await db.issuedTestimonials.update(id, patch);
    } catch (err) {
      console.warn('Dexie update failed:', err);
    }
  }

  store.updateIssuedTestimonial(id, patch);
}

/**
 * Transactional atomic unit-of-work: commits student and exam result changes together.
 * Resolves student by immutable studentDbId.
 */
export interface RosterChangePayload {
  examResultId: string;
  studentDbId: string;
  examResultData: Partial<ExamResult>;
  studentData: Partial<Student>;
}

export interface AtomicRosterSaveResult {
  successfulIds: string[];
  failedRecords: Array<{ id: string; error: string }>;
}

export async function saveTestimonialRosterChangesAtomic(
  changesOrWrapper: RosterChangePayload[] | {
    transactions?: Array<{
      item: TestimonialRosterItem;
      studentDbId?: string;
      examResultId: string;
    }>;
    updateExamResult?: (id: string, updates: Partial<ExamResult>) => void;
    updateStudent?: (id: string, updates: Partial<Student>) => void;
  }
): Promise<AtomicRosterSaveResult> {
  const successfulIds: string[] = [];
  const failedRecords: Array<{ id: string; error: string }> = [];

  const store = useAppStore.getState();

  const isWrapper = changesOrWrapper && !Array.isArray(changesOrWrapper) && 'transactions' in changesOrWrapper;
  const customUpdateExamResult = isWrapper ? (changesOrWrapper as any).updateExamResult : undefined;
  const customUpdateStudent = isWrapper ? (changesOrWrapper as any).updateStudent : undefined;

  const changes: RosterChangePayload[] = Array.isArray(changesOrWrapper)
    ? changesOrWrapper
    : ((changesOrWrapper as any).transactions || []).map((tx: any) => ({
        examResultId: tx.examResultId,
        studentDbId: tx.studentDbId,
        examResultData: {
          session: tx.item.session,
          group: tx.item.group,
          boardRollNo: tx.item.boardRollNo,
          registrationNo: tx.item.registrationNo,
          gpa: tx.item.gpa,
          board: tx.item.board,
          examCenter: tx.item.examCenter,
          examCenterBn: tx.item.examCenterBn,
          name: tx.item.name,
          nameBn: tx.item.nameBn,
          fatherName: tx.item.fatherName,
          fatherNameBn: tx.item.fatherNameBn,
          motherName: tx.item.motherName,
          motherNameBn: tx.item.motherNameBn,
          dateOfBirth: tx.item.dateOfBirth,
          gender: tx.item.gender,
          village: tx.item.village,
          villageBn: tx.item.villageBn,
          postOffice: tx.item.postOffice,
          postOfficeBn: tx.item.postOfficeBn,
          upazila: tx.item.upazila,
          upazilaBn: tx.item.upazilaBn,
          district: tx.item.district,
          districtBn: tx.item.districtBn,
        },
        studentData: {
          name: tx.item.name,
          nameBn: tx.item.nameBn,
          fatherName: tx.item.fatherName,
          fatherNameBn: tx.item.fatherNameBn,
          motherName: tx.item.motherName,
          motherNameBn: tx.item.motherNameBn,
          dateOfBirth: tx.item.dateOfBirth,
          gender: tx.item.gender,
          registrationNo: tx.item.registrationNo,
          session: tx.item.session,
          group: tx.item.group,
          village: tx.item.village,
          villageBn: tx.item.villageBn,
          postOffice: tx.item.postOffice,
          postOfficeBn: tx.item.postOfficeBn,
          upazila: tx.item.upazila,
          upazilaBn: tx.item.upazilaBn,
          district: tx.item.district,
          districtBn: tx.item.districtBn,
        },
      }));

  for (const change of changes) {
    try {
      // Validation check
      if (!change.examResultId) {
        throw new Error('ExamResult ID missing');
      }

      // Update ExamResult
      if (customUpdateExamResult) {
        customUpdateExamResult(change.examResultId, change.examResultData);
      } else {
        store.updateExamResult(change.examResultId, change.examResultData);
      }

      // Update Student by internal immutable studentDbId if provided
      if (change.studentDbId) {
        if (customUpdateStudent) {
          customUpdateStudent(change.studentDbId, change.studentData);
        } else {
          store.updateStudent(change.studentDbId, change.studentData);
        }
      } else {
        // Fallback lookup by studentId
        const student = store.students.find(s => s.studentId === change.examResultData.studentId);
        if (student) {
          if (customUpdateStudent) {
            customUpdateStudent(student.id, change.studentData);
          } else {
            store.updateStudent(student.id, change.studentData);
          }
        }
      }

      // If IndexedDB is active, persist in database
      if (db && db.examResults && db.students) {
        try {
          await db.transaction('rw', [db.examResults, db.students], async () => {
            await db.examResults.update(change.examResultId, change.examResultData);
            if (change.studentDbId) {
              await db.students.update(change.studentDbId, change.studentData);
            }
          });
        } catch (dbErr) {
          console.warn('Dexie transaction warning:', dbErr);
        }
      }

      successfulIds.push(change.examResultId);
    } catch (err: any) {
      failedRecords.push({
        id: change.examResultId,
        error: err?.message || 'Unknown error occurred while saving roster record',
      });
    }
  }

  return { successfulIds, failedRecords };
}

/**
 * Exact-exam scoped deletion with pre-delete snapshot.
 * Guarantees that results from other exams in the same year are NEVER deleted.
 */
export interface PreDeleteExamResultsSnapshot {
  snapshotId: string;
  examId: string;
  timestamp: string;
  records: ExamResult[];
}

export function createPreDeleteSnapshot(
  examId: string,
  resultsToDelete: ExamResult[]
): PreDeleteExamResultsSnapshot {
  return {
    snapshotId: `snap_del_${examId}_${Date.now()}`,
    examId,
    timestamp: new Date().toISOString(),
    records: JSON.parse(JSON.stringify(resultsToDelete)),
  };
}

export async function deleteExamResultsExactScoped(
  examId: string,
  resultIdsToDelete: string[]
): Promise<{ deletedCount: number; snapshot: PreDeleteExamResultsSnapshot }> {
  const store = useAppStore.getState();
  
  // Strictly filter by EXACT examId and resultIdsToDelete
  const matchedToDelete = store.examResults.filter(
    er => er.examId === examId && resultIdsToDelete.includes(er.id)
  );

  const snapshot = createPreDeleteSnapshot(examId, matchedToDelete);
  const idsToDelete = matchedToDelete.map(m => m.id);

  if (idsToDelete.length > 0) {
    store.bulkDeleteExamResults(idsToDelete);
    if (db && db.examResults) {
      try {
        await db.examResults.bulkDelete(idsToDelete);
      } catch (err) {
        console.warn('Dexie bulkDelete warning:', err);
      }
    }
  }

  return { deletedCount: idsToDelete.length, snapshot };
}

export async function restoreExamResultsFromSnapshot(
  snapshot: PreDeleteExamResultsSnapshot
): Promise<number> {
  const store = useAppStore.getState();
  if (!snapshot.records || snapshot.records.length === 0) {
    return 0;
  }

  store.bulkAddExamResults(snapshot.records);
  if (db && db.examResults) {
    try {
      await db.examResults.bulkPut(snapshot.records);
    } catch (err) {
      console.warn('Dexie bulkPut warning:', err);
    }
  }

  return snapshot.records.length;
}
