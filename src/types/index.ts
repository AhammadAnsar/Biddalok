export * from './payroll';
export * from './staffHr';
export * from './finance';
export * from './testimonial';

export interface DocumentVerification {
 hasBirthCertBnEn?: boolean;
 fatherNidMatch?: boolean;
 motherNidMatch?: boolean;
 hasAnomalies?: boolean;
 anomaliesDetails?: string;
 specialNote?: string;
 verifiedAt?: string;
 verifiedBy?: string;
}

export type Language = 'bn' | 'en';

export type Role = 'super_admin' | 'admin' | 'teacher' | 'accountant' | 'staff' | 'student';

export interface MasterLookupItem {
 id: string;
 name: string; // English display
 nameBn: string; // Bengali display
 code?: string;
 isSystem?: boolean;
 description?: string;
}

export interface User {
  id: string;
  username: string; // e.g. customStaffId, PDS, or username
  name: string;
  nameBn?: string;
  role: Role;
  staffId?: string; // Relational link to StaffMember.id or customStaffId
  designationId?: string; // Relational link to designation
  designationName?: string; // Display designation in BN / EN
  allowedModules?: string[]; // Custom overrides or designation defaults
  passHash: string;
  salt: string;
  isActive: boolean;
  mustChangePassword?: boolean; // Required first-login password change
  failedLoginAttempts?: number;
  lockedUntil?: number; // Timestamp for brute-force lockout backoff
  lastLoginAt?: string;
  createdAt?: string;
}

export interface DesignationPermission {
 designationId: string; // e.g. 'des_head_teacher', 'des_asst_teacher', or 'role_teacher'
 designationName: string;
 designationNameBn: string;
 role: Role;
 allowedModules: string[];
}

export interface AppModuleDefinition {
 id: string; // 'dashboard' | 'students' | 'academic' | 'hr' | 'examination' | 'testimonial' | 'institution' | 'system' | 'support'
 labelBn: string;
 labelEn: string;
 descriptionBn: string;
 descriptionEn: string;
 path: string;
}

export interface Institution {
 id?: string;
 name: string; // Used as primary/English name
 nameBn?: string;
 eiin: string;
 mpoCode?: string;
 schoolCode?: string;
 address: string; // Used as primary/English address
 addressBn?: string;
 established: string;
 establishedYear?: string;
 board?: string;
 division?: string;
 divisionBn?: string;
 district?: string;
 districtBn?: string;
 upazila?: string;
 upazilaBn?: string;
 pourashava?: string;
 pourashavaBn?: string;
 union?: string;
 unionBn?: string;
 postOffice?: string;
 postOfficeBn?: string;
 houseNo?: string;
 para?: string;
 village?: string;
 headmasterName: string; // Used as primary/English headmaster
 headmasterNameBn?: string;
 headmasterTitle?: string;
 headmasterTitleBn?: string;
 headmasterSignature?: string;
 headmasterPdsId?: string;
 headmasterStaffId?: string;
 headmasterDesignationId?: string;
 logoUrl?: string;
 logo?: string;
 mobile?: string;
 website?: string;
 email?: string;
 examCenter?: string;
 examCenterBn?: string;
 defaultDivision?: string;
 defaultDistrict?: string;
 defaultUpazila?: string;
 defaultUnion?: string;
 defaultPostOffice?: string;
 defaultVillage?: string;
 defaultYear?: string;
 defaultSession?: string;
}

export interface Student {
 documentVerification?: DocumentVerification;
 id: string;
 studentId: string;
 name: string;
 nameBn?: string;
 
 // Enrollment info
 formNo?: string;
 applicationDate?: string;
 year?: string; // ভর্তি শিক্ষাবর্ষ / সাল (e.g. 2026 / ২০২৬)
 admissionYear?: string; // Alias for year

 // Demographics
 birthRegistrationNo?: string;
  stipendEligible?: boolean;
  isStipend?: boolean;
  stipend?: boolean;
  hasScholarship?: boolean;
  isScholarship?: boolean;
  scholarship?: boolean;
 dateOfBirth: string;
 genderId?: string;
 gender: 'Male' | 'Female' | 'Other';
 nationalityId?: string;
 nationality?: string;
 religionId?: string;
 religion?: string;
 maritalStatusId?: string;
 maritalStatus?: string;
 disabilityId?: string;
 disability?: string;
 bloodGroupId?: string;
 bloodGroup?: string;

 // Permanent Address
 divisionId?: string;
 districtId?: string;
 upazilaId?: string;
 unionId?: string;
 postOfficeId?: string;
 villageId?: string;
 houseNo?: string;
 para?: string;
 village: string;
 villageBn?: string;
 postOffice: string;
 postOfficeBn?: string;
 upazila: string;
 upazilaBn?: string;
 district: string;
 districtBn?: string;
 division?: string;
 union?: string;
 unionBn?: string;
 pourashava?: string;
 pourashavaBn?: string;
 wardNo?: string;
 postCode?: string;

 // Present Address
 isAddressSame?: boolean;
 presentDivisionId?: string;
 presentDistrictId?: string;
 presentUpazilaId?: string;
 presentUnionId?: string;
 presentPostOfficeId?: string;
 presentVillageId?: string;
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
 fatherProfessionId?: string;
 fatherProfession?: string;
 fatherIncome?: string;

 // Mother Info
 motherName: string;
 motherNameBn?: string;
 motherNid?: string;
 motherDob?: string;
 motherMobile?: string;
 motherProfessionId?: string;
 motherProfession?: string;
 motherIncome?: string;

 // Parent Status
 parentsStatus?: string;
 fatherDeathYear?: string;
 motherDeathYear?: string;
 fatherDeathCause?: string;
 motherDeathCause?: string;

 // Guardian
 guardianRelationId?: string;
 guardianRelation?: string;
 guardianName?: string;
 guardianNameEn?: string;
 guardianNid?: string;
 guardianDob?: string;
 guardianProfessionId?: string;
 guardianProfession?: string;
 guardianIncome?: string;
 guardianMobile?: string;
 guardianBirthRegistrationNo?: string;
 guardianEmail?: string;

 // Sibling
 hasSibling?: boolean;
 siblingClass?: string;
 siblingSection?: string;
 siblingRoll?: string;
 siblingName?: string;
 siblingId?: string;

 // Previous Education
 prevSchoolId?: string;
 prevSchoolName?: string;
 prevClass?: string;
 prevPassingYear?: string;
 prevRoll?: string;
 prevRegistrationNo?: string;
 prevBoardId?: string;
 prevBoard?: string;
 prevTcNo?: string;

 // Payment & Facility
 admissionPayment?: string;
 paymentMethod?: string;
 transactionNo?: string;
 specialFacilityId?: string;
 specialFacility?: string;

 // Academic Info (Current - ID relational references & fallback display text)
 classId?: string;
 sectionId?: string;
 groupId?: string;
 sessionId?: string;
 session: string;
 class: string;
 section?: string;
 roll: string;
 rollBn?: string;
 academicYear?: string;
 mobile?: string;
 status?: string;
 passingYear: string;
 gpa: string;
 registrationNo: string;
 board: string;
 boardId?: string;
 group: string;

 // Documents
 photo?: string;
  serialNo?: string;
  memoNo?: string;
  issueDate?: string;
 photoUrl?: string;
 presentAddress?: string;
 permanentAddress?: string;
 documentBirthCertificate?: string;
 documentFatherNid?: string;
 documentMotherNid?: string;
 documentRegistrationCard?: string;
 documentTc?: string;
}

export interface AcademicSession {
 id: string;
 name: string;
 nameBn?: string;
 isDefault?: boolean;
}

export interface AdmissionYearItem {
 id: string;
 year: string;
 yearBn?: string;
 isDefault?: boolean;
}


export interface Room {
  id: string;
  name: string;
  nameBn?: string;
  capacity: number;
  type?: string;
}

export interface AcademicClass {
 id: string;
 name: string;
 nameEn?: string;
 nameBn?: string;
 code?: string;
	status?: string;
	isDefault: boolean;
  orderIndex?: number;
}

export interface AcademicGroup {
 id: string;
 name: string;
 nameBn?: string;
 isDefault?: boolean;
}

export interface AcademicSection {
 id: string;
 classId?: string;
 name: string;
 nameBn?: string;
 isDefault?: boolean;
}

export type Group = AcademicGroup;
export type Section = AcademicSection;

export interface StaffEducation {
 id: string;
 degree: string;
 major?: string;
 passingYear: string;
 boardUniversity: string;
 result: string;
 gpaDivision?: string;
}

export interface StaffProfessionalDegree {
 id: string;
 degreeName: string;
 passingYear: string;
 institution: string;
 result?: string;
}

export interface StaffTraining {
 id: string;
 title: string;
 institute: string;
 duration: string;
 year: string;
}

export interface StaffAward {
 id: string;
 title: string;
 year: string;
 organization?: string;
 description?: string;
}

export interface StaffMember {
 id: string;
 customStaffId: string; // PDS ID if provided, otherwise [EIIN][YEAR]1 auto-generated
 pdsId?: string; // MPO Index or PDS ID
 staffType: 'teaching' | 'non_teaching';
 name: string;
 nameBn?: string;
 role?: string;
 designation: string;
 designationBn?: string;
 designationId?: string;
 department?: string;
 subject?: string;
 subjectId?: string;
 contact?: string;
 mobile?: string;
 email?: string;
 nid?: string;
 dateOfBirth?: string;
 joiningDate?: string;
 status?: 'active' | 'on_leave' | 'transferred' | 'retired' | 'suspended';
 profileCompletion?: number; // 0 to 100%
 todayAttendanceStatus?: 'present' | 'absent' | 'leave';
 inTime?: string;
 leaveReason?: string;

 // Detailed Demographics (Step 2)
 fatherName?: string;
 fatherNameBn?: string;
 motherName?: string;
 motherNameBn?: string;
 spouseName?: string;
 spouseNameBn?: string;
 gender?: 'Male' | 'Female' | 'Other';
 genderId?: string;
 religion?: string;
 religionId?: string;
 bloodGroup?: string;
 bloodGroupId?: string;
 maritalStatus?: string;
 maritalStatusId?: string;
 nationality?: string;
 specialQuota?: 'none' | 'freedom_fighter' | 'ethnic_minority' | 'special_needs' | 'other';
 specialQuotaNote?: string;
 
 // Permanent Address
 divisionId?: string;
 districtId?: string;
 upazilaId?: string;
 unionId?: string;
 postOfficeId?: string;
 villageId?: string;
 houseNo?: string;
 para?: string;
 village?: string;
 postOffice?: string;
 union?: string;
 upazila?: string;
 district?: string;
 division?: string;

 // Present Address
 isAddressSame?: boolean;
 presentDivisionId?: string;
 presentDistrictId?: string;
 presentUpazilaId?: string;
 presentUnionId?: string;
 presentPostOfficeId?: string;
 presentVillageId?: string;
 presentHouseNo?: string;
 presentPara?: string;
 presentVillage?: string;
 presentPostOffice?: string;
 presentUnion?: string;
 presentUpazila?: string;
 presentDistrict?: string;
 presentDivision?: string;

 emergencyContactName?: string;
 emergencyContactRelation?: string;
 emergencyContactPhone?: string;

 // Financial & Payroll (Step 3)
 bankAccountName?: string;
 bankAccountNumber?: string;
 bankName?: string;
 bankBranch?: string;
 routingNumber?: string;
 payCode?: string;
 basicSalary?: number;
 houseRent?: number;
 medicalAllowance?: number;
 specialAllowance?: number;
 gpfDeduction?: number;
 welfareDeduction?: number;
 otherDeductions?: number;
 tinNumber?: string;
 mobileBankingType?: 'bkash' | 'nagad' | 'rocket' | 'upay' | 'none';
 mobileBankingNumber?: string;
 eftEnabled?: boolean;

 // Qualifications & Trainings (Step 4)
 educations?: StaffEducation[];
 professionalDegrees?: StaffProfessionalDegree[];
 trainings?: StaffTraining[];
 awards?: StaffAward[];

 // Employment & NTRCA/SMC (Step 5)
 isNtrcaRegistered?: boolean;
 ntrcaRoll?: string;
 ntrcaBatch?: string;
 ntrcaPassingYear?: string;
 firstJoiningDate?: string;
 currentSchoolJoiningDate?: string;
 mpoEnlistedDate?: string;
 mpoIndexNo?: string;
 employmentType?: 'mpo' | 'non_mpo' | 'contractual' | 'part_time' | 'revenue';
 smcResolutionNo?: string;
 smcResolutionDate?: string;

 // Documents & Attachments (Step 6)
 photo?: string;
  serialNo?: string;
  memoNo?: string;
  issueDate?: string;
 signaturePhoto?: string;
 nidAttachment?: string;
 joiningLetterAttachment?: string;
 mpoSheetAttachment?: string;
 certificateAttachment?: string;
}

export type StaffCategoryType = 
 | 'administrative' // প্রশাসনিক
 | 'subject_based' // বিষয়ভিত্তিক
 | 'vocational_trade' // ভোকেশনাল ট্রেড ভিত্তিক
 | 'science_computer' // বিজ্ঞান ও কম্পিউটার
 | 'support_staff'; // সহায়ক স্টাফ

export interface StaffDesignationItem {
 id: string; // unique ID
 name: string; // English
 nameBn: string; // Bengali
 category: StaffCategoryType;
 sanctionedPosts: number; // অনুমোদিত পদ সংখ্যা
 staffType: 'teaching' | 'non_teaching';
 payGrade?: string;
 description?: string;
}

export type StaffSubjectType = 'general' | 'vocational';

export interface StaffSubjectItem {
 id: string; // unique ID
 name: string; // English
 nameBn: string; // Bengali
 code?: string;
 type: StaffSubjectType;
 description?: string;
}

export interface ManagingCommitteeMember {
 id: string;
 name: string; // uppercase English
 nameBn?: string;
 role: string;
 roleBn: string;
 roleTitleBn?: string;
 roleTitleEn?: string;
 designation?: string;
  indexNumber?: string;
 mobile?: string;
 phone?: string;
 email?: string;
 nid?: string;
 photo?: string;
  serialNo?: string;
  memoNo?: string;
  issueDate?: string;
 gender?: 'Male' | 'Female' | 'Other' | string;
 educationalQualification?: string;
 profession?: string;
 joiningDate?: string;
 expiryDate?: string;
 exitDate?: string;
 trainingsCount?: number;
 isResigned?: boolean;
 resignationReason?: string;
 address?: string;
 status: 'active' | 'expired' | 'resigned' | 'inactive';
}

export interface CommitteeMeeting {
 id: string;
 meetingNo: string; // e.g. '৮ম নিয়মিত সভা' or '১ম বিশেষ সভা'
 date: string; // YYYY-MM-DD
 time?: string; // HH:mm
 place?: string; // 'বিদ্যালয়ের সভাকক্ষ'
 type?: 'regular' | 'special' | 'urgent' | 'first';
 title: string; // বিষয় বা আলোচ্যসূচি
 agenda?: string[];
 attendeesCount?: number;
 attendeeMemberIds?: string[];
 presidedBy?: string; // সভাপতি
 recordedBy?: string; // সদস্য সচিব
 resolutionNo?: string;
 resolutionText?: string;
 attachmentName?: string;
 status?: 'scheduled' | 'completed' | 'draft';
}

export interface CommitteeDecision {
 id: string;
 meetingId?: string;
 meetingNo?: string;
 date: string;
 decisionNo: string; // e.g. '০৩'
 title: string;
 description?: string;
 assignedTo?: string;
 deadline?: string;
 progressPercent: number; // 0-100
 status: 'implemented' | 'in_progress' | 'delayed' | 'dropped'; // 'বাস্তবায়িত' | 'চলমান' | 'বিলম্বিত'
}

export interface ManagingCommitteeInfo {
 id?: string;
 title?: string;
 titleBn?: string;
 name?: string;
 nameBn?: string;
 hasCommittee?: boolean; // প্রযোজ্য নয় / হ্যাঁ
 year?: string; // e.g. 2025-2027
 committeeType?: 'regular' | 'adhoc' | 'governing_body' | string;
 committeeTypeId?: string; // relationally mapped to master committee type ID e.g. comm_managing
 type?: 'regular' | 'adhoc' | 'governing_body' | string;
 approvalResolutionNo?: string;
 resolutionNo?: string;
 approvalDate?: string;
 firstMeetingDate?: string;
 startDate?: string;
 endDate?: string;
 electionDate?: string;
 attachmentName?: string;
 attachmentUrl?: string;
 attachmentSizeKb?: number;
 remarks?: string;
 status: 'active' | 'expired' | 'in_election' | 'dissolved' | 'none' | 'inactive';
 electionState?: {
   currentStep: string;
   voterRollSnapshot?: {
     guardianVoters: number;
     teacherVoters: number;
     donorVoters: number;
     totalVoters: number;
     snapshotDate: string;
   };
   approvedBy?: string;
   approvalAttachmentUrl?: string; // Requires bytes
 };
 members: ManagingCommitteeMember[];
 meetings?: CommitteeMeeting[];
 decisions?: CommitteeDecision[];
}


export interface ClassTeacherAssignment {
 id: string;
 classId: string;
 className: string;
 classNameBn?: string;
 sectionId?: string;
 sectionName?: string;
 sectionNameBn?: string;
 groupId?: string;
 groupName?: string;
 sessionId?: string;
 sessionName?: string;
 teacherId: string; // Staff member id
 teacherCustomId?: string; // PDS or Generated ID
 teacherName: string;
 teacherNameBn?: string;
 teacherDesignation?: string;
 roomId?: string;
 roomNo?: string;
  roomName?: string;
  invigilatorId?: string;
  invigilatorName?: string;
 assignedDate?: string;
 academicYear: string;
 status?: string;
}

export interface SubjectTeacherAssignment {
 id: string;
 classId: string;
 className: string;
 classNameBn?: string;
 sectionId?: string;
 sectionName?: string;
 sectionNameBn?: string;
 groupId?: string;
 groupName?: string;
 subjectId: string;
 subjectName: string;
 subjectNameBn?: string;
 subjectCode?: string;
 teacherId: string; // Staff member id
 teacherCustomId?: string; // PDS or Generated ID
 teacherName: string;
 teacherNameBn?: string;
 periodsPerWeek?: number;
 roomNo?: string;
 academicYear: string;
 status?: string;
}

export interface PayrollRecordItem {
 id?: string;
 staffId: string;
 customStaffId: string;
 staffName?: string;
 staffNameBn?: string;
 name?: string;
 nameBn?: string;
 designation: string;
 designationBn?: string;
 employmentType: string;
 bankName?: string;
 bankAccountNumber?: string;
 payCode?: string;
 basicSalary: number;
 houseRent: number;
 medicalAllowance: number;
 specialAllowance: number;
 bonus: number;
 grossSalary: number;
 totalAllowances?: number;
 gpfDeduction: number;
 welfareDeduction: number;
 leaveDeduction?: number;
 otherDeduction?: number;
 otherDeductions?: number;
 totalDeductions: number;
 netPayable: number;
 paymentStatus: 'pending' | 'paid';
 paymentDate?: string;
 paymentMethod?: 'bank_transfer' | 'eft' | 'cash' | 'mobile_banking';
}

export interface PayrollMonthlySheet {
 id: string;
 month: string; // e.g. "01", "02", ... or "2026-02"
 monthNameBn?: string;
 monthNameEn?: string;
 year: string; // e.g. "2026"
 title?: string;
 titleBn?: string;
 type?: 'all' | 'mpo' | 'non_mpo';
 status: 'draft' | 'approved' | 'disbursed' | 'pending' | 'paid';
 totalStaff?: number;
 totalBasic?: number;
 totalAllowances?: number;
 totalGross?: number;
 totalDeductions?: number;
 totalNet?: number;
 totalNetPayable?: number;
 records?: PayrollRecordItem[];
 items?: PayrollRecordItem[];
 generatedDate?: string;
 paymentDate?: string;
 createdAt?: string;
 disbursedAt?: string;
 approvedBy?: string;
}

export type TestimonialFormat = 'portrait' | 'landscape_side_column' | 'landscape_full' | 'board_standard';
export type TestimonialLanguage = 'bn' | 'en';

 export interface TestimonialSettings {
  format?: string; // 'bn_portrait' | 'en_portrait' or legacy
  layoutFormat?: TestimonialFormat; // 'portrait' | 'landscape_side_column' | 'landscape_full'
  paperSize?: 'a4' | 'legal';
  paperOrientation?: 'portrait' | 'landscape';
  borderStyle?: string;
  showWatermark?: boolean;
  watermarkType?: string;
  watermarkOpacity?: number;
  pageMargin?: number;
  frameInnerPadding?: number;
  bodyLineHeight?: number;
  bodyFontSize?: number;
  instNameColor?: string;
  showSignatures?: boolean;
  language?: TestimonialLanguage; // 'bn' | 'en'
 signatoryName?: string;
 signatoryNameBn?: string;
 signatoryTitle?: string;
 signatoryTitleBn?: string;
 signatoryStaffId?: string;
 preparerName?: string;
 preparerTitle?: string;
 preparerStaffId?: string;
 verifierName?: string;
 verifierTitle?: string;
 verifierStaffId?: string;
 studentDataFont?: string;
 certificateDesign?: string;
 customFrameUrl?: string;
 customText?: string;
 showLogo?: boolean;
 logoSize?: number;
 showWatermarkLogo?: boolean;
 showQrCode?: boolean;
 includeSignature?: boolean;
 examYear?: string;
 preparerSignature?: string;
 verifierSignature?: string;
 signatorySignature?: string;

 // Smart Typography & Spacing Controls
 instNameFontSize?: number;
 titleFontSize?: number;
 titleTopSpace?: number;
 titleBottomSpace?: number;
 paragraphSpacing?: number;
 closingTopSpace?: number;
 closingFontSize?: number;

  // Page Margins (in inches)
  pageMarginTop?: number;
  pageMarginBottom?: number;
  pageMarginLeft?: number;
  pageMarginRight?: number;
  frameInnerPaddingTop?: number;
  frameInnerPaddingBottom?: number;
  frameInnerPaddingLeft?: number;
  frameInnerPaddingRight?: number;
  frameStyle?: string;
 titleColor?: string;
 creditText?: string;
 showCheckingBlock?: boolean;
 showWatermarkCredit?: boolean;
 showSignatorySignature?: boolean;
 signatoryDate?: string;
}

export type StudentIdCardOrientation = 'landscape' | 'portrait';
export type StudentIdCardSide = 'both' | 'front' | 'back';
export type StudentIdCardPaperSize = 'a4' | 'legal';
export type StudentIdCardTheme = 'modern_classic' | 'corporate_navy' | 'emerald_elite' | 'burgundy_prestige' | 'minimal_clean';

export interface StaffIdCardFieldConfig {
 id: string;
 labelKey: string;
 valuePath: string;
 visible?: boolean;
 variant?: string;
 allowDuplicate?: boolean;
}

export interface StaffIdCardSectionLayout {
 sections: string[];
 fields: StaffIdCardFieldConfig[];
}

export interface StaffIdCardSettings {
 templateKey: string;
 fieldSeparator: string;
 content: {
 schoolNamePath: string;
 employeeNamePath: string;
 designationPath: string;
 };
 media: {
 logoPath: string;
 photoPath: string;
 qrPath: string;
 signaturePath: string;
 };
 labels: {
 cardType: string;
 logoAlt: string;
 logoFallback: string;
 photoAltTemplate: string;
 photoFallback: string;
 qrAlt: string;
 qrFallback: string;
 verificationTitle: string;
 verificationHelp: string;
 nonTransferableNotice: string;
 signatureAlt: string;
 signatureLabel: string;
 frontAriaLabel: string;
 backAriaLabel: string;
 fields: Record<string, string>;
 };
 visibility: Record<string, boolean>;
 layout: {
 front: StaffIdCardSectionLayout;
 back: StaffIdCardSectionLayout;
 };
 theme: Record<string, string>;
}

export interface StudentIdCardSettings {
 formatId?: string;
 arabicHeader?: string;
 headerTopText?: string;
 idCardLabelBn?: string;
 idCardLabelEn?: string;
 fontFamily?: string;
 fontSizeScale?: 'compact' | 'normal' | 'large';
 safetyMargin?: number;
 // Item-level font size controls (in px)
 headerTopTextSize?: number;
 instNameSize?: number;
 instAddressSize?: number;
 idCardLabelSize?: number;
 studentNameSize?: number;
 studentIdSize?: number;
 detailsTextSize?: number;
 parentsNameSize?: number;
 addressTextSize?: number;
 academicInfoSize?: number;
 bloodGroupSize?: number;
 // Photo placement controls
 photoOffsetY?: number;
 photoOffsetX?: number;
 photoSize?: number;
 // Student ID text box spacing controls
 studentIdBoxMarginTop?: number;
 studentIdBoxMarginBottom?: number;
 // Label padding & centering
 idCardLabelPaddingTop?: number;
 idCardLabelMarginTop?: number;
 idCardLabelMarginBottom?: number;
 headerTopPadding?: number;
 // Granular Spacing & Margins
 lineSpacing?: 'tight' | 'normal' | 'relaxed';
 itemSpacing?: 'compact' | 'normal' | 'spacious';
 lineHeightMultiplier?: number;
 itemSpacingValue?: number;
 paragraphSpacing?: number;
 contentTopMargin?: number;
 studentPersonalDetailsSize?: number;
 dobTextSize?: number;
 mobileTextSize?: number;
 // Back Side Controls
 backLogoSize?: number;
 backHeaderSpacing?: number;
 backHeaderLineHeight?: number;
 backCodesFontSize?: number;
 backDividerStyle?: 'solid' | 'double' | 'gradient' | 'dashed' | 'wave';
 backDividerOffset?: number;
 emergencyContactNumber?: string;
 qrInstructionFontSize?: number;
 // Photo Shape & Frame
 photoShape?: 'square' | 'rounded' | 'circle' | 'oval' | 'hexagon';
 photoFrameStyle?: 'simple' | 'double' | 'gold' | 'accent' | 'shadow' | 'none';
 // Top Header Theme & Graphic Controls
 topHeaderGraphicTheme?: 'classic_clean' | 'curved_header' | 'geometric_header' | 'ribbon_header' | 'wave_header' | 'minimal_header';
 signatureTextColorMode?: 'auto' | 'white' | 'gold' | 'dark';
 signatureBoxBackground?: 'white' | 'transparent' | 'light_tint';
 cardGraphicTheme?: 'classic_waves' | 'modern_geometric' | 'elegant_curves' | 'minimal_clean' | 'tech_stripes' | 'islamic_ornament';
 customGraphicUrl?: string;
 graphicOpacity?: number;
 showWatermarkLogo?: boolean;
 // Layout toggles
 showFrontLogo?: boolean;
 showBackgroundGraphics?: boolean;
 showBackCustomShape?: boolean;
 backCustomShapeTextBn?: string;
 backCustomShapeTextEn?: string;
 validityPeriod?: string;
 showRenewalTable?: boolean;
 orientation: StudentIdCardOrientation;
 cardSide: StudentIdCardSide;
 paperSize: StudentIdCardPaperSize;
 showCutMarks: boolean;
 theme: StudentIdCardTheme;
 primaryColor: string;
 accentColor: string;
 language: 'bn' | 'en';
 institutionNameDisplay: 'both' | 'bangla' | 'english';
 showLogo: boolean;
 showEiin: boolean;
 showInstituteAddress: boolean;
 headerSubTextBn: string;
 headerSubTextEn: string;
 showPhoto: boolean;
 showStudentId: boolean;
 showRollNo: boolean;
 showClass: boolean;
 showSection: boolean;
 showGroup: boolean;
 showSession: boolean;
 showBloodGroup: boolean;
 showDob: boolean;
 showFatherName: boolean;
 showMotherName: boolean;
 showGuardianMobile: boolean;
 showEmergencyContact: boolean;
 showAddress: boolean;
 showQrCode: boolean;
 qrCodeContent: 'id_only' | 'summary' | 'full';
 backTitleBn: string;
 // New Specification Modes
 frontPrimaryInfoMode?: 'parents' | 'academic';
 signatureSide?: 'front' | 'back';
 backTitleEn: string;
 termsTextBn: string;
 termsTextEn: string;
 returnNoticeBn: string;
 returnNoticeEn: string;
 showValidTill: boolean;
 validTillDate: string;
 showPrincipalSignature: boolean;
 principalTitleBn: string;
 principalTitleEn: string;
 showStudentSignature: boolean;
 studentSignatureTitleBn: string;
 studentSignatureTitleEn: string;
 useSavedPrincipalSignature: boolean;
}

export type IssuedDocumentState = 'preview' | 'artifact-generated' | 'issued' | 'download-requested' | 'confirmed-file-save' | 'revoked' | 'replaced';

export interface IssuedTestimonial {
  id: string;
  institutionId?: string;
  examId?: string;
  examName?: string;
  studentId: string;
  studentDbId?: string;
  examResultId?: string;
  issueDate: string;
  issuedAt?: string;
  issuedBy?: string;
  format: string;
  memoNo?: string;
  serialNo?: string;
  language?: 'bn' | 'en' | string;
  studentCategory?: string;
  behavior?: string;
  verificationToken?: string;
  verificationUrl?: string;
  offlineSignature?: string;
  snapshotHash?: string;
  snapshotData?: any; // the canonical approved snapshot
  snapshot?: any;
  state?: IssuedDocumentState; // Tracks lifecycle explicitly
  status?: string;
  issuanceStatus?: string;
  revokedAt?: string;
  revokedBy?: string;
  revokeReason?: string;
  revocationReason?: string;
  replacedById?: string; // Linkage to amendment
  
  // Distribution/Delivery
  distributionStatus?: 'pending' | 'distributed' | 'lost' | 'reissued';
  distributedAt?: string;
  receivedBy?: string;
  receiverRelation?: string;
  remarks?: string;
  // History & Logging
  history?: {
    action: string;
    timestamp: string;
    actor: string;
    details?: string;
  }[];
}

export interface ExamResult {
 id: string;
 studentDbId?: string;
 studentId: string;
 name?: string;
 nameBn?: string;
 fatherName?: string;
 fatherNameBn?: string;
 motherName?: string;
 motherNameBn?: string;
 dateOfBirth?: string;
 gender?: string;
 village?: string;
 villageBn?: string;
 postOffice?: string;
 postOfficeBn?: string;
 union?: string;
 unionBn?: string;
 upazila?: string;
 upazilaBn?: string;
 district?: string;
 districtBn?: string;
 boardBn?: string;
 
 examName?: string;
 passingYear?: string;
 session?: string;
 group?: string;
 boardRollNo?: string;
 registrationNo?: string;
 gpa?: string;
 letterGrade?: string;
 examType?: string;
 examNameBn?: string;
 examCenter?: string;
 examCenterBn?: string;
 resultStatus?: 'Passed' | 'Failed' | 'Incomplete' | 'পাস' | 'ফেল' | 'অসম্পূর্ণ';
 board?: string;
 photo?: string;
  serialNo?: string;
  memoNo?: string;
  issueDate?: string;

 // Modern Exam Assessment Fields & Relational IDs
 examId?: string;
 subjectId?: string;
 classId?: string;
 className?: string;
 groupId?: string;
 sessionId?: string;
 cqMarksObtained?: number;
 mcqMarksObtained?: number;
 practicalMarksObtained?: number;
 continuousMarksObtained?: number;
 totalMarks?: number;
	totalMarksObtained?: number;
 grade?: string;
 isPassed?: boolean;
  isAbsent?: boolean;
  isWithheld?: boolean;
}

export type ExamResultEntry = ExamResult;

export interface WhiteLabelSettings {
 appName: string;
 appIcon: string;
 enabled: boolean;
}

export interface ExamTerm {
 id: string;
 curriculumId?: string;
 name: string;
 nameBn?: string;
 year: string;
 termCode?: string;
 startDate?: string;
 endDate?: string;
 status: 'upcoming' | 'ongoing' | 'published' | 'completed' | 'archived';
 isDefault?: boolean;
 description?: string;
 descriptionBn?: string;
 isPolicyApproved?: boolean;
 policyApprovedBy?: string;
 policyApprovedAt?: string;
 policyApprovalNote?: string;
 policyVersion?: string;
  publicationStatus?: 'draft' | 'reviewed' | 'approved' | 'published';
  publishedAt?: string;
  publishedBy?: string;
}

export interface ExamPolicyVerification {
 examId: string;
 isApproved: boolean;
 policyVersion?: string;
  publicationStatus?: 'draft' | 'reviewed' | 'approved' | 'published';
  publishedAt?: string;
  publishedBy?: string;
  curriculumId?: string;
 boardStandard: string;
 approvedBy?: string;
 approvedAt?: string;
 verificationNote?: string;
 rulesVerified: {
  compulsoryFailEnforced: boolean;
  separateCqMcqPracticalPass: boolean;
  optionalFourthBonusCap: boolean;
  absentAndWithheldHandled: boolean;
  gradeBoundaryConsistent: boolean;
  totalGpaCap5: boolean;
 };
}

export type PassLogicType = 'individual_separator' | 'gross_combined' | 'continuous_non_gpa' | 'overall_simple';
export type SubjectCategoryType = 
 | 'compulsory' 
 | 'elective'
 | 'elective_group' 
 | 'departmental_elective' 
 | 'optional_4th' 
 | 'continuous_assessment'
 | 'general'
 | 'language'
 | 'science'
 | 'humanities'
 | 'business'
 | 'religion'
 | 'vocational'
 | 'other';

export interface MasterSubject {
 id: string; // The Subject Code (e.g. '101', '102', '109', '154')
 code: string; // e.g. '101'
 name: string; // English Name (e.g. 'Bangla 1st Paper')
 nameEn?: string; // Alias for name
 nameBn: string; // Bengali Name (e.g. 'বাংলা ১ম পত্র')
 category?: SubjectCategoryType;
 description?: string;
 isCustom?: boolean;
 isActive?: boolean;
 isContinuousAssessmentOnly?: boolean;
}

export interface CurriculumDefinition {
 id: string; // e.g. 'curr_sec_2012_rev_2025'
 code: string; // e.g. 'SEC-2012-REV-2025'
 name: string; // 'Secondary Education 2012 (Revised 2025)'
 nameEn?: string; // Alias for name
 nameBn: string; // 'মাধ্যমিক শিক্ষা ২০১২ (পরিমার্জিত-২০২৫)'
 description?: string;
 descriptionEn?: string;
 descriptionBn?: string;
 status: 'active' | 'inactive' | 'draft';
 isActive?: boolean;
 isDefault: boolean;
  orderIndex?: number;
 effectiveYear?: string;
 classesCovered?: string[];
 applicableClasses?: string[]; // e.g. ['6', '7', '8', '9', '10']
 version?: string;
 createdAt?: string;
 updatedAt?: string;
}

export interface CurriculumSubjectMapping {
 id: string; // Unique mapping ID e.g. 'csm_sec2025_c6_101'
 curriculumId: string; // Relational reference to CurriculumDefinition.id
 classId?: string; // Relational reference to AcademicClass.id
 className: string; // e.g. 'Class 6' or '৬ষ্ঠ'
 subjectCode: string;
  code?: string; // Relational reference to MasterSubject.id (Code)
 name: string;
 nameBn: string;
 weeklyPeriods: number; // সাপ্তাহিক পিরিয়ড সংখ্যা
 fullMarks: number; // বরাদ্দকৃত মোট নম্বর
 passMarks: number; // মোট পাস নম্বর
 passLogic: PassLogicType; // 'individual_separator' | 'gross_combined' | 'continuous_non_gpa' | 'overall_simple'
 
 // Breakdown
 cqMarks: number;
 cqPassMarks: number;
 mcqMarks: number;
 mcqPassMarks: number;
 practicalMarks?: number;
 practicalPassMarks?: number;
 continuousMarks?: number; // ধারাবাহিক মূল্যায়ন / কোর্স ওয়ার্ক

 // Detailed Continuous Assessment breakdown (NCTB 2012 / 2025)
 classWorkMarks?: number; // শ্রেণির কাজ (২০)
 assignmentProjectMarks?: number; // অনুসন্ধানমূলক কাজ / প্রজেক্ট (১০)
 classTestMarks?: number; // শ্রেণি অভীক্ষা (২০)
 continuousBreakdown?: {
 classWork?: number;
 project?: number;
 classTest?: number;
 };

 // Pass Logic Configuration (Relational settings)
 paperPassType?: 'combined' | 'separate'; // 1st & 2nd paper combined pass vs separate
 cqMcqPassType?: 'combined' | 'separate'; // MCQ & CQ combined pass vs separate

 // Gross / Combined pass logic relations
 combinedWithCode?: string; // e.g. '102' for 101, or '108' for 107
 combinedWithSubjectCode?: string;
 combinedTotalMarks?: number; // e.g. 150
 combinedPassMarks?: number; // e.g. 50
 combinedCqTotal?: number; // e.g. 120
 combinedCqPass?: number; // e.g. 40
 grossPassNoteBn?: string;

 // Type & Elective metadata
 subjectType: SubjectCategoryType;
 electiveGroupId?: string; // e.g. 'religion_group', 'optional_group'
 electiveGroupNameBn?: string;
 groupName?: string; // For classes 9-10: 'Science' | 'Humanities' | 'Business' | 'Common'
 isOptional?: boolean;
}

export interface SubjectItem {
 id: string;
 name: string;
 nameBn?: string;
 code: string;
 classId?: string;
 className: string;
 groupId?: string;
 groupName?: string;
 groupNameBn?: string;
 fullMarks: number;
 passMarks: number;
 cqMarks?: number;
 mcqMarks?: number;
 practicalMarks?: number;
 continuousMarks?: number;
 isOptional?: boolean;
 isActive?: boolean;
 
 // Pass Logic specific to exam evaluations
 passLogic?: PassLogicType;
 cqMcqPassType?: 'combined' | 'separate';
 paperPassType?: 'combined' | 'separate';
 combinedWithSubjectCode?: string;
 combinedWithCode?: string;
 combinedTotalMarks?: number;
 combinedPassMarks?: number;
 combinedCqTotal?: number;
 combinedCqPass?: number;
 grossPassNoteBn?: string;
}

export interface GradingRule {
 id: string;
 grade: string;
 gpa: number;
 minMarks: number;
 maxMarks: number;
 remarks: string;
 remarksBn?: string;
}

export interface ExamRoutineItem {
 id: string;
 examId: string;
 classId?: string;
 className: string;
 subjectId?: string;
 subjectName: string;
 subjectCode?: string;
 examDate: string;
 dayName?: string;
 startTime: string;
 endTime: string;
 roomNo?: string;
 roomId?: string;
 roomName?: string;
 invigilatorId?: string;
 invigilatorName?: string;
}

export interface AdmitCardSettings {
 examId?: string;
 instructions: string[];
 instructionsBn: string[];
 showPhoto: boolean;
 showRoutine: boolean;
 showQrCode: boolean;
 showLogo: boolean;
 headerTitle?: string;
 signatoryTitle?: string;
 signatoryName?: string;
 issueDate: string;
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
 titleFontSize?: number; // e.g. 28
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

export type TransactionType = 'income' | 'expense';

export type TransactionCategory =
 | 'tuition_fee'
 | 'admission_fee'
 | 'exam_fee'
 | 'session_fee'
 | 'donation_grant'
 | 'salary_payroll'
 | 'utility_bills'
 | 'building_maintenance'
 | 'stationery_printing'
 | 'lab_sports'
 | 'events_cultural'
 | 'miscellaneous';

export interface FinancialTransaction {
 id: string;
 voucherNo: string;
 date: string;
 type: TransactionType;
 category: TransactionCategory | string;
 categoryBn?: string;
 title: string;
 titleBn?: string;
 amount: number;
 paymentMethod: 'cash' | 'bank' | 'bkash' | 'nagad' | 'rocket';
 reference?: string;
 studentId?: string;
 studentName?: string;
 studentClass?: string;
 studentRoll?: string;
 staffId?: string;
 staffName?: string;
 receiptNo?: string;
 status: 'completed' | 'pending' | 'cancelled';
 notes?: string;
	createdBy?: string;
	note?: string;
 createdAt: string;
}




export type ScholarshipExamType = 'PEC' | 'JSC' | 'SSC' | 'HSC' | 'Ebtedaee' | 'JDC' | 'Dakhil' | 'Alim' | 'Other';
export type ScholarshipCategory = 'Merit' | 'General';
export type ScholarshipAccountType = 'Savings' | 'Current';
export type ScholarshipAccountOwnership = 'Single' | 'Joint';
export type ScholarshipVerificationStatus = 'Draft' | 'LocallyVerified' | 'Discrepancy' | 'Rejected';

export interface ScholarshipRecord {
 id: string;
 studentId: string;
 enrollmentYear: string; // ভর্তি শিক্ষাবর্ষ
 financialYear: string; // অর্থবছর
 examType: ScholarshipExamType; // বৃত্তির পরীক্ষা
 scholarshipCategory: ScholarshipCategory; // বৃত্তির ধরণ

 // Master Data Reference IDs & Previous Academic Info
 prevSchoolId?: string; // Authoritative 'inst_*' from masterInstitutions
 prevBoardId?: string; // Authoritative 'board_*' from masterBoards
 prevDivisionId?: string;
 prevDistrictId?: string;
 prevUpazilaId?: string;
 prevDivision?: string;
 prevDistrict?: string;
 prevUpazila?: string;
 prevPourashava?: string;
 prevBoard?: string;
 prevInstituteName?: string;
 prevClass?: string;
 prevExamName?: string;
 prevRegistrationNo?: string;
 identifierType?: 'roll' | 'registration' | 'student_id';
 prevGpa?: string;
 prevTotalMarks?: string;
 prevPassingYear?: string;

 // Current Academic Mapping
 currentClassId?: string;
 currentGroupId?: string;
 currentSectionId?: string;
 currentAcademicLevel?: string; // e.g. 'স্নাতক সম্মান' for Honors/Medical

 // Guardian Info
 guardianRelation: 'Father' | 'Mother' | 'Brother' | 'Sister' | 'Other';
 guardianBirthRegistrationNo?: string;
 guardianNid?: string;
 guardianDateOfBirth?: string;
 guardianNameBn: string;
 guardianNameEn: string;
 guardianProfession?: string;
 guardianEducation?: string;
 guardianSpouseEducation?: string;
 guardianMobile: string;
 guardianEmail?: string;
 isGuardianAddressSame?: boolean;
 guardianDivision?: string;
 guardianDistrict?: string;
 guardianUpazila?: string;
 guardianPourashava?: string;
 guardianUnion?: string;
 guardianWardNo?: string;
 guardianPostCode?: string;
 guardianAddress?: string;

 // Payment Info
 paymentMode?: 'Banking' | 'MobileBanking';
 bankId?: string; // 'bank_*' from masterBankPayments
 bankName: string;
 branchName: string;
 routingNumber: string;
 accountType: ScholarshipAccountType;
 accountOwnership?: ScholarshipAccountOwnership; // Single or Joint
 accountHolderRelation?: 'Student' | 'Father' | 'Mother' | 'Other';
 accountHolderName: string; // English uppercase
 secondAccountHolderName?: string; // 2nd holder for joint accounts
 secondAccountHolderRelation?: 'Father' | 'Mother' | 'Guardian' | 'Other';
 secondAccountHolderPersonId?: string;
 accountNumber: string; // 13-17 digits string

 // Return / Bounce Info
 bounceStatus?: 'none' | 'returned' | 'resolved';
 bounceReason?: string;
 bounceDate?: string;

 // Documents & Gazette Verification Info
 gazetteStudentNameEn?: string; // Student name as printed in official gazette
 nameMatchDiscrepancy?: boolean; // Comparison flag between profile name and gazette name
 gazetteDocId?: string;
 bankDocId?: string;

 // Two Teachers Review Requirement (per DSHE 2022 Circular)
 preparerStaffId?: string; // তথ্য প্রস্তুতকারী শিক্ষক
 reviewerStaffId?: string; // তথ্য প্রত্যয়নকারী / অনুমোদনকারী শিক্ষক
 verifiedByStaffId?: string;
 verifiedByUserId?: string;
 verifiedAt?: string;
 verificationStatus?: ScholarshipVerificationStatus;
 discrepancyNote?: string;
 isDraft?: boolean;

 status: 'Draft' | 'Submitted' | 'Approved' | 'Inactive';
 createdAt?: string;
 updatedAt?: string;
}

export interface BankBranchItem {
  id: string;
  bankId: string;
  nameEn: string;
  nameBn: string;
  branchCode?: string;
  routingNumber: string; // 9-digit Bangladesh Bank routing number
  district?: string;
  districtBn?: string;
  address?: string;
  isCustom?: boolean;
}

export interface BankMasterItem {
  id: string;
  nameEn: string;
  nameBn: string;
  bankCode?: string;
  shortCode?: string;
  category?: 'state_owned' | 'private_commercial' | 'islamic' | 'specialized' | 'foreign';
  categoryBn?: string;
  branches: BankBranchItem[];
  isCustom?: boolean;
}

// --- Student Follow-up Module Types ---
export type FollowupCampaignStatus = 'draft' | 'planned' | 'active' | 'completed' | 'archived';
export interface FollowupCampaign {
	id: string;
	institutionId?: string;
	academicYear?: string;
	title: string;
	titleBn?: string;
	description?: string;
	purpose?: string;
	startDate: string;
	endDate: string;
	targetClassIds?: string[];
	totalStudentsTargeted?: number;
	completedVisits?: number;
	status: FollowupCampaignStatus;
	createdBy?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface FollowupTeam {
  id: string;
  campaignId: string;
  name: string;
  leaderId: string;
  memberIds?: string[];
  createdAt: string;
}

export type FollowupAssignmentStatus = 'pending' | 'visited' | 'cancelled' | 'completed';
export interface FollowupAssignment {
	id: string;
	campaignId: string;
	teamId?: string;
	studentId: string;
	assignedToStaffId?: string;
	assignedAt?: string;
	scheduledDate?: string;
	priority?: 'normal' | 'attention' | 'high' | 'medium';
	status: FollowupAssignmentStatus;
	createdAt?: string;
	updatedAt?: string;
}

export type FollowupVisitStatus = 'draft' | 'submitted' | 'reviewed' | 'finalized' | 'correction_requested';
export type FollowupOutcome = 'satisfactory' | 'monitoring' | 're_followup' | 'school_intervention' | 'positive';

export interface FollowupVisit {
  id: string;
  institutionId?: string;
  campaignId: string;
  assignmentId: string;
  studentId: string;
  teamId: string;
  visitorStaffId?: string;
  visitType?: string;
  summary?: string;
  visitDate: string;
  studentFound: boolean;
  personMet?: string;
  studyStatus?: string;
  studyEnvironment?: string;
  observedActivity?: string;
  teacherObservation?: string;
  guardianSatisfaction?: string;
  guardianConcerns?: string[];
  adviceDetails?: string[];
  adviceText?: string;
  outcome?: FollowupOutcome;
  nextFollowupDate?: string;
  guardianSignaturePath?: string; 
  signedPaperPath?: string;
  latitude?: number;
  longitude?: number;
  locationAccuracy?: number;
  status: FollowupVisitStatus;
  syncStatus?: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';
  snapshot?: any; 
  createdAt: string;
  updatedAt: string;
}

// System Font Types - Curated Approved Fonts Only
export type BengaliFontFamily =
  | 'Kalpurush'
  | 'SolaimanLipi'
  | 'Hind Siliguri'
  | 'Noto Sans Bengali'
  | 'Noto Serif Bengali'
  | 'Tiro Bangla'
  | 'Siyam Rupali';

export type EnglishFontFamily =
  | 'Inter'
  | 'Roboto'
  | 'Plus Jakarta Sans'
  | 'Segoe UI'
  | 'Merriweather'
  | 'Playfair Display';

export interface SystemFontSettings {
  defaultBengaliFont: BengaliFontFamily;
  defaultEnglishFont: EnglishFontFamily;
  enableFontSmooth?: boolean;
}

export * from './backup';


// PHASE 14: Queue definitions
export interface SyncQueueRecord {
  id: string;
  entityType: 'FollowupVisit' | 'FollowupAssignment' | string;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  payload: any;
  status: 'pending' | 'syncing' | 'failed' | 'conflict';
  retryCount: number;
  lastAttemptAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export interface MessageQueueRecord {
  id: string;
  recipientId: string; // studentId or staffId
  contactNumber: string;
  messageText: string;
  templateId?: string;
  status: 'queued' | 'submitted' | 'provider-accepted' | 'delivered' | 'failed';
  providerResponse?: string;
  createdAt: string;
  updatedAt?: string;
}
export interface StudentAttendance { id: string; studentId: string; classId: string; sectionId: string; date: string; status: 'present' | 'absent' | 'late' | 'leave'; leaveType?: string; note?: string; recordedBy?: string; createdAt: string; updatedAt: string; }
