/**
 * Biddalok Education Management Software
 * Domain-by-Domain Canonical Source-of-Truth Matrix (Phase 4 / F-04, F-16)
 * 
 * Architecture Principle:
 * - Dexie (IndexedDB) is the primary canonical durable data store for relational entities.
 * - Keyval (IndexedDB) is the canonical durable data store for atomic configurations & manifests.
 * - Zustand serves exclusively as an in-memory view/cache layer.
 * - Mutations MUST pass through the repository/service layer and achieve durable commit
 *   before reporting success.
 */

export type StorageEngine = 'Dexie' | 'IndexedDB_Keyval' | 'FileSystem_Media';

export interface DomainMetadata {
  domainKey: string;
  nameBn: string;
  nameEn: string;
  canonicalStore: StorageEngine;
  primaryTableOrKey: string;
  isRelational: boolean;
  cascadeRules: string;
  orphanPolicy: 'quarantine' | 'cascade_delete' | 'block_parent_delete' | 'retain_unlinked';
  description: string;
}

export const DOMAIN_SOURCE_OF_TRUTH_MATRIX: Record<string, DomainMetadata> = {
  students: {
    domainKey: 'students',
    nameBn: 'শিক্ষার্থী তথ্য',
    nameEn: 'Student Records',
    canonicalStore: 'Dexie',
    primaryTableOrKey: 'students',
    isRelational: true,
    cascadeRules: 'Cannot delete student if active exam results or issued testimonials exist without confirmation',
    orphanPolicy: 'block_parent_delete',
    description: 'Core student registry with compound indexed academic coordinates (class, roll, session, group, section).'
  },
  guardians: {
    domainKey: 'guardians',
    nameBn: 'অভিভাবক তথ্য',
    nameEn: 'Guardian Information',
    canonicalStore: 'Dexie',
    primaryTableOrKey: 'students', // embedded normalized fields in student
    isRelational: true,
    cascadeRules: 'Embedded in student entity; lifecycle bound to student',
    orphanPolicy: 'cascade_delete',
    description: 'Parent and guardian details normalized and indexed for instant contact lookup.'
  },
  academic: {
    domainKey: 'academic',
    nameBn: 'একাডেমিক মাস্টার ডাটা',
    nameEn: 'Academic Master Data',
    canonicalStore: 'Dexie',
    primaryTableOrKey: 'classes, sections, groups, sessions, curriculums, masterSubjects',
    isRelational: true,
    cascadeRules: 'Classes, sections, groups cannot be removed while referenced by active students',
    orphanPolicy: 'block_parent_delete',
    description: 'Classes, groups, sections, sessions, curriculums, and subject structures.'
  },
  examResults: {
    domainKey: 'examResults',
    nameBn: 'পরীক্ষার ফলাফল ও রুটিন',
    nameEn: 'Exam Results & Routines',
    canonicalStore: 'Dexie',
    primaryTableOrKey: 'examResults, examRoutines',
    isRelational: true,
    cascadeRules: 'Bound to studentId and academic examId',
    orphanPolicy: 'quarantine',
    description: 'Board roll, registration, marks, GPA, and exam routines.'
  },
  testimonials: {
    domainKey: 'testimonials',
    nameBn: 'প্রশংসাপত্র ও প্রত্যয়ন',
    nameEn: 'Testimonials & Certificates',
    canonicalStore: 'Dexie',
    primaryTableOrKey: 'issuedTestimonials',
    isRelational: true,
    cascadeRules: 'Immutable official issuance records; linked to student and exam results',
    orphanPolicy: 'retain_unlinked',
    description: 'Issued certificates, serials, verification tokens, and status history.'
  },
  finance: {
    domainKey: 'finance',
    nameBn: 'আর্থিক হিসাব ও ভাউচার',
    nameEn: 'Financial Accounts & Transactions',
    canonicalStore: 'Dexie',
    primaryTableOrKey: 'financialTransactions',
    isRelational: true,
    cascadeRules: 'Ledger entries immutable; studentId optional for student fee transactions',
    orphanPolicy: 'retain_unlinked',
    description: 'Double-entry vouchers, incomes, expenses, categories, and account balances.'
  },
  followup: {
    domainKey: 'followup',
    nameBn: 'শিক্ষার্থী ফলো-আপ ও পরিদর্শন',
    nameEn: 'Student Follow-up & Visits',
    canonicalStore: 'Dexie',
    primaryTableOrKey: 'followupCampaigns, followupTeams, followupAssignments, followupVisits',
    isRelational: true,
    cascadeRules: 'Assignments cascade-link to campaign, team, and studentId',
    orphanPolicy: 'quarantine',
    description: 'Outreach campaigns, volunteer teams, student home visit assignments, and outcome logs.'
  },
  hrPayroll: {
    domainKey: 'hrPayroll',
    nameBn: 'শিক্ষক-কর্মচারী ও বেতন',
    nameEn: 'Staff & Payroll',
    canonicalStore: 'Dexie',
    primaryTableOrKey: 'staff, payrollMonthlySheets',
    isRelational: true,
    cascadeRules: 'Staff members link to designations, assignments, and payroll sheets',
    orphanPolicy: 'block_parent_delete',
    description: 'Teacher and employee records, designations, salaries, and monthly payroll disbursement.'
  },
  committee: {
    domainKey: 'committee',
    nameBn: 'ম্যানেজিং কমিটি',
    nameEn: 'Managing Committee',
    canonicalStore: 'IndexedDB_Keyval',
    primaryTableOrKey: 'biddalok-settings:managingCommittee',
    isRelational: false,
    cascadeRules: 'Standalone governing body roster',
    orphanPolicy: 'retain_unlinked',
    description: 'School managing committee members, tenures, designations, and mobile numbers.'
  },
  scholarship: {
    domainKey: 'scholarship',
    nameBn: 'উপবৃত্তি ও বৃত্তি',
    nameEn: 'Scholarships & Stipends',
    canonicalStore: 'IndexedDB_Keyval',
    primaryTableOrKey: 'biddalok-settings:scholarships',
    isRelational: true,
    cascadeRules: 'Links to student ID',
    orphanPolicy: 'retain_unlinked',
    description: 'Government and institutional stipends and scholarship eligibility criteria.'
  },
  communication: {
    domainKey: 'communication',
    nameBn: 'যোগাযোগ ও নোটিশ ড্রাফট',
    nameEn: 'Communication & Notice Drafts',
    canonicalStore: 'Dexie',
    primaryTableOrKey: 'communicationDrafts',
    isRelational: false,
    cascadeRules: 'Standalone drafts and SMS logs',
    orphanPolicy: 'retain_unlinked',
    description: 'SMS templates, notice drafts, sent logs, and recipients.'
  },
  filesMedia: {
    domainKey: 'filesMedia',
    nameBn: 'ফাইল ও মিডিয়া সংরক্ষণ',
    nameEn: 'Files & Media Storage',
    canonicalStore: 'FileSystem_Media',
    primaryTableOrKey: 'local_media_directory',
    isRelational: true,
    cascadeRules: 'File paths indexed to studentId or staffId in entity records',
    orphanPolicy: 'quarantine',
    description: 'Physical photos, scanned testimonials, and documents contained within /Media.'
  },
  settings: {
    domainKey: 'settings',
    nameBn: 'প্রতিষ্ঠান ও সিস্টেম সেটিংস',
    nameEn: 'Institution & System Settings',
    canonicalStore: 'IndexedDB_Keyval',
    primaryTableOrKey: 'biddalok-database-v1:institution',
    isRelational: false,
    cascadeRules: 'Global configuration',
    orphanPolicy: 'retain_unlinked',
    description: 'Institution details, EIIN, branding, logo, signature, font settings, and ID card configurations.'
  },
  usersAudit: {
    domainKey: 'usersAudit',
    nameBn: 'ব্যবহারকারী ও অডিট ট্রেইল',
    nameEn: 'Users & Security Audit Log',
    canonicalStore: 'IndexedDB_Keyval',
    primaryTableOrKey: 'biddalok_auth_users, biddalok_security_audit_events',
    isRelational: false,
    cascadeRules: 'Tamper-evident append-only log; user identities require unique usernames',
    orphanPolicy: 'retain_unlinked',
    description: 'Authorized user credentials, password hashes, role policies, and immutable security events.'
  }
};
