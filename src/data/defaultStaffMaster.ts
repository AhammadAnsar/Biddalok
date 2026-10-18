import { StaffDesignationItem, StaffSubjectItem, ManagingCommitteeInfo } from '../types';

export const defaultStaffDesignations: StaffDesignationItem[] = [
 {
 id: 'des_head_teacher',
 name: 'Head Teacher / Principal',
 nameBn: 'প্রধান শিক্ষক / অধ্যক্ষ',
 category: 'administrative',
 sanctionedPosts: 1,
 staffType: 'teaching',
 payGrade: 'Grade 6',
 description: 'প্রাতিষ্ঠানিক ও প্রশাসনিক প্রধান'
 },
 {
 id: 'des_asst_head_teacher',
 name: 'Assistant Head Teacher',
 nameBn: 'সহকারী প্রধান শিক্ষক / উপাধ্যক্ষ',
 category: 'administrative',
 sanctionedPosts: 1,
 staffType: 'teaching',
 payGrade: 'Grade 7',
 description: 'সহকারী প্রাতিষ্ঠানিক ও একাডেমিক প্রধান'
 },
 {
 id: 'des_asst_teacher',
 name: 'Assistant Teacher',
 nameBn: 'সহকারী শিক্ষক',
 category: 'subject_based',
 sanctionedPosts: 12,
 staffType: 'teaching',
 payGrade: 'Grade 10',
 description: 'বিষয়ভিত্তিক শ্রেণি পাঠদান শিক্ষক'
 },
 {
 id: 'des_trade_instructor',
 name: 'Trade Instructor',
 nameBn: 'ট্রেড ইনস্ট্রাক্টর',
 category: 'vocational_trade',
 sanctionedPosts: 4,
 staffType: 'teaching',
 payGrade: 'Grade 10',
 description: 'কারিগরি ও ভোকেশনাল ট্রেড শিক্ষক'
 },
 {
 id: 'des_computer_lab_operator',
 name: 'Computer Lab Operator',
 nameBn: 'কম্পিউটার ল্যাব অপারেটর',
 category: 'science_computer',
 sanctionedPosts: 1,
 staffType: 'non_teaching',
 payGrade: 'Grade 16',
 description: 'কম্পিউটার ল্যাব ব্যবস্থাপনা ও কারিগরি সহায়তা'
 },
 {
 id: 'des_trade_assistant',
 name: 'Trade Assistant',
 nameBn: 'ট্রেড অ্যাসিস্ট্যান্ট',
 category: 'vocational_trade',
 sanctionedPosts: 2,
 staffType: 'non_teaching',
 payGrade: 'Grade 18',
 description: 'ভোকেশনাল ট্রেড ল্যাব সহকারী'
 },
 {
 id: 'des_office_assistant_computer',
 name: 'Office Assistant cum Computer Operator',
 nameBn: 'অফিস সহকারী কাম কম্পিউটার অপারেটর',
 category: 'administrative',
 sanctionedPosts: 2,
 staffType: 'non_teaching',
 payGrade: 'Grade 16',
 description: 'দাপ্তরিক কাজ ও কম্পিউটার ডেটা এন্ট্রি'
 },
 {
 id: 'des_security_guard',
 name: 'Security Guard',
 nameBn: 'নিরাপত্তা কর্মী',
 category: 'support_staff',
 sanctionedPosts: 2,
 staffType: 'non_teaching',
 payGrade: 'Grade 20',
 description: 'ক্যাম্পাস ও শিক্ষার্থীদের নিরাপত্তা রক্ষণাবেক্ষণ'
 },
 {
 id: 'des_cleaner',
 name: 'Cleaner',
 nameBn: 'পরিচ্ছন্নতা কর্মী',
 category: 'support_staff',
 sanctionedPosts: 2,
 staffType: 'non_teaching',
 payGrade: 'Grade 20',
 description: 'প্রতিষ্ঠান ও শ্রেণিকক্ষের পরিচ্ছন্নতা'
 },
 {
 id: 'des_night_guard',
 name: 'Night Guard',
 nameBn: 'নৈশ প্রহরী',
 category: 'support_staff',
 sanctionedPosts: 1,
 staffType: 'non_teaching',
 payGrade: 'Grade 20',
 description: 'রাত্রিকালীন সার্বিক নিরাপত্তা'
 },
 {
 id: 'des_ayah',
 name: 'Ayah',
 nameBn: 'আয়া',
 category: 'support_staff',
 sanctionedPosts: 2,
 staffType: 'non_teaching',
 payGrade: 'Grade 20',
 description: 'সহায়ক সেবা ও শিক্ষার্থীদের যত্ন'
 },
 {
 id: 'des_office_support',
 name: 'Office Assistant / MLSS',
 nameBn: 'অফিস সহায়ক',
 category: 'support_staff',
 sanctionedPosts: 2,
 staffType: 'non_teaching',
 payGrade: 'Grade 20',
 description: 'দাপ্তরিক ও ফাইল আদান-প্রদান সহায়ক'
 }
];

export const defaultStaffSubjects: StaffSubjectItem[] = [
 // General Subjects (১৫টি সাধারণ বিষয়)
 { id: 'sub_bangla', name: 'Bangla', nameBn: 'বাংলা', code: '101', type: 'general' },
 { id: 'sub_english', name: 'English', nameBn: 'ইংরেজি', code: '107', type: 'general' },
 { id: 'sub_social_science', name: 'Social Science', nameBn: 'সামাজিক বিজ্ঞান', code: '150', type: 'general' },
 { id: 'sub_business_studies', name: 'Business Studies', nameBn: 'ব্যবসায় শিক্ষা', code: '146', type: 'general' },
 { id: 'sub_ict', name: 'Information & Communication Technology', nameBn: 'তথ্য ও যোগাযোগ প্রযুক্তি', code: '154', type: 'general' },
 { id: 'sub_mathematics', name: 'Mathematics', nameBn: 'গণিত', code: '109', type: 'general' },
 { id: 'sub_physics', name: 'Physics', nameBn: 'পদার্থবিজ্ঞান', code: '136', type: 'general' },
 { id: 'sub_chemistry', name: 'Chemistry', nameBn: 'রসায়ন', code: '137', type: 'general' },
 { id: 'sub_religion', name: 'Religious & Moral Education', nameBn: 'ধর্ম ও নৈতিক শিক্ষা', code: '111', type: 'general' },
 { id: 'sub_physical_education', name: 'Physical Education', nameBn: 'শারীরিক শিক্ষা', code: '147', type: 'general' },
 { id: 'sub_agriculture', name: 'Agriculture Studies', nameBn: 'কৃষি শিক্ষা', code: '134', type: 'general' },
 { id: 'sub_home_science', name: 'Home Science', nameBn: 'গার্হস্থ্য বিজ্ঞান', code: '151', type: 'general' },
 { id: 'sub_arts_crafts', name: 'Arts & Crafts', nameBn: 'চারু ও কারুকলা', code: '148', type: 'general' },
 { id: 'sub_biology', name: 'Biology', nameBn: 'জীববিজ্ঞান', code: '138', type: 'general' },
 { id: 'sub_library_science', name: 'Library & Information Science', nameBn: 'গ্রন্থাগার ও তথ্য বিজ্ঞান', code: '155', type: 'general' },

 // Vocational Trade Subjects (১২টি ভোকেশনাল ট্রেড বিষয়)
 { id: 'sub_trade_food_processing', name: 'Food Processing', nameBn: 'ফুড প্রসেসিং', code: 'VOC-61', type: 'vocational' },
 { id: 'sub_trade_civil_construction', name: 'Civil Construction', nameBn: 'সিভিল কনস্ট্রাকশন', code: 'VOC-62', type: 'vocational' },
 { id: 'sub_trade_general_electrical', name: 'General Electrical Works', nameBn: 'জেনারেল ইলেক্ট্রিক্যাল ওয়ার্কস', code: 'VOC-63', type: 'vocational' },
 { id: 'sub_trade_general_electronics', name: 'General Electronics Works', nameBn: 'জেনারেল ইলেক্ট্রনিক্স ওয়ার্কস', code: 'VOC-64', type: 'vocational' },
 { id: 'sub_trade_dress_making', name: 'Dress Making', nameBn: 'ড্রেস মেকিং', code: 'VOC-65', type: 'vocational' },
 { id: 'sub_trade_ict', name: 'Information & Communication Technology', nameBn: 'ইনফরমেশন অ্যান্ড কমিউনিকেশন টেকনোলজি', code: 'VOC-66', type: 'vocational' },
 { id: 'sub_trade_general_mechanics', name: 'General Mechanics', nameBn: 'জেনারেল মেকানিক্স', code: 'VOC-67', type: 'vocational' },
 { id: 'sub_trade_refrigeration_ac', name: 'Refrigeration & Air Conditioning', nameBn: 'রেফ্রিজারেশন অ্যান্ড এয়ার কন্ডিশনিং', code: 'VOC-68', type: 'vocational' },
 { id: 'sub_trade_plumbing', name: 'Plumbing & Pipe Fitting', nameBn: 'প্লাম্বিং অ্যান্ড পাইপ ফিটিং', code: 'VOC-69', type: 'vocational' },
 { id: 'sub_trade_welding', name: 'Welding & Fabrication', nameBn: 'ওয়েল্ডিং অ্যান্ড ফ্যাব্রিকেশন', code: 'VOC-70', type: 'vocational' },
 { id: 'sub_trade_tourism', name: 'Tourism & Hospitality', nameBn: 'ট্যুরিজম অ্যান্ড হসপিটালিটি', code: 'VOC-71', type: 'vocational' },
 { id: 'sub_trade_beautification', name: 'Beautification', nameBn: 'বিউটিফিকেশন', code: 'VOC-72', type: 'vocational' },
];

export const defaultManagingCommittee: ManagingCommitteeInfo = {
 id: '',
 title: '',
 titleBn: '',
 hasCommittee: false,
 year: '',
 committeeType: '',
 committeeTypeId: '',
 approvalResolutionNo: '',
 resolutionNo: '',
 approvalDate: '',
 firstMeetingDate: '',
 startDate: '',
 endDate: '',
 electionDate: '',
 attachmentName: '',
 attachmentSizeKb: 0,
 remarks: '',
 status: 'none',
 members: [],
 meetings: []
};

export const defaultPastCommitteesList: ManagingCommitteeInfo[] = [];

export const STAFF_CATEGORY_LABELS: Record<string, { en: string; bn: string; badgeColor: string }> = {
 administrative: {
 en: 'Administrative',
 bn: 'প্রশাসনিক',
 badgeColor: 'bg-sky-50 text-sky-700 border-sky-200'
 },
 subject_based: {
 en: 'Subject-Based',
 bn: 'বিষয়ভিত্তিক',
 badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
 },
 vocational_trade: {
 en: 'Vocational Trade',
 bn: 'ভোকেশনাল ট্রেড ভিত্তিক',
 badgeColor: 'bg-amber-50 text-amber-800 border-amber-200'
 },
 science_computer: {
 en: 'Science & Computer',
 bn: 'বিজ্ঞান ও কম্পিউটার',
 badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
 },
 support_staff: {
 en: 'Support Staff',
 bn: 'সহায়ক স্টাফ',
 badgeColor: 'bg-slate-100 text-slate-700 border-slate-200'
 }
};
