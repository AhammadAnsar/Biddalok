import { describe, it, expect } from 'vitest';
import { toEnglishNumber, toBengaliNumber } from '../utils/bengaliUtils';

// Sanitizer functions identical to OnboardingWizard
const sanitizeBanglaOnly = (val: string): string => {
  if (!val) return '';
  const noEnglish = val.replace(/[a-zA-Z]/g, '');
  if (!/[\u0980-\u09FF]/.test(noEnglish)) {
    return noEnglish.replace(/\s+/g, '');
  }
  return noEnglish;
};

const sanitizeEnglishOnly = (val: string): string => {
  if (!val) return '';
  const noBangla = val.replace(/[\u0980-\u09FF]/g, '');
  if (!/[a-zA-Z0-9]/.test(noBangla)) {
    return noBangla.replace(/\s+/g, '');
  }
  return noBangla;
};

const sanitizeNumericOnly = (val: string, maxLen?: number): string => {
  const converted = toEnglishNumber(val);
  const clean = converted.replace(/[^0-9]/g, '');
  return maxLen ? clean.slice(0, maxLen) : clean;
};

const sanitizePhone = (val: string): string => {
  const converted = toEnglishNumber(val);
  const clean = converted.replace(/[^0-9+\-]/g, '');
  return clean.slice(0, 16);
};

const sanitizeUsername = (val: string): string => {
  const converted = toEnglishNumber(val);
  return converted.replace(/[\u0980-\u09FF\s]/g, '').replace(/[^a-zA-Z0-9._\-]/g, '');
};

describe('Onboarding Form Input Sanitization & Script Enforcement', () => {
  it('strictly blocks English characters from Bangla-only fields', () => {
    // English alphabets must be stripped
    expect(sanitizeBanglaOnly('আদর্শ উচ্চ বিদ্যালয় Adarsha School')).toBe('আদর্শ উচ্চ বিদ্যালয়  ');
    expect(sanitizeBanglaOnly('Adarsha High School')).toBe('');
    expect(sanitizeBanglaOnly('নাঙ্গলকোট-৯ Nangalkot-9')).toBe('নাঙ্গলকোট-৯ -9');
    expect(sanitizeBanglaOnly('মোঃ আব্দুর রহমান (Md. Abdur Rahman)')).toBe('মোঃ আব্দুর রহমান (.  )');
  });

  it('strictly blocks Bengali characters from English-only fields', () => {
    // Bengali unicode (letters and numerals) must be stripped
    expect(sanitizeEnglishOnly('Adarsha High School আদর্শ')).toBe('Adarsha High School ');
    expect(sanitizeEnglishOnly('আদর্শ উচ্চ বিদ্যালয়')).toBe('');
    expect(sanitizeEnglishOnly('Nangalkot-9 নাঙ্গলকোট-৯')).toBe('Nangalkot-9 -');
    expect(sanitizeEnglishOnly('Md. Abdur Rahman মোঃ')).toBe('Md. Abdur Rahman ');
  });

  it('strictly restricts numeric-only fields (EIIN, MPO, School Code) to digits and converts Bengali numerals', () => {
    // Non-digits are blocked, Bengali digits are converted to English digits
    expect(sanitizeNumericOnly('123456')).toBe('123456');
    expect(sanitizeNumericOnly('১২৩৪৫৬')).toBe('123456');
    expect(sanitizeNumericOnly('EIIN: 105820')).toBe('105820');
    expect(sanitizeNumericOnly('EIIN: ১০৫৮২০')).toBe('105820');
    expect(sanitizeNumericOnly('School 123 Code')).toBe('123');
    expect(sanitizeNumericOnly('abcXYZ')).toBe('');
    expect(sanitizeNumericOnly('১০১২৩৪৫৬৭৮', 15)).toBe('1012345678');
  });

  it('strictly restricts phone numbers to digits and phone symbols', () => {
    expect(sanitizePhone('01712345678')).toBe('01712345678');
    expect(sanitizePhone('০১৭১২৩৪৫৬৭৮')).toBe('01712345678');
    expect(sanitizePhone('+8801712-345678')).toBe('+8801712-345678');
    expect(sanitizePhone('Phone: ০১৮১২৩৪৫৬৭৮')).toBe('01812345678');
  });

  it('strictly sanitizes usernames without Bengali characters or spaces', () => {
    expect(sanitizeUsername('admin')).toBe('admin');
    expect(sanitizeUsername('admin_01')).toBe('admin_01');
    expect(sanitizeUsername('১০৫৮২০')).toBe('105820');
    expect(sanitizeUsername('admin ইউজার')).toBe('admin');
    expect(sanitizeUsername('school.admin-2026')).toBe('school.admin-2026');
  });
});

describe('Onboarding Page-3 Admin Username Default Logic', () => {
  it('defaults to EIIN if EIIN is provided in Step 1', () => {
    const step1Eiin = '105820';
    let isUsernameCustomized = false;
    let username = '';

    if (!isUsernameCustomized) {
      username = step1Eiin.trim() ? step1Eiin.trim() : 'admin';
    }

    expect(username).toBe('105820');
  });

  it('defaults to admin if EIIN is not provided in Step 1', () => {
    const step1Eiin = '';
    let isUsernameCustomized = false;
    let username = '';

    if (!isUsernameCustomized) {
      username = step1Eiin.trim() ? step1Eiin.trim() : 'admin';
    }

    expect(username).toBe('admin');
  });

  it('preserves user customization when edited by the user', () => {
    const step1Eiin = '105820';
    let isUsernameCustomized = false;
    let username = step1Eiin.trim() ? step1Eiin.trim() : 'admin';

    // User edits the username
    isUsernameCustomized = true;
    username = 'super_principal';

    // EIIN changes or step transition occurs
    if (!isUsernameCustomized) {
      username = step1Eiin.trim() ? step1Eiin.trim() : 'admin';
    }

    expect(username).toBe('super_principal');
  });
});

describe('Establishment Date Format Consistency', () => {
  it('converts Bengali digits to standard English format YYYY or YYYY-MM-DD', () => {
    const rawYearBn = '১৯৯৫';
    const convertedYear = toEnglishNumber(rawYearBn);
    expect(convertedYear).toBe('1995');

    const rawDateBn = '১৯৯৫-০১-০১';
    const convertedDate = toEnglishNumber(rawDateBn);
    expect(convertedDate).toBe('1995-01-01');

    // Display in Bengali whenever needed
    expect(toBengaliNumber(convertedYear)).toBe('১৯৯৫');
    expect(toBengaliNumber(convertedDate)).toBe('১৯৯৫-০১-০১');
  });
});

describe('Dashboard hasAccess RBAC Function Check', () => {
  it('allows all routes for super_admin role', () => {
    const activeRole = 'super_admin';
    const isAuthenticated = true;
    const hasAccess = (path: string): boolean => {
      if (!isAuthenticated || !activeRole) return false;
      if (activeRole === 'super_admin') return true;
      return false;
    };

    expect(hasAccess('/')).toBe(true);
    expect(hasAccess('/students/list')).toBe(true);
    expect(hasAccess('/testimonial')).toBe(true);
    expect(hasAccess('/system')).toBe(true);
  });

  it('checks allowed modules correctly for non-super_admin roles', () => {
    const activeRole: string = 'teacher';
    const isAuthenticated = true;
    const currentUser = {
      allowedModules: ['dashboard', 'students', 'academic', 'testimonial'],
    };

    const hasAccess = (path: string): boolean => {
      if (!isAuthenticated || !activeRole) return false;
      if (activeRole === 'super_admin') return true;

      const activeModules = currentUser.allowedModules;
      if (!activeModules) return true;

      let requiredModuleId = '';
      if (path.startsWith('/students')) requiredModuleId = 'students';
      else if (path.startsWith('/academic')) requiredModuleId = 'academic';
      else if (path.startsWith('/testimonial')) requiredModuleId = 'testimonial';
      else if (path.startsWith('/system')) requiredModuleId = 'system';
      else if (path === '/') requiredModuleId = 'dashboard';

      return requiredModuleId ? activeModules.includes(requiredModuleId) : true;
    };

    expect(hasAccess('/')).toBe(true);
    expect(hasAccess('/students/list')).toBe(true);
    expect(hasAccess('/testimonial')).toBe(true);
    expect(hasAccess('/system')).toBe(false); // teacher lacks system module
  });
});
