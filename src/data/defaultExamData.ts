import { ExamTerm, SubjectItem, GradingRule, ExamRoutineItem, AdmitCardSettings } from '../types';
import { defaultCurriculumMappings } from './defaultCurriculumData';

export const defaultExamTerms: ExamTerm[] = [
  {
    id: 'term_1st_evaluation',
    name: '1st Term / Half-Yearly Examination',
    nameBn: '১ম সাময়িক / অর্ধ-বার্ষিক পরীক্ষা',
    year: '2026',
    termCode: 'TERM-01',
    startDate: '2026-06-01',
    endDate: '2026-06-20',
    status: 'completed',
    isDefault: false,
    description: 'First terminal and half-yearly comprehensive evaluation.'
  },
  {
    id: 'term_2nd_evaluation',
    name: '2nd Term / Pre-Test Examination',
    nameBn: '২য় সাময়িক / প্রাক-নির্বাচনী পরীক্ষা',
    year: '2026',
    termCode: 'TERM-02',
    startDate: '2026-09-01',
    endDate: '2026-09-20',
    status: 'upcoming',
    isDefault: false,
    description: 'Second terminal / Pre-test examination.'
  },
  {
    id: 'term_annual_evaluation',
    name: 'Annual / Final Examination',
    nameBn: 'বার্ষিক পরীক্ষা / সমাপনী মূল্যায়ন',
    year: '2026',
    termCode: 'TERM-03',
    startDate: '2026-11-15',
    endDate: '2026-12-05',
    status: 'upcoming',
    isDefault: true,
    description: 'Final annual examination for promotion to the next class.'
  }
];

export const defaultGradingRules: GradingRule[] = [
  {
    id: 'grade_a_plus',
    grade: 'A+',
    gpa: 5.0,
    minMarks: 80,
    maxMarks: 100,
    remarks: 'Outstanding',
    remarksBn: 'অসাধারণ'
  },
  {
    id: 'grade_a',
    grade: 'A',
    gpa: 4.0,
    minMarks: 70,
    maxMarks: 79,
    remarks: 'Excellent',
    remarksBn: 'চমৎকার'
  },
  {
    id: 'grade_a_minus',
    grade: 'A-',
    gpa: 3.5,
    minMarks: 60,
    maxMarks: 69,
    remarks: 'Very Good',
    remarksBn: 'খুব ভালো'
  },
  {
    id: 'grade_b',
    grade: 'B',
    gpa: 3.0,
    minMarks: 50,
    maxMarks: 59,
    remarks: 'Good',
    remarksBn: 'ভালো'
  },
  {
    id: 'grade_c',
    grade: 'C',
    gpa: 2.0,
    minMarks: 40,
    maxMarks: 49,
    remarks: 'Satisfactory',
    remarksBn: 'সন্তোষজনক'
  },
  {
    id: 'grade_d',
    grade: 'D',
    gpa: 1.0,
    minMarks: 33,
    maxMarks: 39,
    remarks: 'Passing',
    remarksBn: 'উত্তীর্ণ'
  },
  {
    id: 'grade_f',
    grade: 'F',
    gpa: 0.0,
    minMarks: 0,
    maxMarks: 32,
    remarks: 'Failed',
    remarksBn: 'অনুত্তীর্ণ'
  }
];

export const defaultSubjects: SubjectItem[] = defaultCurriculumMappings.map(m => ({
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

export const defaultExamRoutines: ExamRoutineItem[] = [];

export const defaultAdmitCardSettings: AdmitCardSettings = {
  instructions: [
    'Examinees must enter the examination hall at least 30 minutes before the exam begins.',
    'No student will be allowed inside the examination hall without an official Admit Card.',
    'Mobile phones, digital smartwatches, and programmable devices are strictly prohibited.',
    'Any scratching, tampering, or overwriting on this admit card will render it invalid.',
    'Misconduct or violation of examination discipline will lead to immediate cancellation.'
  ],
  instructionsBn: [
    'পরীক্ষার্থীদের পরীক্ষা শুরুর অন্তত ৩০ মিনিট পূর্বে পরীক্ষার হলে উপস্থিত হতে হবে।',
    'প্রবেশপত্র ছাড়া কোনো অবস্থাতেই পরীক্ষা কক্ষে প্রবেশ করতে দেওয়া হবে না।',
    'পরীক্ষা কক্ষে কোনো প্রকার মোবাইল ফোন, ডিজিটাল স্মার্টওয়াচ বা নিষিদ্ধ ডিভাইস সম্পূর্ণ নিষিদ্ধ।',
    'প্রবেশপত্রে কোনো প্রকার ঘষামাজা, কাটাকাটি বা তথ্যের পরিবর্তন করা সম্পূর্ণ অবৈধ।',
    'পরীক্ষার শৃঙ্খলা ভঙ্গ করলে তাৎক্ষণিকভাবে পরীক্ষা বাতিল বলে গণ্য হবে।'
  ],
  showPhoto: true,
  showRoutine: true,
  showQrCode: true,
  showLogo: true,
  signatoryTitle: 'অধ্যক্ষ / প্রধান শিক্ষক',
  signatoryName: '',
  issueDate: new Date().toISOString().split('T')[0]
};
