import React, { useState } from 'react';
import { 
  Headphones, Phone, MessageSquare, Facebook, Users, 
  ExternalLink, Copy, Check, Send, Sparkles, Clock, Mail,
  ShieldCheck, HelpCircle, FileText, ChevronRight
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

const Support: React.FC = () => {
  const { language, institution } = useAppStore();
  const isBn = language === 'bn';

  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('general');
  const [customQuery, setCustomQuery] = useState('');

  const CONTACT_INFO = {
    phone: '01813011052',
    phoneFormatted: '০১৮১৩-০১১০৫২',
    phoneTel: 'tel:01813011052',
    whatsappChat: 'https://wa.me/8801813011052',
    whatsappChannel: 'https://chat.whatsapp.com/HCpCjSpDapk2fipq1BB9zi',
    facebookPage: 'https://www.facebook.com/biddaloklive/',
    facebookGroup: 'https://www.facebook.com/groups/biddalok',
    email: 'ahammadansar75@gmail.com',
    website: 'https://softdows.com/biddalok'
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(CONTACT_INFO.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(CONTACT_INFO.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSendWhatsAppMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const instituteName = institution?.name || 'বিদ্যালয়';
    const topicLabels: Record<string, string> = {
      testimonial: 'প্রশংসাপত্র ও প্রত্যয়নপত্র সংক্রান্ত',
      admission: 'ভর্তি ও শিক্ষার্থী ডাটা সংক্রান্ত',
      academic: 'একাডেমিক ও রেজাল্ট সংক্রান্ত',
      print_margin: 'প্রিন্ট মার্জিন ও পিডিএফ সংক্রান্ত',
      backup: 'ডাটাবেজ ও ব্যাকআপ সংক্রান্ত',
      general: 'সাধারণ সহায়তা / জিজ্ঞাসা'
    };

    const topicText = topicLabels[selectedTopic] || 'সাধারণ সহায়তা';
    const message = `আসসালামু আলাইকুম।\n\nপ্রতিষ্ঠান: ${instituteName}\nবিষয়: ${topicText}\n\nবিস্তারিত বার্তা:\n${customQuery || 'আমি বিদ্যালোক সফটওয়্যার ব্যবহারে সহায়তা চাচ্ছি।'}`;
    
    const encodedUrl = `https://wa.me/8801813011052?text=${encodeURIComponent(message)}`;
    window.open(encodedUrl, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl border border-indigo-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-semibold backdrop-blur-sm border border-white/15">
              <Headphones className="w-3.5 h-3.5" />
              <span>{isBn ? 'বিদ্যালোক হেল্প ও সাপোর্ট সেন্টার' : 'Biddalok Help & Support Center'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isBn ? 'আমাদের সাথে যোগাযোগ ও সাপোর্ট' : 'Contact Us & Official Support'}
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              {isBn 
                ? 'বিদ্যালোক সফটওয়্যার ব্যবহারে যে কোনো কারিগরি সহায়তা, কাস্টমাইজেশন বা দিকনির্দেশনার জন্য আমাদের অফিশিয়াল চ্যানেলে সরাসরি যুক্ত থাকুন।' 
                : 'Get technical help, customization advice, and direct support for your institution via our official channels.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={CONTACT_INFO.phoneTel}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>{isBn ? 'সরাসরি কল: ০১৮১৩-০১১০৫২' : 'Call: 01813011052'}</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4 Official Support Pillars */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3.5 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          {isBn ? 'অফিশিয়াল কমিউনিটি ও সাপোর্ট মাধ্যমসমূহ' : 'Official Support & Community Channels'}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Hotline / Mobile */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-2xl p-5 border border-emerald-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                  24/7 Helpline
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{isBn ? 'সরাসরি হটলাইন কল' : 'Direct Helpline'}</h3>
              <p className="text-xs text-emerald-800 font-medium mt-0.5">{isBn ? 'তাৎক্ষণিক কথা বলুন' : 'Instant Voice Call'}</p>
              
              <div className="mt-3 bg-white px-3 py-2 rounded-xl border border-emerald-200 font-mono text-base font-bold text-slate-900 flex items-center justify-between">
                <span>{CONTACT_INFO.phone}</span>
                <button
                  type="button"
                  onClick={handleCopyPhone}
                  className="text-xs text-slate-500 hover:text-emerald-700 p-1 flex items-center gap-1 font-sans"
                  title={isBn ? 'নম্বর কপি করুন' : 'Copy number'}
                >
                  {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className="text-[10px]">{copiedPhone ? (isBn ? 'কপি' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
                </button>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-100 flex gap-2">
              <a
                href={CONTACT_INFO.phoneTel}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl text-center shadow transition-all flex items-center justify-center gap-1"
              >
                <Phone className="w-3.5 h-3.5" />
                {isBn ? 'কল দিন' : 'Call'}
              </a>
              <a
                href={CONTACT_INFO.whatsappChat}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1"
                title="WhatsApp Chat"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* 2. WhatsApp Channel */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-2xl p-5 border border-green-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-600 text-white flex items-center justify-center shadow-md">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-md">
                  Official Channel
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{isBn ? 'হোয়াটসঅ্যাপ চ্যানেল' : 'WhatsApp Channel'}</h3>
              <p className="text-xs text-green-800 font-medium mt-0.5">{isBn ? 'সকল আপডেট ও নোটিশ' : 'Official Notices'}</p>
              <p className="text-xs text-slate-600 mt-2">
                {isBn ? 'সবার আগে নতুন ভার্সন ও ফিচার আপডেট পেতে চ্যানেলে যুক্ত হোন।' : 'Get latest updates, guides, and feature releases directly on WhatsApp.'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-green-100">
              <a
                href={CONTACT_INFO.whatsappChannel}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 rounded-xl text-center shadow transition-all flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {isBn ? 'চ্যানেলে যুক্ত হোন' : 'Join Channel'}
              </a>
            </div>
          </div>

          {/* 3. Facebook Official Page */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl p-5 border border-blue-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                  <Facebook className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                  Official Page
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{isBn ? 'অফিশিয়াল ফেসবুক পেইজ' : 'Facebook Page'}</h3>
              <p className="text-xs text-blue-800 font-medium mt-0.5">@biddaloklive</p>
              <p className="text-xs text-slate-600 mt-2">
                {isBn ? 'পেইজ ফলো করে মেসেঞ্জারে লাইভ চ্যাট করুন ও খবর জানুন।' : 'Follow official page and message us anytime on Facebook.'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-100">
              <a
                href={CONTACT_INFO.facebookPage}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-xl text-center shadow transition-all flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {isBn ? 'পেইজ ভিজিট করুন' : 'Visit Page'}
              </a>
            </div>
          </div>

          {/* 4. Facebook User Community Group */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50/50 rounded-2xl p-5 border border-indigo-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
                  Community Group
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{isBn ? 'ফেসবুক ইউজার গ্রুপ' : 'Facebook Group'}</h3>
              <p className="text-xs text-indigo-800 font-medium mt-0.5">/groups/biddalok</p>
              <p className="text-xs text-slate-600 mt-2">
                {isBn ? 'বিভিন্ন প্রতিষ্ঠানের শিক্ষকদের সাথে আলোচনা ও অভিজ্ঞতা বিনিময়।' : 'Connect with teachers and admins nationwide for tips and Q&A.'}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-indigo-100">
              <a
                href={CONTACT_INFO.facebookGroup}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 rounded-xl text-center shadow transition-all flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {isBn ? 'গ্রুপে যোগ দিন' : 'Join Group'}
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Direct WhatsApp Query Builder */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-600" />
            {isBn ? 'সরাসরি সহায়তা বার্তা পাঠান (হোয়াটসঅ্যাপে তাৎক্ষণিক উত্তর)' : 'Send Direct Message via WhatsApp'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isBn 
              ? 'আপনার প্রতিষ্ঠানের নাম ও বিষয় নির্বাচন করে বার্তা লিখলে সফটওয়্যার সরাসরি হোয়াটসঅ্যাপে সংযোগ তৈরি করবে।' 
              : 'Select your topic, describe the issue, and launch directly into WhatsApp.'}
          </p>
        </div>

        <form onSubmit={handleSendWhatsAppMessage} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isBn ? 'সমস্যার ক্ষেত্র / মডিউল' : 'Module / Topic'}
              </label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
              >
                <option value="testimonial">{isBn ? 'প্রশংসাপত্র ও প্রত্যয়নপত্র' : 'Testimonial & Attestation'}</option>
                <option value="print_margin">{isBn ? 'প্রিন্ট ও পেজ মার্জিন / পিডিএফ' : 'Print Margin & PDF'}</option>
                <option value="admission">{isBn ? 'শিক্ষার্থী ভর্তি ও ডাটা' : 'Student & Admission'}</option>
                <option value="academic">{isBn ? 'একাডেমিক ক্লাস ও শাখা' : 'Academic Class & Section'}</option>
                <option value="backup">{isBn ? 'ডাটাবেজ ও ব্যাকআপ' : 'Database & Backup'}</option>
                <option value="general">{isBn ? 'সাধারণ জিজ্ঞাসা / অন্য কিছু' : 'General Inquiry / Other'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isBn ? 'প্রতিষ্ঠানের নাম' : 'Institution Name'}
              </label>
              <input
                type="text"
                readOnly
                value={institution?.name || 'বিদ্যালোক ডেমো প্রতিষ্ঠান'}
                className="w-full text-xs font-medium bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isBn ? 'আপনার বার্তা / সমস্যা লিখুন' : 'Describe your inquiry'}
            </label>
            <textarea
              rows={3}
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder={isBn ? 'এখানে বিস্তারিত লিখুন (যেমন: প্রত্যয়নপত্রের মার্জিন কীভাবে বাড়াব?)...' : 'Type your message details here...'}
              className="w-full text-xs bg-white border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              {isBn ? 'হোয়াটসঅ্যাপে মেসেজ পাঠান' : 'Send via WhatsApp'}
            </button>
          </div>
        </form>
      </div>

      {/* Info & Support Hours */}
      <div className="bg-slate-100/80 rounded-2xl p-5 border border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>{isBn ? 'সাপোর্ট সময়সূচী: প্রতিদিন সকাল ৯:০০ - রাত ১০:০০' : 'Support Hours: 9:00 AM - 10:00 PM Daily'}</span>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">SoftDows Technologies</span>
          <span>&bull;</span>
          <button 
            type="button" 
            onClick={handleCopyEmail}
            className="text-indigo-600 hover:underline flex items-center gap-1"
          >
            <Mail className="w-3.5 h-3.5" />
            {copiedEmail ? (isBn ? 'ইমেইল কপি হয়েছে' : 'Email Copied') : CONTACT_INFO.email}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Support;
