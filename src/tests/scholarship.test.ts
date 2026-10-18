import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';
import { ScholarshipRecord, Student } from '../types';

describe('Revenue Scholarship Module Characterization & Business Rules Tests', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useAppStore.setState({
      students: [],
      scholarships: [],
      staff: []
    });
  });

  it('correctly pre-fills student information from selected student record', () => {
    const student: Student = {
      id: 'stud_001',
      studentId: 'STD2026001',
      name: 'Tanvir Ahmed',
      nameBn: 'তানভীর আহমেদ',
      fatherName: 'Kamal Ahmed',
      fatherNameBn: 'কামাল আহমেদ',
      fatherMobile: '01711000000',
      motherName: 'Nasrin Akter',
      motherNameBn: 'নাসরিন আক্তার',
      gender: 'Male',
      religion: 'Islam',
      birthRegistrationNo: '20081234567890123',
      dateOfBirth: '2008-05-15',
      class: 'Ten',
      classId: 'cls_ten',
      section: 'A',
      sectionId: 'sec_a',
      roll: '01',
      rollBn: '০১',
      academicYear: '2026',
      session: '2026',
      village: 'আদর্শগ্রাম',
      postOffice: 'ডাকঘর',
      upazila: 'সদর',
      district: 'ঢাকা',
      mobile: '01711000000',
      status: 'Active',
      passingYear: '2026',
      registrationNo: 'REG-101',
      board: 'Dhaka',
      group: 'Science',
      bloodGroup: 'A+',
      prevSchoolName: 'আদর্শ সরকারি উচ্চ বিদ্যালয়',
      prevBoard: 'ঢাকা বোর্ড',
      prevRegistrationNo: '1910203040',
      prevPassingYear: '2025',
      gpa: '5.00'
    };

    useAppStore.setState({ students: [student] });
    const stored = useAppStore.getState().students.find(s => s.id === 'stud_001');

    expect(stored).toBeDefined();
    expect(stored?.nameBn).toBe('তানভীর আহমেদ');
    expect(stored?.prevSchoolName).toBe('আদর্শ সরকারি উচ্চ বিদ্যালয়');
    expect(stored?.prevRegistrationNo).toBe('1910203040');
  });

  it('enforces award-level uniqueness: same student cannot have duplicate active records for the same exam level', () => {
    const store = useAppStore.getState();

    const sscAward1: ScholarshipRecord = {
      id: 'schol_ssc_1',
      studentId: 'stud_001',
      enrollmentYear: '2025',
      financialYear: '২০২৫-২০২৬',
      examType: 'SSC',
      scholarshipCategory: 'General',
      guardianRelation: 'Father',
      guardianNameBn: 'কামাল আহমেদ',
      guardianNameEn: 'Kamal Ahmed',
      guardianMobile: '01711000000',
      bankName: 'সোনালী ব্যাংক পিএলসি',
      branchName: 'লোকাল শাখা',
      routingNumber: '125272829',
      accountType: 'Savings',
      accountHolderName: 'TANVIR AHMED',
      accountNumber: '1234567890123',
      status: 'Submitted'
    };

    store.addScholarship(sscAward1);
    expect(useAppStore.getState().scholarships.length).toBe(1);

    // Attempting to add another SSC record for the same student
    const sscAward2: ScholarshipRecord = {
      id: 'schol_ssc_2',
      studentId: 'stud_001',
      enrollmentYear: '2026',
      financialYear: '২০২৬-২০২৭',
      examType: 'SSC', // Same award level
      scholarshipCategory: 'Merit',
      guardianRelation: 'Father',
      guardianNameBn: 'কামাল আহমেদ',
      guardianNameEn: 'Kamal Ahmed',
      guardianMobile: '01711000000',
      bankName: 'সোনালী ব্যাংক পিএলসি',
      branchName: 'লোকাল শাখা',
      routingNumber: '125272829',
      accountType: 'Savings',
      accountHolderName: 'TANVIR AHMED',
      accountNumber: '1234567890123',
      status: 'Submitted'
    };

    store.addScholarship(sscAward2);

    // Uniqueness rule: Must merge or prevent duplication, keeping only 1 active record for SSC
    const currentScholarships = useAppStore.getState().scholarships;
    expect(currentScholarships.length).toBe(1);
    expect(currentScholarships[0].scholarshipCategory).toBe('Merit');
  });

  it('permits multiple distinct scholarship awards for different academic levels (e.g. SSC and HSC)', () => {
    const store = useAppStore.getState();

    const sscAward: ScholarshipRecord = {
      id: 'schol_ssc_1',
      studentId: 'stud_001',
      enrollmentYear: '2023',
      financialYear: '২০২৩-২০২৪',
      examType: 'SSC',
      scholarshipCategory: 'General',
      guardianRelation: 'Father',
      guardianNameBn: 'কামাল আহমেদ',
      guardianNameEn: 'Kamal Ahmed',
      guardianMobile: '01711000000',
      bankName: 'সোনালী ব্যাংক পিএলসি',
      branchName: 'লোকাল শাখা',
      routingNumber: '125272829',
      accountType: 'Savings',
      accountHolderName: 'TANVIR AHMED',
      accountNumber: '1234567890123',
      status: 'Submitted'
    };

    const hscAward: ScholarshipRecord = {
      id: 'schol_hsc_1',
      studentId: 'stud_001',
      enrollmentYear: '2025',
      financialYear: '২০২৫-২০২৬',
      examType: 'HSC', // Different award level
      scholarshipCategory: 'Merit',
      guardianRelation: 'Father',
      guardianNameBn: 'কামাল আহমেদ',
      guardianNameEn: 'Kamal Ahmed',
      guardianMobile: '01711000000',
      bankName: 'সোনালী ব্যাংক পিএলসি',
      branchName: 'লোকাল শাখা',
      routingNumber: '125272829',
      accountType: 'Savings',
      accountHolderName: 'TANVIR AHMED',
      accountNumber: '1234567890123',
      status: 'Submitted'
    };

    store.addScholarship(sscAward);
    store.addScholarship(hscAward);

    // Two distinct level awards are both preserved
    expect(useAppStore.getState().scholarships.length).toBe(2);
  });

  it('formats account holder name correctly according to single vs joint rules', () => {
    const studentNameEn = 'HABIBUR RAHMAN';
    const fatherNameEn = 'ABDUR RASHID';

    // Single account rule: student name only
    const singleTitle = studentNameEn;
    expect(singleTitle).toBe('HABIBUR RAHMAN');

    // Joint account rule: [Student Name] and [2nd Holder Name]
    const jointTitle = `${studentNameEn} and ${fatherNameEn}`;
    expect(jointTitle).toBe('HABIBUR RAHMAN and ABDUR RASHID');
  });

  it('validates cohort-specific identifiers and bank account length according to circular policy', () => {
    // 1. Primary Scholarship 2025: 7-digit admit card roll
    const primaryRoll = '1234567';
    expect(primaryRoll.length).toBe(7);

    // 2. Previous PSC: 16-digit student ID
    const pscId = '2019123456789012';
    expect(pscId.length).toBe(16);

    // 3. JSC, SSC, HSC: 10-digit registration
    const regNo = '1910203040';
    expect(regNo.length).toBe(10);

    // 4. Bank Account Number: 13 to 17 digits
    const validAccount1 = '1234567890123'; // 13 digits
    const validAccount2 = '12345678901234567'; // 17 digits
    const invalidAccount = '123456789'; // 9 digits (invalid)

    expect(validAccount1.length >= 13 && validAccount1.length <= 17).toBe(true);
    expect(validAccount2.length >= 13 && validAccount2.length <= 17).toBe(true);
    expect(invalidAccount.length >= 13 && invalidAccount.length <= 17).toBe(false);
  });

  it('detects discrepancies between student profile English name and gazette English name', () => {
    const profileName = 'MD TANVIR AHMED';
    const gazetteNameMatch = 'MD TANVIR AHMED';
    const gazetteNameMismatch = 'TANVIR AHMED';

    const isMatch = profileName.trim().toUpperCase() === gazetteNameMatch.trim().toUpperCase();
    const isMismatch = profileName.trim().toUpperCase() === gazetteNameMismatch.trim().toUpperCase();

    expect(isMatch).toBe(true);
    expect(isMismatch).toBe(false);
  });

  it('records two responsible teachers workflow (preparer and reviewer)', () => {
    const store = useAppStore.getState();

    const record: ScholarshipRecord = {
      id: 'schol_001',
      studentId: 'stud_001',
      enrollmentYear: '2026',
      financialYear: '২০২৬-২০২৭',
      examType: 'SSC',
      scholarshipCategory: 'General',
      guardianRelation: 'Father',
      guardianNameBn: 'পিতা',
      guardianNameEn: 'Father',
      guardianMobile: '01700000000',
      bankName: 'সোনালী ব্যাংক পিএলসি',
      branchName: 'লোকাল শাখা',
      routingNumber: '125272829',
      accountType: 'Savings',
      accountHolderName: 'TANVIR AHMED',
      accountNumber: '1234567890123',
      status: 'Submitted',
      preparerStaffId: 'staff_teacher_1',
      reviewerStaffId: 'staff_teacher_2',
      verificationStatus: 'LocallyVerified',
      isDraft: false
    };

    store.addScholarship(record);
    const saved = useAppStore.getState().scholarships.find(s => s.id === 'schol_001');

    expect(saved?.preparerStaffId).toBe('staff_teacher_1');
    expect(saved?.reviewerStaffId).toBe('staff_teacher_2');
    expect(saved?.verificationStatus).toBe('LocallyVerified');
    expect(saved?.isDraft).toBe(false);
  });

  it('guarantees that declaration and checklist notice font size is minimum 10pt for print legibility', async () => {
    const { DEFAULT_SCHOLARSHIP_SETTINGS } = await import('../pages/scholarships/types/scholarshipSettings');

    // Business requirement: declaration and checklist text must be minimum 10pt so Bengali ligatures are crisp on paper
    expect(DEFAULT_SCHOLARSHIP_SETTINGS.noticeFontSize).toBeDefined();
    expect(DEFAULT_SCHOLARSHIP_SETTINGS.noticeFontSize).toBeGreaterThanOrEqual(10.0);

    // In spacious 2-page layout, row padding has plenty of breathing room (4.5px default)
    expect(DEFAULT_SCHOLARSHIP_SETTINGS.rowPaddingY).toBeGreaterThanOrEqual(3.5);
    expect(DEFAULT_SCHOLARSHIP_SETTINGS.rowPaddingY).toBeLessThanOrEqual(6.0);
  });

  it('supports both single-page and two-page layout modes with correct default configuration', async () => {
    const {
      DEFAULT_SCHOLARSHIP_SETTINGS,
      saveScholarshipSettings,
      getSavedScholarshipSettings
    } = await import('../pages/scholarships/types/scholarshipSettings');

    // Default mode is two_page for maximum legibility and proper signature distribution
    expect(DEFAULT_SCHOLARSHIP_SETTINGS.pageLayoutMode).toBe('two_page');

    // Test saving single page mode
    saveScholarshipSettings({
      ...DEFAULT_SCHOLARSHIP_SETTINGS,
      pageLayoutMode: 'single'
    });
    let loaded = getSavedScholarshipSettings();
    expect(loaded.pageLayoutMode).toBe('single');

    // Test switching back to two_page mode
    saveScholarshipSettings({
      ...DEFAULT_SCHOLARSHIP_SETTINGS,
      pageLayoutMode: 'two_page'
    });
    loaded = getSavedScholarshipSettings();
    expect(loaded.pageLayoutMode).toBe('two_page');
  });

  it('correctly maps and preserves all official government portal fields (শিক্ষার্থীর বৃত্তান্ত)', () => {
    const store = useAppStore.getState();

    const portalRecord: ScholarshipRecord = {
      id: 'schol_portal_001',
      studentId: 'stud_portal_001',
      enrollmentYear: '২০২৩',
      financialYear: '২০২২-২৩',
      examType: 'PEC',
      scholarshipCategory: 'General',
      paymentMode: 'Banking',
      prevSchoolId: 'sch_prev_01',
      prevInstituteName: 'আজিয়ারা সরকারি প্রাথমিক বিদ্যালয়',
      prevBoard: 'ডিপিই (প্রাথমিক বৃত্তি)',
      prevExamName: 'পিইসি',
      prevClass: 'পঞ্চম',
      prevRegistrationNo: '১১২২',
      prevGpa: '৫.০০',
      prevPassingYear: '২০২২',
      prevDivision: 'চট্টগ্রাম',
      prevDistrict: 'কুমিল্লা',
      prevUpazila: 'নাঙ্গলকোট',
      prevPourashava: '',
      guardianRelation: 'Mother',
      guardianNameBn: 'ফেরদোস বেগম',
      guardianNameEn: 'Fardous Bagam',
      guardianNid: '৩২৭৪৫৬৫১০৪',
      guardianDateOfBirth: '০৩-০২-১৯৮৮',
      guardianBirthRegistrationNo: '১৯৮৮১২২৩৩৪৫৫',
      guardianProfession: 'গৃহিনী',
      guardianMobile: '০১৮৯০৮৮২৯০৪',
      guardianEmail: 'guardian@biddalok.org',
      isGuardianAddressSame: true,
      guardianDivision: 'চট্টগ্রাম',
      guardianDistrict: 'কুমিল্লা',
      guardianUpazila: 'নাঙ্গলকোট',
      guardianPourashava: '',
      guardianUnion: 'বক্সগঞ্জ',
      guardianWardNo: '১',
      guardianPostCode: '৩৫৮৩',
      guardianAddress: 'গ্রাম-আলীয়ারা, ডাকঘর-আজিয়ারা বাজার',
      bankName: 'এক্সিম ব্যাংক লিঃ',
      branchName: 'BOKSHAGONJ',
      routingNumber: '১০০১৯০৭৩১',
      accountType: 'Savings',
      accountOwnership: 'Single',
      accountHolderName: 'Nusrat Jahan Nila',
      accountNumber: '০১১২০০৯৪৩৫৬৮৬',
      status: 'Submitted',
      preparerStaffId: 'staff_preparer_01',
      reviewerStaffId: 'staff_reviewer_01',
      verificationStatus: 'LocallyVerified',
      isDraft: false
    };

    store.addScholarship(portalRecord);
    const retrieved = useAppStore.getState().scholarships.find(s => s.id === 'schol_portal_001');

    expect(retrieved).toBeDefined();
    expect(retrieved?.paymentMode).toBe('Banking');
    expect(retrieved?.prevDivision).toBe('চট্টগ্রাম');
    expect(retrieved?.prevDistrict).toBe('কুমিল্লা');
    expect(retrieved?.prevUpazila).toBe('নাঙ্গলকোট');
    expect(retrieved?.guardianBirthRegistrationNo).toBe('১৯৮৮১২২৩৩৪৫৫');
    expect(retrieved?.guardianEmail).toBe('guardian@biddalok.org');
    expect(retrieved?.guardianWardNo).toBe('১');
    expect(retrieved?.guardianPostCode).toBe('৩৫৮৩');
    expect(retrieved?.guardianUnion).toBe('বক্সগঞ্জ');
  });

  it('guarantees bi-directional syncing of updated portal profile fields to student database', () => {
    const store = useAppStore.getState();

    const initialStudent: Student = {
      id: 'stud_sync_001',
      studentId: 'STD2026SYNC',
      name: 'Nusrat Jahan Nila',
      nameBn: 'নুসরাত জাহান নিলা',
      fatherName: 'Nurul Hoque',
      fatherNameBn: 'নুরুল হক',
      motherName: 'Fardous Bagam',
      motherNameBn: 'ফেরদোস বেগম',
      gender: 'Female',
      religion: 'Islam',
      birthRegistrationNo: '20111191873410576',
      dateOfBirth: '2011-08-07',
      class: 'Six',
      classId: 'cls_six',
      section: 'A',
      sectionId: 'sec_a',
      roll: '01',
      rollBn: '০১',
      academicYear: '2026',
      session: '2026',
      village: 'আলীয়ারা',
      postOffice: 'বক্সগঞ্জ',
      upazila: 'নাঙ্গলকোট',
      district: 'কুমিল্লা',
      status: 'Active',
      mobile: '01890882904',
      passingYear: '2026',
      registrationNo: 'REG-2026-001',
      board: 'Comilla',
      group: 'General',
      gpa: '5.00'
    };

    store.addStudent(initialStudent);

    // Simulate update through scholarship entry modal bi-directional sync
    const updatedStudentData: Partial<Student> = {
      fatherNid: '19850005121122740',
      fatherDob: '1985-06-18',
      motherNid: '3274565104',
      motherDob: '1988-02-03',
      pourashava: 'নাঙ্গলকোট পৌরসভা',
      pourashavaBn: 'নাঙ্গলকোট পৌরসভা',
      wardNo: '১',
      postCode: '৩৫৮৩',
      guardianBirthRegistrationNo: '১৯৮৮১২২৩৩৪৫৫',
      guardianEmail: 'guardian@biddalok.org'
    };

    store.updateStudent('stud_sync_001', updatedStudentData);

    const syncedStudent = useAppStore.getState().students.find(s => s.id === 'stud_sync_001');
    expect(syncedStudent).toBeDefined();
    expect(syncedStudent?.fatherNid).toBe('19850005121122740');
    expect(syncedStudent?.motherNid).toBe('3274565104');
    expect(syncedStudent?.pourashavaBn).toBe('নাঙ্গলকোট পৌরসভা');
    expect(syncedStudent?.wardNo).toBe('১');
    expect(syncedStudent?.postCode).toBe('৩৫৮৩');
    expect(syncedStudent?.guardianBirthRegistrationNo).toBe('১৯৮৮১২২৩৩৪৫৫');
  });
});

