import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Institution, Language, Student, AcademicClass, AcademicGroup, AcademicSection, TestimonialSettings, IssuedTestimonial, ExamResult, WhiteLabelSettings } from '../types';
import { defaultDivisions, defaultDistricts, defaultUpazilas, defaultUnions, LocationItem } from '../constants/bdLocations';
import { asyncNonBlockingStorage, storageQueueManager, StorageStatus } from './asyncStorage';

export interface AppState {
  language: Language;
  setLanguage: (lang: Language) => void;
  
  institution: Institution;
  updateInstitution: (data: Partial<Institution>) => void;

  learnedLocations: LocationItem[];
  learnLocation: (loc: LocationItem | Omit<LocationItem, 'id'>) => void;

  students: Student[];
  addStudent: (student: Student) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  bulkAddStudents: (newStudents: Student[]) => void;
  bulkUpdateStudents: (updatedStudents: Student[]) => void;

  academicClasses: AcademicClass[];
  addAcademicClass: (cls: AcademicClass) => void;
  updateAcademicClass: (id: string, cls: Partial<AcademicClass>) => void;
  deleteAcademicClass: (id: string) => void;
  setDefaultClass: (id: string) => void;

  academicGroups: AcademicGroup[];
  addAcademicGroup: (grp: AcademicGroup) => void;
  updateAcademicGroup: (id: string, grp: Partial<AcademicGroup>) => void;
  deleteAcademicGroup: (id: string) => void;
  setDefaultGroup: (id: string) => void;

  academicSections: AcademicSection[];
  addAcademicSection: (sec: AcademicSection) => void;
  updateAcademicSection: (id: string, sec: Partial<AcademicSection>) => void;
  deleteAcademicSection: (id: string) => void;
  setDefaultSection: (id: string) => void;

  testimonialSettings: TestimonialSettings;
  updateTestimonialSettings: (settings: Partial<TestimonialSettings>) => void;

  examResults: ExamResult[];
  addExamResult: (result: ExamResult) => void;
  updateExamResult: (id: string, result: Partial<ExamResult>) => void;
  deleteExamResult: (id: string) => void;
  bulkAddExamResults: (results: ExamResult[]) => void;
  bulkUpdateExamResults: (results: ExamResult[]) => void;

  whiteLabel: WhiteLabelSettings;
  updateWhiteLabel: (settings: Partial<WhiteLabelSettings>) => void;

  issuedTestimonials: IssuedTestimonial[];
  addIssuedTestimonial: (test: IssuedTestimonial) => void;

  // Custom dynamically saved dropdown options
  savedProfessions: string[];
  addSavedProfession: (prof: string) => void;
  addProfession?: (prof: string) => void;
  savedInstitutions: string[];
  addSavedInstitution: (inst: string) => void;
  addInstitution?: (inst: string) => void;
  savedBoards: string[];
  addSavedBoard: (board: string) => void;
  addBoardOption?: (board: string) => void;
  savedClasses: string[];
  addSavedClass: (cls: string) => void;
  addClassOption?: (cls: string) => void;
  savedPassingYears: string[];
  addSavedPassingYear: (yr: string) => void;
  addPassingYear?: (yr: string) => void;
  savedGuardianRelations: string[];
  addSavedGuardianRelation: (rel: string) => void;
  addGuardianRelation?: (rel: string) => void;

  // Database Management & Non-Blocking Persistence Queue
  exportBackupJSON: () => string;
  importBackupJSON: (jsonStr: string) => boolean;
  resetToDefaults: () => void;
  flushStorageToDisk: () => Promise<void>;
  getStorageStatus: () => StorageStatus;
}

const defaultInstitution: Institution = {
  name: 'Aziyara High School',
  nameBn: 'আজিয়ারা উচ্চ বিদ্যালয়',
  eiin: '106103',
  mpoCode: '0802131403',
  schoolCode: '8209',
  address: 'Post: Aziyara, Upazila: Nangalkot, District: Cumilla',
  addressBn: 'ডাকঘর: আজিয়ারা, উপজেলা: নাঙ্গলকোট, জেলা: কুমিল্লা',
  established: '০১.০১.১৯৮৪',
  headmasterName: 'Md. Abdur Rahman',
  headmasterNameBn: 'মো: আবদুর রহমান',
  headmasterTitle: 'Headmaster',
  headmasterTitleBn: 'প্রধান শিক্ষক',
  mobile: '01309106103, 01815598926',
  email: 'azhs106103@gmail.com',
  defaultVillage: 'আজিয়ারা',
  defaultPostOffice: 'আজিয়ারা',
  defaultUpazila: 'নাঙ্গলকোট',
  defaultDistrict: 'কুমিল্লা',
};

const defaultClasses: AcademicClass[] = [
  { id: '1', name: 'Class 6', nameBn: '৬ষ্ঠ শ্রেণি', isDefault: false },
  { id: '2', name: 'Class 7', nameBn: '৭ম শ্রেণি', isDefault: false },
  { id: '3', name: 'Class 8', nameBn: '৮ম শ্রেণি', isDefault: false },
  { id: '4', name: 'Class 9', nameBn: '৯ম শ্রেণি', isDefault: true },
  { id: '5', name: 'Class 10', nameBn: '১০ম শ্রেণি', isDefault: false },
];

const defaultGroups: AcademicGroup[] = [
  { id: 'grp_1', name: 'General', nameBn: 'প্রযোজ্য নয় / সাধারণ', isDefault: true },
  { id: 'grp_2', name: 'Science', nameBn: 'বিজ্ঞান', isDefault: false },
  { id: 'grp_3', name: 'Humanities', nameBn: 'মানবিক', isDefault: false },
  { id: 'grp_4', name: 'Business Studies', nameBn: 'ব্যবসায় শিক্ষা', isDefault: false },
];

const defaultSections: AcademicSection[] = [
  { id: 'sec_1', name: 'N/A', nameBn: 'প্রযোজ্য নয়', isDefault: true },
  { id: 'sec_2', name: 'Section A', nameBn: 'ক শাখা', isDefault: false },
  { id: 'sec_3', name: 'Section B', nameBn: 'খ শাখা', isDefault: false },
  { id: 'sec_4', name: 'Section C', nameBn: 'গ শাখা', isDefault: false },
];

export const defaultProfessions = [
  'কৃষক', 'শিক্ষক', 'ব্যবসায়ী', 'চাকুরিজীবী', 'সরকারি চাকরি', 'বেসরকারি চাকরি',
  'দিনমজুর', 'প্রবাসী', 'ডাক্তার', 'প্রকৌশলী', 'আইনজীবী', 'ড্রাইভার', 'গৃহিণী',
  'ক্ষুদ্র ব্যবসায়ী', 'অবসরপ্রাপ্ত', 'অন্যান্য'
];

export const defaultPreviousInstitutions = [
  'আজিয়ারা সরকারি প্রাথমিক বিদ্যালয়', 'আজিয়ারা নুরানি ক্যাডেট মাদ্রাসা',
  'আজিয়ারা ইসলামিয়া দাখিল মাদ্রাসা', 'নাঙ্গলকোট সরকারি প্রাথমিক বিদ্যালয়',
  'হাসান মেমোরিয়াল সরকারি উচ্চ বিদ্যালয়'
];

export const defaultBoards = [
  'কুমিল্লা', 'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'যশোর', 'বরিশাল', 'সিলেট',
  'দিনাজপুর', 'ময়মনসিংহ', 'মাদ্রাসা শিক্ষা বোর্ড', 'কারিগরি শিক্ষা বোর্ড',
  'প্রাথমিক শিক্ষা অধিদপ্তর (DPE)', 'বাংলাদেশ উন্মুক্ত বিশ্ববিদ্যালয় (BOU)',
  'ক্যাডেট কলেজ', 'অন্যান্য'
];

export const defaultPreviousClasses = [
  'শিশু শ্রেণি', '১ম শ্রেণি', '২য় শ্রেণি', '৩য় শ্রেণি', '৪র্থ শ্রেণি',
  '৫ম শ্রেণি', '৬ষ্ঠ শ্রেণি', '৭ম শ্রেণি', '৮ম শ্রেণি', '৯ম শ্রেণি',
  '১০ম শ্রেণি', 'একাদশ শ্রেণি'
];

export const defaultGuardianRelations = [
  'পিতা', 'মাতা', 'বড় ভাই', 'বড় বোন', 'চাচা / কাকা', 'মামা', 'দাদা', 'নানা', 'ফুফা', 'খালু', 'খালা', 'ফুফু', 'অন্যান্য'
];

const defaultTestimonialSettings: TestimonialSettings = {
  format: 'en_portrait',
  studentDataFont: 'Caveat',
  signatoryName: 'Md. Abdur Rahman',
  signatoryTitle: 'Headmaster',
  preparerName: 'Ansar Ahammad',
  preparerTitle: 'Prepared by',
  verifierName: 'Mosammat Kamrun Nahar',
  verifierTitle: 'Verified by',
  customText: '',
  showLogo: true,
  showQrCode: true,
  certificateDesign: 'classic_blue',
  examYear: new Date().getFullYear().toString(),
  instNameFontSize: 30,
  bodyFontSize: 16,
  bodyLineHeight: 1.55,
  titleFontSize: 30,
  pageMargin: 0.4,
  pageMarginTop: 0.4,
  pageMarginBottom: 0.4,
  pageMarginLeft: 0.4,
  pageMarginRight: 0.4,
};

const initialSampleStudents: Student[] = [
  {
    id: '170001',
    studentId: 'STU-20260601',
    name: 'NUSRAT JAHAN',
    nameBn: 'নুসরাত জাহান',
    fatherName: 'MOHAMED SOHEL',
    fatherNameBn: 'মোহাম্মদ সোহেল',
    motherName: 'ASMA KHATUN',
    motherNameBn: 'আসমা খাতুন',
    dateOfBirth: '2012-04-12',
    gender: 'Female',
    village: 'আজিয়ারা',
    postOffice: 'আজিয়ারা',
    upazila: 'নাঙ্গলকোট',
    district: 'কুমিল্লা',
    session: '2026',
    class: 'Class 6',
    section: 'ক',
    roll: '০১',
    passingYear: '2026',
    gpa: '5.00',
    registrationNo: '2311521205',
    board: 'CUMILLA',
    group: 'সাধারণ',
    photo: '',
  },
  {
    id: '170002',
    studentId: 'STU-20260602',
    name: 'MD. RAKIBUL HASAN',
    nameBn: 'মো: রাকিবুল হাসান',
    fatherName: 'ABDUL JALIL',
    fatherNameBn: 'আব্দুল জলিল',
    motherName: 'RAHIMA BEGUM',
    motherNameBn: 'রহিমা বেগম',
    dateOfBirth: '2012-11-05',
    gender: 'Male',
    village: 'মৌকরা',
    postOffice: 'মৌকরা',
    upazila: 'নাঙ্গলকোট',
    district: 'কুমিল্লা',
    session: '2026',
    class: 'Class 6',
    section: 'ক',
    roll: '০২',
    passingYear: '2026',
    gpa: '4.89',
    registrationNo: '2311521206',
    board: 'CUMILLA',
    group: 'সাধারণ',
    photo: '',
  },
  {
    id: '170003',
    studentId: 'STU-20260701',
    name: 'FATEMA AKTER',
    nameBn: 'ফাতেমা আক্তার',
    fatherName: 'DELWAR HOSSAIN',
    fatherNameBn: 'দেলোয়ার হোসেন',
    motherName: 'SHAHIDA BEGUM',
    motherNameBn: 'শাহিদা বেগম',
    dateOfBirth: '2011-03-18',
    gender: 'Female',
    village: 'আজিয়ারা',
    postOffice: 'আজিয়ারা',
    upazila: 'নাঙ্গলকোট',
    district: 'কুমিল্লা',
    session: '2026',
    class: 'Class 7',
    section: 'ক',
    roll: '০১',
    passingYear: '2026',
    gpa: '5.00',
    registrationNo: '2311521207',
    board: 'CUMILLA',
    group: 'সাধারণ',
    photo: '',
  },
  {
    id: '170004',
    studentId: 'STU-20261001',
    name: 'TANVIR AHMED',
    nameBn: 'তানভীর আহমেদ',
    fatherName: 'KABIR HOSSAIN',
    fatherNameBn: 'কবীর হোসেন',
    motherName: 'NASRIN AKTER',
    motherNameBn: 'নাসরিন আক্তার',
    dateOfBirth: '2008-08-20',
    gender: 'Male',
    village: 'গোত্রশাল',
    postOffice: 'আজিয়ারা',
    upazila: 'নাঙ্গলকোট',
    district: 'কুমিল্লা',
    session: '2025-2026',
    class: 'Class 10',
    section: 'পদ্মা',
    roll: '১৭২২৮০',
    passingYear: '2026',
    gpa: '5.00',
    registrationNo: '2311521208',
    board: 'CUMILLA',
    group: 'Science',
    photo: '',
  }
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'bn',
      setLanguage: (lang) => set({ language: lang }),

      institution: defaultInstitution,
      updateInstitution: (data) =>
        set((state) => ({ institution: { ...(state.institution || defaultInstitution), ...data } })),

      learnedLocations: [...defaultDivisions, ...defaultDistricts, ...defaultUpazilas, ...defaultUnions],
      learnLocation: (loc) => set((state) => {
        // Avoid duplicates by name + parent
        const exists = state.learnedLocations?.find(
          l => (l.name.toLowerCase() === loc.name.toLowerCase() || (l.nameBn && l.nameBn === loc.nameBn)) 
          && l.parentId === loc.parentId
        );
        if (exists) return state;
        const newId = 'id' in loc && loc.id ? loc.id : Date.now().toString();
        return {
          learnedLocations: [...(state.learnedLocations || []), { ...loc, id: newId }]
        };
      }),

      students: initialSampleStudents,
      addStudent: (student) =>
        set((state) => ({ students: [student, ...(state.students || [])] })),
      updateStudent: (id, data) =>
        set((state) => ({
          students: (state.students || []).map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),
      deleteStudent: (id) =>
        set((state) => ({
          students: (state.students || []).filter((s) => s.id !== id),
        })),
      bulkAddStudents: (newStudents) =>
        set((state) => ({
          students: [...newStudents, ...(state.students || [])],
        })),
      bulkUpdateStudents: (updatedStudents) =>
        set((state) => {
          const updatedMap = new Map((updatedStudents || []).map(s => [s.id, s]));
          return {
            students: (state.students || []).map(s => {
              const updated = updatedMap.get(s.id);
              return updated ? { ...s, ...updated } : s;
            })
          };
        }),

      academicClasses: defaultClasses,
      addAcademicClass: (cls) => 
        set((state) => ({ academicClasses: [...(state.academicClasses || defaultClasses), cls] })),
      updateAcademicClass: (id, data) => 
        set((state) => ({
          academicClasses: (state.academicClasses || defaultClasses).map((c) => (c.id === id ? { ...c, ...data } : c)),
        })),
      deleteAcademicClass: (id) => 
        set((state) => ({
          academicClasses: (state.academicClasses || defaultClasses).filter((c) => c.id !== id),
        })),
      setDefaultClass: (id) =>
        set((state) => ({
          academicClasses: (state.academicClasses || defaultClasses).map((c) => ({ ...c, isDefault: c.id === id })),
        })),

      academicGroups: defaultGroups,
      addAcademicGroup: (grp) =>
        set((state) => ({ academicGroups: [...(state.academicGroups || defaultGroups), grp] })),
      updateAcademicGroup: (id, data) =>
        set((state) => ({
          academicGroups: (state.academicGroups || defaultGroups).map((g) => (g.id === id ? { ...g, ...data } : g)),
        })),
      deleteAcademicGroup: (id) =>
        set((state) => ({
          academicGroups: (state.academicGroups || defaultGroups).filter((g) => g.id !== id),
        })),
      setDefaultGroup: (id) =>
        set((state) => ({
          academicGroups: (state.academicGroups || defaultGroups).map((g) => ({ ...g, isDefault: g.id === id })),
        })),

      academicSections: defaultSections,
      addAcademicSection: (sec) =>
        set((state) => ({ academicSections: [...(state.academicSections || defaultSections), sec] })),
      updateAcademicSection: (id, data) =>
        set((state) => ({
          academicSections: (state.academicSections || defaultSections).map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),
      deleteAcademicSection: (id) =>
        set((state) => ({
          academicSections: (state.academicSections || defaultSections).filter((s) => s.id !== id),
        })),
      setDefaultSection: (id) =>
        set((state) => ({
          academicSections: (state.academicSections || defaultSections).map((s) => ({ ...s, isDefault: s.id === id })),
        })),

      testimonialSettings: defaultTestimonialSettings,
      
      examResults: [],
      addExamResult: (result) => set((state) => ({ examResults: [result, ...(state.examResults || [])] })),
      updateExamResult: (id, data) => set((state) => ({
        examResults: (state.examResults || []).map((r) => (r.id === id ? { ...r, ...data } : r)),
      })),
      deleteExamResult: (id) => set((state) => ({
        examResults: (state.examResults || []).filter((r) => r.id !== id),
      })),
      bulkAddExamResults: (results) => set((state) => ({
        examResults: [...results, ...(state.examResults || [])],
      })),
      bulkUpdateExamResults: (results) => set((state) => {
        const updatedMap = new Map((results || []).map(r => [r.id, r]));
        return {
          examResults: (state.examResults || []).map(r => {
            const updated = updatedMap.get(r.id);
            return updated ? { ...r, ...updated } : r;
          })
        };
      }),

      whiteLabel: { appName: '', appIcon: '', enabled: false },
      updateWhiteLabel: (data) => set((state) => ({ whiteLabel: { ...(state.whiteLabel || { appName: '', appIcon: '', enabled: false }), ...data } })),

      updateTestimonialSettings: (data) =>
        set((state) => ({ testimonialSettings: { ...(state.testimonialSettings || defaultTestimonialSettings), ...data } })),

      issuedTestimonials: [],
      addIssuedTestimonial: (test) =>
        set((state) => ({ issuedTestimonials: [test, ...(state.issuedTestimonials || [])] })),

      savedProfessions: defaultProfessions,
      addSavedProfession: (prof) => set((state) => {
        const trimmed = prof.trim();
        if (!trimmed || (state.savedProfessions || defaultProfessions).includes(trimmed)) return state;
        return { savedProfessions: [...(state.savedProfessions || defaultProfessions), trimmed] };
      }),
      addProfession: (prof) => set((state) => {
        const trimmed = prof.trim();
        if (!trimmed || (state.savedProfessions || defaultProfessions).includes(trimmed)) return state;
        return { savedProfessions: [...(state.savedProfessions || defaultProfessions), trimmed] };
      }),

      savedInstitutions: defaultPreviousInstitutions,
      addSavedInstitution: (inst) => set((state) => {
        const trimmed = inst.trim();
        if (!trimmed || (state.savedInstitutions || defaultPreviousInstitutions).includes(trimmed)) return state;
        return { savedInstitutions: [...(state.savedInstitutions || defaultPreviousInstitutions), trimmed] };
      }),
      addInstitution: (inst) => set((state) => {
        const trimmed = inst.trim();
        if (!trimmed || (state.savedInstitutions || defaultPreviousInstitutions).includes(trimmed)) return state;
        return { savedInstitutions: [...(state.savedInstitutions || defaultPreviousInstitutions), trimmed] };
      }),

      savedBoards: defaultBoards,
      addSavedBoard: (board) => set((state) => {
        const trimmed = board.trim();
        if (!trimmed || (state.savedBoards || defaultBoards).includes(trimmed)) return state;
        return { savedBoards: [...(state.savedBoards || defaultBoards), trimmed] };
      }),
      addBoardOption: (board) => set((state) => {
        const trimmed = board.trim();
        if (!trimmed || (state.savedBoards || defaultBoards).includes(trimmed)) return state;
        return { savedBoards: [...(state.savedBoards || defaultBoards), trimmed] };
      }),

      savedClasses: defaultPreviousClasses,
      addSavedClass: (cls) => set((state) => {
        const trimmed = cls.trim();
        if (!trimmed || (state.savedClasses || defaultPreviousClasses).includes(trimmed)) return state;
        return { savedClasses: [...(state.savedClasses || defaultPreviousClasses), trimmed] };
      }),
      addClassOption: (cls) => set((state) => {
        const trimmed = cls.trim();
        if (!trimmed || (state.savedClasses || defaultPreviousClasses).includes(trimmed)) return state;
        return { savedClasses: [...(state.savedClasses || defaultPreviousClasses), trimmed] };
      }),

      savedPassingYears: ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'],
      addSavedPassingYear: (yr) => set((state) => {
        const trimmed = yr.trim();
        const years = state.savedPassingYears || ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];
        if (!trimmed || years.includes(trimmed)) return state;
        return { savedPassingYears: [trimmed, ...years] };
      }),
      addPassingYear: (yr) => set((state) => {
        const trimmed = yr.trim();
        const years = state.savedPassingYears || ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018'];
        if (!trimmed || years.includes(trimmed)) return state;
        return { savedPassingYears: [trimmed, ...years] };
      }),

      savedGuardianRelations: defaultGuardianRelations,
      addSavedGuardianRelation: (rel) => set((state) => {
        const trimmed = rel.trim();
        if (!trimmed || (state.savedGuardianRelations || defaultGuardianRelations).includes(trimmed)) return state;
        return { savedGuardianRelations: [...(state.savedGuardianRelations || defaultGuardianRelations), trimmed] };
      }),
      addGuardianRelation: (rel) => set((state) => {
        const trimmed = rel.trim();
        if (!trimmed || (state.savedGuardianRelations || defaultGuardianRelations).includes(trimmed)) return state;
        return { savedGuardianRelations: [...(state.savedGuardianRelations || defaultGuardianRelations), trimmed] };
      }),

      exportBackupJSON: () => {
        const state = get();
        const exportData = {
          version: '1.0.5',
          appName: 'Biddalok ERP',
          exportDate: new Date().toISOString(),
          institution: state.institution || defaultInstitution,
          students: state.students || [],
          academicClasses: state.academicClasses || defaultClasses,
          academicGroups: state.academicGroups || defaultGroups,
          academicSections: state.academicSections || defaultSections,
          examResults: state.examResults || [],
          testimonialSettings: state.testimonialSettings || defaultTestimonialSettings,
          issuedTestimonials: state.issuedTestimonials || [],
          learnedLocations: state.learnedLocations || [],
          whiteLabel: state.whiteLabel,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importBackupJSON: (jsonStr: string) => {
        try {
          if (!jsonStr || typeof jsonStr !== 'string') return false;
          const parsed = JSON.parse(jsonStr);
          if (!parsed || typeof parsed !== 'object') return false;

          // Validate that the structure contains legitimate data
          const hasValidPayload = 
            parsed.institution || 
            Array.isArray(parsed.students) || 
            Array.isArray(parsed.academicClasses);

          if (!hasValidPayload) {
            console.error('Backup JSON missing core payload structures.');
            return false;
          }

          // Sanitize students array
          const cleanStudents = Array.isArray(parsed.students) 
            ? parsed.students.filter((s: any) => s && typeof s === 'object' && (s.id || s.name || s.nameBn))
            : [];

          // Sanitize classes
          const cleanClasses = Array.isArray(parsed.academicClasses) && parsed.academicClasses.length > 0
            ? parsed.academicClasses.filter((c: any) => c && typeof c === 'object' && c.name)
            : defaultClasses;

          // Sanitize groups
          const cleanGroups = Array.isArray(parsed.academicGroups) && parsed.academicGroups.length > 0
            ? parsed.academicGroups.filter((g: any) => g && typeof g === 'object' && g.name)
            : defaultGroups;

          // Sanitize sections
          const cleanSections = Array.isArray(parsed.academicSections) && parsed.academicSections.length > 0
            ? parsed.academicSections.filter((s: any) => s && typeof s === 'object' && s.name)
            : defaultSections;

          // Sanitize exam results
          const cleanExamResults = Array.isArray(parsed.examResults)
            ? parsed.examResults.filter((r: any) => r && typeof r === 'object' && r.id)
            : [];

          set({
            institution: parsed.institution && typeof parsed.institution === 'object' 
              ? { ...defaultInstitution, ...parsed.institution } 
              : defaultInstitution,
            students: cleanStudents.length > 0 ? cleanStudents : (get().students || []),
            academicClasses: cleanClasses,
            academicGroups: cleanGroups,
            academicSections: cleanSections,
            examResults: cleanExamResults,
            testimonialSettings: parsed.testimonialSettings && typeof parsed.testimonialSettings === 'object' 
              ? { ...defaultTestimonialSettings, ...parsed.testimonialSettings } 
              : defaultTestimonialSettings,
            issuedTestimonials: Array.isArray(parsed.issuedTestimonials) ? parsed.issuedTestimonials : [],
            learnedLocations: Array.isArray(parsed.learnedLocations) && parsed.learnedLocations.length > 0
              ? parsed.learnedLocations
              : get().learnedLocations,
            whiteLabel: parsed.whiteLabel && typeof parsed.whiteLabel === 'object'
              ? parsed.whiteLabel
              : get().whiteLabel,
          });
          return true;
        } catch (e) {
          console.error('Failed to parse and validate backup JSON:', e);
          return false;
        }
      },

      resetToDefaults: () => {
        set({
          institution: defaultInstitution,
          students: initialSampleStudents,
          academicClasses: defaultClasses,
          academicGroups: defaultGroups,
          academicSections: defaultSections,
          testimonialSettings: defaultTestimonialSettings,
          issuedTestimonials: [],
        });
      },

      flushStorageToDisk: async () => {
        await storageQueueManager.flushPendingWrites('biddalok-database-v1');
      },

      getStorageStatus: () => {
        return storageQueueManager.getStatus();
      }
    }),
    {
      name: 'biddalok-database-v1', // unique storage key
      storage: createJSONStorage(() => asyncNonBlockingStorage),
      partialize: (state) => ({
        language: state.language,
        institution: state.institution,
        students: state.students,
        academicClasses: state.academicClasses,
        academicGroups: state.academicGroups,
        academicSections: state.academicSections,
        testimonialSettings: state.testimonialSettings,
        examResults: state.examResults,
        whiteLabel: state.whiteLabel,
        issuedTestimonials: state.issuedTestimonials,
        learnedLocations: state.learnedLocations,
      }),
    }
  )
);

