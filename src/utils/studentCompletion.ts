import { Student } from '../types';

/**
 * Calculates the percentage of completed/filled student data fields (0 - 100%)
 */
export function calculateStudentDataCompletion(student?: Partial<Student> | null): number {
  if (!student || typeof student !== 'object') return 0;

  const isFilled = (val: unknown): boolean => {
    if (val === undefined || val === null) return false;
    if (typeof val === 'string') return val.trim().length > 0 && val.trim() !== 'প্রযোজ্য নয়' && val.trim() !== 'N/A';
    if (typeof val === 'number') return !isNaN(val) && val > 0;
    if (typeof val === 'boolean') return val;
    return true;
  };

  const checks: boolean[] = [
    // 1. Basic Info
    isFilled(student.year || student.admissionYear),
    isFilled(student.studentId),
    isFilled(student.class),
    isFilled(student.session),
    isFilled(student.roll),

    // 2. Personal / Demographics
    isFilled(student.name),
    isFilled(student.nameBn),
    isFilled(student.gender),
    isFilled(student.dateOfBirth),
    isFilled(student.birthRegistrationNo),
    isFilled(student.religion),
    isFilled(student.bloodGroup),

    // 3. Permanent Address
    isFilled(student.district),
    isFilled(student.upazila),
    isFilled(student.postOffice),
    isFilled(student.village),

    // 4. Present Address
    Boolean(student.isAddressSame || (isFilled(student.presentDistrict) && isFilled(student.presentVillage))),

    // 5. Parents Info
    isFilled(student.fatherName),
    isFilled(student.fatherMobile),
    isFilled(student.motherName),

    // 6. Guardian Info
    Boolean(isFilled(student.guardianName) || isFilled(student.guardianRelation)),
    Boolean(isFilled(student.guardianMobile) || isFilled(student.fatherMobile) || isFilled(student.motherMobile)),

    // 7. Previous Education
    isFilled(student.prevSchoolName),

    // 8. Payment & Documents
    isFilled(student.admissionPayment),
    Boolean(isFilled(student.photo) || isFilled(student.photoUrl)),
  ];

  const filledCount = checks.filter(Boolean).length;
  const total = checks.length;
  return Math.min(100, Math.max(0, Math.round((filledCount / total) * 100)));
}
