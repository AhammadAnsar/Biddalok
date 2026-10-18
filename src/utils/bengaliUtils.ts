/**
 * Utility functions for 100% pure Bengali text and number formatting
 */

const englishToBengaliDigits: { [key: string]: string } = {
  '0': '০',
  '1': '১',
  '2': '২',
  '3': '৩',
  '4': '৪',
  '5': '৫',
  '6': '৬',
  '7': '৭',
  '8': '৮',
  '9': '৯',
};

const bengaliToEnglishDigits: { [key: string]: string } = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

export const toBengaliNumber = (input: string | number | undefined | null): string => {
  if (input === undefined || input === null) return '';
  const str = String(input);
  return str.replace(/[0-9]/g, (match) => englishToBengaliDigits[match] || match);
};

export const toEnglishNumber = (input: string | number | undefined | null): string => {
  if (input === undefined || input === null) return '';
  const str = String(input);
  return str.replace(/[০-৯]/g, (match) => bengaliToEnglishDigits[match] || match);
};

// Group mapping
export const getBengaliGroup = (group?: string): string => {
  if (!group) return 'বিজ্ঞান';
  const g = group.trim().toLowerCase();
  if (g === 'grp_1' || g.includes('gen') || g.includes('general') || g.includes('সাধারণ') || g === 'n/a' || g.includes('নয়') || g.includes('না') || g === 'none' || g === 'all') return 'সাধারণ';
  if (g === 'grp_2' || g.includes('sci') || g.includes('science') || g.includes('বিজ্ঞা')) return 'বিজ্ঞান';
  if (g === 'grp_3' || g.includes('hum') || g.includes('humanities') || g.includes('art') || g.includes('arts') || g.includes('মানবি')) return 'মানবিক';
  if (g === 'grp_4' || g.includes('bus') || g.includes('business') || g.includes('com') || g.includes('commerce') || g.includes('ব্যবসায়') || g.includes('বাণিজ্য')) return 'ব্যবসায় শিক্ষা';
  if (g.includes('voc') || g.includes('vocational') || g.includes('কারিগরি') || g.includes('ভোকে')) return 'ভোকেশনাল';
  if (g.includes('isl') || g.includes('islamic') || g.includes('ইসলামি') || g.includes('মুজাব্বিদ')) return 'ইসলাম শিক্ষা';
  return group;
};

export const getEnglishGroup = (group?: string): string => {
  if (!group) return 'Science';
  const g = group.trim().toLowerCase();
  if (g === 'grp_1' || g.includes('gen') || g.includes('সাধারণ') || g === 'n/a' || g.includes('নয়') || g.includes('none')) return 'General';
  if (g === 'grp_2' || g.includes('বিজ্ঞা') || g.includes('sci')) return 'Science';
  if (g === 'grp_3' || g.includes('মানবি') || g.includes('hum') || g.includes('art')) return 'Humanities';
  if (g === 'grp_4' || g.includes('ব্যবসা') || g.includes('com') || g.includes('bus')) return 'Business Studies';
  if (g.includes('voc') || g.includes('ভোকে')) return 'Vocational';
  if (g.includes('isl') || g.includes('ইসলামি')) return 'Islamic Studies';
  return group;
};

// Board mapping
export const getBengaliBoard = (board?: string): string => {
  if (!board) return 'ঢাকা';
  const b = board.trim().toLowerCase();
  if (b.includes('dha') || b.includes('ঢাকা')) return 'ঢাকা';
  if (b.includes('com') || b.includes('কুমিল্লা')) return 'কুমিল্লা';
  if (b.includes('raj') || b.includes('রাজশাহী')) return 'রাজশাহী';
  if (b.includes('jes') || b.includes('যশোর')) return 'যশোর';
  if (b.includes('chi') || b.includes('চট্টগ্রাম')) return 'চট্টগ্রাম';
  if (b.includes('bar') || b.includes('বরিশাল')) return 'বরিশাল';
  if (b.includes('syl') || b.includes('সিলেট')) return 'সিলেট';
  if (b.includes('din') || b.includes('দিনাজপুর')) return 'দিনাজপুর';
  if (b.includes('mym') || b.includes('ময়মনসিংহ')) return 'ময়মনসিংহ';
  if (b.includes('mad') || b.includes('মাদ্রাসা')) return 'মাদ্রাসা';
  if (b.includes('tec') || b.includes('কারিগরি')) return 'কারিগরি';
  return board;
};

export const getEnglishBoard = (board?: string): string => {
  if (!board) return 'Dhaka';
  const b = board.trim().toLowerCase();
  if (b.includes('ঢাকা') || b.includes('dha')) return 'Dhaka';
  if (b.includes('কুমিল্লা') || b.includes('com')) return 'Cumilla';
  if (b.includes('রাজশাহী') || b.includes('raj')) return 'Rajshahi';
  if (b.includes('যশোর') || b.includes('jes')) return 'Jashore';
  if (b.includes('চট্টগ্রাম') || b.includes('chi')) return 'Chattogram';
  if (b.includes('বরিশাল') || b.includes('bar')) return 'Barishal';
  if (b.includes('সিলেট') || b.includes('syl')) return 'Sylhet';
  if (b.includes('দিনাজপুর') || b.includes('din')) return 'Dinajpur';
  if (b.includes('ময়মনসিংহ') || b.includes('mym')) return 'Mymensingh';
  if (b.includes('মাদ্রাসা') || b.includes('mad')) return 'Madrasah';
  if (b.includes('কারিগরি') || b.includes('tec')) return 'Technical';
  return board;
};

export const getBengaliClassName = (className?: string): string => {
  if (!className || !className.trim()) return '';
  const c = className.trim().toLowerCase();
  if (c.includes('10') || c.includes('১০') || c.includes('ten') || c.includes('দশম')) return 'দশম';
  if (c.includes('9') || c.includes('৯') || c.includes('nine') || c.includes('নবম')) return 'নবম';
  if (c.includes('8') || c.includes('৮') || c.includes('eight') || c.includes('অষ্টম')) return 'অষ্টম';
  if (c.includes('7') || c.includes('৭') || c.includes('seven') || c.includes('সপ্তম')) return 'সপ্তম';
  if (c.includes('6') || c.includes('৬') || c.includes('six') || c.includes('ষষ্ঠ')) return 'ষষ্ঠ';
  if (c.includes('5') || c.includes('৫') || c.includes('five') || c.includes('পঞ্চম')) return 'পঞ্চম';
  if (c.includes('4') || c.includes('৪') || c.includes('four') || c.includes('চতুর্থ')) return 'চতুর্থ';
  if (c.includes('3') || c.includes('৩') || c.includes('three') || c.includes('তৃতীয়') || c.includes('তৃতীয়') || c.includes('৩য়') || c.includes('৩য়')) return 'তৃতীয়';
  if (c.includes('2') || c.includes('২') || c.includes('two') || c.includes('দ্বিতীয়') || c.includes('দ্বিতীয়') || c.includes('২য়') || c.includes('২য়')) return 'দ্বিতীয়';
  if (c.includes('1') || c.includes('১') || c.includes('one') || c.includes('প্রথম') || c.includes('১ম')) return 'প্রথম';
  if (c.includes('play') || c.includes('প্লে')) return 'প্লে';
  if (c.includes('nursery') || c.includes('নার্সারি')) return 'নার্সারি';
  if (c.includes('kg') || c.includes('কেজি')) return 'কেজি';
  if (c.includes('hsc') || c.includes('১১') || c.includes('11') || c.includes('একাদশ')) return 'একাদশ';
  if (c.includes('১২') || c.includes('12') || c.includes('দ্বাদশ')) return 'দ্বাদশ';
  return toBengaliNumber(className);
};

export const getEnglishClassName = (className?: string): string => {
  if (!className || !className.trim()) return '';
  const c = className.trim().toLowerCase();
  if (c.includes('10') || c.includes('১০') || c.includes('ten') || c.includes('দশম')) return 'Class Ten';
  if (c.includes('9') || c.includes('৯') || c.includes('nine') || c.includes('নবম')) return 'Class Nine';
  if (c.includes('8') || c.includes('৮') || c.includes('eight') || c.includes('অষ্টম')) return 'Class Eight';
  if (c.includes('7') || c.includes('৭') || c.includes('seven') || c.includes('সপ্তম')) return 'Class Seven';
  if (c.includes('6') || c.includes('৬') || c.includes('six') || c.includes('ষষ্ঠ')) return 'Class Six';
  if (c.includes('5') || c.includes('৫') || c.includes('five') || c.includes('পঞ্চম')) return 'Class Five';
  if (c.includes('4') || c.includes('৪') || c.includes('four') || c.includes('চতুর্থ')) return 'Class Four';
  if (c.includes('3') || c.includes('৩') || c.includes('three') || c.includes('তৃতীয়') || c.includes('তৃতীয়')) return 'Class Three';
  if (c.includes('2') || c.includes('২') || c.includes('two') || c.includes('দ্বিতীয়') || c.includes('দ্বিতীয়')) return 'Class Two';
  if (c.includes('1') || c.includes('১') || c.includes('one') || c.includes('প্রথম')) return 'Class One';
  if (c.includes('play') || c.includes('প্লে')) return 'Play';
  if (c.includes('nursery') || c.includes('নার্সারি')) return 'Nursery';
  if (c.includes('kg') || c.includes('কেজি')) return 'KG';
  if (c.includes('hsc') || c.includes('১১') || c.includes('11') || c.includes('একাদশ')) return 'Class Eleven';
  if (c.includes('১২') || c.includes('12') || c.includes('দ্বাদশ')) return 'Class Twelve';
  return toEnglishNumber(className);
};

export const getBengaliSectionName = (sec?: string): string => {
  if (!sec || !sec.trim()) return '';
  const s = sec.trim().toLowerCase();
  if (s === 'a' || s === 'sec-a' || s === 'ka' || s === 'ক') return 'ক';
  if (s === 'b' || s === 'sec-b' || s === 'kha' || s === 'খ') return 'খ';
  if (s === 'c' || s === 'sec-c' || s === 'ga' || s === 'গ') return 'গ';
  if (s === 'd' || s === 'sec-d' || s === 'gha' || s === 'ঘ') return 'ঘ';
  if (s === 'morning' || s.includes('প্রভাতী') || s.includes('মর্নিং')) return 'প্রভাতী';
  if (s === 'day' || s.includes('দিবা')) return 'দিবা';
  return toBengaliNumber(sec);
};

export const getEnglishSectionName = (sec?: string): string => {
  if (!sec || !sec.trim()) return '';
  const s = sec.trim().toLowerCase();
  if (s === 'ক' || s === 'ka' || s === 'a') return 'A';
  if (s === 'খ' || s === 'kha' || s === 'b') return 'B';
  if (s === 'গ' || s === 'ga' || s === 'c') return 'C';
  if (s === 'ঘ' || s === 'gha' || s === 'd') return 'D';
  if (s.includes('প্রভাতী') || s.includes('মর্নিং')) return 'Morning';
  if (s.includes('দিবা')) return 'Day';
  return toEnglishNumber(sec);
};

/**
 * Relational mapper for Class using academicClasses list from store
 */
export const getRelationalClassName = (
  className: string | undefined, 
  isBn: boolean, 
  academicClasses?: { name: string; nameBn?: string; id?: string }[]
): string => {
  if (!className) return '';
  if (academicClasses && academicClasses.length > 0) {
    const matched = academicClasses.find(
      (c) => c.name === className || c.id === className || c.nameBn === className
    );
    if (matched) {
      if (isBn) {
        return matched.nameBn || getBengaliClassName(matched.name);
      }
      return matched.name || getEnglishClassName(matched.nameBn);
    }
  }
  return isBn ? getBengaliClassName(className) : getEnglishClassName(className);
};

/**
 * Relational mapper for Section using academicSections list from store
 */
export const getRelationalSectionName = (
  sectionName: string | undefined, 
  isBn: boolean, 
  academicSections?: { name: string; nameBn?: string; id?: string }[]
): string => {
  if (!sectionName) return '';
  if (academicSections && academicSections.length > 0) {
    const matched = academicSections.find(
      (s) => s.name === sectionName || s.id === sectionName || s.nameBn === sectionName
    );
    if (matched) {
      if (isBn) {
        return matched.nameBn || getBengaliSectionName(matched.name);
      }
      return matched.name || getEnglishSectionName(matched.nameBn);
    }
  }
  return isBn ? getBengaliSectionName(sectionName) : getEnglishSectionName(sectionName);
};

/**
 * Relational mapper for Group / Department
 */
export const getRelationalGroupName = (groupName: string | undefined, isBn: boolean): string => {
  return isBn ? getBengaliGroup(groupName) : getEnglishGroup(groupName);
};

export const getBengaliFormattedDate = (dateString?: string): string => {
  if (!dateString) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${toBengaliNumber(day)}/${toBengaliNumber(month)}/${toBengaliNumber(year)} খ্রি:`;
  }
  // Try parsing YYYY-MM-DD or standard date format
  if (dateString.includes('-')) {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD -> DD/MM/YYYY
        return `${toBengaliNumber(parts[2])}/${toBengaliNumber(parts[1])}/${toBengaliNumber(parts[0])} খ্রি:`;
      }
    }
  }
  return toBengaliNumber(dateString);
};

export const getInstitutionInitials = (nameBn?: string): string => {
  if (!nameBn) return 'আউবি';
  const words = nameBn.trim().split(/\s+/);
  if (words.length >= 2) {
    const initials = words.map(w => w[0]).join('');
    return initials.length > 5 ? initials.substring(0, 5) : initials;
  }
  return 'আউবি';
};

const MONTH_NAMES_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_BN = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

/**
 * Standard date formatter: DD-MMM-YYYY (e.g., 01 May 2012 or ০১ মে ২০১২)
 */
export const formatDateStandard = (dateStr?: string | Date | null, isBn: boolean = false): string => {
  if (!dateStr) return '-';
  try {
    let year = 0;
    let monthIdx = -1;
    let day = 0;

    if (typeof dateStr === 'string') {
      const trimmed = dateStr.trim();
      // Check YYYY-MM-DD
      const ymdMatch = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
      if (ymdMatch) {
        year = parseInt(ymdMatch[1], 10);
        monthIdx = parseInt(ymdMatch[2], 10) - 1;
        day = parseInt(ymdMatch[3], 10);
      } else {
        // Check DD-MM-YYYY
        const dmyMatch = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
        if (dmyMatch) {
          day = parseInt(dmyMatch[1], 10);
          monthIdx = parseInt(dmyMatch[2], 10) - 1;
          year = parseInt(dmyMatch[3], 10);
        } else {
          const d = new Date(trimmed);
          if (!isNaN(d.getTime())) {
            year = d.getFullYear();
            monthIdx = d.getMonth();
            day = d.getDate();
          }
        }
      }
    } else if (dateStr instanceof Date && !isNaN(dateStr.getTime())) {
      year = dateStr.getFullYear();
      monthIdx = dateStr.getMonth();
      day = dateStr.getDate();
    }

    if (year > 1900 && monthIdx >= 0 && monthIdx < 12 && day > 0 && day <= 31) {
      const dayStr = String(day).padStart(2, '0');
      if (isBn) {
        return `${toBengaliNumber(dayStr)} ${MONTH_NAMES_BN[monthIdx]} ${toBengaliNumber(year)}`;
      }
      return `${dayStr} ${MONTH_NAMES_EN[monthIdx]} ${year}`;
    }

    return String(dateStr);
  } catch {
    return String(dateStr);
  }
};

/**
 * Capitalizes each word in a string (e.g. 'md. abdul karim' -> 'Md. Abdul Karim')
 */
export const toCapitalEachWord = (str?: string | null): string => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
};

/**
 * Validates whether string contains only Bengali script, spaces, and standard punctuation.
 */
export const isBengaliOnly = (str: string): boolean => {
  if (!str) return true;
  return /^[\u0980-\u09FF\s\-\.,/()]+$/.test(str);
};

/**
 * Validates whether string contains only English (Latin), numbers, spaces, and punctuation.
 */
export const isEnglishOnly = (str: string): boolean => {
  if (!str) return true;
  return /^[a-zA-Z0-9\s\-\.,/()]+$/.test(str);
};

/**
 * Filter string to preserve only Bengali characters, spaces, and punctuation.
 */
export const filterBengaliOnly = (input: string): string => {
  return input.replace(/[^\u0980-\u09FF\s\-\.,/()]/g, '');
};

/**
 * Filter string to preserve only English (Latin) characters, digits, spaces, and punctuation.
 */
export const filterEnglishOnly = (input: string): string => {
  return input.replace(/[^a-zA-Z0-9\s\-\.,/()]/g, '');
};

/**
 * Extracts Bengali institution acronym by taking the first grapheme of each word,
 * preserving any attached vowel signs (কার চিহ্ন), e.g.:
 * "আজিয়ারা উচ্চ বিদ্যালয়" -> "আউবি"
 * "মডেল হাই স্কুল" -> "মহাস"
 */
export const getBengaliInstitutionAcronym = (name?: string | null): string => {
  if (!name || !name.trim()) return 'প্র';
  const words = name.trim().split(/\s+/);
  const vowelKarRegex = /[\u09BE-\u09CC\u09D7]/; // া, ি, ী, ু, ূ, ৃ, ৄ, ে, ৈ, ো, ৌ, ৗ
  
  const acronymParts = words.map(word => {
    if (!word) return '';
    const chars = Array.from(word);
    if (chars.length === 0) return '';
    let firstPart = chars[0];
    if (chars[1] && vowelKarRegex.test(chars[1])) {
      firstPart += chars[1];
    }
    return firstPart;
  });

  const result = acronymParts.join('');
  return result || 'বিউবি';
};

