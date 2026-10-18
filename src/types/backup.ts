import { 
  Student, 
  StaffMember, 
  AcademicClass, 
  AcademicSection, 
  AcademicGroup, 
  AcademicSession, 
  ExamResult, 
  IssuedTestimonial, 
  FinancialTransaction, 
  FollowupCampaign, 
  FollowupTeam, 
  FollowupAssignment, 
  FollowupVisit, 
  CurriculumDefinition, 
  CurriculumSubjectMapping, 
  MasterSubject, 
  ExamRoutineItem, 
  ClassTeacherAssignment, 
  SubjectTeacherAssignment, 
  PayrollMonthlySheet, 
  User 
} from './index';
import { AuditLogEntry } from '../security/auditLog';

export interface BackupManifest {
  encryptionEnabled?: boolean;
  manifestVersion: number;
  appVersion: string;
  schemaVersion: number;
  createdAtUTC: string;
  institutionIdentifier: string;
  institutionName: string;
  tableCounts: Record<string, number>;
  totalRecords: number;
  checksumSha256: string;
  snapshotMarker: {
    snapshotId: string;
    timestampUTC: string;
    isConsistent: boolean;
  };
  encryptionMetadata: {
    algorithm: 'AES-256-GCM';
    kdf: 'PBKDF2-SHA-256';
    iterations: number;
    saltHex: string;
    ivHex: string;
    tagLengthBits: number;
  };
  featureFlags: {
    hasFinance: boolean;
    hasFollowup: boolean;
    hasTestimonials: boolean;
    hasAuthUsers: boolean;
  };
  verification: {
    isVerified: boolean;
    verifiedAtUTC: string;
    verifiedChecksumMatch: boolean;
  };
}

export interface BackupAuthData {
  isOnboarded: boolean;
  adminUser: string;
  adminPassHash: string;
  adminSalt: string;
  recoveryPinHash?: string;
  recoveryPinSalt?: string;
  users: Array<Omit<User, 'password'>>;
}

export interface BackupPayload {
  students: Student[];
  staff: StaffMember[];
  academicClasses: AcademicClass[];
  academicSections: AcademicSection[];
  academicGroups: AcademicGroup[];
  academicSessions: AcademicSession[];
  examResults: ExamResult[];
  issuedTestimonials: IssuedTestimonial[];
  financialTransactions: FinancialTransaction[];
  followupCampaigns: FollowupCampaign[];
  followupTeams: FollowupTeam[];
  followupAssignments: FollowupAssignment[];
  followupVisits: FollowupVisit[];
  curriculums: CurriculumDefinition[];
  curriculumMappings: CurriculumSubjectMapping[];
  masterSubjects: MasterSubject[];
  examRoutines: ExamRoutineItem[];
  classTeacherAssignments: ClassTeacherAssignment[];
  subjectTeacherAssignments: SubjectTeacherAssignment[];
  payrollMonthlySheets: PayrollMonthlySheet[];
  communicationDrafts: any[];
  quarantineRecords: any[];
  settings: Record<string, any>;
  authData: BackupAuthData;
  auditEvents: AuditLogEntry[];
}

export interface EncryptedBackupEnvelope {
  magic: 'BIDDALOK_ENCRYPTED_BACKUP_V5';
  manifest: BackupManifest;
  encryptedData: string; // base64 of AES-256-GCM ciphertext + tag
}

export interface ConflictSummary {
  overwriteCount: number;
  skipCount: number;
  mergeCount: number;
  domainBreakdown?: Record<string, { incoming: number; existing: number; overlappingIds: number }>;
};


export interface DryRunValidationResult {
  isValid: boolean;
  isCompatible?: boolean;
  requiresPassword?: boolean;
  errors?: string[];
  manifest?: BackupManifest;
  conflictSummary?: ConflictSummary;
  parsedPayload?: BackupPayload;
}

export interface RestoreOptions {
  mergePolicy: 'replace' | 'merge_keep_current' | 'merge_overwrite';
  createEmergencyBackupFirst?: boolean;
}

export interface RestoreResult {
  success: boolean;
  error?: string;
  restoredCount?: number;
  mode?: string;
  restoredCounts?: Record<string, number>;
}
