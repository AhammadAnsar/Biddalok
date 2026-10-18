import React from 'react';
import { ArrowLeft, Building2, Heart, Award, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
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
          <span className="text-xs font-bold text-slate-600">আমাদের সম্পর্কে</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-800 shadow-sm mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            আমাদের সম্পর্কে (About Biddalok)
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            বিদ্যালোক — বাংলাদেশের শিক্ষাপ্রতিষ্ঠান সমূহের প্রশাসনিক ও প্রাতিষ্ঠানিক কার্যক্রম সহজীকরণের জন্য একটি সমন্বিত ডিজিটাল উদ্যোগ।
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs leading-relaxed text-sm">
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900">আমাদের লক্ষ্য ও দর্শন</h2>
            <p className="text-slate-600">
              বাংলাদেশের অধিকাংশ শিক্ষাপ্রতিষ্ঠানে ইন্টারনেট গতি সীমিত এবং অধিকাংশ ক্লাউড সফটওয়্যার মাসিক বা বাৎসরিক মোটা অঙ্কের সাবস্ক্রিপশন ফি দাবি করে। এছাড়াও ক্লাউডে শিক্ষার্থীদের স্পর্শকাতর তথ্য অনিরাপদ থাকার শঙ্কা থাকে। এই বাস্তবতাকে সামনে রেখে <strong>SoftDows</strong> এবং <strong>NiceTrix</strong> যৌথভাবে ‘বিদ্যালোক’ উদ্ভাবন করেছে — যা কোনো ক্লাউড ফি ছাড়া শতভাগ স্থানীয় ডাটাবেজে অতি-দ্রুত গতিতে কাজ করতে সক্ষম।
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">নিরাপদ ও স্থানীয়</h3>
              <p className="text-xs text-slate-500">আপনার ডাটা বাইরে যায় না, আপনার ডিভাইসেই ১০০% সংরক্ষিত থাকে।</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">বোর্ড স্ট্যান্ডার্ড ফরম্যাট</h3>
              <p className="text-xs text-slate-500">CR-80 আইডি কার্ড, সরকারি বৃত্তি ফরম ও এডমিট কার্ড হুবহু বোর্ড নিয়মে তৈরি।</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">শিক্ষক-বান্ধব ইন্টারফেস</h3>
              <p className="text-xs text-slate-500">সহজ বাংলা ভাষা ও প্রাতিষ্ঠানিক পরিভাষায় পরিচালিত জটিলতাহীন ডিজাইন।</p>
            </div>
          </div>

          <section className="space-y-3 pt-4 border-t border-slate-100">
            <h2 className="text-lg font-black text-slate-900">ডেভেলপমেন্ট পার্টনারশিপ</h2>
            <p className="text-slate-600">
              <strong>SoftDows</strong> — সফটওয়্যার আর্কিটেকচার, অফলাইন পারসিস্টেন্স ইঞ্জিন ও ডেস্কটপ সিস্টেমস ইঞ্জিনিয়ারিং।<br />
              <strong>NiceTrix</strong> — ক্লাউড নেটওয়ার্ক, ওয়েবসাইট ডিস্ট্রিবিউশন ও প্রযুক্তিগত মনিটাইজেশন অবকাঠামো।
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
