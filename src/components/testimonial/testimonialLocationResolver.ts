import { LocationItem } from '../../constants/bdLocations';
import { Institution } from '../../types';

/**
 * Checks if a string contains Bengali Unicode characters.
 */
export const isBengaliScript = (text?: string): boolean => {
  if (!text) return false;
  return /[\u0980-\u09FF]/.test(text);
};

/**
 * Checks if a string contains Latin / English alphabet characters.
 */
export const isEnglishScript = (text?: string): boolean => {
  if (!text) return false;
  return /[a-zA-Z]/.test(text);
};

/**
 * Converts English digits to Bengali digits.
 */
export const toBengaliDigits = (num: string | number): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/\d/g, (d) => bnDigits[parseInt(d, 10)]);
};

/**
 * Converts Bengali digits to English digits.
 */
export const toEnglishDigits = (text: string): string => {
  const bnToEnMap: Record<string, string> = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  };
  return text.replace(/[০-৯]/g, (ch) => bnToEnMap[ch] || ch);
};

/**
 * Resolves a single bilingual location (e.g. Upazila, District, Division)
 * by checking explicit fields, script detection, and relational learned locations.
 */
export function resolveBilingualLocation(
  enVal?: string,
  bnVal?: string,
  lookupId?: string,
  learnedLocations: LocationItem[] = []
): { en: string; bn: string } {
  const cleanEn = (enVal || '').trim();
  const cleanBn = (bnVal || '').trim();

  // 1. Try relational ID lookup
  if (lookupId && learnedLocations.length > 0) {
    const matched = learnedLocations.find(l => l.id === lookupId);
    if (matched) {
      return {
        en: matched.name || (isEnglishScript(cleanEn) ? cleanEn : ''),
        bn: matched.nameBn || (isBengaliScript(cleanBn) ? cleanBn : (isBengaliScript(cleanEn) ? cleanEn : '')),
      };
    }
  }

  // 2. Try matching learned locations by name or nameBn
  if (learnedLocations.length > 0) {
    const termEn = cleanEn.toLowerCase();
    const termBn = cleanBn;

    const matched = learnedLocations.find(l => {
      const lName = (l.name || '').toLowerCase();
      const lNameBn = l.nameBn || '';
      return (
        (cleanEn && (lName === termEn || lNameBn === cleanEn)) ||
        (cleanBn && (lNameBn === termBn || lName === termBn.toLowerCase()))
      );
    });

    if (matched) {
      return {
        en: matched.name,
        bn: matched.nameBn,
      };
    }
  }

  // 3. Script-Aware Deduction:
  // If cleanEn actually contains Bengali script, it was stored in the wrong field.
  let resolvedBn = '';
  let resolvedEn = '';

  if (isBengaliScript(cleanBn)) {
    resolvedBn = cleanBn;
  } else if (isBengaliScript(cleanEn)) {
    resolvedBn = cleanEn;
  }

  if (isEnglishScript(cleanEn)) {
    resolvedEn = cleanEn;
  } else if (isEnglishScript(cleanBn)) {
    resolvedEn = cleanBn;
  }

  return {
    en: resolvedEn,
    bn: resolvedBn,
  };
}

/**
 * Resolves a full set of bilingual address fields for a student record.
 */
export function resolveBilingualAddress(
  item: {
    village?: string;
    villageBn?: string;
    postOffice?: string;
    postOfficeBn?: string;
    upazila?: string;
    upazilaBn?: string;
    district?: string;
    districtBn?: string;
    upazilaId?: string;
    districtId?: string;
  },
  institution?: Institution | null,
  learnedLocations: LocationItem[] = []
): {
  villageEn: string;
  villageBn: string;
  postOfficeEn: string;
  postOfficeBn: string;
  upazilaEn: string;
  upazilaBn: string;
  districtEn: string;
  districtBn: string;
} {
  // Village
  const rawVilEn = (item.village || '').trim();
  const rawVilBn = (item.villageBn || '').trim();
  const villageBn = isBengaliScript(rawVilBn) ? rawVilBn : (isBengaliScript(rawVilEn) ? rawVilEn : rawVilBn);
  const villageEn = isEnglishScript(rawVilEn) ? rawVilEn : (isEnglishScript(rawVilBn) ? rawVilBn : '');

  // Post Office
  const rawPoEn = (item.postOffice || '').trim();
  const rawPoBn = (item.postOfficeBn || '').trim();
  const postOfficeBn = isBengaliScript(rawPoBn) ? rawPoBn : (isBengaliScript(rawPoEn) ? rawPoEn : rawPoBn);
  const postOfficeEn = isEnglishScript(rawPoEn) ? rawPoEn : (isEnglishScript(rawPoBn) ? rawPoBn : '');

  // Upazila (fallback to institution upazila if student has none)
  const upazilaEnInput = item.upazila || institution?.upazila || institution?.defaultUpazila;
  const upazilaBnInput = item.upazilaBn || institution?.upazilaBn || (isBengaliScript(institution?.upazila) ? institution?.upazila : '');
  const upazilaRes = resolveBilingualLocation(upazilaEnInput, upazilaBnInput, item.upazilaId, learnedLocations);

  // District (fallback to institution district if student has none)
  const distEnInput = item.district || institution?.district || institution?.defaultDistrict;
  const distBnInput = item.districtBn || institution?.districtBn || (isBengaliScript(institution?.district) ? institution?.district : '');
  const districtRes = resolveBilingualLocation(distEnInput, distBnInput, item.districtId, learnedLocations);

  return {
    villageEn,
    villageBn,
    postOfficeEn,
    postOfficeBn,
    upazilaEn: upazilaRes.en,
    upazilaBn: upazilaRes.bn,
    districtEn: districtRes.en,
    districtBn: districtRes.bn,
  };
}

/**
 * Resolves the Exam Center Name for both English and Bengali versions.
 * e.g. English: "Nangalkot-1", Bengali: "নাঙ্গলকোট-১"
 */
export function resolveBilingualCenter(
  itemCenter?: string,
  itemCenterBn?: string,
  examCenterDefault?: string,
  examCenterBnDefault?: string,
  upazilaEn?: string,
  upazilaBn?: string,
  learnedLocations: LocationItem[] = []
): { en: string; bn: string } {
  const rawCenter = (itemCenter || examCenterDefault || '').trim();
  const rawCenterBn = (itemCenterBn || examCenterBnDefault || '').trim();

  let centerEn = '';
  let centerBn = '';

  if (isBengaliScript(rawCenterBn)) {
    centerBn = rawCenterBn;
  } else if (isBengaliScript(rawCenter)) {
    centerBn = rawCenter;
  }

  if (isEnglishScript(rawCenter)) {
    centerEn = rawCenter;
  } else if (isEnglishScript(rawCenterBn)) {
    centerEn = rawCenterBn;
  }

  // If one language is missing, attempt to translate base name
  if (!centerBn && centerEn) {
    // Check if starts with an English upazila name, e.g. "Nangalkot-1"
    const match = centerEn.match(/^([a-zA-Z\s]+)(-\d+)?$/);
    if (match) {
      const baseName = match[1].trim();
      const suffix = match[2] || '';
      const loc = learnedLocations.find(l => l.name.toLowerCase() === baseName.toLowerCase());
      if (loc && loc.nameBn) {
        centerBn = `${loc.nameBn}${toBengaliDigits(suffix)}`;
      } else if (upazilaBn) {
        centerBn = `${upazilaBn}${toBengaliDigits(suffix || '-১')}`;
      }
    }
  }

  if (!centerEn && centerBn) {
    // Check if starts with a Bengali upazila name, e.g. "নাঙ্গলকোট-১"
    const match = centerBn.match(/^([\u0980-\u09FF\s]+)(-[০-৯]+)?$/);
    if (match) {
      const baseName = match[1].trim();
      const suffix = match[2] ? toEnglishDigits(match[2]) : '';
      const loc = learnedLocations.find(l => l.nameBn === baseName);
      if (loc && loc.name) {
        centerEn = `${loc.name}${suffix}`;
      } else if (upazilaEn) {
        centerEn = `${upazilaEn}${suffix || '-1'}`;
      }
    }
  }

  // Do not guess or invent center if empty — leave empty so readiness gate enforces official data
  return {
    en: centerEn,
    bn: centerBn,
  };
}
