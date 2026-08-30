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
  if (!className) return '৬ষ্ঠ';
  const c = className.trim();
  if (c.includes('10') || c.includes('১০') || c.toLowerCase().includes('ten')) return '১০ম';
  if (c.includes('9') || c.includes('৯') || c.toLowerCase().includes('nine')) return '৯ম';
  if (c.includes('8') || c.includes('৮') || c.toLowerCase().includes('eight')) return '৮ম';
  if (c.includes('7') || c.includes('৭') || c.toLowerCase().includes('seven')) return '৭ম';
  if (c.includes('6') || c.includes('৬') || c.toLowerCase().includes('six')) return '৬ষ্ঠ';
  if (c.includes('5') || c.includes('৫') || c.toLowerCase().includes('five')) return '৫ম';
  if (c.includes('4') || c.includes('৪') || c.toLowerCase().includes('four')) return '৪র্থ';
  if (c.includes('3') || c.includes('৩') || c.toLowerCase().includes('three')) return '৩য়';
  if (c.includes('2') || c.includes('২') || c.toLowerCase().includes('two')) return '২য়';
  if (c.includes('1') || c.includes('১') || c.toLowerCase().includes('one')) return '১ম';
  if (c.toLowerCase().includes('play') || c.includes('প্লে')) return 'প্লে';
  if (c.toLowerCase().includes('nursery') || c.includes('নার্সারি')) return 'নার্সারি';
  if (c.toLowerCase().includes('kg') || c.includes('কেজি')) return 'কেজি';
  if (c.toLowerCase().includes('hsc') || c.includes('১১') || c.includes('11')) return 'একাদশ';
  if (c.includes('১২') || c.includes('12')) return 'দ্বাদশ';
  return toBengaliNumber(c);
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

