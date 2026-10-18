import React, { useState } from 'react';
import {
  ArrowRight,
  Download,
  ShieldCheck,
  CreditCard,
  FileText,
  CheckCircle2,
  HardDrive,
  Globe,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Laptop,
  Users,
  Award,
  BookOpen,
  Calendar,
  Lock,
  Printer,
  QrCode,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdSenseBanner } from '../components/ads/AdSenseBanner';

export const LandingPage: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'scholarship' | 'idcard' | 'exam'>('scholarship');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Official Desktop Windows Setup link from GitHub release
  const desktopDownloadUrl = "https://github.com/nicetrix/biddalok/releases/latest";

  const faqs = [
    {
      q: 'ইন্টারনেট সংযোগ না থাকলে কি বিদ্যালোক সফটওয়্যারে কাজ করা যাবে?',
      a: 'হ্যাঁ, সম্পূর্ণভাবে। বিদ্যালোক একটি লোকাল-ফার্স্ট সফটওয়্যার। একবার ব্রাউজারে লোড হলে অথবা পিসিতে ডেস্কটপ অ্যাপ ইনস্টল থাকলে ইন্টারনেট সংযোগ ছাড়াই আপনি ভর্তি, হাজিরা, পরীক্ষার ফলাফল, বৃত্তি ফরম ও আইডি কার্ড তৈরির সকল কাজ নির্বিঘ্নে সম্পন্ন করতে পারবেন।'
    },
    {
      q: 'আমাদের শিক্ষাপ্রতিষ্ঠানের শিক্ষার্থীদের ব্যক্তিগত তথ্য কি অনলাইনে ফাঁস হওয়ার ঝুঁকি আছে?',
      a: 'একেবারেই না। বিদ্যালোকের মূল দর্শন হলো জিরো-ক্লাউড প্রাইভেসি। আপনার প্রতিষ্ঠানের কোনো শিক্ষার্থী, শিক্ষক বা আর্থিক ডাটা কোনো সার্ভারে আপলোড হয় না। সমস্ত ডাটা আপনার নিজস্ব কম্পিউটারেই এনক্রিপ্টেড অবস্থায় সংরক্ষিত থাকে।'
    },
    {
      q: 'রাজস্ব খাতভুক্ত বৃত্তি ফরম কি সরকারি অধিদপ্তরের নির্ধারিত ফরম্যাটে তৈরি হয়?',
      a: 'হ্যাঁ। মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর (মাউশি) এবং প্রাথমিক শিক্ষা অধিদপ্তরের সর্বশেষ নির্ধারিত বৃত্তি প্রাপ্তির আবেদনের হুবহু ফরম্যাট ও রেজিস্ট্রারে ডাটা অটোমেশন করা হয়েছে। এটি এক ক্লিকে এ৪ সাইজে নির্ভুল প্রিন্ট উপযোগী।'
    },
    {
      q: 'আইডি কার্ড ও এডমিট কার্ড কি সাধারণ প্রিন্টারে প্রিন্ট করা যাবে?',
      a: 'অবশ্যই। সাধারণ কালার প্রিন্টার (যেমন Epson, Canon) দিয়ে ফটো পেপার বা সাধারণ পেপারেও প্রিন্ট করতে পারবেন, আবার পিভিসি কার্ড প্রিন্টারে আন্তর্জাতিক CR-80 মাপের স্মার্ট প্লাস্টিক কার্ড হিসেবেও প্রিন্ট করা যাবে।'
    },
    {
      q: 'এক কম্পিউটার থেকে অন্য কম্পিউটারে বা ওয়েব থেকে পিসিতে ডাটা ট্রান্সফার করা যাবে?',
      a: 'হ্যাঁ। বিদ্যালোকে এক-ক্লিকে সম্পূর্ণ ডাটাবেজ ব্যাকআপ (.biddalok ফাইল) ডাউনলোড করা যায়। পরবর্তীতে সেই ফাইলটি যেকোনো কম্পিউটারে কয়েক সেকেন্ডের মধ্যে রিস্টোর করে নেওয়া যায়।'
    }
  ];

  const modules = [
    {
      icon: Award,
      title: 'রাজস্ব খাতভুক্ত বৃত্তি অটোমেশন',
      desc: 'সরকারি নির্ধারিত ছকে বৃত্তিপ্রাপ্ত শিক্ষার্থীদের তথ্য পূরণ, ব্যাংক একাউন্ট যাচাই, অটোমেটিক এন্ট্রি এবং এ৪ সাইজ প্রিন্ট-রেডি ফরম ও মাস্টার রেজিস্টার।',
      badge: 'সরকারি ফরম্যাটে প্রস্তুত',
      color: 'emerald'
    },
    {
      icon: CreditCard,
      title: 'CR-80 স্মার্ট পিভিসি আইডি কার্ড',
      desc: 'আন্তর্জাতিক প্লাস্টিক কার্ড মানে শিক্ষার্থী ও শিক্ষক আইডি কার্ড জেনারেটর। কিউআর কোড, রক্তের গ্রুপ, স্বাক্ষর ও প্রাতিষ্ঠানিক থিমযুক্ত প্রিন্ট ইঞ্জিন।',
      badge: 'স্ট্যান্ডার্ড মাপ ৫৪×৮৫.৬ মিমি',
      color: 'teal'
    },
    {
      icon: FileText,
      title: 'পরীক্ষা, এডমিট ও ফলাফল শিট',
      desc: 'এক ক্লিকে সকল শিক্ষার্থীর ছবি ও বারকোডযুক্ত প্রবেশপত্র, পরীক্ষার আসন বিন্যাস (Seat Plan) এবং গ্রেডিং টেবুলেশন ও মার্কশিট প্রসেসিং।',
      badge: 'অটোমেটিক রোল ম্যাপিং',
      color: 'blue'
    },
    {
      icon: Users,
      title: 'শিক্ষার্থী ও উপস্থিতি ব্যবস্থাপনা',
      desc: 'ভর্তি ফরম, শ্রেণি ও শাখা বিন্যাস, অভিভাবক ডিরেক্টরি এবং ডিজিটাল উপস্থিতির সমন্বিত রেজিস্টার। ড্রপআউট রোধে ফলোআপ ব্যবস্থাপনা।',
      badge: 'পূর্ণাঙ্গ প্রোফাইল',
      color: 'amber'
    },
    {
      icon: BookOpen,
      title: 'একাডেমিক কারিকুলাম ও রুটিন',
      desc: 'শ্রেণিভিত্তিক পাঠ্যসূচি, বিষয়ভিত্তিক পূর্ণমান ও পাস মার্ক নির্ধারণ এবং শিক্ষকভিত্তিক ক্লাস রুটিন ব্যবস্থাপনা।',
      badge: 'কারিকুলাম ট্র্যাকার',
      color: 'indigo'
    },
    {
      icon: HardDrive,
      title: 'মানবসম্পদ, কমিটি ও নিরাপত্তা',
      desc: 'শিক্ষক-কর্মচারীদের ব্যক্তিগত ও সার্ভিস রেকর্ড, দায়িত্ব বণ্টন, এসএমসি/ম্যানেজিং কমিটির তথ্য এবং এনক্রিপ্টেড অফলাইন ব্যাকআপ।',
      badge: '১০০% লোকাল স্টোরেজ',
      color: 'rose'
    }
  ];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-800'}`}>
      
      {/* ========================================================================= */}
      {/* 1. TOP HEADER / NAVBAR                                                    */}
      {/* ========================================================================= */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${
        isDark ? 'bg-slate-950/85 border-slate-800' : 'bg-white/90 border-slate-100'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              বি
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">বিদ্যালোক</span>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  v1.1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                আধুনিক শিক্ষা ব্যবস্থাপনা ও অটোমেশন
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">সুবিধাসমূহ</a>
            <a href="#modules" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">মডিউলসমূহ</a>
            <a href="#desktop" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">ডেস্কটপ অ্যাপ</a>
            <a href="#faq" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">প্রশ্নোত্তর</a>
          </nav>

          {/* Right Action CTA & Theme Switcher */}
          <div className="flex items-center gap-3">
            {/* Dark / Light Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              title={isDark ? 'লাইট মোড' : 'ডার্ক মোড'}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Launch App Button */}
            <Link
              to="/app"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/30 transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>সফটওয়্যারে প্রবেশ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-3">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600"
            >
              সুবিধাসমূহ
            </a>
            <a
              href="#modules"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600"
            >
              মডিউলসমূহ
            </a>
            <a
              href="#desktop"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600"
            >
              ডেস্কটপ অ্যাপ
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-emerald-600"
            >
              প্রশ্নোত্তর
            </a>
            <div className="pt-2">
              <Link
                to="/app"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-emerald-600"
              >
                <span>সফটওয়্যারে প্রবেশ করুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>বাংলাদেশ শিক্ষা বোর্ডের মানদণ্ডে তৈরি শিক্ষা ব্যবস্থাপনা সফটওয়্যার</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.18] sm:leading-[1.15]">
            শিক্ষাপ্রতিষ্ঠানের সকল কাজ— <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              এখন আরও সহজ, নির্ভুল ও গতিশীল।
            </span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            রাজস্ব খাতভুক্ত বৃত্তি ফরম, স্মার্ট পিভিসি আইডি কার্ড, এডমিট কার্ড, টেবুলেশন শিট ও প্রাতিষ্ঠানিক হিসাবরক্ষণ—কোনো জটিলতা ছাড়াই সম্পূর্ণ লোকাল ও অফলাইনে ১০০% নিরাপদ।
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            
            {/* Primary Web App Launch */}
            <Link
              to="/app"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-base text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>সরাসরি শুরু করুন</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Secondary PC Windows Setup Download */}
            <a
              href={desktopDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-base text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>ডেস্কটপ অ্যাপ (Windows .exe)</span>
            </a>
          </div>

          {/* 3 Reassuring Trust Pillars */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>১০০% অফলাইন সক্ষম</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>জিরো ক্লাউড ডাটা লিকেজ</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>অফিসিয়াল ছকে নির্ভুল প্রিন্ট</span>
            </div>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 3. INTERACTIVE PRODUCT SHOWCASE (TABBED HIGH-FIDELITY PREVIEW)           */}
        {/* ======================================================================= */}
        <div id="features" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-3xl p-4 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
            
            {/* Showcase Tab Selector */}
            <div className="flex items-center justify-center mb-8">
              <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-800 border border-slate-300/60 dark:border-slate-700">
                <button
                  onClick={() => setActiveTab('scholarship')}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'scholarship'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>রাজস্ব বৃত্তি ফরম</span>
                </button>

                <button
                  onClick={() => setActiveTab('idcard')}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'idcard'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>স্মার্ট পিভিসি আইডি কার্ড</span>
                </button>

                <button
                  onClick={() => setActiveTab('exam')}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    activeTab === 'exam'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>এডমিট ও টেবুলেশন</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: SCHOLARSHIP FORM PREVIEW */}
            {activeTab === 'scholarship' && (
              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs animate-in fade-in duration-300">
                <div className="border border-emerald-600/40 rounded-lg overflow-hidden bg-white text-slate-900 text-left">
                  
                  {/* Green Title Header */}
                  <div className="bg-[#5cb85c] text-white px-4 py-2 font-bold text-sm sm:text-base flex items-center justify-between">
                    <span>শিক্ষার্থীর বৃত্তান্ত (রাজস্ব খাতভুক্ত বৃত্তি আবেদন ফরম)</span>
                    <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded">মাউশি অনুমোদিত ছক</span>
                  </div>

                  {/* Summary Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 border-b border-slate-200 text-xs">
                    <div><span className="font-bold text-slate-700">ভর্তির শিক্ষাবর্ষ:</span> ২০২৬</div>
                    <div><span className="font-bold text-slate-700">অর্থবছর:</span> ২০২৫-২৬</div>
                    <div><span className="font-bold text-slate-700">বৃত্তির পরীক্ষা:</span> জেএসসি / সমমান</div>
                    <div><span className="font-bold text-slate-700">বৃত্তির ধরণ:</span> ট্যালেন্টপুল (মেধাবৃত্তি)</div>
                  </div>

                  {/* Document Content Sample */}
                  <div className="p-4 space-y-4 text-xs sm:text-sm">
                    <div className="bg-slate-700 text-white font-bold px-3 py-1 rounded-xs">
                      শিক্ষার্থীর তথ্য ও অভিভাবকের বিবরণ
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs">
                      <div className="flex justify-between border-b border-slate-100 py-1">
                        <span className="text-slate-500 font-medium">শিক্ষার্থীর নাম (বাংলা):</span>
                        <span className="font-bold text-slate-800">নুসরাত জাহান নিলা</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 py-1">
                        <span className="text-slate-500 font-medium">শিক্ষার্থীর নাম (ইংরেজি):</span>
                        <span className="font-bold text-slate-800 font-mono">NUSRAT JAHAN NILA</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 py-1">
                        <span className="text-slate-500 font-medium">পিতার নাম ও এনআইডি:</span>
                        <span className="font-bold text-slate-800">মোঃ রফিকুল ইসলাম (NID: 1982...)</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 py-1">
                        <span className="text-slate-500 font-medium">পেমেন্ট মেথড ও ব্যাংক:</span>
                        <span className="font-bold text-emerald-700">সোনালী ব্যাংক পিএলসি (সঞ্চয়ী হিসাব)</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Footer Action */}
                  <div className="bg-slate-100 px-4 py-2.5 text-right border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">স্বয়ংক্রিয় এ৪ সাইজ পিডিএফ এক্সপোর্ট ও অফিসিয়াল রেজিস্টার সাপোর্টেড</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <Printer className="w-3.5 h-3.5" />
                      <span>প্রিন্ট রেডি</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: SMART CR-80 PVC ID CARD PREVIEW */}
            {activeTab === 'idcard' && (
              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                  
                  {/* CR-80 Card Front Preview */}
                  <div className="w-[260px] h-[410px] rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-white flex flex-col justify-between text-slate-900 text-center relative select-none">
                    
                    {/* Top Institute Header Banner */}
                    <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-3 pt-4">
                      <div className="text-[13px] font-black tracking-tight leading-tight">আইডিয়াল মডেল উচ্চ বিদ্যালয়</div>
                      <div className="text-[9px] text-emerald-200 mt-0.5">EIIN: 108420 | স্থাপিত: ১৯৯৮</div>
                      <div className="mt-2 inline-block px-3 py-0.5 bg-amber-400 text-slate-900 text-[10px] font-black rounded-full uppercase tracking-wider">
                        STUDENT IDENTITY CARD
                      </div>
                    </div>

                    {/* Student Photo & Info */}
                    <div className="px-4 py-2 flex flex-col items-center">
                      <div className="w-20 h-20 rounded-full border-2 border-emerald-600 p-0.5 shadow-sm bg-slate-100 flex items-center justify-center overflow-hidden mb-2">
                        <Users className="w-12 h-12 text-slate-400" />
                      </div>
                      
                      <div className="text-sm font-bold text-slate-900">মুহাম্মাদ তানভীর হাসান</div>
                      <div className="text-[11px] font-semibold text-emerald-700">শ্রেণি: দশম (বিজ্ঞান)</div>
                      
                      <div className="w-full mt-3 grid grid-cols-2 gap-1 text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-100 text-left">
                        <div><span className="text-slate-400">রোল:</span> <strong>০১</strong></div>
                        <div><span className="text-slate-400">আইডি:</span> <strong>STD-2026-01</strong></div>
                        <div><span className="text-slate-400">গ্রুপ:</span> <strong>বিজ্ঞান</strong></div>
                        <div><span className="text-slate-400">রক্ত:</span> <strong className="text-rose-600">B+ (পজিটিভ)</strong></div>
                      </div>
                    </div>

                    {/* Bottom Signature & Barcode */}
                    <div className="px-4 pb-3 flex items-end justify-between border-t border-slate-100 pt-2">
                      <div className="p-1 bg-white border border-slate-200 rounded">
                        <QrCode className="w-10 h-10 text-slate-800" />
                      </div>
                      <div className="text-right">
                        <div className="text-[8px] font-script text-slate-600 italic">Signature</div>
                        <div className="text-[9px] font-bold text-slate-800 border-t border-slate-400 pt-0.5">অধ্যক্ষ / প্রধান শিক্ষক</div>
                      </div>
                    </div>
                  </div>

                  {/* Card Key Highlights */}
                  <div className="space-y-4 text-left max-w-sm">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">আন্তর্জাতিক CR-80 মাপের পিভিসি কার্ড</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      আন্তর্জাতিক ক্রেডিট কার্ড সাইজ (৫৪ মিমি × ৮৫.৬ মিমি) নিখুঁত মাপে শিক্ষার্থী ও শিক্ষকদের কার্ড তৈরি হয়। যেকোনো প্লাস্টিক কার্ড বা কালার প্রিন্টারে সরাসরি প্রিন্টযোগ্য।
                    </p>
                    <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>স্মার্ট কিউআর কোড ভেরিফিকেশন সুবিধা</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>প্রধান শিক্ষকের ডিজিটাল স্বাক্ষর অন্তর্ভুক্তি</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>এ৪ পেপারে একসাথে একাধিক কার্ড প্রিন্ট শিট</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: EXAM, ADMIT & TABULATION PREVIEW */}
            {activeTab === 'exam' && (
              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs animate-in fade-in duration-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
                  
                  {/* Admit Card Mockup */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <div>
                        <div className="text-xs font-bold text-slate-900">বার্ষিক মূল্যায়ন পরীক্ষা — ২০২৬</div>
                        <div className="text-[10px] text-slate-500">প্রবেশপত্র (Admit Card)</div>
                      </div>
                      <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Verified</span>
                    </div>

                    <div className="flex gap-3 text-xs">
                      <div className="w-14 h-16 bg-slate-200 rounded border border-slate-300 flex items-center justify-center text-[10px] text-slate-500">
                        ছবি
                      </div>
                      <div className="space-y-1">
                        <div>নাম: <strong>সাদিয়া আক্তার</strong></div>
                        <div>শ্রেণি: <strong>নবম</strong> | শাখা: <strong>পদ্মা</strong></div>
                        <div>রোল: <strong>০৪</strong> | আইডি: <strong>STD-2026-0904</strong></div>
                      </div>
                    </div>

                    <div className="text-[10px] bg-white p-2 rounded border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-700">বিষয় ও পরীক্ষার সময়সূচি:</div>
                      <div className="text-slate-500">বাংলা ১ম ও ২য় পত্র, ইংরেজি, গণিত, বিজ্ঞান...</div>
                    </div>
                  </div>

                  {/* Tabulation & Results Feature List */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">পরীক্ষার সম্পূর্ণ অটোমেশন ও গ্রেডিং</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      পরীক্ষার আগে এক ক্লিকে রোল অনুযায়ী সিট লেবেল ও প্রবেশপত্র তৈরি করুন। পরীক্ষার পর নম্বর এন্ট্রি করলে স্বয়ংক্রিয় জিপিএ, লেটার গ্রেড ও মেধা তালিকা তৈরি হয়ে যায়।
                    </p>
                    <ul className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>জাতীয় শিক্ষাক্রম অনুযায়ী স্বয়ংক্রিয় GPA ও গ্রেড হিসাব</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>শিক্ষার্থীদের জন্য অভিভাবক কপি মার্কশিট প্রিন্ট</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>পরীক্ষার হলের বেঞ্চের জন্য সিট লেবেল জেনারেটর</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CORE MODULES GRID                                                      */}
      {/* ========================================================================= */}
      <section id="modules" className={`py-20 border-t ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              মডিউল ওভারভিউ
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              একটি সফটওয়্যারে প্রতিষ্ঠানের সব সমাধান
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              বিদ্যালোকের প্রতিটি ফিচার তৈরি হয়েছে বাংলাদেশের স্কুল, মাদ্রাসা ও কলেজের বাস্তব প্রশাসনিক অভিজ্ঞতার ওপর ভিত্তি করে।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {modules.map((m, idx) => {
              const IconComp = m.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-emerald-500/40 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComp className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {m.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {m.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. MONETIZATION & ADSENSE SAFE CONTAINER                                  */}
      {/* ========================================================================= */}
      <section className="max-w-4xl mx-auto px-4 py-8">
        <AdSenseBanner
          slot="1234567890"
          minHeight={90}
          className="rounded-2xl"
          label="বিজ্ঞাপন (Advertisement)"
        />
      </section>

      {/* ========================================================================= */}
      {/* 6. DESKTOP VS WEB CHOICE SECTION                                         */}
      {/* ========================================================================= */}
      <section id="desktop" className="py-20 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              ব্যবহারের মাধ্যম
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              আপনার পছন্দমতো মাধ্যমে ব্যবহার করুন
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              আপনি চাইলে ব্রাউজারে সরাসরি চালাতে পারেন, অথবা স্থায়ী পিসি অ্যাপ হিসেবে ইনস্টল করে নিতে পারেন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Card 1: Web Edition */}
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">ক্লাউডফ্লেয়ার ওয়েব সংস্করণ</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  কোনো সফটওয়্যার ইনস্টল করার ঝামেলা ছাড়াই যেকোনো কম্পিউটার বা ল্যাপটপের ব্রাউজারে অবিলম্বে কাজ শুরু করতে পারেন।
                </p>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>যেকোনো ডিভাইসের ব্রাউজারে চলে</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>কোনো সেটআপ বা ইন্সটলেশন দরকার নেই</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>ব্রাউজারের IndexedDB-তে ডাটা সুরক্ষিত থাকে</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/app"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 transition"
              >
                <span>ওয়েবে শুরু করুন</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Card 2: Desktop Edition */}
            <div className="p-8 rounded-3xl bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900 border-2 border-emerald-500/30 shadow-md flex flex-col justify-between space-y-6 relative">
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white shadow-2xs">
                  স্থায়ী ব্যবহারের জন্য সেরা
                </span>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                  <Laptop className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">অফিসিয়াল ডেস্কটপ সংস্করণ (Windows)</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  বিদ্যালয়ের প্রধান কম্পিউটার বা হিসাবরক্ষণ ডেস্কটপের জন্য সম্পূর্ণ অফলাইন ও স্থায়ী সফটওয়্যার অ্যাপ্লিকেশন।
                </p>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>ইন্টারনেট ছাড়াই ১০০% অফলাইন ও দ্রুতগতির</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>হার্ডডিস্কে সরাসরি ব্যাকআপ সংরক্ষণ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>প্রিন্টার ও কার্ড মেশিনের সাথে সর্বোচ্চ সামঞ্জস্য</span>
                  </li>
                </ul>
              </div>

              <a
                href={desktopDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition"
              >
                <Download className="w-4 h-4" />
                <span>ডেস্কটপ সেটআপ ডাউনলোড (v1.1.0)</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ)                                       */}
      {/* ========================================================================= */}
      <section id="faq" className={`py-20 border-t ${isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              জিজ্ঞাসা ও উত্তর
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              সাধারণ জিজ্ঞাসা (FAQ)
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-4 px-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-emerald-600' : ''}`} />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          
          {/* Copyright & Brand */}
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="font-bold text-slate-800 dark:text-slate-200">বিদ্যালোক (Biddalok)</span>
              <span>— সংস্করণ ১.১.০</span>
            </div>
            <p>
              একটি যৌথ উদ্যোগ: <strong className="text-slate-700 dark:text-slate-300">SoftDows</strong> ও <strong className="text-slate-700 dark:text-slate-300">NiceTrix</strong> ডিজিটাল সল্যুশন্স।
            </p>
          </div>

          {/* Compliance & Policy Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 font-semibold">
            <Link to="/about" className="hover:text-emerald-600 transition">আমাদের সম্পর্কে</Link>
            <Link to="/privacy-policy" className="hover:text-emerald-600 transition">গোপনীয়তা নীতি</Link>
            <Link to="/terms" className="hover:text-emerald-600 transition">ব্যবহারের শর্তাবলী</Link>
            <Link to="/contact" className="hover:text-emerald-600 transition">যোগাযোগ ও সহায়তা</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
export default LandingPage;
