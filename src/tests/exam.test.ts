import { describe, it, expect } from 'vitest';
import { 
  evaluateSubjectMarks, 
  calculateStudentExamSummary,
  defaultFallbackGradingRules 
} from '../utils/examCalculations';
import { SubjectItem, ExamResult } from '../types';

describe('Exam Calculation Characterization Tests', () => {
  it('correctly grades subject marks according to Bangladesh secondary rules', () => {
    const subject: SubjectItem = {
      id: 'sub-bangla',
      name: 'Bangla 1st',
      nameBn: 'বাংলা ১ম',
      code: '101',
      className: 'Class 10',
      fullMarks: 100,
      passMarks: 33,
      cqMarks: 70,
      passLogic: 'individual_separator',
      mcqMarks: 30,
    };

    // 85% -> A+ / 5.0
    const resA = evaluateSubjectMarks({ cq: 60, mcq: 25, practical: 0 }, subject);
    expect(resA.total).toBe(85);
    expect(resA.grade).toBe('A+');
    expect(resA.gpa).toBe(5.0);
    expect(resA.isPassed).toBe(true);

    // 72% -> A / 4.0
    const resB = evaluateSubjectMarks({ cq: 50, mcq: 22, practical: 0 }, subject);
    expect(resB.total).toBe(72);
    expect(resB.grade).toBe('A');
    expect(resB.gpa).toBe(4.0);
    expect(resB.isPassed).toBe(true);

    // 25% -> Fail / 0.0
    const resFail = evaluateSubjectMarks({ cq: 15, mcq: 10, practical: 0 }, subject);
    expect(resFail.total).toBe(25);
    expect(resFail.grade).toBe('F');
    expect(resFail.gpa).toBe(0.0);
    expect(resFail.isPassed).toBe(false);
  });

  it('fails subject if individual component fails when separate pass is required', () => {
    const subjectSeparate: SubjectItem = {
      id: 'sub-math',
      name: 'General Math',
      nameBn: 'গণিত',
      code: '109',
      className: 'Class 10',
      fullMarks: 100,
      passMarks: 33,
      passLogic: 'individual_separator',
      cqMarks: 70,
      mcqMarks: 30,
    };

    // CQ is 50 (passed >= 23 ceil(70*0.33)), but MCQ is 8 (failed < 10 ceil(30*0.33)) even though total is 58
    // With cqMarks=70 (default cqPassMarks is 23) and mcqMarks=30 (default mcqPassMarks is 10)
    // Let's pass scores
    const res = evaluateSubjectMarks({ cq: 50, mcq: 8, practical: 0 }, {
      ...subjectSeparate,
      ...({ cqPassMarks: 23, mcqPassMarks: 10 } as any)
    });
    expect(res.total).toBe(58);
    expect(res.cqPassed).toBe(true);
    expect(res.mcqPassed).toBe(false);
    expect(res.isPassed).toBe(false);
    expect(res.grade).toBe('F');
    expect(res.gpa).toBe(0.0);
  });

  it('fails overall student exam GPA if any compulsory subject fails', () => {
    const sub1: SubjectItem = {
      id: 'sub-1',
      name: 'Bangla',
      nameBn: 'বাংলা',
      code: '101',
      className: 'Class 10',
      fullMarks: 100,
      passMarks: 33,
    };
    const sub2: SubjectItem = {
      id: 'sub-2',
      name: 'English',
      nameBn: 'ইংরেজি',
      code: '107',
      className: 'Class 10',
      fullMarks: 100,
      passMarks: 33,
    };

    const results: ExamResult[] = [
      {
        id: 'r1',
        examId: 'term-1',
        studentId: 'st-01',
        subjectId: 'sub-1',
        cqMarksObtained: 80,
        mcqMarksObtained: 0,
        practicalMarksObtained: 0,
        totalMarks: 80,
        totalMarksObtained: 80,
        isAbsent: false,
      },
      {
        id: 'r2',
        examId: 'term-1',
        studentId: 'st-01',
        subjectId: 'sub-2',
        cqMarksObtained: 20, // Failed (< 33)
        mcqMarksObtained: 0,
        practicalMarksObtained: 0,
        totalMarks: 20,
        totalMarksObtained: 20,
        isAbsent: false,
      },
    ];

    const summary = calculateStudentExamSummary('st-01', [sub1, sub2], results, 'term-1', defaultFallbackGradingRules);
    expect(summary.failedSubjectCount).toBe(1);
    expect(summary.isPassed).toBe(false);
    expect(summary.gpa).toBe(0.0);
    expect(summary.grade).toBe('F');
  });

  it('calculates average GPA and correctly adds 4th optional subject bonus points (> 2.0 GPA)', () => {
    const sub1: SubjectItem = {
      id: 'sub-1',
      name: 'Subject 1',
      nameBn: 'বিষয় ১',
      code: '101',
      className: 'Class 10',
      fullMarks: 100,
      passMarks: 33,
    };
    const sub2: SubjectItem = {
      id: 'sub-2',
      name: 'Subject 2',
      nameBn: 'বিষয় ২',
      code: '102',
      className: 'Class 10',
      fullMarks: 100,
      passMarks: 33,
    };
    const subOptional: SubjectItem = {
      id: 'sub-opt',
      name: 'Higher Math (Optional)',
      nameBn: 'উচ্চতর গণিত',
      code: '126',
      className: 'Class 10',
      fullMarks: 100,
      passMarks: 33,
      isOptional: true,
    };

    const results: ExamResult[] = [
      {
        id: 'r1',
        examId: 'term-1',
        studentId: 'st-02',
        subjectId: 'sub-1',
        cqMarksObtained: 75, // GPA 4.0
        totalMarks: 75,
        totalMarksObtained: 75,
        isAbsent: false,
      },
      {
        id: 'r2',
        examId: 'term-1',
        studentId: 'st-02',
        subjectId: 'sub-2',
        cqMarksObtained: 75, // GPA 4.0
        totalMarks: 75,
        totalMarksObtained: 75,
        isAbsent: false,
      },
      {
        id: 'r3',
        examId: 'term-1',
        studentId: 'st-02',
        subjectId: 'sub-opt',
        cqMarksObtained: 85, // GPA 5.0 -> Bonus = 5.0 - 2.0 = 3.0 points
        totalMarks: 85,
        totalMarksObtained: 85,
        isAbsent: false,
      },
    ];

    const summary = calculateStudentExamSummary('st-02', [sub1, sub2, subOptional], results, 'term-1', defaultFallbackGradingRules);
    expect(summary.isPassed).toBe(true);
    // Base GP sum = 4.0 + 4.0 = 8.0. Base avg = 4.0.
    // Bonus from 4th sub = (5.0 - 2.0) = 3.0.
    // Adjusted GP sum = 8.0 + 3.0 = 11.0 / 2 = 5.5 -> capped at 5.0
    expect(summary.gpa).toBe(5.0);
    expect(summary.grade).toBe('A+');
  });
});

import { OFFICIAL_SECONDARY_GOLDEN_CORPUS, verifyExamPolicyAgainstCorpus } from '../data/goldenExamFixtures';

describe('Phase 10: Golden Exam Policy Corpus & Board Rule Conformance Tests', () => {
  it('verifies that default secondary policy conforms to official BISE regulations', () => {
    const verification = verifyExamPolicyAgainstCorpus(OFFICIAL_SECONDARY_GOLDEN_CORPUS);
    expect(verification.isValid).toBe(true);
    expect(verification.verificationReport.compulsoryFailEnforced).toBe(true);
    expect(verification.verificationReport.separateCqMcqPracticalPass).toBe(true);
    expect(verification.verificationReport.optionalFourthBonusCap).toBe(true);
    expect(verification.verificationReport.gradeBoundaryConsistent).toBe(true);
    expect(verification.verificationReport.totalGpaCap5).toBe(true);
  });

  it('runs all Golden Corpus test fixtures and validates exact expected academic outcomes', () => {
    OFFICIAL_SECONDARY_GOLDEN_CORPUS.testCases.forEach(tc => {
      const summary = calculateStudentExamSummary(
        tc.results[0].studentId,
        tc.subjects,
        tc.results,
        'term-gold',
        OFFICIAL_SECONDARY_GOLDEN_CORPUS.gradingRules
      );

      expect(summary.totalObtained).toBe(tc.expected.totalObtained);
      expect(summary.gpa).toBe(tc.expected.gpa);
      expect(summary.grade).toBe(tc.expected.grade);
      expect(summary.isPassed).toBe(tc.expected.isPassed);
      expect(summary.failedSubjectCount).toBe(tc.expected.failedSubjectCount);
      if (tc.expected.isAbsent !== undefined) {
        expect(summary.isAbsent).toBe(tc.expected.isAbsent);
      }
    });
  });

  it('handles absent and withheld status cleanly preventing pass release', () => {
    const sub1 = { id: 's1', name: 'Subject 1', code: '101', className: 'Class 10', fullMarks: 100, passMarks: 33 };
    const resultsWithheld = [
      { id: 'r1', examId: 'term-x', studentId: 'st-withheld', subjectId: 's1', cqMarksObtained: 85, isWithheld: true }
    ];
    const summary = calculateStudentExamSummary('st-withheld', [sub1], resultsWithheld, 'term-x', defaultFallbackGradingRules);
    expect(summary.isWithheld).toBe(true);
    expect(summary.isPassed).toBe(false);
  });
});
