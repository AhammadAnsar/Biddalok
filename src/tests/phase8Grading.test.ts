global.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} } as any;
import { describe, it, expect } from 'vitest';
import { evaluateSubjectMarks, calculateStudentExamSummary } from '../utils/examCalculations';
import { GradingRule } from '../types';

const defaultFallbackGradingRules: GradingRule[] = [
  { id: '1', grade: 'A+', gpa: 5.0, minMarks: 80, maxMarks: 100, remarks: 'Outstanding', remarksBn: 'অসাধারণ' },
  { id: '2', grade: 'A', gpa: 4.0, minMarks: 70, maxMarks: 79, remarks: 'Excellent', remarksBn: 'চমৎকার' },
  { id: '3', grade: 'A-', gpa: 3.5, minMarks: 60, maxMarks: 69, remarks: 'Very Good', remarksBn: 'খুব ভালো' },
  { id: '4', grade: 'B', gpa: 3.0, minMarks: 50, maxMarks: 59, remarks: 'Good', remarksBn: 'ভালো' },
  { id: '5', grade: 'C', gpa: 2.0, minMarks: 40, maxMarks: 49, remarks: 'Satisfactory', remarksBn: 'সন্তোষজনক' },
  { id: '6', grade: 'D', gpa: 1.0, minMarks: 33, maxMarks: 39, remarks: 'Pass', remarksBn: 'উত্তীর্ণ' },
  { id: '7', grade: 'F', gpa: 0.0, minMarks: 0, maxMarks: 32, remarks: 'Fail', remarksBn: 'অনুত্তীর্ণ' }
];

describe('Phase 08 Grading & Calculations', () => {

  it('Contiguous grading intervals without overlaps (79.5 -> A+ due to rounding)', () => {
    // 79.5 should round to 80 -> A+
    const r1 = evaluateSubjectMarks({ cq: 79.5, mcq: 0, practical: 0 }, { fullMarks: 100, passMarks: 33 }, defaultFallbackGradingRules);
    console.log('R1 Result:', r1);
    expect(r1.grade).toBe('A+');
    
    // 32.99 should round to 33 -> D
    const r2 = evaluateSubjectMarks({ cq: 32.99, mcq: 0, practical: 0 }, { fullMarks: 100, passMarks: 33 }, defaultFallbackGradingRules);
    expect(r2.grade).toBe('D');
    
    // 39.99 should round to 40 -> C
    const r3 = evaluateSubjectMarks({ cq: 39.99, mcq: 0, practical: 0 }, { fullMarks: 100, passMarks: 33 }, defaultFallbackGradingRules);
    expect(r3.grade).toBe('C');
  });

  it('Missing required component yields Incomplete status', () => {
    const r = evaluateSubjectMarks({ cq: 'A', mcq: 0, practical: 0 }, { cqMarks: 50, fullMarks: 50 }, defaultFallbackGradingRules);
    expect(r.isPassed).toBe(false);
    expect(r.grade).toBe('Incomplete');
  });

  it('Missing combined paper or failed component is not silently rescued', () => {
    const r = evaluateSubjectMarks({ cq: 10, mcq: 20, practical: 0 }, { fullMarks: 100, passLogic: 'individual_separator', cqPassMarks: 15, cqMarks: 50, mcqMarks: 50, mcqPassMarks: 15 }, defaultFallbackGradingRules);
    // Even though total is 30, cq is 10 which is less than 15!
    expect(r.cqPassed).toBe(false);
    expect(r.isPassed).toBe(false);
  });
  

  it('Nine of ten required subjects entered remains incomplete', () => {
    const subjects = Array.from({ length: 10 }).map((_, i) => ({ id: `s${i}`, fullMarks: 100, passMarks: 33 }));
    const results = Array.from({ length: 9 }).map((_, i) => ({
      id: `res${i}`,
      examId: 'e1',
      studentId: 'st1',
      subjectId: `s${i}`,
      cqMarksObtained: 50,
      mcqMarksObtained: 0,
      practicalMarksObtained: 0,
      continuousMarksObtained: 0
    }));

    const summary = calculateStudentExamSummary('st1', subjects as any, results as any, 'e1', defaultFallbackGradingRules);
    
    expect(summary.isPassed).toBe(false);
  });

});