import { Student } from '../types';

const classMap: Record<string, string> = {
  'one': '01', '1': '01', 'two': '02', '2': '02', 'three': '03', '3': '03',
  'four': '04', '4': '04', 'five': '05', '5': '05', 'six': '06', '6': '06',
  'seven': '07', '7': '07', 'eight': '08', '8': '08', 'nine': '09', '9': '09',
  'ten': '10', '10': '10', 'xi': '11', '11': '11', 'xii': '12', '12': '12',
  'play': '00', 'nursery': '00'
};

function getClassCode(className: string): string {
  if (!className) return '00';
  const strName = String(className);
  const match = strName.match(/\d+/);
  if (match) return match[0].padStart(2, '0');
  const lower = strName.toLowerCase();
  for (const key in classMap) {
    if (lower.includes(key)) return classMap[key];
  }
  return '00';
}

export function generateStudentId(className: string, currentStudents: Student[]) {
  const currentYear = new Date().getFullYear().toString().slice(-2);
  const classCode = getClassCode(className);
  
  // Find highest serial for this year and class
  const prefix = `${currentYear}${classCode}`;
  let maxSerial = 0;
  
  for (const s of currentStudents) {
    if (s.studentId && s.studentId.startsWith(prefix)) {
      const serialStr = s.studentId.slice(prefix.length);
      const serial = parseInt(serialStr);
      if (!isNaN(serial) && serial > maxSerial) {
        maxSerial = serial;
      }
    }
  }
  
  const nextSerial = (maxSerial + 1).toString().padStart(3, '0');
  return `${prefix}${nextSerial}`;
}
