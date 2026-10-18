import Dexie, { Table } from 'dexie';
import { 
  Student, 
  ExamResult, 
  IssuedTestimonial, 
  StaffMember, 
  AcademicClass, 
  AcademicGroup, 
  AcademicSection,
  AcademicSession,
  AdmissionYearItem,
  CurriculumDefinition,
  CurriculumSubjectMapping,
  MasterSubject,
  ExamRoutineItem,
  ClassTeacherAssignment,
  SubjectTeacherAssignment,
  PayrollMonthlySheet,
  FinancialTransaction,
  FollowupCampaign,
  FollowupTeam,
  FollowupAssignment,
  FollowupVisit
} from '../types';

export class BiddalokDB extends Dexie {
  students!: Table<Student, string>;
  examResults!: Table<ExamResult, string>;
  staff!: Table<StaffMember, string>;
  classes!: Table<AcademicClass, string>;
  groups!: Table<AcademicGroup, string>;
  sections!: Table<AcademicSection, string>;
  sessions!: Table<AcademicSession, string>;
  admissionYears!: Table<AdmissionYearItem, string>;
  issuedTestimonials!: Table<IssuedTestimonial, string>;
  curriculums!: Table<CurriculumDefinition, string>;
  curriculumMappings!: Table<CurriculumSubjectMapping, string>;
  masterSubjects!: Table<MasterSubject, string>;
  examRoutines!: Table<ExamRoutineItem, string>;
  classTeacherAssignments!: Table<ClassTeacherAssignment, string>;
  subjectTeacherAssignments!: Table<SubjectTeacherAssignment, string>;
  payrollMonthlySheets!: Table<PayrollMonthlySheet, string>;
  financialTransactions!: Table<FinancialTransaction, string>;
  communicationDrafts!: Table<any, string>;

  // Follow-up Module Tables
  followupCampaigns!: Table<FollowupCampaign, string>;
  followupTeams!: Table<FollowupTeam, string>;
  followupAssignments!: Table<FollowupAssignment, string>;
  followupVisits!: Table<FollowupVisit, string>;

  // Migration & Quarantine Tables (Version 7)
  schemaMigrations!: Table<{ version: number; migratedAt: string; status: string }, number>;
  quarantineRecords!: Table<{ id: string; sourceKeyOrTable: string; timestamp: string; type: string; reason: string }, string>;
  
  // Finance, HR & Payroll Tables
  accounts!: Table<any, string>;
  feeHeads!: Table<any, string>;
  fiscalPeriods!: Table<any, string>;
  invoices!: Table<any, string>;
  invoiceLines!: Table<any, string>;
  receipts!: Table<any, string>;
  receiptAllocations!: Table<any, string>;
  journals!: Table<any, string>;
  journalLines!: Table<any, string>;
  staffAttendance!: Table<any, string>;
  employmentTerms!: Table<any, string>;
  payPolicies!: Table<any, string>;
  payrollRuns!: Table<any, string>;
  payrollSlips!: Table<any, string>;
  payrollDisbursements!: Table<any, string>;
  
  constructor() {
    super('BiddalokDB');

    // Version 1 (Initial schema)
    this.version(1).stores({
      students: 'id, studentId, name, roll, class, registrationNo',
      examResults: 'id, studentId, boardRollNo, registrationNo, examName',
      staff: 'id, name, designation',
      classes: 'id, name, isDefault',
      groups: 'id, name, isDefault',
      sections: 'id, name, isDefault',
      issuedTestimonials: 'id, studentId, issueDate'
    });

    // Version 2 (High-Performance Compound Indexing for Instant Lookups & Bulk Operations)
    this.version(2).stores({
      students: 'id, studentId, name, roll, class, session, year, section, group, gender, registrationNo, birthRegistrationNo, fatherMobile, [class+session+year], [class+year], [class+session], [class+section], [class+roll], [year+session], [class+group], [studentId+class]',
      examResults: 'id, studentId, boardRollNo, registrationNo, examName, passingYear, session, group, [examName+passingYear], [examName+session], [examName+group], [studentId+examName], [boardRollNo+passingYear]',
      staff: 'id, name, designation, role, contact',
      classes: 'id, name, isDefault',
      groups: 'id, name, isDefault',
      sections: 'id, name, isDefault',
      issuedTestimonials: 'id, studentId, issueDate, format, [studentId+issueDate], [studentId+format]'
    }).upgrade(async tx => {
      // Normalize existing student records to guarantee valid compound index strings
      const studentsTable = tx.table<Student, string>('students');
      await studentsTable.toCollection().modify(student => {
        student.class = student.class || '';
        student.session = student.session || '';
        student.year = student.year || '';
        student.section = student.section || '';
        student.group = student.group || '';
        student.roll = student.roll || '';
        student.studentId = student.studentId || '';
      });

      const resultsTable = tx.table<ExamResult, string>('examResults');
      await resultsTable.toCollection().modify(result => {
        result.examName = result.examName || '';
        result.passingYear = result.passingYear || '';
        result.session = result.session || '';
        result.group = result.group || '';
        result.studentId = result.studentId || '';
        result.boardRollNo = result.boardRollNo || '';
      });
    });

    // Version 3 (Full Database Mapping: Curriculums, Sessions, Routines, Assignments, Payroll)
    this.version(3).stores({
      students: 'id, studentId, name, roll, class, session, year, section, group, gender, registrationNo, birthRegistrationNo, fatherMobile, [class+session+year], [class+year], [class+session], [class+section], [class+roll], [year+session], [class+group], [studentId+class]',
      examResults: 'id, studentId, boardRollNo, registrationNo, examName, passingYear, session, group, [examName+passingYear], [examName+session], [examName+group], [studentId+examName], [boardRollNo+passingYear]',
      staff: 'id, name, designation, role, contact',
      classes: 'id, name, isDefault',
      groups: 'id, name, isDefault',
      sections: 'id, name, isDefault',
      sessions: 'id, name, isDefault',
      issuedTestimonials: 'id, studentId, issueDate, format, [studentId+issueDate], [studentId+format]',
      curriculums: 'id, code, name, status, isDefault',
      curriculumMappings: 'id, curriculumId, className, subjectCode, [curriculumId+className], [curriculumId+subjectCode]',
      masterSubjects: 'id, code, name, category, isActive',
      examRoutines: 'id, examId, className, subjectName, examDate, [examId+className]',
      classTeacherAssignments: 'id, classId, teacherId, academicYear',
      subjectTeacherAssignments: 'id, classId, subjectId, teacherId, academicYear',
      payrollMonthlySheets: 'id, month, year, status'
    });

    // Version 4 (Financial Transactions Initial Store)
    this.version(4).stores({
      students: 'id, studentId, name, roll, class, session, year, section, group, gender, registrationNo, birthRegistrationNo, fatherMobile, [class+session+year], [class+year], [class+session], [class+section], [class+roll], [year+session], [class+group], [studentId+class]',
      examResults: 'id, studentId, boardRollNo, registrationNo, examName, passingYear, session, group, [examName+passingYear], [examName+session], [examName+group], [studentId+examName], [boardRollNo+passingYear]',
      staff: 'id, name, designation, role, contact',
      classes: 'id, name, isDefault',
      groups: 'id, name, isDefault',
      sections: 'id, name, isDefault',
      sessions: 'id, name, isDefault',
      issuedTestimonials: 'id, studentId, issueDate, format, [studentId+issueDate], [studentId+format]',
      curriculums: 'id, code, name, status, isDefault',
      curriculumMappings: 'id, curriculumId, className, subjectCode, [curriculumId+className], [curriculumId+subjectCode]',
      masterSubjects: 'id, code, name, category, isActive',
      examRoutines: 'id, examId, className, subjectName, examDate, [examId+className]',
      classTeacherAssignments: 'id, classId, teacherId, academicYear',
      subjectTeacherAssignments: 'id, classId, subjectId, teacherId, academicYear',
      payrollMonthlySheets: 'id, month, year, status',
      financialTransactions: 'id, voucherNo, date, type, category, status, paymentMethod, studentId, staffId, [type+date], [type+category]'
    });

    // Version 5 (Financial Transactions & Accounts Ledger + Communication Drafts)
    this.version(5).stores({
      students: 'id, studentId, name, roll, class, session, year, section, group, gender, registrationNo, birthRegistrationNo, fatherMobile, [class+session+year], [class+year], [class+session], [class+section], [class+roll], [year+session], [class+group], [studentId+class]',
      examResults: 'id, studentId, boardRollNo, registrationNo, examName, passingYear, session, group, [examName+passingYear], [examName+session], [examName+group], [studentId+examName], [boardRollNo+passingYear]',
      staff: 'id, name, designation, role, contact',
      classes: 'id, name, isDefault',
      groups: 'id, name, isDefault',
      sections: 'id, name, isDefault',
      sessions: 'id, name, isDefault',
      issuedTestimonials: 'id, studentId, issueDate, format, [studentId+issueDate], [studentId+format]',
      curriculums: 'id, code, name, status, isDefault',
      curriculumMappings: 'id, curriculumId, className, subjectCode, [curriculumId+className], [curriculumId+subjectCode]',
      masterSubjects: 'id, code, name, category, isActive',
      examRoutines: 'id, examId, className, subjectName, examDate, [examId+className]',
      classTeacherAssignments: 'id, classId, teacherId, academicYear',
      subjectTeacherAssignments: 'id, classId, subjectId, teacherId, academicYear',
      payrollMonthlySheets: 'id, month, year, status',
      financialTransactions: 'id, voucherNo, date, type, category, status, paymentMethod, studentId, staffId, [type+date], [type+category]',
      communicationDrafts: 'id, type, updatedAt'
    });

    // Version 6 (Student Follow-up Module)
    this.version(6).stores({
      students: 'id, studentId, name, roll, class, session, year, section, group, gender, registrationNo, birthRegistrationNo, fatherMobile, [class+session+year], [class+year], [class+session], [class+section], [class+roll], [year+session], [class+group], [studentId+class]',
      examResults: 'id, studentId, boardRollNo, registrationNo, examName, passingYear, session, group, [examName+passingYear], [examName+session], [examName+group], [studentId+examName], [boardRollNo+passingYear]',
      staff: 'id, name, designation, role, contact',
      classes: 'id, name, isDefault',
      groups: 'id, name, isDefault',
      sections: 'id, name, isDefault',
      sessions: 'id, name, isDefault',
      issuedTestimonials: 'id, studentId, issueDate, format, [studentId+issueDate], [studentId+format]',
      curriculums: 'id, code, name, status, isDefault',
      curriculumMappings: 'id, curriculumId, className, subjectCode, [curriculumId+className], [curriculumId+subjectCode]',
      masterSubjects: 'id, code, name, category, isActive',
      examRoutines: 'id, examId, className, subjectName, examDate, [examId+className]',
      classTeacherAssignments: 'id, classId, teacherId, academicYear',
      subjectTeacherAssignments: 'id, classId, subjectId, teacherId, academicYear',
      payrollMonthlySheets: 'id, month, year, status',
      financialTransactions: 'id, voucherNo, date, type, category, status, paymentMethod, studentId, staffId, [type+date], [type+category]',
      communicationDrafts: 'id, type, updatedAt',
      followupCampaigns: 'id, institutionId, academicYear, status, [academicYear+status]',
      followupTeams: 'id, campaignId, leaderId',
      followupAssignments: 'id, campaignId, teamId, studentId, status, scheduledDate, [teamId+status], [campaignId+studentId]',
      followupVisits: 'id, campaignId, assignmentId, studentId, visitDate, status, [studentId+status], [campaignId+teamId]'
    });

    // Version 7 (Additive Migration: Schema Migrations Ledger & Quarantine Records)
    this.version(7).stores({
      students: 'id, studentId, name, roll, class, session, year, section, group, gender, registrationNo, birthRegistrationNo, fatherMobile, [class+session+year], [class+year], [class+session], [class+section], [class+roll], [year+session], [class+group], [studentId+class]',
      examResults: 'id, studentId, boardRollNo, registrationNo, examName, passingYear, session, group, [examName+passingYear], [examName+session], [examName+group], [studentId+examName], [boardRollNo+passingYear]',
      staff: 'id, name, designation, role, contact',
      classes: 'id, name, isDefault',
      groups: 'id, name, isDefault',
      sections: 'id, name, isDefault',
      sessions: 'id, name, isDefault',
      issuedTestimonials: 'id, studentId, issueDate, format, [studentId+issueDate], [studentId+format]',
      curriculums: 'id, code, name, status, isDefault',
      curriculumMappings: 'id, curriculumId, className, subjectCode, [curriculumId+className], [curriculumId+subjectCode]',
      masterSubjects: 'id, code, name, category, isActive',
      examRoutines: 'id, examId, className, subjectName, examDate, [examId+className]',
      classTeacherAssignments: 'id, classId, teacherId, academicYear',
      subjectTeacherAssignments: 'id, classId, subjectId, teacherId, academicYear',
      payrollMonthlySheets: 'id, month, year, status',
      financialTransactions: 'id, voucherNo, date, type, category, status, paymentMethod, studentId, staffId, [type+date], [type+category]',
      communicationDrafts: 'id, type, updatedAt',
      followupCampaigns: 'id, institutionId, academicYear, status, [academicYear+status]',
      followupTeams: 'id, campaignId, leaderId',
      followupAssignments: 'id, campaignId, teamId, studentId, status, scheduledDate, [teamId+status], [campaignId+studentId]',
      followupVisits: 'id, campaignId, assignmentId, studentId, visitDate, status, [studentId+status], [campaignId+teamId]',
      schemaMigrations: 'version, migratedAt, status',
      quarantineRecords: 'id, sourceKeyOrTable, timestamp, type'
    });
    // Version 8 (Double Entry Accounting & Fees)
    this.version(8).stores({
      students: 'id, studentId, name, roll, class, session, year, section, group, gender, registrationNo, birthRegistrationNo, fatherMobile, [class+session+year], [class+year], [class+session], [class+section], [class+roll], [year+session], [class+group], [studentId+class]',
      examResults: 'id, studentId, boardRollNo, registrationNo, examName, passingYear, session, group, [examName+passingYear], [examName+session], [examName+group], [studentId+examName], [boardRollNo+passingYear]',
      staff: 'id, name, designation, role, contact',
      classes: 'id, name, isDefault',
      groups: 'id, name, isDefault',
      sections: 'id, name, isDefault',
      sessions: 'id, name, isDefault',
      issuedTestimonials: 'id, studentId, issueDate, format, [studentId+issueDate], [studentId+format]',
      curriculums: 'id, code, name, status, isDefault',
      curriculumMappings: 'id, curriculumId, className, subjectCode, [curriculumId+className], [curriculumId+subjectCode]',
      masterSubjects: 'id, code, name, category, isActive',
      examRoutines: 'id, examId, className, subjectName, examDate, [examId+className]',
      classTeacherAssignments: 'id, classId, teacherId, academicYear',
      subjectTeacherAssignments: 'id, classId, subjectId, teacherId, academicYear',
      payrollMonthlySheets: 'id, month, year, status',
      financialTransactions: 'id, voucherNo, date, type, category, status, paymentMethod, studentId, staffId, [type+date], [type+category]',
      communicationDrafts: 'id, type, updatedAt',
      followupCampaigns: 'id, institutionId, academicYear, status, [academicYear+status]',
      followupTeams: 'id, campaignId, leaderId',
      followupAssignments: 'id, campaignId, teamId, studentId, status, scheduledDate, [teamId+status], [campaignId+studentId]',
      followupVisits: 'id, campaignId, assignmentId, studentId, visitDate, status, [studentId+status], [campaignId+teamId]',
      schemaMigrations: 'version, migratedAt, status',
      quarantineRecords: 'id, sourceKeyOrTable, timestamp, type',
      // New Phase 09 tables
      accounts: 'id, code, type',
      fiscalPeriods: 'id, startDate, endDate, isClosed',
      feeHeads: 'id, accountId',
      invoices: 'id, invoiceNo, studentId, periodId, status',
      invoiceLines: 'id, invoiceId, feeHeadId',
      receipts: 'id, receiptNo, studentId, accountId, status',
      receiptAllocations: 'id, receiptId, invoiceId',
      journals: 'id, voucherNo, periodId, type, referenceId, status',
      journalLines: 'id, journalId, accountId',
      concessions: 'id, studentId, invoiceId, feeHeadId, status',
      refunds: 'id, studentId, receiptId, status'
    });

    // Version 9 (Employment Leave and Dated Attendance)
    this.version(9).stores({
      students: 'id, studentId, name, roll, class, session, year, section, group, gender, registrationNo, birthRegistrationNo, fatherMobile, [class+session+year], [class+year], [class+session], [class+section], [class+roll], [year+session], [class+group], [studentId+class]',
      examResults: 'id, studentId, boardRollNo, registrationNo, examName, passingYear, session, group, [examName+passingYear], [examName+session], [examName+group], [studentId+examName], [boardRollNo+passingYear]',
      staff: 'id, name, designation, role, contact',
      classes: 'id, name, isDefault',
      groups: 'id, name, isDefault',
      sections: 'id, name, isDefault',
      sessions: 'id, name, isDefault',
      issuedTestimonials: 'id, studentId, issueDate, format, [studentId+issueDate], [studentId+format]',
      curriculums: 'id, code, name, status, isDefault',
      curriculumMappings: 'id, curriculumId, className, subjectCode, [curriculumId+className], [curriculumId+subjectCode]',
      masterSubjects: 'id, code, name, category, isActive',
      examRoutines: 'id, examId, className, subjectName, examDate, [examId+className]',
      classTeacherAssignments: 'id, classId, teacherId, academicYear',
      subjectTeacherAssignments: 'id, classId, subjectId, teacherId, academicYear',
      payrollMonthlySheets: 'id, month, year, status',
      financialTransactions: 'id, voucherNo, date, type, category, status, paymentMethod, studentId, staffId, [type+date], [type+category]',
      communicationDrafts: 'id, type, updatedAt',
      followupCampaigns: 'id, institutionId, academicYear, status, [academicYear+status]',
      followupTeams: 'id, campaignId, leaderId',
      followupAssignments: 'id, campaignId, teamId, studentId, status, scheduledDate, [teamId+status], [campaignId+studentId]',
      followupVisits: 'id, campaignId, assignmentId, studentId, visitDate, status, [studentId+status], [campaignId+teamId]',
      schemaMigrations: 'version, migratedAt, status',
      quarantineRecords: 'id, sourceKeyOrTable, timestamp, type',
      accounts: 'id, code, type',
      fiscalPeriods: 'id, startDate, endDate, isClosed',
      feeHeads: 'id, accountId',
      invoices: 'id, invoiceNo, studentId, periodId, status',
      invoiceLines: 'id, invoiceId, feeHeadId',
      receipts: 'id, receiptNo, studentId, accountId, status',
      receiptAllocations: 'id, receiptId, invoiceId',
      journals: 'id, voucherNo, periodId, type, referenceId, status',
      journalLines: 'id, journalId, accountId',
      concessions: 'id, studentId, invoiceId, feeHeadId, status',
      refunds: 'id, studentId, receiptId, status',
      // New Phase 10 tables
      employmentTerms: 'id, staffId, startDate, endDate, status',
      staffAttendance: 'id, staffId, date, status, [staffId+date]',
      holidays: 'id, date, type',
      leaveEntitlements: 'id, staffId, year, leaveType',
      leaveRequests: 'id, staffId, startDate, endDate, status'
    });

    // Version 10 (Payroll calculation approval and disbursement)
    this.version(10).stores({
      students: 'id, studentId, name, roll, class, session, year, section, group, gender, registrationNo, birthRegistrationNo, fatherMobile, [class+session+year], [class+year], [class+session], [class+section], [class+roll], [year+session], [class+group], [studentId+class]',
      examResults: 'id, studentId, boardRollNo, registrationNo, examName, passingYear, session, group, [examName+passingYear], [examName+session], [examName+group], [studentId+examName], [boardRollNo+passingYear]',
      staff: 'id, name, designation, role, contact',
      classes: 'id, name, isDefault',
      groups: 'id, name, isDefault',
      sections: 'id, name, isDefault',
      sessions: 'id, name, isDefault',
      issuedTestimonials: 'id, studentId, issueDate, format, [studentId+issueDate], [studentId+format]',
      curriculums: 'id, code, name, status, isDefault',
      curriculumMappings: 'id, curriculumId, className, subjectCode, [curriculumId+className], [curriculumId+subjectCode]',
      masterSubjects: 'id, code, name, category, isActive',
      examRoutines: 'id, examId, className, subjectName, examDate, [examId+className]',
      classTeacherAssignments: 'id, classId, teacherId, academicYear',
      subjectTeacherAssignments: 'id, classId, subjectId, teacherId, academicYear',
      payrollMonthlySheets: 'id, month, year, status',
      financialTransactions: 'id, voucherNo, date, type, category, status, paymentMethod, studentId, staffId, [type+date], [type+category]',
      communicationDrafts: 'id, type, updatedAt',
      followupCampaigns: 'id, institutionId, academicYear, status, [academicYear+status]',
      followupTeams: 'id, campaignId, leaderId',
      followupAssignments: 'id, campaignId, teamId, studentId, status, scheduledDate, [teamId+status], [campaignId+studentId]',
      followupVisits: 'id, campaignId, assignmentId, studentId, visitDate, status, [studentId+status], [campaignId+teamId]',
      schemaMigrations: 'version, migratedAt, status',
      quarantineRecords: 'id, sourceKeyOrTable, timestamp, type',
      accounts: 'id, code, type',
      fiscalPeriods: 'id, startDate, endDate, isClosed',
      feeHeads: 'id, accountId',
      invoices: 'id, invoiceNo, studentId, periodId, status',
      invoiceLines: 'id, invoiceId, feeHeadId',
      receipts: 'id, receiptNo, studentId, accountId, status',
      receiptAllocations: 'id, receiptId, invoiceId',
      journals: 'id, voucherNo, periodId, type, referenceId, status',
      journalLines: 'id, journalId, accountId',
      concessions: 'id, studentId, invoiceId, feeHeadId, status',
      refunds: 'id, studentId, receiptId, status',
      employmentTerms: 'id, staffId, startDate, endDate, status',
      staffAttendance: 'id, staffId, date, status, [staffId+date]',
      holidays: 'id, date, type',
      leaveEntitlements: 'id, staffId, year, leaveType',
      leaveRequests: 'id, staffId, startDate, endDate, status',
      // New Phase 11 tables
      payPolicies: 'id, effectiveDate',
      payrollRuns: 'id, month, runScope, state, periodId, [month+runScope]',
      payrollSlips: 'id, runId, staffId, employmentTermId, state, [runId+staffId]',
      payrollDisbursements: 'id, slipId, idempotencyKey, status'
    });
    // Version 11 (Phase 14: Messaging & Sync Queues)
    this.version(11).stores({
      students: 'id, studentId, name, roll, class, session, year, section, group, gender, registrationNo, birthRegistrationNo, fatherMobile, [class+session+year], [class+year], [class+session], [class+section], [class+roll], [year+session], [class+group], [studentId+class]',
      masterSubjects: 'id, code, name, category, isActive',
      examRoutines: 'id, examId, className, subjectName, examDate, [examId+className]',
      classTeacherAssignments: 'id, classId, teacherId, academicYear',
      subjectTeacherAssignments: 'id, classId, subjectId, teacherId, academicYear',
      payrollMonthlySheets: 'id, month, year, status',
      financialTransactions: 'id, voucherNo, date, type, category, status, paymentMethod, studentId, staffId, [type+date], [type+category]',
      communicationDrafts: 'id, type, updatedAt',
      followupCampaigns: 'id, institutionId, academicYear, status, [academicYear+status]',
      followupTeams: 'id, campaignId, leaderId',
      followupAssignments: 'id, campaignId, teamId, studentId, status, scheduledDate, [teamId+status], [campaignId+studentId]',
      followupVisits: 'id, campaignId, assignmentId, studentId, visitDate, status, [studentId+status], [campaignId+teamId]',
      syncQueue: 'id, entityType, status, createdAt',
      messageQueue: 'id, recipientId, status, createdAt'
    });



    // Version 12 (Student Guardian & Attendance Module, Fixing missing tables)
    this.version(12).stores({
      students: 'id, studentId, name, roll, class, session, year, section, group, gender, registrationNo, birthRegistrationNo, fatherMobile, [class+session+year], [class+year], [class+session], [class+section], [class+roll], [year+session], [class+group], [studentId+class]',
      examResults: 'id, studentId, boardRollNo, registrationNo, examName, passingYear, session, group, [examName+passingYear], [examName+session], [examName+group], [studentId+examName], [boardRollNo+passingYear]',
      staff: 'id, name, designation, role, contact',
      classes: 'id, name, isDefault',
      groups: 'id, name, isDefault',
      sections: 'id, name, isDefault',
      sessions: 'id, name, isDefault',
      issuedTestimonials: 'id, studentId, issueDate, format, [studentId+issueDate], [studentId+format]',
      curriculums: 'id, code, name, status, isDefault',
      curriculumMappings: 'id, curriculumId, className, subjectCode, [curriculumId+className], [curriculumId+subjectCode]',
      masterSubjects: 'id, code, name, category, isActive',
      examRoutines: 'id, examId, className, subjectName, examDate, [examId+className]',
      classTeacherAssignments: 'id, classId, teacherId, academicYear',
      subjectTeacherAssignments: 'id, classId, subjectId, teacherId, academicYear',
      payrollMonthlySheets: 'id, month, year, status',
      financialTransactions: 'id, voucherNo, date, type, category, status, paymentMethod, studentId, staffId, [type+date], [type+category]',
      communicationDrafts: 'id, type, updatedAt',
      followupCampaigns: 'id, institutionId, academicYear, status, [academicYear+status]',
      followupTeams: 'id, campaignId, leaderId',
      followupAssignments: 'id, campaignId, teamId, studentId, status, scheduledDate, [teamId+status], [campaignId+studentId]',
      followupVisits: 'id, campaignId, assignmentId, studentId, visitDate, status, [studentId+status], [campaignId+teamId]',
      syncQueue: 'id, entityType, status, createdAt',
      messageQueue: 'id, recipientId, status, createdAt',
      
      studentAttendance: 'id, studentId, classId, sectionId, date, status, [studentId+date], [classId+sectionId+date]',
      guardians: 'id, primaryContact, relation',
      student_guardians: 'id, studentId, guardianId, relation',
      
      // Fixing test missing DB tables
      invoices: 'id, studentId, date', 
      journals: 'id, date',
      journalLines: 'id, journalId, accountId',
      employmentTerms: 'id, staffId',
      payrollDisbursements: 'id, runId, date',
      payrollSlips: 'id, staffId, runId',
      payrollRuns: 'id, date',
      payPolicies: 'id, name',
      staffAttendance: 'id, staffId, date, status, [staffId+date]'
    });

    // Version 13 (Academic Structure & Durable Admission Years Persistence)
    this.version(13).stores({
      admissionYears: 'id, year, isDefault'
    });
  }
}

export const db = new BiddalokDB();

/**
 * Normalizes a student record to guarantee non-undefined compound index keys
 */
export function normalizeStudentForDexie(student: Student): Student {
  return {
    ...student,
    id: student.id || `std_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    studentId: student.studentId || '',
    name: student.name || '',
    roll: student.roll || '',
    class: student.class || '',
    session: student.session || '',
    year: student.year || '',
    section: student.section || '',
    group: student.group || '',
    gender: student.gender || 'Male',
    registrationNo: student.registrationNo || '',
    birthRegistrationNo: student.birthRegistrationNo || '',
    fatherMobile: student.fatherMobile || '',
  };
}

/**
 * Normalizes an exam result record for compound indexing
 */
export function normalizeExamResultForDexie(result: ExamResult): ExamResult {
  return {
    ...result,
    id: result.id || `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    studentId: result.studentId || '',
    name: result.name || '',
    boardRollNo: result.boardRollNo || '',
    registrationNo: result.registrationNo || '',
    examName: result.examName || '',
    passingYear: result.passingYear || '',
    session: result.session || '',
    group: result.group || '',
    board: result.board || '',
    gpa: result.gpa || '',
  };
}

export interface StudentQueryFilters {
  class?: string;
  session?: string;
  year?: string;
  section?: string;
  group?: string;
  gender?: string;
  roll?: string;
  studentId?: string;
  searchTerm?: string;
}

/**
 * High-performance query using Dexie compound indexes.
 * Automatically chooses the optimal compound index B-tree based on provided filters to prevent UI freezing.
 */
export async function queryStudentsIndexed(filters: StudentQueryFilters): Promise<Student[]> {
  const { class: cls, session, year, section, group, roll, studentId, gender, searchTerm } = filters;

  const hasClass = Boolean(cls && cls !== 'all' && cls.trim());
  const hasSession = Boolean(session && session !== 'all' && session.trim());
  const hasYear = Boolean(year && year !== 'all' && year.trim());
  const hasSection = Boolean(section && section !== 'all' && section.trim());
  const hasRoll = Boolean(roll && roll.trim());
  const hasGroup = Boolean(group && group !== 'all' && group.trim());
  const hasStudentId = Boolean(studentId && studentId.trim());

  let collection: Dexie.Collection<Student, string>;

  // 1. Utilize Most Specific Compound Index
  if (hasClass && hasSession && hasYear) {
    collection = db.students.where('[class+session+year]').equals([cls!, session!, year!]);
  } else if (hasClass && hasRoll) {
    collection = db.students.where('[class+roll]').equals([cls!, roll!]);
  } else if (hasClass && hasSection) {
    collection = db.students.where('[class+section]').equals([cls!, section!]);
  } else if (hasClass && hasYear) {
    collection = db.students.where('[class+year]').equals([cls!, year!]);
  } else if (hasClass && hasSession) {
    collection = db.students.where('[class+session]').equals([cls!, session!]);
  } else if (hasClass && hasGroup) {
    collection = db.students.where('[class+group]').equals([cls!, group!]);
  } else if (hasYear && hasSession) {
    collection = db.students.where('[year+session]').equals([year!, session!]);
  } else if (hasStudentId && hasClass) {
    collection = db.students.where('[studentId+class]').equals([studentId!, cls!]);
  } else if (hasClass) {
    collection = db.students.where('class').equals(cls!);
  } else if (hasYear) {
    collection = db.students.where('year').equals(year!);
  } else if (hasSession) {
    collection = db.students.where('session').equals(session!);
  } else if (hasStudentId) {
    collection = db.students.where('studentId').equals(studentId!);
  } else if (hasRoll) {
    collection = db.students.where('roll').equals(roll!);
  } else {
    collection = db.students.toCollection();
  }

  // 2. Load indexed subset
  let results = await collection.toArray();

  // 3. Secondary in-memory filtering for remaining criteria on the already index-filtered small set
  if (hasSection) {
    results = results.filter(s => s.section === section);
  }
  if (hasGroup) {
    results = results.filter(s => s.group === group);
  }
  if (gender && gender !== 'all') {
    results = results.filter(s => s.gender === gender);
  }
  if (hasSession) {
    results = results.filter(s => s.session === session);
  }
  if (hasYear) {
    results = results.filter(s => s.year === year);
  }

  // 4. Search Term filtering (Bangla + English name, ID, Roll, Reg, Mobile, Guardian)
  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.trim().toLowerCase();
    results = results.filter(s => 
      s.name?.toLowerCase().includes(term) ||
      s.nameBn?.includes(term) ||
      s.studentId?.toLowerCase().includes(term) ||
      s.roll?.toLowerCase().includes(term) ||
      s.registrationNo?.toLowerCase().includes(term) ||
      s.birthRegistrationNo?.includes(term) ||
      s.fatherMobile?.includes(term) ||
      s.fatherName?.toLowerCase().includes(term) ||
      s.fatherNameBn?.includes(term) ||
      s.motherName?.toLowerCase().includes(term) ||
      s.motherNameBn?.includes(term)
    );
  }

  return results;
}

export interface ExamResultQueryFilters {
  examName?: string;
  passingYear?: string;
  session?: string;
  group?: string;
  studentId?: string;
  boardRollNo?: string;
  searchTerm?: string;
}

/**
 * High-performance query for Exam Results using compound indexes
 */
export async function queryExamResultsIndexed(filters: ExamResultQueryFilters): Promise<ExamResult[]> {
  const { examName, passingYear, session, group, studentId, boardRollNo, searchTerm } = filters;

  const hasExam = Boolean(examName && examName !== 'all' && examName.trim());
  const hasYear = Boolean(passingYear && passingYear !== 'all' && passingYear.trim());
  const hasSession = Boolean(session && session !== 'all' && session.trim());
  const hasGroup = Boolean(group && group !== 'all' && group.trim());
  const hasStudentId = Boolean(studentId && studentId.trim());
  const hasBoardRoll = Boolean(boardRollNo && boardRollNo.trim());

  let collection: Dexie.Collection<ExamResult, string>;

  if (hasExam && hasYear) {
    collection = db.examResults.where('[examName+passingYear]').equals([examName!, passingYear!]);
  } else if (hasExam && hasSession) {
    collection = db.examResults.where('[examName+session]').equals([examName!, session!]);
  } else if (hasExam && hasGroup) {
    collection = db.examResults.where('[examName+group]').equals([examName!, group!]);
  } else if (hasStudentId && hasExam) {
    collection = db.examResults.where('[studentId+examName]').equals([studentId!, examName!]);
  } else if (hasBoardRoll && hasYear) {
    collection = db.examResults.where('[boardRollNo+passingYear]').equals([boardRollNo!, passingYear!]);
  } else if (hasExam) {
    collection = db.examResults.where('examName').equals(examName!);
  } else if (hasYear) {
    collection = db.examResults.where('passingYear').equals(passingYear!);
  } else if (hasSession) {
    collection = db.examResults.where('session').equals(session!);
  } else if (hasStudentId) {
    collection = db.examResults.where('studentId').equals(studentId!);
  } else if (hasBoardRoll) {
    collection = db.examResults.where('boardRollNo').equals(boardRollNo!);
  } else {
    collection = db.examResults.toCollection();
  }

  let results = await collection.toArray();

  if (hasSession) {
    results = results.filter(r => r.session === session);
  }
  if (hasGroup) {
    results = results.filter(r => r.group === group);
  }

  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.trim().toLowerCase();
    results = results.filter(r => 
      r.name?.toLowerCase().includes(term) ||
      r.nameBn?.includes(term) ||
      r.studentId?.toLowerCase().includes(term) ||
      r.boardRollNo?.toLowerCase().includes(term) ||
      r.registrationNo?.toLowerCase().includes(term) ||
      r.fatherName?.toLowerCase().includes(term) ||
      r.motherName?.toLowerCase().includes(term)
    );
  }

  return results;
}

/**
 * Fast bulk synchronization of students into Dexie DB with compound index normalization
 */
export async function syncStudentsToDexie(students: Student[]): Promise<void> {
  if (!students || students.length === 0) return;
  try {
    const normalized = students.map(normalizeStudentForDexie);
    await db.students.bulkPut(normalized);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put students:', err);
  }
}

/**
 * Fast bulk deletion of students from Dexie
 */
export async function deleteStudentsFromDexie(ids: string[]): Promise<void> {
  if (!ids || ids.length === 0) return;
  try {
    await db.students.bulkDelete(ids);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk delete students:', err);
  }
}

/**
 * Fast sync single student
 */
export async function syncStudentToDexie(student: Student): Promise<void> {
  if (!student) return;
  try {
    await db.students.put(normalizeStudentForDexie(student));
  } catch (err) {
    console.warn('[DexieSync] Failed to put student:', err);
  }
}

/**
 * Fast delete single student
 */
export async function deleteStudentFromDexie(id: string): Promise<void> {
  if (!id) return;
  try {
    await db.students.delete(id);
  } catch (err) {
    console.warn('[DexieSync] Failed to delete student:', err);
  }
}

/**
 * Fast bulk sync of exam results
 */
export async function syncExamResultsToDexie(results: ExamResult[]): Promise<void> {
  if (!results || results.length === 0) return;
  try {
    const normalized = results.map(normalizeExamResultForDexie);
    await db.examResults.bulkPut(normalized);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put exam results:', err);
  }
}

/**
 * Fast bulk delete of exam results
 */
export async function deleteExamResultsFromDexie(ids: string[]): Promise<void> {
  if (!ids || ids.length === 0) return;
  try {
    await db.examResults.bulkDelete(ids);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk delete exam results:', err);
  }
}

/**
 * Fast sync for Staff
 */
export async function syncStaffToDexie(staffList: StaffMember[]): Promise<void> {
  if (!staffList || staffList.length === 0) return;
  try {
    await db.staff.bulkPut(staffList);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put staff:', err);
  }
}

export async function syncStaffMemberToDexie(member: StaffMember): Promise<void> {
  if (!member) return;
  try {
    await db.staff.put(member);
  } catch (err) {
    console.warn('[DexieSync] Failed to put staff:', err);
  }
}

export async function deleteStaffMemberFromDexie(id: string): Promise<void> {
  if (!id) return;
  try {
    await db.staff.delete(id);
  } catch (err) {
    console.warn('[DexieSync] Failed to delete staff:', err);
  }
}

export async function deleteStaffFromDexie(ids: string[]): Promise<void> {
  if (!ids || ids.length === 0) return;
  try {
    await db.staff.bulkDelete(ids);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk delete staff:', err);
  }
}

/**
 * Fast sync for Classes
 */
export async function syncClassesToDexie(classes: AcademicClass[]): Promise<void> {
  if (!classes || classes.length === 0) return;
  try {
    await db.classes.bulkPut(classes);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put classes:', err);
  }
}

export async function syncClassToDexie(cls: AcademicClass): Promise<void> {
  if (!cls) return;
  try {
    await db.classes.put(cls);
  } catch (err) {
    console.warn('[DexieSync] Failed to put class:', err);
  }
}

export async function deleteClassFromDexie(id: string): Promise<void> {
  if (!id) return;
  try {
    await db.classes.delete(id);
  } catch (err) {
    console.warn('[DexieSync] Failed to delete class:', err);
  }
}

/**
 * Fast sync for Groups
 */
export async function syncGroupsToDexie(groups: AcademicGroup[]): Promise<void> {
  if (!groups || groups.length === 0) return;
  try {
    await db.groups.bulkPut(groups);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put groups:', err);
  }
}

export async function syncGroupToDexie(grp: AcademicGroup): Promise<void> {
  if (!grp) return;
  try {
    await db.groups.put(grp);
  } catch (err) {
    console.warn('[DexieSync] Failed to put group:', err);
  }
}

export async function deleteGroupFromDexie(id: string): Promise<void> {
  if (!id) return;
  try {
    await db.groups.delete(id);
  } catch (err) {
    console.warn('[DexieSync] Failed to delete group:', err);
  }
}

/**
 * Fast sync for Sections
 */
export async function syncSectionsToDexie(sections: AcademicSection[]): Promise<void> {
  if (!sections || sections.length === 0) return;
  try {
    await db.sections.bulkPut(sections);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put sections:', err);
  }
}

export async function syncSectionToDexie(sec: AcademicSection): Promise<void> {
  if (!sec) return;
  try {
    await db.sections.put(sec);
  } catch (err) {
    console.warn('[DexieSync] Failed to put section:', err);
  }
}

export async function deleteSectionFromDexie(id: string): Promise<void> {
  if (!id) return;
  try {
    await db.sections.delete(id);
  } catch (err) {
    console.warn('[DexieSync] Failed to delete section:', err);
  }
}

/**
 * Fast sync for Sessions
 */
export async function syncSessionsToDexie(sessions: AcademicSession[]): Promise<void> {
  if (!sessions || sessions.length === 0) return;
  try {
    await db.sessions.bulkPut(sessions);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put sessions:', err);
  }
}

export async function syncSessionToDexie(session: AcademicSession): Promise<void> {
  if (!session) return;
  try {
    await db.sessions.put(session);
  } catch (err) {
    console.warn('[DexieSync] Failed to put session:', err);
  }
}

export async function deleteSessionFromDexie(id: string): Promise<void> {
  if (!id) return;
  try {
    await db.sessions.delete(id);
  } catch (err) {
    console.warn('[DexieSync] Failed to delete session:', err);
  }
}

/**
 * Fast sync for Admission Years
 */
export async function syncAdmissionYearsToDexie(years: AdmissionYearItem[]): Promise<void> {
  if (!years || years.length === 0) return;
  try {
    await db.admissionYears.bulkPut(years);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put admission years:', err);
  }
}

export async function syncAdmissionYearToDexie(yr: AdmissionYearItem): Promise<void> {
  if (!yr) return;
  try {
    await db.admissionYears.put(yr);
  } catch (err) {
    console.warn('[DexieSync] Failed to put admission year:', err);
  }
}

export async function deleteAdmissionYearFromDexie(id: string): Promise<void> {
  if (!id) return;
  try {
    await db.admissionYears.delete(id);
  } catch (err) {
    console.warn('[DexieSync] Failed to delete admission year:', err);
  }
}

/**
 * Fast sync for Testimonials
 */
export async function syncTestimonialToDexie(test: IssuedTestimonial): Promise<void> {
  if (!test) return;
  try {
    await db.issuedTestimonials.put(test);
  } catch (err) {
    console.warn('[DexieSync] Failed to put testimonial:', err);
  }
}

export async function syncTestimonialsToDexie(testimonials: IssuedTestimonial[]): Promise<void> {
  if (!testimonials || testimonials.length === 0) return;
  try {
    await db.issuedTestimonials.bulkPut(testimonials);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put testimonials:', err);
  }
}

export async function deleteTestimonialFromDexie(id: string): Promise<void> {
  if (!id) return;
  try {
    await db.issuedTestimonials.delete(id);
  } catch (err) {
    console.warn('[DexieSync] Failed to delete testimonial:', err);
  }
}

/**
 * Fast sync for Curriculums, Mappings, Master Subjects, Routines, Assignments, Payroll
 */
export async function syncCurriculumsToDexie(curriculums: CurriculumDefinition[]): Promise<void> {
  if (!curriculums || curriculums.length === 0) return;
  try {
    await db.curriculums.bulkPut(curriculums);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put curriculums:', err);
  }
}

export async function syncCurriculumMappingsToDexie(mappings: CurriculumSubjectMapping[]): Promise<void> {
  if (!mappings || mappings.length === 0) return;
  try {
    await db.curriculumMappings.bulkPut(mappings);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put curriculum mappings:', err);
  }
}

export async function syncMasterSubjectsToDexie(subjects: MasterSubject[]): Promise<void> {
  if (!subjects || subjects.length === 0) return;
  try {
    await db.masterSubjects.bulkPut(subjects);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put master subjects:', err);
  }
}

export async function syncExamRoutinesToDexie(routines: ExamRoutineItem[]): Promise<void> {
  if (!routines || routines.length === 0) return;
  try {
    await db.examRoutines.bulkPut(routines);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put exam routines:', err);
  }
}

export async function syncClassTeacherAssignmentsToDexie(assignments: ClassTeacherAssignment[]): Promise<void> {
  if (!assignments || assignments.length === 0) return;
  try {
    await db.classTeacherAssignments.bulkPut(assignments);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put class teacher assignments:', err);
  }
}

export async function syncSubjectTeacherAssignmentsToDexie(assignments: SubjectTeacherAssignment[]): Promise<void> {
  if (!assignments || assignments.length === 0) return;
  try {
    await db.subjectTeacherAssignments.bulkPut(assignments);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put subject teacher assignments:', err);
  }
}

export async function syncPayrollSheetsToDexie(sheets: PayrollMonthlySheet[]): Promise<void> {
  if (!sheets || sheets.length === 0) return;
  try {
    await db.payrollMonthlySheets.bulkPut(sheets);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put payroll sheets:', err);
  }
}

export async function syncFinancialTransactionsToDexie(transactions: FinancialTransaction[]): Promise<void> {
  if (!transactions || transactions.length === 0) return;
  try {
    await db.financialTransactions.bulkPut(transactions);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put financial transactions:', err);
  }
}

export async function syncFinancialTransactionToDexie(tx: FinancialTransaction): Promise<void> {
  try {
    await db.financialTransactions.put(tx);
  } catch (err) {
    console.warn('[DexieSync] Failed to put single financial transaction:', err);
  }
}

export async function deleteFinancialTransactionFromDexie(id: string): Promise<void> {
  try {
    await db.financialTransactions.delete(id);
  } catch (err) {
    console.warn('[DexieSync] Failed to delete financial transaction:', err);
    throw err;
  }
}

/**
 * Follow-up Module Dexie Sync & Persistence (Phase 4 / F-04, F-16)
 */
export async function syncFollowupCampaignToDexie(campaign: FollowupCampaign): Promise<void> {
  if (!campaign) return;
  try {
    await db.followupCampaigns.put(campaign);
  } catch (err) {
    console.warn('[DexieSync] Failed to put followup campaign:', err);
    throw err;
  }
}

export async function syncFollowupCampaignsToDexie(campaigns: FollowupCampaign[]): Promise<void> {
  if (!campaigns || campaigns.length === 0) return;
  try {
    await db.followupCampaigns.bulkPut(campaigns);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put followup campaigns:', err);
    throw err;
  }
}

export async function deleteFollowupCampaignFromDexie(id: string): Promise<void> {
  if (!id) return;
  try {
    await db.followupCampaigns.delete(id);
  } catch (err) {
    console.warn('[DexieSync] Failed to delete followup campaign:', err);
    throw err;
  }
}

export async function syncFollowupTeamToDexie(team: FollowupTeam): Promise<void> {
  if (!team) return;
  try {
    await db.followupTeams.put(team);
  } catch (err) {
    console.warn('[DexieSync] Failed to put followup team:', err);
    throw err;
  }
}

export async function syncFollowupTeamsToDexie(teams: FollowupTeam[]): Promise<void> {
  if (!teams || teams.length === 0) return;
  try {
    await db.followupTeams.bulkPut(teams);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put followup teams:', err);
    throw err;
  }
}

export async function deleteFollowupTeamFromDexie(id: string): Promise<void> {
  if (!id) return;
  try {
    await db.followupTeams.delete(id);
  } catch (err) {
    console.warn('[DexieSync] Failed to delete followup team:', err);
    throw err;
  }
}

export async function syncFollowupAssignmentToDexie(assignment: FollowupAssignment): Promise<void> {
  if (!assignment) return;
  try {
    await db.followupAssignments.put(assignment);
  } catch (err) {
    console.warn('[DexieSync] Failed to put followup assignment:', err);
    throw err;
  }
}

export async function syncFollowupAssignmentsToDexie(assignments: FollowupAssignment[]): Promise<void> {
  if (!assignments || assignments.length === 0) return;
  try {
    await db.followupAssignments.bulkPut(assignments);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put followup assignments:', err);
    throw err;
  }
}

export async function deleteFollowupAssignmentFromDexie(id: string): Promise<void> {
  if (!id) return;
  try {
    await db.followupAssignments.delete(id);
  } catch (err) {
    console.warn('[DexieSync] Failed to delete followup assignment:', err);
    throw err;
  }
}

export async function syncFollowupVisitToDexie(visit: FollowupVisit): Promise<void> {
  if (!visit) return;
  try {
    await db.followupVisits.put(visit);
  } catch (err) {
    console.warn('[DexieSync] Failed to put followup visit:', err);
    throw err;
  }
}

export async function syncFollowupVisitsToDexie(visits: FollowupVisit[]): Promise<void> {
  if (!visits || visits.length === 0) return;
  try {
    await db.followupVisits.bulkPut(visits);
  } catch (err) {
    console.warn('[DexieSync] Failed to bulk put followup visits:', err);
    throw err;
  }
}

export async function deleteFollowupVisitFromDexie(id: string): Promise<void> {
  if (!id) return;
  try {
    await db.followupVisits.delete(id);
  } catch (err) {
    console.warn('[DexieSync] Failed to delete followup visit:', err);
    throw err;
  }
}

/**
 * Completely clears all Dexie tables with 100% domain coverage including Follow-up and Ledger
 */
export async function clearAllDexieTables(): Promise<void> {
  try {
    await Promise.all([
      db.students.clear(),
      db.examResults.clear(),
      db.staff.clear(),
      db.classes.clear(),
      db.groups.clear(),
      db.sections.clear(),
      db.sessions.clear(),
      db.admissionYears.clear(),
      db.issuedTestimonials.clear(),
      db.curriculums.clear(),
      db.curriculumMappings.clear(),
      db.masterSubjects.clear(),
      db.examRoutines.clear(),
      db.classTeacherAssignments.clear(),
      db.subjectTeacherAssignments.clear(),
      db.payrollMonthlySheets.clear(),
      db.financialTransactions.clear(),
      db.communicationDrafts.clear(),
      db.followupCampaigns.clear(),
      db.followupTeams.clear(),
      db.followupAssignments.clear(),
      db.followupVisits.clear(),
      db.schemaMigrations.clear(),
      db.quarantineRecords.clear(),
    ]);
    console.log('[DexieSync] All Dexie tables cleared with 100% domain coverage.');
  } catch (error) {
    console.error('[DexieSync] Failed to clear Dexie tables:', error);
    throw error;
  }
}

/**
 * Hydrates all domains from Dexie into in-memory store representation.
 * Guarantees that finance, follow-up, and academic domains are restored
 * regardless of whether student list is empty or not!
 */
export async function hydrateAllDexieData(): Promise<Record<string, any>> {
  try {
    const [
      students,
      examResults,
      staff,
      classes,
      groups,
      sections,
      sessions,
      admissionYears,
      issuedTestimonials,
      curriculums,
      curriculumMappings,
      masterSubjects,
      examRoutines,
      classTeacherAssignments,
      subjectTeacherAssignments,
      payrollMonthlySheets,
      financialTransactions,
      followupCampaigns,
      followupTeams,
      followupAssignments,
      followupVisits,
    ] = await Promise.all([
      db.students.toArray(),
      db.examResults.toArray(),
      db.staff.toArray(),
      db.classes.toArray(),
      db.groups.toArray(),
      db.sections.toArray(),
      db.sessions.toArray(),
      db.admissionYears.toArray(),
      db.issuedTestimonials.toArray(),
      db.curriculums.toArray(),
      db.curriculumMappings.toArray(),
      db.masterSubjects.toArray(),
      db.examRoutines.toArray(),
      db.classTeacherAssignments.toArray(),
      db.subjectTeacherAssignments.toArray(),
      db.payrollMonthlySheets.toArray(),
      db.financialTransactions.toArray(),
      db.followupCampaigns.toArray(),
      db.followupTeams.toArray(),
      db.followupAssignments.toArray(),
      db.followupVisits.toArray(),
    ]);

    return {
      students,
      examResults,
      staff,
      academicClasses: classes,
      academicGroups: groups,
      academicSections: sections,
      academicSessions: sessions,
      admissionYears,
      issuedTestimonials,
      curriculums,
      curriculumMappings,
      masterSubjects,
      examRoutines,
      classTeacherAssignments,
      subjectTeacherAssignments,
      payrollMonthlySheets,
      financialTransactions,
      followupCampaigns,
      followupTeams,
      followupAssignments,
      followupVisits,
    };
  } catch (err) {
    console.warn('[DexieHydrate] Error hydrating data from Dexie:', err);
    return {};
  }
}

export async function migrateZustandToDexie(zustandState: any, force = false) {
  const isMigrated = localStorage.getItem('dexie_migrated_v4');
  if (isMigrated === 'true' && !force) return;

  try {
    console.log('Migrating and mapping all data to Dexie High-Performance Database (v4/v7)...');
    
    // 1. Students
    if (zustandState.students?.length) {
      const normalizedStudents = zustandState.students.map(normalizeStudentForDexie);
      await db.students.bulkPut(normalizedStudents);
    }
    // 2. Exam Results
    if (zustandState.examResults?.length) {
      const normalizedResults = zustandState.examResults.map(normalizeExamResultForDexie);
      await db.examResults.bulkPut(normalizedResults);
    }
    // 3. Staff
    if (zustandState.staff?.length) {
      await db.staff.bulkPut(zustandState.staff);
    }
    // 4. Academic Classes
    if (zustandState.academicClasses?.length) {
      await db.classes.bulkPut(zustandState.academicClasses);
    }
    // 5. Academic Groups
    if (zustandState.academicGroups?.length) {
      await db.groups.bulkPut(zustandState.academicGroups);
    }
    // 6. Academic Sections
    if (zustandState.academicSections?.length) {
      await db.sections.bulkPut(zustandState.academicSections);
    }
    // 7. Academic Sessions
    if (zustandState.academicSessions?.length) {
      await db.sessions.bulkPut(zustandState.academicSessions);
    }
    // 7.1 Admission Years
    if (zustandState.admissionYears?.length) {
      await db.admissionYears.bulkPut(zustandState.admissionYears);
    }
    // 8. Issued Testimonials
    if (zustandState.issuedTestimonials?.length) {
      await db.issuedTestimonials.bulkPut(zustandState.issuedTestimonials);
    }
    // 9. Curriculums
    if (zustandState.curriculums?.length) {
      await db.curriculums.bulkPut(zustandState.curriculums);
    }
    // 10. Curriculum Mappings
    if (zustandState.curriculumMappings?.length) {
      await db.curriculumMappings.bulkPut(zustandState.curriculumMappings);
    }
    // 11. Master Subjects
    if (zustandState.masterSubjects?.length) {
      await db.masterSubjects.bulkPut(zustandState.masterSubjects);
    }
    // 12. Exam Routines
    if (zustandState.examRoutines?.length) {
      await db.examRoutines.bulkPut(zustandState.examRoutines);
    }
    // 13. Class Teacher Assignments
    if (zustandState.classTeacherAssignments?.length) {
      await db.classTeacherAssignments.bulkPut(zustandState.classTeacherAssignments);
    }
    // 14. Subject Teacher Assignments
    if (zustandState.subjectTeacherAssignments?.length) {
      await db.subjectTeacherAssignments.bulkPut(zustandState.subjectTeacherAssignments);
    }
    // 15. Payroll Monthly Sheets
    if (zustandState.payrollMonthlySheets?.length) {
      await db.payrollMonthlySheets.bulkPut(zustandState.payrollMonthlySheets);
    }
    // 16. Financial Transactions
    if (zustandState.financialTransactions?.length) {
      await db.financialTransactions.bulkPut(zustandState.financialTransactions);
    }
    // 17. Follow-up Campaigns, Teams, Assignments, Visits
    if (zustandState.followupCampaigns?.length) {
      await db.followupCampaigns.bulkPut(zustandState.followupCampaigns);
    }
    if (zustandState.followupTeams?.length) {
      await db.followupTeams.bulkPut(zustandState.followupTeams);
    }
    if (zustandState.followupAssignments?.length) {
      await db.followupAssignments.bulkPut(zustandState.followupAssignments);
    }
    if (zustandState.followupVisits?.length) {
      await db.followupVisits.bulkPut(zustandState.followupVisits);
    }

    localStorage.setItem('dexie_migrated_v4', 'true');
    console.log('Migration to Dexie completed successfully with 100% domain coverage including follow-up.');
  } catch (error) {
    console.error('Failed to migrate data to Dexie:', error);
  }
}





export async function requestStoragePersistence() {
  if (navigator.storage && navigator.storage.persist) {
    const isPersisted = await navigator.storage.persisted();
    if (!isPersisted) {
      const granted = await navigator.storage.persist();
      console.log(granted ? 'Storage persistence granted' : 'Storage persistence denied');
      return granted;
    }
    return true;
  }
  return false;
}

export async function checkStorageQuota() {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    console.log(`Storage Quota: ${(estimate.usage || 0) / 1024 / 1024}MB / ${(estimate.quota || 0) / 1024 / 1024}MB`);
    return estimate;
  }
  return null;
}
