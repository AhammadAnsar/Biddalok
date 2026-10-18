import { GradingRule, SubjectItem, CurriculumSubjectMapping, ExamResult } from '../types';

export interface SubjectScoreBreakdown {
  cq: number | string | null;
  mcq: number | string | null;
  practical?: number | string | null;
  continuous?: number | string | null;
}

export interface SubjectEvaluationResult {
  total: number;
  grade: string;
  gpa: number;
  isPassed: boolean;
  cqPassed: boolean;
  mcqPassed: boolean;
  practicalPassed: boolean;
  percentage: number;
}

export interface StudentSubjectReport {
  subject: SubjectItem | CurriculumSubjectMapping;
  scores: SubjectScoreBreakdown;
  evaluation: SubjectEvaluationResult;
  hasMarks: boolean;
}

export interface StudentExamSummary {
  studentId: string;
  totalObtained: number;
  totalMaxMarks: number;
  percentage: number;
  gpa: number;
  grade: string;
  isPassed: boolean;
  isAbsent?: boolean;
  isWithheld?: boolean;
  failedSubjectCount: number;
  subjectReports: StudentSubjectReport[];
  rank?: number;
}

/**
 * Standard Bangladesh Secondary Grading Scale rules
 */
export const defaultFallbackGradingRules: GradingRule[] = [
  { id: '1', grade: 'A+', gpa: 5.0, minMarks: 80, maxMarks: 100, remarks: 'Outstanding', remarksBn: 'অসাধারণ' },
  { id: '2', grade: 'A', gpa: 4.0, minMarks: 70, maxMarks: 79, remarks: 'Excellent', remarksBn: 'চমৎকার' },
  { id: '3', grade: 'A-', gpa: 3.5, minMarks: 60, maxMarks: 69, remarks: 'Very Good', remarksBn: 'খুব ভালো' },
  { id: '4', grade: 'B', gpa: 3.0, minMarks: 50, maxMarks: 59, remarks: 'Good', remarksBn: 'ভালো' },
  { id: '5', grade: 'C', gpa: 2.0, minMarks: 40, maxMarks: 49, remarks: 'Satisfactory', remarksBn: 'সন্তোষজনক' },
  { id: '6', grade: 'D', gpa: 1.0, minMarks: 33, maxMarks: 39, remarks: 'Pass', remarksBn: 'উত্তীর্ণ' },
  { id: '7', grade: 'F', gpa: 0.0, minMarks: 0, maxMarks: 32, remarks: 'Fail', remarksBn: 'অনুত্তীর্ণ' }
];

/**
 * Evaluates performance for a single subject based on component scores and curriculum pass rules
 */
export function evaluateSubjectMarks(
  scores: SubjectScoreBreakdown,
  subject: Partial<SubjectItem | CurriculumSubjectMapping> | undefined,
  gradingRules: GradingRule[] = defaultFallbackGradingRules
): SubjectEvaluationResult {
  const isComponentMissing = (val: any) => val === 'A' || val === 'W' || val === null || val === '' || val === undefined;
  const getNum = (val: any) => isComponentMissing(val) ? 0 : Number(val);

  const subAny = subject as any;
  const cq = getNum(scores.cq);
  const mcq = getNum(scores.mcq);
  const practical = getNum(scores.practical);
  const continuous = getNum(scores.continuous);

  const total = cq + mcq + practical + continuous;
  const fullMarks = Number(subject?.fullMarks) || 100;
  const percentage = fullMarks > 0 ? (total / fullMarks) * 100 : 0;
  const roundedPercentage = Math.round(percentage); // Rounding policy: round to nearest integer

  let cqPassed = true;
  let mcqPassed = true;
  let practicalPassed = true;
  let isMissingRequired = false;

  const isSeparatePass = 
    subject?.passLogic === 'individual_separator' || 
    subject?.cqMcqPassType === 'separate';

  if (subAny?.cqMarks > 0) {
    if (isComponentMissing(scores.cq)) { isMissingRequired = true; cqPassed = false; }
    else if (isSeparatePass && subAny.cqPassMarks !== undefined && Math.round(cq) < subAny.cqPassMarks) { cqPassed = false; }
  }
  if (subAny?.mcqMarks > 0) {
    if (isComponentMissing(scores.mcq)) { isMissingRequired = true; mcqPassed = false; }
    else if (isSeparatePass && subAny.mcqPassMarks !== undefined && Math.round(mcq) < subAny.mcqPassMarks) { mcqPassed = false; }
  }
  if (subAny?.practicalMarks > 0) {
    if (isComponentMissing(scores.practical)) { isMissingRequired = true; practicalPassed = false; }
    else if (isSeparatePass && subAny.practicalPassMarks !== undefined && Math.round(practical) < subAny.practicalPassMarks) { practicalPassed = false; }
  }
  // continuous marks might be required if passLogic === 'continuous_non_gpa'
  if (subAny?.continuousMarks > 0 && isComponentMissing(scores.continuous)) {
     isMissingRequired = true;
  }

  const minPassMarks = subject?.passMarks !== undefined ? subject.passMarks : Math.ceil(fullMarks * 0.33);
  const aggregatePassed = Math.round(total) >= minPassMarks;

  const isPassed = cqPassed && mcqPassed && practicalPassed && aggregatePassed && !isMissingRequired;

  if (isMissingRequired) {
    return {
      total,
      grade: 'Incomplete',
      gpa: 0.0,
      isPassed: false,
      cqPassed,
      mcqPassed,
      practicalPassed,
      percentage
    };
  }

  if (!isPassed) {
    return {
      total,
      grade: 'F',
      gpa: 0.0,
      isPassed: false,
      cqPassed,
      mcqPassed,
      practicalPassed,
      percentage
    };
  }

  // Determine Grade based on rounded percentage
  let grade = 'A+';
  let gpa = 5.0;

  // Grade mapping requires strictly contiguous thresholds.
  const matchedRule = gradingRules.find(r => roundedPercentage >= r.minMarks && roundedPercentage <= r.maxMarks);
  if (matchedRule) {
    grade = matchedRule.grade;
    gpa = matchedRule.gpa;
  } else {
    grade = 'Pass';
    gpa = 1.0;
  }

  return {
    total,
    grade,
    gpa,
    isPassed: true,
    cqPassed,
    mcqPassed,
    practicalPassed,
    percentage
  };
}

/**
 * Calculates student's complete academic exam summary:
 * Handles gross combined pass (e.g. Bangla 1st + 2nd), 4th optional subject bonus points, and final GPA.
 */
export function calculateStudentExamSummary(
  studentId: string,
  subjectsForClass: (SubjectItem | CurriculumSubjectMapping)[],
  examResults: ExamResult[],
  examId: string,
  gradingRules: GradingRule[] = defaultFallbackGradingRules
): StudentExamSummary {
  const rules = gradingRules.length > 0 ? gradingRules : defaultFallbackGradingRules;

  // Build individual reports
  let reports: StudentSubjectReport[] = subjectsForClass.map(sub => {
    const subCode = (sub as any).code || (sub as any).subjectCode;
    const existing = examResults.find(
      r => r.examId === examId && r.studentId === studentId && (r.subjectId === sub.id || (subCode && r.subjectId === subCode))
    );

    const hasMarks = existing !== undefined;
    const scores: SubjectScoreBreakdown = {
      cq: existing?.cqMarksObtained ?? 0,
      mcq: existing?.mcqMarksObtained ?? 0,
      practical: existing?.practicalMarksObtained ?? 0,
      continuous: existing?.continuousMarksObtained ?? 0
    };

    const evaluation = hasMarks
      ? evaluateSubjectMarks(scores, sub, rules)
      : {
          total: 0,
          grade: '-',
          gpa: 0,
          isPassed: false,
          cqPassed: false,
          mcqPassed: false,
          practicalPassed: false,
          percentage: 0
        };

    return {
      subject: sub,
      scores,
      evaluation,
      hasMarks
    };
  });

  // Gross Combined Pass Logic (e.g., Bangla 1st + 2nd, English 1st + 2nd)
  reports = reports.map(rep => {
    const sub = rep.subject;
    const pairedCode = (sub as any).combinedWithSubjectCode || (sub as any).combinedWithCode;
    const isCombined = (sub as any).paperPassType === 'combined' || (sub as any).passLogic === 'gross_combined';

    if (isCombined && pairedCode) {
      const pairedReport = reports.find(r => {
        const rCode = (r.subject as any).code || (r.subject as any).subjectCode;
        return rCode === pairedCode;
      });
      if (pairedReport) {
        const combinedTotal = rep.evaluation.total + pairedReport.evaluation.total;
        const combinedPass = (sub as any).combinedPassMarks || ((sub.passMarks || 33) + (pairedReport.subject.passMarks || 33));
        if (combinedTotal >= combinedPass) {
          // If combined passes, upgrade failed individual paper to passing D
          if (!rep.evaluation.isPassed) {
            return {
              ...rep,
              evaluation: {
                ...rep.evaluation,
                isPassed: true,
                grade: rep.evaluation.grade === 'F' ? 'D' : rep.evaluation.grade,
                gpa: rep.evaluation.gpa === 0 ? 1.0 : rep.evaluation.gpa
              }
            };
          }
        }
      }
    }
    return rep;
  });

  // Separate regular vs 4th optional vs continuous assessment
  const isOptionalSubject = (sub: SubjectItem | CurriculumSubjectMapping) => {
    return sub.isOptional || (sub as any).subjectType === 'optional_4th' || (sub as any).subjectType === 'continuous_assessment';
  };

  const isContinuousOnly = (sub: SubjectItem | CurriculumSubjectMapping) => {
    return (sub as any).passLogic === 'continuous_non_gpa';
  };

  const regularReports = reports.filter(r => !isOptionalSubject(r.subject) && !isContinuousOnly(r.subject));
  const optionalReport = reports.find(r => isOptionalSubject(r.subject));

  const hasAnyMarks = reports.some(r => r.hasMarks);
  const hasAbsentRegular = regularReports.some(r => {
    const subCode = (r.subject as any).code || (r.subject as any).subjectCode;
    const existing = examResults.find(
      res => res.examId === examId && res.studentId === studentId && (res.subjectId === r.subject.id || (subCode && res.subjectId === subCode))
    );
    return existing?.isAbsent === true;
  });
  const hasWithheldRegular = regularReports.some(r => {
    const subCode = (r.subject as any).code || (r.subject as any).subjectCode;
    const existing = examResults.find(
      res => res.examId === examId && res.studentId === studentId && (res.subjectId === r.subject.id || (subCode && res.subjectId === subCode))
    );
    return existing?.isWithheld === true;
  });

  const failedRegular = regularReports.filter(r => r.hasMarks && !r.evaluation.isPassed);
  const missingRegular = regularReports.filter(r => !r.hasMarks);
  const failedSubjectCount = failedRegular.length + missingRegular.length;
  const isOverallPassed = hasAnyMarks && failedSubjectCount === 0 && !hasAbsentRegular && !hasWithheldRegular && regularReports.length > 0;

  // 4th Subject Bonus (GPA > 2.0 contributes up to 3.0 points bonus)
  const fourthBonus = optionalReport && optionalReport.hasMarks && optionalReport.evaluation.isPassed
    ? Math.max(0, optionalReport.evaluation.gpa - 2.0)
    : 0;

  const regularPointsSum = regularReports.reduce((sum, r) => sum + (r.hasMarks ? r.evaluation.gpa : 0), 0);
  const baseCount = regularReports.length > 0 ? regularReports.length : 1;

  let gpa = 0.0;
  if (isOverallPassed) {
    const rawGpa = (regularPointsSum + fourthBonus) / baseCount;
    gpa = Math.min(5.0, Number(rawGpa.toFixed(2)));
  }

  const totalObtained = reports.reduce((sum, r) => sum + (r.hasMarks ? r.evaluation.total : 0), 0);
  const totalMaxMarks = reports.reduce((sum, r) => sum + (r.subject.fullMarks || 100), 0);
  const percentage = totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0;

  let overallGrade = '-';
  if (hasAnyMarks) {
    if (!isOverallPassed) {
      overallGrade = 'F';
    } else {
      const matched = rules.find(r => gpa >= r.gpa);
      overallGrade = matched ? matched.grade : (gpa >= 1.0 ? 'D' : 'F');
    }
  }

  return {
    studentId,
    totalObtained,
    totalMaxMarks,
    percentage: Number(percentage.toFixed(2)),
    gpa,
    grade: overallGrade,
    isPassed: isOverallPassed,
    isAbsent: hasAbsentRegular,
    isWithheld: hasWithheldRegular,
    failedSubjectCount,
    subjectReports: reports
  };
}

/**
 * Calculates merit rank across a cohort of students
 */
export function calculateClassMeritList(
  summaries: StudentExamSummary[],
  studentRollsMap: Record<string, number>
): (StudentExamSummary & { rank: number })[] {
  // Sort order:
  // 1. Passed students first, then failed students
  // 2. GPA descending
  // 3. Total marks obtained descending
  // 4. Roll number ascending
  const sorted = [...summaries].sort((a, b) => {
    // Passed first
    if (a.isPassed && !b.isPassed) return -1;
    if (!a.isPassed && b.isPassed) return 1;

    // Highest GPA
    if (b.gpa !== a.gpa) return b.gpa - a.gpa;

    // Highest Total Marks
    if (b.totalObtained !== a.totalObtained) return b.totalObtained - a.totalObtained;

    // Roll number tie-breaker
    const rollA = studentRollsMap[a.studentId] || 999999;
    const rollB = studentRollsMap[b.studentId] || 999999;
    return rollA - rollB;
  });

  return sorted.map((item, index) => ({
    ...item,
    rank: index + 1
  }));
}

/**
 * Formats ordinal rank in Bengali (১ম, ২য়, ৩য়, ৪র্থ, ৫ম...)
 */
export function toBengaliRank(rank: number): string {
  const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const rankStr = rank.toString();
  const bnDigits = rankStr.split('').map(d => bnNums[parseInt(d)] || d).join('');

  if (rank === 1) return `${bnDigits}ম`;
  if (rank === 2) return `${bnDigits}য়`;
  if (rank === 3) return `${bnDigits}য়`;
  if (rank === 4) return `${bnDigits}র্থ`;
  if (rank >= 5 && rank <= 10) return `${bnDigits}ম`;
  return `${bnDigits}তম`;
}
