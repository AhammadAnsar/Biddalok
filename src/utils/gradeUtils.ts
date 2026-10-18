export const getLetterGrade = (gpaStr: string | number | undefined | null): string => {
  if (!gpaStr) return '';
  // Convert Bengali numerals to English digits if present
  const normalizedStr = String(gpaStr)
    .trim()
    .replace(/[০-৯]/g, d => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString());
    
  const gpa = Number(normalizedStr);
  if (isNaN(gpa)) return gpaStr.toString(); // If it's already a letter grade or text
  if (gpa >= 5.0) return 'A+';
  if (gpa >= 4.0) return 'A';
  if (gpa >= 3.5) return 'A-';
  if (gpa >= 3.0) return 'B';
  if (gpa >= 2.0) return 'C';
  if (gpa >= 1.0) return 'D';
  return 'F';
};
