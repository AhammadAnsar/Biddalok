import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';
import { setSecurityBypassForTesting } from '../security/guard';
import { IssuedTestimonial, Institution } from '../types';
import { 
  validateOfficialTestimonialReadiness,
  generateCanonicalVerificationToken,
  buildCanonicalVerificationUrl,
  createIssuedTestimonialEntity,
  saveTestimonialRosterChangesAtomic
} from '../services/testimonialService';
import { TestimonialRosterItem, TestimonialExam } from '../types/testimonial';

describe('Testimonial Module Characterization & Phase 6 Integrity Tests', () => {
  const mockInstitution: Institution = {
    
    name: 'Sonapur High School',
    nameBn: 'সোনাপুর উচ্চ বিদ্যালয়',
            headmasterName: 'Mr. X',
    address: 'Sonapur, Noakhali',
    established: '1960',
    eiin: '105820',
    board: 'Cumilla',
        upazila: 'Sonapur',
    upazilaBn: 'সোনাপুর',
    district: 'Noakhali',
    districtBn: 'নোয়াখালী',
    mobile: '01700000000',
    website: 'https://sonapur.edu.bd',
  };

  const mockExam: TestimonialExam = {
    id: 'exam_ssc_2026',
    examType: 'SSC',
    examTypeId: 'pexam_ssc',
    year: '2026',
    board: 'Cumilla',
        displayName: 'SSC Examination 2026',
    displayNameBn: 'মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) ২০২৬',
    examCenter: 'Sonapur Center',
    examCenterBn: 'সোনাপুর কেন্দ্র',
    gradingScale: '5.00',
    status: 'active',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  };

  const validRosterItem: TestimonialRosterItem = {
    id: 'er_001',
    studentId: 'STU-001',
    studentDbId: 'db_stu_001',
    examId: 'exam_ssc_2026',
    examName: 'SSC Examination 2026',
    examNameBn: 'মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি) ২০২৬',
    passingYear: '2026',
    session: '2024-25',
    group: 'Science',
    boardRollNo: '123456',
    registrationNo: '1912345678',
    gpa: '5.00',
    board: 'Cumilla',
    examCenter: 'Sonapur Center',
    examCenterBn: 'সোনাপুর কেন্দ্র',
    name: 'Karim Ahmed',
    nameBn: 'করিম আহমেদ',
    fatherName: 'Rahim Ahmed',
    fatherNameBn: 'রহিম আহমেদ',
    motherName: 'Rina Begum',
    motherNameBn: 'রিনা বেগম',
    dateOfBirth: '2010-01-15',
    gender: 'Male',
    village: 'Sonapur',
    villageBn: 'সোনাপুর',
    postOffice: 'Sonapur',
    postOfficeBn: 'সোনাপুর',
    upazila: 'Sonapur',
    upazilaBn: 'সোনাপুর',
    district: 'Noakhali',
    districtBn: 'নোয়াখালী',
  };

  beforeEach(() => {
    setSecurityBypassForTesting(true);
    useAppStore.setState({ issuedTestimonials: [] });
  });

  it('correctly saves and retrieves an issued testimonial record', () => {
    const testimonial: IssuedTestimonial = {
      id: 'testi-001',
      studentId: 'st-01',
      examId: 'ssc-2026',
      examName: 'SSC Examination 2026',
      issueDate: '2026-03-01',
      format: 'format_1',
      serialNo: 'SL-2026-0001',
      memoNo: 'MEMO-001',
      language: 'bn',
      issuanceStatus: 'issued',
      distributionStatus: 'pending',
      snapshot: {
        studentName: 'Mahmudul Hasan',
        gpa: '4.80',
        board: 'Dhaka',
        group: 'Science',
      },
    };

    useAppStore.getState().addIssuedTestimonial(testimonial);
    const list = useAppStore.getState().issuedTestimonials;

    expect(list.length).toBe(1);
    expect(list[0].id).toBe('testi-001');
    expect(list[0].snapshot?.gpa).toBe('4.80');
    expect(list[0].snapshot?.board).toBe('Dhaka');
  });

  it('does not invent fake 5.00 GPA or Cumilla board when data is absent', () => {
    const incompleteTestimonial: IssuedTestimonial = {
      id: 'testi-incomp',
      studentId: 'st-02',
      issueDate: '2026-03-02',
      format: 'format_1',
      serialNo: 'SL-2026-0002',
      snapshot: {
        studentName: 'Incomplete Student',
        gpa: undefined,
        board: undefined,
        group: undefined,
      },
    };

    useAppStore.getState().addIssuedTestimonial(incompleteTestimonial);
    const stored = useAppStore.getState().issuedTestimonials.find(t => t.id === 'testi-incomp');

    expect(stored).toBeDefined();
    expect(stored?.snapshot?.gpa).toBeUndefined();
    expect(stored?.snapshot?.board).toBeUndefined();
    expect(stored?.snapshot?.group).toBeUndefined();
  });

  it('updates testimonial distribution status and maintains history', () => {
    const testimonial: IssuedTestimonial = {
      id: 'testi-dist',
      studentId: 'st-03',
      issueDate: '2026-03-02',
      format: 'format_1',
      distributionStatus: 'pending',
      history: [
        {
          action: 'Created',
          timestamp: '2026-03-02T10:00:00Z',
          actor: 'Admin',
        },
      ],
    };

    useAppStore.getState().addIssuedTestimonial(testimonial);

    useAppStore.getState().updateIssuedTestimonial('testi-dist', {
      distributionStatus: 'distributed',
      distributedAt: '2026-03-03',
      receivedBy: 'Father',
    });

    const updated = useAppStore.getState().issuedTestimonials.find(t => t.id === 'testi-dist');
    expect(updated?.distributionStatus).toBe('distributed');
    expect(updated?.receivedBy).toBe('Father');
    expect(updated?.distributedAt).toBe('2026-03-03');
  });

  it('deletes an issued testimonial cleanly by ID', () => {
    const testimonial: IssuedTestimonial = {
      id: 'testi-del',
      studentId: 'st-04',
      issueDate: '2026-03-02',
      format: 'format_1',
    };

    useAppStore.getState().addIssuedTestimonial(testimonial);
    expect(useAppStore.getState().issuedTestimonials.length).toBe(1);

    useAppStore.getState().deleteIssuedTestimonial('testi-del');
    expect(useAppStore.getState().issuedTestimonials.length).toBe(0);
  });

  // PHASE 6 SPECIFIC TESTS
  describe('Phase 6 Readiness Gates & Data Integrity', () => {
    it('readiness gate blocks issuance when essential official fields are missing', () => {
      const incompleteItem: TestimonialRosterItem = {
        ...validRosterItem,
        boardRollNo: '',
        registrationNo: '',
        gpa: '',
        examCenter: '',
        examCenterBn: '',
      };

      const readiness = validateOfficialTestimonialReadiness(incompleteItem, mockInstitution, 'bn');
      expect(readiness.isReady).toBe(false);
      expect(readiness.missingFields).toContain('boardRollNo');
      expect(readiness.missingFields).toContain('registrationNo');
      expect(readiness.missingFields).toContain('gpa');
      expect(readiness.missingFields).toContain('examCenter');
    });

    it('readiness gate blocks issuance when institution EIIN or name is missing', () => {
      const instWithoutEiin: Institution = {
        ...mockInstitution,
        eiin: '',
      };

      const readiness = validateOfficialTestimonialReadiness(validRosterItem, instWithoutEiin, 'bn');
      expect(readiness.isReady).toBe(false);
      expect(readiness.missingFields).toContain('eiin');
    });

    it('readiness gate passes when all required official fields exist', () => {
      const readiness = validateOfficialTestimonialReadiness(validRosterItem, mockInstitution, 'bn');
      expect(readiness.isReady).toBe(true);
      expect(readiness.missingFields.length).toBe(0);
    });

    it('generates a canonical verification token and verification URL with hash routing', () => {
      const token = generateCanonicalVerificationToken('STU-001', '2026');
      expect(token).toMatch(/^BDLK-2026-STU001-[A-F0-9]{12}$/);

      const url = buildCanonicalVerificationUrl(token, 'https://myschool.edu.bd');
      expect(url).toContain('https://myschool.edu.bd');
      expect(url).toContain('#/verify/testimonial/');
      expect(url).toContain(token);
    });

    it('creates a complete IssuedTestimonial entity with tamper-evident snapshot hash', async () => {
      const entity = await createIssuedTestimonialEntity(
        validRosterItem,
        mockExam,
        mockInstitution,
        'bn',
        '2026/01',
        'db_stu_001'
      );

      expect(entity.serialNo).toBe('2026/01');
      expect(entity.studentDbId).toBe('db_stu_001');
      expect(entity.studentId).toBe('STU-001');
      expect(entity.verificationToken).toBeDefined();
      expect(entity.verificationUrl).toBeDefined();
      expect(entity.snapshotHash).toBeDefined();
      expect(entity.snapshot?.eiin).toBe('105820');
      expect(entity.snapshot?.boardRollNo).toBe('123456');
      expect(entity.snapshot?.gpa).toBe('5.00');
      expect(entity.history?.length).toBe(1);
      expect(entity.history?.[0].action.toLowerCase()).toBe('issued');
    });

    it('commits bulk roster changes atomically with transaction tracking', async () => {
      const mockUpdateExamResult = (id: string, updates: any) => {
        expect(id).toBe('er_001');
        expect(updates.gpa).toBe('5.00');
      };

      const mockUpdateStudent = (id: string, updates: any) => {
        expect(id).toBe('db_stu_001');
      };

      const result = await saveTestimonialRosterChangesAtomic({
        transactions: [
          {
            item: validRosterItem,
            studentDbId: 'db_stu_001',
            examResultId: 'er_001',
          }
        ],
        updateExamResult: mockUpdateExamResult,
        updateStudent: mockUpdateStudent,
      });

      expect(result.successfulIds.length).toBe(1);
      expect(result.failedRecords.length).toBe(0);
    });
  });
});
