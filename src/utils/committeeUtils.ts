import { Student, StaffMember } from '../types';

export function calculateUniqueGuardians(students: Student[]): number {
  if (!students || students.length === 0) return 0;
  
  const uniqueKeys = new Set<string>();
  let fallbackCount = 0;

  for (const student of students) {
    let key = '';
    
    // Priority 1: NID
    if (student.fatherNid) {
      key = `nid_${student.fatherNid.trim()}`;
    } 
    // Priority 2: Mobile
    else if (student.fatherMobile) {
      key = `mob_${student.fatherMobile.trim()}`;
    } 
    // Priority 3: Names + Village combination
    else if (student.fatherName || student.motherName) {
      const fName = (student.fatherName || student.fatherNameBn || '').trim().toLowerCase();
      const mName = (student.motherName || student.motherNameBn || '').trim().toLowerCase();
      const village = (student.village || student.villageBn || '').trim().toLowerCase();
      
      if (fName || mName) {
        key = `name_${fName}_${mName}_${village}`;
      }
    }

    if (key) {
      uniqueKeys.add(key);
    } else {
      // If absolutely no guardian info exists, count as unique fallback
      fallbackCount++;
    }
  }

  return uniqueKeys.size + fallbackCount;
}

export function calculateEligibleTeachers(staff: StaffMember[]): number {
  if (!staff || staff.length === 0) return 0;
  // Usually, all active teaching staff are eligible, but we will count active ones.
  // For simplicity, count all staff with 'teacher' role or active status.
  return staff.filter(s => s.status === 'active').length;
}
