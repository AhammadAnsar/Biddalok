import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Globe, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ContactPage: React.FC = () => {
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
          <span className="text-xs font-bold text-slate-600">যোগাযোগ ও সহায়তা</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-100 text-teal-800 shadow-sm mx-auto">
            <MessageSquare className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            যোগাযোগ ও টেকনিক্যাল সাপোর্ট (Contact & Support)
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            বিদ্যালোক সফটওয়্যার ব্যবহার, ইনস্টলেশন বা প্রাতিষ্ঠানিক ডাটা মাইগ্রেশনে যেকোনো প্রয়োজনে আমরা আপনার পাশে আছি।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Mail className="w-5 h-5 text-emerald-600" />
              ইমেইল যোগাযোগ
            </h2>
            <div className="space-y-2 text-sm text-slate-600">
              <p>সাধারণ ও প্রাতিষ্ঠানিক সাপোর্ট:</p>
              <a href="mailto:support@nicetrix.com" className="font-bold text-emerald-700 block text-base hover:underline">
                support@nicetrix.com
              </a>
              <p className="pt-2">সফটওয়্যার আর্কিটেক্ট ও লিড ডেভেলপার:</p>
              <a href="mailto:ahammadansar75@gmail.com" className="font-bold text-slate-800 block hover:underline">
                ahammadansar75@gmail.com
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              অফিসিয়াল পোর্টাল ও রিসোর্স
            </h2>
            <div className="space-y-2 text-sm text-slate-600">
              <p>লাইভ পোর্টাল:</p>
              <a href="https://biddalok.nicetrix.com" target="_blank" rel="noopener noreferrer" className="font-bold text-indigo-700 block text-base hover:underline">
                https://biddalok.nicetrix.com
              </a>
              <p className="pt-2">নেটওয়ার্ক সাইট:</p>
              <a href="https://nicetrix.com" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-800 block hover:underline">
                https://nicetrix.com
              </a>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-sm text-emerald-950 space-y-2 text-center">
          <h3 className="font-bold text-base">প্রতিষ্ঠানের জন্য স্পেশালাইজড সহায়তা প্রয়োজন?</h3>
          <p className="max-w-xl mx-auto text-emerald-800">
            আপনার বিদ্যালয় বা কলেজের পুরাতন এক্সেল শীট বা ডাটাবেজ থেকে বিদ্যালোকে শিক্ষার্থী মাইগ্রেশন করতে সরাসরি ইমেইল করুন। আমাদের টেকনিক্যাল টিম বিনামূল্যে সহায়তা প্রদান করবে।
          </p>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        ব্যবস্থাপনায়: Biddalok by NiceTrix | Developed by SoftDows • সর্বস্বত্ব সংরক্ষিত © ২০২৬
      </footer>
    </div>
  );
};
