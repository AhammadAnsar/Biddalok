import {
  Users, User, FileText, BookOpen, Settings, Clock, Calendar, Briefcase, Monitor,
  Mail, MessageSquare, Phone, Activity, BarChart, Shield, Download, Database,
  Layers, Clipboard, CreditCard, DollarSign, Wallet, TrendingUp, TrendingDown,
  Home, MapPin, Bell, Globe, Image, Target, UserPlus, UserCheck, CalendarCheck,
  CalendarOff, LogOut, AlertTriangle, Award, GraduationCap, Map, ClipboardList,
  PenTool, CheckCircle, ArrowUpCircle, Building, Coffee, AlertCircle, List,
  PieChart, Heart, Repeat, Landmark, BarChart3, Info, DoorOpen, Package, Archive,
  ShoppingCart, Library, FlaskConical, Bus, Dribbble, Music, Tent, HeartHandshake,
  Network, Trophy, Layout, Newspaper, MonitorPlay, FileInput, BellRing, Share2,
  LayoutDashboard, Settings2, UserCog, Key, ListChecks, DatabaseBackup, Webhook,
  ShieldCheck, Wrench, ArrowRightLeft, Files, IdCard
} from 'lucide-react';
import { SubModule } from '../components/SubModuleGrid';

export const studentModules: SubModule[] = [
  { id: 'admission', titleEn: 'Admission & Enrollment', titleBn: 'ভর্তি ও তালিকাভুক্তি', icon: UserPlus, path: '/students/admission', color: 'bg-indigo-50 text-indigo-600' },
  { id: 'profile', titleEn: 'Student Profile & List', titleBn: 'শিক্ষার্থীর তালিকা ও প্রোফাইল', icon: User, path: '/students/list', color: 'bg-emerald-50 text-emerald-600' },
  { id: 'guardian', titleEn: 'Guardian & Family', titleBn: 'অভিভাবক ও পরিবার', icon: Users },
  { id: 'attendance', titleEn: 'Student Attendance', titleBn: 'শিক্ষার্থীর উপস্থিতি', icon: CalendarCheck },
  { id: 'id-card', titleEn: 'Student ID & Card', titleBn: 'শিক্ষার্থী আইডি ও কার্ড', icon: IdCard },
  { id: 'promotion', titleEn: 'Student Promotion', titleBn: 'শিক্ষার্থীর প্রমোশন', icon: TrendingUp },
  { id: 'transfer', titleEn: 'Student Transfer', titleBn: 'শিক্ষার্থী বদলি', icon: ArrowRightLeft },
  { id: 'withdrawal', titleEn: 'Student Withdrawal', titleBn: 'শিক্ষার্থী প্রত্যাহার', icon: LogOut },
  { id: 'discipline', titleEn: 'Student Discipline', titleBn: 'শিক্ষার্থীর শৃঙ্খলা', icon: AlertTriangle },
  { id: 'scholarship', titleEn: 'Scholarship & Stipend', titleBn: 'বৃত্তি ও উপবৃত্তি', icon: Award },
  { id: 'documents', titleEn: 'Student Documents', titleBn: 'শিক্ষার্থীর নথিপত্র', icon: Files },
  { id: 'alumni', titleEn: 'Alumni', titleBn: 'অ্যালামনাই', icon: GraduationCap },
];

export const academicModules: SubModule[] = [
  { id: 'class-section', titleEn: 'Class & Section', titleBn: 'ক্লাস ও সেকশন', icon: Layers, color: 'bg-emerald-50 text-emerald-600', path: '/academic/class-section' },
  { id: 'subject', titleEn: 'Subject', titleBn: 'বিষয়', icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
  { id: 'curriculum', titleEn: 'Curriculum', titleBn: 'কারিকুলাম', icon: Map, color: 'bg-indigo-50 text-indigo-600' },
  { id: 'session', titleEn: 'Academic Session', titleBn: 'একাডেমিক সেশন', icon: Calendar, color: 'bg-purple-50 text-purple-600' },
  { id: 'calendar', titleEn: 'Academic Calendar', titleBn: 'একাডেমিক ক্যালেন্ডার', icon: CalendarCheck, color: 'bg-rose-50 text-rose-600' },
  { id: 'routine', titleEn: 'Class Routine', titleBn: 'ক্লাস রুটিন', icon: Clock, color: 'bg-orange-50 text-orange-600' },
  { id: 'teacher-allocation', titleEn: 'Teacher Allocation', titleBn: 'শিক্ষক বণ্টন', icon: Users, color: 'bg-cyan-50 text-cyan-600' },
  { id: 'lesson-plan', titleEn: 'Lesson Plan', titleBn: 'লেসন প্ল্যান', icon: ClipboardList, color: 'bg-teal-50 text-teal-600' },
  { id: 'assignment', titleEn: 'Assignment & HW', titleBn: 'অ্যাসাইনমেন্ট ও এইচডব্লিউ', icon: PenTool, color: 'bg-sky-50 text-sky-600' },
  { id: 'examination', titleEn: 'Examination', titleBn: 'পরীক্ষা', icon: FileText, color: 'bg-violet-50 text-violet-600' },
  { id: 'results', titleEn: 'Results & Marksheet', titleBn: 'ফলাফল ও মার্কশিট', icon: BarChart, color: 'bg-fuchsia-50 text-fuchsia-600' },
  { id: 'certificate', titleEn: 'Certificate & Transcript', titleBn: 'সার্টিফিকেট ও ট্রান্সক্রিপ্ট', icon: Award, color: 'bg-yellow-50 text-yellow-600' },
  { id: 'grading', titleEn: 'Academic Grading', titleBn: 'একাডেমিক গ্রেডিং', icon: CheckCircle, color: 'bg-lime-50 text-lime-600' },
  { id: 'performance', titleEn: 'Academic Performance', titleBn: 'একাডেমিক পারফরম্যান্স', icon: TrendingUp, color: 'bg-green-50 text-green-600' },
];

export const hrModules: SubModule[] = [
  { id: 'profile', titleEn: 'Employee Profile', titleBn: 'কর্মচারী প্রোফাইল', icon: User },
  { id: 'staff', titleEn: 'Teacher & Staff', titleBn: 'শিক্ষক ও স্টাফ', icon: Users },
  { id: 'recruitment', titleEn: 'Recruitment', titleBn: 'নিয়োগ', icon: UserPlus },
  { id: 'attendance', titleEn: 'Employee Attendance', titleBn: 'কর্মচারী উপস্থিতি', icon: CalendarCheck },
  { id: 'leave', titleEn: 'Leave', titleBn: 'ছুটি', icon: CalendarOff },
  { id: 'payroll', titleEn: 'Payroll', titleBn: 'পে-রোল (বেতন)', icon: DollarSign },
  { id: 'documents', titleEn: 'Employee Documents', titleBn: 'কর্মচারীর নথিপত্র', icon: Files },
  { id: 'training', titleEn: 'Training & Development', titleBn: 'প্রশিক্ষণ ও উন্নয়ন', icon: Target },
  { id: 'performance', titleEn: 'Performance Evaluation', titleBn: 'কর্মক্ষমতা মূল্যায়ন', icon: TrendingUp },
  { id: 'promotion', titleEn: 'Promotion & Transfer', titleBn: 'পদোন্নতি ও বদলি', icon: ArrowUpCircle },
  { id: 'resignation', titleEn: 'Resignation & Retirement', titleBn: 'পদত্যাগ ও অবসর', icon: LogOut },
];

export const adminModules: SubModule[] = [
  { id: 'committee', titleEn: 'Committee', titleBn: 'কমিটি', icon: Users },
  { id: 'authority', titleEn: 'Upper Authority', titleBn: 'উর্ধ্বতন কর্তৃপক্ষ', icon: Shield },
  { id: 'office', titleEn: 'Office & Departments', titleBn: 'অফিস ও বিভাগসমূহ', icon: Building },
  { id: 'designation', titleEn: 'Designation', titleBn: 'পদবি', icon: Briefcase },
  { id: 'documents', titleEn: 'Administrative Documents', titleBn: 'প্রশাসনিক নথিপত্র', icon: Files },
  { id: 'notice', titleEn: 'Notice & Circular', titleBn: 'নোটিশ ও পরিপত্র', icon: Bell },
  { id: 'meeting', titleEn: 'Meeting & Minutes', titleBn: 'মিটিং ও কার্যবিবরণী', icon: Coffee },
  { id: 'visitor', titleEn: 'Visitor', titleBn: 'দর্শনার্থী', icon: UserCheck },
  { id: 'correspondence', titleEn: 'Official Correspondence', titleBn: 'দাপ্তরিক চিঠিপত্র', icon: Mail },
  { id: 'complaint', titleEn: 'Complaint & Feedback', titleBn: 'অভিযোগ ও মতামত', icon: AlertCircle },
  { id: 'event', titleEn: 'Event & Calendar', titleBn: 'ইভেন্ট ও ক্যালেন্ডার', icon: Calendar },
];

export const financeModules: SubModule[] = [
  { id: 'chart', titleEn: 'Chart of Accounts', titleBn: 'হিসাব খাত (Chart of Accounts)', icon: List },
  { id: 'fees', titleEn: 'Fees & Collection', titleBn: 'ফি ও আদায়', icon: CreditCard },
  { id: 'income', titleEn: 'Income', titleBn: 'আয়', icon: TrendingUp },
  { id: 'expense', titleEn: 'Expense', titleBn: 'ব্যয়', icon: TrendingDown },
  { id: 'payment', titleEn: 'Payment & Receipt', titleBn: 'পেমেন্ট ও রসিদ', icon: DollarSign },
  { id: 'budget', titleEn: 'Budget', titleBn: 'বাজেট', icon: PieChart },
  { id: 'payroll-acc', titleEn: 'Payroll Accounting', titleBn: 'পে-রোল অ্যাকাউন্টিং', icon: Users },
  { id: 'donation', titleEn: 'Donation & Grant', titleBn: 'অনুদান ও সাহায্য', icon: Heart },
  { id: 'transactions', titleEn: 'Financial Transactions', titleBn: 'আর্থিক লেনদেন', icon: Repeat },
  { id: 'bank', titleEn: 'Bank & Cash', titleBn: 'ব্যাংক ও ক্যাশ', icon: Landmark },
  { id: 'reports', titleEn: 'Financial Reports', titleBn: 'আর্থিক প্রতিবেদন', icon: BarChart3 },
];

export const institutionModules: SubModule[] = [
  { id: 'info', titleEn: 'Institute Information', titleBn: 'প্রতিষ্ঠানের তথ্য', icon: Info, path: '/institution/settings' },
  { id: 'campus', titleEn: 'Campus & Buildings', titleBn: 'ক্যাম্পাস ও ভবন', icon: MapPin },
  { id: 'rooms', titleEn: 'Rooms & Facilities', titleBn: 'রুম ও সুযোগ-সুবিধা', icon: DoorOpen },
  { id: 'assets', titleEn: 'Assets & Liabilities', titleBn: 'সম্পদ ও দায়', icon: Package },
  { id: 'inventory', titleEn: 'Inventory & Stock', titleBn: 'ইনভেন্টরি ও স্টক', icon: Archive },
  { id: 'purchase', titleEn: 'Purchase & Procurement', titleBn: 'ক্রয় ও সংগ্রহ', icon: ShoppingCart },
  { id: 'library', titleEn: 'Library', titleBn: 'গ্রন্থাগার', icon: Library },
  { id: 'science-lab', titleEn: 'Science Lab', titleBn: 'বিজ্ঞানাগার', icon: FlaskConical },
  { id: 'computer-lab', titleEn: 'Computer Lab', titleBn: 'কম্পিউটার ল্যাব', icon: Monitor },
  { id: 'transport', titleEn: 'Transport', titleBn: 'পরিবহন', icon: Bus },
  { id: 'hostel', titleEn: 'Hostel', titleBn: 'হোস্টেল', icon: Home },
];

export const activityModules: SubModule[] = [
  { id: 'clubs', titleEn: 'Clubs', titleBn: 'ক্লাবসমূহ', icon: Users },
  { id: 'co-curricular', titleEn: 'Co-Curricular Activities', titleBn: 'সহপাঠ্যক্রমিক কার্যক্রম', icon: Activity },
  { id: 'sports', titleEn: 'Sports', titleBn: 'খেলাধুলা', icon: Dribbble },
  { id: 'cultural', titleEn: 'Cultural Activities', titleBn: 'সাংস্কৃতিক কার্যক্রম', icon: Music },
  { id: 'debates', titleEn: 'Debates & Competitions', titleBn: 'বিতর্ক ও প্রতিযোগিতা', icon: MessageSquare },
  { id: 'scouts', titleEn: 'Scouts/Guides', titleBn: 'স্কাউট/গাইড', icon: Tent },
  { id: 'social', titleEn: 'Social & Community', titleBn: 'সামাজিক ও সম্প্রদায়', icon: HeartHandshake },
  { id: 'organizations', titleEn: 'Student Organizations', titleBn: 'ছাত্র সংগঠন', icon: Network },
  { id: 'awards', titleEn: 'Awards & Achievements', titleBn: 'পুরস্কার ও অর্জন', icon: Trophy },
  { id: 'records', titleEn: 'Activity Records', titleBn: 'কার্যক্রমের রেকর্ড', icon: FileText },
];

export const websiteModules: SubModule[] = [
  { id: 'settings', titleEn: 'Website Settings', titleBn: 'ওয়েবসাইট সেটিংস', icon: Settings },
  { id: 'pages', titleEn: 'Pages', titleBn: 'পেজসমূহ', icon: Layout },
  { id: 'news', titleEn: 'News & Notices', titleBn: 'খবর ও নোটিশ', icon: Newspaper },
  { id: 'events', titleEn: 'Events', titleBn: 'ইভেন্টসমূহ', icon: Calendar },
  { id: 'gallery', titleEn: 'Gallery & Media', titleBn: 'গ্যালারি ও মিডিয়া', icon: Image },
  { id: 'slider', titleEn: 'Slider/Banner', titleBn: 'স্লাইডার/ব্যানার', icon: MonitorPlay },
  { id: 'forms', titleEn: 'Online Forms', titleBn: 'অনলাইন ফর্ম', icon: FileInput },
  { id: 'contact', titleEn: 'Contact & Enquiry', titleBn: 'যোগাযোগ ও অনুসন্ধান', icon: Phone },
  { id: 'sms', titleEn: 'SMS', titleBn: 'এসএমএস', icon: MessageSquare },
  { id: 'email', titleEn: 'Email', titleBn: 'ইমেইল', icon: Mail },
  { id: 'push', titleEn: 'Push Notifications', titleBn: 'পুশ নোটিফিকেশন', icon: BellRing },
  { id: 'social', titleEn: 'Social Media Links', titleBn: 'সোশ্যাল মিডিয়া লিংক', icon: Share2 },
];

export const reportModules: SubModule[] = [
  { id: 'dashboard', titleEn: 'Executive Dashboard', titleBn: 'এক্সিকিউটিভ ড্যাশবোর্ড', icon: LayoutDashboard },
  { id: 'student-rep', titleEn: 'Student Reports', titleBn: 'শিক্ষার্থী রিপোর্ট', icon: Users },
  { id: 'academic-rep', titleEn: 'Academic Reports', titleBn: 'একাডেমিক রিপোর্ট', icon: BookOpen },
  { id: 'attendance-rep', titleEn: 'Attendance Reports', titleBn: 'উপস্থিতি রিপোর্ট', icon: CalendarCheck },
  { id: 'exam-rep', titleEn: 'Exam & Results Reports', titleBn: 'পরীক্ষা ও ফলাফল রিপোর্ট', icon: FileText },
  { id: 'hr-rep', titleEn: 'HR Reports', titleBn: 'এইচআর রিপোর্ট', icon: Briefcase },
  { id: 'finance-rep', titleEn: 'Finance Reports', titleBn: 'আর্থিক রিপোর্ট', icon: DollarSign },
  { id: 'asset-rep', titleEn: 'Asset & Inventory', titleBn: 'সম্পদ ও ইনভেন্টরি রিপোর্ট', icon: Package },
  { id: 'library-rep', titleEn: 'Library Reports', titleBn: 'গ্রন্থাগার রিপোর্ট', icon: Library },
  { id: 'activity-rep', titleEn: 'Activity Reports', titleBn: 'কার্যক্রম রিপোর্ট', icon: Activity },
  { id: 'stats', titleEn: 'Institutional Statistics', titleBn: 'প্রাতিষ্ঠানিক পরিসংখ্যান', icon: BarChart },
  { id: 'kpi', titleEn: 'KPI & Analytics', titleBn: 'কেপিআই এবং অ্যানালিটিক্স', icon: Target },
  { id: 'custom', titleEn: 'Custom Reports', titleBn: 'কাস্টম রিপোর্ট', icon: Settings2 },
  { id: 'export', titleEn: 'Data Export', titleBn: 'ডাটা এক্সপোর্ট', icon: Download },
];

export const systemModules: SubModule[] = [
  { id: 'users', titleEn: 'User Accounts', titleBn: 'ব্যবহারকারী অ্যাকাউন্ট', icon: Users },
  { id: 'roles', titleEn: 'Roles & Permissions', titleBn: 'রোল ও পারমিশন', icon: UserCog },
  { id: 'access', titleEn: 'Access Control', titleBn: 'অ্যাক্সেস কন্ট্রোল', icon: Key },
  { id: 'audit', titleEn: 'Audit Logs', titleBn: 'অডিট লগ', icon: ListChecks },
  { id: 'activity', titleEn: 'Activity Logs', titleBn: 'অ্যাক্টিভিটি লগ', icon: Activity },
  { id: 'settings', titleEn: 'System Settings', titleBn: 'সিস্টেম সেটিংস', icon: Settings },
  { id: 'notifications', titleEn: 'Notification Settings', titleBn: 'নোটিফিকেশন সেটিংস', icon: Bell },
  { id: 'backup', titleEn: 'Backup & Restore', titleBn: 'ব্যাকআপ এবং রিস্টোর', icon: DatabaseBackup },
  { id: 'data', titleEn: 'Data Import & Export', titleBn: 'ডাটা ইমপোর্ট ও এক্সপোর্ট', icon: Database },
  { id: 'api', titleEn: 'API & Integrations', titleBn: 'এপিআই ও ইন্টিগ্রেশন', icon: Webhook },
  { id: 'security', titleEn: 'Security', titleBn: 'নিরাপত্তা', icon: ShieldCheck },
  { id: 'maintenance', titleEn: 'System Maintenance', titleBn: 'সিস্টেম রক্ষণাবেক্ষণ', icon: Wrench },
];
