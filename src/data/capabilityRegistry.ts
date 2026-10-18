import { 
  Users, User, UserCircle, FileText, BookOpen, Settings, Clock, Calendar, Briefcase, Monitor,
  Mail, MessageSquare, Phone, Activity, BarChart, Shield, Download, Database,
  Layers, Clipboard, CreditCard, DollarSign, Wallet, TrendingUp, TrendingDown,
  Home, MapPin, Bell, Globe, Image, Target, UserPlus, UserCheck, CalendarCheck,
  CalendarOff, LogOut, AlertTriangle, Award, GraduationCap, Map, ClipboardList,
  PenTool, CheckCircle, ArrowUpCircle, Building, Coffee, AlertCircle, List,
  PieChart, Heart, Repeat, Landmark, BarChart3, Info, DoorOpen, Package, Archive,
  ShoppingCart, Library, FlaskConical, Bus, Dribbble, Music, Tent, HeartHandshake,
  Network, Trophy, Layout, Newspaper, MonitorPlay, FileInput, BellRing, Share2,
  LayoutDashboard, Settings2, UserCog, Key, ListChecks, DatabaseBackup, Webhook,
  ShieldCheck, Wrench, ArrowRightLeft, Files, IdCard, FileSpreadsheet, FileCheck,
  LayoutGrid, School, Headphones
} from 'lucide-react';
import React from 'react';

export type FeatureStatus = 'implemented' | 'beta' | 'planned';
export type AppRole = 'super_admin' | 'admin' | 'teacher' | 'accountant' | 'staff';

export interface AppModule {
  id: string;
  categoryId: string;
  category?: string;
  titleEn: string;
  titleBn: string;
  descriptionEn?: string;
  descriptionBn?: string;
  icon: React.ElementType;
  path?: string;
  color?: string;
  status: FeatureStatus;
  releaseMilestone: string;
  offlineAutonomous: boolean;
}

export interface AppCategory {
  id: string;
  titleEn: string;
  titleBn: string;
  icon: React.ElementType;
  path: string;
  allowedRoles: AppRole[];
  modules: AppModule[];
}

export const CAPABILITY_REGISTRY: AppCategory[] = [
  {
    id: 'dashboard',
    titleEn: 'Dashboard',
    titleBn: 'ড্যাশবোর্ড',
    icon: LayoutDashboard,
    path: '/',
    allowedRoles: ['super_admin', 'admin', 'teacher', 'accountant', 'staff'],
    modules: []
  },
  {
    id: 'students',
    titleEn: 'Students',
    titleBn: 'শিক্ষার্থী',
    icon: Users,
    path: '/students',
    allowedRoles: ['super_admin', 'admin', 'teacher', 'accountant', 'staff'],
    modules: [
      { id: 'admission', categoryId: 'students', titleEn: 'Admission', titleBn: 'ভর্তি', icon: UserPlus, path: '/students/admission', color: 'bg-indigo-50 text-indigo-600', status: 'implemented', releaseMilestone: 'v1.0 (Live)', offlineAutonomous: true },
      { id: 'profile', categoryId: 'students', titleEn: 'Student Profile & List', titleBn: 'শিক্ষার্থী প্রোফাইল ও তালিকা', icon: User, path: '/students/list', color: 'bg-emerald-50 text-emerald-600', status: 'implemented', releaseMilestone: 'v1.0 (Live)', offlineAutonomous: true },
      { id: 'guardian', categoryId: 'students', titleEn: 'Guardian & Family', titleBn: 'অভিভাবক ও পরিবার', icon: Users, status: 'planned', releaseMilestone: 'v1.2 (Roadmap)', offlineAutonomous: true },
      { id: 'attendance', categoryId: 'students', titleEn: 'Student Attendance', titleBn: 'শিক্ষার্থী উপস্থিতি', icon: CalendarCheck, status: 'planned', releaseMilestone: 'v1.2 (Roadmap)', offlineAutonomous: true },
      { id: 'id-card', categoryId: 'students', titleEn: 'Student ID', titleBn: 'শিক্ষার্থী আইডি', icon: IdCard, path: '/students/id-card', color: 'bg-indigo-50 text-indigo-600', status: 'implemented', releaseMilestone: 'v1.0 (Live)', offlineAutonomous: true },
      { id: 'promotion', categoryId: 'students', titleEn: 'Student Promotion', titleBn: 'শিক্ষার্থী প্রমোশন', icon: TrendingUp, status: 'planned', releaseMilestone: 'v1.2 (Roadmap)', offlineAutonomous: true },
      { id: 'transfer', categoryId: 'students', titleEn: 'Student Transfer', titleBn: 'শিক্ষার্থী বদলি', icon: ArrowRightLeft, status: 'planned', releaseMilestone: 'v1.2 (Roadmap)', offlineAutonomous: true },
      { id: 'withdrawal', categoryId: 'students', titleEn: 'Student Withdrawal', titleBn: 'শিক্ষার্থী প্রত্যাহার', icon: LogOut, status: 'planned', releaseMilestone: 'v1.2 (Roadmap)', offlineAutonomous: true },
      { id: 'discipline', categoryId: 'students', titleEn: 'Student Discipline', titleBn: 'শিক্ষার্থী শৃঙ্খলা', icon: AlertTriangle, status: 'planned', releaseMilestone: 'v1.2 (Roadmap)', offlineAutonomous: true },
      { id: 'followup', categoryId: 'students', titleEn: 'Student Follow-up', titleBn: 'শিক্ষার্থী ফলোআপ', icon: UserCheck, path: '/students/followup', color: 'bg-rose-50 text-rose-600', status: 'implemented', releaseMilestone: 'v1.0 (Live)', offlineAutonomous: true },
      { id: 'scholarship', categoryId: 'students', titleEn: 'Scholarship & Stipend', titleBn: 'বৃত্তি ও উপবৃত্তি', icon: Award, path: '/students/scholarships', color: 'bg-amber-50 text-amber-600', status: 'implemented', releaseMilestone: 'v1.0 (Live)', offlineAutonomous: true },
      { id: 'documents', categoryId: 'students', titleEn: 'Student Documents', titleBn: 'শিক্ষার্থী ডকুমেন্টস', icon: Files, status: 'planned', releaseMilestone: 'v1.2 (Roadmap)', offlineAutonomous: true },
      { id: 'alumni', categoryId: 'students', titleEn: 'Alumni', titleBn: 'অ্যালামনাই', icon: GraduationCap, status: 'planned', releaseMilestone: 'v1.2 (Roadmap)', offlineAutonomous: true },
    ]
  },
  {
    id: 'academic',
    titleEn: 'Academic',
    titleBn: 'একাডেমিক',
    icon: BookOpen,
    path: '/academic',
    allowedRoles: ['super_admin', 'admin', 'teacher'],
    modules: [
      { id: 'class-section', categoryId: 'academic', titleEn: 'Class & Section', titleBn: 'ক্লাস ও সেকশন', icon: Layers, color: 'bg-emerald-50 text-emerald-600', path: '/academic/class-section', status: 'implemented', releaseMilestone: 'v1.0 (Live)', offlineAutonomous: true },
      { id: 'curriculum', categoryId: 'academic', titleEn: 'Curriculum', titleBn: 'শিক্ষাক্রম', icon: Map, color: 'bg-teal-50 text-teal-600', path: '/academic/curriculum', status: 'implemented', releaseMilestone: 'v1.0 (Live)', offlineAutonomous: true },
    ]
  },
  {
    id: 'hr',
    titleEn: 'Human Resources',
    titleBn: 'মানবসম্পদ',
    icon: UserCircle,
    path: '/hr',
    allowedRoles: ['super_admin', 'admin', 'teacher', 'accountant', 'staff'],
    modules: [
      { id: 'profile', categoryId: 'hr', titleEn: 'Profile', titleBn: 'প্রোফাইল', icon: User, status: 'planned', releaseMilestone: 'v1.2 (Roadmap)', offlineAutonomous: true },
      { id: 'staff', categoryId: 'hr', titleEn: 'Staff', titleBn: 'স্টাফ', icon: Users, status: 'planned', releaseMilestone: 'v1.2 (Roadmap)', offlineAutonomous: true },
    ]
  },
  {
    id: 'committee',
    titleEn: 'Committee',
    titleBn: 'কমিটি',
    icon: ShieldCheck,
    path: '/committee',
    allowedRoles: ['super_admin', 'admin', 'teacher', 'staff'],
    modules: []
  },
  {
    id: 'examination',
    titleEn: 'Examination',
    titleBn: 'পরীক্ষা',
    icon: FileCheck,
    path: '/exam',
    allowedRoles: ['super_admin', 'admin', 'teacher'],
    modules: [
      { id: 'exam-settings', categoryId: 'examination', titleEn: 'Exam Settings', titleBn: 'পরীক্ষা সেটিংস', icon: Settings2, color: 'bg-indigo-50 text-indigo-600', path: '/exam/settings', descriptionEn: 'Exam terms, sessions & grading policy', descriptionBn: 'পরীক্ষার টার্ম ও সেশন, গ্রেডিং পলিসি', status: 'implemented', releaseMilestone: 'v1.0 (Live)', offlineAutonomous: true },
      { id: 'exam-routine', categoryId: 'examination', titleEn: 'Exam Routine', titleBn: 'পরীক্ষার রুটিন', icon: Calendar, color: 'bg-blue-50 text-blue-600', path: '/exam/routine', descriptionEn: 'Exam dates, times & printable routine sheet', descriptionBn: 'পরীক্ষার সময়সূচী তারিখ ও সময়, প্রিন্টেবল রুটিন শিট', status: 'implemented', releaseMilestone: 'v1.0 (Live)', offlineAutonomous: true },
    ]
  },
  {
    id: 'finance',
    titleEn: 'Finance',
    titleBn: 'অর্থ ও হিসাব',
    icon: DollarSign,
    path: '/finance',
    allowedRoles: ['super_admin', 'admin', 'accountant'],
    modules: [
      { id: 'chart', categoryId: 'finance', titleEn: 'Accounts', titleBn: 'হিসাব খাত (Chart of Accounts)', icon: List, status: 'planned', releaseMilestone: 'v1.2 (Roadmap)', offlineAutonomous: true },
      { id: 'fees', categoryId: 'finance', titleEn: 'Fees', titleBn: 'ফি আদায়', icon: CreditCard, status: 'planned', releaseMilestone: 'v1.2 (Roadmap)', offlineAutonomous: true },
    ]
  },
  {
    id: 'testimonial',
    titleEn: 'Testimonial',
    titleBn: 'প্রশংসাপত্র',
    icon: Award,
    path: '/testimonial',
    allowedRoles: ['super_admin', 'admin', 'teacher'],
    modules: []
  },
  {
    id: 'reports',
    titleEn: 'Reports',
    titleBn: 'রিপোর্ট',
    icon: BarChart3,
    path: '/reports',
    allowedRoles: ['super_admin', 'admin', 'accountant', 'teacher'],
    modules: [
      { id: 'dashboard', categoryId: 'reports', titleEn: 'Executive Dashboard', titleBn: 'এক্সিকিউটিভ ড্যাশবোর্ড', icon: LayoutDashboard, status: 'planned', releaseMilestone: 'v1.2 (Roadmap)', offlineAutonomous: true },
      { id: 'student-rep', categoryId: 'reports', titleEn: 'Student Reports', titleBn: 'শিক্ষার্থী রিপোর্ট', icon: Users, status: 'planned', releaseMilestone: 'v1.2 (Roadmap)', offlineAutonomous: true },
    ]
  },
  {
    id: 'communication',
    titleEn: 'Communication',
    titleBn: 'যোগাযোগ',
    icon: MessageSquare,
    path: '/communication',
    allowedRoles: ['super_admin', 'admin', 'teacher'],
    modules: []
  },
  {
    id: 'institution',
    titleEn: 'Institution',
    titleBn: 'প্রতিষ্ঠান',
    icon: School,
    path: '/institution',
    allowedRoles: ['super_admin', 'admin'],
    modules: [
      { id: 'info', categoryId: 'institution', titleEn: 'Institute Information', titleBn: 'প্রতিষ্ঠানের তথ্য', icon: Info, path: '/institution/settings', color: 'bg-blue-50 text-blue-600', status: 'implemented', releaseMilestone: 'v1.0 (Live)', offlineAutonomous: true },
      { id: 'master-data', categoryId: 'institution', titleEn: 'Master Data Settings', titleBn: 'মাস্টার ডেটা সেটিংস', icon: Layers, path: '/institution/master-data', color: 'bg-amber-50 text-amber-600', status: 'implemented', releaseMilestone: 'v1.0 (Live)', offlineAutonomous: true },
    ]
  },
  {
    id: 'system',
    titleEn: 'System',
    titleBn: 'সিস্টেম',
    icon: Settings,
    path: '/system',
    allowedRoles: ['super_admin'],
    modules: [
      { id: 'users', categoryId: 'system', titleEn: 'User Accounts', titleBn: 'ব্যবহারকারী অ্যাকাউন্ট', icon: Users, status: 'planned', releaseMilestone: 'v1.2 (Roadmap)', offlineAutonomous: true },
      { id: 'roles', categoryId: 'system', titleEn: 'Roles & Permissions', titleBn: 'রোল ও পারমিশন', icon: UserCog, status: 'planned', releaseMilestone: 'v1.2 (Roadmap)', offlineAutonomous: true },
    ]
  },
  {
    id: 'support',
    titleEn: 'Support',
    titleBn: 'সাপোর্ট',
    icon: Headphones,
    path: '/support',
    allowedRoles: ['super_admin', 'admin', 'teacher', 'accountant', 'staff'],
    modules: []
  }
];

export function getSidebarNavigation(role: AppRole): AppCategory[] {
  return CAPABILITY_REGISTRY.filter(cat => cat.allowedRoles.includes(role));
}

export function getModulesByCategory(categoryId: string): AppModule[] {
  const category = CAPABILITY_REGISTRY.find(c => c.id === categoryId);
  return category ? category.modules : [];
}

export function getModuleById(moduleId: string): AppModule | undefined {
  for (const cat of CAPABILITY_REGISTRY) {
    const mod = cat.modules.find(m => m.id === moduleId || m.id.endsWith(`-${moduleId}`));
    if (mod) return mod;
  }
  return undefined;
}

export function getModuleStats() {
  let total = 0, implemented = 0, beta = 0, planned = 0;
  CAPABILITY_REGISTRY.forEach(cat => {
    cat.modules.forEach(m => {
      total++;
      if (m.status === 'implemented') implemented++;
      if (m.status === 'beta') beta++;
      if (m.status === 'planned') planned++;
    });
  });
  return { total, implemented, beta, planned };
}
