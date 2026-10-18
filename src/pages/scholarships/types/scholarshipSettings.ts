export type ScholarshipLogoType = 
  | 'govt'         // গণপ্রজাতন্ত্রী বাংলাদেশ সরকার (National Crest)
  | 'pm_trust'     // প্রধানমন্ত্রীর শিক্ষা সহায়তা ট্রাস্ট
  | 'dshe'         // মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর (DSHE)
  | 'board'        // মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড
  | 'institution'  // প্রতিষ্ঠানের নিজস্ব লোগো (institution.logoUrl)
  | 'custom'       // ব্যবহারকারীর আপলোডকৃত নিজস্ব ছবি
  | 'none';        // কোনো লোগো প্রদর্শন নয়

export type ScholarshipFontFamily =
  | 'Kalpurush'
  | 'SolaimanLipi'
  | 'Hind Siliguri'
  | 'Noto Sans Bengali'
  | 'Noto Serif Bengali'
  | 'Siyam Rupali';

export type ScholarshipFontSizePreset = 'compact' | 'standard' | 'large';

export type ScholarshipPageLayoutMode = 'single' | 'two_page';

export interface ScholarshipFormSettings {
  pageLayoutMode: ScholarshipPageLayoutMode; // 'single' (১ পাতায়) | 'two_page' (২ পাতায়)
  leftLogoType: ScholarshipLogoType;
  leftCustomLogo?: string;
  rightLogoType: ScholarshipLogoType;
  rightCustomLogo?: string;
  logoHeight: number; // in px, default 44
  showStudentPhoto: boolean;
  headerGovtTitle: string; // default: "গণপ্রজাতন্ত্রী বাংলাদেশ সরকার"
  headerDirectorateTitle: string; // default: "মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর, বাংলাদেশ, ঢাকা"
  headerFormTitle: string; // default: "রাজস্ব খাতভুক্ত বৃত্তিপ্রাপ্ত শিক্ষার্থীদের তথ্য বিবরণী ও যাচাই ফরম"
  showInstitutionInHeader: boolean; // default: true
  showChecklistNotice: boolean; // default: true
  showDeclaration: boolean; // default: true
  // Typography & Row Height Optimization
  fontFamily: ScholarshipFontFamily; // default: 'Kalpurush'
  fontSizePreset: ScholarshipFontSizePreset; // default: 'standard'
  tableFontSize: number; // in px, default: 10.0 (range: 8.5 to 12.0)
  rowPaddingY: number; // in px, default: 3.2 (range: 2.0 to 6.0)
  noticeFontSize: number; // in pt, default: 10.0 (range: 10.0 to 12.0, min 10pt for print clarity)
}

export const DEFAULT_SCHOLARSHIP_SETTINGS: ScholarshipFormSettings = {
  pageLayoutMode: 'two_page',
  leftLogoType: 'govt',
  rightLogoType: 'dshe',
  logoHeight: 46,
  showStudentPhoto: true,
  headerGovtTitle: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার',
  headerDirectorateTitle: 'মাধ্যমিক ও উচ্চশিক্ষা অধিদপ্তর, বাংলাদেশ, ঢাকা',
  headerFormTitle: 'রাজস্ব খাতভুক্ত বৃত্তিপ্রাপ্ত শিক্ষার্থীর তথ্য বিবরণী ও যাচাই ফরম',
  showInstitutionInHeader: true,
  showChecklistNotice: true,
  showDeclaration: true,
  fontFamily: 'Kalpurush',
  fontSizePreset: 'standard',
  tableFontSize: 10.5,
  rowPaddingY: 4.5,
  noticeFontSize: 10.5,
};

const STORAGE_KEY = 'biddalok_scholarship_form_settings';
let memorySettings: ScholarshipFormSettings | null = null;

export function getSavedScholarshipSettings(): ScholarshipFormSettings {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw || raw === 'undefined' || raw === 'null') return memorySettings || DEFAULT_SCHOLARSHIP_SETTINGS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SCHOLARSHIP_SETTINGS, ...parsed };
    } catch (err) {
      console.warn('Failed to parse scholarship settings from localStorage:', err);
      return memorySettings || DEFAULT_SCHOLARSHIP_SETTINGS;
    }
  }
  return memorySettings || DEFAULT_SCHOLARSHIP_SETTINGS;
}

export function saveScholarshipSettings(settings: ScholarshipFormSettings): void {
  memorySettings = settings;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      // Dispatch custom event for immediate synchronization across components
      window.dispatchEvent(new CustomEvent('biddalok-scholarship-settings-updated', { detail: settings }));
    } catch (err) {
      console.error('Failed to save scholarship settings to localStorage:', err);
    }
  }
}

