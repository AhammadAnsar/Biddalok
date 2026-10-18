import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, ServerOff, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোমপেজে ফিরে যান</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span className="text-xs font-bold text-slate-600">গোপনীয়তা ও ডাটা নিরাপত্তা নীতি</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            গোপনীয়তা নীতি (Privacy Policy)
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            সর্বশেষ পরিমার্জন: ১৭ অক্টোবর, ২০২৬ • বিদ্যালয় ডাটাবেজ ও ব্যবহারকারীর পূর্ণাঙ্গ তথ্য সুরক্ষায় আমরা দায়বদ্ধ।
          </p>
        </div>

        {/* 100% Institutional Data Security Guarantee Banner */}
        <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-md space-y-3">
          <div className="flex items-center gap-3">
            <ServerOff className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg font-bold text-emerald-100">
              ১০০% লোকাল ডাটা নীতি (Zero Cloud Leakage Guarantee)
            </h2>
          </div>
          <p className="text-sm text-emerald-200 leading-relaxed">
            বিদ্যালোক (Biddalok) একটি <strong>লোকাল-ফার্স্ট অফলাইন ও ক্লাউডলেস আর্কিটেকচার</strong>-এ নির্মিত। আপনার বিদ্যালয়ের শিক্ষার্থী, শিক্ষক, অভিভাবক, ফলাফল, ব্যাংক হিসাব বা প্রাতিষ্ঠানিক যেকোনো তথ্য আপনার ব্যবহৃত ডিভাইস/ব্রাউজারের সুরক্ষিত <strong>IndexedDB ডাটাবেজে</strong> সংরক্ষিত থাকে। আমাদের কোনো কেন্দ্রীয় সার্ভার নেই যেখানে আপনার প্রাতিষ্ঠানিক ডাটা আপলোড বা সংরক্ষিত হয়।
          </p>
        </div>

        {/* Sections */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs leading-relaxed text-sm">
          
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              ১. কোন তথ্যগুলো কখনোই আমাদের কাছে আসে না
            </h3>
            <p className="text-slate-600 pl-6">
              শিক্ষার্থীদের নাম, পিতা-মাতার এনআইডি, জন্ম নিবন্ধন সনদ, জন্ম তারিখ, মোবাইল নম্বর, পরীক্ষার ফলাফল, ব্যাংক হিসাব ও রাউটিং নম্বর, এবং ফি কালেকশনের হিসাব সম্পূর্ণ স্থানীয়ভাবে আপনার কম্পিউটারে প্রসেস হয়। আমরা বা কোনো তৃতীয় পক্ষ এই তথ্য পড়তে, কপি করতে বা ট্র্যাক করতে পারে না।
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              ২. কুকিজ ও গুগল এডসেন্স (Google AdSense)
            </h3>
            <p className="text-slate-600 pl-6">
              আমাদের প্ল্যাটফর্মের ফ্রিতে পরিচালনা ও রক্ষণাবেক্ষণের স্বার্থে আমরা গুগল এডসেন্স (Google AdSense, Publisher: ca-pub-6673594317291335) বিজ্ঞাপন প্রদর্শন করি। গুগল ও তার পার্টনারগণ ব্যবহারকারীর ব্রাউজিং অভিজ্ঞতা অনুযায়ী প্রাসঙ্গিক বিজ্ঞাপন দেখানোর জন্য কুকিজ (Cookies) ব্যবহার করতে পারে। গুগল কীভাবে ডাটা ব্যবহার করে তা জানতে <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-emerald-700 font-semibold underline">গুগল পলিসি পেজ</a> দেখুন।
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              ৩. গুগল এনালিটিক্স (Google Analytics 4)
            </h3>
            <p className="text-slate-600 pl-6">
              সাইটের গতি ও সাধারণ ট্রাফিক বিশ্লেষণের জন্য আমরা গুগল এনালিটিক্স ব্যবহার করি। আমরা কঠোরভাবে <strong>IP Anonymization</strong> এবং <strong>Restricted Data Processing</strong> চালু রেখেছি। এনালিটিক্স শুধুমাত্র ওয়েবসাইট পরিদর্শনের সংখ্যা ও প্রযুক্তিগত তথ্য ট্র্যাক করে; কোনো শিক্ষার্থী বা অ্যাকাউন্টের ডাটা এতে সংগৃহীত হয় না।
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              ৪. ব্যাকআপ ও ডাটা মালিকানা
            </h3>
            <p className="text-slate-600 pl-6">
              আপনার প্রাতিষ্ঠানিক ডাটার একক ও নিরঙ্কুশ মালিক আপনার প্রতিষ্ঠান। আপনি সফটওয়্যারের ব্যাকআপ মডিউল থেকে যেকোনো সময় এক ক্লিকে সম্পূর্ণ ডাটাবেজ ব্যাকআপ (JSON/Encrypted) এক্সপোর্ট করতে পারেন এবং যেকোনো নতুন কম্পিউটারে রিস্টোর করতে পারেন।
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              ৫. যোগাযোগ
            </h3>
            <p className="text-slate-600 pl-6">
              গোপনীয়তা সংক্রান্ত যেকোনো প্রশ্ন বা পরামর্শের জন্য আমাদের সাথে যোগাযোগ করুন:<br />
              ইমেইল: <a href="mailto:support@nicetrix.com" className="text-emerald-700 font-semibold">support@nicetrix.com</a> | <a href="mailto:ahammadansar75@gmail.com" className="text-emerald-700 font-semibold">ahammadansar75@gmail.com</a>
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        ব্যবস্থাপনায়: Biddalok by NiceTrix | Developed by SoftDows • সর্বস্বত্ব সংরক্ষিত © ২০২৬
      </footer>
    </div>
  );
};
