import { generateId } from '../utils/generateId';

async function bridgeToDoubleEntry(tx) {
  try {
    const periodId = 'fp_' + new Date().getFullYear();
    if (tx.type === 'expense') {
      const jrnId = generateId('jrn_');
      await db.journals.add({
        id: jrnId,
        voucherNo: tx.voucherNo || `JV-EXP-${Date.now()}`,
        date: tx.date,
        periodId: periodId,
        description: tx.title,
        type: 'manual',
        referenceId: tx.id,
        status: 'posted'
      });
      await db.journalLines.bulkAdd([
        { id: generateId('jrnl_'), journalId: jrnId, accountId: 'acc_general_expense', debitMinor: tx.amount * 100, creditMinor: 0 },
        { id: generateId('jrnl_'), journalId: jrnId, accountId: 'acc_cash', debitMinor: 0, creditMinor: tx.amount * 100 }
      ]);
    } else if (tx.type === 'income') {
      if (tx.studentId) {
        // Create invoice and receipt
        const amountMinor = tx.amount * 100;
        const invId = generateId('inv_');
        await db.invoices.add({
          id: invId,
          invoiceNo: `INV-BRG-${Date.now()}`,
          studentId: tx.studentId,
          date: tx.date,
          dueDate: tx.date,
          periodId: periodId,
          totalAmountMinor: amountMinor,
          status: 'posted'
        });
        await db.invoiceLines.add({ id: generateId('invl_'), invoiceId: invId, feeHeadId: 'fh_tuition', amountMinor });
        
        const recId = generateId('rec_');
        await db.receipts.add({
          id: recId,
          receiptNo: `REC-BRG-${Date.now()}`,
          studentId: tx.studentId,
          date: tx.date,
          amountMinor,
          paymentMethod: tx.paymentMethod || 'cash',
          accountId: 'acc_cash',
          status: 'posted'
        });
        await db.receiptAllocations.add({ id: generateId('reca_'), receiptId: recId, invoiceId: invId, amountMinor });

        // Journals
        const invJrnId = generateId('jrn_');
        await db.journals.add({ id: invJrnId, voucherNo: `JV-INV-${invId}`, date: tx.date, periodId, description: 'Bridge Invoice', type: 'invoice', referenceId: invId, status: 'posted' });
        await db.journalLines.bulkAdd([
          { id: generateId('jrnl_'), journalId: invJrnId, accountId: 'acc_ar', debitMinor: amountMinor, creditMinor: 0 },
          { id: generateId('jrnl_'), journalId: invJrnId, accountId: 'acc_tuition', debitMinor: 0, creditMinor: amountMinor }
        ]);

        const recJrnId = generateId('jrn_');
        await db.journals.add({ id: recJrnId, voucherNo: `JV-REC-${recId}`, date: tx.date, periodId, description: 'Bridge Receipt', type: 'receipt', referenceId: recId, status: 'posted' });
        await db.journalLines.bulkAdd([
          { id: generateId('jrnl_'), journalId: recJrnId, accountId: 'acc_cash', debitMinor: amountMinor, creditMinor: 0 },
          { id: generateId('jrnl_'), journalId: recJrnId, accountId: 'acc_ar', debitMinor: 0, creditMinor: amountMinor }
        ]);
      } else {
        const jrnId = generateId('jrn_');
        await db.journals.add({
          id: jrnId,
          voucherNo: tx.voucherNo || `JV-INC-${Date.now()}`,
          date: tx.date,
          periodId: periodId,
          description: tx.title,
          type: 'manual',
          referenceId: tx.id,
          status: 'posted'
        });
        await db.journalLines.bulkAdd([
          { id: generateId('jrnl_'), journalId: jrnId, accountId: 'acc_cash', debitMinor: tx.amount * 100, creditMinor: 0 },
          { id: generateId('jrnl_'), journalId: jrnId, accountId: 'acc_tuition', debitMinor: 0, creditMinor: tx.amount * 100 }
        ]);
      }
    }
  } catch (e) {
    console.error('Failed to bridge transaction to double-entry ledger:', e);
  }
}

import { create } from 'zustand';
import { DatabaseProvider } from '../db/DatabaseProvider';
import { assertPermission } from '../security/guard';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Institution, Language, Student, AcademicSession, AdmissionYearItem, AcademicClass, AcademicGroup, AcademicSection, StaffMember, TestimonialSettings, AttestationSettings, IssuedTestimonial, ExamResult, WhiteLabelSettings, ExamTerm, SubjectItem, GradingRule, ExamRoutineItem, AdmitCardSettings, MasterLookupItem, ClassTeacherAssignment, SubjectTeacherAssignment, PayrollMonthlySheet, StaffDesignationItem, StaffSubjectItem, ManagingCommitteeInfo, ManagingCommitteeMember, DesignationPermission, BankMasterItem, BankBranchItem, MasterSubject, Room, CurriculumDefinition, CurriculumSubjectMapping, PassLogicType, SubjectCategoryType, FinancialTransaction, StudentIdCardSettings, StaffIdCardSettings , FollowupCampaign, FollowupTeam, FollowupAssignment, FollowupVisit, SystemFontSettings } from '../types';
import { DEFAULT_DESIGNATION_PERMISSIONS, inferRoleFromDesignation } from '../data/accessControlDefaults';
import { defaultDivisions, defaultDistricts, defaultUpazilas, defaultUnions, LocationItem } from '../constants/bdLocations';
import {
 defaultMasterGenders,
 defaultMasterReligions,
 defaultMasterBloodGroups,
 defaultMasterNationalities,
 defaultMasterMaritalStatuses,
 defaultMasterDisabilities,
 defaultMasterProfessions,
 defaultMasterRelations,
 defaultMasterBoards,
 defaultMasterFacilities,
 defaultMasterInstitutions,
 defaultMasterPublicExams,
 defaultMasterCommitteeTypes,
 defaultMasterBankPayments
} from '../constants/masterLookups';
import { initialSampleStudents } from '../data/sampleStudents';
import { initialSampleStaff, initialClassTeacherAssignments, initialSubjectTeacherAssignments, initialSamplePayroll } from '../data/sampleStaff';
import { INITIAL_FINANCE_TRANSACTIONS } from '../data/defaultFinanceData';
import { defaultStaffDesignations, defaultStaffSubjects, defaultManagingCommittee } from '../data/defaultStaffMaster';
import { defaultMasterBanks } from '../data/defaultBankMasterData';
import { defaultExamTerms, defaultSubjects, defaultGradingRules,  defaultAdmitCardSettings } from '../data/defaultExamData';
import { defaultMasterSubjects, defaultCurriculums, defaultCurriculumMappings, defaultCurriculumId } from '../data/defaultCurriculumData';
import { asyncNonBlockingStorage, storageQueueManager, StorageStatus, createSafeJsonStorage } from './asyncStorage';
import { 
 syncStudentToDexie, 
 syncStudentsToDexie, 
 deleteStudentFromDexie, 
 deleteStudentsFromDexie,
 syncExamResultsToDexie,
 deleteExamResultsFromDexie,
 syncStaffToDexie,
 syncStaffMemberToDexie,
 deleteStaffMemberFromDexie,
 deleteStaffFromDexie,
 syncClassesToDexie,
 syncClassToDexie,
 deleteClassFromDexie,
 syncGroupsToDexie,
 syncGroupToDexie,
 deleteGroupFromDexie,
 syncSectionsToDexie,
 syncSectionToDexie,
 deleteSectionFromDexie,
 syncSessionsToDexie,
 syncSessionToDexie,
 deleteSessionFromDexie,
 syncAdmissionYearsToDexie,
 syncAdmissionYearToDexie,
 deleteAdmissionYearFromDexie,
 syncTestimonialToDexie,
 syncTestimonialsToDexie,
 deleteTestimonialFromDexie,
 syncCurriculumsToDexie,
 syncCurriculumMappingsToDexie,
 syncMasterSubjectsToDexie,
 syncExamRoutinesToDexie,
 syncClassTeacherAssignmentsToDexie,
 syncSubjectTeacherAssignmentsToDexie,
 syncPayrollSheetsToDexie,
 syncFinancialTransactionsToDexie,
 syncFinancialTransactionToDexie,
 deleteFinancialTransactionFromDexie,
 syncFollowupCampaignToDexie,
 syncFollowupCampaignsToDexie,
 deleteFollowupCampaignFromDexie,
 syncFollowupTeamToDexie,
 syncFollowupTeamsToDexie,
 deleteFollowupTeamFromDexie,
 syncFollowupAssignmentToDexie,
 syncFollowupAssignmentsToDexie,
 deleteFollowupAssignmentFromDexie,
 syncFollowupVisitToDexie,
 syncFollowupVisitsToDexie,
 deleteFollowupVisitFromDexie,
 db,
 clearAllDexieTables
} from '../db/database';
import { safePersist } from '../db/persistenceLog';
import { APP_VERSION } from '../version';

import { 
 linkStudentIds, 
 linkSubjectIds, 
 linkExamRoutineIds, 
 linkExamResultIds 
} from '../utils/academicRelations';

import { encryptBackupData, decryptBackupData } from '../utils/security';

export type MasterLookupCategory = 
 | 'gender' 
 | 'religion' 
 | 'bloodGroup' 
 | 'nationality' 
 | 'maritalStatus' 
 | 'disability' 
 | 'profession' 
 | 'relation' 
 | 'institution'
 | 'board' 
 | 'facility'
 | 'publicExamType'
 | 'committeeType'
 | 'bankPayment';

export interface JunkScanReport {
 duplicateLookupsCount: number;
 duplicateLocationsCount: number;
 orphanedDropdownValuesCount: number;
 unlinkedStudentReferencesCount: number;
 orphanedExamResultsCount: number;
 totalIssuesCount: number;
 details: {
 category: string;
 categoryBn: string;
 description: string;
 descriptionBn: string;
 count: number;
 }[];
}

export interface JunkCleanStats {
 lookupsDeduplicated: number;
 locationsDeduplicated: number;
 dropdownsCleaned: number;
 studentReferencesRepaired: number;
 examResultsCleaned: number;
 totalCleaned: number;
}

export interface AppState {
  followupCampaigns: FollowupCampaign[];
  addFollowupCampaign: (campaign: FollowupCampaign) => void;
  updateFollowupCampaign: (id: string, campaign: Partial<FollowupCampaign>) => void;
  deleteFollowupCampaign: (id: string) => void;

  followupTeams: FollowupTeam[];
  addFollowupTeam: (team: FollowupTeam) => void;
  updateFollowupTeam: (id: string, team: Partial<FollowupTeam>) => void;
  deleteFollowupTeam: (id: string) => void;

  followupAssignments: FollowupAssignment[];
  addFollowupAssignment: (assignment: FollowupAssignment) => void;
  updateFollowupAssignment: (id: string, assignment: Partial<FollowupAssignment>) => void;
  deleteFollowupAssignment: (id: string) => void;
  bulkAddFollowupAssignments: (assignments: FollowupAssignment[]) => void;

  
  followupVisits: FollowupVisit[];
  addFollowupVisit: (visit: FollowupVisit) => void;
  updateFollowupVisit: (id: string, visit: Partial<FollowupVisit>) => void;
  deleteFollowupVisit: (id: string) => void;
  completeFollowupVisitAtomic: (visit: FollowupVisit, assignmentId: string) => void;

  
 language: Language;
 setLanguage: (lang: Language) => void;
 
 institution: Institution;
 updateInstitution: (data: Partial<Institution>) => void;

 learnedLocations: LocationItem[];
 learnLocation: (loc: LocationItem | Omit<LocationItem, 'id'>) => void;
 updateLocation: (id: string, data: Partial<LocationItem>) => void;
 cascadeUpdateLocationId: (oldId: string, newId: string, updatedData?: Partial<LocationItem>) => void;
 deleteLocation: (id: string) => void;
 bulkAddLocations: (locations: LocationItem[]) => void;

 // Master Lookups (ID-based, bilingual, immutable IDs)
 masterGenders: MasterLookupItem[];
 masterReligions: MasterLookupItem[];
 masterBloodGroups: MasterLookupItem[];
 masterNationalities: MasterLookupItem[];
 masterMaritalStatuses: MasterLookupItem[];
 masterDisabilities: MasterLookupItem[];
 masterProfessions: MasterLookupItem[];
 masterRelations: MasterLookupItem[];
 masterInstitutions: MasterLookupItem[];
 masterBoards: MasterLookupItem[];
 masterFacilities: MasterLookupItem[];
 masterPublicExams: MasterLookupItem[];
 masterCommitteeTypes: MasterLookupItem[];
 masterBankPayments: MasterLookupItem[];
  rooms: Room[];
  addRoom: (room: Room) => void;
  updateRoom: (id: string, room: Partial<Room>) => void;
  deleteRoom: (id: string) => void;

 addMasterLookupItem: (category: MasterLookupCategory, item: { id?: string; name: string; nameBn?: string; code?: string; description?: string }) => MasterLookupItem;
 updateMasterLookupItem: (category: MasterLookupCategory, id: string, data: Partial<MasterLookupItem>) => void;
 deleteMasterLookupItem: (category: MasterLookupCategory, id: string) => void;
 bulkAddMasterLookupItems: (category: MasterLookupCategory, items: MasterLookupItem[]) => void;
 resetMasterLookupCategory: (category: MasterLookupCategory) => void;

 // System Data Integrity & Junk Data Clean
 scanJunkData: () => JunkScanReport;
 cleanJunkData: () => JunkCleanStats;

 students: Student[];
 addStudent: (student: Student) => void;
 updateStudent: (id: string, student: Partial<Student>) => void;
 deleteStudent: (id: string) => void;
 bulkAddStudents: (newStudents: Student[]) => void;
 bulkUpdateStudents: (updatedStudents: Student[]) => void;

 scholarships: import('../types').ScholarshipRecord[];
  scholarshipSettings?: { pmeatLogo?: string; dsheLogo?: string };
  updateScholarshipSettings: (settings: Partial<{ pmeatLogo?: string; dsheLogo?: string }>) => void;
 addScholarship: (record: import('../types').ScholarshipRecord) => void;
 updateScholarship: (id: string, record: Partial<import('../types').ScholarshipRecord>) => void;
 deleteScholarship: (id: string) => void;
 bulkDeleteStudents: (ids: string[]) => void;

 staff: StaffMember[];
 addStaffMember: (member: StaffMember) => void;
 updateStaffMember: (id: string, member: Partial<StaffMember>) => void;
 deleteStaffMember: (id: string) => void;
 bulkAddStaff: (members: StaffMember[]) => void;
 bulkUpdateStaff: (members: StaffMember[]) => void;
 updateStaffAttendanceStatus: (staffId: string, status: 'present' | 'absent' | 'leave', inTime?: string, reason?: string) => void;
 bulkUpdateStaffAttendance: (updates: { id: string; status: 'present' | 'absent' | 'leave'; inTime?: string; reason?: string }[]) => void;

 staffDesignations: StaffDesignationItem[];
 addStaffDesignation: (designation: StaffDesignationItem) => void;
 updateStaffDesignation: (id: string, designation: Partial<StaffDesignationItem>) => void;
 deleteStaffDesignation: (id: string) => void;
 resetStaffDesignations: () => void;

 // Access Control & Module Permissions
 designationPermissions: DesignationPermission[];
 updateDesignationPermission: (designationId: string, allowedModules: string[]) => void;
 bulkUpdateDesignationPermissions: (permissions: DesignationPermission[]) => void;
 resetDesignationPermissions: () => void;

 staffSubjects: StaffSubjectItem[];
 addStaffSubject: (subject: StaffSubjectItem) => void;
 updateStaffSubject: (id: string, subject: Partial<StaffSubjectItem>) => void;
 deleteStaffSubject: (id: string) => void;
 resetStaffSubjects: () => void;

 managingCommittee: ManagingCommitteeInfo;
 managingCommitteesList: ManagingCommitteeInfo[];
 updateManagingCommittee: (committee: Partial<ManagingCommitteeInfo>) => void;
 addCommitteeMember: (member: ManagingCommitteeMember) => void;
 updateCommitteeMember: (id: string, member: Partial<ManagingCommitteeMember>) => void;
 deleteCommitteeMember: (id: string) => void;
 saveManagingCommitteeRecord: (committee: ManagingCommitteeInfo) => void;
 deleteManagingCommitteeRecord: (id: string) => void;

 // Master Banks & Routing Numbers
 masterBanks: BankMasterItem[];
 addMasterBank: (bank: Omit<BankMasterItem, 'id' | 'branches'> & { branches?: BankBranchItem[] }) => BankMasterItem;
 updateMasterBank: (id: string, bank: Partial<BankMasterItem>) => void;
 deleteMasterBank: (id: string) => void;
 addMasterBranch: (bankId: string, branch: Omit<BankBranchItem, 'id' | 'bankId'>) => BankBranchItem;
 updateMasterBranch: (bankId: string, branchId: string, branch: Partial<BankBranchItem>) => void;
 deleteMasterBranch: (bankId: string, branchId: string) => void;
 resetMasterBanks: () => void;

 classTeacherAssignments: ClassTeacherAssignment[];
 addClassTeacherAssignment: (assignment: ClassTeacherAssignment) => void;
 updateClassTeacherAssignment: (id: string, assignment: Partial<ClassTeacherAssignment>) => void;
 deleteClassTeacherAssignment: (id: string) => void;
 bulkAddClassTeacherAssignments: (assignments: ClassTeacherAssignment[]) => void;

 subjectTeacherAssignments: SubjectTeacherAssignment[];
 addSubjectTeacherAssignment: (assignment: SubjectTeacherAssignment) => void;
 updateSubjectTeacherAssignment: (id: string, assignment: Partial<SubjectTeacherAssignment>) => void;
 deleteSubjectTeacherAssignment: (id: string) => void;
 bulkAddSubjectTeacherAssignments: (assignments: SubjectTeacherAssignment[]) => void;

 payrollMonthlySheets: PayrollMonthlySheet[];
 addPayrollSheet: (sheet: PayrollMonthlySheet) => void;
 updatePayrollSheet: (id: string, sheet: Partial<PayrollMonthlySheet>) => void;
 deletePayrollSheet: (id: string) => void;

 financialTransactions: FinancialTransaction[];
 addFinancialTransaction: (tx: FinancialTransaction) => void;
 updateFinancialTransaction: (id: string, tx: Partial<FinancialTransaction>) => void;
 deleteFinancialTransaction: (id: string) => void;
 bulkAddFinancialTransactions: (txs: FinancialTransaction[]) => void;

 academicSessions: AcademicSession[];
 addAcademicSession: (session: AcademicSession) => void;
 updateAcademicSession: (id: string, session: Partial<AcademicSession>) => void;
 deleteAcademicSession: (id: string) => void;
 setDefaultSession: (id: string) => void;

 admissionYears: AdmissionYearItem[];
 addAdmissionYear: (item: AdmissionYearItem) => void;
 updateAdmissionYear: (id: string, item: Partial<AdmissionYearItem>) => void;
 deleteAdmissionYear: (id: string) => void;
 setDefaultAdmissionYear: (id: string) => void;

 academicClasses: AcademicClass[];
 addAcademicClass: (cls: AcademicClass) => void;
 updateAcademicClass: (id: string, cls: Partial<AcademicClass>) => void;
 deleteAcademicClass: (id: string) => void;
 setDefaultClass: (id: string) => void;

 academicGroups: AcademicGroup[];
 addAcademicGroup: (grp: AcademicGroup) => void;
 updateAcademicGroup: (id: string, grp: Partial<AcademicGroup>) => void;
 deleteAcademicGroup: (id: string) => void;
 setDefaultGroup: (id: string) => void;

 academicSections: AcademicSection[];
 addAcademicSection: (sec: AcademicSection) => void;
 updateAcademicSection: (id: string, sec: Partial<AcademicSection>) => void;
 deleteAcademicSection: (id: string) => void;
 setDefaultSection: (id: string) => void;

 testimonialSettings: TestimonialSettings;
 updateTestimonialSettings: (settings: Partial<TestimonialSettings>) => void;

 attestationSettings: AttestationSettings;
 updateAttestationSettings: (settings: Partial<AttestationSettings>) => void;

 studentIdCardSettings: StudentIdCardSettings;
 updateStudentIdCardSettings: (settings: Partial<StudentIdCardSettings>) => void;

 staffIdCardSettings: StaffIdCardSettings;
 updateStaffIdCardSettings: (settings: Partial<StaffIdCardSettings>) => void;

 systemFontSettings: SystemFontSettings;
 updateSystemFontSettings: (settings: Partial<SystemFontSettings>) => void;

 examTerms: ExamTerm[];
 addExamTerm: (term: ExamTerm) => void;
 updateExamTerm: (id: string, term: Partial<ExamTerm>) => void;
  publishExamTerm: (id: string, policyVersion: string, publishedBy: string) => void;
 deleteExamTerm: (id: string) => void;
 setDefaultExamTerm: (id: string) => void;

 subjects: SubjectItem[];
 addSubject: (subj: SubjectItem) => void;
 updateSubject: (id: string, subj: Partial<SubjectItem>) => void;
 deleteSubject: (id: string) => void;
 bulkAddSubjects: (subjs: SubjectItem[]) => void;

 // Master Subjects Directory (Code-based ID)
 masterSubjects: MasterSubject[];
 addMasterSubject: (subject: MasterSubject) => void;
 updateMasterSubject: (id: string, subject: Partial<MasterSubject>) => void;
 deleteMasterSubject: (id: string) => void;
 resetMasterSubjects: () => void;

 // Curriculums (Frameworks)
 curriculums: CurriculumDefinition[];
 addCurriculum: (curriculum: CurriculumDefinition) => void;
 updateCurriculum: (id: string, curriculum: Partial<CurriculumDefinition>) => void;
 deleteCurriculum: (id: string) => void;
 setDefaultCurriculum: (id: string) => void;

 // Class-wise Subject & Marks Distribution Mappings
 curriculumMappings: CurriculumSubjectMapping[];
 addCurriculumMapping: (mapping: CurriculumSubjectMapping) => void;
 updateCurriculumMapping: (id: string, mapping: Partial<CurriculumSubjectMapping>) => void;
 deleteCurriculumMapping: (id: string) => void;
 bulkAddCurriculumMappings: (mappings: CurriculumSubjectMapping[]) => void;
 cloneCurriculumClassMappings: (sourceClassId: string, targetClassId: string, curriculumId: string) => void;
 resetCurriculumToDefault: () => void;
 syncCurriculumToExamSubjects: (curriculumId?: string) => void;

 gradingRules: GradingRule[];
 updateGradingRule: (id: string, rule: Partial<GradingRule>) => void;
 resetGradingRules: () => void;

 examRoutines: ExamRoutineItem[];
 addExamRoutine: (item: ExamRoutineItem) => void;
 updateExamRoutine: (id: string, item: Partial<ExamRoutineItem>) => void;
 deleteExamRoutine: (id: string) => void;
 bulkAddExamRoutines: (items: ExamRoutineItem[]) => void;

 admitCardSettings: AdmitCardSettings;
 updateAdmitCardSettings: (settings: Partial<AdmitCardSettings>) => void;

 examResults: ExamResult[];
 addExamResult: (result: ExamResult) => void;
 updateExamResult: (id: string, result: Partial<ExamResult>) => void;
 deleteExamResult: (id: string) => void;
 bulkAddExamResults: (results: ExamResult[]) => void;
 bulkUpdateExamResults: (results: ExamResult[]) => void;
 saveExamResults: (results: ExamResult[]) => void;
 bulkDeleteExamResults: (ids: string[]) => void;
 clearAllExamResults: () => void;

 whiteLabel: WhiteLabelSettings;
 updateWhiteLabel: (settings: Partial<WhiteLabelSettings>) => void;

 issuedTestimonials: IssuedTestimonial[];
 addIssuedTestimonial: (test: IssuedTestimonial) => void;
 updateIssuedTestimonial: (idOrTest: string | IssuedTestimonial, data?: Partial<IssuedTestimonial>) => void;
 deleteIssuedTestimonial: (id: string) => void;

 // Custom dynamically saved dropdown options
 savedProfessions: string[];
 addSavedProfession: (prof: string) => void;
 addProfession?: (prof: string) => void;
 updateSavedProfession: (oldProf: string, newProf: string) => void;
 deleteSavedProfession: (prof: string) => void;
 savedInstitutions: string[];
 addSavedInstitution: (inst: string) => void;
 addInstitution?: (inst: string) => void;
 updateSavedInstitution: (oldInst: string, newInst: string) => void;
 deleteSavedInstitution: (inst: string) => void;
 savedBoards: string[];
 addSavedBoard: (board: string) => void;
 addBoardOption?: (board: string) => void;
 updateSavedBoard: (oldBoard: string, newBoard: string) => void;
 deleteSavedBoard: (board: string) => void;
 savedClasses: string[];
 addSavedClass: (cls: string) => void;
 addClassOption?: (cls: string) => void;
 savedPassingYears: string[];
 addSavedPassingYear: (yr: string) => void;
 addPassingYear?: (yr: string) => void;
 savedGuardianRelations: string[];
 addSavedGuardianRelation: (rel: string) => void;
 addGuardianRelation?: (rel: string) => void;
 syncMasterDataFromStudents: () => void;

 // Database Management & Non-Blocking Persistence Queue
 exportBackupJSON: () => string;
 importBackupJSON: (jsonStr: string) => boolean;
 exportFullBackupAsync: (password?: string) => Promise<{ envelope: any; serialized: string; manifest: any }>;
 restoreBackupAsync: (options: any) => Promise<any>;
 resetToDefaults: () => void;
 flushStorageToDisk: () => Promise<void>;
 getStorageStatus: () => StorageStatus;
}

const defaultInstitution: Institution = {
 name: '',
 nameBn: '',
 eiin: '',
 mpoCode: '',
 schoolCode: '',
 address: '',
 addressBn: '',
 established: '',
 headmasterName: '',
 headmasterNameBn: '',
 headmasterTitle: 'Headmaster',
 headmasterTitleBn: 'প্রধান শিক্ষক',
 mobile: '',
 email: '',
 website: '',
 examCenter: '',
 defaultDivision: '',
 defaultDistrict: '',
 defaultUpazila: '',
 defaultUnion: '',
 defaultPostOffice: '',
 defaultVillage: '',
 district: '',
 upazila: '',
 union: '',
 postOffice: '',
 houseNo: '',
 para: '',
 village: '',
 headmasterPdsId: '',
 headmasterStaffId: '',
 headmasterDesignationId: 'des_head_teacher',
 logoUrl: '',
 logo: '',
 defaultYear: '2026',
 defaultSession: '2026',
};

export const defaultSessions: AcademicSession[] = [
  { id: 'sess-2026-s', name: '2026', nameBn: '২০২৬', isDefault: true },
  { id: 'sess-2024', name: '2024-2025', nameBn: '২০২৪-২০২৫', isDefault: false },
  { id: 'sess-2025', name: '2025-2026', nameBn: '২০২৫-২০২৬', isDefault: false },
  { id: 'sess-2026', name: '2026-2027', nameBn: '২০২৬-২০২৭', isDefault: false },
  { id: 'sess-2027', name: '2027-2028', nameBn: '২০২৭-২০২৮', isDefault: false },
];

export const defaultAdmissionYears: AdmissionYearItem[] = [
  { id: 'yr-2023', year: '2023', yearBn: '২০২৩', isDefault: false },
  { id: 'yr-2024', year: '2024', yearBn: '২০২৪', isDefault: false },
  { id: 'yr-2025', year: '2025', yearBn: '২০২৫', isDefault: false },
  { id: 'yr-2026', year: '2026', yearBn: '২০২৬', isDefault: true },
  { id: 'yr-2027', year: '2027', yearBn: '২০২৭', isDefault: false },
  { id: 'yr-2028', year: '2028', yearBn: '২০২৮', isDefault: false },
];

export const defaultClasses: AcademicClass[] = [
  { id: 'cls_six', name: 'Six', nameEn: 'Six', nameBn: 'ষষ্ঠ', code: '6', status: 'active', isDefault: true, orderIndex: 1 },
  { id: 'cls_seven', name: 'Seven', nameEn: 'Seven', nameBn: 'সপ্তম', code: '7', status: 'active', isDefault: false, orderIndex: 2 },
  { id: 'cls_eight', name: 'Eight', nameEn: 'Eight', nameBn: 'অষ্টম', code: '8', status: 'active', isDefault: false, orderIndex: 3 },
  { id: 'cls_nine', name: 'Nine', nameEn: 'Nine', nameBn: 'নবম', code: '9', status: 'active', isDefault: false, orderIndex: 4 },
  { id: 'cls_ten', name: 'Ten', nameEn: 'Ten', nameBn: 'দশম', code: '10', status: 'active', isDefault: false, orderIndex: 5 },
];

export const defaultGroups: AcademicGroup[] = [
  { id: 'grp_general', name: 'General', nameBn: 'সাধারণ', isDefault: true },
  { id: 'grp_science', name: 'Science', nameBn: 'বিজ্ঞান', isDefault: false },
  { id: 'grp_humanities', name: 'Humanities', nameBn: 'মানবিক', isDefault: false },
  { id: 'grp_business', name: 'Business Studies', nameBn: 'ব্যবসায় শিক্ষা', isDefault: false },
];

export const defaultSections: AcademicSection[] = [
  { id: 'sec_general', name: 'General', nameBn: 'সাধারণ', isDefault: true },
  { id: 'sec_kaa', name: 'Kaa', nameBn: 'ক', isDefault: false },
  { id: 'sec_kha', name: 'Kha', nameBn: 'খ', isDefault: false },
  { id: 'sec_gha', name: 'Gha', nameBn: 'গ', isDefault: false },
];

export const defaultProfessions = [
 'কৃষক', 'শিক্ষক', 'ব্যবসায়ী', 'চাকুরিজীবী', 'সরকারি চাকরি', 'বেসরকারি চাকরি',
 'দিনমজুর', 'প্রবাসী', 'ডাক্তার', 'প্রকৌশলী', 'আইনজীবী', 'ড্রাইভার', 'গৃহিণী',
 'ক্ষুদ্র ব্যবসায়ী', 'অবসরপ্রাপ্ত', 'অন্যান্য'
];

export const defaultPreviousInstitutions: string[] = [];

export const defaultBoards = [
 'কুমিল্লা', 'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'যশোর', 'বরিশাল', 'সিলেট',
 'দিনাজপুর', 'ময়মনসিংহ', 'মাদ্রাসা শিক্ষা বোর্ড', 'কারিগরি শিক্ষা বোর্ড',
 'প্রাথমিক শিক্ষা অধিদপ্তর (DPE)', 'বাংলাদেশ উন্মুক্ত বিশ্ববিদ্যালয় (BOU)',
 'ক্যাডেট কলেজ', 'অন্যান্য'
];

export const defaultPreviousClasses = [
 'শিশু শ্রেণি', '১ম শ্রেণি', '২য় শ্রেণি', '৩য় শ্রেণি', '৪র্থ শ্রেণি',
 '৫ম শ্রেণি', '৬ষ্ঠ শ্রেণি', '৭ম শ্রেণি', '৮ম শ্রেণি', '৯ম শ্রেণি',
 '১০ম শ্রেণি', 'একাদশ শ্রেণি'
];

export const defaultGuardianRelations = [
 'পিতা', 'মাতা', 'বড় ভাই', 'বড় বোন', 'চাচা / কাকা', 'মামা', 'দাদা', 'নানা', 'ফুফা', 'খালু', 'খালা', 'ফুফু', 'অন্যান্য'
];

const defaultTestimonialSettings: TestimonialSettings = {
 format: 'bn_portrait',
 layoutFormat: 'portrait',
 language: 'bn',
 studentDataFont: 'Tiro Bangla',
 signatoryName: '',
 signatoryTitle: 'প্রধান শিক্ষক',
 signatoryStaffId: '',
 preparerName: '',
 preparerTitle: 'প্রস্তুতকারী',
 preparerStaffId: '',
 verifierName: '',
 verifierTitle: 'যাচাইকারী',
 verifierStaffId: '',
 customText: '',
 showLogo: true,
 showQrCode: true,
 includeSignature: true,
 certificateDesign: 'classic_blue',
 examYear: new Date().getFullYear().toString(),
 instNameFontSize: 28,
 bodyFontSize: 16,
 bodyLineHeight: 1.6,
 titleFontSize: 30,
 titleTopSpace: 16,
 titleBottomSpace: 16,
 paragraphSpacing: 6,
 closingTopSpace: 10,
 closingFontSize: 16.5,
 pageMargin: 0.35,
 pageMarginTop: 0.35,
 pageMarginBottom: 0.35,
 pageMarginLeft: 0.35,
 pageMarginRight: 0.35,
};

const defaultAttestationSettings: AttestationSettings = {
 studentType: 'currently_studying',
 memoNo: '',
 issueDate: '',
 title: '‘প্রত্যয়নপত্র’',
 subtitle: 'যাহার জন্য প্রযোজ্য',
 frameStyle: 'none',
 showInstituteLogo: true,
 includePhoto: false,
 rightLogoType: 'none',
 showQrCode: true,
 showSignature: true,
 headmasterName: '',
 headmasterTitle: 'প্রধান শিক্ষক',
 instNameFontSize: 25,
 titleFontSize: 28,
 bodyFontSize: 16,
 bodyLineHeight: 2.25,
 titleTopSpace: 28,
 titleBottomSpace: 28,
 paragraphSpacing: 14,
 closingTopSpace: 8,
 closingFontSize: 18,
 pageMargin: 0.4,
 pageMarginTop: 0.4,
 pageMarginBottom: 0.4,
 pageMarginLeft: 0.4,
 pageMarginRight: 0.4,
};

export const defaultStaffIdCardSettings: StaffIdCardSettings = {
 templateKey: "emerald_authority_v1",
 fieldSeparator: ":",
 content: {
 schoolNamePath: "institution.name",
 employeeNamePath: "employee.name",
 designationPath: "employee.designation"
 },
 media: {
 logoPath: "institution.logoUrl",
 photoPath: "employee.photoUrl",
 qrPath: "verification.qrImageUrl",
 signaturePath: "authorization.signatureUrl"
 },
 labels: {
 cardType: "শিক্ষক-কর্মচারী পরিচয়পত্র",
 logoAlt: "বিদ্যালয়ের লোগো",
 logoFallback: "লোগো",
 photoAltTemplate: "{name}-এর পরিচয়পত্রের ছবি",
 photoFallback: "ছবি",
 qrAlt: "পরিচয় যাচাইয়ের QR কোড",
 qrFallback: "QR",
 verificationTitle: "পরিচয় যাচাই",
 verificationHelp: "QR স্ক্যান করে কার্ডের বর্তমান অবস্থা যাচাই করুন।",
 nonTransferableNotice: "এই পরিচয়পত্র হস্তান্তরযোগ্য নয়।",
 signatureAlt: "প্রধান শিক্ষকের স্বাক্ষর",
 signatureLabel: "প্রধান শিক্ষক",
 frontAriaLabel: "পরিচয়পত্রের সামনের দিক",
 backAriaLabel: "পরিচয়পত্রের পেছনের দিক",
 fields: {
 indexNumber: "ইনডেক্স নম্বর",
 subject: "বিষয়",
 joiningDate: "যোগদানের তারিখ",
 validUntil: "মেয়াদ",
 bloodGroup: "রক্তের গ্রুপ",
 mobile: "মোবাইল",
 emergencyContact: "জরুরি যোগাযোগ",
 address: "ঠিকানা"
 }
 },
 visibility: {
 logo: true,
 backLogo: true,
 header: true,
 photo: true,
 identity: true,
 fields: true,
 mark: true,
 verification: true,
 notice: true,
 signature: true
 },
 layout: {
 front: {
 sections: ["header", "photo", "identity", "fields"],
 fields: [
 {
 id: "index-number",
 labelKey: "indexNumber",
 valuePath: "employee.indexNumber",
 visible: true
 },
 {
 id: "subject",
 labelKey: "subject",
 valuePath: "employee.subject",
 visible: true
 },
 {
 id: "joining-date",
 labelKey: "joiningDate",
 valuePath: "employee.joiningDate",
 visible: true
 },
 {
 id: "valid-until",
 labelKey: "validUntil",
 valuePath: "employee.validUntil",
 visible: true
 },
 {
 id: "blood-group",
 labelKey: "bloodGroup",
 valuePath: "employee.bloodGroup",
 variant: "blood",
 visible: true
 }
 ]
 },
 back: {
 sections: ["mark", "fields", "verification", "notice", "signature"],
 fields: [
 {
 id: "mobile",
 labelKey: "mobile",
 valuePath: "employee.mobile",
 visible: true
 },
 {
 id: "emergency-contact",
 labelKey: "emergencyContact",
 valuePath: "employee.emergencyContact",
 visible: true
 },
 {
 id: "address",
 labelKey: "address",
 valuePath: "employee.addressDisplay",
 visible: true
 }
 ]
 }
 },
 theme: {
 cardWidth: "54mm",
 cardHeight: "86mm",
 cardRadius: "3.2mm",
 cardPaddingX: "3.2mm",
 cardPaddingTop: "3mm",
 cardPaddingBottom: "3mm",
 primaryColor: "#075b45",
 primaryDarkColor: "#043d2f",
 accentColor: "#caa84a",
 surfaceColor: "#ffffff",
 mutedSurfaceColor: "#f2f7f5",
 textColor: "#14231e",
 mutedTextColor: "#53635e",
 dangerColor: "#cf2437",
 borderColor: "#d9e2de",
 fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', 'Nirmala UI', sans-serif",
 baseFontSize: "2mm",
 lineHeight: "1.22",
 schoolNameSize: "2em",
 employeeNameSize: "1.75em",
 designationSize: "1.05em",
 labelSize: "0.92em",
 valueSize: "0.96em",
 smallTextSize: "0.78em",
 photoWidth: "24mm",
 photoHeight: "26.8mm",
 photoRadius: "3mm",
 logoSize: "8.5mm",
 backLogoSize: "8mm",
 qrSize: "18mm",
 labelWidth: "17.2mm",
 separatorWidth: "2.4mm",
 itemPaddingTop: "0.18mm",
 itemPaddingBottom: "0.18mm",
 sectionGap: "1.5mm",
 headerPaddingTop: "0mm",
 headerPaddingBottom: "0.6mm",
 photoPaddingTop: "0.3mm",
 photoPaddingBottom: "0.6mm",
 identityPaddingTop: "0mm",
 identityPaddingBottom: "0.5mm",
 fieldsPaddingTop: "0.4mm",
 fieldsPaddingBottom: "0.4mm",
 qrPaddingTop: "0.6mm",
 qrPaddingBottom: "0.6mm",
 previewZoom: "1.72",
 pairGap: "7mm"
 }
};

export const defaultStudentIdCardSettings: StudentIdCardSettings = {
 formatId: 'format_1',
 arabicHeader: 'مَدْرَسَةُ تَزْكِيَةِ الْعَامَّةِ أَوْنْلَايْن',
 headerTopText: 'مَدْرَسَةُ تَزْكِيَةِ الْعَامَّةِ أَوْنْلَايْن',
 idCardLabelBn: 'শিক্ষার্থী পরিচয়পত্র',
 idCardLabelEn: 'STUDENT IDENTITY CARD',
 fontFamily: 'default',
 fontSizeScale: 'normal',
 safetyMargin: 2.5,
 headerTopTextSize: 7.5,
 instNameSize: 11,
 instAddressSize: 7.5,
 idCardLabelSize: 7.5,
 studentNameSize: 13,
 studentIdSize: 9.5,
 detailsTextSize: 8.5,
 parentsNameSize: 8.5,
 addressTextSize: 7,
 academicInfoSize: 7.5,
 bloodGroupSize: 8,
 photoOffsetY: 0,
 photoOffsetX: 0,
 photoSize: 20,
 photoShape: 'rounded',
 photoFrameStyle: 'simple',
 studentIdBoxMarginTop: 1,
 studentIdBoxMarginBottom: 2,
 idCardLabelPaddingTop: 3,
 idCardLabelMarginTop: 3,
 idCardLabelMarginBottom: 3,
 headerTopPadding: 0,
 lineSpacing: 'normal',
 itemSpacing: 'normal',
 lineHeightMultiplier: 1.25,
 itemSpacingValue: 2,
 paragraphSpacing: 3,
 contentTopMargin: 1,
 studentPersonalDetailsSize: 8.5,
 dobTextSize: 8.5,
 mobileTextSize: 8.5,
 backLogoSize: 10,
 backHeaderSpacing: 2,
 backHeaderLineHeight: 1.2,
 backCodesFontSize: 6,
 backDividerStyle: 'solid',
 backDividerOffset: 0,
 emergencyContactNumber: '',
 qrInstructionFontSize: 6,
 topHeaderGraphicTheme: 'classic_clean',
 signatureTextColorMode: 'auto',
 signatureBoxBackground: 'white',
 cardGraphicTheme: 'classic_waves',
 customGraphicUrl: '',
 graphicOpacity: 100,
 showWatermarkLogo: true,
 showFrontLogo: true,
 showBackgroundGraphics: true,
 showBackCustomShape: true,
 backCustomShapeTextBn: 'জরুরি প্রয়োজনে যোগাযোগ: ০১৮৪০৩৮৫৫৬৭',
 backCustomShapeTextEn: 'Emergency Contact: 01840385567',
 validityPeriod: '২০২৬ – ২০৩০',
 showRenewalTable: true,
 orientation: 'portrait',
 cardSide: 'both',
 paperSize: 'a4',
 showCutMarks: true,
 theme: 'emerald_elite',
 primaryColor: '#0a5c53',
 accentColor: '#e59a1b',
 language: 'bn',
 institutionNameDisplay: 'both',
 showLogo: true,
 showEiin: true,
 showInstituteAddress: true,
 headerSubTextBn: 'শিক্ষার্থী পরিচয়পত্র',
 headerSubTextEn: 'STUDENT IDENTITY CARD',
 showPhoto: true,
 showStudentId: true,
 showRollNo: false,
 showClass: false,
 showSection: false,
 showGroup: false,
 showSession: false,
 showBloodGroup: true,
 showDob: true,
 showFatherName: true,
 showMotherName: true,
 showGuardianMobile: true,
 showEmergencyContact: true,
 showAddress: true,
 showQrCode: true,
 qrCodeContent: 'full',
 backTitleBn: 'শর্তাবলী ও নির্দেশনাবলী',
 backTitleEn: 'Terms & Instructions',
 frontPrimaryInfoMode: 'parents',
 signatureSide: 'front',
 termsTextBn: '১. এই পরিচয়পত্র প্রতিষ্ঠানের সম্পত্তি এবং সম্পূর্ণ হস্তান্তরঅযোগ্য।\n২. প্রতিষ্ঠান প্রাঙ্গণে ও পরীক্ষায় সর্বদা কার্ডটি দৃশ্যমান রাখতে হবে।\n৩. কার্ডটি হারিয়ে গেলে অবিলম্বে কর্তৃপক্ষকে অবহিত করতে হবে।\n৪. কার্ড প্রাপ্তির পর যথাযথ রক্ষণাবেক্ষণ শিক্ষার্থীর দায়িত্ব।',
 termsTextEn: '1. This identity card is institutional property and non-transferable.\n2. Must be visibly worn within campus premises and examination halls.\n3. In case of loss, report immediately to the administration.',
 returnNoticeBn: 'কার্ডটি কোথাও পাওয়া গেলে নিকটস্থ ডাকবাক্সে অথবা প্রতিষ্ঠানে জমা দেওয়ার অনুরোধ করা হলো।',
 returnNoticeEn: 'If found, please drop in the nearest mailbox or return to the institution.',
 showValidTill: true,
 validTillDate: '৩১ ডিসেম্বর ২০২৬',
 showPrincipalSignature: true,
 principalTitleBn: 'অধ্যক্ষ / প্রধান শিক্ষক',
 principalTitleEn: 'Principal / Headmaster',
 showStudentSignature: true,
 studentSignatureTitleBn: 'শিক্ষার্থীর স্বাক্ষর',
 studentSignatureTitleEn: 'Student Signature',
 useSavedPrincipalSignature: true,
};

export const defaultSystemFontSettings: SystemFontSettings = {
 defaultBengaliFont: 'Hind Siliguri',
 defaultEnglishFont: 'Inter',
 enableFontSmooth: true,
};

export const useAppStore = create<AppState>()(
 persist(
 (set, get) => ({
 language: 'bn',
 setLanguage: (lang) => set({ language: lang }),

  followupCampaigns: [],
  addFollowupCampaign: (campaign) => {
    safePersist('followup', 'addFollowupCampaign', syncFollowupCampaignToDexie(campaign));
    set((state) => ({ followupCampaigns: [...(state.followupCampaigns || []), campaign] }));
  },
  updateFollowupCampaign: (id, campaign) => {
    set((state) => {
      const updated = (state.followupCampaigns || []).map((c) => (c.id === id ? { ...c, ...campaign } : c));
      const target = updated.find((c) => c.id === id);
      if (target) safePersist('followup', 'updateFollowupCampaign', syncFollowupCampaignToDexie(target));
      return { followupCampaigns: updated };
    });
  },
  deleteFollowupCampaign: (id) => {
    safePersist('followup', 'deleteFollowupCampaign', deleteFollowupCampaignFromDexie(id));
    set((state) => ({ followupCampaigns: (state.followupCampaigns || []).filter((c) => c.id !== id) }));
  },

  followupTeams: [],
  addFollowupTeam: (team) => {
    safePersist('followup', 'addFollowupTeam', syncFollowupTeamToDexie(team));
    set((state) => ({ followupTeams: [...(state.followupTeams || []), team] }));
  },
  updateFollowupTeam: (id, team) => {
    set((state) => {
      const updated = (state.followupTeams || []).map((t) => (t.id === id ? { ...t, ...team } : t));
      const target = updated.find((t) => t.id === id);
      if (target) safePersist('followup', 'updateFollowupTeam', syncFollowupTeamToDexie(target));
      return { followupTeams: updated };
    });
  },
  deleteFollowupTeam: (id) => {
    safePersist('followup', 'deleteFollowupTeam', deleteFollowupTeamFromDexie(id));
    set((state) => ({ followupTeams: (state.followupTeams || []).filter((t) => t.id !== id) }));
  },

  followupAssignments: [],
  addFollowupAssignment: (assignment) => {
    safePersist('followup', 'addFollowupAssignment', syncFollowupAssignmentToDexie(assignment));
    set((state) => ({ followupAssignments: [...(state.followupAssignments || []), assignment] }));
  },
  updateFollowupAssignment: (id, assignment) => {
    set((state) => {
      const updated = (state.followupAssignments || []).map((a) => (a.id === id ? { ...a, ...assignment } : a));
      const target = updated.find((a) => a.id === id);
      if (target) safePersist('followup', 'updateFollowupAssignment', syncFollowupAssignmentToDexie(target));
      return { followupAssignments: updated };
    });
  },
  deleteFollowupAssignment: (id) => {
    safePersist('followup', 'deleteFollowupAssignment', deleteFollowupAssignmentFromDexie(id));
    set((state) => ({ followupAssignments: (state.followupAssignments || []).filter((a) => a.id !== id) }));
  },
  bulkAddFollowupAssignments: (assignments) => {
    safePersist('followup', 'bulkAddFollowupAssignments', syncFollowupAssignmentsToDexie(assignments));
    set((state) => ({ followupAssignments: [...(state.followupAssignments || []), ...assignments] }));
  },

  
  followupVisits: [],
  addFollowupVisit: (visit) => {
    safePersist('followup', 'addFollowupVisit', syncFollowupVisitToDexie(visit));
    set((state) => ({ followupVisits: [...(state.followupVisits || []), visit] }));
  },
  completeFollowupVisitAtomic: (visit, assignmentId) => {
    set((state) => {
      // 1. Update assignment
      const updatedAssignments = (state.followupAssignments || []).map(a => 
        a.id === assignmentId ? { ...a, status: 'visited' as const, updatedAt: new Date().toISOString() } : a
      );
      
      // 2. Add visit
      const newVisits = [...(state.followupVisits || []), visit];

      // 3. Queue the Outbox item
      const outboxItem = {
        id: `sync_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
        entityType: 'FollowupVisit',
        entityId: visit.id,
        operation: 'create',
        payload: { visit, assignmentId },
        status: 'pending',
        retryCount: 0,
        createdAt: new Date().toISOString()
      };
      
      // We asynchronously write to Dexie for the queue
      syncFollowupVisitToDexie(visit).catch(() => {});
      
      const targetAssignment = updatedAssignments.find(a => a.id === assignmentId);
      if (targetAssignment) {
        syncFollowupAssignmentToDexie(targetAssignment).catch(() => {});
      }

      return {
        followupAssignments: updatedAssignments,
        followupVisits: newVisits
      };
    });
  },

  updateFollowupVisit: (id, visit) => {
    set((state) => {
      const updated = (state.followupVisits || []).map((v) => (v.id === id ? { ...v, ...visit } : v));
      const target = updated.find((v) => v.id === id);
      if (target) safePersist('followup', 'updateFollowupVisit', syncFollowupVisitToDexie(target));
      return { followupVisits: updated };
    });
  },
  deleteFollowupVisit: (id) => {
    safePersist('followup', 'deleteFollowupVisit', deleteFollowupVisitFromDexie(id));
    set((state) => ({ followupVisits: (state.followupVisits || []).filter((v) => v.id !== id) }));
  },


 institution: defaultInstitution,
 updateInstitution: (data) =>
  set((state) => {
    const next = { ...(state.institution || defaultInstitution), ...data };
    DatabaseProvider.saveSettings('institution', next).catch(e => console.warn('Desktop institution sync error:', e));
    return { institution: next };
  }),

 learnedLocations: [...defaultDivisions, ...defaultDistricts, ...defaultUpazilas, ...defaultUnions],
 learnLocation: (loc) => set((state) => {
 // Avoid duplicates by name + parent
 const exists = state.learnedLocations?.find(
 l => (l.name.toLowerCase() === loc.name.toLowerCase() || (l.nameBn && l.nameBn === loc.nameBn)) 
 && l.parentId === loc.parentId
 );
 if (exists) return state;
 const newId = 'id' in loc && loc.id ? loc.id : Date.now().toString();
 return {
 learnedLocations: [...(state.learnedLocations || []), { ...loc, id: newId }],
 };
 }),
 updateLocation: (id, data) => set((state) => ({
 learnedLocations: (state.learnedLocations || []).map((l) => (l.id === id ? { ...l, ...data } : l)),
 })),
 cascadeUpdateLocationId: (oldId, newId, updatedData) => set((state) => {
 const cleanNewId = (newId || '').trim();
 if (!cleanNewId || oldId === cleanNewId) {
 if (updatedData) {
 return {
 learnedLocations: (state.learnedLocations || []).map((l) => (l.id === oldId ? { ...l, ...updatedData } : l)),
 };
 }
 return state;
 }

 // 1. Update target location and children's parentId
 const newLearnedLocations = (state.learnedLocations || []).map((l) => {
 if (l.id === oldId) {
 return { ...l, ...(updatedData || {}), id: cleanNewId };
 }
 if (l.parentId === oldId) {
 return { ...l, parentId: cleanNewId };
 }
 return l;
 });

 // 2. Cascade to institution defaults
 const inst = state.institution || ({} as Institution);
 let instUpdated = false;
 const newInst = { ...inst };
 if (newInst.defaultDivision === oldId) { newInst.defaultDivision = cleanNewId; instUpdated = true; }
 if (newInst.defaultDistrict === oldId) { newInst.defaultDistrict = cleanNewId; instUpdated = true; }
 if (newInst.defaultUpazila === oldId) { newInst.defaultUpazila = cleanNewId; instUpdated = true; }
 if (newInst.defaultUnion === oldId) { newInst.defaultUnion = cleanNewId; instUpdated = true; }
 if (newInst.defaultPostOffice === oldId) { newInst.defaultPostOffice = cleanNewId; instUpdated = true; }
 if (newInst.defaultVillage === oldId) { newInst.defaultVillage = cleanNewId; instUpdated = true; }

 // 3. Cascade to students records
 const newStudents = (state.students || []).map((s) => {
 let modified = false;
 const upd: any = { ...s };

 if (s.district === oldId) { upd.district = cleanNewId; modified = true; }
 if (s.upazila === oldId) { upd.upazila = cleanNewId; modified = true; }
 if (s.union === oldId) { upd.union = cleanNewId; modified = true; }
 if (s.postOffice === oldId) { upd.postOffice = cleanNewId; modified = true; }
 if (s.village === oldId) { upd.village = cleanNewId; modified = true; }

 if (s.presentDistrict === oldId) { upd.presentDistrict = cleanNewId; modified = true; }
 if (s.presentUpazila === oldId) { upd.presentUpazila = cleanNewId; modified = true; }
 if (s.presentUnion === oldId) { upd.presentUnion = cleanNewId; modified = true; }
 if (s.presentPostOffice === oldId) { upd.presentPostOffice = cleanNewId; modified = true; }
 if (s.presentVillage === oldId) { upd.presentVillage = cleanNewId; modified = true; }

 return modified ? upd : s;
 });

 return {
 learnedLocations: newLearnedLocations,
 ...(instUpdated ? { institution: newInst } : {}),
 students: newStudents,
 };
 }),
 deleteLocation: (id) => set((state) => ({
 learnedLocations: (state.learnedLocations || []).filter((l) => l.id !== id),
 })),
 bulkAddLocations: (newLocs) => set((state) => {
 const current = state.learnedLocations || [];
 const toAdd = newLocs.filter(n => !current.some(c => c.id === n.id || (c.name.toLowerCase() === n.name.toLowerCase() && c.parentId === n.parentId)));
 return { learnedLocations: [...current, ...toAdd] };
 }),

 // Master Lookups (ID-based, bilingual, immutable IDs)
 masterGenders: defaultMasterGenders,
 masterReligions: defaultMasterReligions,
 masterBloodGroups: defaultMasterBloodGroups,
 masterNationalities: defaultMasterNationalities,
 masterMaritalStatuses: defaultMasterMaritalStatuses,
 masterDisabilities: defaultMasterDisabilities,
 masterProfessions: defaultMasterProfessions,
 masterRelations: defaultMasterRelations,
 masterInstitutions: defaultMasterInstitutions,
 masterBoards: defaultMasterBoards,
 masterFacilities: defaultMasterFacilities,
 masterPublicExams: defaultMasterPublicExams,
 masterCommitteeTypes: defaultMasterCommitteeTypes,
 masterBankPayments: defaultMasterBankPayments,

 addMasterLookupItem: (category, item) => {
 const prefixMap: Record<MasterLookupCategory, string> = {
 gender: 'gen_',
 religion: 'rel_',
 bloodGroup: 'bg_',
 nationality: 'nat_',
 maritalStatus: 'ms_',
 disability: 'dis_',
 profession: 'prof_',
 relation: 'rel_',
 institution: 'inst_',
 board: 'board_',
 facility: 'fac_',
 publicExamType: 'pexam_',
 committeeType: 'comm_type_',
 bankPayment: 'bank_',
 };
 const prefix = prefixMap[category] || 'mst_';
 const cleanSlug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'item';
 const customId = item.id ? item.id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_') : '';
 const generatedId = customId || `${prefix}${cleanSlug}_${Date.now().toString(36)}`;
 
 const newItem: MasterLookupItem = {
 id: generatedId,
 name: item.name.trim(),
 nameBn: (item.nameBn || item.name).trim(),
 code: item.code ? item.code.trim().toUpperCase() : undefined,
 description: item.description?.trim(),
 isSystem: false,
 };

 const keyMap: Record<MasterLookupCategory, keyof AppState> = {
 gender: 'masterGenders',
 religion: 'masterReligions',
 bloodGroup: 'masterBloodGroups',
 nationality: 'masterNationalities',
 maritalStatus: 'masterMaritalStatuses',
 disability: 'masterDisabilities',
 profession: 'masterProfessions',
 relation: 'masterRelations',
 institution: 'masterInstitutions',
 board: 'masterBoards',
 facility: 'masterFacilities',
 publicExamType: 'masterPublicExams',
 committeeType: 'masterCommitteeTypes',
 bankPayment: 'masterBankPayments',
 };

 const stateKey = keyMap[category];
 set((state) => {
 const list = (state[stateKey] as MasterLookupItem[]) || [];
 // If already exists by id, update it or do not duplicate
 const existingIdx = list.findIndex(i => i.id === newItem.id);
 if (existingIdx >= 0) {
 const updated = [...list];
 updated[existingIdx] = { ...updated[existingIdx], ...newItem };
 return { [stateKey]: updated } as any;
 }
 return {
 [stateKey]: [...list, newItem]
 } as any;
 });

 return newItem;
 },

 updateMasterLookupItem: (category, id, data) => {
 const keyMap: Record<MasterLookupCategory, keyof AppState> = {
 gender: 'masterGenders',
 religion: 'masterReligions',
 bloodGroup: 'masterBloodGroups',
 nationality: 'masterNationalities',
 maritalStatus: 'masterMaritalStatuses',
 disability: 'masterDisabilities',
 profession: 'masterProfessions',
 relation: 'masterRelations',
 institution: 'masterInstitutions',
 board: 'masterBoards',
 facility: 'masterFacilities',
 publicExamType: 'masterPublicExams',
 committeeType: 'masterCommitteeTypes',
 bankPayment: 'masterBankPayments',
 };
 const stateKey = keyMap[category];

 set((state) => {
 const currentList = (state[stateKey] as MasterLookupItem[]) || [];
 const oldItem = currentList.find(i => i.id === id);
 if (!oldItem) return state;

 // Immutable ID: keep original id
 const updatedList = currentList.map(item => 
 item.id === id ? { ...item, ...data, id } : item
 );

 const newName = data.name || oldItem.name;
 const newNameBn = data.nameBn || oldItem.nameBn;

 // Cascade to students if needed
 let updatedStudents = state.students || [];
 let studentsChanged = false;

 if (category === 'gender') {
 updatedStudents = updatedStudents.map(s => {
 if (s.genderId === id) {
 studentsChanged = true;
 return { ...s, gender: (newName === 'Female' ? 'Female' : newName === 'Other' ? 'Other' : 'Male') as any };
 }
 return s;
 });
 } else if (category === 'religion') {
 updatedStudents = updatedStudents.map(s => {
 if (s.religionId === id) {
 studentsChanged = true;
 return { ...s, religion: newName };
 }
 return s;
 });
 } else if (category === 'bloodGroup') {
 updatedStudents = updatedStudents.map(s => {
 if (s.bloodGroupId === id) {
 studentsChanged = true;
 return { ...s, bloodGroup: newName };
 }
 return s;
 });
 } else if (category === 'profession') {
 updatedStudents = updatedStudents.map(s => {
 let m = false;
 const n = { ...s };
 if (s.fatherProfessionId === id) { n.fatherProfession = newName; m = true; }
 if (s.motherProfessionId === id) { n.motherProfession = newName; m = true; }
 if (s.guardianProfessionId === id) { n.guardianProfession = newName; m = true; }
 if (m) { studentsChanged = true; return n; }
 return s;
 });
 } else if (category === 'relation') {
 updatedStudents = updatedStudents.map(s => {
 if (s.guardianRelationId === id) {
 studentsChanged = true;
 return { ...s, guardianRelation: newName };
 }
 return s;
 });
 } else if (category === 'institution') {
 updatedStudents = updatedStudents.map(s => {
 if (s.prevSchoolId === id) {
 studentsChanged = true;
 return { ...s, prevSchoolName: newName };
 }
 return s;
 });
 } else if (category === 'board') {
 updatedStudents = updatedStudents.map(s => {
 if (s.prevBoardId === id) {
 studentsChanged = true;
 return { ...s, prevBoard: newName };
 }
 return s;
 });
 } else if (category === 'facility') {
 updatedStudents = updatedStudents.map(s => {
 if (s.specialFacilityId === id) {
 studentsChanged = true;
 return { ...s, specialFacility: newName };
 }
 return s;
 });
 }

 if (studentsChanged) {
 safePersist('students', 'sync', syncStudentsToDexie(updatedStudents));
 }

 return {
 [stateKey]: updatedList,
 ...(studentsChanged ? { students: updatedStudents } : {})
 } as any;
 });
 },

 deleteMasterLookupItem: (category, id) => {
 const keyMap: Record<MasterLookupCategory, keyof AppState> = {
 gender: 'masterGenders',
 religion: 'masterReligions',
 bloodGroup: 'masterBloodGroups',
 nationality: 'masterNationalities',
 maritalStatus: 'masterMaritalStatuses',
 disability: 'masterDisabilities',
 profession: 'masterProfessions',
 relation: 'masterRelations',
 institution: 'masterInstitutions',
 board: 'masterBoards',
 facility: 'masterFacilities',
 publicExamType: 'masterPublicExams',
 committeeType: 'masterCommitteeTypes',
 bankPayment: 'masterBankPayments',
 };
 const stateKey = keyMap[category];

 set((state) => {
 const currentList = (state[stateKey] as MasterLookupItem[]) || [];
 return {
 [stateKey]: currentList.filter(item => item.id !== id)
 } as any;
 });
 },

 bulkAddMasterLookupItems: (category, items) => {
 const keyMap: Record<MasterLookupCategory, keyof AppState> = {
 gender: 'masterGenders',
 religion: 'masterReligions',
 bloodGroup: 'masterBloodGroups',
 nationality: 'masterNationalities',
 maritalStatus: 'masterMaritalStatuses',
 disability: 'masterDisabilities',
 profession: 'masterProfessions',
 relation: 'masterRelations',
 institution: 'masterInstitutions',
 board: 'masterBoards',
 facility: 'masterFacilities',
 publicExamType: 'masterPublicExams',
 committeeType: 'masterCommitteeTypes',
 bankPayment: 'masterBankPayments',
 };
 const stateKey = keyMap[category];

 set((state) => {
 const currentList = (state[stateKey] as MasterLookupItem[]) || [];
 const currentIds = new Set(currentList.map(i => i.id));
 const toAdd = items.filter(i => i.id && !currentIds.has(i.id));
 return {
 [stateKey]: [...currentList, ...toAdd]
 } as any;
 });
 },

 resetMasterLookupCategory: (category) => {
 const defaultsMap: Record<MasterLookupCategory, { key: keyof AppState; defaults: MasterLookupItem[] }> = {
 gender: { key: 'masterGenders', defaults: defaultMasterGenders },
 religion: { key: 'masterReligions', defaults: defaultMasterReligions },
 bloodGroup: { key: 'masterBloodGroups', defaults: defaultMasterBloodGroups },
 nationality: { key: 'masterNationalities', defaults: defaultMasterNationalities },
 maritalStatus: { key: 'masterMaritalStatuses', defaults: defaultMasterMaritalStatuses },
 disability: { key: 'masterDisabilities', defaults: defaultMasterDisabilities },
 profession: { key: 'masterProfessions', defaults: defaultMasterProfessions },
 relation: { key: 'masterRelations', defaults: defaultMasterRelations },
 institution: { key: 'masterInstitutions', defaults: defaultMasterInstitutions },
 board: { key: 'masterBoards', defaults: defaultMasterBoards },
 facility: { key: 'masterFacilities', defaults: defaultMasterFacilities },
 publicExamType: { key: 'masterPublicExams', defaults: defaultMasterPublicExams },
 committeeType: { key: 'masterCommitteeTypes', defaults: defaultMasterCommitteeTypes },
 bankPayment: { key: 'masterBankPayments', defaults: defaultMasterBankPayments },
 };

 const target = defaultsMap[category];
 if (target) {
 set({ [target.key]: target.defaults } as any);
 }
 },

 scanJunkData: () => {
 const state = get();
 let duplicateLookupsCount = 0;
 let duplicateLocationsCount = 0;
 let orphanedDropdownValuesCount = 0;
 let unlinkedStudentReferencesCount = 0;
 let orphanedExamResultsCount = 0;
 const details: JunkScanReport['details'] = [];

 // 1. Master Lookups duplicates
 const categories: { key: MasterLookupCategory; nameBn: string; nameEn: string; list: MasterLookupItem[] }[] = [
 { key: 'religion', nameBn: 'ধর্ম', nameEn: 'Religion', list: state.masterReligions || [] },
 { key: 'bloodGroup', nameBn: 'রক্তের গ্রুপ', nameEn: 'Blood Group', list: state.masterBloodGroups || [] },
 { key: 'nationality', nameBn: 'জাতীয়তা', nameEn: 'Nationality', list: state.masterNationalities || [] },
 { key: 'gender', nameBn: 'লিঙ্গ', nameEn: 'Gender', list: state.masterGenders || [] },
 { key: 'maritalStatus', nameBn: 'বৈবাহিক অবস্থা', nameEn: 'Marital Status', list: state.masterMaritalStatuses || [] },
 { key: 'disability', nameBn: 'প্রতিবন্ধিতা', nameEn: 'Disability', list: state.masterDisabilities || [] },
 { key: 'profession', nameBn: 'পেশা', nameEn: 'Profession', list: state.masterProfessions || [] },
 { key: 'relation', nameBn: 'অভিভাবকের সম্পর্ক', nameEn: 'Relation', list: state.masterRelations || [] },
 { key: 'institution', nameBn: 'পূর্ববর্তী শিক্ষা প্রতিষ্ঠান', nameEn: 'Previous Institution', list: state.masterInstitutions || [] },
 { key: 'board', nameBn: 'শিক্ষা বোর্ড', nameEn: 'Board', list: state.masterBoards || [] },
 { key: 'facility', nameBn: 'বিশেষ সুবিধা', nameEn: 'Special Facility', list: state.masterFacilities || [] },
 { key: 'publicExamType', nameBn: 'পাবলিক পরীক্ষার তথ্য', nameEn: 'Public Exam Info', list: state.masterPublicExams || [] },
 { key: 'committeeType', nameBn: 'কমিটির ধরণ', nameEn: 'Committee Types', list: state.masterCommitteeTypes || [] },
 { key: 'bankPayment', nameBn: 'ব্যাংক ও পেমেন্ট', nameEn: 'Bank & Payment', list: state.masterBankPayments || [] },
 ];

 categories.forEach(cat => {
 const seen = new Set<string>();
 let catDups = 0;
 cat.list.forEach(item => {
 const keyName = item.name.trim().toLowerCase();
 const keyBn = item.nameBn?.trim();
 const comboKey = `${keyName}:::${keyBn}`;
 if (seen.has(comboKey) || (keyName && seen.has(keyName))) {
 catDups++;
 } else {
 seen.add(comboKey);
 if (keyName) seen.add(keyName);
 }
 });
 if (catDups > 0) {
 duplicateLookupsCount += catDups;
 details.push({
 category: cat.key,
 categoryBn: cat.nameBn,
 description: `Duplicate items found in ${cat.nameEn} master data`,
 descriptionBn: `${cat.nameBn} মাস্টার ডাটায় ${catDups} টি ডুপ্লিকেট তথ্য পাওয়া গেছে`,
 count: catDups
 });
 }
 });

 // 2. Duplicate locations
 const locMap = new Set<string>();
 (state.learnedLocations || []).forEach(loc => {
 const key = `${loc.parentId || 'root'}___${loc.name.trim().toLowerCase()}`;
 if (locMap.has(key)) {
 duplicateLocationsCount++;
 } else {
 locMap.add(key);
 }
 });
 if (duplicateLocationsCount > 0) {
 details.push({
 category: 'location',
 categoryBn: 'ঠিকানা ডাটাবেজ',
 description: `Duplicate learned location records`,
 descriptionBn: `ঠিকানা ডাটাবেজে ${duplicateLocationsCount} টি পুনরাবৃত্ত বা ডুপ্লিকেট ঠিকানা পাওয়া গেছে`,
 count: duplicateLocationsCount
 });
 }

 // 3. Orphaned / redundant saved strings
 const checkArr = (arr: string[] | undefined, name: string, nameBn: string) => {
 if (!arr) return;
 const seen = new Set<string>();
 let dups = 0;
 arr.forEach(s => {
 const t = s.trim();
 if (!t || seen.has(t.toLowerCase())) dups++;
 else seen.add(t.toLowerCase());
 });
 if (dups > 0) {
 orphanedDropdownValuesCount += dups;
 details.push({
 category: name,
 categoryBn: nameBn,
 description: `Redundant or blank entries in ${name}`,
 descriptionBn: `${nameBn} তালিকায় ${dups} টি অকার্যকর বা ফাঁকা এন্ট্রি`,
 count: dups
 });
 }
 };
 checkArr(state.savedProfessions, 'savedProfessions', 'সংরক্ষিত পেশা');
 checkArr(state.savedInstitutions, 'savedInstitutions', 'সংরক্ষিত প্রতিষ্ঠান');
 checkArr(state.savedBoards, 'savedBoards', 'সংরক্ষিত বোর্ড');
 checkArr(state.savedGuardianRelations, 'savedGuardianRelations', 'সংরক্ষিত সম্পর্ক');
 checkArr(state.savedClasses, 'savedClasses', 'সংরক্ষিত শ্রেণি');
 checkArr(state.savedPassingYears, 'savedPassingYears', 'সংরক্ষিত শিক্ষাবর্ষ');

 // 4. Student relational links
 (state.students || []).forEach(s => {
 let unlinked = false;
 if (s.class && !s.classId) unlinked = true;
 if (s.section && !s.sectionId) unlinked = true;
 if (s.group && !s.groupId) unlinked = true;
 if (s.session && !s.sessionId) unlinked = true;
 if (s.gender && !s.genderId) unlinked = true;
 if (s.religion && !s.religionId) unlinked = true;
 if (s.bloodGroup && !s.bloodGroupId) unlinked = true;
 if (s.prevSchoolName && !s.prevSchoolId) unlinked = true;
 if (s.prevBoard && !s.prevBoardId) unlinked = true;
 if (unlinked) unlinkedStudentReferencesCount++;
 });
 if (unlinkedStudentReferencesCount > 0) {
 details.push({
 category: 'studentRelations',
 categoryBn: 'শিক্ষার্থী আইডি রিলেশন',
 description: `Students with missing or unlinked master entity IDs`,
 descriptionBn: `${unlinkedStudentReferencesCount} জন শিক্ষার্থীর প্রোফাইলে মাস্টার আইডি সংযোগ প্রয়োজন`,
 count: unlinkedStudentReferencesCount
 });
 }

 // 5. Corrupted exam results
 const studentIdSet = new Set((state.students || []).map(s => s.id));
 const studentCustomIdSet = new Set((state.students || []).map(s => s.studentId));
 (state.examResults || []).forEach(er => {
 if (!er.studentId || (!studentIdSet.has(er.studentId) && !studentCustomIdSet.has(er.studentId))) {
 orphanedExamResultsCount++;
 }
 });
 if (orphanedExamResultsCount > 0) {
 details.push({
 category: 'examResults',
 categoryBn: 'পরীক্ষার ফলাফল',
 description: `Orphaned exam results without matching student`,
 descriptionBn: `${orphanedExamResultsCount} টি অভিভাবকহীন বা অসঙ্গতিপূর্ণ পরীক্ষার ফলাফল পাওয়া গেছে`,
 count: orphanedExamResultsCount
 });
 }

 const totalIssuesCount = duplicateLookupsCount + duplicateLocationsCount + orphanedDropdownValuesCount + unlinkedStudentReferencesCount + orphanedExamResultsCount;

 return {
 duplicateLookupsCount,
 duplicateLocationsCount,
 orphanedDropdownValuesCount,
 unlinkedStudentReferencesCount,
 orphanedExamResultsCount,
 totalIssuesCount,
 details
 };
 },

 cleanJunkData: () => {
 let lookupsDeduplicated = 0;
 let locationsDeduplicated = 0;
 let dropdownsCleaned = 0;
 let studentReferencesRepaired = 0;
 let examResultsCleaned = 0;

 set(state => {
 // 1. Deduplicate Master Lookups
 const cleanLookupList = (list: MasterLookupItem[] = []) => {
 const seen = new Map<string, MasterLookupItem>();
 const unique: MasterLookupItem[] = [];
 list.forEach(item => {
 const normEn = item.name?.trim().toLowerCase();
 const normBn = item.nameBn?.trim();
 const key = `${normEn}:::${normBn}`;
 if (!seen.has(key) && !seen.has(normEn)) {
 seen.set(key, item);
 if (normEn) seen.set(normEn, item);
 unique.push(item);
 } else {
 lookupsDeduplicated++;
 }
 });
 return unique;
 };

 const newGenders = cleanLookupList(state.masterGenders || defaultMasterGenders);
 const newReligions = cleanLookupList(state.masterReligions || defaultMasterReligions);
 const newBloodGroups = cleanLookupList(state.masterBloodGroups || defaultMasterBloodGroups);
 const newNationalities = cleanLookupList(state.masterNationalities || defaultMasterNationalities);
 const newMaritalStatuses = cleanLookupList(state.masterMaritalStatuses || defaultMasterMaritalStatuses);
 const newDisabilities = cleanLookupList(state.masterDisabilities || defaultMasterDisabilities);
 const newProfessions = cleanLookupList(state.masterProfessions || defaultMasterProfessions);
 const newRelations = cleanLookupList(state.masterRelations || defaultMasterRelations);
 const newInstitutions = cleanLookupList(state.masterInstitutions || defaultMasterInstitutions);
 const newBoards = cleanLookupList(state.masterBoards || defaultMasterBoards);
 const newFacilities = cleanLookupList(state.masterFacilities || defaultMasterFacilities);
 const newPublicExams = cleanLookupList(state.masterPublicExams || defaultMasterPublicExams);
 const newCommitteeTypes = cleanLookupList(state.masterCommitteeTypes || defaultMasterCommitteeTypes);
 const newBankPayments = cleanLookupList(state.masterBankPayments || defaultMasterBankPayments);

 // 2. Deduplicate Locations
 const locSeen = new Set<string>();
 const newLocations: LocationItem[] = [];
 (state.learnedLocations || []).forEach(loc => {
 const key = `${loc.parentId || 'root'}___${loc.name.trim().toLowerCase()}`;
 if (!locSeen.has(key)) {
 locSeen.add(key);
 newLocations.push(loc);
 } else {
 locationsDeduplicated++;
 }
 });

 // 3. Clean string lists
 const cleanStrings = (arr: string[] = []) => {
 const seen = new Set<string>();
 const cleaned: string[] = [];
 arr.forEach(s => {
 const t = s?.trim();
 if (t && !seen.has(t.toLowerCase())) {
 seen.add(t.toLowerCase());
 cleaned.push(t);
 } else {
 dropdownsCleaned++;
 }
 });
 return cleaned;
 };

 const newSavedProfessions = cleanStrings(state.savedProfessions || defaultProfessions);
 const newSavedInstitutions = cleanStrings(state.savedInstitutions || defaultPreviousInstitutions);
 const newSavedBoards = cleanStrings(state.savedBoards || defaultBoards);
 const newSavedRelations = cleanStrings(state.savedGuardianRelations || defaultGuardianRelations);
 const newSavedClasses = cleanStrings(state.savedClasses || defaultPreviousClasses);
 const newSavedPassingYears = cleanStrings(state.savedPassingYears || ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018']);

 // 4. Re-link and repair all students
 const repairedStudents = (state.students || []).map(student => {
 const linked = linkStudentIds(student, {
 classes: state.academicClasses,
 sections: state.academicSections,
 groups: state.academicGroups,
 sessions: state.academicSessions,
 genders: newGenders,
 religions: newReligions,
 bloodGroups: newBloodGroups,
 nationalities: newNationalities,
 maritalStatuses: newMaritalStatuses,
 disabilities: newDisabilities,
 professions: newProfessions,
 relations: newRelations,
 institutions: newInstitutions,
 boards: newBoards,
 facilities: newFacilities,
 });
 studentReferencesRepaired++;
 return linked;
 });

 // 5. Clean Exam Results
 const studentIdSet = new Set(repairedStudents.map(s => s.id));
 const studentCustomIdSet = new Set(repairedStudents.map(s => s.studentId));
 const validExamResults = (state.examResults || []).filter(er => {
 const isValid = er.studentId && (studentIdSet.has(er.studentId) || studentCustomIdSet.has(er.studentId));
 if (!isValid) examResultsCleaned++;
 return isValid;
 });

 // Async sync to Dexie
 safePersist('students', 'sync', syncStudentsToDexie(repairedStudents));
 safePersist('examResults', 'sync', syncExamResultsToDexie(validExamResults));

 return {
 masterGenders: newGenders,
 masterReligions: newReligions,
 masterBloodGroups: newBloodGroups,
 masterNationalities: newNationalities,
 masterMaritalStatuses: newMaritalStatuses,
 masterDisabilities: newDisabilities,
 masterProfessions: newProfessions,
 masterRelations: newRelations,
 masterInstitutions: newInstitutions,
 masterBoards: newBoards,
 masterFacilities: newFacilities,
 masterPublicExams: newPublicExams,
 masterCommitteeTypes: newCommitteeTypes,
 masterBankPayments: newBankPayments,
 learnedLocations: newLocations,
 savedProfessions: newSavedProfessions,
 savedInstitutions: newSavedInstitutions,
 savedBoards: newSavedBoards,
 savedGuardianRelations: newSavedRelations,
 savedClasses: newSavedClasses,
 savedPassingYears: newSavedPassingYears,
 students: repairedStudents,
 examResults: validExamResults,
 } as any;
 });

 const totalCleaned = lookupsDeduplicated + locationsDeduplicated + dropdownsCleaned + studentReferencesRepaired + examResultsCleaned;

 return {
 lookupsDeduplicated,
 locationsDeduplicated,
 dropdownsCleaned,
 studentReferencesRepaired,
 examResultsCleaned,
 totalCleaned
 };
 },

 students: [],
 addStudent: (student) => {
 set((state) => {
 const linked = linkStudentIds(student, {
 classes: state.academicClasses,
 sections: state.academicSections,
 groups: state.academicGroups,
 sessions: state.academicSessions,
 genders: state.masterGenders,
 religions: state.masterReligions,
 bloodGroups: state.masterBloodGroups,
 nationalities: state.masterNationalities,
 maritalStatuses: state.masterMaritalStatuses,
 disabilities: state.masterDisabilities,
 professions: state.masterProfessions,
 relations: state.masterRelations,
 institutions: state.masterInstitutions,
 boards: state.masterBoards,
 facilities: state.masterFacilities,
 });
 safePersist('students', 'sync', syncStudentToDexie(linked));
 DatabaseProvider.insertOrReplace('students', linked).catch(e => console.warn('Desktop student sync error:', e));
 return { students: [linked, ...(state.students || [])] };
 });
 },
 updateStudent: (id, data) => {
 set((state) => {
 const updatedStudents = (state.students || []).map((s) => {
 if (s.id === id) {
 const merged = { ...s, ...data };
 const linked = linkStudentIds(merged, {
 classes: state.academicClasses,
 sections: state.academicSections,
 groups: state.academicGroups,
 sessions: state.academicSessions,
 genders: state.masterGenders,
 religions: state.masterReligions,
 bloodGroups: state.masterBloodGroups,
 nationalities: state.masterNationalities,
 maritalStatuses: state.masterMaritalStatuses,
 disabilities: state.masterDisabilities,
 professions: state.masterProfessions,
 relations: state.masterRelations,
 institutions: state.masterInstitutions,
 boards: state.masterBoards,
 facilities: state.masterFacilities,
 });
 safePersist('students', 'sync', syncStudentToDexie(linked));
 DatabaseProvider.insertOrReplace('students', linked).catch(e => console.warn('Desktop student sync error:', e));
 return linked;
 }
 return s;
 });
 return { students: updatedStudents };
 });
 },
 deleteStudent: (id) => {
 assertPermission('students:delete', 'Delete Student');
 safePersist('students', 'delete', deleteStudentFromDexie(id));
 DatabaseProvider.delete('students', id).catch(e => console.warn('Desktop student delete error:', e));
 set((state) => ({
 students: (state.students || []).filter((s) => s.id !== id),
 }));
 },
 bulkAddStudents: (newStudents) => {
 set((state) => {
 const linked = newStudents.map(s => linkStudentIds(s, {
 classes: state.academicClasses,
 sections: state.academicSections,
 groups: state.academicGroups,
 sessions: state.academicSessions,
 genders: state.masterGenders,
 religions: state.masterReligions,
 bloodGroups: state.masterBloodGroups,
 nationalities: state.masterNationalities,
 maritalStatuses: state.masterMaritalStatuses,
 disabilities: state.masterDisabilities,
 professions: state.masterProfessions,
 relations: state.masterRelations,
 institutions: state.masterInstitutions,
 boards: state.masterBoards,
 facilities: state.masterFacilities,
 }));
 safePersist('students', 'sync', syncStudentsToDexie(linked));
 DatabaseProvider.bulkInsertOrReplace('students', linked).catch(e => console.warn('Desktop bulk student sync error:', e));
 return { students: [...linked, ...(state.students || [])] };
 });
 },
 bulkUpdateStudents: (updatedStudents) => {
 set((state) => {
 const updatedMap = new Map((updatedStudents || []).map(s => [s.id, s]));
 const newStudents = (state.students || []).map(s => {
 const updated = updatedMap.get(s.id);
 if (updated) {
 const merged = { ...s, ...updated };
 return linkStudentIds(merged, {
 classes: state.academicClasses,
 sections: state.academicSections,
 groups: state.academicGroups,
 sessions: state.academicSessions,
 genders: state.masterGenders,
 religions: state.masterReligions,
 bloodGroups: state.masterBloodGroups,
 nationalities: state.masterNationalities,
 maritalStatuses: state.masterMaritalStatuses,
 disabilities: state.masterDisabilities,
 professions: state.masterProfessions,
 relations: state.masterRelations,
 institutions: state.masterInstitutions,
 boards: state.masterBoards,
 facilities: state.masterFacilities,
 });
 }
 return s;
 });
 safePersist('students', 'sync', syncStudentsToDexie(newStudents));
 DatabaseProvider.bulkInsertOrReplace('students', newStudents).catch(e => console.warn('Desktop bulk student update error:', e));
 return { students: newStudents };
 });
 },
 
 scholarships: [],
      scholarshipSettings: {},
      updateScholarshipSettings: (settings) => set((state) => {
        const next = { ...(state.scholarshipSettings || {}), ...settings };
        DatabaseProvider.saveSettings('scholarshipSettings', next).catch(e => console.warn('Desktop scholarship settings sync error:', e));
        return { scholarshipSettings: next };
      }),
 addScholarship: (record) => set((state) => {
   const getAwardKey = (type: string) => {
     if (type === 'PEC' || type === 'Ebtedaee') return 'primary';
     if (type === 'JSC' || type === 'JDC') return 'junior';
     if (type === 'SSC' || type === 'Dakhil') return 'secondary';
     if (type === 'HSC' || type === 'Alim') return 'higher_secondary';
     return type || 'other';
   };
   const recordAward = getAwardKey(record.examType);
   const existingIndex = (state.scholarships || []).findIndex(
     (s) => s.studentId === record.studentId && 
            getAwardKey(s.examType) === recordAward &&
            s.status !== 'Inactive' &&
            s.id !== record.id
   );

   let next: import('../types').ScholarshipRecord[];
   if (existingIndex !== -1) {
     const existing = state.scholarships[existingIndex];
     next = (state.scholarships || []).map((s, idx) => 
       idx === existingIndex 
         ? { ...existing, ...record, id: existing.id, updatedAt: new Date().toISOString() } 
         : s
     );
   } else {
     next = [record, ...(state.scholarships || [])];
   }
   DatabaseProvider.saveSettings('scholarships', next).catch(e => console.warn('Desktop scholarship sync error:', e));
   return { scholarships: next };
 }),
 updateScholarship: (id, record) => set((state) => {
   const next = (state.scholarships || []).map(r => r.id === id ? { ...r, ...record } : r);
   DatabaseProvider.saveSettings('scholarships', next).catch(e => console.warn('Desktop scholarship sync error:', e));
   return { scholarships: next };
 }),
 deleteScholarship: (id) => set((state) => {
   const next = (state.scholarships || []).filter(r => r.id !== id);
   DatabaseProvider.saveSettings('scholarships', next).catch(e => console.warn('Desktop scholarship sync error:', e));
   return { scholarships: next };
 }),

 bulkDeleteStudents: (ids: string[]) => {
 safePersist('students', 'delete', deleteStudentsFromDexie(ids));
 DatabaseProvider.bulkDelete('students', ids).catch(e => console.warn('Desktop bulk student delete error:', e));
 set((state) => {
 const idSet = new Set(ids);
 return {
 students: (state.students || []).filter((s) => !idSet.has(s.id)),
 };
 });
 },

 staff: initialSampleStaff,
 addStaffMember: (member) => {
 safePersist('staff', 'sync', syncStaffMemberToDexie(member));
 DatabaseProvider.insertOrReplace('staff', member).catch(e => console.warn('Desktop staff sync error:', e));
 set((state) => ({ staff: [member, ...(state.staff || [])] }));
 },
 updateStaffMember: (id, data) => {
 set((state) => {
 const updated = (state.staff || []).map((m) => (m.id === id ? { ...m, ...data } : m));
 const target = updated.find(m => m.id === id);
 if (target) {
   safePersist('staff', 'sync', syncStaffMemberToDexie(target));
   DatabaseProvider.insertOrReplace('staff', target).catch(e => console.warn('Desktop staff sync error:', e));
 }
 return { staff: updated };
 });
 },
 deleteStaffMember: (id) => {
 safePersist('staff', 'delete', deleteStaffMemberFromDexie(id));
 DatabaseProvider.delete('staff', id).catch(e => console.warn('Desktop staff delete error:', e));
 set((state) => ({
 staff: (state.staff || []).filter((m) => m.id !== id),
 }));
 },
 bulkAddStaff: (newMembers) => {
 safePersist('staff', 'sync', syncStaffToDexie(newMembers));
 DatabaseProvider.bulkInsertOrReplace('staff', newMembers).catch(e => console.warn('Desktop bulk staff sync error:', e));
 set((state) => ({
 staff: [...newMembers, ...(state.staff || [])],
 }));
 },
 bulkUpdateStaff: (updatedMembers) => {
 safePersist('staff', 'sync', syncStaffToDexie(updatedMembers));
 DatabaseProvider.bulkInsertOrReplace('staff', updatedMembers).catch(e => console.warn('Desktop bulk staff update error:', e));
 set((state) => {
 const updatedMap = new Map((updatedMembers || []).map(m => [m.id, m]));
 return {
 staff: (state.staff || []).map(m => {
 const updated = updatedMap.get(m.id);
 return updated ? { ...m, ...updated } : m;
 })
 };
 });
 },
 updateStaffAttendanceStatus: (staffId, status, inTime, reason) =>
 set((state) => ({
 staff: (state.staff || []).map((m) =>
 m.id === staffId ? { ...m, todayAttendanceStatus: status, inTime, leaveReason: reason } : m
 )
 })),
 bulkUpdateStaffAttendance: (updates) =>
 set((state) => {
 const updateMap = new Map(updates.map(u => [u.id, u]));
 return {
 staff: (state.staff || []).map(m => {
 const u = updateMap.get(m.id);
 return u ? { ...m, todayAttendanceStatus: u.status, inTime: u.inTime, leaveReason: u.reason } : m;
 })
 };
 }),

 staffDesignations: defaultStaffDesignations,
 addStaffDesignation: (designation) =>
 set((state) => ({
 staffDesignations: [...(state.staffDesignations || defaultStaffDesignations), designation]
 })),
 updateStaffDesignation: (id, data) =>
 set((state) => ({
 staffDesignations: (state.staffDesignations || defaultStaffDesignations).map(d =>
 d.id === id ? { ...d, ...data } : d
 )
 })),
 deleteStaffDesignation: (id) =>
 set((state) => ({
 staffDesignations: (state.staffDesignations || defaultStaffDesignations).filter(d => d.id !== id)
 })),
 resetStaffDesignations: () =>
 set(() => ({ staffDesignations: defaultStaffDesignations })),

 // Designation Permissions for Role & Module Access Control
 designationPermissions: DEFAULT_DESIGNATION_PERMISSIONS,
 updateDesignationPermission: (designationId, allowedModules) =>
 set((state) => {
 const current = state.designationPermissions || DEFAULT_DESIGNATION_PERMISSIONS;
 const exists = current.some(p => p.designationId === designationId);
 if (exists) {
 return {
 designationPermissions: current.map(p =>
 p.designationId === designationId ? { ...p, allowedModules } : p
 )
 };
 }
 const desig = (state.staffDesignations || defaultStaffDesignations).find(d => d.id === designationId);
 const newPerm: DesignationPermission = {
 designationId,
 designationName: desig?.name || designationId,
 designationNameBn: desig?.nameBn || designationId,
 role: inferRoleFromDesignation(desig?.name, desig?.staffType === 'teaching'),
 allowedModules
 };
 return { designationPermissions: [...current, newPerm] };
 }),
 bulkUpdateDesignationPermissions: (permissions) =>
 set(() => ({ designationPermissions: permissions })),
 resetDesignationPermissions: () =>
 set(() => ({ designationPermissions: DEFAULT_DESIGNATION_PERMISSIONS })),

 staffSubjects: defaultStaffSubjects,
 addStaffSubject: (subject) =>
 set((state) => ({
 staffSubjects: [...(state.staffSubjects || defaultStaffSubjects), subject]
 })),
 updateStaffSubject: (id, data) =>
 set((state) => ({
 staffSubjects: (state.staffSubjects || defaultStaffSubjects).map(s =>
 s.id === id ? { ...s, ...data } : s
 )
 })),
 deleteStaffSubject: (id) =>
 set((state) => ({
 staffSubjects: (state.staffSubjects || defaultStaffSubjects).filter(s => s.id !== id)
 })),
 resetStaffSubjects: () =>
 set(() => ({ staffSubjects: defaultStaffSubjects })),

 managingCommittee: defaultManagingCommittee,
 managingCommitteesList: [],
 updateManagingCommittee: (committee) =>
 set((state) => {
 const updated = { ...(state.managingCommittee || defaultManagingCommittee), ...committee };
 const existingList = state.managingCommitteesList || [state.managingCommittee || defaultManagingCommittee];
 const foundIdx = existingList.findIndex(c => c.id === updated.id || (c.year && updated.year && c.year === updated.year));
 let newList: ManagingCommitteeInfo[];
 if (foundIdx >= 0) {
 newList = [...existingList];
 newList[foundIdx] = updated;
 } else {
 newList = [...existingList, updated];
 }
 return {
 managingCommittee: updated,
 managingCommitteesList: newList,
 };
 }),
 addCommitteeMember: (member) =>
 set((state) => {
 const currentComm = state.managingCommittee || defaultManagingCommittee;
 const members = [...(currentComm.members || []), member];
 const updated = { ...currentComm, members };
 const existingList = state.managingCommitteesList || [currentComm];
 const foundIdx = existingList.findIndex(c => c.id === updated.id || (c.year && updated.year && c.year === updated.year));
 let newList: ManagingCommitteeInfo[];
 if (foundIdx >= 0) {
 newList = [...existingList];
 newList[foundIdx] = updated;
 } else {
 newList = [...existingList, updated];
 }
 return {
 managingCommittee: updated,
 managingCommitteesList: newList,
 };
 }),
 updateCommitteeMember: (id, data) =>
 set((state) => {
 const currentComm = state.managingCommittee || defaultManagingCommittee;
 const members = ((currentComm.members || []).map(m =>
 m.id === id ? { ...m, ...data } : m
 ));
 const updated = { ...currentComm, members };
 const existingList = state.managingCommitteesList || [currentComm];
 const foundIdx = existingList.findIndex(c => c.id === updated.id || (c.year && updated.year && c.year === updated.year));
 let newList: ManagingCommitteeInfo[];
 if (foundIdx >= 0) {
 newList = [...existingList];
 newList[foundIdx] = updated;
 } else {
 newList = [...existingList, updated];
 }
 return {
 managingCommittee: updated,
 managingCommitteesList: newList,
 };
 }),
 deleteCommitteeMember: (id) =>
 set((state) => {
 const currentComm = state.managingCommittee || defaultManagingCommittee;
 const members = ((currentComm.members || []).filter(m => m.id !== id));
 const updated = { ...currentComm, members };
 const existingList = state.managingCommitteesList || [currentComm];
 const foundIdx = existingList.findIndex(c => c.id === updated.id || (c.year && updated.year && c.year === updated.year));
 let newList: ManagingCommitteeInfo[];
 if (foundIdx >= 0) {
 newList = [...existingList];
 newList[foundIdx] = updated;
 } else {
 newList = [...existingList, updated];
 }
 return {
 managingCommittee: updated,
 managingCommitteesList: newList,
 };
 }),
  saveManagingCommitteeRecord: (committeeRecord) =>
    set((state) => {
      // PHASE 13: Enforce activation rules
      if (committeeRecord.status === 'active') {
        if (!committeeRecord.approvalResolutionNo || !committeeRecord.approvalDate) {
          throw new Error('Cannot activate committee without explicit approval resolution and date (Phase 13)');
        }
        // If it's a regular election, check evidence
        if (committeeRecord.committeeType === 'regular' && committeeRecord.electionState) {
          if (!committeeRecord.electionState.approvalAttachmentUrl) {
            throw new Error('Activation without required approval file/evidence is rejected (Phase 13)');
          }
        }
      }

      const existingList = state.managingCommitteesList || [state.managingCommittee || defaultManagingCommittee];
 const foundIdx = existingList.findIndex(c => c.id === committeeRecord.id);
 let newList: ManagingCommitteeInfo[];
 if (foundIdx >= 0) {
 newList = [...existingList];
 newList[foundIdx] = committeeRecord;
 } else {
 newList = [...existingList, committeeRecord];
 }
 return {
 managingCommittee: committeeRecord, // Optionally update current if needed
 managingCommitteesList: newList,
 };
 }),
 deleteManagingCommitteeRecord: (id) =>
 set((state) => {
 const existingList = state.managingCommitteesList || [];
 const newList = existingList.filter(c => c.id !== id);
 
 let updatedCurrent = state.managingCommittee;
 if (updatedCurrent?.id === id) {
 updatedCurrent = newList.length > 0 ? newList[0] : defaultManagingCommittee;
 }
 
 return {
 managingCommittee: updatedCurrent,
 managingCommitteesList: newList,
 };
 }),

  masterBanks: defaultMasterBanks,
  addMasterBank: (bank) => {
    const newBank: BankMasterItem = {
      ...bank,
      id: 'bank_custom_' + Date.now(),
      branches: bank.branches || [],
      isCustom: true,
    };
    set((state) => ({
      masterBanks: [...(state.masterBanks || defaultMasterBanks), newBank],
    }));
    return newBank;
  },
  updateMasterBank: (id, bankData) =>
    set((state) => ({
      masterBanks: (state.masterBanks || defaultMasterBanks).map((b) =>
        b.id === id ? { ...b, ...bankData } : b
      ),
    })),
  deleteMasterBank: (id) =>
    set((state) => ({
      masterBanks: (state.masterBanks || defaultMasterBanks).filter((b) => b.id !== id),
    })),
  addMasterBranch: (bankId, branchData) => {
    const newBranch: BankBranchItem = {
      ...branchData,
      id: 'br_custom_' + Date.now(),
      bankId,
      isCustom: true,
    };
    set((state) => ({
      masterBanks: (state.masterBanks || defaultMasterBanks).map((b) =>
        b.id === bankId
          ? { ...b, branches: [...(b.branches || []), newBranch] }
          : b
      ),
    }));
    return newBranch;
  },
  updateMasterBranch: (bankId, branchId, branchData) =>
    set((state) => ({
      masterBanks: (state.masterBanks || defaultMasterBanks).map((b) =>
        b.id === bankId
          ? {
              ...b,
              branches: (b.branches || []).map((br) =>
                br.id === branchId ? { ...br, ...branchData } : br
              ),
            }
          : b
      ),
    })),
  deleteMasterBranch: (bankId, branchId) =>
    set((state) => ({
      masterBanks: (state.masterBanks || defaultMasterBanks).map((b) =>
        b.id === bankId
          ? {
              ...b,
              branches: (b.branches || []).filter((br) => br.id !== branchId),
            }
          : b
      ),
    })),
  resetMasterBanks: () =>
    set(() => ({
      masterBanks: defaultMasterBanks,
    })),

 classTeacherAssignments: initialClassTeacherAssignments,
 addClassTeacherAssignment: (assignment) =>
 set((state) => {
 const next = [assignment, ...(state.classTeacherAssignments || [])];
 safePersist('classTeacherAssignments', 'sync', syncClassTeacherAssignmentsToDexie(next));
 return { classTeacherAssignments: next };
 }),
 updateClassTeacherAssignment: (id, data) =>
 set((state) => {
 const next = (state.classTeacherAssignments || []).map(a =>
 a.id === id ? { ...a, ...data } : a
 );
 safePersist('classTeacherAssignments', 'sync', syncClassTeacherAssignmentsToDexie(next));
 return { classTeacherAssignments: next };
 }),
 deleteClassTeacherAssignment: (id) =>
 set((state) => {
 const next = (state.classTeacherAssignments || []).filter(a => a.id !== id);
 safePersist('general', 'delete', db.classTeacherAssignments.delete(id));
 return { classTeacherAssignments: next };
 }),
 bulkAddClassTeacherAssignments: (assignments) =>
 set((state) => {
 const next = [...assignments, ...(state.classTeacherAssignments || [])];
 safePersist('classTeacherAssignments', 'sync', syncClassTeacherAssignmentsToDexie(next));
 return { classTeacherAssignments: next };
 }),

 subjectTeacherAssignments: initialSubjectTeacherAssignments,
 addSubjectTeacherAssignment: (assignment) =>
 set((state) => {
 const next = [assignment, ...(state.subjectTeacherAssignments || [])];
 safePersist('subjectTeacherAssignments', 'sync', syncSubjectTeacherAssignmentsToDexie(next));
 return { subjectTeacherAssignments: next };
 }),
 updateSubjectTeacherAssignment: (id, data) =>
 set((state) => {
 const next = (state.subjectTeacherAssignments || []).map(a =>
 a.id === id ? { ...a, ...data } : a
 );
 safePersist('subjectTeacherAssignments', 'sync', syncSubjectTeacherAssignmentsToDexie(next));
 return { subjectTeacherAssignments: next };
 }),
 deleteSubjectTeacherAssignment: (id) =>
 set((state) => {
 const next = (state.subjectTeacherAssignments || []).filter(a => a.id !== id);
 safePersist('general', 'delete', db.subjectTeacherAssignments.delete(id));
 return { subjectTeacherAssignments: next };
 }),
 bulkAddSubjectTeacherAssignments: (assignments) =>
 set((state) => {
 const next = [...assignments, ...(state.subjectTeacherAssignments || [])];
 safePersist('subjectTeacherAssignments', 'sync', syncSubjectTeacherAssignmentsToDexie(next));
 return { subjectTeacherAssignments: next };
 }),

 payrollMonthlySheets: initialSamplePayroll,
 addPayrollSheet: (sheet) =>
 set((state) => {
 const next = [sheet, ...(state.payrollMonthlySheets || [])];
 safePersist('payroll', 'sync', syncPayrollSheetsToDexie(next));
 return { payrollMonthlySheets: next };
 }),
 updatePayrollSheet: (id, data) =>
 set((state) => {
 const next = (state.payrollMonthlySheets || []).map(p =>
 p.id === id ? { ...p, ...data } : p
 );
 safePersist('payroll', 'sync', syncPayrollSheetsToDexie(next));
 return { payrollMonthlySheets: next };
 }),
 deletePayrollSheet: (id) =>
 set((state) => {
 const next = (state.payrollMonthlySheets || []).filter(p => p.id !== id);
 safePersist('general', 'delete', db.payrollMonthlySheets.delete(id));
 return { payrollMonthlySheets: next };
 }),

 financialTransactions: (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test') || import.meta.env?.DEV ? INITIAL_FINANCE_TRANSACTIONS : [],
 addFinancialTransaction: (tx) => {
 assertPermission('finance:create', 'Create Financial Transaction');
 set((state) => {
 const next = [tx, ...(state.financialTransactions || [])];
 safePersist('finance', 'sync', syncFinancialTransactionToDexie(tx));
 return { financialTransactions: next };
 });
 },
 updateFinancialTransaction: (id, data) =>
 set((state) => {
 const next = (state.financialTransactions || []).map(t =>
 t.id === id ? { ...t, ...data } : t
 );
 const updated = next.find(t => t.id === id);
 if (updated) safePersist('finance', 'sync', syncFinancialTransactionToDexie(updated));
 return { financialTransactions: next };
 }),
 deleteFinancialTransaction: (id) => {
 assertPermission('finance:delete', 'Delete Financial Transaction');
 set((state) => {
 const next = (state.financialTransactions || []).filter(t => t.id !== id);
 safePersist('finance', 'delete', deleteFinancialTransactionFromDexie(id));
 return { financialTransactions: next };
 });
 },
 bulkAddFinancialTransactions: (txs) =>
 set((state) => {
 const next = [...txs, ...(state.financialTransactions || [])];
 safePersist('finance', 'sync', syncFinancialTransactionsToDexie(txs));
 return { financialTransactions: next };
 }),

 academicSessions: defaultSessions,
 addAcademicSession: (sess) => {
 safePersist('academicSessions', 'sync', syncSessionToDexie(sess));
 set((state) => {
   const next = [...(state.academicSessions || defaultSessions), sess];
   DatabaseProvider.saveSettings('academicSessions', next).catch(e => console.warn('Desktop session sync error:', e));
   return { academicSessions: next };
 });
 },
 updateAcademicSession: (id, data) =>
 set((state) => {
 const currentSessions = state.academicSessions || defaultSessions;
 const oldSess = currentSessions.find(s => s.id === id);
 const newSessions = currentSessions.map((s) => (s.id === id ? { ...s, ...data } : s));
 const primaryName = data.name || (oldSess ? oldSess.name : '');

 // Cascade session update to students
 const updatedStudents = (state.students || []).map(s => {
 const isTarget = s.sessionId === id || (oldSess && (s.session === oldSess.name || s.session === oldSess.nameBn));
 if (isTarget) {
 return {
 ...s,
 sessionId: id,
 session: primaryName || s.session
 };
 }
 return s;
 });

 // Cascade session update to exam results
 const updatedResults = (state.examResults || []).map(res => {
 const isTarget = res.sessionId === id || (oldSess && (res.session === oldSess.name || res.session === oldSess.nameBn));
 if (isTarget) {
 return {
 ...res,
 sessionId: id,
 session: primaryName || res.session
 };
 }
 return res;
 });

 safePersist('academicSessions', 'sync', syncSessionsToDexie(newSessions));
 safePersist('students', 'sync', syncStudentsToDexie(updatedStudents));
 safePersist('examResults', 'sync', syncExamResultsToDexie(updatedResults));
 DatabaseProvider.saveSettings('academicSessions', newSessions).catch(e => console.warn('Desktop session sync error:', e));

 return {
 academicSessions: newSessions,
 students: updatedStudents,
 examResults: updatedResults
 };
 }),
 deleteAcademicSession: (id) => {
 safePersist('academicSessions', 'delete', deleteSessionFromDexie(id));
 set((state) => {
   const next = (state.academicSessions || defaultSessions).filter((s) => s.id !== id);
   DatabaseProvider.saveSettings('academicSessions', next).catch(e => console.warn('Desktop session sync error:', e));
   return { academicSessions: next };
 });
 },
 setDefaultSession: (id) =>
 set((state) => {
 const next = (state.academicSessions || defaultSessions).map((s) => ({ ...s, isDefault: s.id === id }));
 safePersist('academicSessions', 'sync', syncSessionsToDexie(next));
 DatabaseProvider.saveSettings('academicSessions', next).catch(e => console.warn('Desktop session sync error:', e));
 return { academicSessions: next };
 }),

 admissionYears: defaultAdmissionYears,
 addAdmissionYear: (yr) => {
 safePersist('admissionYears', 'sync', syncAdmissionYearToDexie(yr));
 set((state) => {
   const next = [...(state.admissionYears || defaultAdmissionYears), yr];
   DatabaseProvider.saveSettings('admissionYears', next).catch(e => console.warn('Desktop year sync error:', e));
   return { admissionYears: next };
 });
 },
 updateAdmissionYear: (id, data) =>
 set((state) => {
 const currentYears = state.admissionYears || defaultAdmissionYears;
 const oldYr = currentYears.find((y) => y.id === id);
 const newYears = currentYears.map((y) => (y.id === id ? { ...y, ...data } : y));
 const primaryYear = data.year || (oldYr ? oldYr.year : '');

 const updatedStudents = (state.students || []).map((s) => {
 if (oldYr && (s.year === oldYr.year || s.year === oldYr.yearBn)) {
 return {
 ...s,
 year: primaryYear || s.year,
 };
 }
 return s;
 });

 safePersist('admissionYears', 'sync', syncAdmissionYearsToDexie(newYears));
 safePersist('students', 'sync', syncStudentsToDexie(updatedStudents));
 DatabaseProvider.saveSettings('admissionYears', newYears).catch(e => console.warn('Desktop year sync error:', e));

 return {
 admissionYears: newYears,
 students: updatedStudents,
 };
 }),
 deleteAdmissionYear: (id) => {
 safePersist('admissionYears', 'delete', deleteAdmissionYearFromDexie(id));
 set((state) => {
   const next = (state.admissionYears || defaultAdmissionYears).filter((y) => y.id !== id);
   DatabaseProvider.saveSettings('admissionYears', next).catch(e => console.warn('Desktop year sync error:', e));
   return { admissionYears: next };
 });
 },
 setDefaultAdmissionYear: (id) =>
 set((state) => {
 const next = (state.admissionYears || defaultAdmissionYears).map((y) => ({ ...y, isDefault: y.id === id }));
 safePersist('admissionYears', 'sync', syncAdmissionYearsToDexie(next));
 DatabaseProvider.saveSettings('admissionYears', next).catch(e => console.warn('Desktop year sync error:', e));
 return { admissionYears: next };
 }),

 academicClasses: defaultClasses,
 addAcademicClass: (cls) => {
 safePersist('academicClasses', 'sync', syncClassToDexie(cls));
 set((state) => {
   const next = [...(state.academicClasses || defaultClasses), cls];
   DatabaseProvider.saveSettings('academicClasses', next).catch(e => console.warn('Desktop classes sync error:', e));
   return { academicClasses: next };
 });
 },
 updateAcademicClass: (id, data) => 
 set((state) => {
 const currentClasses = state.academicClasses || defaultClasses;
 const oldCls = currentClasses.find(c => c.id === id);
 const newClasses = currentClasses.map((c) => (c.id === id ? { ...c, ...data } : c));
 const newName = data.name || (oldCls ? oldCls.name : '');
 const newNameBn = data.nameBn || (oldCls ? oldCls.nameBn : '');
 const primaryName = newName || newNameBn;

 // Cascade update to students
 const updatedStudents = (state.students || []).map(s => {
 const isTarget = s.classId === id || (oldCls && (s.class === oldCls.name || s.class === oldCls.nameBn));
 if (isTarget) {
 return {
 ...s,
 classId: id,
 class: primaryName || s.class
 };
 }
 return s;
 });

 // Cascade update to subjects
 const updatedSubjects = (state.subjects || []).map(sub => {
 const isTarget = sub.classId === id || (oldCls && (sub.className === oldCls.name || sub.className === oldCls.nameBn));
 if (isTarget) {
 return {
 ...sub,
 classId: id,
 className: primaryName || sub.className
 };
 }
 return sub;
 });

 // Cascade update to exam routines
 const updatedRoutines = (state.examRoutines || []).map(rt => {
 const isTarget = rt.classId === id || (oldCls && (rt.className === oldCls.name || rt.className === oldCls.nameBn));
 if (isTarget) {
 return {
 ...rt,
 classId: id,
 className: primaryName || rt.className
 };
 }
 return rt;
 });

 // Cascade update to exam results
 const updatedResults = (state.examResults || []).map(res => {
 const isTarget = res.classId === id || (oldCls && (res.className === oldCls.name || res.className === oldCls.nameBn));
 if (isTarget) {
 return {
 ...res,
 classId: id,
 className: primaryName || res.className
 };
 }
 return res;
 });

 safePersist('academicClasses', 'sync', syncClassesToDexie(newClasses));
 safePersist('students', 'sync', syncStudentsToDexie(updatedStudents));
 safePersist('examResults', 'sync', syncExamResultsToDexie(updatedResults));
 DatabaseProvider.saveSettings('academicClasses', newClasses).catch(e => console.warn('Desktop classes sync error:', e));

 return {
 academicClasses: newClasses,
 students: updatedStudents,
 subjects: updatedSubjects,
 examRoutines: updatedRoutines,
 examResults: updatedResults
 };
 }),
 deleteAcademicClass: (id) => {
 safePersist('academicClasses', 'delete', deleteClassFromDexie(id));
 set((state) => {
   const next = (state.academicClasses || defaultClasses).filter((c) => c.id !== id);
   DatabaseProvider.saveSettings('academicClasses', next).catch(e => console.warn('Desktop classes sync error:', e));
   return { academicClasses: next };
 });
 },
 setDefaultClass: (id) =>
 set((state) => {
 const next = (state.academicClasses || defaultClasses).map((c) => ({ ...c, isDefault: c.id === id }));
 safePersist('academicClasses', 'sync', syncClassesToDexie(next));
 DatabaseProvider.saveSettings('academicClasses', next).catch(e => console.warn('Desktop classes sync error:', e));
 return { academicClasses: next };
 }),

 academicGroups: defaultGroups,
 addAcademicGroup: (grp) => {
 safePersist('academicGroups', 'sync', syncGroupToDexie(grp));
 set((state) => {
   const next = [...(state.academicGroups || defaultGroups), grp];
   DatabaseProvider.saveSettings('academicGroups', next).catch(e => console.warn('Desktop group sync error:', e));
   return { academicGroups: next };
 });
 },
 updateAcademicGroup: (id, data) =>
 set((state) => {
 const currentGroups = state.academicGroups || defaultGroups;
 const oldGrp = currentGroups.find(g => g.id === id);
 const newGroups = currentGroups.map((g) => (g.id === id ? { ...g, ...data } : g));
 const primaryName = data.name || (oldGrp ? oldGrp.name : '');

 // Cascade update to students
 const updatedStudents = (state.students || []).map(s => {
 const isTarget = s.groupId === id || (oldGrp && (s.group === oldGrp.name || s.group === oldGrp.nameBn));
 if (isTarget) {
 return {
 ...s,
 groupId: id,
 group: primaryName || s.group
 };
 }
 return s;
 });

 // Cascade update to subjects
 const updatedSubjects = (state.subjects || []).map(sub => {
 const isTarget = sub.groupId === id || (oldGrp && (sub.groupName === oldGrp.name || sub.groupName === oldGrp.nameBn));
 if (isTarget) {
 return {
 ...sub,
 groupId: id,
 groupName: primaryName || sub.groupName
 };
 }
 return sub;
 });

 // Cascade update to exam results
 const updatedResults = (state.examResults || []).map(res => {
 const isTarget = res.groupId === id || (oldGrp && (res.group === oldGrp.name || res.group === oldGrp.nameBn));
 if (isTarget) {
 return {
 ...res,
 groupId: id,
 group: primaryName || res.group
 };
 }
 return res;
 });

 safePersist('academicGroups', 'sync', syncGroupsToDexie(newGroups));
 safePersist('students', 'sync', syncStudentsToDexie(updatedStudents));
 safePersist('examResults', 'sync', syncExamResultsToDexie(updatedResults));
 DatabaseProvider.saveSettings('academicGroups', newGroups).catch(e => console.warn('Desktop group sync error:', e));
 if (updatedStudents.length > 0) {
   DatabaseProvider.bulkInsertOrReplace('students', updatedStudents).catch(e => console.warn('Desktop students group cascade sync error:', e));
 }

 return {
 academicGroups: newGroups,
 students: updatedStudents,
 subjects: updatedSubjects,
 examResults: updatedResults
 };
 }),
 deleteAcademicGroup: (id) => {
 safePersist('academicGroups', 'delete', deleteGroupFromDexie(id));
 set((state) => {
   const next = (state.academicGroups || defaultGroups).filter((g) => g.id !== id);
   DatabaseProvider.saveSettings('academicGroups', next).catch(e => console.warn('Desktop group sync error:', e));
   return { academicGroups: next };
 });
 },
 setDefaultGroup: (id) =>
 set((state) => {
 const next = (state.academicGroups || defaultGroups).map((g) => ({ ...g, isDefault: g.id === id }));
 safePersist('academicGroups', 'sync', syncGroupsToDexie(next));
 DatabaseProvider.saveSettings('academicGroups', next).catch(e => console.warn('Desktop group sync error:', e));
 return { academicGroups: next };
 }),

 academicSections: defaultSections,
 addAcademicSection: (sec) => {
 safePersist('academicSections', 'sync', syncSectionToDexie(sec));
 set((state) => {
   const next = [...(state.academicSections || defaultSections), sec];
   DatabaseProvider.saveSettings('academicSections', next).catch(e => console.warn('Desktop section sync error:', e));
   return { academicSections: next };
 });
 },
 updateAcademicSection: (id, data) =>
 set((state) => {
 const currentSections = state.academicSections || defaultSections;
 const oldSec = currentSections.find(s => s.id === id);
 const newSections = currentSections.map((s) => (s.id === id ? { ...s, ...data } : s));
 const primaryName = data.name || (oldSec ? oldSec.name : '');

 // Cascade update to students
 const updatedStudents = (state.students || []).map(s => {
 const isTarget = s.sectionId === id || (oldSec && (s.section === oldSec.name || s.section === oldSec.nameBn));
 if (isTarget) {
 return {
 ...s,
 sectionId: id,
 section: primaryName || s.section
 };
 }
 return s;
 });

 safePersist('academicSections', 'sync', syncSectionsToDexie(newSections));
 safePersist('students', 'sync', syncStudentsToDexie(updatedStudents));
 DatabaseProvider.saveSettings('academicSections', newSections).catch(e => console.warn('Desktop section sync error:', e));
 if (updatedStudents.length > 0) {
   DatabaseProvider.bulkInsertOrReplace('students', updatedStudents).catch(e => console.warn('Desktop students section cascade sync error:', e));
 }

 return {
 academicSections: newSections,
 students: updatedStudents
 };
 }),
 deleteAcademicSection: (id) => {
 safePersist('academicSections', 'delete', deleteSectionFromDexie(id));
 set((state) => {
   const next = (state.academicSections || defaultSections).filter((s) => s.id !== id);
   DatabaseProvider.saveSettings('academicSections', next).catch(e => console.warn('Desktop section sync error:', e));
   return { academicSections: next };
 });
 },
 setDefaultSection: (id) =>
 set((state) => {
 const next = (state.academicSections || defaultSections).map((s) => ({ ...s, isDefault: s.id === id }));
 safePersist('academicSections', 'sync', syncSectionsToDexie(next));
 DatabaseProvider.saveSettings('academicSections', next).catch(e => console.warn('Desktop section sync error:', e));
 return { academicSections: next };
 }),

 testimonialSettings: defaultTestimonialSettings,
 updateTestimonialSettings: (settings) =>
 set((state) => ({
 testimonialSettings: { ...(state.testimonialSettings || defaultTestimonialSettings), ...settings }
 })),

 attestationSettings: defaultAttestationSettings,
 updateAttestationSettings: (settings) =>
 set((state) => ({
 attestationSettings: { ...(state.attestationSettings || defaultAttestationSettings), ...settings }
 })),

 staffIdCardSettings: defaultStaffIdCardSettings,
 updateStaffIdCardSettings: (settings) =>
 set((state) => ({
 staffIdCardSettings: { ...(state.staffIdCardSettings || defaultStaffIdCardSettings), ...settings }
 })),

 studentIdCardSettings: defaultStudentIdCardSettings,
 updateStudentIdCardSettings: (settings) =>
 set((state) => ({
 studentIdCardSettings: { ...(state.studentIdCardSettings || defaultStudentIdCardSettings), ...settings }
 })),

 systemFontSettings: defaultSystemFontSettings,
 updateSystemFontSettings: (settings) =>
 set((state) => ({
 systemFontSettings: { ...(state.systemFontSettings || defaultSystemFontSettings), ...settings }
 })),

 examTerms: defaultExamTerms,
 addExamTerm: (term) =>
 set((state) => ({ examTerms: [...(state.examTerms || defaultExamTerms), term] })),
 updateExamTerm: (id, data) =>
 set((state) => ({
 examTerms: (state.examTerms || defaultExamTerms).map((t) => (t.id === id ? { ...t, ...data } : t))
 })),
 deleteExamTerm: (id) =>
 set((state) => ({
 examTerms: (state.examTerms || defaultExamTerms).filter((t) => t.id !== id)
 })),
 setDefaultExamTerm: (id) =>
 set((state) => ({
 examTerms: (state.examTerms || defaultExamTerms).map((t) => ({ ...t, isDefault: t.id === id }))
 })),
 publishExamTerm: (id, policyVersion, publishedBy) =>
 set((state) => ({
 examTerms: (state.examTerms || defaultExamTerms).map((t) =>
   t.id === id ? { ...t, isPublished: true, publishedAt: new Date().toISOString(), policyVersion, publishedBy } : t
 )
 })),

 rooms: [],
 addRoom: (room) => set((state) => ({ rooms: [...(state.rooms || []), room] })),
 updateRoom: (id, room) => set((state) => ({ rooms: (state.rooms || []).map((r) => (r.id === id ? { ...r, ...room } : r)) })),
 deleteRoom: (id) => set((state) => ({ rooms: (state.rooms || []).filter((r) => r.id !== id) })),

 subjects: defaultSubjects,
 addSubject: (subj) =>
 set((state) => {
 const linked = linkSubjectIds(subj, { classes: state.academicClasses, groups: state.academicGroups });
 return { subjects: [...(state.subjects || defaultSubjects), linked] };
 }),
 updateSubject: (id, data) =>
 set((state) => ({
 subjects: (state.subjects || defaultSubjects).map((s) => {
 if (s.id === id) {
 return linkSubjectIds({ ...s, ...data }, { classes: state.academicClasses, groups: state.academicGroups });
 }
 return s;
 })
 })),
 deleteSubject: (id) =>
 set((state) => ({
 subjects: (state.subjects || defaultSubjects).filter((s) => s.id !== id)
 })),
 bulkAddSubjects: (subjs) =>
 set((state) => {
 const linked = subjs.map(s => linkSubjectIds(s, { classes: state.academicClasses, groups: state.academicGroups }));
 return { subjects: [...(state.subjects || defaultSubjects), ...linked] };
 }),

 // Master Subjects Directory (ID = Subject Code)
 masterSubjects: defaultMasterSubjects,
 addMasterSubject: (subject) =>
 set((state) => {
 const list = state.masterSubjects || defaultMasterSubjects;
 const exists = list.some(s => s.id === subject.id || s.code === subject.code);
 const next = exists 
 ? list.map(s => (s.id === subject.id || s.code === subject.code) ? { ...s, ...subject } : s)
 : [...list, subject];
 safePersist('masterSubjects', 'sync', syncMasterSubjectsToDexie(next));
 return { masterSubjects: next };
 }),
 updateMasterSubject: (id, data) =>
 set((state) => {
 const next = (state.masterSubjects || defaultMasterSubjects).map((s) =>
 s.id === id ? { ...s, ...data } : s
 );
 safePersist('masterSubjects', 'sync', syncMasterSubjectsToDexie(next));
 return { masterSubjects: next };
 }),
 deleteMasterSubject: (id) =>
 set((state) => {
 const next = (state.masterSubjects || defaultMasterSubjects).filter((s) => s.id !== id);
 safePersist('general', 'delete', db.masterSubjects.delete(id));
 return { masterSubjects: next };
 }),
 resetMasterSubjects: () =>
 set(() => {
 safePersist('masterSubjects', 'sync', syncMasterSubjectsToDexie(defaultMasterSubjects));
 return { masterSubjects: defaultMasterSubjects };
 }),

 // Curriculums (Frameworks)
 curriculums: defaultCurriculums,
 addCurriculum: (curriculum) =>
 set((state) => {
 const next = [...(state.curriculums || defaultCurriculums), curriculum];
 safePersist('curriculums', 'sync', syncCurriculumsToDexie(next));
 return { curriculums: next };
 }),
 updateCurriculum: (id, data) =>
 set((state) => {
 const next = (state.curriculums || defaultCurriculums).map((c) =>
 c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
 );
 safePersist('curriculums', 'sync', syncCurriculumsToDexie(next));
 return { curriculums: next };
 }),
 deleteCurriculum: (id) =>
 set((state) => {
 const next = (state.curriculums || defaultCurriculums).filter((c) => c.id !== id);
 safePersist('general', 'delete', db.curriculums.delete(id));
 return { curriculums: next };
 }),
 setDefaultCurriculum: (id) =>
 set((state) => {
 const next = (state.curriculums || defaultCurriculums).map((c) => ({
 ...c,
 isDefault: c.id === id
 }));
 safePersist('curriculums', 'sync', syncCurriculumsToDexie(next));
 return { curriculums: next };
 }),

 // Curriculum Subject Mappings (Class-wise)
 curriculumMappings: defaultCurriculumMappings,
 addCurriculumMapping: (mapping) =>
 set((state) => {
 const list = state.curriculumMappings || defaultCurriculumMappings;
 const exists = list.some(m => m.id === mapping.id);
 const next = exists ? list.map(m => m.id === mapping.id ? { ...m, ...mapping } : m) : [...list, mapping];
 safePersist('curriculums', 'sync', syncCurriculumMappingsToDexie(next));
 
 // Keep subjects in sync with curriculum
 const activeCurr = (state.curriculums || defaultCurriculums).find(c => c.isDefault)?.id || defaultCurriculumId;
 const relevantMappings = next.filter(m => m.curriculumId === activeCurr);
 const syncedSubjects = relevantMappings.map(m => linkSubjectIds({
 id: m.id,
 code: m.subjectCode,
 name: m.name,
 nameBn: m.nameBn,
 classId: m.classId,
 className: m.className,
 fullMarks: m.fullMarks,
 passMarks: m.passMarks,
 cqMarks: m.cqMarks,
 mcqMarks: m.mcqMarks,
 practicalMarks: m.practicalMarks,
 continuousMarks: m.continuousMarks,
 isOptional: m.isOptional || m.subjectType === 'optional_4th' || m.subjectType === 'continuous_assessment',
 isActive: true,
 groupName: m.groupName,
 passLogic: m.passLogic || 'individual_separator',
 cqMcqPassType: m.cqMcqPassType || (m.passLogic === 'individual_separator' ? 'separate' : 'combined'),
 paperPassType: m.paperPassType || ((m.combinedWithSubjectCode || m.combinedWithCode) ? 'combined' : undefined),
 combinedWithSubjectCode: m.combinedWithSubjectCode || m.combinedWithCode,
 combinedWithCode: m.combinedWithCode || m.combinedWithSubjectCode,
 combinedTotalMarks: m.combinedTotalMarks,
 combinedPassMarks: m.combinedPassMarks,
 combinedCqTotal: m.combinedCqTotal,
 combinedCqPass: m.combinedCqPass,
 grossPassNoteBn: m.grossPassNoteBn
 }, { classes: state.academicClasses, groups: state.academicGroups }));

 return { curriculumMappings: next, subjects: syncedSubjects };
 }),
 updateCurriculumMapping: (id, data) =>
 set((state) => {
 const next = (state.curriculumMappings || defaultCurriculumMappings).map((m) =>
 m.id === id ? { ...m, ...data } : m
 );
 safePersist('curriculums', 'sync', syncCurriculumMappingsToDexie(next));
 
 const activeCurr = (state.curriculums || defaultCurriculums).find(c => c.isDefault)?.id || defaultCurriculumId;
 const relevantMappings = next.filter(m => m.curriculumId === activeCurr);
 const syncedSubjects = relevantMappings.map(m => linkSubjectIds({
 id: m.id,
 code: m.subjectCode,
 name: m.name,
 nameBn: m.nameBn,
 classId: m.classId,
 className: m.className,
 fullMarks: m.fullMarks,
 passMarks: m.passMarks,
 cqMarks: m.cqMarks,
 mcqMarks: m.mcqMarks,
 practicalMarks: m.practicalMarks,
 continuousMarks: m.continuousMarks,
 isOptional: m.isOptional || m.subjectType === 'optional_4th' || m.subjectType === 'continuous_assessment',
 isActive: true,
 groupName: m.groupName,
 passLogic: m.passLogic || 'individual_separator',
 cqMcqPassType: m.cqMcqPassType || (m.passLogic === 'individual_separator' ? 'separate' : 'combined'),
 paperPassType: m.paperPassType || ((m.combinedWithSubjectCode || m.combinedWithCode) ? 'combined' : undefined),
 combinedWithSubjectCode: m.combinedWithSubjectCode || m.combinedWithCode,
 combinedWithCode: m.combinedWithCode || m.combinedWithSubjectCode,
 combinedTotalMarks: m.combinedTotalMarks,
 combinedPassMarks: m.combinedPassMarks,
 combinedCqTotal: m.combinedCqTotal,
 combinedCqPass: m.combinedCqPass,
 grossPassNoteBn: m.grossPassNoteBn
 }, { classes: state.academicClasses, groups: state.academicGroups }));

 return { curriculumMappings: next, subjects: syncedSubjects };
 }),
 deleteCurriculumMapping: (id) =>
 set((state) => {
 const next = (state.curriculumMappings || defaultCurriculumMappings).filter((m) => m.id !== id);
 safePersist('general', 'delete', db.curriculumMappings.delete(id));
 
 const activeCurr = (state.curriculums || defaultCurriculums).find(c => c.isDefault)?.id || defaultCurriculumId;
 const relevantMappings = next.filter(m => m.curriculumId === activeCurr);
 const syncedSubjects = relevantMappings.map(m => linkSubjectIds({
 id: m.id,
 code: m.subjectCode,
 name: m.name,
 nameBn: m.nameBn,
 classId: m.classId,
 className: m.className,
 fullMarks: m.fullMarks,
 passMarks: m.passMarks,
 cqMarks: m.cqMarks,
 mcqMarks: m.mcqMarks,
 practicalMarks: m.practicalMarks,
 continuousMarks: m.continuousMarks,
 isOptional: m.isOptional || m.subjectType === 'optional_4th' || m.subjectType === 'continuous_assessment',
 isActive: true,
 groupName: m.groupName,
 passLogic: m.passLogic || 'individual_separator',
 cqMcqPassType: m.cqMcqPassType || (m.passLogic === 'individual_separator' ? 'separate' : 'combined'),
 paperPassType: m.paperPassType || ((m.combinedWithSubjectCode || m.combinedWithCode) ? 'combined' : undefined),
 combinedWithSubjectCode: m.combinedWithSubjectCode || m.combinedWithCode,
 combinedWithCode: m.combinedWithCode || m.combinedWithSubjectCode,
 combinedTotalMarks: m.combinedTotalMarks,
 combinedPassMarks: m.combinedPassMarks,
 combinedCqTotal: m.combinedCqTotal,
 combinedCqPass: m.combinedCqPass,
 grossPassNoteBn: m.grossPassNoteBn
 }, { classes: state.academicClasses, groups: state.academicGroups }));

 return { curriculumMappings: next, subjects: syncedSubjects };
 }),
 bulkAddCurriculumMappings: (mappings) =>
 set((state) => {
 const current = state.curriculumMappings || defaultCurriculumMappings;
 const mapById = new Map(current.map(m => [m.id, m]));
 mappings.forEach(m => mapById.set(m.id, m));
 const next = Array.from(mapById.values());
 safePersist('curriculums', 'sync', syncCurriculumMappingsToDexie(next));
 
 const activeCurr = (state.curriculums || defaultCurriculums).find(c => c.isDefault)?.id || defaultCurriculumId;
 const relevantMappings = next.filter(m => m.curriculumId === activeCurr);
 const syncedSubjects = relevantMappings.map(m => linkSubjectIds({
 id: m.id,
 code: m.subjectCode,
 name: m.name,
 nameBn: m.nameBn,
 classId: m.classId,
 className: m.className,
 fullMarks: m.fullMarks,
 passMarks: m.passMarks,
 cqMarks: m.cqMarks,
 mcqMarks: m.mcqMarks,
 practicalMarks: m.practicalMarks,
 continuousMarks: m.continuousMarks,
 isOptional: m.isOptional || m.subjectType === 'optional_4th' || m.subjectType === 'continuous_assessment',
 isActive: true,
 groupName: m.groupName,
 passLogic: m.passLogic || 'individual_separator',
 cqMcqPassType: m.cqMcqPassType || (m.passLogic === 'individual_separator' ? 'separate' : 'combined'),
 paperPassType: m.paperPassType || ((m.combinedWithSubjectCode || m.combinedWithCode) ? 'combined' : undefined),
 combinedWithSubjectCode: m.combinedWithSubjectCode || m.combinedWithCode,
 combinedWithCode: m.combinedWithCode || m.combinedWithSubjectCode,
 combinedTotalMarks: m.combinedTotalMarks,
 combinedPassMarks: m.combinedPassMarks,
 combinedCqTotal: m.combinedCqTotal,
 combinedCqPass: m.combinedCqPass,
 grossPassNoteBn: m.grossPassNoteBn
 }, { classes: state.academicClasses, groups: state.academicGroups }));

 return { curriculumMappings: next, subjects: syncedSubjects };
 }),
 cloneCurriculumClassMappings: (sourceClassId, targetClassId, curriculumId) =>
  set((state) => {
    const current = state.curriculumMappings || [];
    const targetClass = (state.academicClasses || []).find(c => c.id === targetClassId);
    const sourceItems = current.filter(m => m.classId === sourceClassId && (!curriculumId || m.curriculumId === curriculumId));
    if (sourceItems.length === 0 || !targetClass) return state;
    
    const cleanTarget = targetClass.id.replace(/[^0-9a-zA-Z]/g, '');
    const newItems = sourceItems.map(item => ({
      ...item,
      id: `csm_${item.curriculumId}_c${cleanTarget}_${item.subjectCode}`,
      classId: targetClass.id,
      className: targetClass.name
    }));
    
    const existingNonTarget = current.filter(m => !(m.classId === targetClassId && (!curriculumId || m.curriculumId === curriculumId)));
    const next = [...existingNonTarget, ...newItems];
    safePersist('curriculums', 'sync', syncCurriculumMappingsToDexie(next));
 
 const activeCurr = curriculumId || (state.curriculums || defaultCurriculums).find(c => c.isDefault)?.id || defaultCurriculumId;
 const relevantMappings = next.filter(m => m.curriculumId === activeCurr);
 const syncedSubjects = relevantMappings.map(m => linkSubjectIds({
 id: m.id,
 code: m.subjectCode,
 name: m.name,
 nameBn: m.nameBn,
 classId: m.classId,
 className: m.className,
 fullMarks: m.fullMarks,
 passMarks: m.passMarks,
 cqMarks: m.cqMarks,
 mcqMarks: m.mcqMarks,
 practicalMarks: m.practicalMarks,
 continuousMarks: m.continuousMarks,
 isOptional: m.isOptional || m.subjectType === 'optional_4th' || m.subjectType === 'continuous_assessment',
 isActive: true,
 groupName: m.groupName,
 passLogic: m.passLogic || 'individual_separator',
 cqMcqPassType: m.cqMcqPassType || (m.passLogic === 'individual_separator' ? 'separate' : 'combined'),
 paperPassType: m.paperPassType || ((m.combinedWithSubjectCode || m.combinedWithCode) ? 'combined' : undefined),
 combinedWithSubjectCode: m.combinedWithSubjectCode || m.combinedWithCode,
 combinedWithCode: m.combinedWithCode || m.combinedWithSubjectCode,
 combinedTotalMarks: m.combinedTotalMarks,
 combinedPassMarks: m.combinedPassMarks,
 combinedCqTotal: m.combinedCqTotal,
 combinedCqPass: m.combinedCqPass,
 grossPassNoteBn: m.grossPassNoteBn
 }, { classes: state.academicClasses, groups: state.academicGroups }));

 return { curriculumMappings: next, subjects: syncedSubjects };
 }),
 resetCurriculumToDefault: () =>
 set((state) => {
 safePersist('curriculums', 'sync', syncCurriculumsToDexie(defaultCurriculums));
 safePersist('masterSubjects', 'sync', syncMasterSubjectsToDexie(defaultMasterSubjects));
 safePersist('curriculums', 'sync', syncCurriculumMappingsToDexie(defaultCurriculumMappings));
 
 const syncedSubjects = defaultCurriculumMappings.map(m => linkSubjectIds({
 id: m.id,
 code: m.subjectCode,
 name: m.name,
 nameBn: m.nameBn,
 classId: m.classId,
 className: m.className,
 fullMarks: m.fullMarks,
 passMarks: m.passMarks,
 cqMarks: m.cqMarks,
 mcqMarks: m.mcqMarks,
 practicalMarks: m.practicalMarks,
 continuousMarks: m.continuousMarks,
 isOptional: m.isOptional || m.subjectType === 'optional_4th' || m.subjectType === 'continuous_assessment',
 isActive: true,
 groupName: m.groupName,
 passLogic: m.passLogic || 'individual_separator',
 cqMcqPassType: m.cqMcqPassType || (m.passLogic === 'individual_separator' ? 'separate' : 'combined'),
 paperPassType: m.paperPassType || ((m.combinedWithSubjectCode || m.combinedWithCode) ? 'combined' : undefined),
 combinedWithSubjectCode: m.combinedWithSubjectCode || m.combinedWithCode,
 combinedWithCode: m.combinedWithCode || m.combinedWithSubjectCode,
 combinedTotalMarks: m.combinedTotalMarks,
 combinedPassMarks: m.combinedPassMarks,
 combinedCqTotal: m.combinedCqTotal,
 combinedCqPass: m.combinedCqPass,
 grossPassNoteBn: m.grossPassNoteBn
 }, { classes: state.academicClasses, groups: state.academicGroups }));

 return {
 curriculums: defaultCurriculums,
 masterSubjects: defaultMasterSubjects,
 curriculumMappings: defaultCurriculumMappings,
 subjects: syncedSubjects
 };
 }),
 syncCurriculumToExamSubjects: (curriculumId) =>
 set((state) => {
 const activeCurr = curriculumId || (state.curriculums || defaultCurriculums).find(c => c.isDefault)?.id || defaultCurriculumId;
 const mappings = (state.curriculumMappings || defaultCurriculumMappings).filter(m => m.curriculumId === activeCurr);
 if (mappings.length === 0) return state;

 const newSubjects: SubjectItem[] = mappings.map(m => ({
 id: m.id,
 code: m.subjectCode,
 name: m.name,
 nameBn: m.nameBn,
 classId: m.classId,
 className: m.className,
 fullMarks: m.fullMarks,
 passMarks: m.passMarks,
 cqMarks: m.cqMarks,
 mcqMarks: m.mcqMarks,
 practicalMarks: m.practicalMarks,
 continuousMarks: m.continuousMarks,
 isOptional: m.isOptional || m.subjectType === 'optional_4th' || m.subjectType === 'continuous_assessment',
 isActive: true,
 groupName: m.groupName,
 passLogic: m.passLogic || 'individual_separator',
 cqMcqPassType: m.cqMcqPassType || (m.passLogic === 'individual_separator' ? 'separate' : 'combined'),
 paperPassType: m.paperPassType || ((m.combinedWithSubjectCode || m.combinedWithCode) ? 'combined' : undefined),
 combinedWithSubjectCode: m.combinedWithSubjectCode || m.combinedWithCode,
 combinedWithCode: m.combinedWithCode || m.combinedWithSubjectCode,
 combinedTotalMarks: m.combinedTotalMarks,
 combinedPassMarks: m.combinedPassMarks,
 combinedCqTotal: m.combinedCqTotal,
 combinedCqPass: m.combinedCqPass,
 grossPassNoteBn: m.grossPassNoteBn
 }));

 const linked = newSubjects.map(s => linkSubjectIds(s, { classes: state.academicClasses, groups: state.academicGroups }));
 return { subjects: linked };
 }),

 gradingRules: defaultGradingRules,
 updateGradingRule: (id, data) =>
 set((state) => ({
 gradingRules: (state.gradingRules || defaultGradingRules).map((g) => (g.id === id ? { ...g, ...data } : g))
 })),
 resetGradingRules: () =>
 set(() => ({ gradingRules: defaultGradingRules })),

 examRoutines: [],
  addExamRoutine: (item) =>
 set((state) => {
 const linked = linkExamRoutineIds(item, { classes: state.academicClasses, subjects: state.subjects });
 const next = [...(state.examRoutines || []), linked];
 safePersist('examRoutines', 'sync', syncExamRoutinesToDexie(next));
 return { examRoutines: next };
 }),
 updateExamRoutine: (id, data) =>
 set((state) => {
 const next = (state.examRoutines || []).map((r) => {
 if (r.id === id) {
 return linkExamRoutineIds({ ...r, ...data }, { classes: state.academicClasses, subjects: state.subjects });
 }
 return r;
 });
 safePersist('examRoutines', 'sync', syncExamRoutinesToDexie(next));
 return { examRoutines: next };
 }),
 deleteExamRoutine: (id) =>
 set((state) => {
 const next = (state.examRoutines || []).filter((r) => r.id !== id);
 safePersist('general', 'delete', db.examRoutines.delete(id));
 return { examRoutines: next };
 }),
 bulkAddExamRoutines: (items) =>
 set((state) => {
 const linked = items.map(r => linkExamRoutineIds(r, { classes: state.academicClasses, subjects: state.subjects }));
 const next = [...(state.examRoutines || []), ...linked];
 safePersist('examRoutines', 'sync', syncExamRoutinesToDexie(next));
 return { examRoutines: next };
 }),

 admitCardSettings: defaultAdmitCardSettings,
 updateAdmitCardSettings: (settings) =>
 set((state) => ({
 admitCardSettings: { ...(state.admitCardSettings || defaultAdmitCardSettings), ...settings }
 })),
 
 examResults: [],
 addExamResult: (result) => {
 set((state) => {
 const linked = linkExamResultIds(result, { classes: state.academicClasses, groups: state.academicGroups, sessions: state.academicSessions });
 safePersist('examResults', 'sync', syncExamResultsToDexie([linked]));
 return { examResults: [linked, ...(state.examResults || [])] };
 });
 },
 updateExamResult: (id, data) => {
 set((state) => {
 const updatedResults = (state.examResults || []).map((r) => {
 if (r.id === id) {
 const updated = linkExamResultIds({ ...r, ...data }, { classes: state.academicClasses, groups: state.academicGroups, sessions: state.academicSessions });
 safePersist('examResults', 'sync', syncExamResultsToDexie([updated]));
 return updated;
 }
 return r;
 });
 return { examResults: updatedResults };
 });
 },
 deleteExamResult: (id) => {
 safePersist('examResults', 'delete', deleteExamResultsFromDexie([id]));
 set((state) => ({
 examResults: (state.examResults || []).filter((r) => r.id !== id),
 }));
 },
 bulkAddExamResults: (results) => {
 set((state) => {
 const linked = results.map(r => linkExamResultIds(r, { classes: state.academicClasses, groups: state.academicGroups, sessions: state.academicSessions }));
 safePersist('examResults', 'sync', syncExamResultsToDexie(linked));
 return { examResults: [...linked, ...(state.examResults || [])] };
 });
 },
 bulkUpdateExamResults: (results) => {
 set((state) => {
 const updatedMap = new Map((results || []).map(r => [r.id, r]));
 const updatedResults = (state.examResults || []).map(r => {
 const updated = updatedMap.get(r.id);
 if (updated) {
 return linkExamResultIds({ ...r, ...updated }, { classes: state.academicClasses, groups: state.academicGroups, sessions: state.academicSessions });
 }
 return r;
 });
 safePersist('examResults', 'sync', syncExamResultsToDexie(updatedResults));
 return { examResults: updatedResults };
 });
 },
 saveExamResults: (results) => {
 set((state) => {
 const linked = results.map(r => linkExamResultIds(r, { classes: state.academicClasses, groups: state.academicGroups, sessions: state.academicSessions }));
 const current = [...(state.examResults || [])];
 linked.forEach(res => {
 const idx = current.findIndex(r => r.id === res.id || (r.examId === res.examId && r.subjectId === res.subjectId && r.studentId === res.studentId));
 if (idx >= 0) {
 current[idx] = { ...current[idx], ...res };
 } else {
 current.unshift(res);
 }
 });
 safePersist('examResults', 'sync', syncExamResultsToDexie(current));
 return { examResults: current };
 });
 },
 bulkDeleteExamResults: (ids) => {
 safePersist('examResults', 'delete', deleteExamResultsFromDexie(ids));
 set((state) => {
 const idSet = new Set(ids);
 return {
 examResults: (state.examResults || []).filter((r) => !idSet.has(r.id)),
 };
 });
 },
 clearAllExamResults: () => {
 safePersist('general', 'clear', db.examResults.clear());
 set(() => ({
 examResults: [],
 }));
 },

 whiteLabel: { appName: '', appIcon: '', enabled: false },
 updateWhiteLabel: (data) => set((state) => ({ whiteLabel: { ...(state.whiteLabel || { appName: '', appIcon: '', enabled: false }), ...data } })),

 issuedTestimonials: [],
 addIssuedTestimonial: (test) => {
 assertPermission('testimonial:issue', 'Issue Testimonial');
 set((state) => {
 safePersist('testimonials', 'sync', syncTestimonialToDexie(test));
 return { issuedTestimonials: [test, ...(state.issuedTestimonials || [])] };
 });
 },
 updateIssuedTestimonial: (idOrTest, data) =>
 set((state) => {
 const id = typeof idOrTest === 'string' ? idOrTest : idOrTest.id;
 const updates = typeof idOrTest === 'string' ? (data || {}) : idOrTest;
 const updatedList = (state.issuedTestimonials || []).map((t) => {
 if (t.id === id) {
 const updated = { ...t, ...updates };
 safePersist('testimonials', 'sync', syncTestimonialToDexie(updated));
 return updated;
 }
 return t;
 });
 return { issuedTestimonials: updatedList };
 }),
 deleteIssuedTestimonial: (id) => {
 assertPermission('testimonial:delete', 'Delete Testimonial');
 set((state) => {
 safePersist('testimonials', 'delete', deleteTestimonialFromDexie(id));
 return {
 issuedTestimonials: (state.issuedTestimonials || []).filter((t) => t.id !== id)
 };
 });
 },

 savedProfessions: defaultProfessions,
 addSavedProfession: (prof) => set((state) => {
 const trimmed = prof.trim();
 if (!trimmed || (state.savedProfessions || defaultProfessions).includes(trimmed)) return state;
 return { savedProfessions: [...(state.savedProfessions || defaultProfessions), trimmed] };
 }),
 addProfession: (prof) => set((state) => {
 const trimmed = prof.trim();
 if (!trimmed || (state.savedProfessions || defaultProfessions).includes(trimmed)) return state;
 return { savedProfessions: [...(state.savedProfessions || defaultProfessions), trimmed] };
 }),
 updateSavedProfession: (oldProf, newProf) => set((state) => {
 const trimmed = newProf.trim();
 if (!trimmed) return state;
 return {
 savedProfessions: (state.savedProfessions || defaultProfessions).map(p => p === oldProf ? trimmed : p)
 };
 }),
 deleteSavedProfession: (prof) => set((state) => ({
 savedProfessions: (state.savedProfessions || defaultProfessions).filter(p => p !== prof)
 })),

 savedInstitutions: defaultPreviousInstitutions,
 addSavedInstitution: (inst) => set((state) => {
 const trimmed = inst.trim();
 if (!trimmed || (state.savedInstitutions || defaultPreviousInstitutions).includes(trimmed)) return state;
 return { savedInstitutions: [...(state.savedInstitutions || defaultPreviousInstitutions), trimmed] };
 }),
 addInstitution: (inst) => set((state) => {
 const trimmed = inst.trim();
 if (!trimmed || (state.savedInstitutions || defaultPreviousInstitutions).includes(trimmed)) return state;
 return { savedInstitutions: [...(state.savedInstitutions || defaultPreviousInstitutions), trimmed] };
 }),
 updateSavedInstitution: (oldInst, newInst) => set((state) => {
 const trimmed = newInst.trim();
 if (!trimmed) return state;
 return {
 savedInstitutions: (state.savedInstitutions || defaultPreviousInstitutions).map(i => i === oldInst ? trimmed : i)
 };
 }),
 deleteSavedInstitution: (inst) => set((state) => ({
 savedInstitutions: (state.savedInstitutions || defaultPreviousInstitutions).filter(i => i !== inst)
 })),

 savedBoards: defaultBoards,
 addSavedBoard: (board) => set((state) => {
 const trimmed = board.trim();
 if (!trimmed || (state.savedBoards || defaultBoards).includes(trimmed)) return state;
 return { savedBoards: [...(state.savedBoards || defaultBoards), trimmed] };
 }),
 addBoardOption: (board) => set((state) => {
 const trimmed = board.trim();
 if (!trimmed || (state.savedBoards || defaultBoards).includes(trimmed)) return state;
 return { savedBoards: [...(state.savedBoards || defaultBoards), trimmed] };
 }),
 updateSavedBoard: (oldBoard, newBoard) => set((state) => {
 const trimmed = newBoard.trim();
 if (!trimmed) return state;
 return {
 savedBoards: (state.savedBoards || defaultBoards).map(b => b === oldBoard ? trimmed : b)
 };
 }),
 deleteSavedBoard: (board) => set((state) => ({
 savedBoards: (state.savedBoards || defaultBoards).filter(b => b !== board)
 })),

 savedClasses: defaultPreviousClasses,
 addSavedClass: (cls) => set((state) => {
 const trimmed = cls.trim();
 if (!trimmed || (state.savedClasses || defaultPreviousClasses).includes(trimmed)) return state;
 return { savedClasses: [...(state.savedClasses || defaultPreviousClasses), trimmed] };
 }),
 addClassOption: (cls) => set((state) => {
 const trimmed = cls.trim();
 if (!trimmed || (state.savedClasses || defaultPreviousClasses).includes(trimmed)) return state;
 return { savedClasses: [...(state.savedClasses || defaultPreviousClasses), trimmed] };
 }),

 savedPassingYears: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'],
 addSavedPassingYear: (yr) => set((state) => {
 const trimmed = yr.trim();
 const years = state.savedPassingYears || ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];
 if (!trimmed || years.includes(trimmed)) return state;
 return { savedPassingYears: [trimmed, ...years] };
 }),
 addPassingYear: (yr) => set((state) => {
 const trimmed = yr.trim();
 const years = state.savedPassingYears || ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];
 if (!trimmed || years.includes(trimmed)) return state;
 return { savedPassingYears: [trimmed, ...years] };
 }),

 savedGuardianRelations: defaultGuardianRelations,
 addSavedGuardianRelation: (rel) => set((state) => {
 const trimmed = rel.trim();
 if (!trimmed || (state.savedGuardianRelations || defaultGuardianRelations).includes(trimmed)) return state;
 return { savedGuardianRelations: [...(state.savedGuardianRelations || defaultGuardianRelations), trimmed] };
 }),
 addGuardianRelation: (rel) => set((state) => {
 const trimmed = rel.trim();
 if (!trimmed || (state.savedGuardianRelations || defaultGuardianRelations).includes(trimmed)) return state;
 return { savedGuardianRelations: [...(state.savedGuardianRelations || defaultGuardianRelations), trimmed] };
 }),

 syncMasterDataFromStudents: () => set((state) => {
 const students = state.students || [];
 const currentLocs = [...(state.learnedLocations || [])];
 const currentProfessions = new Set(state.savedProfessions || defaultProfessions);
 const currentInstitutions = new Set(state.savedInstitutions || defaultPreviousInstitutions);
 const currentBoards = new Set(state.savedBoards || defaultBoards);

 students.forEach((s) => {
 if (s.fatherProfession && s.fatherProfession.trim()) currentProfessions.add(s.fatherProfession.trim());
 if (s.motherProfession && s.motherProfession.trim()) currentProfessions.add(s.motherProfession.trim());
 if (s.guardianProfession && s.guardianProfession.trim()) currentProfessions.add(s.guardianProfession.trim());
 if (s.prevSchoolName && s.prevSchoolName.trim()) currentInstitutions.add(s.prevSchoolName.trim());
 if (s.prevBoard && s.prevBoard.trim()) currentBoards.add(s.prevBoard.trim());
 if (s.board && s.board.trim()) currentBoards.add(s.board.trim());
 });

 // Ensure masterInstitutions also syncs with student previous schools
 const currentMasterInsts = [...(state.masterInstitutions || defaultMasterInstitutions)];
 const existingNames = new Set(
 currentMasterInsts.flatMap(i => [
 i.id.toLowerCase().trim(),
 i.name.toLowerCase().trim(),
 (i.nameBn || '').toLowerCase().trim()
 ])
 );

 students.forEach((s) => {
 if (s.prevSchoolName && s.prevSchoolName.trim()) {
 const cleanName = s.prevSchoolName.trim();
 if (!existingNames.has(cleanName.toLowerCase())) {
 existingNames.add(cleanName.toLowerCase());
 const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || Date.now().toString(36);
 currentMasterInsts.push({
 id: s.prevSchoolId || `inst_${slug}`,
 name: cleanName,
 nameBn: cleanName,
 });
 }
 }
 });

 return {
 learnedLocations: currentLocs,
 savedProfessions: Array.from(currentProfessions),
 savedInstitutions: Array.from(currentInstitutions),
 savedBoards: Array.from(currentBoards),
 masterInstitutions: currentMasterInsts,
 };
 }),

 exportBackupJSON: () => {
 assertPermission('backup:export', 'Export System Backup');
 const state = get();
 const exportData = {
      version: APP_VERSION,
      appName: 'Biddalok ERP',
 exportDate: new Date().toISOString(),
 institution: state.institution || defaultInstitution,
 students: state.students || [],
 staff: state.staff || [],
 academicSessions: state.academicSessions || defaultSessions,
 academicClasses: state.academicClasses || defaultClasses,
 academicGroups: state.academicGroups || defaultGroups,
 academicSections: state.academicSections || defaultSections,
 examResults: state.examResults || [],
 testimonialSettings: state.testimonialSettings || defaultTestimonialSettings,
 attestationSettings: state.attestationSettings || defaultAttestationSettings,
 examTerms: state.examTerms || defaultExamTerms,
 subjects: state.subjects || defaultSubjects,
 masterSubjects: state.masterSubjects || defaultMasterSubjects,
 curriculums: state.curriculums || defaultCurriculums,
 curriculumMappings: state.curriculumMappings || defaultCurriculumMappings,
 gradingRules: state.gradingRules || defaultGradingRules,
 examRoutines: state.examRoutines || [],
 admitCardSettings: state.admitCardSettings || defaultAdmitCardSettings,
 staffIdCardSettings: state.staffIdCardSettings || defaultStaffIdCardSettings,
 studentIdCardSettings: state.studentIdCardSettings || defaultStudentIdCardSettings,
 issuedTestimonials: state.issuedTestimonials || [],
 learnedLocations: state.learnedLocations || [],
 savedProfessions: state.savedProfessions || [],
 savedInstitutions: state.savedInstitutions || [],
 savedBoards: state.savedBoards || [],
 masterGenders: state.masterGenders || [],
 masterReligions: state.masterReligions || [],
 masterBloodGroups: state.masterBloodGroups || [],
 masterNationalities: state.masterNationalities || [],
 masterMaritalStatuses: state.masterMaritalStatuses || [],
 masterDisabilities: state.masterDisabilities || [],
 masterProfessions: state.masterProfessions || [],
 masterRelations: state.masterRelations || [],
 masterInstitutions: state.masterInstitutions || [],
 masterBoards: state.masterBoards || [],
 masterFacilities: state.masterFacilities || [],
 masterBankPayments: state.masterBankPayments || defaultMasterBankPayments,
      rooms: state.rooms || [],
 staffDesignations: state.staffDesignations || [],
 staffSubjects: state.staffSubjects || [],
 designationPermissions: state.designationPermissions || DEFAULT_DESIGNATION_PERMISSIONS,
 managingCommittee: state.managingCommittee || defaultManagingCommittee,
      masterBanks: state.masterBanks || defaultMasterBanks,
 classTeacherAssignments: state.classTeacherAssignments || [],
 subjectTeacherAssignments: state.subjectTeacherAssignments || [],
 payrollMonthlySheets: state.payrollMonthlySheets || [],
 financialTransactions: state.financialTransactions || [],
 followupCampaigns: state.followupCampaigns || [],
 followupTeams: state.followupTeams || [],
 followupAssignments: state.followupAssignments || [],
 followupVisits: state.followupVisits || [],
 whiteLabel: state.whiteLabel,
 };
 const rawJson = JSON.stringify(exportData);
 return encryptBackupData(rawJson);
 },

 exportFullBackupAsync: async (password?: string) => {
   assertPermission('backup:export', 'Export System Backup');
   const { createFullInstitutionBackup } = await import('../services/backupService');
   return createFullInstitutionBackup(password);
 },

 restoreBackupAsync: async (options: any) => {
    alert('Restore functionality is disabled (Phase 01 Containment) to prevent non-atomic replace. Preserving read-only export. Will be restored in Phase 04.');
    throw new Error('Phase 01 Containment: Restore disabled');
    assertPermission('backup:import', 'Import System Backup');
   const { restoreInstitutionFromBackup } = await import('../services/backupService');
     return restoreInstitutionFromBackup(options.validationResult || {}, options);
 },

 importBackupJSON: (jsonStr: string) => {
    alert('Restore functionality is disabled (Phase 01 Containment) to prevent non-atomic replace. Preserving read-only export. Will be restored in Phase 04.');
    return false;
    assertPermission('backup:import', 'Import System Backup');
 try {
 if (!jsonStr || typeof jsonStr !== 'string') return false;
 
 let parsed;
 try {
 // First try to decrypt
 const decrypted = decryptBackupData(jsonStr);
 if (!decrypted) return false;
 parsed = JSON.parse(decrypted);
 } catch (decryptErr) {
 // Fallback for older plain JSON backups if needed (optional)
 try {
 parsed = JSON.parse(jsonStr);
 } catch {
 return false;
 }
 }

 if (!parsed || typeof parsed !== 'object') return false;

 // Validate that the structure contains legitimate data
 const hasValidPayload = 
 parsed.institution || 
 Array.isArray(parsed.students) || 
 Array.isArray(parsed.staff) || 
 Array.isArray(parsed.academicClasses);

 if (!hasValidPayload) {
 console.error('Backup JSON missing core payload structures.');
 return false;
 }

 // Sanitize students array
 const cleanStudents = Array.isArray(parsed.students) 
 ? parsed.students.filter((s: any) => s && typeof s === 'object' && (s.id || s.name || s.nameBn))
 : [];

 // Sanitize staff array
 const cleanStaff = Array.isArray(parsed.staff)
 ? parsed.staff.filter((m: any) => m && typeof m === 'object' && (m.id || m.name || m.nameBn))
 : [];

 // Sanitize classes
 const cleanSessions = Array.isArray(parsed.academicSessions) && parsed.academicSessions.length > 0
 ? parsed.academicSessions.filter((s: any) => s && typeof s === 'object' && s.name)
 : defaultSessions;

 const cleanClasses = Array.isArray(parsed.academicClasses) && parsed.academicClasses.length > 0
 ? parsed.academicClasses.filter((c: any) => c && typeof c === 'object' && c.name)
 : defaultClasses;

 // Sanitize groups
 const cleanGroups = Array.isArray(parsed.academicGroups) && parsed.academicGroups.length > 0
 ? parsed.academicGroups.filter((g: any) => g && typeof g === 'object' && g.name)
 : defaultGroups;

 // Sanitize sections
 const cleanSections = Array.isArray(parsed.academicSections) && parsed.academicSections.length > 0
 ? parsed.academicSections.filter((s: any) => s && typeof s === 'object' && s.name)
 : defaultSections;

 // Sanitize exam results
 const cleanExamResults = Array.isArray(parsed.examResults)
 ? parsed.examResults.filter((r: any) => r && typeof r === 'object' && r.id)
 : [];

 if (cleanStudents.length > 0) {
 safePersist('students', 'sync', syncStudentsToDexie(cleanStudents));
 }
 if (cleanExamResults.length > 0) {
 safePersist('examResults', 'sync', syncExamResultsToDexie(cleanExamResults));
 }
 if (cleanStaff.length > 0) {
 safePersist('staff', 'sync', syncStaffToDexie(cleanStaff));
 }
 if (cleanClasses.length > 0) {
 safePersist('academicClasses', 'sync', syncClassesToDexie(cleanClasses));
 }
 if (cleanSessions.length > 0) {
 safePersist('academicSessions', 'sync', syncSessionsToDexie(cleanSessions));
 }
 if (cleanGroups.length > 0) {
 safePersist('academicGroups', 'sync', syncGroupsToDexie(cleanGroups));
 }
 if (cleanSections.length > 0) {
 safePersist('academicSections', 'sync', syncSectionsToDexie(cleanSections));
 }

 const cleanCurriculums = Array.isArray(parsed.curriculums) && parsed.curriculums.length > 0
 ? parsed.curriculums
 : (get().curriculums || defaultCurriculums);

 const cleanCurriculumMappings = Array.isArray(parsed.curriculumMappings) && parsed.curriculumMappings.length > 0
 ? parsed.curriculumMappings
 : (get().curriculumMappings || defaultCurriculumMappings);

 const cleanMasterSubjects = Array.isArray(parsed.masterSubjects) && parsed.masterSubjects.length > 0
 ? parsed.masterSubjects
 : (get().masterSubjects || defaultMasterSubjects);

 const cleanExamRoutines = Array.isArray(parsed.examRoutines)
 ? parsed.examRoutines
 : (get().examRoutines || []);

 const cleanIssuedTestimonials = Array.isArray(parsed.issuedTestimonials)
 ? parsed.issuedTestimonials
 : [];

 const cleanClassTeacherAssignments = Array.isArray(parsed.classTeacherAssignments)
 ? parsed.classTeacherAssignments
 : (get().classTeacherAssignments || []);

 const cleanSubjectTeacherAssignments = Array.isArray(parsed.subjectTeacherAssignments)
 ? parsed.subjectTeacherAssignments
 : (get().subjectTeacherAssignments || []);

 const cleanPayrollMonthlySheets = Array.isArray(parsed.payrollMonthlySheets)
 ? parsed.payrollMonthlySheets
 : (get().payrollMonthlySheets || []);

 const cleanStaffDesignations = Array.isArray(parsed.staffDesignations) && parsed.staffDesignations.length > 0
 ? parsed.staffDesignations
 : (get().staffDesignations || defaultStaffDesignations);

 const cleanStaffSubjects = Array.isArray(parsed.staffSubjects) && parsed.staffSubjects.length > 0
 ? parsed.staffSubjects
 : (get().staffSubjects || defaultStaffSubjects);

 const cleanDesignationPermissions = Array.isArray(parsed.designationPermissions) && parsed.designationPermissions.length > 0
 ? parsed.designationPermissions
 : (get().designationPermissions || DEFAULT_DESIGNATION_PERMISSIONS);

 const cleanManagingCommittee = parsed.managingCommittee && typeof parsed.managingCommittee === 'object'
 ? parsed.managingCommittee
 : (get().managingCommittee || defaultManagingCommittee);

 if (cleanCurriculums.length > 0) safePersist('curriculums', 'sync', syncCurriculumsToDexie(cleanCurriculums));
 if (cleanCurriculumMappings.length > 0) safePersist('curriculums', 'sync', syncCurriculumMappingsToDexie(cleanCurriculumMappings));
 if (cleanMasterSubjects.length > 0) safePersist('masterSubjects', 'sync', syncMasterSubjectsToDexie(cleanMasterSubjects));
 if (cleanExamRoutines.length > 0) safePersist('examRoutines', 'sync', syncExamRoutinesToDexie(cleanExamRoutines));
 if (cleanIssuedTestimonials.length > 0) safePersist('testimonials', 'sync', syncTestimonialsToDexie(cleanIssuedTestimonials));
 if (cleanClassTeacherAssignments.length > 0) safePersist('classTeacherAssignments', 'sync', syncClassTeacherAssignmentsToDexie(cleanClassTeacherAssignments));
 if (cleanSubjectTeacherAssignments.length > 0) safePersist('subjectTeacherAssignments', 'sync', syncSubjectTeacherAssignmentsToDexie(cleanSubjectTeacherAssignments));
 if (cleanPayrollMonthlySheets.length > 0) safePersist('payroll', 'sync', syncPayrollSheetsToDexie(cleanPayrollMonthlySheets));

 const cleanFinancialTransactions = Array.isArray(parsed.financialTransactions)
 ? parsed.financialTransactions.filter((t: any) => t && typeof t === 'object' && t.id)
 : [];

 const cleanFollowupCampaigns = Array.isArray(parsed.followupCampaigns)
 ? parsed.followupCampaigns.filter((c: any) => c && typeof c === 'object' && c.id)
 : [];

 const cleanFollowupVisits = Array.isArray(parsed.followupVisits)
 ? parsed.followupVisits.filter((v: any) => v && typeof v === 'object' && v.id)
 : [];

 if (cleanFinancialTransactions.length > 0) {
   db.financialTransactions.bulkPut(cleanFinancialTransactions).catch(() => {});
 }
 if (cleanFollowupCampaigns.length > 0) {
   db.followupCampaigns.bulkPut(cleanFollowupCampaigns).catch(() => {});
 }
 if (cleanFollowupVisits.length > 0) {
   db.followupVisits.bulkPut(cleanFollowupVisits).catch(() => {});
 }

 set({
 institution: parsed.institution && typeof parsed.institution === 'object' 
 ? { ...defaultInstitution, ...parsed.institution } 
 : defaultInstitution,
 students: cleanStudents.length > 0 ? cleanStudents : (get().students || []),
 staff: cleanStaff.length > 0 ? cleanStaff : (get().staff || []),
 financialTransactions: cleanFinancialTransactions.length > 0 ? cleanFinancialTransactions : (get().financialTransactions || []),
 followupCampaigns: cleanFollowupCampaigns.length > 0 ? cleanFollowupCampaigns : (get().followupCampaigns || []),
 followupVisits: cleanFollowupVisits.length > 0 ? cleanFollowupVisits : (get().followupVisits || []),
 academicSessions: cleanSessions,
 academicClasses: cleanClasses,
 academicGroups: cleanGroups,
 academicSections: cleanSections,
 examResults: cleanExamResults,
 testimonialSettings: parsed.testimonialSettings && typeof parsed.testimonialSettings === 'object' 
 ? { ...defaultTestimonialSettings, ...parsed.testimonialSettings } 
 : defaultTestimonialSettings,
 attestationSettings: parsed.attestationSettings && typeof parsed.attestationSettings === 'object' 
 ? { ...defaultAttestationSettings, ...parsed.attestationSettings } 
 : defaultAttestationSettings,
 examTerms: Array.isArray(parsed.examTerms) && parsed.examTerms.length > 0
 ? parsed.examTerms
 : get().examTerms || defaultExamTerms,
 subjects: Array.isArray(parsed.subjects) && parsed.subjects.length > 0
 ? parsed.subjects
 : get().subjects || defaultSubjects,
 masterSubjects: cleanMasterSubjects,
 curriculums: cleanCurriculums,
 curriculumMappings: cleanCurriculumMappings,
 gradingRules: Array.isArray(parsed.gradingRules) && parsed.gradingRules.length > 0
 ? parsed.gradingRules
 : get().gradingRules || defaultGradingRules,
 examRoutines: cleanExamRoutines,
 admitCardSettings: parsed.admitCardSettings && typeof parsed.admitCardSettings === 'object'
 ? { ...defaultAdmitCardSettings, ...parsed.admitCardSettings }
 : defaultAdmitCardSettings,
 staffIdCardSettings: parsed.staffIdCardSettings && typeof parsed.staffIdCardSettings === 'object'
 ? { ...defaultStaffIdCardSettings, ...parsed.staffIdCardSettings }
 : defaultStaffIdCardSettings,
 studentIdCardSettings: parsed.studentIdCardSettings && typeof parsed.studentIdCardSettings === 'object'
 ? { ...defaultStudentIdCardSettings, ...parsed.studentIdCardSettings }
 : defaultStudentIdCardSettings,
 issuedTestimonials: cleanIssuedTestimonials,
 staffDesignations: cleanStaffDesignations,
 staffSubjects: cleanStaffSubjects,
 designationPermissions: cleanDesignationPermissions,
 managingCommittee: cleanManagingCommittee,
 classTeacherAssignments: cleanClassTeacherAssignments,
 subjectTeacherAssignments: cleanSubjectTeacherAssignments,
 payrollMonthlySheets: cleanPayrollMonthlySheets,
 learnedLocations: Array.isArray(parsed.learnedLocations) && parsed.learnedLocations.length > 0
 ? parsed.learnedLocations
 : get().learnedLocations,
 savedProfessions: Array.isArray(parsed.savedProfessions) && parsed.savedProfessions.length > 0
 ? parsed.savedProfessions
 : get().savedProfessions,
 savedInstitutions: Array.isArray(parsed.savedInstitutions) && parsed.savedInstitutions.length > 0
 ? parsed.savedInstitutions
 : get().savedInstitutions,
 savedBoards: Array.isArray(parsed.savedBoards) && parsed.savedBoards.length > 0
 ? parsed.savedBoards
 : get().savedBoards,
 masterGenders: Array.isArray(parsed.masterGenders) && parsed.masterGenders.length > 0
 ? parsed.masterGenders
 : get().masterGenders,
 masterReligions: Array.isArray(parsed.masterReligions) && parsed.masterReligions.length > 0
 ? parsed.masterReligions
 : get().masterReligions,
 masterBloodGroups: Array.isArray(parsed.masterBloodGroups) && parsed.masterBloodGroups.length > 0
 ? parsed.masterBloodGroups
 : get().masterBloodGroups,
 masterNationalities: Array.isArray(parsed.masterNationalities) && parsed.masterNationalities.length > 0
 ? parsed.masterNationalities
 : get().masterNationalities,
 masterMaritalStatuses: Array.isArray(parsed.masterMaritalStatuses) && parsed.masterMaritalStatuses.length > 0
 ? parsed.masterMaritalStatuses
 : get().masterMaritalStatuses,
 masterDisabilities: Array.isArray(parsed.masterDisabilities) && parsed.masterDisabilities.length > 0
 ? parsed.masterDisabilities
 : get().masterDisabilities,
 masterProfessions: Array.isArray(parsed.masterProfessions) && parsed.masterProfessions.length > 0
 ? parsed.masterProfessions
 : get().masterProfessions,
 masterRelations: Array.isArray(parsed.masterRelations) && parsed.masterRelations.length > 0
 ? parsed.masterRelations
 : get().masterRelations,
 masterInstitutions: Array.isArray(parsed.masterInstitutions) && parsed.masterInstitutions.length > 0
 ? parsed.masterInstitutions
 : get().masterInstitutions,
 masterBoards: Array.isArray(parsed.masterBoards) && parsed.masterBoards.length > 0
 ? parsed.masterBoards
 : get().masterBoards,
 masterFacilities: Array.isArray(parsed.masterFacilities) && parsed.masterFacilities.length > 0
 ? parsed.masterFacilities
 : get().masterFacilities,
 systemFontSettings: parsed.systemFontSettings && typeof parsed.systemFontSettings === 'object' ? parsed.systemFontSettings : get().systemFontSettings,
			whiteLabel: parsed.whiteLabel && typeof parsed.whiteLabel === 'object'
 ? parsed.whiteLabel
 : get().whiteLabel,
 });
 return true;
 } catch (e) {
 console.error('Failed to parse and validate backup JSON:', e);
 return false;
 }
 },

 resetToDefaults: () => {
    alert('Reset functionality is temporarily disabled for data safety (Phase 01 Containment). It will be restored in Phase 04.');
    return;
    assertPermission('database:reset', 'Reset Database');
    clearAllDexieTables();
 set({
 institution: defaultInstitution,
 students: [],
 staff: initialSampleStaff,
 academicSessions: defaultSessions,
 admissionYears: defaultAdmissionYears,
 academicClasses: defaultClasses,
 academicGroups: defaultGroups,
 academicSections: defaultSections,
 testimonialSettings: defaultTestimonialSettings,
 attestationSettings: defaultAttestationSettings,
 examTerms: defaultExamTerms,
 subjects: defaultSubjects,
 masterSubjects: defaultMasterSubjects,
 curriculums: defaultCurriculums,
 curriculumMappings: defaultCurriculumMappings,
 gradingRules: defaultGradingRules,
 examRoutines: [],
  admitCardSettings: defaultAdmitCardSettings,
 studentIdCardSettings: defaultStudentIdCardSettings,
 examResults: [],
 issuedTestimonials: [],
 classTeacherAssignments: initialClassTeacherAssignments,
 subjectTeacherAssignments: initialSubjectTeacherAssignments,
 payrollMonthlySheets: initialSamplePayroll,
 managingCommittee: defaultManagingCommittee,
 staffDesignations: defaultStaffDesignations,
 staffSubjects: defaultStaffSubjects,
 designationPermissions: DEFAULT_DESIGNATION_PERMISSIONS,
 });
 },

 flushStorageToDisk: async () => {
 await storageQueueManager.flushPendingWrites('biddalok-database-v1');
 },

 getStorageStatus: () => {
 return storageQueueManager.getStatus();
 }
 }),
 {
 name: 'biddalok-database-v1', // unique storage key
 storage: createSafeJsonStorage(() => asyncNonBlockingStorage),
 partialize: (state) => ({
 language: state.language,
 institution: state.institution,
 
 scholarships: state.scholarships,
        scholarshipSettings: state.scholarshipSettings,
 
 academicSessions: state.academicSessions,
 admissionYears: state.admissionYears,
 academicClasses: state.academicClasses,
 academicGroups: state.academicGroups,
 academicSections: state.academicSections,
 testimonialSettings: state.testimonialSettings,
 attestationSettings: state.attestationSettings,
 examTerms: state.examTerms,
 subjects: state.subjects,
 masterSubjects: state.masterSubjects,
 curriculums: state.curriculums,
 curriculumMappings: state.curriculumMappings,
 gradingRules: state.gradingRules,
 examRoutines: state.examRoutines,
 admitCardSettings: state.admitCardSettings,
 studentIdCardSettings: state.studentIdCardSettings,
 systemFontSettings: state.systemFontSettings,
 
 whiteLabel: state.whiteLabel,
 issuedTestimonials: state.issuedTestimonials,
 learnedLocations: state.learnedLocations,
 savedProfessions: state.savedProfessions,
 savedInstitutions: state.savedInstitutions,
 savedBoards: state.savedBoards,
 masterGenders: state.masterGenders,
 masterReligions: state.masterReligions,
 masterBloodGroups: state.masterBloodGroups,
 masterNationalities: state.masterNationalities,
 masterMaritalStatuses: state.masterMaritalStatuses,
 masterDisabilities: state.masterDisabilities,
 masterProfessions: state.masterProfessions,
 masterRelations: state.masterRelations,
 masterInstitutions: state.masterInstitutions,
 masterBoards: state.masterBoards,
 masterFacilities: state.masterFacilities,
 masterCommitteeTypes: state.masterCommitteeTypes,
 masterBankPayments: state.masterBankPayments,
      rooms: state.rooms,
 staffDesignations: state.staffDesignations,
 staffSubjects: state.staffSubjects,
 designationPermissions: state.designationPermissions,
 managingCommittee: state.managingCommittee,
 managingCommitteesList: state.managingCommitteesList,
      masterBanks: state.masterBanks,
 classTeacherAssignments: state.classTeacherAssignments,
 subjectTeacherAssignments: state.subjectTeacherAssignments,
 payrollMonthlySheets: state.payrollMonthlySheets,
 }),
 onRehydrateStorage: () => (state) => {
 if (state) {
 if (!state.academicSessions || state.academicSessions.length === 0) {
 state.academicSessions = defaultSessions;
 }
 if (!state.admissionYears || state.admissionYears.length === 0) {
 state.admissionYears = defaultAdmissionYears;
 }
 if (!state.academicClasses || state.academicClasses.length === 0) {
 state.academicClasses = defaultClasses;
 }
 if (!state.academicGroups || state.academicGroups.length === 0) {
 state.academicGroups = defaultGroups;
 }
 if (!state.academicSections || state.academicSections.length === 0) {
 state.academicSections = defaultSections;
 }

 // Auto-heal relational IDs for any legacy students, subjects, routines, and exam results
 const classes = state.academicClasses || defaultClasses;
 const sections = state.academicSections || defaultSections;
 const groups = state.academicGroups || defaultGroups;
 const sessions = state.academicSessions || defaultSessions;
 const genders = state.masterGenders || defaultMasterGenders;
 const religions = state.masterReligions || defaultMasterReligions;
 const bloodGroups = state.masterBloodGroups || defaultMasterBloodGroups;
 const nationalities = state.masterNationalities || defaultMasterNationalities;
 const maritalStatuses = state.masterMaritalStatuses || defaultMasterMaritalStatuses;
 const disabilities = state.masterDisabilities || defaultMasterDisabilities;
 const professions = state.masterProfessions || defaultMasterProfessions;
 const relations = state.masterRelations || defaultMasterRelations;
 const institutions = state.masterInstitutions || defaultMasterInstitutions;
 const boards = state.masterBoards || defaultMasterBoards;
 const facilities = state.masterFacilities || defaultMasterFacilities;

 if (state.students && state.students.length > 0) {
 let changed = false;
 const healedStudents = state.students.map((s) => {
 const linked = linkStudentIds(s, { 
 classes, 
 sections, 
 groups, 
 sessions,
 genders,
 religions,
 bloodGroups,
 nationalities,
 maritalStatuses,
 disabilities,
 professions,
 relations,
 institutions,
 boards,
 facilities
 });
 if (
 linked.classId !== s.classId ||
 linked.sectionId !== s.sectionId ||
 linked.groupId !== s.groupId ||
 linked.sessionId !== s.sessionId ||
 linked.genderId !== s.genderId ||
 linked.religionId !== s.religionId ||
 linked.bloodGroupId !== s.bloodGroupId ||
 linked.nationalityId !== s.nationalityId ||
 linked.maritalStatusId !== s.maritalStatusId ||
 linked.disabilityId !== s.disabilityId ||
 linked.fatherProfessionId !== s.fatherProfessionId ||
 linked.motherProfessionId !== s.motherProfessionId ||
 linked.guardianProfessionId !== s.guardianProfessionId ||
 linked.guardianRelationId !== s.guardianRelationId ||
 linked.prevSchoolId !== s.prevSchoolId ||
 linked.prevBoardId !== s.prevBoardId ||
 linked.specialFacilityId !== s.specialFacilityId
 ) {
 changed = true;
 return linked;
 }
 return s;
 });
 if (changed) {
 state.students = healedStudents;
 safePersist('students', 'sync', syncStudentsToDexie(healedStudents));
 }
 }

 if (!state.masterSubjects || state.masterSubjects.length === 0) {
 state.masterSubjects = defaultMasterSubjects;
 }
 if (!state.curriculums || state.curriculums.length === 0) {
 state.curriculums = defaultCurriculums;
 }
 if (!state.curriculumMappings || state.curriculumMappings.length === 0) {
 state.curriculumMappings = defaultCurriculumMappings;
 }

 if (!state.gradingRules || state.gradingRules.length === 0) {
 state.gradingRules = defaultGradingRules;
 }

 if (!state.examTerms || state.examTerms.length === 0) {
 state.examTerms = defaultExamTerms;
 }

 if (!state.subjects || state.subjects.length === 0) {
 state.subjects = defaultSubjects.map((sub) => linkSubjectIds(sub, { classes, groups }));
 } else {
 state.subjects = state.subjects.map((sub) => linkSubjectIds(sub, { classes, groups }));
 }

 if (!state.admitCardSettings || !state.admitCardSettings.instructions || state.admitCardSettings.instructions.length === 0) {
 state.admitCardSettings = defaultAdmitCardSettings;
 }

 if (state.examRoutines && state.examRoutines.length > 0) {
 state.examRoutines = state.examRoutines.map((rt) => linkExamRoutineIds(rt, { classes, subjects: state.subjects }));
 } else if (!state.examRoutines || state.examRoutines.length === 0) {
 state.examRoutines = [];
 }

 if (state.examResults && state.examResults.length > 0) {
 state.examResults = state.examResults.map((res) => linkExamResultIds(res, { classes, groups, sessions }));
 }

 if (!state.financialTransactions) {
 state.financialTransactions = [];
 }
 }
 },
 }
 )
);

