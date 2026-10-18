import { AppModuleDefinition, DesignationPermission, Role, StaffDesignationItem } from '../types';

export const SYSTEM_MODULES: AppModuleDefinition[] = [
  {
    id: 'dashboard',
    labelBn: 'ড্যাশবোর্ড',
    labelEn: 'Dashboard',
    descriptionBn: 'সার্বিক তথ্য, নোটিশ ও পরিসংখ্যান সারসংক্ষেপ',
    descriptionEn: 'Institutional overview, quick stats and notices',
    path: '/'
  },
  {
    id: 'students',
    labelBn: 'শিক্ষার্থী ব্যবস্থাপনা',
    labelEn: 'Students',
    descriptionBn: 'ভর্তি, শিক্ষার্থী তালিকা, রোল ও বিস্তারিত প্রোফাইল',
    descriptionEn: 'Admission, directory, rolls, and student profiles',
    path: '/students'
  },
  {
    id: 'academic',
    labelBn: 'একাডেমিক কার্যক্রম',
    labelEn: 'Academic',
    descriptionBn: 'শ্রেণি, শাখা, বিভাগ, বিষয় ও রুটিন ব্যবস্থাপনা',
    descriptionEn: 'Classes, sections, groups, subjects and routine',
    path: '/academic'
  },
  {
    id: 'hr',
    labelBn: 'শিক্ষক ও কর্মচারী (HR)',
    labelEn: 'Human Resources',
    descriptionBn: 'কর্মী প্রোফাইল, হাজিরা, ছুটি ও বেতন বিবরণী',
    descriptionEn: 'Staff directory, attendance, leaves and payroll',
    path: '/hr'
  },
  {
    id: 'examination',
    labelBn: 'পরীক্ষা ও ফলাফল',
    labelEn: 'Examination',
    descriptionBn: 'নম্বর এন্ট্রি, ফলাফল শিট, মার্কশিট ও প্রগ্রেস কার্ড',
    descriptionEn: 'Marks entry, tabulations, marksheets and progress cards',
    path: '/exam'
  },
  {
    id: 'testimonial',
    labelBn: 'প্রশংসাপত্র ও প্রত্যয়ন',
    labelEn: 'Testimonial & TC',
    descriptionBn: 'প্রশংসাপত্র, প্রত্যয়ন পত্র ও ছাড়পত্র প্রিন্ট',
    descriptionEn: 'Testimonials, certifications and transfer certificates',
    path: '/testimonial'
  },
  {
    id: 'institution',
    labelBn: 'প্রতিষ্ঠান সেটিংস',
    labelEn: 'Institution',
    descriptionBn: 'প্রতিষ্ঠানের নাম, EIIN, লোগো ও মূল পরিচিতি',
    descriptionEn: 'Institution profile, EIIN, logo and basic details',
    path: '/institution'
  },
  {
    id: 'system',
    labelBn: 'সিস্টেম সেটিংস ও ডাটাবেজ',
    labelEn: 'System Settings',
    descriptionBn: 'ডাটাবেজ ব্যাকআপ, এক্সেস কন্ট্রোল ও ইউজার একাউন্ট',
    descriptionEn: 'Database backup, access control and admin tools',
    path: '/system'
  },
  {
    id: 'support',
    labelBn: 'সহায়তা ও সাপোর্ট',
    labelEn: 'Support Desk',
    descriptionBn: 'হেল্পডেস্ক, সহায়িকা নির্দেশিকা ও সাপোর্ট হটলাইন',
    descriptionEn: 'Technical assistance, help manual and hotline',
    path: '/support'
  }
];

export const ALL_MODULE_IDS = SYSTEM_MODULES.map(m => m.id);

export const DEFAULT_DESIGNATION_PERMISSIONS: DesignationPermission[] = [
  {
    designationId: 'des_head_teacher',
    designationName: 'Head Teacher / Principal',
    designationNameBn: 'প্রধান শিক্ষক / অধ্যক্ষ',
    role: 'admin',
    allowedModules: ['dashboard', 'students', 'academic', 'hr', 'examination', 'testimonial', 'institution', 'system', 'support']
  },
  {
    designationId: 'des_asst_head_teacher',
    designationName: 'Assistant Head Teacher',
    designationNameBn: 'সহকারী প্রধান শিক্ষক / উপাধ্যক্ষ',
    role: 'admin',
    allowedModules: ['dashboard', 'students', 'academic', 'hr', 'examination', 'testimonial', 'institution', 'support']
  },
  {
    designationId: 'des_asst_teacher',
    designationName: 'Assistant Teacher',
    designationNameBn: 'সহকারী শিক্ষক',
    role: 'teacher',
    allowedModules: ['dashboard', 'students', 'academic', 'examination', 'support']
  },
  {
    designationId: 'des_senior_teacher',
    designationName: 'Senior Teacher',
    designationNameBn: 'সিনিয়র শিক্ষক',
    role: 'teacher',
    allowedModules: ['dashboard', 'students', 'academic', 'examination', 'support']
  },
  {
    designationId: 'des_trade_instructor',
    designationName: 'Trade Instructor',
    designationNameBn: 'ট্রেড ইনস্ট্রাক্টর',
    role: 'teacher',
    allowedModules: ['dashboard', 'students', 'academic', 'examination', 'support']
  },
  {
    designationId: 'des_computer_lab_operator',
    designationName: 'Computer Lab Operator',
    designationNameBn: 'কম্পিউটার ল্যাব অপারেটর',
    role: 'teacher',
    allowedModules: ['dashboard', 'students', 'examination', 'support']
  },
  {
    designationId: 'des_office_assistant_computer',
    designationName: 'Office Assistant cum Computer Operator',
    designationNameBn: 'অফিস সহকারী কাম কম্পিউটার অপারেটর',
    role: 'admin',
    allowedModules: ['dashboard', 'students', 'hr', 'testimonial', 'support']
  },
  {
    designationId: 'des_accountant',
    designationName: 'Accountant',
    designationNameBn: 'হিসাবরক্ষক',
    role: 'accountant',
    allowedModules: ['dashboard', 'students', 'hr', 'support']
  },
  {
    designationId: 'des_trade_assistant',
    designationName: 'Trade Assistant',
    designationNameBn: 'ট্রেড অ্যাসিস্ট্যান্ট',
    role: 'staff',
    allowedModules: ['dashboard', 'students', 'support']
  },
  {
    designationId: 'des_security_guard',
    designationName: 'Security Guard',
    designationNameBn: 'নিরাপত্তা কর্মী',
    role: 'staff',
    allowedModules: ['dashboard', 'support']
  },
  {
    designationId: 'des_cleaner',
    designationName: 'Cleaner',
    designationNameBn: 'পরিচ্ছন্নতা কর্মী',
    role: 'staff',
    allowedModules: ['dashboard', 'support']
  },
  {
    designationId: 'des_night_guard',
    designationName: 'Night Guard',
    designationNameBn: 'নৈশ প্রহরী',
    role: 'staff',
    allowedModules: ['dashboard', 'support']
  }
];

// Fallback role mappings
export const DEFAULT_ROLE_PERMISSIONS: Record<Role, string[]> = {
  super_admin: ALL_MODULE_IDS,
  admin: ['dashboard', 'students', 'academic', 'hr', 'examination', 'testimonial', 'institution', 'support'],
  teacher: ['dashboard', 'students', 'academic', 'examination', 'support'],
  accountant: ['dashboard', 'students', 'hr', 'support'],
  staff: ['dashboard', 'support'],
  student: ['dashboard', 'students', 'examination', 'support']
};

/**
 * Automatically maps a designation title or category to the most sensible Role
 */
export function inferRoleFromDesignation(designationName?: string, isTeaching?: boolean): Role {
  if (!designationName) return isTeaching ? 'teacher' : 'staff';
  const name = designationName.toLowerCase();

  if (name.includes('প্রধান শিক্ষক') || name.includes('head') || name.includes('principal') || name.includes('অধ্যক্ষ')) {
    return 'admin';
  }
  if (name.includes('হিসাব') || name.includes('account') || name.includes('ক্যাশিয়ার') || name.includes('cashier')) {
    return 'accountant';
  }
  if (name.includes('অফিস সহকারী') || name.includes('অফিসার') || name.includes('office assistant') || name.includes('কম্পিউটার')) {
    return 'admin';
  }
  if (isTeaching || name.includes('শিক্ষক') || name.includes('teacher') || name.includes('ইনস্ট্রাক্টর') || name.includes('instructor')) {
    return 'teacher';
  }
  return 'staff';
}
