import { Institution, Student, TestimonialSettings, IssuedTestimonial, ExamResult } from './index';

export interface TestimonialExam {
  id: string;
  institutionId?: string;
  examType: string; // e.g. 'SSC', 'Dakhil', 'JSC', 'PSC', 'HSC', 'Annual'
  examTypeId: string;
  year: string;
  session?: string; // e.g. '2026'
  board: string; // e.g. 'Cumilla', 'Dhaka', 'Rajshahi'
  boardBn?: string;
  displayName: string;
  displayNameBn: string;
  examCenter?: string;
  examCenterBn?: string;
  gradingScale?: string; // default '5.00'
  status?: 'active' | 'archived';
  isFixture?: boolean; // clearly marks demo/fixture records
  createdAt?: string;
  updatedAt?: string;
}

export interface TestimonialRosterItem {
  id: string; // ExamResult id
  studentId: string; // Display student code (e.g. STU-1001)
  studentDbId: string; // Internal immutable database ID (Student.id)
  examId?: string;
  examName: string;
  examNameBn?: string;
  passingYear: string;
  session: string;
  sessionBn?: string;
  group: string;
  groupBn?: string;
  boardRollNo: string;
  boardRollNoBn?: string;
  registrationNo: string;
  registrationNoBn?: string;
  gpa: string;
  gpaBn?: string;
  letterGrade?: string;
  board: string;
  boardBn?: string;
  examCenter?: string;
  examCenterBn?: string;

  // Canonical student identity
  name: string;
  nameBn?: string;
  fatherName: string;
  fatherNameBn?: string;
  motherName: string;
  motherNameBn?: string;
  dateOfBirth: string;
  gender?: string;

  // Canonical address
  village: string;
  villageBn?: string;
  postOffice: string;
  postOfficeBn?: string;
  union?: string;
  unionBn?: string;
  upazila: string;
  upazilaBn?: string;
  district: string;
  districtBn?: string;

  // Statuses & Issuance Linkage
  isIssued?: boolean;
  issuedId?: string;
  issuedSerialNo?: string;
  issuedDate?: string;
  verificationToken?: string;
  issuanceStatus?: 'issued' | 'revoked' | 'reissued';
  distributionStatus?: 'pending' | 'distributed' | 'returned';

  // Official Readiness Gate
  isReady?: boolean;
  missingOfficialFields?: string[];
  activeMissing?: string[];
  missingFieldsBn?: string[];
  missingFieldsEn?: string[];
  isCompleteBn?: boolean;
  isCompleteEn?: boolean;
}

export interface TestimonialReadinessResult {
  isReady: boolean;
  missingFields: string[];
  missingFieldLabelsBn: string[];
  missingFieldLabelsEn: string[];
}

export interface DistributionRegisterEntry {
  id: string;
  examId: string;
  examName: string;
  studentId: string;
  studentDbId?: string;
  studentName: string;
  studentNameBn?: string;
  boardRollNo: string;
  registrationNo: string;
  serialNo: string;
  issueDate: string;
  language: 'bn' | 'en';
  issuanceStatus: 'issued' | 'revoked' | 'reissued';
  distributionStatus: 'pending' | 'distributed' | 'returned';
  distributedAt?: string;
  receivedBy?: string;
  receiverRelation?: string;
  distributedBy?: string;
  remarks?: string;
  verificationToken: string;
  snapshot?: Record<string, any>;
  history?: Array<{
    action: string;
    timestamp: string;
    actor?: string;
    details?: string;
  }>;
}

export const BANGLADESH_EDUCATION_BOARDS = [
  { id: 'dhaka', nameEn: 'Dhaka', nameBn: 'ঢাকা' },
  { id: 'cumilla', nameEn: 'Cumilla', nameBn: 'কুমিল্লা' },
  { id: 'rajshahi', nameEn: 'Rajshahi', nameBn: 'রাজশাহী' },
  { id: 'jashore', nameEn: 'Jashore', nameBn: 'যশোর' },
  { id: 'chittagong', nameEn: 'Chattogram', nameBn: 'চট্টগ্রাম' },
  { id: 'barishal', nameEn: 'Barishal', nameBn: 'বরিশাল' },
  { id: 'sylhet', nameEn: 'Sylhet', nameBn: 'সিলেট' },
  { id: 'dinajpur', nameEn: 'Dinajpur', nameBn: 'দিনাজপুর' },
  { id: 'mymensingh', nameEn: 'Mymensingh', nameBn: 'ময়মনসিংহ' },
  { id: 'madrasah', nameEn: 'Madrasah', nameBn: 'বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড' },
  { id: 'technical', nameEn: 'Technical', nameBn: 'বাংলাদেশ কারিগরি শিক্ষা বোর্ড' },
];

export const DEFAULT_EXAM_TYPES = [
  { id: 'pexam_ssc', name: 'SSC', nameBn: 'মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি)', fullName: 'Secondary School Certificate' },
  { id: 'pexam_dakhil', name: 'Dakhil', nameBn: 'দাখিল', fullName: 'Dakhil Examination' },
  { id: 'pexam_jsc', name: 'JSC', nameBn: 'জুনিয়র স্কুল সার্টিফিকেট (জেএসসি)', fullName: 'Junior School Certificate' },
  { id: 'pexam_jdc', name: 'JDC', nameBn: 'জুনিয়র দাখিল সার্টিফিকেট (জেডিসি)', fullName: 'Junior Dakhil Certificate' },
  { id: 'pexam_psc', name: 'PSC / PECE', nameBn: 'প্রাথমিক শিক্ষা সমাপনী (পিইসিই)', fullName: 'Primary Education Completion' },
  { id: 'pexam_hsc', name: 'HSC', nameBn: 'উচ্চ মাধ্যমিক সার্টিফিকেট (এইচএসসি)', fullName: 'Higher Secondary Certificate' },
  { id: 'pexam_alim', name: 'Alim', nameBn: 'আলিম', fullName: 'Alim Examination' },
  { id: 'pexam_vocational', name: 'SSC (Vocational)', nameBn: 'এসএসসি (ভোকেশনাল)', fullName: 'SSC Vocational Examination' },
];

export const DEFAULT_BOARD_TESTIMONIAL_SETTINGS: Partial<TestimonialSettings> = {
  format: 'board_standard',
  layoutFormat: 'board_standard',
  language: 'bn',
  paperSize: 'a4',
  paperOrientation: 'landscape',
  borderStyle: 'classic_navy',
  showWatermark: true,
  watermarkType: 'logo',
  watermarkOpacity: 0.07,
  logoSize: 64,
  pageMargin: 0.35,
  frameInnerPadding: 0.28,
  bodyLineHeight: 2.2,
  bodyFontSize: 15,
  instNameFontSize: 28,
  instNameColor: '#15803d',
  showLogo: true,
  showQrCode: true,
  showSignatures: true,
  includeSignature: true,
};
