export interface MasterLookupItem {
 id: string;
 name: string; // English display
 nameBn: string; // Bengali display
 code?: string;
 isSystem?: boolean; // Default built-in items
 description?: string;
}

// 1. Gender / লিঙ্গ
export const defaultMasterGenders: MasterLookupItem[] = [
 { id: 'gen_male', name: 'Male', nameBn: 'ছাত্র / পুরুষ', isSystem: true },
 { id: 'gen_female', name: 'Female', nameBn: 'ছাত্রী / মহিলা', isSystem: true },
 { id: 'gen_other', name: 'Other', nameBn: 'অন্যান্য', isSystem: true },
];

// 2. Religion / ধর্ম
export const defaultMasterReligions: MasterLookupItem[] = [
 { id: 'rel_islam', name: 'Islam', nameBn: 'ইসলাম', isSystem: true },
 { id: 'rel_hindu', name: 'Hinduism', nameBn: 'হিন্দু', isSystem: true },
 { id: 'rel_buddhist', name: 'Buddhism', nameBn: 'বৌদ্ধ', isSystem: true },
 { id: 'rel_christian', name: 'Christianity', nameBn: 'খ্রিস্টান', isSystem: true },
 { id: 'rel_other', name: 'Other', nameBn: 'অন্যান্য', isSystem: true },
];

// 3. Blood Group / রক্তের গ্রুপ
export const defaultMasterBloodGroups: MasterLookupItem[] = [
 { id: 'bg_a_pos', name: 'A+', nameBn: 'এ পজিটিভ (A+)', isSystem: true },
 { id: 'bg_a_neg', name: 'A-', nameBn: 'এ নেগেটিভ (A-)', isSystem: true },
 { id: 'bg_b_pos', name: 'B+', nameBn: 'বি পজিটিভ (B+)', isSystem: true },
 { id: 'bg_b_neg', name: 'B-', nameBn: 'বি নেগেটিভ (B-)', isSystem: true },
 { id: 'bg_o_pos', name: 'O+', nameBn: 'ও পজিটিভ (O+)', isSystem: true },
 { id: 'bg_o_neg', name: 'O-', nameBn: 'ও নেগেটিভ (O-)', isSystem: true },
 { id: 'bg_ab_pos', name: 'AB+', nameBn: 'এবি পজিটিভ (AB+)', isSystem: true },
 { id: 'bg_ab_neg', name: 'AB-', nameBn: 'এবি নেগেটিভ (AB-)', isSystem: true },
 { id: 'bg_unknown', name: 'Unknown / N/A', nameBn: 'জানা নেই / প্রযোজ্য নয়', isSystem: true },
];

// 4. Nationality / জাতীয়তা
export const defaultMasterNationalities: MasterLookupItem[] = [
 { id: 'nat_bd', name: 'Bangladeshi', nameBn: 'বাংলাদেশী', isSystem: true },
 { id: 'nat_other', name: 'Other', nameBn: 'অন্যান্য', isSystem: true },
];

// 5. Marital Status / বৈবাহিক অবস্থা
export const defaultMasterMaritalStatuses: MasterLookupItem[] = [
 { id: 'ms_single', name: 'Unmarried / Single', nameBn: 'অবিবাহিত', isSystem: true },
 { id: 'ms_married', name: 'Married', nameBn: 'বিবাহিত', isSystem: true },
 { id: 'ms_other', name: 'Other', nameBn: 'অন্যান্য', isSystem: true },
];

// 6. Disability / প্রতিবন্ধিতা
export const defaultMasterDisabilities: MasterLookupItem[] = [
 { id: 'dis_none', name: 'None', nameBn: 'নেই / প্রযোজ্য নয়', isSystem: true },
 { id: 'dis_visual', name: 'Visual Impairment', nameBn: 'দৃষ্টি প্রতিবন্ধী', isSystem: true },
 { id: 'dis_hearing', name: 'Hearing Impairment', nameBn: 'শ্রবণ প্রতিবন্ধী', isSystem: true },
 { id: 'dis_physical', name: 'Physical Disability', nameBn: 'শারীরিক প্রতিবন্ধী', isSystem: true },
 { id: 'dis_speech', name: 'Speech Impairment', nameBn: 'বাক প্রতিবন্ধী', isSystem: true },
 { id: 'dis_autism', name: 'Autism Spectrum', nameBn: 'অটিজম / নিউরো', isSystem: true },
 { id: 'dis_other', name: 'Other Disability', nameBn: 'অন্যান্য প্রতিবন্ধিতা', isSystem: true },
];

// 7. Profession / পেশা
export const defaultMasterProfessions: MasterLookupItem[] = [
 { id: 'prof_farmer', name: 'Farmer / Agriculture', nameBn: 'কৃষক / কৃষি', isSystem: true },
 { id: 'prof_business', name: 'Business / Trade', nameBn: 'ব্যবসায়ী / ব্যবসা', isSystem: true },
 { id: 'prof_service', name: 'Job / Service Holder', nameBn: 'চাকরিজীবী', isSystem: true },
 { id: 'prof_teacher', name: 'Teacher / Educator', nameBn: 'শিক্ষক', isSystem: true },
 { id: 'prof_doctor', name: 'Doctor / Medical', nameBn: 'চিকিৎসক', isSystem: true },
 { id: 'prof_engineer', name: 'Engineer / Technical', nameBn: 'প্রকৌশলী', isSystem: true },
 { id: 'prof_lawyer', name: 'Lawyer / Legal', nameBn: 'আইনজীবী', isSystem: true },
 { id: 'prof_driver', name: 'Driver / Transport', nameBn: 'চালক / ড্রাইভার', isSystem: true },
 { id: 'prof_worker', name: 'Day Laborer / Worker', nameBn: 'শ্রমিক / দিনমজুর', isSystem: true },
 { id: 'prof_housewife', name: 'Homemaker / Housewife', nameBn: 'গৃহিণী', isSystem: true },
 { id: 'prof_expatriate', name: 'Expatriate / Foreign Worker', nameBn: 'প্রবাসী', isSystem: true },
 { id: 'prof_other', name: 'Other', nameBn: 'অন্যান্য', isSystem: true },
];

// 8. Relationship / অভিভাবকের সাথে সম্পর্ক
export const defaultMasterRelations: MasterLookupItem[] = [
 { id: 'rel_father', name: 'Father', nameBn: 'পিতা', isSystem: true },
 { id: 'rel_mother', name: 'Mother', nameBn: 'মাতা', isSystem: true },
 { id: 'rel_brother', name: 'Brother', nameBn: 'ভাই', isSystem: true },
 { id: 'rel_sister', name: 'Sister', nameBn: 'বোন', isSystem: true },
 { id: 'rel_uncle', name: 'Uncle (Chacha/Mama/Fufa)', nameBn: 'চাচা / মামা / ফুফা', isSystem: true },
 { id: 'rel_aunt', name: 'Aunt (Chachi/Mami/Khala)', nameBn: 'ফুফু / খালা / চাচী', isSystem: true },
 { id: 'rel_grandfather', name: 'Grandfather (Dada/Nana)', nameBn: 'দাদা / নানা', isSystem: true },
 { id: 'rel_grandmother', name: 'Grandmother (Dadi/Nani)', nameBn: 'দাদী / নানী', isSystem: true },
 { id: 'rel_guardian_legal', name: 'Legal Guardian', nameBn: 'আইনগত অভিভাবক', isSystem: true },
 { id: 'rel_other', name: 'Other Relative', nameBn: 'অন্যান্য', isSystem: true },
];

// 9. Education Boards / পাশের বোর্ড বা মাধ্যম
export const defaultMasterBoards: MasterLookupItem[] = [
 { id: 'board_dhaka', name: 'Dhaka Board', nameBn: 'ঢাকা বোর্ড', code: 'DHA', isSystem: true },
 { id: 'board_chittagong', name: 'Chattogram Board', nameBn: 'চট্টগ্রাম বোর্ড', code: 'CTG', isSystem: true },
 { id: 'board_rajshahi', name: 'Rajshahi Board', nameBn: 'রাজশাহী বোর্ড', code: 'RAJ', isSystem: true },
 { id: 'board_khulna', name: 'Khulna Board', nameBn: 'খুলনা বোর্ড', code: 'KHU', isSystem: true },
 { id: 'board_barisal', name: 'Barishal Board', nameBn: 'বরিশাল বোর্ড', code: 'BAR', isSystem: true },
 { id: 'board_sylhet', name: 'Sylhet Board', nameBn: 'সিলেট বোর্ড', code: 'SYL', isSystem: true },
 { id: 'board_comilla', name: 'Cumilla Board', nameBn: 'কুমিল্লা বোর্ড', code: 'COM', isSystem: true },
 { id: 'board_dinajpur', name: 'Dinajpur Board', nameBn: 'দিনাজপুর বোর্ড', code: 'DIN', isSystem: true },
 { id: 'board_mymensingh', name: 'Mymensingh Board', nameBn: 'ময়মনসিংহ বোর্ড', code: 'MYM', isSystem: true },
 { id: 'board_madrasah', name: 'Madrasah Board (BMEB)', nameBn: 'মাদ্রাসা বোর্ড', code: 'MAD', isSystem: true },
 { id: 'board_technical', name: 'Technical Board (BTEB)', nameBn: 'কারিগরি বোর্ড', code: 'TEC', isSystem: true },
 { id: 'board_dpe', name: 'Directorate of Primary Education (DPE)', nameBn: 'প্রাথমিক শিক্ষা অধিদপ্তর (ডিপিই)', code: 'DPE', isSystem: true, description: 'প্রাথমিক শিক্ষা অধিদপ্তর' },
 { id: 'board_cambridge', name: 'Cambridge / Edexcel', nameBn: 'ক্যামব্রিজ / ইংলিশ মিডিয়াম', code: 'ENG', isSystem: true },
 { id: 'board_bou', name: 'Open University (BOU)', nameBn: 'উন্মুক্ত বিশ্ববিদ্যালয়', code: 'BOU', isSystem: true },
 { id: 'board_other', name: 'Other Board', nameBn: 'অন্যান্য বোর্ড', isSystem: true },
];

// 10. Special Facilities / কোটা বা বিশেষ সুবিধার ধরণ
export const defaultMasterFacilities: MasterLookupItem[] = [
 { id: 'fac_none', name: 'General / None', nameBn: 'সাধারণ / প্রযোজ্য নয়', isSystem: true },
 { id: 'fac_stipend', name: 'Government Stipend (উপবৃত্তি)', nameBn: 'সরকারি উপবৃত্তি', isSystem: true },
 { id: 'fac_merit', name: 'Merit Scholarship (মেধাবৃত্তি)', nameBn: 'মেধাবৃত্তি', isSystem: true },
 { id: 'fac_poor', name: 'Poor & Destitute Fund (দরিদ্র তহবিল)', nameBn: 'দরিদ্র ও অসচ্ছল সহায়তা', isSystem: true },
 { id: 'fac_freedom_fighter', name: 'Freedom Fighter Quota (বীর মুক্তিযোদ্ধা সন্তান)', nameBn: 'মুক্তিযোদ্ধা কোটা', isSystem: true },
 { id: 'fac_ethnic', name: 'Ethnic Minority Quota (ক্ষুদ্র নৃগোষ্ঠী)', nameBn: 'ক্ষুদ্র নৃগোষ্ঠী কোটা', isSystem: true },
 { id: 'fac_special_need', name: 'Special Needs / Disability Support', nameBn: 'বিশেষ চাহিদা সম্পন্ন সহায়তা', isSystem: true },
 { id: 'fac_orphan', name: 'Orphan Care (এতিম)', nameBn: 'এতিম / দুঃস্থ', isSystem: true },
 { id: 'fac_other', name: 'Other Facility', nameBn: 'অন্যান্য সুবিধা', isSystem: true },
];

// 11. Previous Educational Institutions / পূর্ববর্তী শিক্ষা প্রতিষ্ঠান তালিকা
export const defaultMasterInstitutions: MasterLookupItem[] = [
 { id: 'inst_local_pri', name: 'Local Govt. Primary School', nameBn: 'স্থানীয় সরকারি প্রাথমিক বিদ্যালয়', isSystem: true },
 { id: 'inst_local_high', name: 'Local High School', nameBn: 'স্থানীয় উচ্চ বিদ্যালয়', isSystem: true },
 { id: 'inst_local_madr', name: 'Local Dakhil / Senior Madrasah', nameBn: 'স্থানীয় দাখিল / সিনিয়র মাদ্রাসা', isSystem: true },
 { id: 'inst_local_kg', name: 'Local Model Kindergarten', nameBn: 'স্থানীয় কিন্ডারগার্টেন স্কুল', isSystem: true },
 { id: 'inst_other', name: 'Other School / Madrasah', nameBn: 'অন্যান্য শিক্ষা প্রতিষ্ঠান', isSystem: true },
];

// 12. Public Examinations / পাবলিক পরীক্ষার তথ্য
export const defaultMasterPublicExams: MasterLookupItem[] = [
 { id: 'pexam_ssc', name: 'Secondary School Certificate (SSC)', nameBn: 'মাধ্যমিক স্কুল সার্টিফিকেট (এসএসসি)', code: 'SSC', isSystem: true, description: 'National secondary school examination' },
 { id: 'pexam_dakhil', name: 'Dakhil Examination', nameBn: 'দাখিল পরীক্ষা', code: 'DAKHIL', isSystem: true, description: 'Madrasah education board examination' },
 { id: 'pexam_jsc', name: 'Junior School Certificate (JSC)', nameBn: 'জুনিয়র স্কুল সার্টিফিকেট (জেএসসি)', code: 'JSC', isSystem: true, description: 'Junior secondary completion exam' },
 { id: 'pexam_jdc', name: 'Junior Dakhil Certificate (JDC)', nameBn: 'জুনিয়র দাখিল সার্টিফিকেট (জেডিসি)', code: 'JDC', isSystem: true, description: 'Madrasah junior secondary completion exam' },
 { id: 'pexam_psc', name: 'Primary School Certificate (PSC)', nameBn: 'প্রাথমিক শিক্ষা সমাপনী (পিএসসি)', code: 'PSC', isSystem: true, description: 'Primary education completion examination' },
 { id: 'pexam_ebtedayee', name: 'Ebtedayee Education Completion Examination', nameBn: 'ইবতেদায়ী শিক্ষা সমাপনী পরীক্ষা', code: 'EBT', isSystem: true, description: 'Madrasah primary education completion' },
 { id: 'pexam_hsc', name: 'Higher Secondary Certificate (HSC)', nameBn: 'উচ্চ মাধ্যমিক সার্টিফিকেট (এইচএসসি)', code: 'HSC', isSystem: true, description: 'Higher secondary school certificate' },
 { id: 'pexam_alim', name: 'Alim Examination', nameBn: 'আলিম পরীক্ষা', code: 'ALIM', isSystem: true, description: 'Madrasah higher secondary examination' },
];

// 13. Committee Types / কমিটির ধরণ (প্রতিষ্ঠান -> মাষ্টার ডাটা সেটিংস্)
export const defaultMasterCommitteeTypes: MasterLookupItem[] = [
 { id: 'comm_adhoc', name: 'Ad-hoc Committee', nameBn: 'এডহক', code: 'ADHOC', isSystem: true, description: 'স্বল্পমেয়াদী বা অন্তবর্তীকালীন ৪ সদস্যের এডহক কমিটি' },
 { id: 'comm_managing', name: 'Managing Committee', nameBn: 'ম্যানেজিং', code: 'MANAGING', isSystem: true, description: 'বিদ্যালয় ব্যবস্থাপনা কমিটি (এসএমসি) - ২ বছর মেয়াদী' },
 { id: 'comm_governing', name: 'Governing Body', nameBn: 'গভর্নিং বডি', code: 'GOVERNING', isSystem: true, description: 'উচ্চ মাধ্যমিক বা কলেজ পর্যায়ের গভর্নিং বডি' },
 { id: 'comm_special', name: 'Special Committee', nameBn: 'বিশেষ', code: 'SPECIAL', isSystem: true, description: 'বিশেষ পরিস্থিতিতে গঠিত বিশেষ ব্যবস্থাপনা কমিটি' },
 { id: 'comm_interim', name: 'Interim Committee', nameBn: 'অন্তর্বর্তীকালীন', code: 'INTERIM', isSystem: true, description: 'অন্তর্বর্তীকালীন পরিচালন কমিটি' },
 { id: 'comm_high_court', name: 'By High Court', nameBn: 'হাইকোর্ট কর্তৃক', code: 'HIGH_COURT', isSystem: true, description: 'মাননীয় সুপ্রিম কোর্টের মহামান্য হাইকোর্ট বিভাগ কর্তৃক গঠিত' },
 { id: 'comm_trust_agency', name: 'By Agency/Trust', nameBn: 'সংস্থা কর্তৃক', code: 'AGENCY', isSystem: true, description: 'প্রতিষ্ঠাতা সংস্থা বা ট্রাস্ট কর্তৃক পরিচালিত' },
 { id: 'comm_none', name: 'No Committee', nameBn: 'কমিটি নেই', code: 'NONE', isSystem: true, description: 'বর্তমানে কোনো কমিটি সক্রিয় নেই' },
];

// 14. Bank & Payment / ব্যাংক ও পেমেন্ট (প্রতিষ্ঠান -> মাষ্টার ডাটা সেটিংস্)
export const defaultMasterBankPayments: MasterLookupItem[] = [
  { id: 'bank_sonali', name: 'Sonali Bank PLC', nameBn: 'সোনালী ব্যাংক পিএলসি', code: '020', isSystem: true, description: 'রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংক (State-Owned Bank)' },
  { id: 'bank_agrani', name: 'Agrani Bank PLC', nameBn: 'অগ্রণী ব্যাংক পিএলসি', code: '010', isSystem: true, description: 'রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংক (State-Owned Bank)' },
  { id: 'bank_janata', name: 'Janata Bank PLC', nameBn: 'জনতা ব্যাংক পিএলসি', code: '015', isSystem: true, description: 'রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংক (State-Owned Bank)' },
  { id: 'bank_rupali', name: 'Rupali Bank PLC', nameBn: 'রূপালী ব্যাংক পিএলসি', code: '025', isSystem: true, description: 'রাষ্ট্রায়ত্ত বাণিজ্যিক ব্যাংক (State-Owned Bank)' },
  { id: 'bank_dbbl', name: 'Dutch-Bangla Bank PLC', nameBn: 'ডাচ-বাংলা ব্যাংক পিএলসি', code: '195', isSystem: true, description: 'বেসরকারি বাণিজ্যিক ব্যাংক (Private Commercial Bank)' },
  { id: 'bank_islami', name: 'Islami Bank Bangladesh PLC', nameBn: 'ইসলামী ব্যাংক বাংলাদেশ পিএলসি', code: '125', isSystem: true, description: 'শরীয়াহ ভিত্তিক বাণিজ্যিক ব্যাংক (Islamic Shariah Bank)' },
  { id: 'bank_brac', name: 'BRAC Bank PLC', nameBn: 'ব্র্যাক ব্যাংক পিএলসি', code: '060', isSystem: true, description: 'বেসরকারি বাণিজ্যিক ব্যাংক (Private Commercial Bank)' },
  { id: 'bank_asia', name: 'Bank Asia PLC', nameBn: 'ব্যাংক এশিয়া পিএলসি', code: '045', isSystem: true, description: 'বেসরকারি বাণিজ্যিক ব্যাংক (Private Commercial Bank)' },
  { id: 'bank_pubali', name: 'Pubali Bank PLC', nameBn: 'পূবালী ব্যাংক পিএলসি', code: '205', isSystem: true, description: 'বেসরকারি বাণিজ্যিক ব্যাংক (Private Commercial Bank)' },
  { id: 'bank_city', name: 'City Bank PLC', nameBn: 'সিটি ব্যাংক পিএলসি', code: '225', isSystem: true, description: 'বেসরকারি বাণিজ্যিক ব্যাংক (Private Commercial Bank)' },
  { id: 'bank_trust', name: 'Trust Bank PLC', nameBn: 'ট্রাস্ট ব্যাংক পিএলসি', code: '240', isSystem: true, description: 'বেসরকারি বাণিজ্যিক ব্যাংক (Private Commercial Bank)' },
  { id: 'bank_ucb', name: 'United Commercial Bank PLC (UCB)', nameBn: 'ইউনাইটেড কমার্শিয়াল ব্যাংক পিএলসি', code: '245', isSystem: true, description: 'বেসরকারি বাণিজ্যিক ব্যাংক (Private Commercial Bank)' },
  { id: 'bank_prime', name: 'Prime Bank PLC', nameBn: 'প্রাইম ব্যাংক পিএলসি', code: '170', isSystem: true, description: 'বেসরকারি বাণিজ্যিক ব্যাংক (Private Commercial Bank)' },
  { id: 'bank_mtbl', name: 'Mutual Trust Bank PLC', nameBn: 'মিউচুয়াল ট্রাস্ট ব্যাংক পিএলসি', code: '165', isSystem: true, description: 'বেসরকারি বাণিজ্যিক ব্যাংক (Private Commercial Bank)' },
  { id: 'bank_krishi', name: 'Bangladesh Krishi Bank', nameBn: 'বাংলাদেশ কৃষি ব্যাংক', code: '035', isSystem: true, description: 'বিশেষায়িত সরকারি ব্যাংক (Specialized Bank)' },
  { id: 'bank_bkash', name: 'bKash Merchant / Payment Gateway', nameBn: 'বিকাশ পেমেন্ট গেটওয়ে (MFS)', code: 'BKASH', isSystem: true, description: 'মোবাইল ফিন্যান্সিয়াল সার্ভিস (MFS)' },
  { id: 'bank_nagad', name: 'Nagad Payment Gateway', nameBn: 'নগদ পেমেন্ট গেটওয়ে (MFS)', code: 'NAGAD', isSystem: true, description: 'মোবাইল ফিন্যান্সিয়াল সার্ভিস (MFS)' },
  { id: 'bank_rocket', name: 'Rocket (DBBL Mobile Banking)', nameBn: 'রকেট - ডিবিবিএল (MFS)', code: 'ROCKET', isSystem: true, description: 'মোবাইল ফিন্যান্সিয়াল সার্ভিস (MFS)' },
  { id: 'bank_upay', name: 'Upay (UCB Fintech)', nameBn: 'উপায় - ইউসিবিএল (MFS)', code: 'UPAY', isSystem: true, description: 'মোবাইল ফিন্যান্সিয়াল সার্ভিস (MFS)' },
  { id: 'bank_cash', name: 'Cash / Institution Counter Collection', nameBn: 'সরাসরি ক্যাশ / কাউন্টার আদায়', code: 'CASH', isSystem: true, description: 'প্রতিষ্ঠানের হিসাব শাখায় সরাসরি নগদ প্রদান মাধ্যম' },
];
