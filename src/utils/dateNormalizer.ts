/**
 * Robust date parser and normalizer for Excel imports, CSV, and user input.
 * Handles Excel serial numbers, JS Date objects, Bengali numbers,
 * various delimiter formats (YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, DD-MM-YYYY, DD.MM.YYYY),
 * and text dates (e.g., "12 Apr 2012", "১২ জানুয়ারি ২০১২").
 */

const BENGALI_TO_ENGLISH_DIGITS: { [key: string]: string } = {
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
};

const BENGALI_MONTHS: { [key: string]: number } = {
  'জানুয়ারি': 1, 'জানুয়ারি': 1, 'জানু': 1,
  'ফেব্রুয়ারি': 2, 'ফেব্রুয়ারি': 2, 'ফেব্রু': 2,
  'মার্চ': 3,
  'এপ্রিল': 4,
  'মে': 5,
  'জুন': 6,
  'জুলাই': 7,
  'আগস্ট': 8,
  'সেপ্টেম্বর': 9, 'সেপ্টে': 9,
  'অক্টোবর': 10, 'অক্টো': 10,
  'নভেম্বর': 11, 'নভে': 11,
  'ডিসেম্বর': 12, 'ডিসে': 12
};

const ENGLISH_MONTHS: { [key: string]: number } = {
  'jan': 1, 'january': 1,
  'feb': 2, 'february': 2,
  'mar': 3, 'march': 3,
  'apr': 4, 'april': 4,
  'may': 5,
  'jun': 6, 'june': 6,
  'jul': 7, 'july': 7,
  'aug': 8, 'august': 8,
  'sep': 9, 'sept': 9, 'september': 9,
  'oct': 10, 'october': 10,
  'nov': 11, 'november': 11,
  'dec': 12, 'december': 12
};

/**
 * Converts Bengali digits to English digits
 */
export function convertBengaliDigitsToEnglish(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/[০-৯]/g, (match) => BENGALI_TO_ENGLISH_DIGITS[match] || match);
}

/**
 * Parses any incoming date value from Excel into a standard 'YYYY-MM-DD' format.
 */
export function parseExcelDate(val: any): string {
  if (val === undefined || val === null || val === '') return '';

  // 1. If it's already a JS Date object
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    const y = val.getUTCFullYear();
    const m = String(val.getUTCMonth() + 1).padStart(2, '0');
    const d = String(val.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 2. If it's a numeric value or numeric string (Excel Serial Number)
  // In Excel, 1 is 1900-01-01. Common dates for students (e.g., 2000-2026) are roughly 36526 to 46387.
  const num = typeof val === 'number' ? val : (typeof val === 'string' && /^\d+(\.\d+)?$/.test(val.trim()) ? Number(val.trim()) : NaN);
  if (!isNaN(num) && num > 1000 && num < 100000) {
    try {
      // Excel 1900 leap year bug offset is 25569 for 1970-01-01
      const utcDays = Math.floor(num - 25569);
      const utcValue = utcDays * 86400;
      const dateInfo = new Date(utcValue * 1000);
      const y = dateInfo.getUTCFullYear();
      const m = String(dateInfo.getUTCMonth() + 1).padStart(2, '0');
      const d = String(dateInfo.getUTCDate()).padStart(2, '0');
      if (y >= 1900 && y <= 2100) {
        return `${y}-${m}-${d}`;
      }
    } catch {
      // ignore and fallback
    }
  }

  // 3. String date parsing
  let str = String(val).trim();
  str = convertBengaliDigitsToEnglish(str);

  // If already standard YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // If YYYY/MM/DD or YYYY.MM.DD
  const ymdMatch = str.match(/^(\d{4})[./](\d{1,2})[./](\d{1,2})$/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = ymdMatch[2].padStart(2, '0');
    const d = ymdMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // If DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (dmyMatch) {
    const part1 = parseInt(dmyMatch[1], 10);
    const part2 = parseInt(dmyMatch[2], 10);
    const y = dmyMatch[3];

    let d: string;
    let m: string;

    // Disambiguate day vs month
    if (part1 > 12 && part2 <= 12) {
      // Definitely DD/MM/YYYY
      d = String(part1).padStart(2, '0');
      m = String(part2).padStart(2, '0');
    } else if (part2 > 12 && part1 <= 12) {
      // MM/DD/YYYY format
      m = String(part1).padStart(2, '0');
      d = String(part2).padStart(2, '0');
    } else {
      // In Bangladesh context, DD/MM/YYYY is the primary national convention
      d = String(part1).padStart(2, '0');
      m = String(part2).padStart(2, '0');
    }

    return `${y}-${m}-${d}`;
  }

  // If text dates like "12 Apr 2012" or "12-April-2010" or "April 12, 2010"
  const textDateMatch = str.match(/(\d{1,2})[\s\-_]+([A-Za-z\u0980-\u09FF]+)[\s\-_,]+(\d{4})/);
  if (textDateMatch) {
    const day = textDateMatch[1].padStart(2, '0');
    const monthStr = textDateMatch[2].toLowerCase();
    const year = textDateMatch[3];

    const monthNum = ENGLISH_MONTHS[monthStr] || BENGALI_MONTHS[monthStr];
    if (monthNum) {
      return `${year}-${String(monthNum).padStart(2, '0')}-${day}`;
    }
  }

  const monthFirstMatch = str.match(/([A-Za-z\u0980-\u09FF]+)[\s\-_]+(\d{1,2})[\s\-_,]+(\d{4})/);
  if (monthFirstMatch) {
    const monthStr = monthFirstMatch[1].toLowerCase();
    const day = monthFirstMatch[2].padStart(2, '0');
    const year = monthFirstMatch[3];

    const monthNum = ENGLISH_MONTHS[monthStr] || BENGALI_MONTHS[monthStr];
    if (monthNum) {
      return `${year}-${String(monthNum).padStart(2, '0')}-${day}`;
    }
  }

  // Try standard JS Date parsing fallback
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime()) && parsed.getFullYear() >= 1900 && parsed.getFullYear() <= 2100) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Return original trimmed string if all else fails
  return str;
}

/**
 * Extracts date of birth from an Excel row object by checking all known header variations
 */
export function extractDobFromRow(row: Record<string, any>): string {
  if (!row || typeof row !== 'object') return '';

  const possibleKeys = [
    'Date of Birth',
    'Date Of Birth',
    'DOB',
    'dob',
    'Dob',
    'Birth Date',
    'BirthDate',
    'Birth_Date',
    'Date_of_Birth',
    'date_of_birth',
    'জন্ম তারিখ',
    'জন্মতারিখ',
    'জন্ম_তারিখ',
    'Birthday',
    'Date of birth'
  ];

  for (const key of possibleKeys) {
    if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
      const parsed = parseExcelDate(row[key]);
      if (parsed) return parsed;
    }
  }

  // Also check keys case-insensitively
  for (const [k, val] of Object.entries(row)) {
    const lower = k.toLowerCase().replace(/[\s_\-]/g, '');
    if (lower.includes('dob') || lower.includes('dateofbirth') || lower.includes('birthdate') || k.includes('জন্ম')) {
      if (val !== undefined && val !== null && val !== '') {
        const parsed = parseExcelDate(val);
        if (parsed) return parsed;
      }
    }
  }

  return '';
}
