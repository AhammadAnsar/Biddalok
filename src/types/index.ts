export type Language = 'bn' | 'en';

export interface Institution {
  name: string; // Used as primary/English name
  nameBn?: string;
  eiin: string;
  mpoCode?: string;
  schoolCode?: string;
  address: string; // Used as primary/English address
  addressBn?: string;
  established: string;
  headmasterName: string; // Used as primary/English headmaster
  headmasterNameBn?: string;
  headmasterTitle?: string;
  headmasterTitleBn?: string;
  headmasterSignature?: string;
  logoUrl?: string;
  mobile?: string;
  website?: string;
  email?: string;
  examCenter?: string;
  defaultDivision?: string;
  defaultDistrict?: string;
  defaultUpazila?: string;
  defaultUnion?: string;
  defaultPostOffice?: string;
  defaultVillage?: string;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  nameBn?: string;
  
  // Enrollment info
  formNo?: string;
  applicationDate?: string;

  // Demographics
  birthRegistrationNo?: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female' | 'Other';
  nationality?: string;
  religion?: string;
  maritalStatus?: string;
  disability?: string;
  bloodGroup?: string;

  // Permanent Address
  houseNo?: string;
  para?: string;
  village: string;
  postOffice: string;
  upazila: string;
  district: string;
  division?: string;
  union?: string;

  // Present Address
  isAddressSame?: boolean;
  presentHouseNo?: string;
  presentPara?: string;
  presentVillage?: string;
  presentPostOffice?: string;
  presentUnion?: string;
  presentUpazila?: string;
  presentDistrict?: string;

  // Father Info
  fatherName: string;
  fatherNameBn?: string;
  fatherNid?: string;
  fatherDob?: string;
  fatherMobile?: string;
  fatherProfession?: string;
  fatherIncome?: string;

  // Mother Info
  motherName: string;
  motherNameBn?: string;
  motherNid?: string;
  motherDob?: string;
  motherMobile?: string;
  motherProfession?: string;
  motherIncome?: string;

  // Parent Status
  parentsStatus?: string;
  fatherDeathYear?: string;
  motherDeathYear?: string;
  fatherDeathCause?: string;
  motherDeathCause?: string;

  // Guardian
  guardianRelation?: string;
  guardianName?: string;
  guardianNameEn?: string;
  guardianNid?: string;
  guardianDob?: string;
  guardianProfession?: string;
  guardianIncome?: string;
  guardianMobile?: string;

  // Sibling
  hasSibling?: boolean;
  siblingClass?: string;
  siblingSection?: string;
  siblingRoll?: string;
  siblingName?: string;
  siblingId?: string;

  // Previous Education
  prevSchoolName?: string;
  prevClass?: string;
  prevPassingYear?: string;
  prevRoll?: string;
  prevRegistrationNo?: string;
  prevBoard?: string;
  prevTcNo?: string;

  // Payment & Facility
  admissionPayment?: string;
  paymentMethod?: string;
  transactionNo?: string;
  specialFacility?: string;

  // Academic Info (Current)
  session: string;
  class: string;
  section?: string;
  roll: string;
  passingYear: string;
  gpa: string;
  registrationNo: string;
  board: string;
  group: string;

  // Documents
  photo?: string;
  documentBirthCertificate?: string;
  documentFatherNid?: string;
  documentMotherNid?: string;
  documentRegistrationCard?: string;
  documentTc?: string;
}

export interface AcademicClass {
  id: string;
  name: string;
  nameBn?: string;
  isDefault: boolean;
}

export interface AcademicGroup {
  id: string;
  name: string;
  nameBn?: string;
  isDefault?: boolean;
}

export interface AcademicSection {
  id: string;
  name: string;
  nameBn?: string;
  isDefault?: boolean;
}

export interface TestimonialSettings {
  format: string;
  signatoryName: string;
  signatoryTitle: string;
  preparerName?: string;
  preparerTitle?: string;
  verifierName?: string;
  verifierTitle?: string;
  studentDataFont?: string;
  certificateDesign?: string;
  customText?: string;
  showLogo?: boolean;
  showQrCode?: boolean;
  examYear?: string;
  preparerSignature?: string;
  verifierSignature?: string;
  signatorySignature?: string;

  // Smart Typography & Spacing Controls
  instNameFontSize?: number;
  bodyFontSize?: number;
  bodyLineHeight?: number;
  titleFontSize?: number;
  titleTopSpace?: number;
  titleBottomSpace?: number;
  paragraphSpacing?: number;
  closingTopSpace?: number;
  closingFontSize?: number;

  // Page Margins (in inches)
  pageMargin?: number;
  pageMarginTop?: number;
  pageMarginBottom?: number;
  pageMarginLeft?: number;
  pageMarginRight?: number;
  frameStyle?: string;
}

export interface IssuedTestimonial {
  id: string;
  studentId: string;
  issueDate: string;
  format: string;
}

export interface ExamResult {
  id: string;
  studentDbId?: string;
  studentId: string;
  name: string;
  nameBn?: string;
  fatherName: string;
  fatherNameBn?: string;
  motherName: string;
  motherNameBn?: string;
  dateOfBirth: string;
  gender: string;
  village: string;
  postOffice: string;
  upazila: string;
  district: string;
  
  examName: string;
  passingYear: string;
  session: string;
  group: string;
  boardRollNo: string;
  registrationNo: string;
  gpa: string;
  board: string;
  photo?: string;
}

export interface WhiteLabelSettings {
  appName: string;
  appIcon: string;
  enabled: boolean;
}

export type AttestationStudentType = 'currently_studying' | 'previously_studied';

export interface AttestationSettings {
  studentType: AttestationStudentType;
  memoNo: string;
  issueDate: string;
  title: string;
  subtitle: string;
  customBodyP1?: string;
  customBodyP2?: string;
  customBodyP3?: string;
  frameStyle: 'none' | 'simple' | 'double' | 'corner' | 'royal' | 'academic';
  showInstituteLogo: boolean;
  includePhoto: boolean;
  rightLogoType: 'student_photo' | 'manual_logo' | 'none';
  manualRightLogoUrl?: string;
  showQrCode: boolean;
  showSignature: boolean;
  headmasterName?: string;
  headmasterTitle?: string;
  headmasterSignature?: string;
  
  // Custom Typography & Spacing Controls
  instNameFontSize?: number; // e.g. 24
  bodyFontSize?: number; // e.g. 16
  bodyLineHeight?: number; // e.g. 2.2
  titleTopSpace?: number; // e.g. 32
  titleBottomSpace?: number; // e.g. 32
  paragraphSpacing?: number; // e.g. 16
  closingTopSpace?: number; // e.g. 8 (reduced gap before closing wishing sentence)
  closingFontSize?: number; // e.g. 17 or 18

  // Page Margins (in inches)
  pageMargin?: number; // unified margin e.g. 0.4
  pageMarginTop?: number; // e.g. 0.4
  pageMarginBottom?: number; // e.g. 0.4
  pageMarginLeft?: number; // e.g. 0.4
  pageMarginRight?: number; // e.g. 0.4
}

