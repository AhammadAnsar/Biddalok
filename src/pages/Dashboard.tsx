import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, BookOpen, Award, Wallet, School, UserPlus, 
  FileText, ShieldCheck, ArrowRight, Sparkles, Building2,
  Calendar, CheckCircle, Clock
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { translations, TranslationKey } from '../locales';

const Dashboard = () => {
  const { language, students, examResults, institution } = useAppStore();
  const isBn = language === 'bn';
  const t = (key: TranslationKey) => translations[language][key];

  const currentDate = new Date().toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const stats = [
    { 
      label: isBn ? 'মোট শিক্ষার্থী' : 'Total Students', 
      value: students.length, 
      icon: Users, 
      color: 'bg-blue-600', 
      border: 'border-blue-200',
      link: '/students/list'
    },
    { 
      label: isBn ? 'প্রশংসাপত্র ও রেজাল্ট' : 'Testimonials & Results', 
      value: (examResults || []).length, 
      icon: Award, 
      color: 'bg-purple-600', 
      border: 'border-purple-200',
      link: '/testimonial'
    },
    { 
      label: isBn ? 'একাডেমিক শ্রেণী ও শাখা' : 'Classes & Sections', 
      value: isBn ? '১০ টি' : '10', 
      icon: BookOpen, 
      color: 'bg-emerald-600', 
      border: 'border-emerald-200',
      link: '/academic/class-section'
    },
    { 
      label: isBn ? 'শিক্ষক ও কর্মকর্তা' : 'Teachers & Staff', 
      value: isBn ? '২৪ জন' : '24', 
      icon: Building2, 
      color: 'bg-amber-600', 
      border: 'border-amber-200',
      link: '/hr'
    },
  ];

  const quickActions = [
    {
      title: isBn ? 'প্রশংসাপত্র ও প্রত্যয়নপত্র' : 'Testimonial & Attestation',
      desc: isBn ? 'প্রিন্ট মার্জিন কন্ট্রোল ও ১-ক্লিকে পিডিএফ' : 'Print margin controls & bulk PDF download',
      icon: Award,
      color: 'bg-purple-100 text-purple-700 group-hover:bg-purple-600 group-hover:text-white',
      link: '/testimonial',
      badge: isBn ? 'জনপ্রিয়' : 'Popular'
    },
    {
      title: isBn ? 'নতুন শিক্ষার্থী ভর্তি' : 'New Admission',
      desc: isBn ? 'অনলাইন ভর্তি ফরম ও স্মার্ট ডাটা এন্ট্রি' : 'Student enrollment & smart registration',
      icon: UserPlus,
      color: 'bg-blue-100 text-blue-700 group-hover:bg-blue-600 group-hover:text-white',
      link: '/students/admission'
    },
    {
      title: isBn ? 'শিক্ষার্থী তালিকা ও প্রোফাইল' : 'Student Directory',
      desc: isBn ? 'শ্রেণীভিত্তিক তালিকা ও বিস্তারিত তথ্য' : 'Class-wise student records & search',
      icon: Users,
      color: 'bg-sky-100 text-sky-700 group-hover:bg-sky-600 group-hover:text-white',
      link: '/students/list'
    },
    {
      title: isBn ? 'একাডেমিক ক্লাস ও শাখা' : 'Classes & Sections',
      desc: isBn ? 'শ্রেণী ব্যবস্থাপনা ও রুটিন প্রস্তুত' : 'Manage academic grades and streams',
      icon: BookOpen,
      color: 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white',
      link: '/academic/class-section'
    },
    {
      title: isBn ? 'ফি ও হিসাব ব্যবস্থাপনা' : 'Finance & Fees',
      desc: isBn ? 'বেতন আদায় ও মাসিক আয়-ব্যয় রিপোর্ট' : 'Tuition collection & monthly ledger',
      icon: Wallet,
      color: 'bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white',
      link: '/finance'
    },
    {
      title: isBn ? 'ডাটাবেজ ব্যাকআপ ও সিস্টেম' : 'Database & Backup',
      desc: isBn ? '১-ক্লিকে অফলাইন ব্যাকআপ ও রিস্টোর' : 'Secure offline JSON backup & restore',
      icon: ShieldCheck,
      color: 'bg-slate-100 text-slate-700 group-hover:bg-slate-700 group-hover:text-white',
      link: '/system'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      
      {/* Institution Hero Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-sm border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isBn ? 'বিদ্যালোক এডুকেশন ইআরপি ড্যাশবোর্ড' : 'Biddalok Education ERP Dashboard'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isBn && institution?.nameBn ? institution.nameBn : institution?.name || 'বিদ্যালোক মডেল স্কুল'}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-indigo-200">
              <span>EIIN: <strong className="text-white font-mono">{institution?.eiin || '123456'}</strong></span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                {currentDate}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/students/admission"
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isBn ? 'ভর্তি ফরম' : 'New Admission'}</span>
            </Link>
            <Link
              to="/testimonial"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>{isBn ? 'প্রশংসা / প্রত্যয়নপত্র' : 'Testimonials'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link 
              key={i} 
              to={stat.link}
              className={`bg-white rounded-2xl shadow-sm hover:shadow-md border ${stat.border} p-5 flex items-center gap-4 transition-all hover:-translate-y-0.5 group`}
            >
              <div className={`${stat.color} p-3.5 rounded-xl text-white shadow-md group-hover:scale-105 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-slate-500 font-semibold truncate">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">{stat.value}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Access Operations Grid */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              {isBn ? 'দৈনন্দিন প্রাতিষ্ঠানিক কার্যক্রম' : 'Daily Academic Operations'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isBn ? 'যে কোনো মডিউলে সরাসরি প্রবেশ করতে নিচের কার্ডে ক্লিক করুন' : 'Select a module below to quickly manage institution workflows'}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                to={action.link}
                className="p-4 rounded-2xl bg-slate-50/80 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-300 transition-all flex items-center justify-between group shadow-sm hover:shadow"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${action.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-900">
                        {action.title}
                      </h4>
                      {action.badge && (
                        <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {action.desc}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Admissions & Institution Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Students Enrolled */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {isBn ? 'সর্বশেষ নিবন্ধিত শিক্ষার্থী' : 'Recent Students'}
              </h3>
            </div>
            <Link 
              to="/students/list" 
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>{isBn ? 'সকল শিক্ষার্থী' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {students && students.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {students.slice(0, 5).map((student) => (
                <div key={student.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">
                      {student.roll || '#'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{isBn && student.nameBn ? student.nameBn : student.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">ID: {student.studentId} &bull; Class {student.class}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {student.session || '2026'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 text-xs">
              {isBn ? 'কোনো শিক্ষার্থীর তথ্য যুক্ত করা হয়নি।' : 'No student records yet.'}
            </div>
          )}
        </div>

        {/* System & Institution Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <School className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {isBn ? 'প্রাতিষ্ঠানিক পরিচিতি' : 'Institute Details'}
              </h3>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{isBn ? 'নাম' : 'Name'}</span>
                <span className="font-bold text-slate-800 text-right truncate max-w-[150px]">{institution?.name || 'বিদ্যালোক'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">EIIN</span>
                <span className="font-mono font-bold text-slate-800">{institution?.eiin || '123456'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">{isBn ? 'ঠিকানা' : 'Address'}</span>
                <span className="font-medium text-slate-700 text-right truncate max-w-[160px]">{institution?.address || 'বাংলাদেশ'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">{isBn ? 'ডাটা ব্যাকআপ' : 'Data Mode'}</span>
                <span className="font-bold text-emerald-600">{isBn ? 'অফলাইন ও নিরাপদ' : 'Offline & Safe'}</span>
              </div>
            </div>
          </div>

          <Link
            to="/institution/settings"
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2 rounded-xl text-center transition-all"
          >
            {isBn ? 'প্রতিষ্ঠান সেটিংস পরিবর্তন' : 'Edit Institute Settings'}
          </Link>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
