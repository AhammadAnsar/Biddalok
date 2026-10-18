import { StaffMember, ClassTeacherAssignment, SubjectTeacherAssignment, PayrollMonthlySheet } from '../types';

export const defaultDesignations = [
  { id: 'des_headmaster', name: 'Headmaster / Principal', nameBn: 'প্রধান শিক্ষক / অধ্যক্ষ', category: 'teaching', grade: 'Grade 6 (35,500)' },
  { id: 'des_asst_headmaster', name: 'Assistant Headmaster', nameBn: 'সহকারী প্রধান শিক্ষক / উপাধ্যক্ষ', category: 'teaching', grade: 'Grade 7 (29,000)' },
  { id: 'des_senior_teacher', name: 'Senior Teacher', nameBn: 'সিনিয়র শিক্ষক', category: 'teaching', grade: 'Grade 9 (22,000)' },
  { id: 'des_asst_teacher', name: 'Assistant Teacher', nameBn: 'সহকারী শিক্ষক', category: 'teaching', grade: 'Grade 10 (16,000)' },
  { id: 'des_junior_teacher', name: 'Junior / Physical Education Teacher', nameBn: 'জুনিয়র শিক্ষক / শরীরচর্চা শিক্ষক', category: 'teaching', grade: 'Grade 11 (12,500)' },
  { id: 'des_ict_teacher', name: 'Assistant Teacher (ICT)', nameBn: 'সহকারী শিক্ষক (তথ্য ও যোগাযোগ প্রযুক্তি)', category: 'teaching', grade: 'Grade 10 (16,000)' },
  { id: 'des_religion_teacher', name: 'Assistant Teacher (Religion)', nameBn: 'সহকারী শিক্ষক (ধর্ম ও নৈতিক শিক্ষা)', category: 'teaching', grade: 'Grade 10 (16,000)' },
  { id: 'des_lecturer', name: 'Lecturer', nameBn: 'প্রভাষক', category: 'teaching', grade: 'Grade 9 (22,000)' },
  { id: 'des_accountant', name: 'Accountant', nameBn: 'হিসাবরক্ষক', category: 'non_teaching', grade: 'Grade 13 (11,000)' },
  { id: 'des_office_assistant', name: 'Office Assistant Cum Computer Operator', nameBn: 'অফিস সহকারী কাম কম্পিউটার অপারেটর', category: 'non_teaching', grade: 'Grade 16 (9,300)' },
  { id: 'des_lab_assistant', name: 'Lab Assistant', nameBn: 'ল্যাব সহকারী', category: 'non_teaching', grade: 'Grade 18 (8,800)' },
  { id: 'des_library_asst', name: 'Library Assistant', nameBn: 'গ্রন্থাগার সহকারী', category: 'non_teaching', grade: 'Grade 16 (9,300)' },
  { id: 'des_mlss', name: 'MLSS / Office Peon', nameBn: 'অফিস সহায়ক / পিয়ন', category: 'non_teaching', grade: 'Grade 20 (8,250)' },
  { id: 'des_guard', name: 'Night Guard / Security', nameBn: 'নিরাপত্তা প্রহরী / নৈশপ্রহরী', category: 'non_teaching', grade: 'Grade 20 (8,250)' },
  { id: 'des_aya', name: 'Aya / Cleaner', nameBn: 'আয়া / পরিচ্ছন্নতাকর্মী', category: 'non_teaching', grade: 'Grade 20 (8,250)' },
];

export const payScaleGrades = [
  { grade: 'Grade 6', basic: 35500, houseRent: 1000, medical: 500, title: 'জাতীয় বেতন স্কেল গ্রেড-৬ (৩৫,৫০০)' },
  { grade: 'Grade 7', basic: 29000, houseRent: 1000, medical: 500, title: 'জাতীয় বেতন স্কেল গ্রেড-৭ (২৯,০০০)' },
  { grade: 'Grade 9', basic: 22000, houseRent: 1000, medical: 500, title: 'জাতীয় বেতন স্কেল গ্রেড-৯ (২২,০০০)' },
  { grade: 'Grade 10', basic: 16000, houseRent: 1000, medical: 500, title: 'জাতীয় বেতন স্কেল গ্রেড-১০ (১৬,০০০)' },
  { grade: 'Grade 11', basic: 12500, houseRent: 1000, medical: 500, title: 'জাতীয় বেতন স্কেল গ্রেড-১১ (১২,৫০০)' },
  { grade: 'Grade 13', basic: 11000, houseRent: 1000, medical: 500, title: 'জাতীয় বেতন স্কেল গ্রেড-১৩ (১১,০০০)' },
  { grade: 'Grade 16', basic: 9300, houseRent: 1000, medical: 500, title: 'জাতীয় বেতন স্কেল গ্রেড-১৬ (৯,৩০০)' },
  { grade: 'Grade 18', basic: 8800, houseRent: 1000, medical: 500, title: 'জাতীয় বেতন স্কেল গ্রেড-১৮ (৮,৮০০)' },
  { grade: 'Grade 20', basic: 8250, houseRent: 1000, medical: 500, title: 'জাতীয় বেতন স্কেল গ্রেড-২০ (৮,২৫০)' },
];

export const initialSampleStaff: StaffMember[] = [];

export const initialClassTeacherAssignments: ClassTeacherAssignment[] = [];

export const initialSubjectTeacherAssignments: SubjectTeacherAssignment[] = [];

export const initialSamplePayroll: PayrollMonthlySheet[] = [];
