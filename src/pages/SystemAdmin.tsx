import React, { useState, useRef } from 'react';
import packageJson from '../../package.json';
import { 
  ShieldCheck, Database, Download, Upload, RefreshCw, 
  CheckCircle2, User, Phone, Mail, Globe, Sparkles, 
  HardDrive, Server, Info, AlertTriangle, Layers, Lock, Key, Wrench, Copy, Check,
  Laptop, ExternalLink, Settings, ShieldAlert, Cpu, Terminal, ChevronRight,
  Shield, Activity, ArrowUpRight, MessageSquare, HeartHandshake, Award, Headphones, BookOpen
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { useUpdateStore } from '../store/useUpdateStore';
import { calculateSupportRecoveryOTP } from '../utils/security';
import { SubModuleGrid } from '../components/SubModuleGrid';
import { systemModules } from '../data/erpData';
import { DesktopInstallerModal } from '../components/DesktopInstallerModal';
import { GITHUB_REPO_OWNER, GITHUB_REPO_NAME, GITHUB_REPO_URL } from '../utils/updateService';

type AdminTab = 'database' | 'security' | 'updates' | 'modules' | 'about' | 'maintenance';

interface TabItem {
  id: AdminTab;
  labelBn: string;
  labelEn: string;
  descBn: string;
  descEn: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

export const SystemAdmin: React.FC = () => {
  const { 
    language, 
    students, 
    academicClasses, 
    institution, 
    exportBackupJSON, 
    importBackupJSON, 
    resetToDefaults 
  } = useAppStore();

  const { adminUser, changePassword } = useAuthStore();
  const { 
    isChecking, 
    hasUpdate, 
    latestRelease, 
    currentVersion, 
    openUpdateModal, 
    checkUpdates 
  } = useUpdateStore();

  const isBn = language === 'bn';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('database');

  // Backup & Restore state
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'idle' | 'success' | 'error'; msg: string }>({ type: 'idle', msg: '' });
  const [isChangingPass, setIsChangingPass] = useState(false);

  // SoftDows Emergency Support OTP Generator Tool
  const [calcChallengeInput, setCalcChallengeInput] = useState('');
  const [generatedSupportOtp, setGeneratedSupportOtp] = useState('');
  const [copiedGeneratedOtp, setCopiedGeneratedOtp] = useState(false);

  // Desktop Installer Studio Modal
  const [isInstallerModalOpen, setIsInstallerModalOpen] = useState(false);

  // Factory reset modal state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Contact copy states
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyContact = (text: string, type: 'phone1' | 'phone2' | 'email') => {
    try {
      navigator.clipboard.writeText(text);
      if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      } else {
        setCopiedPhone(type);
        setTimeout(() => setCopiedPhone(null), 2000);
      }
    } catch {
      // Fallback
    }
  };

  const handleGenerateSupportOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcChallengeInput.trim()) return;
    const otp = await calculateSupportRecoveryOTP(calcChallengeInput.trim());
    setGeneratedSupportOtp(otp);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordStatus({ type: 'error', msg: isBn ? 'সকল ফিল্ড পূরণ করুন।' : 'Please fill all fields.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', msg: isBn ? 'নতুন পাসওয়ার্ড মেলেনি।' : 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 4) {
      setPasswordStatus({ type: 'error', msg: isBn ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters.' });
      return;
    }

    try {
      setIsChangingPass(true);
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordStatus({ type: 'success', msg: isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।' : 'Password updated successfully.' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordStatus({ type: 'error', msg: isBn ? 'বর্তমান পাসওয়ার্ড ভুল।' : res.message });
      }
    } catch {
      setPasswordStatus({ type: 'error', msg: isBn ? 'পাসওয়ার্ড পরিবর্তনে সমস্যা হয়েছে।' : 'Failed to change password.' });
    } finally {
      setIsChangingPass(false);
      setTimeout(() => setPasswordStatus({ type: 'idle', msg: '' }), 5000);
    }
  };

  const handleDownloadBackup = () => {
    try {
      const jsonStr = exportBackupJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `Biddalok_Backup_${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setImportStatus('success');
      setMessage(isBn ? 'ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে।' : 'Backup file downloaded successfully.');
      setTimeout(() => setImportStatus('idle'), 4000);
    } catch {
      setImportStatus('error');
      setMessage(isBn ? 'ব্যাকআপ তৈরিতে সমস্যা হয়েছে।' : 'Failed to generate backup.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importBackupJSON(content);
        if (success) {
          setImportStatus('success');
          setMessage(isBn ? 'ডাটাবেজ সফলভাবে রিস্টোর হয়েছে!' : 'Database restored successfully!');
        } else {
          setImportStatus('error');
          setMessage(isBn ? 'অবৈধ ব্যাকআপ ফাইল। সঠিক JSON ফাইল নির্বাচন করুন।' : 'Invalid backup JSON file format.');
        }
      }
      setTimeout(() => setImportStatus('idle'), 5000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetData = () => {
    const confirmReset = window.confirm(
      isBn 
        ? 'আপনি কি নিশ্চিত যে ডাটাবেজ প্রাথমিক অবস্থায় রিসেট করতে চান?' 
        : 'Are you sure you want to reset the database to default initial state?'
    );
    if (confirmReset) {
      resetToDefaults();
      setImportStatus('success');
      setMessage(isBn ? 'ডাটাবেজ ডিফল্ট অবস্থায় রিসেট করা হয়েছে।' : 'Database reset to default settings.');
      setTimeout(() => setImportStatus('idle'), 4000);
    }
  };

  const executeMasterFactoryReset = () => {
    localStorage.clear();
    try {
      const req = indexedDB.deleteDatabase('keyval-store');
      req.onsuccess = () => window.location.reload();
      req.onerror = () => window.location.reload();
    } catch {
      // Fallback
    }
    setTimeout(() => window.location.reload(), 800);
  };

  const navTabs: TabItem[] = [
    { 
      id: 'database', 
      labelBn: 'ডাটাবেজ ও ব্যাকআপ', 
      labelEn: 'Database & Backup', 
      descBn: 'অফলাইন ডেটা সংরক্ষণ ও রিস্টোর',
      descEn: 'Offline data export & restore',
      icon: Database 
    },
    { 
      id: 'security', 
      labelBn: 'সিকিউরিটি ও অ্যাক্সেস', 
      labelEn: 'Security & Access', 
      descBn: 'পাসওয়ার্ড ও রিকভারি ওটিপি টুল',
      descEn: 'Password & support recovery OTP',
      icon: Key 
    },
    { 
      id: 'updates', 
      labelBn: 'আপডেট ও রিলিজ', 
      labelEn: 'Updates & Releases', 
      descBn: 'GitHub সিঙ্ক ও ইন-অ্যাপ আপডেট',
      descEn: 'GitHub sync & in-place update',
      icon: RefreshCw, 
      badge: hasUpdate ? (isBn ? 'নতুন' : 'NEW') : undefined,
      badgeColor: 'bg-emerald-500 text-white'
    },
    { 
      id: 'modules', 
      labelBn: 'সিস্টেম মডিউল', 
      labelEn: 'System Modules', 
      descBn: 'প্রতিষ্ঠানের প্রশাসনিক কনফিগ',
      descEn: 'Institution & license setup',
      icon: Layers 
    },
    { 
      id: 'about', 
      labelBn: 'ডেভেলপার ও পরিচিতি', 
      labelEn: 'About & Support', 
      descBn: 'SoftDows ও হেল্পলাইন সাপোর্ট',
      descEn: 'SoftDows team & hotline info',
      icon: User 
    },
    { 
      id: 'maintenance', 
      labelBn: 'রক্ষণাবেক্ষণ ও রিসেট', 
      labelEn: 'Maintenance & Reset', 
      descBn: 'নমুনা রিসেট ও ফ্যাক্টরি ওয়াইপ',
      descEn: 'Sample reset & factory wipe',
      icon: ShieldAlert 
    },
  ];

  const currentTabInfo = navTabs.find(t => t.id === activeTab) || navTabs[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {isBn ? 'সিস্টেম অ্যাডমিন ও ডাটাবেজ কন্ট্রোল' : 'System Administration & Database Control'}
                </h1>
                <span className="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold">
                  v{packageJson.version}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isBn 
                  ? 'অফলাইন ডাটাবেজ ব্যাকআপ, সিকিউরিটি এনক্রিপশন, গিটহাব রিলিজ আপডেট ও সিস্টেম রক্ষণাবেক্ষণ' 
                  : 'Offline database backup, cryptographic security, GitHub update releases, and system controls.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                checkUpdates(false);
                openUpdateModal();
              }}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isBn ? 'আপডেট চেক' : 'Check Updates'}</span>
            </button>
            <button
              onClick={handleDownloadBackup}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isBn ? '১-ক্লিক ব্যাকআপ' : '1-Click Backup'}</span>
            </button>
          </div>
        </div>

        {/* Global Notification Banner */}
        {importStatus !== 'idle' && (
          <div className={`mt-4 p-3.5 rounded-xl flex items-center gap-3 border text-xs sm:text-sm font-medium ${
            importStatus === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
              : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
          }`}>
            {importStatus === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}
      </div>

      {/* Main Professional 2-Column Master-Detail Layout (No Horizontal Scrollbar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Vertical Category Menu (Desktop) & Responsive Wrap Grid (Mobile) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Menu Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm">
            <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isBn ? 'অ্যাডমিন মেনু ও সেটিংস' : 'Admin Categories'}
            </div>

            {/* Vertical list on Desktop, 2-col wrap grid on Mobile: Zero horizontal scroll */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1.5 pt-1">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800/80 shadow-sm'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/40'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs sm:text-sm font-bold truncate ${
                          isActive ? 'text-indigo-900 dark:text-indigo-200' : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {isBn ? tab.labelBn : tab.labelEn}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate hidden sm:block">
                          {isBn ? tab.descBn : tab.descEn}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {tab.badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tab.badgeColor || 'bg-indigo-100 text-indigo-700'}`}>
                          {tab.badge}
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        isActive ? 'text-indigo-600 dark:text-indigo-400 translate-x-0.5' : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick System Health Box in Sidebar */}
          <div className="bg-slate-900 text-white rounded-2xl p-4.5 border border-slate-800 shadow-sm hidden lg:block space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-semibold">{isBn ? 'সিস্টেম স্ট্যাটাস' : 'System Engine'}</span>
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE / READY
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300 font-mono pt-1 border-t border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-500">{isBn ? 'অ্যাপ ভার্সন:' : 'Version:'}</span>
                <span className="text-indigo-400 font-bold">v{packageJson.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isBn ? 'স্টোরেজ ড্রাইভ:' : 'Storage:'}</span>
                <span>IndexedDB</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isBn ? 'এনক্রিপশন:' : 'Cipher:'}</span>
                <span>SHA-256</span>
              </div>
            </div>
          </div>

          {/* Developer Hotline Quick Card in Sidebar */}
          <div className="bg-gradient-to-br from-amber-500/10 via-slate-900 to-indigo-950/40 border border-amber-500/30 dark:border-amber-500/20 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {isBn ? 'সরাসরি ডেভেলপার সাপোর্ট' : 'Direct Developer Support'}
                </div>
                <div className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">
                  SoftDows &bull; Ansar Ahammad
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 border-t border-slate-200/50 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between bg-white dark:bg-slate-800/80 p-2 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Phone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">01813011052</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleCopyContact('01813011052', 'phone1')}
                    className="p-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                    title="Copy Phone"
                  >
                    {copiedPhone === 'phone1' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <a
                    href="tel:01813011052"
                    className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px]"
                  >
                    {isBn ? 'কল' : 'Call'}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 text-[11px] justify-between text-slate-600 dark:text-slate-400">
                <a
                  href="https://chat.whatsapp.com/HCpCjSpDapk2fipq1BB9zi"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>হোয়াটসঅ্যাপ</span>
                </a>
                <button
                  onClick={() => setActiveTab('about')}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                >
                  <span>{isBn ? 'বিস্তারিত পরিচিতি' : 'Full About'}</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Category Content */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Tab Subtitle Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-200 dark:border-indigo-800">
                <currentTabInfo.icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {isBn ? currentTabInfo.labelBn : currentTabInfo.labelEn}
                </h2>
                <p className="text-xs text-slate-500">
                  {isBn ? currentTabInfo.descBn : currentTabInfo.descEn}
                </p>
              </div>
            </div>
          </div>

          {/* TAB 1: Database & Backup */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              {/* Storage & Engine Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {isBn ? 'মোট শিক্ষার্থী' : 'Total Students'}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                    {students?.length || 0} <span className="text-xs font-normal text-slate-400">জন</span>
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {isBn ? 'একাডেমিক শ্রেণী' : 'Academic Classes'}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                    {academicClasses?.length || 0} <span className="text-xs font-normal text-slate-400">টি</span>
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {isBn ? 'স্টোরেজ ইঞ্জিন' : 'Storage Engine'}
                  </span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>IndexedDB + Cache</span>
                  </span>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    {isBn ? 'প্রতিষ্ঠানের নাম' : 'Institution'}
                  </span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-2 truncate block">
                    {institution?.name || 'Adarsha High School'}
                  </span>
                </div>
              </div>

              {/* Backup & Restore Operation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Backup Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <Download className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                          {isBn ? 'সম্পূর্ণ ডাটাবেজ ব্যাকআপ' : 'Full Database Backup'}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {isBn ? 'JSON এক্সপোর্ট' : 'JSON Export'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {isBn 
                        ? 'এক ক্লিকে সমস্ত শিক্ষার্থীর তথ্য, প্রশংসা পত্রের রেকর্ড, ফলাফল ও প্রতিষ্ঠান সেটিংস সুরক্ষিত JSON ব্যাকআপ ফাইল হিসেবে ডাউনলোড করুন।'
                        : 'Export complete student registry, certificates, and school parameters into a portable backup file.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleDownloadBackup}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isBn ? 'ব্যাকআপ ডাউনলোড (JSON)' : 'Download Backup File'}</span>
                    </button>
                  </div>
                </div>

                {/* Restore Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                          {isBn ? 'ডাটাবেজ রিস্টোর / ইম্পোর্ট' : 'Database Restore / Import'}
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          {isBn ? 'JSON থেকে পুনরুদ্ধার' : 'Restore from JSON'}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {isBn
                        ? 'যেকোনো কম্পিউটারে বা সফটওয়্যার আপডেটের পর পূর্বে ডাউনলোড করা ব্যাকআপ ফাইলটি সিলেক্ট করলে নিমেষেই সমস্ত তথ্য পুনরুদ্ধার হবে।'
                        : 'Select your previously exported backup JSON file to instantly reconstruct your institution database and student records.'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept=".json" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isBn ? 'ব্যাকআপ ফাইল সিলেক্ট করুন' : 'Select Backup JSON'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Developer & About Profile Showcase on Main Page */}
              <div className="bg-gradient-to-br from-white via-indigo-50/30 to-amber-50/20 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                          {isBn ? 'ডেভেলপার ও সিস্টেম পরিচিতি' : 'Developer & System Overview'}
                        </h3>
                        <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          SoftDows Verified
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isBn ? 'বিদ্যালোক প্ল্যাটফর্মের প্রস্তুতকারক, কারিগরি সহায়তা ও উপদেষ্টা পরিচিতি' : 'Creator, educational advisory, and dedicated helpline channels'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('about')}
                    className="self-start sm:self-auto text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <span>{isBn ? 'পূর্ণাঙ্গ প্রোফাইল দেখুন' : 'View Full Details'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Grid of Cards for Main Page */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lead Developer Card */}
                  <div className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/90 rounded-xl p-4.5 shadow-sm flex flex-col justify-between space-y-3.5">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-black text-xl shadow-sm shrink-0">
                            A
                          </div>
                          <div>
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                              <Sparkles className="w-3 h-3" />
                              <span>{isBn ? 'প্রধান ডেভেলপার ও প্রতিষ্ঠাতা' : 'Lead Developer & Founder'}</span>
                            </div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                              Ansar Ahammad
                            </h4>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              SoftDows
                            </p>
                          </div>
                        </div>
                        <span className="bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          Author
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {/* Phone */}
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                          <div className="flex items-center gap-2 min-w-0">
                            <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="text-slate-600 dark:text-slate-400">{isBn ? 'হটলাইন:' : 'Phone:'}</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">01813011052</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCopyContact('01813011052', 'phone1')}
                              className="p-1 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 border border-slate-200 dark:border-slate-700"
                              title="Copy Phone"
                            >
                              {copiedPhone === 'phone1' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <a
                              href="tel:01813011052"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm transition-all"
                            >
                              {isBn ? 'কল করুন' : 'Call'}
                            </a>
                          </div>
                        </div>

                        {/* Email */}
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                          <div className="flex items-center gap-2 min-w-0">
                            <Mail className="w-4 h-4 text-sky-500 shrink-0" />
                            <span className="font-medium text-slate-700 dark:text-slate-300 truncate">ahammadansar75@gmail.com</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCopyContact('ahammadansar75@gmail.com', 'email')}
                              className="p-1 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 border border-slate-200 dark:border-slate-700"
                              title="Copy Email"
                            >
                              {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <a
                              href="mailto:ahammadansar75@gmail.com"
                              className="bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm transition-all"
                            >
                              {isBn ? 'ইমেইল' : 'Email'}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social links */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-[11px] flex-wrap">
                      <a
                        href="https://chat.whatsapp.com/HCpCjSpDapk2fipq1BB9zi"
                        target="_blank"
                        rel="noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>হোয়াটসঅ্যাপ</span>
                      </a>
                      <a
                        href="https://www.facebook.com/biddaloklive/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        <span>ফেসবুক পেইজ</span>
                      </a>
                      <a
                        href="https://www.facebook.com/groups/biddalok"
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        <span>গ্রুপ</span>
                      </a>
                    </div>
                  </div>

                  {/* Concept & Educational Advisor Card */}
                  <div className="bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/90 rounded-xl p-4.5 shadow-sm flex flex-col justify-between space-y-3.5">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                              <HeartHandshake className="w-3 h-3" />
                              <span>{isBn ? 'সার্বিক সহযোগিতা ও আইডিয়া' : 'Concept & Cooperation'}</span>
                            </div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                              মোঃ খায়রুল আলম
                            </h4>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              সিনিয়র শিক্ষক, আজিয়ারা উচ্চ বিদ্যালয়
                            </p>
                          </div>
                        </div>
                        <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          Advisor
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {/* Phone */}
                        <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800">
                          <div className="flex items-center gap-2 min-w-0">
                            <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                            <span className="text-slate-600 dark:text-slate-400">{isBn ? 'মোবাইল:' : 'Phone:'}</span>
                            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">01822801957</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCopyContact('01822801957', 'phone2')}
                              className="p-1 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 border border-slate-200 dark:border-slate-700"
                              title="Copy Phone"
                            >
                              {copiedPhone === 'phone2' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <a
                              href="tel:01822801957"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-sm transition-all"
                            >
                              {isBn ? 'কল করুন' : 'Call'}
                            </a>
                          </div>
                        </div>

                        {/* Contribution note */}
                        <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/50 dark:border-emerald-900/40 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {isBn 
                            ? 'বিদ্যালোক প্ল্যাটফর্মের প্র্যাক্টিক্যাল স্কুল ম্যানেজমেন্ট ফিচার ও প্রত্যয়ন/প্রশংসাপত্র সনদের কাঠামোগত পরিকল্পনায় বিশেষ অবদানের জন্য কৃতজ্ঞতা।'
                            : 'Special gratitude for educational domain advisory and certificate template workflow structuring.'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{isBn ? 'একাডেমিক কাঠামো ও পরামর্শ' : 'Academic Structure'}</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">আজিয়ারা উচ্চ বিদ্যালয়</span>
                    </div>
                  </div>
                </div>

                {/* Software Platform Summary Banner */}
                <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100">
                        {isBn ? 'বিদ্যালোক - স্মার্ট স্কুল ম্যানেজমেন্ট ও প্রশংসাপত্র স্যুট' : 'Biddalok Smart School & Certificate Automation Suite'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {isBn ? 'সম্পূর্ণ অফলাইন-ফার্স্ট স্পিড, লোকাল এনক্রিপশন ও সফটডাউস লাইফটাইম সাপোর্ট' : 'Offline-first speed, local encryption, lifetime support'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-indigo-400 font-bold bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                      v{packageJson.version}
                    </span>
                    <a
                      href={GITHUB_REPO_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <span>GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Admin Password Changer */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      <Key className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                        {isBn ? 'অ্যাডমিন পাসওয়ার্ড পরিবর্তন' : 'Admin Password Management'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isBn ? `বর্তমান ইউজার: ${adminUser || 'Admin'}` : `Logged in as: ${adminUser || 'Admin'}`}
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-[11px] px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    SHA-256
                  </span>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-3.5">
                  {passwordStatus.type !== 'idle' && (
                    <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                      passwordStatus.type === 'success' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                        : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                    }`}>
                      {passwordStatus.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      )}
                      <span>{passwordStatus.msg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isBn ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'} *
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'} *
                      </label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isBn ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'} *
                      </label>
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isChangingPass}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" />
                      <span>
                        {isChangingPass 
                          ? (isBn ? 'পরিবর্তন হচ্ছে...' : 'Updating...') 
                          : (isBn ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Password')}
                      </span>
                    </button>
                  </div>
                </form>
              </div>

              {/* SoftDows Emergency Support OTP Generator Tool */}
              <div className="bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm sm:text-base">
                        {isBn ? 'সাপোর্ট টুল: ইমার্জেন্সি ওটিপি জেনারেটর' : 'SoftDows Emergency Recovery Tool'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {isBn 
                          ? 'গ্রাহক পাসওয়ার্ড ভুলে গেলে দেওয়া চ্যালেঞ্জ কোড দিয়ে আনলক ওটিপি বের করুন।'
                          : 'Generate 6-digit emergency unlock OTP from client\'s challenge code.'}
                      </p>
                    </div>
                  </div>
                  <span className="bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 text-[11px] px-2.5 py-1 rounded-full font-mono">
                    Recovery Engine
                  </span>
                </div>

                <form onSubmit={handleGenerateSupportOtp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      {isBn ? 'গ্রাহকের চ্যালেঞ্জ কোড (Challenge Code)' : 'Client Challenge Code'} *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={calcChallengeInput}
                        onChange={e => setCalcChallengeInput(e.target.value)}
                        placeholder="e.g. BD-106103-270826"
                        className="flex-1 px-3 py-2 text-xs sm:text-sm bg-slate-800 border border-slate-700 rounded-xl text-white font-mono placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition-all flex items-center gap-1.5 whitespace-nowrap"
                      >
                        <Key className="w-3.5 h-3.5" />
                        <span>{isBn ? 'জেনারেট' : 'Calculate'}</span>
                      </button>
                    </div>
                  </div>

                  {generatedSupportOtp && (
                    <div className="bg-slate-800/80 border border-indigo-500/40 rounded-xl p-3.5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-bold">
                          {isBn ? 'গ্রাহককে দেওয়ার জন্য আনলক ওটিপি:' : '6-Digit Unlock OTP for Client:'}
                        </span>
                        <span className="text-xl font-mono font-extrabold text-emerald-400 tracking-widest mt-0.5 block">
                          {generatedSupportOtp}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(generatedSupportOtp);
                          setCopiedGeneratedOtp(true);
                          setTimeout(() => setCopiedGeneratedOtp(false), 2000);
                        }}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        {copiedGeneratedOtp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedGeneratedOtp ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি ওটিপি' : 'Copy')}</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}

          {/* TAB 3: Updates & Releases */}
          {activeTab === 'updates' && (
            <div className="space-y-5">
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] px-2.5 py-0.5 rounded-full font-semibold mb-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        {isBn ? 'সেন্ট্রাল অটো-আপডেট ইঞ্জিন' : 'Central In-App Update Engine'}
                      </div>
                      <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                        <span>{isBn ? 'GitHub রিলিজ ও ইন-অ্যাপ আপডেট' : 'GitHub Releases & Live Update'}</span>
                        <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded-md text-slate-300">v{currentVersion}</span>
                      </h2>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {isBn 
                      ? 'নতুন কোনো আপডেট আসলে GitHub থেকে স্বয়ংক্রিয়ভাবে নোটিফিকেশন পাবেন এবং আপনার ডাটাবেজের সমস্ত শিক্ষার্থী ও সার্টিফিকেটের কোনো তথ্য নষ্ট না করে সরাসরি ইন-অ্যাপ আপডেট করা যাবে।'
                      : 'Checks GitHub repo for new releases automatically. Update in-place with zero data loss or preview the Windows desktop installer.'}
                  </p>

                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <button
                      onClick={openUpdateModal}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                      <span>{isBn ? 'আপডেট মোডাল খুলুন' : 'Open Update Studio'}</span>
                    </button>

                    <button
                      onClick={() => setIsInstallerModalOpen(true)}
                      className="bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs sm:text-sm font-semibold py-2.5 px-4 rounded-xl border border-white/15 transition-all flex items-center gap-2"
                    >
                      <Laptop className="w-4 h-4 text-slate-300" />
                      <span>{isBn ? 'ডেস্কটপ ইন্সটলার UI' : 'Installer UI'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* GitHub Official Repo Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      {isBn ? 'অফিসিয়াল রিপোজিটরি ঠিকানা' : 'Official GitHub Repository'}
                    </span>
                    <span className="font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {GITHUB_REPO_OWNER}/{GITHUB_REPO_NAME}
                    </span>
                  </div>
                </div>

                <a
                  href={GITHUB_REPO_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  <span>{isBn ? 'গিটহাব পেজ দেখুন' : 'View on GitHub'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {/* TAB 4: Additional System Admin Modules */}
          {activeTab === 'modules' && (
            <div className="space-y-4">
              <SubModuleGrid
                titleEn=""
                titleBn=""
                descriptionEn=""
                descriptionBn=""
                modules={systemModules.filter(m => m.id !== 'backup')}
              />
            </div>
          )}

          {/* TAB 5: Developer & About Credits */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* Top Developer & SoftDows Hero Card */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-lg border border-white/20 shrink-0">
                        A
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] px-2.5 py-0.5 rounded-full font-semibold mb-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>SoftDows Official Software Suite</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                          <span>Ansar Ahammad</span>
                          <span className="text-xs font-mono font-normal bg-white/10 px-2 py-0.5 rounded-md text-slate-300">Lead Architect</span>
                        </h2>
                        <p className="text-xs text-amber-200/90 font-medium">Founder & Principal Developer, SoftDows</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href="tel:01813011052"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-all flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{isBn ? 'সরাসরি কল' : 'Call Now'}</span>
                      </a>
                      <a
                        href="https://chat.whatsapp.com/HCpCjSpDapk2fipq1BB9zi"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-emerald-700/60 hover:bg-emerald-700 text-emerald-100 border border-emerald-500/40 font-bold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
                    {isBn 
                      ? 'বিদ্যালোক (Biddalok) হলো দেশের প্রাথমিক, মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষাপ্রতিষ্ঠানসমূহের জন্য প্রস্তুতকৃত আধুনিক, অফলাইন-ফার্স্ট এবং স্বয়ংক্রিয় প্রত্যয়ন/প্রশংসাপত্র তৈরি ও ছাত্র-ছাত্রী তথ্য সংরক্ষণ ব্যবস্থা। যেকোনো কারিগরি পরামর্শ ও সহায়তায় আমরা সার্বক্ষণিক পাশে আছি।'
                      : 'Biddalok is an offline-first, high-speed institution management and certificate automation platform designed for modern schools and colleges.'}
                  </p>
                </div>
              </div>

              {/* Detailed Grid: Developer & Educational Consultant */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Developer Profile & Contact Details */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Ansar Ahammad</h3>
                        <p className="text-xs text-slate-500">ডেভেলপার ও প্রতিষ্ঠাতা, SoftDows</p>
                      </div>
                    </div>
                    <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] px-2.5 py-1 rounded-full font-bold">
                      Creator
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {/* Hotline Phone */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">{isBn ? 'সাপোর্ট হটলাইন' : 'Direct Helpline'}</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">01813011052</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyContact('01813011052', 'phone1')}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 border border-slate-200 dark:border-slate-600 transition-colors"
                          title="Copy Phone"
                        >
                          {copiedPhone === 'phone1' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <a
                          href="tel:01813011052"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
                        >
                          {isBn ? 'কল' : 'Call'}
                        </a>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Mail className="w-4 h-4 text-sky-500 shrink-0" />
                        <div className="min-w-0">
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">{isBn ? 'অফিসিয়াল ইমেইল' : 'Support Email'}</span>
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate block text-xs">ahammadansar75@gmail.com</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyContact('ahammadansar75@gmail.com', 'email')}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 border border-slate-200 dark:border-slate-600 transition-colors"
                          title="Copy Email"
                        >
                          {copiedEmail ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <a
                          href="mailto:ahammadansar75@gmail.com"
                          className="bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
                        >
                          {isBn ? 'মেইল' : 'Mail'}
                        </a>
                      </div>
                    </div>

                    {/* Community Channels */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/60 dark:border-slate-700/60 space-y-2">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">{isBn ? 'কমিউনিটি ও সোশ্যাল চ্যানেল' : 'Official Channels'}</span>
                      <div className="flex items-center gap-3 text-xs flex-wrap font-bold">
                        <a
                          href="https://chat.whatsapp.com/HCpCjSpDapk2fipq1BB9zi"
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>হোয়াটসঅ্যাপ কমিউনিটি</span>
                        </a>
                        <span>&bull;</span>
                        <a
                          href="https://www.facebook.com/biddaloklive/"
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>ফেসবুক পেইজ</span>
                        </a>
                        <span>&bull;</span>
                        <a
                          href="https://www.facebook.com/groups/biddalok"
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <span>গ্রুপ</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Concept & Educational Consultant Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">মোঃ খায়রুল আলম</h3>
                        <p className="text-xs text-slate-500">সিনিয়র শিক্ষক, আজিয়ারা উচ্চ বিদ্যালয়</p>
                      </div>
                    </div>
                    <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] px-2.5 py-1 rounded-full font-bold">
                      Advisor
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {/* Advisor Phone */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-semibold block">{isBn ? 'পরামর্শ ও মতামত' : 'Consultant Phone'}</span>
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm">01822801957</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyContact('01822801957', 'phone2')}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 border border-slate-200 dark:border-slate-600 transition-colors"
                          title="Copy Phone"
                        >
                          {copiedPhone === 'phone2' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <a
                          href="tel:01822801957"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition-all"
                        >
                          {isBn ? 'কল' : 'Call'}
                        </a>
                      </div>
                    </div>

                    {/* Academic contribution description */}
                    <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed space-y-2">
                      <div className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>{isBn ? 'সার্বিক সহযোগিতা ও কাঠামোগত আইডিয়া' : 'Academic Advisory'}</span>
                      </div>
                      <p>
                        {isBn 
                          ? 'বিদ্যালোক প্ল্যাটফর্মের প্র্যাক্টিক্যাল স্কুল ম্যানেজমেন্ট ফিচার, ছাত্র-ছাত্রী তথ্য ভাণ্ডার এবং প্রত্যয়ন ও প্রশংসাপত্র সনদের কাঠামোগত পরিকল্পনায় বিশেষ অবদানের জন্য কৃতজ্ঞতা।'
                          : 'Special contribution towards real-world school operations, student data structuring, and academic testimonial formats.'}
                      </p>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
                      <span>{isBn ? 'প্রতিষ্ঠানের নাম:' : 'Institution:'}</span>
                      <strong className="text-slate-900 dark:text-slate-200">আজিয়ারা উচ্চ বিদ্যালয়</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: Maintenance & Reset (Danger Zone) */}
          {activeTab === 'maintenance' && (
            <div className="space-y-5">
              {/* Default Sample Reset Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-slate-500" />
                    <span>{isBn ? 'ডাটাবেজ ডিফল্ট রিসেট' : 'Reset Database to Default Samples'}</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isBn 
                      ? 'সফটওয়্যারের ডেটা প্রাথমিক ডিফল্ট নমুনা অবস্থায় ফিরিয়ে নিতে চাইলে এটি ব্যবহার করুন।'
                      : 'Restore initial default sample dataset and institution defaults.'}
                  </p>
                </div>
                <button
                  onClick={handleResetData}
                  className="px-3.5 py-2 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl transition-colors shrink-0"
                >
                  {isBn ? 'নমুনা ডেটায় রিসেট' : 'Reset to Samples'}
                </button>
              </div>

              {/* Master Factory Reset Card */}
              <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-200 dark:border-rose-900/50 p-5 sm:p-6 shadow-sm space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-rose-900 dark:text-rose-200">
                      {isBn ? 'মাস্টার ফ্যাক্টরি রিসেট (Erase All Local Data)' : 'Master Factory Reset'}
                    </h3>
                    <p className="text-xs text-rose-700 dark:text-rose-400 mt-1 leading-relaxed">
                      {isBn 
                        ? 'সতর্কতা: এই অপারেশনটি সম্পন্ন করলে ব্রাউজারের লোকাল স্টোরেজ ও IndexedDB সম্পূর্ণ মুছে যাবে। রিস্টোর করার জন্য পূর্বে ব্যাকআপ ফাইল রাখা আবশ্যক।'
                        : 'Warning: This will completely wipe all students, testimonials, and institution credentials from this machine.'}
                    </p>
                  </div>
                </div>

                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-2"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>{isBn ? 'ফ্যাক্টরি রিসেট শুরু করুন' : 'Initiate Factory Reset'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Confirmation Modal for Factory Reset */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {isBn ? 'আপনি কি নিশ্চিত?' : 'Are you completely sure?'}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {isBn 
                ? 'সমস্ত শিক্ষার্থী ও প্রশংসাপত্রের রেকর্ড এবং কাস্টম সেটিংস চিরতরে মুছে যাবে। আপনি কি নিশ্চিত?' 
                : 'All local student database and cached files will be permanently erased. Proceed?'}
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={executeMasterFactoryReset}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow"
              >
                {isBn ? 'হ্যাঁ, সম্পূর্ণ মুছে ফেলুন' : 'Yes, Wipe Everything'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Installer Preview Modal */}
      <DesktopInstallerModal
        isOpen={isInstallerModalOpen}
        onClose={() => setIsInstallerModalOpen(false)}
      />
    </div>
  );
};

export default SystemAdmin;
