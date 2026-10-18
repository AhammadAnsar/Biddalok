import { useMemo, useCallback } from 'react';
import { useAppStore, MasterLookupCategory } from '../store/useAppStore';
import { MasterLookupItem } from '../types';
import {
 defaultMasterGenders,
 defaultMasterReligions,
 defaultMasterBloodGroups,
 defaultMasterNationalities,
 defaultMasterMaritalStatuses,
 defaultMasterDisabilities,
 defaultMasterProfessions,
 defaultMasterRelations,
 defaultMasterBoards,
 defaultMasterFacilities,
 defaultMasterInstitutions,
 defaultMasterPublicExams,
 defaultMasterCommitteeTypes,
 defaultMasterBankPayments
} from '../constants/masterLookups';
import { 
 Heart, 
 Sparkles, 
 Globe, 
 Users, 
 UserCheck, 
 ShieldAlert, 
 Briefcase, 
 HeartHandshake, 
 GraduationCap, 
 Award,
 School,
 Layers,
 Landmark
} from 'lucide-react';

export interface MasterCategoryMeta {
 key: MasterLookupCategory;
 nameEn: string;
 nameBn: string;
 prefix: string;
 icon: any;
 color: string;
 badgeBg: string;
 badgeText: string;
 descriptionEn: string;
 descriptionBn: string;
 defaultItems: MasterLookupItem[];
}

export const MASTER_CATEGORIES: MasterCategoryMeta[] = [
 {
 key: 'religion',
 nameEn: 'Religion',
 nameBn: 'ধর্ম',
 prefix: 'rel_',
 icon: Sparkles,
 color: 'from-amber-500 to-orange-600',
 badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
 badgeText: 'text-amber-700',
 descriptionEn: 'Manage recognized religions and beliefs across student & staff profiles.',
 descriptionBn: 'শিক্ষার্থী ও শিক্ষক-কর্মচারীদের জন্য অনুমোদিত ধর্মের তালিকা পরিচালনা করুন।',
 defaultItems: defaultMasterReligions
 },
 {
 key: 'bloodGroup',
 nameEn: 'Blood Group',
 nameBn: 'রক্তের গ্রুপ',
 prefix: 'bg_',
 icon: Heart,
 color: 'from-rose-500 to-red-600',
 badgeBg: 'bg-rose-50 border-rose-200 text-rose-800',
 badgeText: 'text-rose-700',
 descriptionEn: 'Standard blood group designations for emergency and medical records.',
 descriptionBn: 'জরুরি চিকিৎসা ও নথিপত্রের জন্য প্রমিত রক্তের গ্রুপের তালিকা।',
 defaultItems: defaultMasterBloodGroups
 },
 {
 key: 'nationality',
 nameEn: 'Nationality',
 nameBn: 'জাতীয়তা',
 prefix: 'nat_',
 icon: Globe,
 color: 'from-emerald-500 to-teal-600',
 badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
 badgeText: 'text-emerald-700',
 descriptionEn: 'Countries & nationalities for identification and statistical reports.',
 descriptionBn: 'সনাক্তকরণ ও প্রাতিষ্ঠানিক রিপোর্টের জন্য জাতীয়তাসমূহ।',
 defaultItems: defaultMasterNationalities
 },
 {
 key: 'gender',
 nameEn: 'Gender',
 nameBn: 'লিঙ্গ',
 prefix: 'gen_',
 icon: Users,
 color: 'from-blue-500 to-indigo-600',
 badgeBg: 'bg-blue-50 border-blue-200 text-blue-800',
 badgeText: 'text-blue-700',
 descriptionEn: 'Gender options utilized across all registration and admissions forms.',
 descriptionBn: 'ভর্তি ফরম ও রেজিস্ট্রেশনে ব্যবহৃত লিঙ্গের তালিকা।',
 defaultItems: defaultMasterGenders
 },
 {
 key: 'maritalStatus',
 nameEn: 'Marital Status',
 nameBn: 'বৈবাহিক অবস্থা',
 prefix: 'ms_',
 icon: UserCheck,
 color: 'from-purple-500 to-indigo-600',
 badgeBg: 'bg-purple-50 border-purple-200 text-purple-800',
 badgeText: 'text-purple-700',
 descriptionEn: 'Marital status definitions for students, staff, and guardians.',
 descriptionBn: 'শিক্ষার্থী, অভিভাবক ও স্টাফদের বৈবাহিক অবস্থার তালিকা।',
 defaultItems: defaultMasterMaritalStatuses
 },
 {
 key: 'disability',
 nameEn: 'Disability & Special Needs',
 nameBn: 'প্রতিবন্ধিতা ও বিশেষ চাহিদা',
 prefix: 'dis_',
 icon: ShieldAlert,
 color: 'from-teal-500 to-cyan-600',
 badgeBg: 'bg-teal-50 border-teal-200 text-teal-800',
 badgeText: 'text-teal-700',
 descriptionEn: 'Special assistance and inclusive education classifications.',
 descriptionBn: 'বিশেষ সহায়তা ও অন্তর্ভুক্তিমূলক শিক্ষার ক্যাটাগরিসমূহ।',
 defaultItems: defaultMasterDisabilities
 },
 {
 key: 'profession',
 nameEn: 'Profession / Occupation',
 nameBn: 'পেশা ও জীবিকা',
 prefix: 'prof_',
 icon: Briefcase,
 color: 'from-sky-500 to-blue-600',
 badgeBg: 'bg-sky-50 border-sky-200 text-sky-800',
 badgeText: 'text-sky-700',
 descriptionEn: 'Professions for parents, guardians, and alumni records.',
 descriptionBn: 'পিতা-মাতা, অভিভাবক ও অ্যালামনাইদের পেশার তালিকা।',
 defaultItems: defaultMasterProfessions
 },
 {
 key: 'relation',
 nameEn: 'Guardian Relationship',
 nameBn: 'অভিভাবকের সম্পর্ক',
 prefix: 'rel_',
 icon: HeartHandshake,
 color: 'from-pink-500 to-rose-600',
 badgeBg: 'bg-pink-50 border-pink-200 text-pink-800',
 badgeText: 'text-pink-700',
 descriptionEn: 'Relationship types between students and their appointed legal guardians.',
 descriptionBn: 'শিক্ষার্থীর সাথে অভিভাবকের সম্পর্কের ধরণসমূহ।',
 defaultItems: defaultMasterRelations
 },
 {
 key: 'institution',
 nameEn: 'Previous Educational Institution',
 nameBn: 'পূর্ববর্তী শিক্ষা প্রতিষ্ঠান',
 prefix: 'inst_',
 icon: School,
 color: 'from-cyan-500 to-blue-600',
 badgeBg: 'bg-cyan-50 border-cyan-200 text-cyan-800',
 badgeText: 'text-cyan-700',
 descriptionEn: 'Previous schools, madrasas, and colleges attended by students.',
 descriptionBn: 'শিক্ষার্থীদের পূর্ববর্তী বিদ্যালয়, মাদ্রাসা ও কলেজের তালিকা।',
 defaultItems: defaultMasterInstitutions
 },
 {
 key: 'board',
 nameEn: 'Education Board',
 nameBn: 'শিক্ষা বোর্ড / মাধ্যম',
 prefix: 'board_',
 icon: GraduationCap,
 color: 'from-violet-500 to-purple-600',
 badgeBg: 'bg-violet-50 border-violet-200 text-violet-800',
 badgeText: 'text-violet-700',
 descriptionEn: 'Recognized education boards and examination authorities in Bangladesh.',
 descriptionBn: 'বাংলাদেশের স্বীকৃত শিক্ষা বোর্ড ও পরীক্ষা কর্তৃপক্ষসমূহ।',
 defaultItems: defaultMasterBoards
 },
 {
 key: 'facility',
 nameEn: 'Special Facility & Quota',
 nameBn: 'কোটা ও বিশেষ সুবিধা',
 prefix: 'fac_',
 icon: Award,
 color: 'from-yellow-500 to-amber-600',
 badgeBg: 'bg-yellow-50 border-yellow-200 text-yellow-800',
 badgeText: 'text-yellow-700',
 descriptionEn: 'Stipends, scholarships, and institutional quota provisions.',
 descriptionBn: 'উপবৃত্তি, শিক্ষাবৃত্তি ও প্রাতিষ্ঠানিক কোটার ধরণসমূহ।',
 defaultItems: defaultMasterFacilities
 },
 {
 key: 'publicExamType',
 nameEn: 'Public Examinations',
 nameBn: 'পাবলিক পরীক্ষার তথ্য',
 prefix: 'pexam_',
 icon: Award,
 color: 'from-rose-500 to-red-600',
 badgeBg: 'bg-rose-50 border-rose-200 text-rose-800',
 badgeText: 'text-rose-700',
 descriptionEn: 'Public examination types like SSC, JSC, Scholarships used for testimonial and certificates.',
 descriptionBn: 'এসএসসি, জেএসসি, বৃত্তি ইত্যাদি পাবলিক পরীক্ষার তথ্য যা প্রশংসাপত্র ও সনদে ব্যবহৃত হয়।',
 defaultItems: defaultMasterPublicExams
 },
 {
 key: 'committeeType',
 nameEn: 'Committee Type',
 nameBn: 'কমিটির ধরণ',
 prefix: 'comm_',
 icon: Award,
 color: 'from-amber-500 to-yellow-600',
 badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
 badgeText: 'text-amber-700',
 descriptionEn: 'Managing committee categories (Ad-hoc, Managing, Governing Body, Special, Interim, etc.).',
 descriptionBn: 'ব্যবস্থাপনা ও গভর্নিং কমিটি ক্যাটাগরি (এডহক, ম্যানেজিং, গভর্নিং বডি, বিশেষ, ইত্যাদি)।',
 defaultItems: defaultMasterCommitteeTypes
 },
  {
    key: 'bankPayment',
    nameEn: 'Bank & Payment',
    nameBn: 'ব্যাংক ও পেমেন্ট',
    prefix: 'bank_',
    icon: Landmark,
    color: 'from-cyan-600 to-blue-700',
    badgeBg: 'bg-cyan-50 border-cyan-200 text-cyan-800',
    badgeText: 'text-cyan-700',
    descriptionEn: 'Recognized banking institutions, payment channels, and mobile financial services for fees and payroll.',
    descriptionBn: 'প্রতিষ্ঠানের হিসাব, ফি আদায়, শিক্ষক-কর্মচারী বেতন ও সরকারি বৃত্তির জন্য অনুমোদিত ব্যাংক ও পেমেন্ট মেথড তালিকা।',
    defaultItems: defaultMasterBankPayments
  }
];

export function useMasterData() {
 const language = useAppStore(s => s.language);
 const isBn = language === 'bn';

 const masterReligions = useAppStore(s => s.masterReligions) || defaultMasterReligions;
 const masterBloodGroups = useAppStore(s => s.masterBloodGroups) || defaultMasterBloodGroups;
 const masterNationalities = useAppStore(s => s.masterNationalities) || defaultMasterNationalities;
 const masterGenders = useAppStore(s => s.masterGenders) || defaultMasterGenders;
 const masterMaritalStatuses = useAppStore(s => s.masterMaritalStatuses) || defaultMasterMaritalStatuses;
 const masterDisabilities = useAppStore(s => s.masterDisabilities) || defaultMasterDisabilities;
 const masterProfessions = useAppStore(s => s.masterProfessions) || defaultMasterProfessions;
 const masterRelations = useAppStore(s => s.masterRelations) || defaultMasterRelations;
 const masterInstitutions = useAppStore(s => s.masterInstitutions) || defaultMasterInstitutions;
 const masterBoards = useAppStore(s => s.masterBoards) || defaultMasterBoards;
 const masterFacilities = useAppStore(s => s.masterFacilities) || defaultMasterFacilities;
 const masterPublicExams = useAppStore(s => s.masterPublicExams) || defaultMasterPublicExams;
 const masterCommitteeTypes = useAppStore(s => s.masterCommitteeTypes) || defaultMasterCommitteeTypes;
 const masterBankPayments = useAppStore(s => s.masterBankPayments) || defaultMasterBankPayments;

 const addMasterLookupItem = useAppStore(s => s.addMasterLookupItem);
 const updateMasterLookupItem = useAppStore(s => s.updateMasterLookupItem);
 const deleteMasterLookupItem = useAppStore(s => s.deleteMasterLookupItem);
 const bulkAddMasterLookupItems = useAppStore(s => s.bulkAddMasterLookupItems);
 const resetMasterLookupCategory = useAppStore(s => s.resetMasterLookupCategory);

 // Map category to array
 const categoryMap = useMemo(() => {
 return {
 religion: masterReligions,
 bloodGroup: masterBloodGroups,
 nationality: masterNationalities,
 gender: masterGenders,
 maritalStatus: masterMaritalStatuses,
 disability: masterDisabilities,
 profession: masterProfessions,
 relation: masterRelations,
 institution: masterInstitutions,
 board: masterBoards,
 facility: masterFacilities,
 publicExamType: masterPublicExams,
 committeeType: masterCommitteeTypes,
 bankPayment: masterBankPayments,
 } as Record<MasterLookupCategory, MasterLookupItem[]>;
 }, [
 masterReligions,
 masterBloodGroups,
 masterNationalities,
 masterGenders,
 masterMaritalStatuses,
 masterDisabilities,
 masterProfessions,
 masterRelations,
 masterInstitutions,
 masterBoards,
 masterFacilities,
 masterPublicExams,
 masterCommitteeTypes,
 masterBankPayments
 ]);

 // Lookup Maps by ID and Name for lightning fast resolution
 const lookupMaps = useMemo(() => {
 const byId = new Map<string, MasterLookupItem>();
 const byName = new Map<string, MasterLookupItem>();

 (Object.values(categoryMap) as MasterLookupItem[][]).forEach(list => {
 list.forEach(item => {
 if (item.id) byId.set(item.id, item);
 if (item.name) byName.set(item.name.toLowerCase().trim(), item);
 if (item.nameBn) byName.set(item.nameBn.trim(), item);
 });
 });

 return { byId, byName };
 }, [categoryMap]);

 // Get items for a category
 const getItems = useCallback((category: MasterLookupCategory): MasterLookupItem[] => {
 return categoryMap[category] || [];
 }, [categoryMap]);

 // Get formatted options for selects/dropdowns (Pure language display, never raw IDs or bracket pollution)
 const getOptions = useCallback((
 category: MasterLookupCategory,
 overrideLang?: 'bn' | 'en'
 ): Array<{ id: string; name: string; nameBn: string; label: string; code?: string }> => {
 const list = categoryMap[category] || [];
 const activeIsBn = overrideLang ? overrideLang === 'bn' : isBn;

 return list.map(item => ({
 id: item.id,
 name: item.name,
 nameBn: item.nameBn || item.name,
 label: activeIsBn 
 ? (item.nameBn || item.name)
 : (item.name || item.nameBn),
 code: item.code,
 }));
 }, [categoryMap, isBn]);

 // Get item by ID
 const getItemById = useCallback((category: MasterLookupCategory, id: string): MasterLookupItem | undefined => {
 const list = categoryMap[category] || [];
 return list.find(item => item.id === id) || lookupMaps.byId.get(id);
 }, [categoryMap, lookupMaps]);

 // Get item by name (either English or Bengali)
 const getItemByName = useCallback((category: MasterLookupCategory, name: string): MasterLookupItem | undefined => {
 if (!name) return undefined;
 const list = categoryMap[category] || [];
 const clean = name.toLowerCase().trim();
 return list.find(item => 
 item.id === name ||
 item.name.toLowerCase() === clean || 
 (item.nameBn && item.nameBn.trim() === name.trim()) ||
 (item.code && item.code.toLowerCase() === clean)
 ) || lookupMaps.byName.get(clean);
 }, [categoryMap, lookupMaps]);

 // Resolve display name safely
 const getName = useCallback((
 category: MasterLookupCategory,
 idOrName: string | undefined,
 overrideLang?: 'bn' | 'en'
 ): string => {
 if (!idOrName) return '';
 const activeIsBn = overrideLang ? overrideLang === 'bn' : isBn;
 const item = getItemByName(category, idOrName) || getItemById(category, idOrName);
 
 if (item) {
 return activeIsBn ? (item.nameBn || item.name) : item.name;
 }
 return idOrName;
 }, [getItemByName, getItemById, isBn]);

 // Resolve ID safely from a name or existing ID
 const getId = useCallback((category: MasterLookupCategory, idOrName: string | undefined): string => {
 if (!idOrName) return '';
 const item = getItemById(category, idOrName) || getItemByName(category, idOrName);
 return item ? item.id : idOrName;
 }, [getItemById, getItemByName]);

 // Mutators
 const addItem = useCallback((
 category: MasterLookupCategory,
 item: { id?: string; name: string; nameBn?: string; code?: string; description?: string }
 ) => {
 return addMasterLookupItem(category, item);
 }, [addMasterLookupItem]);

 const updateItem = useCallback((
 category: MasterLookupCategory,
 id: string,
 data: Partial<MasterLookupItem>
 ) => {
 updateMasterLookupItem(category, id, data);
 }, [updateMasterLookupItem]);

 const deleteItem = useCallback((
 category: MasterLookupCategory,
 id: string
 ) => {
 deleteMasterLookupItem(category, id);
 }, [deleteMasterLookupItem]);

 const bulkImport = useCallback((
 category: MasterLookupCategory,
 items: MasterLookupItem[]
 ) => {
 bulkAddMasterLookupItems(category, items);
 }, [bulkAddMasterLookupItems]);

 const resetCategory = useCallback((
 category: MasterLookupCategory
 ) => {
 resetMasterLookupCategory(category);
 }, [resetMasterLookupCategory]);

 return {
 language,
 isBn,
 categories: MASTER_CATEGORIES,
 
 // Arrays
 religions: masterReligions,
 bloodGroups: masterBloodGroups,
 nationalities: masterNationalities,
 genders: masterGenders,
 maritalStatuses: masterMaritalStatuses,
 disabilities: masterDisabilities,
 professions: masterProfessions,
 relations: masterRelations,
 institutions: masterInstitutions,
 boards: masterBoards,
 facilities: masterFacilities,
 publicExams: masterPublicExams,
 masterPublicExams,
 committeeTypes: masterCommitteeTypes,
 bankPayments: masterBankPayments,
 categoryMap,

 // Helpers
 getItems,
 getOptions,
 getItemById,
 getItemByName,
 getName,
 getId,

 // Operations
 addItem,
 updateItem,
 deleteItem,
 bulkImport,
 resetCategory,
 };
}
