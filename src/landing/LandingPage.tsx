import React, { useState, useId } from 'react';
import {
  Download,
  LogIn,
  ShieldCheck,
  Award,
  HardDrive,
  FileSpreadsheet,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Laptop,
  Globe,
  Database,
  Lock,
  ArrowRight,
  HelpCircle,
  Sparkles,
  Printer,
  QrCode,
  Users,
  Menu,
  X,
  CreditCard,
  FileText,
  Sliders,
  RefreshCw,
  Clock,
  Layers,
  ChevronDown,
  Check,
  Eye,
  FileCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdSenseBanner } from '../components/ads/AdSenseBanner';

type ThemeMode = 'day' | 'sepia' | 'dark';

export const LandingPage: React.FC = () => {
  // Theme & Accessibility States
  const [themeMode, setThemeMode] = useState<ThemeMode>('day');
  const [fontScale, setFontScale] = useState<number>(1.0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [releaseNotesOpen, setReleaseNotesOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Live Interactive ID Card Studio States
  const [idStudentName, setIdStudentName] = useState('মুহাম্মাদ তানভীর হাসান');
  const [idStudentClass, setIdStudentClass] = useState('দশম (বিজ্ঞান শাখা)');
  const [idStudentRoll, setIdStudentRoll] = useState('০১');
  const [idStudentId, setIdStudentId] = useState('STD-2026-0104');
  const [idStudentBlood, setIdStudentBlood] = useState('B+ (পজিটিভ)');
  const [idPhotoShape, setIdPhotoShape] = useState<'rounded' | 'circle' | 'square'>('rounded');
  const [idCardTheme, setIdCardTheme] = useState<'emerald' | 'blue' | 'maroon' | 'navy'>('emerald');
  const [idCardSide, setIdCardSide] = useState<'front' | 'back'>('front');

  // Savings Calculator States
  const [studentCount, setStudentCount] = useState<number>(550);

  // Command Center Hero Preview Tab
  const [heroActiveTab, setHeroActiveTab] = useState<'scholarship' | 'idcard' | 'result'>('scholarship');

  // Official GitHub Windows Setup Release link
  const desktopDownloadUrl = "https://github.com/nicetrix/biddalok/releases/latest";

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  // Dynamic calculations for the ROI Calculator
  const idCardPrintSavings = Math.round(studentCount * 75); // ৳75 per PVC card saved vs outside vendors
  const hoursSavedPerYear = Math.round(studentCount * 0.28 + 45); // automated scholarship, admit card, tabulation
  const paperworkReductionPercent = 95;

  // Theme variable definitions
  const themeStyles = {
    day: {
      '--bg-primary': '#F5F9F6',
      '--bg-secondary': '#EBF3ED',
      '--bg-surface': '#FFFFFF',
      '--bg-surface-muted': '#F0F6F2',
      '--text-primary': '#0F291E',
      '--text-secondary': '#355245',
      '--text-muted': '#5A7669',
      '--border-soft': '#D5E4DA',
      '--border-strong': '#B6CFC0',
      '--accent-primary': '#059669',
      '--accent-primary-hover': '#047857',
      '--accent-soft': '#D1FAE5',
      '--accent-warm': '#D97706',
    },
    sepia: {
      '--bg-primary': '#FAF5EA',
      '--bg-secondary': '#F2E9D6',
      '--bg-surface': '#FFFDF8',
      '--bg-surface-muted': '#F6EFE0',
      '--text-primary': '#261F14',
      '--text-secondary': '#4D4232',
      '--text-muted': '#756853',
      '--border-soft': '#E5D9C3',
      '--border-strong': '#CFC0A4',
      '--accent-primary': '#0D7A5F',
      '--accent-primary-hover': '#095C47',
      '--accent-soft': '#D7EFE7',
      '--accent-warm': '#B45309',
    },
    dark: {
      '--bg-primary': '#0B1813',
      '--bg-secondary': '#10231C',
      '--bg-surface': '#152D24',
      '--bg-surface-muted': '#1B382D',
      '--text-primary': '#ECF6F1',
      '--text-secondary': '#B8D4C6',
      '--text-muted': '#82A695',
      '--border-soft': '#234739',
      '--border-strong': '#2E5C4A',
      '--accent-primary': '#10B981',
      '--accent-primary-hover': '#059669',
      '--accent-soft': 'rgba(16, 185, 129, 0.18)',
      '--accent-warm': '#F59E0B',
    }
  }[themeMode];

  // Card theme header gradients
  const cardGradients = {
    emerald: 'from-emerald-700 via-teal-800 to-emerald-900',
    blue: 'from-blue-700 via-indigo-800 to-blue-900',
    maroon: 'from-rose-800 via-red-900 to-rose-950',
    navy: 'from-slate-800 via-slate-900 to-sky-950'
  }[idCardTheme];

  return (
    <div
      style={themeStyles as React.CSSProperties}
      className={`min-h-screen transition-colors duration-300 antialiased font-sans selection:bg-emerald-600 selection:text-white ${
        themeMode === 'dark' ? 'dark' : ''
      }`}
    >
      <style>{`
        .biddalok-dynamic-root {
          font-size: calc(16px * ${fontScale});
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }
        .theme-surface {
          background-color: var(--bg-surface);
          border-color: var(--border-soft);
        }
        .theme-surface-muted {
          background-color: var(--bg-surface-muted);
          border-color: var(--border-soft);
        }
        .theme-text-primary { color: var(--text-primary); }
        .theme-text-secondary { color: var(--text-secondary); }
        .theme-text-muted { color: var(--text-muted); }
        .theme-border { border-color: var(--border-soft); }
        
        .btn-comfort-primary {
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-primary-hover) 100%);
          color: #FFFFFF;
          box-shadow: 0 8px 22px -4px rgba(5, 150, 105, 0.35);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-comfort-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px -4px rgba(5, 150, 105, 0.45);
        }
        
        @keyframes gentlePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.6; }
        }
        .pulse-gentle {
          animation: gentlePulse 2.4s infinite ease-in-out;
        }
      `}</style>

      <div className="biddalok-dynamic-root min-h-screen flex flex-col justify-between">
        
        {/* ===================================================================== */}
        {/* TOP BAR: ANNOUNCEMENT & EYE-COMFORT THEME CONTROLS                    */}
        {/* ===================================================================== */}
        <aside aria-label="রিলিজ ঘোষণা ও আই-কমফোর্ট সেটিংস" className="bg-[var(--bg-secondary)] border-b theme-border text-xs sm:text-sm py-2 px-4 transition-colors">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            
            {/* Left: Official GitHub Release Announcement */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-700 text-white shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-300 pulse-gentle"></span>
                Official GitHub Release
              </span>
              <span className="font-bold theme-text-primary">Biddalok Setup 1.1.0 (.exe)</span>
              <span className="hidden md:inline theme-text-muted">• রাজস্ব খাতভুক্ত বৃত্তি ফরম ও CR-80 আইডি কার্ড সংস্করণ</span>
              <button
                type="button"
                onClick={() => setReleaseNotesOpen(true)}
                className="underline font-bold text-emerald-700 dark:text-emerald-400 hover:opacity-80 ml-1 cursor-pointer"
              >
                রিলিজ নোটস দেখুন →
              </button>
            </div>

            {/* Right: Eye-Comfort Controls (Theme + Font Scale) */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Theme Mode Buttons */}
              <div className="flex items-center gap-1 theme-surface border theme-border rounded-full p-0.5 text-xs shadow-2xs">
                <button
                  type="button"
                  onClick={() => setThemeMode('day')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    themeMode === 'day'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'theme-text-secondary hover:opacity-80'
                  }`}
                  title="প্রশান্ত দিন (Biophilic Eye-Comfort)"
                >
                  🌿 প্রশান্ত দিন
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('sepia')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    themeMode === 'sepia'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'theme-text-secondary hover:opacity-80'
                  }`}
                  title="পাঠাগার মোড (Warm Sepia Eye-Care)"
                >
                  📖 পাঠাগার মোড
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('dark')}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer ${
                    themeMode === 'dark'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'theme-text-secondary hover:opacity-80'
                  }`}
                  title="স্নিগ্ধ রাত (Calm Midnight Pine)"
                >
                  🌙 স্নিগ্ধ রাত
                </button>
              </div>

              {/* Font Scale Buttons */}
              <div className="hidden sm:flex items-center gap-1 theme-surface border theme-border rounded-full px-2 py-0.5 text-xs">
                <span className="theme-text-muted mr-1 font-medium">ফন্ট:</span>
                <button
                  type="button"
                  onClick={() => setFontScale(0.94)}
                  className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${fontScale === 0.94 ? 'bg-emerald-500/20 text-emerald-700' : 'theme-text-secondary'}`}
                  title="ছোট ফন্ট"
                >
                  অ-
                </button>
                <button
                  type="button"
                  onClick={() => setFontScale(1.0)}
                  className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${fontScale === 1.0 ? 'bg-emerald-500/20 text-emerald-700' : 'theme-text-secondary'}`}
                  title="স্বাভাবিক ফন্ট"
                >
                  অ
                </button>
                <button
                  type="button"
                  onClick={() => setFontScale(1.08)}
                  className={`px-1.5 py-0.5 rounded font-bold cursor-pointer ${fontScale === 1.08 ? 'bg-emerald-500/20 text-emerald-700' : 'theme-text-secondary'}`}
                  title="বড় ফন্ট"
                >
                  অ+
                </button>
              </div>
            </div>

          </div>
        </aside>

        {/* ===================================================================== */}
        {/* STICKY GLASSMORPHIC NAVIGATION                                        */}
        {/* ===================================================================== */}
        <header className="sticky top-0 z-40 bg-[var(--bg-surface)]/95 backdrop-blur-md border-b theme-border transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            
            {/* Left: Custom SVG Shield Emblem & Identity */}
            <a href="#hero" className="flex items-center gap-3 group focus:outline-hidden">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 p-0.5 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
                <svg className="w-10 h-10 text-white" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  {/* Shield Base */}
                  <path d="M32 6L10 15V31C10 45.5 19.4 55.8 32 60C44.6 55.8 54 45.5 54 31V15L32 6Z" fill="#064E3B" stroke="#A7F3D0" strokeWidth="2.5"/>
                  {/* Rising Sun of Wisdom */}
                  <circle cx="32" cy="24" r="6" fill="#FBBF24"/>
                  <path d="M32 14V16M23 18L24.5 19.5M41 18L39.5 19.5M20 24H22M42 24H44" stroke="#FDE68A" strokeWidth="2" strokeLinecap="round"/>
                  {/* Open Book */}
                  <path d="M18 30C22.5 28.5 27.5 29.5 32 32C36.5 29.5 41.5 28.5 46 30V43C41.5 41.5 36.5 42.5 32 45C27.5 42.5 22.5 41.5 18 43V30Z" fill="#ECFDF5" stroke="#34D399" strokeWidth="1.8" strokeLinejoin="round"/>
                  <path d="M32 32V45" stroke="#059669" strokeWidth="2"/>
                  {/* Nature Leaf Curve */}
                  <path d="M23 49C28 52 36 52 41 49" stroke="#6EE7B7" strokeWidth="2.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight theme-text-primary">বিদ্যালোক</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                    v1.1.0
                  </span>
                </div>
                <p className="text-xs theme-text-muted font-semibold">NiceTrix প্ল্যাটফর্ম • SoftDows এক্সপেরিয়েন্স</p>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-sm font-bold theme-text-secondary">
              <a href="#features" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors py-1">ফিচারসমূহ</a>
              <a href="#id-studio" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors py-1 flex items-center gap-1.5">
                <span>CR-80 আইডি স্টুডিও</span>
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 font-extrabold uppercase">লাইভ</span>
              </a>
              <a href="#security" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors py-1">ডাটা নিরাপত্তা</a>
              <a href="#desktop" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors py-1">ডেস্কটপ বনাম ক্লাউড</a>
              <a href="#calculator" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors py-1">সাশ্রয় ক্যালকুলেটর</a>
              <a href="#faq" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors py-1">প্রশ্নোত্তর</a>
              <Link to="/about" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors py-1">পরিচিতি</Link>
            </nav>

            {/* Right: Actions */}
            <div className="hidden sm:flex items-center gap-3">
              <a
                href={desktopDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl text-xs font-bold theme-surface border theme-border theme-text-primary hover:border-emerald-600 transition-all flex items-center gap-2 shadow-2xs cursor-pointer"
                title="উইন্ডোজ পিসির জন্য মূল ইন্সটলার ডাউনলোড করুন"
              >
                <Download className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>পিসি ইনস্টলার (.exe)</span>
              </a>

              <Link
                to="/app"
                className="btn-comfort-primary px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-md cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>লগইন / ক্লাউড পোর্টাল</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl theme-surface border theme-border theme-text-primary focus:outline-hidden"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>

          {/* Mobile Collapsible Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t theme-border theme-surface px-4 pt-3 pb-5 space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm font-bold">
                <a
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg theme-surface-muted theme-text-primary flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-600" /> ফিচারসমূহ
                </a>
                <a
                  href="#id-studio"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg theme-surface-muted theme-text-primary flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4 text-emerald-600" /> CR-80 স্টুডিও
                </a>
                <a
                  href="#security"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg theme-surface-muted theme-text-primary flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> ডাটা গার্ড
                </a>
                <a
                  href="#desktop"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg theme-surface-muted theme-text-primary flex items-center gap-2"
                >
                  <Laptop className="w-4 h-4 text-emerald-600" /> ডেস্কটপ অ্যাপ
                </a>
                <a
                  href="#calculator"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg theme-surface-muted theme-text-primary flex items-center gap-2"
                >
                  <Sliders className="w-4 h-4 text-emerald-600" /> সাশ্রয় ক্যালকুলেটর
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg theme-surface-muted theme-text-primary flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4 text-emerald-600" /> প্রশ্নোত্তর
                </a>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-lg theme-surface-muted theme-text-primary col-span-2 flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-emerald-600" /> আমাদের সম্পর্কে (NiceTrix & SoftDows)
                </Link>
              </div>
              <div className="flex gap-2 pt-2">
                <a
                  href={desktopDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs theme-surface-muted border theme-border theme-text-primary flex items-center justify-center gap-1.5"
                >
                  <Download className="w-4 h-4 text-emerald-600" /> পিসি সংস্করণ
                </a>
                <Link
                  to="/app"
                  className="flex-1 py-2.5 rounded-xl font-black text-xs btn-comfort-primary flex items-center justify-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" /> ক্লাউড পোর্টাল
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* ===================================================================== */}
        {/* 1. HERO SECTION: VALUE PROPOSITION & COMMAND CENTER PREVIEW           */}
        {/* ===================================================================== */}
        <section id="hero" className="relative pt-10 pb-16 lg:pt-16 lg:pb-24 overflow-hidden border-b theme-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              
              {/* Left Column: Headings, Reassurances, Dual CTAs */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Official Pill Badge */}
                <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full theme-surface border theme-border shadow-2xs">
                  <span className="px-2 py-0.5 text-xs font-black rounded-full bg-emerald-700 text-white">v1.1.0</span>
                  <span className="text-xs sm:text-sm font-bold theme-text-secondary">
                    Official GitHub Release • <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">Biddalok Setup 1.1.0</span>
                  </span>
                </div>

                {/* Master Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-black theme-text-primary tracking-tight leading-[1.3]">
                  শিক্ষা প্রতিষ্ঠান পরিচালনা ও শিক্ষার্থী ব্যবস্থাপনার
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-teal-700 to-amber-700">
                    আধুনিক ও প্রশান্ত বাংলা প্ল্যাটফর্ম
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg theme-text-secondary leading-[1.8] max-w-2xl font-medium">
                  শিক্ষা প্রতিষ্ঠানের দৈনন্দিন কার্যক্রম, শিক্ষার্থী ও শিক্ষক MIS, অটোমেটেড রিপোর্ট জেনারেশন এবং আন্তর্জাতিক মানের <strong className="theme-text-primary font-bold">স্ট্যান্ডার্ড CR-80 (54mm × 85.6mm)</strong> পিভিসি আইডি কার্ড, প্রবেশপত্র ও সরকারি রাজস্ব খাতভুক্ত বৃত্তি ফরম—সবকিছু এখন এক ছাদের নিচে। অনলাইন ওয়েব পোর্টাল এবং অফলাইন উইন্ডোজ ডেস্কটপ অ্যাপের এক অনন্য সমন্বয়।
                </p>

                {/* Dual Primary Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {/* Primary CTA: Windows Desktop Installer */}
                  <a
                    href={desktopDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-comfort-primary px-6 py-4 rounded-2xl text-base font-black flex items-center gap-3.5 cursor-pointer shadow-lg hover:shadow-xl transition-all"
                  >
                    <Download className="w-6 h-6 shrink-0" />
                    <div className="text-left">
                      <div className="leading-tight">ডেস্কটপ অ্যাপ ইনস্টলার (.exe)</div>
                      <div className="text-[11px] font-normal text-emerald-100">Windows 10/11 (৬৪-বিট) • Biddalok 1.1.0</div>
                    </div>
                  </a>

                  {/* Secondary CTA: Web Cloud Portal */}
                  <Link
                    to="/app"
                    className="px-6 py-4 rounded-2xl text-base font-bold theme-surface border-2 theme-border hover:border-emerald-600 theme-text-primary transition-all flex items-center gap-3.5 shadow-2xs"
                  >
                    <Globe className="w-6 h-6 text-emerald-700 dark:text-emerald-400 shrink-0" />
                    <div className="text-left">
                      <div className="leading-tight">ওয়েব পোর্টাল অ্যাক্সেস</div>
                      <div className="text-[11px] font-normal theme-text-muted">অনলাইন ক্লাউড সংস্করণ ও সরাসরি ব্যবহার</div>
                    </div>
                  </Link>
                </div>

                {/* 3 Signature Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl theme-surface border theme-border shadow-2xs">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                    <div>
                      <div className="text-xs sm:text-sm font-bold theme-text-primary">স্ট্যান্ডার্ড CR-80 সাইজ</div>
                      <div className="text-xs theme-text-muted">নিখুঁত 54mm × 85.6mm পিভিসি আইডি কার্ড সাপোর্ট</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl theme-surface border theme-border shadow-2xs">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                    <div>
                      <div className="text-xs sm:text-sm font-bold theme-text-primary">অফলাইন ও অনলাইন সংগতি</div>
                      <div className="text-xs theme-text-muted">ইন্টারনেট ছাড়াও নিরবচ্ছিন্ন লোকাল ডাটাবেজ</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl theme-surface border theme-border shadow-2xs">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                    <div>
                      <div className="text-xs sm:text-sm font-bold theme-text-primary">সহজ ও সুরক্ষিত UI</div>
                      <div className="text-xs theme-text-muted">চোখের জন্য আরামদায়ক ও শতভাগ বাংলা ইন্টারফেস</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Interactive Live Command Preview Window */}
              <div className="lg:col-span-5">
                <div className="theme-surface border-2 theme-border rounded-3xl p-4 sm:p-5 shadow-xl relative">
                  
                  {/* Window Bar */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b theme-border">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                      <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold theme-text-secondary ml-1">বিদ্যালোক কমান্ড সেন্টার • v1.1.0</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                      লোকাল + ক্লাউড সিঙ্ক সক্রিয়
                    </span>
                  </div>

                  {/* Tab Selector inside Mockup */}
                  <div className="flex rounded-xl theme-surface-muted p-1 mb-3.5 border theme-border text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setHeroActiveTab('scholarship')}
                      className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                        heroActiveTab === 'scholarship' ? 'bg-white dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shadow-xs' : 'theme-text-muted'
                      }`}
                    >
                      রাজস্ব বৃত্তি ফরম
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroActiveTab('idcard')}
                      className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                        heroActiveTab === 'idcard' ? 'bg-white dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shadow-xs' : 'theme-text-muted'
                      }`}
                    >
                      CR-80 আইডি
                    </button>
                    <button
                      type="button"
                      onClick={() => setHeroActiveTab('result')}
                      className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                        heroActiveTab === 'result' ? 'bg-white dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shadow-xs' : 'theme-text-muted'
                      }`}
                    >
                      গ্রেডিং রেজাল্ট
                    </button>
                  </div>

                  {/* Tab Content Display */}
                  {heroActiveTab === 'scholarship' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                            <FileCheck className="w-4 h-4" /> মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর প্রমিত ফরম
                          </span>
                          <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-bold">স্মার্ট ফিট</span>
                        </div>
                        <p className="theme-text-secondary text-[11px] leading-relaxed">
                          বোর্ডের বৃত্তি প্রাপ্ত শিক্ষার্থীর মৌলিক তথ্য, অভিভাবকের জাতীয় পরিচয়পত্র, ব্যাংক একাউন্ট ও অনলাইন পোর্টাল এন্ট্রি রেকর্ড।
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 rounded-lg theme-surface-muted border theme-border">
                          <div className="text-slate-400 font-semibold text-[10px]">লেআউট মোড</div>
                          <div className="font-bold theme-text-primary">এক পাতা ও দুই পাতা নির্বাচন</div>
                        </div>
                        <div className="p-2.5 rounded-lg theme-surface-muted border theme-border">
                          <div className="text-slate-400 font-semibold text-[10px]">স্বাক্ষর ব্যবস্থা</div>
                          <div className="font-bold theme-text-primary">প্রধান শিক্ষক ও যাচাইকারী</div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 text-center text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        ⚡ এক ক্লিকে অফিশিয়াল PDF ডাউনলোড ও সার্ভার কপি প্রস্তুত
                      </div>
                    </div>
                  )}

                  {heroActiveTab === 'idcard' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-blue-900 dark:text-blue-300 flex items-center gap-1">
                            <CreditCard className="w-4 h-4" /> CR-80 স্ট্যান্ডার্ড কার্ড স্টুডিও
                          </span>
                          <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-bold">54 × 85.6 mm</span>
                        </div>
                        <p className="theme-text-secondary text-[11px] leading-relaxed">
                          স্বয়ংক্রিয় কিউআর কোড, ব্লাড গ্রুপ, প্রধান শিক্ষকের সাক্ষর বক্স এবং নির্ভুল বাংলা-ইংরেজি টাইপোগ্রাফি।
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 rounded-lg theme-surface-muted border theme-border">
                          <div className="text-slate-400 font-semibold text-[10px]">ছবি ও ফ্রেম</div>
                          <div className="font-bold theme-text-primary">গোল, রাউন্ডেড ও চারকোনা</div>
                        </div>
                        <div className="p-2.5 rounded-lg theme-surface-muted border theme-border">
                          <div className="text-slate-400 font-semibold text-[10px]">প্রিন্ট সাপোর্ট</div>
                          <div className="font-bold theme-text-primary">A4 গ্রিড ও ডিরেক্ট পিভিসি</div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl border border-dashed border-blue-500/40 bg-blue-500/5 text-center text-xs font-bold text-blue-900 dark:text-blue-300">
                        🖨️ সামনের ও পেছনের পাশ একসাথে নিখুঁত প্রিন্ট রেজাল্ট
                      </div>
                    </div>
                  )}

                  {heroActiveTab === 'result' && (
                    <div className="space-y-3 animate-fadeIn">
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                            <Award className="w-4 h-4" /> জাতীয় গ্রেডিং ফলাফল ও টেবুলেশন
                          </span>
                          <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-md font-bold">GPA 5.0</span>
                        </div>
                        <p className="theme-text-secondary text-[11px] leading-relaxed">
                          বার্ষিক ও সাময়িক পরীক্ষার নম্বর এন্ট্রি, অটোমেটেড জিপিএ ক্যালকুলেশন, মেধা তালিকা ও প্রগ্রেস রিপোর্ট কার্ড।
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 rounded-lg theme-surface-muted border theme-border">
                          <div className="text-slate-400 font-semibold text-[10px]">প্রবেশপত্র তৈরি</div>
                          <div className="font-bold theme-text-primary">এক ক্লিকে সকল শিক্ষার্থীর</div>
                        </div>
                        <div className="p-2.5 rounded-lg theme-surface-muted border theme-border">
                          <div className="text-slate-400 font-semibold text-[10px]">সিট প্ল্যানিং</div>
                          <div className="font-bold theme-text-primary">রোল ও রুম ভিত্তিক স্বয়ংক্রিয়</div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl border border-dashed border-amber-500/40 bg-amber-500/5 text-center text-xs font-bold text-amber-900 dark:text-amber-300">
                        📈 ভুলহীন স্বয়ংক্রিয় রেজাল্ট শিট ও একাডেমিক ট্রান্সক্রিপ্ট
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SAFE GOOGLE ADSENSE BANNER 1                                          */}
        {/* ===================================================================== */}
        <section aria-label="বিজ্ঞাপন এলাকা" className="max-w-5xl mx-auto px-4 w-full py-4">
          <AdSenseBanner slot="16146828108" minHeight={90} />
        </section>

        {/* ===================================================================== */}
        {/* 2. LIVE INTERACTIVE CR-80 PVC SMART ID CARD STUDIO                    */}
        {/* ===================================================================== */}
        <section id="id-studio" className="py-16 md:py-20 border-b theme-border bg-[var(--bg-secondary)]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <CreditCard className="w-3.5 h-3.5" />
                <span>লাইভ ইন্টারঅ্যাক্টিভ প্রিভিউ স্টুডিও</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black theme-text-primary tracking-tight">
                আন্তর্জাতিক স্ট্যান্ডার্ড CR-80 পিভিসি আইডি কার্ড
              </h2>
              <p className="text-sm sm:text-base theme-text-secondary leading-relaxed font-medium">
                আইডি কার্ড প্রিন্টিংয়ে আর কোনো থার্ড-পার্টির মুখাপেক্ষী হতে হবে না। বিদ্যালয়ের নিজস্ব সাধারণ প্রিন্টার কিংবা পিভিসি কার্ড প্রিন্টারে নিখুঁত মাপের আইডি কার্ড তৈরি করুন নিমিষেই।
              </p>
            </div>

            {/* Interactive Studio Grid: Controls Left, Live Card Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Studio Controls (5 cols) */}
              <div className="lg:col-span-5 theme-surface p-6 rounded-2xl border theme-border shadow-md space-y-4">
                <div className="flex items-center justify-between pb-3 border-b theme-border">
                  <h3 className="font-extrabold text-base theme-text-primary flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>কার্ড কাস্টমাইজেশন টুলস</span>
                  </h3>
                  <div className="flex rounded-lg theme-surface-muted p-0.5 border theme-border text-xs">
                    <button
                      type="button"
                      onClick={() => setIdCardSide('front')}
                      className={`px-3 py-1 rounded-md font-bold cursor-pointer transition-all ${
                        idCardSide === 'front' ? 'bg-emerald-700 text-white shadow-2xs' : 'theme-text-muted'
                      }`}
                    >
                      সামনে
                    </button>
                    <button
                      type="button"
                      onClick={() => setIdCardSide('back')}
                      className={`px-3 py-1 rounded-md font-bold cursor-pointer transition-all ${
                        idCardSide === 'back' ? 'bg-emerald-700 text-white shadow-2xs' : 'theme-text-muted'
                      }`}
                    >
                      পেছনে
                    </button>
                  </div>
                </div>

                {/* Form Controls */}
                <div className="space-y-3 text-xs">
                  <div>
                    <label htmlFor="id-student-name-input" className="block font-bold theme-text-secondary mb-1">শিক্ষার্থীর নাম:</label>
                    <input
                      id="id-student-name-input"
                      type="text"
                      value={idStudentName}
                      onChange={(e) => setIdStudentName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl theme-surface border theme-border theme-text-primary font-semibold focus:outline-emerald-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="id-student-class-input" className="block font-bold theme-text-secondary mb-1">শ্রেণি ও বিভাগ:</label>
                      <input
                        id="id-student-class-input"
                        type="text"
                        value={idStudentClass}
                        onChange={(e) => setIdStudentClass(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl theme-surface border theme-border theme-text-primary font-semibold focus:outline-emerald-600"
                      />
                    </div>
                    <div>
                      <label htmlFor="id-student-roll-input" className="block font-bold theme-text-secondary mb-1">রোল নম্বর:</label>
                      <input
                        id="id-student-roll-input"
                        type="text"
                        value={idStudentRoll}
                        onChange={(e) => setIdStudentRoll(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl theme-surface border theme-border theme-text-primary font-semibold focus:outline-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Photo Frame Style */}
                  <div>
                    <label className="block font-bold theme-text-secondary mb-1.5">ছবির ফ্রেম ও আকার:</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setIdPhotoShape('circle')}
                        className={`py-1.5 px-2 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                          idPhotoShape === 'circle' ? 'bg-emerald-500/20 border-emerald-600 text-emerald-800 dark:text-emerald-300' : 'theme-surface border-slate-200 theme-text-muted'
                        }`}
                      >
                        বৃত্তাকার (Circle)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIdPhotoShape('rounded')}
                        className={`py-1.5 px-2 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                          idPhotoShape === 'rounded' ? 'bg-emerald-500/20 border-emerald-600 text-emerald-800 dark:text-emerald-300' : 'theme-surface border-slate-200 theme-text-muted'
                        }`}
                      >
                        রাউন্ডেড (Rounded)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIdPhotoShape('square')}
                        className={`py-1.5 px-2 rounded-lg border font-bold text-center cursor-pointer transition-all ${
                          idPhotoShape === 'square' ? 'bg-emerald-500/20 border-emerald-600 text-emerald-800 dark:text-emerald-300' : 'theme-surface border-slate-200 theme-text-muted'
                        }`}
                      >
                        চারকোনা (Square)
                      </button>
                    </div>
                  </div>

                  {/* Header Color Palette */}
                  <div>
                    <label className="block font-bold theme-text-secondary mb-1.5">হেডার থিম কালার:</label>
                    <div className="grid grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setIdCardTheme('emerald')}
                        className={`py-1.5 rounded-lg border font-bold text-center cursor-pointer ${
                          idCardTheme === 'emerald' ? 'ring-2 ring-emerald-600' : ''
                        } bg-emerald-800 text-white`}
                      >
                        এমারেল্ড
                      </button>
                      <button
                        type="button"
                        onClick={() => setIdCardTheme('blue')}
                        className={`py-1.5 rounded-lg border font-bold text-center cursor-pointer ${
                          idCardTheme === 'blue' ? 'ring-2 ring-blue-600' : ''
                        } bg-blue-800 text-white`}
                      >
                        রয়েল ব্লু
                      </button>
                      <button
                        type="button"
                        onClick={() => setIdCardTheme('maroon')}
                        className={`py-1.5 rounded-lg border font-bold text-center cursor-pointer ${
                          idCardTheme === 'maroon' ? 'ring-2 ring-rose-600' : ''
                        } bg-rose-900 text-white`}
                      >
                        মেরুন
                      </button>
                      <button
                        type="button"
                        onClick={() => setIdCardTheme('navy')}
                        className={`py-1.5 rounded-lg border font-bold text-center cursor-pointer ${
                          idCardTheme === 'navy' ? 'ring-2 ring-slate-600' : ''
                        } bg-slate-900 text-white`}
                      >
                        নেভি
                      </button>
                    </div>
                  </div>

                </div>

                <div className="pt-2 border-t theme-border">
                  <Link
                    to="/app"
                    className="w-full btn-comfort-primary py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <span>আইডি কার্ড মডিউলে পুরো ক্লাস প্রিন্ট করুন</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Live Physical Dimension CR-80 Card Frame (7 cols) */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center">
                
                {/* Visual Label */}
                <div className="text-xs font-bold theme-text-muted mb-3 flex items-center gap-2">
                  <span>CR-80 ফিজিক্যাল অনুপাত: ৫৪ মিমি × ৮৫.৬ মিমি</span>
                  <span>•</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">পিভিসি কার্ড ও সাধারণ প্রিন্ট উপযোগী</span>
                </div>

                {/* The Card Itself (Aspect Ratio ~ 1 : 1.585) */}
                <div className="w-[286px] h-[454px] bg-white rounded-2xl shadow-2xl border border-slate-300 relative overflow-hidden flex flex-col justify-between text-slate-800 font-sans select-none">
                  
                  {idCardSide === 'front' ? (
                    // CARD FRONT
                    <>
                      {/* Top Header Graphic with Gradient */}
                      <div className={`bg-gradient-to-r ${cardGradients} text-white px-3 pt-3.5 pb-2.5 text-center relative`}>
                        <div className="flex items-center justify-center gap-1.5 mb-0.5">
                          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">🏫</div>
                          <h4 className="text-[13px] font-black tracking-tight leading-tight">আদর্শ উচ্চ বিদ্যালয় ও কলেজ</h4>
                        </div>
                        <p className="text-[9px] text-emerald-100 font-medium">স্থাপিত: ১৯৯৫ • EIIN: ১০৬১০৩ • ঢাকা</p>
                        
                        {/* Student ID Pill */}
                        <div className="mt-1.5 inline-block bg-white text-emerald-950 font-black text-[9px] px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                          STUDENT IDENTITY CARD
                        </div>
                      </div>

                      {/* Middle Photo & Student Name */}
                      <div className="px-4 py-2 flex flex-col items-center text-center space-y-1.5 flex-1 justify-center">
                        
                        {/* Student Avatar */}
                        <div
                          className={`w-24 h-24 bg-slate-100 border-2 border-emerald-700/80 p-0.5 shadow-sm overflow-hidden flex items-center justify-center ${
                            idPhotoShape === 'circle' ? 'rounded-full' : idPhotoShape === 'rounded' ? 'rounded-xl' : 'rounded-none'
                          }`}
                        >
                          <div className="w-full h-full bg-gradient-to-tr from-emerald-100 to-teal-50 flex flex-col items-center justify-center text-emerald-800">
                            <Users className="w-10 h-10 stroke-[1.5]" />
                          </div>
                        </div>

                        {/* Name & ID */}
                        <div>
                          <h5 className="text-[14px] font-black text-slate-900 leading-tight">
                            {idStudentName}
                          </h5>
                          <div className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                            আইডি: {idStudentId}
                          </div>
                        </div>

                        {/* Two Column Academic Details Table */}
                        <div className="w-full bg-slate-50 border border-slate-200/80 rounded-lg p-2 text-[10px] space-y-1">
                          <div className="flex justify-between border-b border-slate-200 pb-0.5">
                            <span className="text-slate-500 font-medium">শ্রেণি:</span>
                            <span className="font-bold text-slate-900">{idStudentClass}</span>
                          </div>
                          <div className="flex justify-between border-b border-slate-200 pb-0.5">
                            <span className="text-slate-500 font-medium">রোল:</span>
                            <span className="font-bold text-slate-900">{idStudentRoll}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 font-medium">রক্তের গ্রুপ:</span>
                            <span className="font-extrabold text-rose-700">{idStudentBlood}</span>
                          </div>
                        </div>

                      </div>

                      {/* Bottom Footer: QR & Principal Signature Box */}
                      <div className="px-3 pb-3 pt-1 border-t border-slate-100 flex items-end justify-between">
                        {/* QR Code */}
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-slate-100 border border-slate-200 rounded p-0.5 flex items-center justify-center">
                            <QrCode className="w-10 h-10 text-slate-800" />
                          </div>
                          <span className="text-[7.5px] text-slate-400 font-mono mt-0.5">স্ক্যান ভেরিফাই</span>
                        </div>

                        {/* Principal Signature */}
                        <div className="text-center">
                          <div className="font-serif italic text-[11px] text-slate-800 font-bold border-b border-slate-300 pb-0.5">
                            Dr. A. Ahammad
                          </div>
                          <span className="text-[8.5px] font-bold text-slate-600 block mt-0.5">
                            অধ্যক্ষ / প্রতিষ্ঠান প্রধান
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    // CARD BACK
                    <>
                      <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 text-center">
                        <div className="text-[11px] font-bold text-slate-800">জরুরি নির্দেশনা ও অভিভাবক বিবরণ</div>
                        <div className="text-[8px] text-slate-500">কার্ডটি হারিয়ে গেলে অবিলম্বে প্রতিষ্ঠানে জানান</div>
                      </div>

                      <div className="p-3.5 space-y-2.5 text-[9.5px] text-slate-600 leading-relaxed flex-1">
                        <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                          <span className="font-bold text-emerald-950 block">জরুরি যোগাযোগ:</span>
                          <span className="font-mono text-slate-800">+৮৮০ ১৭১২-৩৪৫৬৭৮</span>
                        </div>

                        <div>
                          <span className="font-bold text-slate-900 block mb-0.5">নিয়মাবলি:</span>
                          <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                            <li>প্রতিষ্ঠান ক্যাম্পাসে কার্ডটি ঝুলিয়ে রাখা বাধ্যতামূলক।</li>
                            <li>কার্ডটি হস্তান্তরযোগ্য নয় এবং শুধু ধারকের জন্য প্রযোজ্য।</li>
                            <li>পরীক্ষা কক্ষে প্রবেশপত্রসহ কার্ড প্রদর্শন করতে হবে।</li>
                          </ul>
                        </div>

                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[8.5px]">
                          <span className="font-bold text-slate-800 block">স্থায়ী ঠিকানা:</span>
                          <span>বাড়ি ১২, রোড ৪, ধানমন্ডি, ঢাকা-১২০৫</span>
                        </div>
                      </div>

                      <div className="bg-slate-900 text-white text-center py-2 px-3 text-[8.5px]">
                        বিদ্যালোক এডুকেশন ম্যানেজমেন্ট দ্বারা প্রস্তুতকৃত • biddalok.nicetrix.com
                      </div>
                    </>
                  )}

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* ===================================================================== */}
        {/* 3. SIX CORE INSTITUTIONAL MODULES (মডিউল ও বৈশিষ্ট্যসমূহ)             */}
        {/* ===================================================================== */}
        <section id="features" className="py-16 md:py-24 border-b theme-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>পূর্ণাঙ্গ শিক্ষা অটোমেশন সমাধান</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black theme-text-primary tracking-tight">
                প্রতিষ্ঠানের সকল প্রয়োজন এক শক্তিশালী সফটওয়্যারে
              </h2>
              <p className="text-sm sm:text-base theme-text-secondary leading-relaxed font-medium">
                ম্যানুয়াল রেজিস্টার খাতা ও আলাদা আলাদা সফটওয়্যারের জটিলতা বাদ দিন। বিদ্যালয় পরিচালনায় সম্পূর্ণ নির্ভুল ও দ্রুততম কার্যক্ষমতা নিশ্চিত করুন।
              </p>
            </div>

            {/* 6 Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Feature 1: রাজস্ব খাতভুক্ত বৃত্তি ফরম */}
              <div className="theme-surface p-6 rounded-2xl border theme-border shadow-xs hover:shadow-lg transition-all space-y-3.5">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xl">
                  <FileCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black theme-text-primary">
                  সরকারি রাজস্ব খাতভুক্ত বৃত্তি ফরম
                </h3>
                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed font-medium">
                  শিক্ষা বোর্ড ও মাউশি প্রমিত রাজস্ব খাতভুক্ত বৃত্তি ফরম স্বয়ংক্রিয় তৈরি। শিক্ষার্থীর মৌলিক তথ্য, অভিভাবক ও ব্যাংকিং বিবরণী সংযুক্ত করে ১ পাতা ও ২ পাতা লেআউটে নিখুঁত PDF তৈরি ও সরকারি সার্ভারে এন্ট্রি রেকর্ড।
                </p>
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 pt-1">
                  <span>বোর্ড ও মাউশি ফরম্যাট সমর্থিত</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Feature 2: CR-80 আইডি কার্ড */}
              <div className="theme-surface p-6 rounded-2xl border theme-border shadow-xs hover:shadow-lg transition-all space-y-3.5">
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold text-xl">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black theme-text-primary">
                  CR-80 পিভিসি স্মার্ট আইডি কার্ড
                </h3>
                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed font-medium">
                  আন্তর্জাতিক মানের CR-80 সাইজ (54mm × 85.6mm) ফ্রন্ট ও ব্যাক বোথ-সাইড আইডি কার্ড। ডায়নামিক কিউআর কোড, ফটো ফ্রেম স্টাইলিং, শিক্ষক ও অধ্যক্ষের স্বাক্ষর এবং সাধারণ পেপারে মাল্টি-কার্ড গ্রিড প্রিন্ট সুবিধা।
                </p>
                <div className="text-xs font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1 pt-1">
                  <span>A4 গ্রিড ও ডাইরেক্ট পিভিসি প্রিন্ট</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Feature 3: এডমিট কার্ড ও সিট প্ল্যান */}
              <div className="theme-surface p-6 rounded-2xl border theme-border shadow-xs hover:shadow-lg transition-all space-y-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black theme-text-primary">
                  স্বয়ংক্রিয় প্রবেশপত্র ও সিট প্ল্যান
                </h3>
                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed font-medium">
                  পরীক্ষার রুটিন অনুযায়ী সম্পূর্ণ ক্লাসের ছাত্রছাত্রীদের প্রবেশপত্র এক ক্লিকে স্বয়ংক্রিয় জেনারেশন। পরীক্ষার কক্ষ ও বেঞ্চ নম্বর অনুযায়ী স্বয়ংক্রিয় রো-কলাম সিট প্ল্যানিং স্টিকার প্রিন্ট।
                </p>
                <div className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 pt-1">
                  <span>পরীক্ষা পরিচালনা শতভাগ অটোমেটেড</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Feature 4: গ্রেডিং ও ফলাফল প্রসেসিং */}
              <div className="theme-surface p-6 rounded-2xl border theme-border shadow-xs hover:shadow-lg transition-all space-y-3.5">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-700 dark:text-purple-400 flex items-center justify-center font-bold text-xl">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black theme-text-primary">
                  গ্রেডিং রেজাল্ট ও টেবুলেশন শিট
                </h3>
                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed font-medium">
                  জাতীয় শিক্ষাক্রম অনুযায়ী GPA 5.0 স্কেলে বিষয়ভিত্তিক নম্বর এন্ট্রি, স্বয়ংক্রিয় গ্রেড হিসাব, মেধা তালিকা, টেবুলেশন শিট ও আকর্ষণীয় অভিভাবক প্রগ্রেস রিপোর্ট কার্ড।
                </p>
                <div className="text-xs font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1 pt-1">
                  <span>নিখুঁত ফলাফল ও গ্রেডিং ব্যবস্থা</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Feature 5: শিক্ষক MIS ও পে-রোল */}
              <div className="theme-surface p-6 rounded-2xl border theme-border shadow-xs hover:shadow-lg transition-all space-y-3.5">
                <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-700 dark:text-rose-400 flex items-center justify-center font-bold text-xl">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black theme-text-primary">
                  শিক্ষক MIS ও মাসিক পে-রোল
                </h3>
                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed font-medium">
                  প্রতিষ্ঠানের সকল শিক্ষক ও কর্মচারীর সম্পূর্ণ ব্যক্তিগত ও একাডেমিক প্রোফাইল, বিষয় বণ্টন, মাসিক বেতন শিট তৈরি এবং ম্যানেজিং কমিটি মিটিং ও রেজুলেশন ট্র্যাকিং।
                </p>
                <div className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1 pt-1">
                  <span>এইচআর ও প্রশাসনিক স্বচ্ছতা</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Feature 6: অফলাইন এনক্রিপ্টেড ডাটাবেজ */}
              <div className="theme-surface p-6 rounded-2xl border theme-border shadow-xs hover:shadow-lg transition-all space-y-3.5">
                <div className="w-12 h-12 rounded-xl bg-teal-500/15 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-xl">
                  <HardDrive className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black theme-text-primary">
                  ১০০% অফলাইন ডাটা নিরাপত্তা
                </h3>
                <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed font-medium">
                  ইন্টারনেট ছাড়া আজীবন চলার নিশ্চয়তা। সম্পূর্ণ ডাটাবেজ আপনার ব্রাউজার ও পিসির নিরাপদ লোকাল স্টোরেজে এনক্রিপ্ট হয়ে সংরক্ষিত থাকে। এক ক্লিকে সম্পূর্ণ ব্যাকআপ এক্সপোর্ট ও রিস্টোর।
                </p>
                <div className="text-xs font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1 pt-1">
                  <span>জিরো ক্লাউড লিকেজ গ্যারান্টি</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ===================================================================== */}
        {/* 4. INTERACTIVE SAVINGS & ROI CALCULATOR (সাশ্রয় ক্যালকুলেটর)         */}
        {/* ===================================================================== */}
        <section id="calculator" className="py-16 md:py-20 border-b theme-border bg-[var(--bg-secondary)]/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-full">
                ⏱️ প্রাতিষ্ঠানিক সাশ্রয় ক্যালকুলেটর
              </span>
              <h2 className="text-2xl sm:text-3xl font-black theme-text-primary">
                বিদ্যালোক ব্যবহারে আপনার প্রতিষ্ঠান কত টাকা ও সময় সাশ্রয় করবে?
              </h2>
              <p className="text-xs sm:text-sm theme-text-secondary font-medium">
                শিক্ষার্থী সংখ্যা নির্বাচন করে দেখুন কার্ড প্রিন্টিং, পরীক্ষার কাজ ও ফরম ফিলিংয়ে বাৎসরিক কি পরিমাণ ব্যয় হ্রাস পায়।
              </p>
            </div>

            <div className="theme-surface p-6 sm:p-8 rounded-3xl border-2 theme-border shadow-lg space-y-8">
              
              {/* Slider Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label htmlFor="student-count-slider" className="text-sm font-extrabold theme-text-primary">
                    প্রতিষ্ঠানের মোট শিক্ষার্থী সংখ্যা:
                  </label>
                  <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-4 py-1 rounded-xl font-mono">
                    {studentCount.toLocaleString('bn-BD')} জন
                  </span>
                </div>
                <input
                  id="student-count-slider"
                  type="range"
                  min="100"
                  max="2500"
                  step="50"
                  value={studentCount}
                  onChange={(e) => setStudentCount(Number(e.target.value))}
                  className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] theme-text-muted font-bold font-mono">
                  <span>১০০ জন</span>
                  <span>১,০০০ জন</span>
                  <span>২,৫০০ জন</span>
                </div>
              </div>

              {/* 3 Calculated ROI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">আইডি ও প্রিন্ট বাবদ সাশ্রয়</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">
                    ৳{idCardPrintSavings.toLocaleString('bn-BD')}
                  </div>
                  <div className="text-[11px] text-slate-500">বাহিরের প্রিন্টিং ভেন্ডরের তুলনায়</div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center space-y-1">
                  <div className="text-xs font-bold text-blue-900 dark:text-blue-200">বার্ষিক প্রশাসনিক সময় সাশ্রয়</div>
                  <div className="text-2xl sm:text-3xl font-black text-blue-700 dark:text-blue-400 font-mono">
                    {hoursSavedPerYear.toLocaleString('bn-BD')} ঘণ্টা
                  </div>
                  <div className="text-[11px] text-slate-500">শিক্ষক ও স্টাফদের মূল্যবান কর্মঘণ্টা</div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-1">
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-200">পেপারওয়ার্ক ও ভুলের ঝুঁকি হ্রাস</div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400 font-mono">
                    {paperworkReductionPercent}%
                  </div>
                  <div className="text-[11px] text-slate-500">ডিজিটাল অটোমেশনের মাধ্যমে</div>
                </div>

              </div>

              <div className="text-center pt-2">
                <Link
                  to="/app"
                  className="btn-comfort-primary inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black shadow-md cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>আপনার বিদ্যালয়ে এখনই বিদ্যালয় পরিচালনা শুরু করুন</span>
                </Link>
              </div>

            </div>

          </div>
        </section>

        {/* ===================================================================== */}
        {/* 5. DATA SECURITY & PRIVACY (ZERO CLOUD LEAKAGE GUARANTEE)            */}
        {/* ===================================================================== */}
        <section id="security" className="py-16 md:py-24 border-b theme-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column: Security Philosophy */}
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>নিরাপত্তা অঙ্গীকার • Zero Cloud Leakage</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black theme-text-primary tracking-tight">
                  আপনার প্রতিষ্ঠানের ডাটা শতভাগ আপনার পিসিতে সুরক্ষিত
                </h2>
                <p className="text-sm sm:text-base theme-text-secondary leading-relaxed font-medium">
                  অনেক শিক্ষাপ্রতিষ্ঠান ক্লাউড ডাটাবেজে তথ্য ফাঁস কিংবা সার্ভার নষ্ট হয়ে ডাটা হারানোর আশঙ্কায় ভোগেন। বিদ্যালয় পরিচালনায় আমরা নিয়ে এসেছি যুগান্তকারী ক্লায়েন্ট-সাইড অফলাইন ডাটা মডেল।
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 p-3.5 rounded-xl theme-surface border theme-border shadow-2xs">
                    <Database className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold theme-text-primary">লোকাল IndexedDB ও Dexie স্টোরেজ</h4>
                      <p className="text-xs theme-text-muted leading-relaxed">
                        সমস্ত ডাটা আপনার ব্রাউজার ও লোকাল পিসির নিরাপদ স্থায়ী ডাটাবেজে সংরক্ষিত থাকে। কোনো অচেনা সার্ভারে তথ্য প্রেরিত হয় না।
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl theme-surface border theme-border shadow-2xs">
                    <Lock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold theme-text-primary">PBKDF2-SHA-256 মিলিটারী-গ্রেড ব্যাকআপ এনক্রিপশন</h4>
                      <p className="text-xs theme-text-muted leading-relaxed">
                        এক ক্লিকে সম্পূর্ণ প্রতিষ্ঠানের ফুল ডাটাবেজ ব্যাকআপ ফাইল ডাউনলোড করুন এবং পেনড্রাইভ কিংবা নিরাপদ স্টোরেজে রাখুন।
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3.5 rounded-xl theme-surface border theme-border shadow-2xs">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold theme-text-primary">সার্চ ইঞ্জিন ক্রলিং ব্লক (robots.txt প্রটেকশন)</h4>
                      <p className="text-xs theme-text-muted leading-relaxed">
                        গুগল বা কোনো সার্চ ইঞ্জিন আপনার ছাত্রছাত্রী কিংবা প্রতিষ্ঠানের অভ্যন্তরীণ পেজ ক্রল করতে পারে না।
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Visual Shield Card */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="w-full max-w-md theme-surface border-2 theme-border rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-center">
                  <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-lg">
                    <ShieldCheck className="w-10 h-10" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-black theme-text-primary">
                      ১০০% নির্ভরযোগ্য প্রাতিষ্ঠানিক গোপনীয়তা
                    </h3>
                    <p className="text-xs theme-text-secondary leading-relaxed">
                      বিদ্যালোক সফটওয়্যার কোনো গোপন ক্লাউড সার্ভারে ডাটা পাঠায় না। আপনার প্রতিষ্ঠানের ডাটাবেজের একমাত্র মালিক আপনি।
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                    🔒 Client-Side Enclave • Zero External Dependency
                  </div>

                  <a
                    href={desktopDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full btn-comfort-primary py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>উইন্ডোজ ডেস্কটপ অফলাইন ইনস্টলার ডাউনলোড</span>
                  </a>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ===================================================================== */}
        {/* 6. DESKTOP VS WEB CLOUD EDITION COMPARISON TABLE                     */}
        {/* ===================================================================== */}
        <section id="desktop" className="py-16 md:py-20 border-b theme-border bg-[var(--bg-secondary)]/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-full">
                💻 সংস্করণের তুলনা
              </span>
              <h2 className="text-2xl sm:text-3xl font-black theme-text-primary">
                উইন্ডোজ ডেস্কটপ সংস্করণ বনাম ওয়েব ক্লাউড পোর্টাল
              </h2>
              <p className="text-xs sm:text-sm theme-text-secondary font-medium">
                উভয় সংস্করণেই সকল মূল ফিচার (আইডি কার্ড, বৃত্তি ফরম, রেজাল্ট, রুটিন) ১০০% সক্রিয় এবং সমান দক্ষতায় কাজ করে।
              </p>
            </div>

            {/* Comparison Matrix Table */}
            <div className="theme-surface rounded-2xl border theme-border overflow-hidden shadow-md">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[var(--bg-secondary)] border-b theme-border theme-text-primary font-black">
                    <tr>
                      <th className="p-3.5 sm:p-4">ফিচার ও সুবিধা</th>
                      <th className="p-3.5 sm:p-4 text-center">উইন্ডোজ ডেস্কটপ অ্যাপ (.exe)</th>
                      <th className="p-3.5 sm:p-4 text-center">ওয়েব ক্লাউড সংস্করণ (ব্রাউজার)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y theme-border font-medium theme-text-secondary">
                    <tr>
                      <td className="p-3.5 sm:p-4 font-bold theme-text-primary">ইন্টারনেট ছাড়া ব্যবহার</td>
                      <td className="p-3.5 sm:p-4 text-center font-bold text-emerald-700 dark:text-emerald-400">১০০% অফলাইন সমর্থিত</td>
                      <td className="p-3.5 sm:p-4 text-center font-bold text-emerald-700 dark:text-emerald-400">লোকাল ক্যাশ অফলাইন সমর্থিত</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 sm:p-4 font-bold theme-text-primary">ইনস্টলেশন পদ্ধতি</td>
                      <td className="p-3.5 sm:p-4 text-center">উইন্ডোজ ১০/১১ সেটআপ (.exe)</td>
                      <td className="p-3.5 sm:p-4 text-center">কোনো ইনস্টল ছাড়াই সরাসরি ব্যবহার</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 sm:p-4 font-bold theme-text-primary">রাজস্ব বৃত্তি ফরম ও CR-80 আইডি</td>
                      <td className="p-3.5 sm:p-4 text-center text-emerald-600 font-bold">সম্পূর্ণ সক্রিয়</td>
                      <td className="p-3.5 sm:p-4 text-center text-emerald-600 font-bold">সম্পূর্ণ সক্রিয়</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 sm:p-4 font-bold theme-text-primary">ডাটা স্টোরেজ ও নিরাপত্তা</td>
                      <td className="p-3.5 sm:p-4 text-center">পিসির নিজস্ব লোকাল ড্রাইভ</td>
                      <td className="p-3.5 sm:p-4 text-center">ব্রাউজারের এনক্রিপ্টেড IndexedDB</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 sm:p-4 font-bold theme-text-primary">ডাটা ব্যাকআপ ও এক্সপোর্ট</td>
                      <td className="p-3.5 sm:p-4 text-center">এক ক্লিকে .json ও এনক্রিপ্ট ফাইল</td>
                      <td className="p-3.5 sm:p-4 text-center">এক ক্লিকে .json ও এনক্রিপ্ট ফাইল</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 sm:p-4 font-bold theme-text-primary">হোস্টিং বা সার্ভার ফি</td>
                      <td className="p-3.5 sm:p-4 text-center font-black text-emerald-700 dark:text-emerald-400">০ টাকা (আজীবন ফ্রি)</td>
                      <td className="p-3.5 sm:p-4 text-center font-black text-emerald-700 dark:text-emerald-400">০ টাকা (ক্লাউডফ্লেয়ার ফ্রি সিডিএন)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </section>

        {/* ===================================================================== */}
        {/* SAFE GOOGLE ADSENSE BANNER 2                                          */}
        {/* ===================================================================== */}
        <section aria-label="বিজ্ঞাপন এলাকা" className="max-w-5xl mx-auto px-4 w-full py-4">
          <AdSenseBanner slot="16146828108" minHeight={90} />
        </section>

        {/* ===================================================================== */}
        {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION                         */}
        {/* ===================================================================== */}
        <section id="faq" className="py-16 md:py-24 border-b theme-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-12 space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-500/15 px-3 py-1 rounded-full">
                ❓ সচরাচর জিজ্ঞাসিত প্রশ্নাবলি
              </span>
              <h2 className="text-2xl sm:text-4xl font-black theme-text-primary tracking-tight">
                আপনার মনে যেসব প্রশ্ন আসতে পারে
              </h2>
            </div>

            {/* Accordion List */}
            <div className="space-y-3">
              
              {/* FAQ 1 */}
              <div className="theme-surface rounded-2xl border theme-border overflow-hidden transition-all shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleFaq(0)}
                  className="w-full p-5 text-left font-extrabold text-sm sm:text-base theme-text-primary flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>বিদ্যালয়ের ছাত্রছাত্রীদের তথ্য কি ইন্টারনেটে ছড়িয়ে পড়ার কোনো ঝুঁকি আছে?</span>
                  <ChevronDown className={`w-5 h-5 text-emerald-600 transition-transform ${activeFaq === 0 ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === 0 && (
                  <div className="px-5 pb-5 text-xs sm:text-sm theme-text-secondary leading-relaxed font-medium border-t theme-border pt-3">
                    না, কোনো ঝুঁকি নেই। বিদ্যালয় পরিচালনার সফটওয়্যারটি সম্পূর্ণ ক্লায়েন্ট-সাইড আর্কিটেকচারে তৈরি। আপনি যখন ব্রাউজারে বা ডেস্কটপে এটি ব্যবহার করেন, ডাটা কেবল আপনার পিসির নিরাপদ লোকাল ডাটাবেজে এনক্রিপ্ট হয়ে থাকে। কোনো বহিরাগত সার্ভার বা ক্লাউড ডাটাবেজে তথ্য জমা হয় না।
                  </div>
                )}
              </div>

              {/* FAQ 2 */}
              <div className="theme-surface rounded-2xl border theme-border overflow-hidden transition-all shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleFaq(1)}
                  className="w-full p-5 text-left font-extrabold text-sm sm:text-base theme-text-primary flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>ইন্টারনেট কানেকশন না থাকলে কি সফটওয়্যার ব্যবহার করা যাবে?</span>
                  <ChevronDown className={`w-5 h-5 text-emerald-600 transition-transform ${activeFaq === 1 ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === 1 && (
                  <div className="px-5 pb-5 text-xs sm:text-sm theme-text-secondary leading-relaxed font-medium border-t theme-border pt-3">
                    হ্যাঁ, শতভাগ ব্যবহার করা যাবে। আপনি যদি উইন্ডোজের মূল ডেস্কটপ ইনস্টলার (.exe) ডাউনলোড করেন, তবে কোনো ইন্টারনেট ছাড়াই আজীবন আপনার বিদ্যালয়ের সমস্ত কাজ (আইডি কার্ড, রেজাল্ট, বৃত্তি ফরম, ভর্তি) করতে পারবেন।
                  </div>
                )}
              </div>

              {/* FAQ 3 */}
              <div className="theme-surface rounded-2xl border theme-border overflow-hidden transition-all shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleFaq(2)}
                  className="w-full p-5 text-left font-extrabold text-sm sm:text-base theme-text-primary flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>রাজস্ব খাতভুক্ত বৃত্তি ফরম কি সরকারি পোর্টালের সাথে সামঞ্জস্যপূর্ণ?</span>
                  <ChevronDown className={`w-5 h-5 text-emerald-600 transition-transform ${activeFaq === 2 ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === 2 && (
                  <div className="px-5 pb-5 text-xs sm:text-sm theme-text-secondary leading-relaxed font-medium border-t theme-border pt-3">
                    হ্যাঁ। মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর এবং সংশ্লিষ্ট শিক্ষা বোর্ডের নির্ধারিত রাজস্ব খাতভুক্ত বৃত্তি ফরম্যাট হুবহু অনুসরণ করে এটি তৈরি করা হয়েছে। আপনি চাইলে ১ পাতায় কিংবা ২ পাতায় প্রিন্ট করতে পারবেন এবং ডাটা দেখে সরকারি সার্ভারে দ্রুত এন্ট্রি দিতে পারবেন।
                  </div>
                )}
              </div>

              {/* FAQ 4 */}
              <div className="theme-surface rounded-2xl border theme-border overflow-hidden transition-all shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleFaq(3)}
                  className="w-full p-5 text-left font-extrabold text-sm sm:text-base theme-text-primary flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>আইডি কার্ড ও প্রবেশপত্র কি যেকোনো সাধারণ প্রিন্টারে প্রিন্ট করা যাবে?</span>
                  <ChevronDown className={`w-5 h-5 text-emerald-600 transition-transform ${activeFaq === 3 ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === 3 && (
                  <div className="px-5 pb-5 text-xs sm:text-sm theme-text-secondary leading-relaxed font-medium border-t theme-border pt-3">
                    অবশ্যই। আমাদের সিস্টেমে স্ট্যান্ডার্ড CR-80 কার্ডের পাশাপাশি A4 সাইজের পেপারে এক সাথে একাধিক আইডি কার্ড সাজিয়ে প্রিন্ট করার স্বয়ংক্রিয় গ্রিড ইঞ্জিন রয়েছে। আপনার বিদ্যালয়ের সাধারণ কালার প্রিন্টারে ল্যামিনেটিং পেপারেও দারুণ প্রিন্ট করতে পারবেন।
                  </div>
                )}
              </div>

              {/* FAQ 5 */}
              <div className="theme-surface rounded-2xl border theme-border overflow-hidden transition-all shadow-2xs">
                <button
                  type="button"
                  onClick={() => toggleFaq(4)}
                  className="w-full p-5 text-left font-extrabold text-sm sm:text-base theme-text-primary flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span>ডাটা ব্যাকআপ কিভাবে সংরক্ষণ করব এবং নতুন পিসিতে কিভাবে নিব?</span>
                  <ChevronDown className={`w-5 h-5 text-emerald-600 transition-transform ${activeFaq === 4 ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === 4 && (
                  <div className="px-5 pb-5 text-xs sm:text-sm theme-text-secondary leading-relaxed font-medium border-t theme-border pt-3">
                    সফটওয়্যারের ব্যাকআপ মডিউলে গিয়ে "এক্সপোর্ট ব্যাকআপ" বাটনে ক্লিক করলেই সম্পূর্ণ প্রতিষ্ঠানের ডাটা এনক্রিপ্ট ফাইল হিসেবে ডাউনলোড হয়ে যাবে। সেই ফাইলটি পেনড্রাইভে নিয়ে যেকোনো নতুন পিসিতে "রিস্টোর ব্যাকআপ" দিলে এক সেকেন্ডে সব ডাটা আগের মতো চলে আসবে।
                  </div>
                )}
              </div>

            </div>

          </div>
        </section>

        {/* ===================================================================== */}
        {/* 8. FOOTER: CREDENTIALS, LEGAL PAGES & CONTACT                         */}
        {/* ===================================================================== */}
        <footer className="bg-[var(--bg-surface)] border-t theme-border pt-12 pb-8 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              
              {/* Col 1: Brand & Creator Info */}
              <div className="space-y-3 md:col-span-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm">
                    বি
                  </div>
                  <span className="text-lg font-black theme-text-primary">বিদ্যালোক</span>
                </div>
                <p className="theme-text-muted leading-relaxed font-medium">
                  বাংলাদেশের শিক্ষাপ্রতিষ্ঠানসমূহের জন্য আধুনিক, নির্ভরযোগ্য ও সম্পূর্ণ নিরাপদ ম্যানেজমেন্ট সফটওয়্যার।
                </p>
                <div className="text-[11px] font-bold theme-text-secondary">
                  ব্যবস্থাপনায়: NiceTrix & SoftDows
                </div>
              </div>

              {/* Col 2: Quick Links */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm theme-text-primary">সফটওয়্যার ফিচার</h4>
                <ul className="space-y-1.5 theme-text-muted font-medium">
                  <li><a href="#features" className="hover:text-emerald-700 transition">রাজস্ব খাতভুক্ত বৃত্তি ফরম</a></li>
                  <li><a href="#id-studio" className="hover:text-emerald-700 transition">CR-80 পিভিসি আইডি কার্ড</a></li>
                  <li><a href="#features" className="hover:text-emerald-700 transition">প্রবেশপত্র ও সিট প্ল্যান</a></li>
                  <li><a href="#features" className="hover:text-emerald-700 transition">গ্রেডিং রেজাল্ট ও মার্কশিট</a></li>
                  <li><a href="#calculator" className="hover:text-emerald-700 transition">সাশ্রয় ক্যালকুলেটর</a></li>
                </ul>
              </div>

              {/* Col 3: Compliance & Legal */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-sm theme-text-primary">পলিসি ও শর্তাবলি</h4>
                <ul className="space-y-1.5 theme-text-muted font-medium">
                  <li><Link to="/privacy-policy" className="hover:text-emerald-700 transition">গোপনীয়তা নীতি (Privacy Policy)</Link></li>
                  <li><Link to="/terms" className="hover:text-emerald-700 transition">ব্যবহারের শর্তাবলি (Terms)</Link></li>
                  <li><Link to="/about" className="hover:text-emerald-700 transition">পরিচিতি (About SoftDows & NiceTrix)</Link></li>
                  <li><Link to="/contact" className="hover:text-emerald-700 transition">যোগাযোগ ও হেল্পডেস্ক (Contact)</Link></li>
                </ul>
              </div>

              {/* Col 4: Official Release & Direct Entrance */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-sm theme-text-primary">সরাসরি প্রবেশ</h4>
                <p className="theme-text-muted text-[11px] leading-relaxed">
                  আপনার প্রতিষ্ঠানের একাউন্টে প্রবেশ করতে অথবা নতুন বিদ্যালয় অনবোর্ডিং শুরু করতে নিচের বাটনে চাপ দিন:
                </p>
                <Link
                  to="/app"
                  className="w-full btn-comfort-primary py-2.5 rounded-xl font-black text-center flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <LogIn className="w-4 h-4" />
                  <span>ক্লাউড পোর্টালে প্রবেশ</span>
                </Link>
                <a
                  href={desktopDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full theme-surface border theme-border py-2 rounded-xl font-bold theme-text-primary text-center flex items-center justify-center gap-2 hover:border-emerald-600 transition"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>উইন্ডোজ অ্যাপ ডাউনলোড</span>
                </a>
              </div>

            </div>

            {/* Bottom Credits & Copyright */}
            <div className="pt-6 border-t theme-border flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 font-medium">
              <div>
                © {new Date().getFullYear()} বিদ্যালোক (Biddalok) by <a href="https://nicetrix.com" target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">NiceTrix</a> & SoftDows. সর্বস্বত্ব সংরক্ষিত।
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span>প্রতিষ্ঠাতা: আনসার আহাম্মদ</span>
                <span>•</span>
                <span>অফিসিয়াল ডোমেইন: biddalok.nicetrix.com</span>
              </div>
            </div>

          </div>
        </footer>

        {/* ===================================================================== */}
        {/* RELEASE NOTES MODAL                                                   */}
        {/* ===================================================================== */}
        {releaseNotesOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="theme-surface border theme-border rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b theme-border">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 pulse-gentle"></span>
                  <h3 className="font-black text-base theme-text-primary">বিদ্যালোক v1.1.0 রিলিজ নোটস</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setReleaseNotesOpen(false)}
                  className="p-1 rounded-lg theme-surface-muted theme-text-muted hover:theme-text-primary cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs theme-text-secondary leading-relaxed font-medium">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 font-bold text-emerald-900 dark:text-emerald-300">
                  🎉 অফিসিয়াল v1.1.0 সংস্করণের নতুন সংযোজনসমূহ:
                </div>

                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>সরকারি রাজস্ব খাতভুক্ত বৃত্তি ফরম:</strong> ১ পাতা ও ২ পাতা অপশনসহ বোর্ড প্রমিত কমপ্লিট ডাটা ইন্টিগ্রেশন।</li>
                  <li><strong>CR-80 আইডি স্টুডিও:</strong> ৫৪ মিমি × ৮৫.৬ মিমি স্ট্যান্ডার্ড সাইজ, অটোমেটেড কিউআর ও ডাবল সাইড প্রিন্টিং।</li>
                  <li><strong>নতুন আই-কমফোর্ট থিম ব্যবস্থা:</strong> প্রশান্ত দিন (Day), পাঠাগার মোড (Sepia) ও স্নিগ্ধ রাত (Dark) ভিউ।</li>
                  <li><strong>সাশ্রয় ক্যালকুলেটর:</strong> প্রতিষ্ঠানের শিক্ষার্থী সংখ্যা অনুযায়ী সময় ও ব্যয়ের আর্থিক বিশ্লেষণ।</li>
                  <li><strong>জিরো ক্লাউড লিকেজ গার্ড:</strong> IndexedDB এনক্রিপ্টেড অফলাইন স্টোরেজ এবং সার্চ ইঞ্জিন প্রটেকশন।</li>
                </ul>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t theme-border">
                <button
                  type="button"
                  onClick={() => setReleaseNotesOpen(false)}
                  className="px-4 py-2 rounded-xl font-bold theme-surface border theme-border theme-text-primary text-xs cursor-pointer"
                >
                  বন্ধ করুন
                </button>
                <a
                  href={desktopDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-comfort-primary px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>পিসি অ্যাপ ডাউনলোড</span>
                </a>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
