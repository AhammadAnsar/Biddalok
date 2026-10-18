import React from 'react';
import { ArrowLeft, FileText, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-emerald-700 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>হোমপেজে ফিরে যান</span>
          </Link>
          <span className="text-xs font-bold text-slate-600">ব্যবহারের শর্তাবলী</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 shadow-sm mx-auto">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            ব্যবহারের শর্তাবলী (Terms of Service)
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            সর্বশেষ পরিমার্জন: ১৭ অক্টোবর, ২০২৬ • বিদ্যালয় পরিচালনায় স্বচ্ছতা ও দায়িত্বশীল ব্যবহারের অঙ্গীকার।
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs leading-relaxed text-sm">
          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              ১. প্ল্যাটফর্মের ব্যবহার
            </h3>
            <p className="text-slate-600 pl-6">
              বিদ্যালোক (Biddalok) শিক্ষাপ্রতিষ্ঠানসমূহের অভ্যন্তরীণ ব্যবস্থাপনা, রাজস্ব বৃত্তি ফরম প্রণয়ন, ফলাফল ও সনদ তৈরিতে সহায়তা করার উদ্দেশ্যে উন্মুক্ত করা হয়েছে। ব্যবহারকারী প্রতিষ্ঠান নিজেদের তথ্য ও নথিপত্রের সঠিকতার জন্য সম্পূর্ণ দায়বদ্ধ।
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              ২. অফলাইন ও ডেস্কটপ সংস্করণ
            </h3>
            <p className="text-slate-600 pl-6">
              ব্যবহারকারীরা চাইলে ওয়েব সংস্করণ ব্যবহার করতে পারেন অথবা সরাসরি আমাদের গিটহাব রিলিজ থেকে উইন্ডোজ পিসি সংস্করণ ডাউনলোড করে সম্পূর্ণ অফলাইনে কোনো ইন্টারনেট সংযোগ ছাড়াই ব্যবহার করতে পারেন।
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              ৩. মেধা সম্পদ ও স্বত্বাধিকার
            </h3>
            <p className="text-slate-600 pl-6">
              বিদ্যালোকের কোড, লোগো, ডিজাইন ও স্থাপত্য SoftDows ও NiceTrix কর্তৃক সংরক্ষিত। তবে আপনার প্রতিষ্ঠানের সংরক্ষিত শিক্ষার্থী তথ্য, ফলাফল ও আর্থিক ডাটা সম্পূর্ণভাবে আপনার প্রতিষ্ঠানের নিজস্ব সম্পদ।
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              ৪. দায়বদ্ধতার সীমাবদ্ধতা
            </h3>
            <p className="text-slate-600 pl-6">
              সফটওয়্যারটি নিয়মিত হালনাগাদ ও নিখুঁত করার সর্বোচ্চ চেষ্টা করা হয়। তবে ব্যবহারকারীর কম্পিউটারের হার্ডওয়্যার ক্র্যাশ বা ব্রাউজার ডাটা অসাবধানতাবশত মুছে ফেলার ক্ষেত্রে নিয়মিত ব্যাকআপ রাখার দায়িত্ব প্রতিষ্ঠানের।
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        ব্যবস্থাপনায়: Biddalok by NiceTrix | Developed by SoftDows • সর্বস্বত্ব সংরক্ষিত © ২০২৬
      </footer>
    </div>
  );
};
