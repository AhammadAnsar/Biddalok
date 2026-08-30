import React, { useState } from 'react';
import { 
  Phone, MessageSquare, Facebook, Users, Mail, ExternalLink, 
  Copy, Check, Headphones, Sparkles, Send, Globe, ChevronRight, X, Clock, HelpCircle
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export const SupportModal: React.FC<SupportModalProps> = ({ 
  isOpen, 
  onClose,
  initialTopic = 'general'
}) => {
  const { language, institution } = useAppStore();
  const isBn = language === 'bn';

  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(initialTopic);
  const [customQuery, setCustomQuery] = useState('');

  if (!isOpen) return null;

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
    <div 
      id="support-modal-backdrop"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Header with vibrant branding */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white p-5 sm:p-6 relative shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <Headphones className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                    {isBn ? 'বিদ্যালোক সাপোর্ট ও কমিউনিটি হাব' : 'Biddalok Support & Community Hub'}
                  </h3>
                  <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-400/30 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {isBn ? 'সক্রিয় সাপোর্ট' : 'Online'}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-indigo-200 mt-1">
                  {isBn 
                    ? 'যে কোনো প্রয়োজনে আমাদের সাথে সরাসরি যোগাযোগ করুন বা কমিউনিটিতে যুক্ত হোন' 
                    : 'Connect directly with our official support team & active user community'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Main 4 Official Channels Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              {isBn ? 'অফিশিয়াল কমিউনিটি ও সাপোর্ট মাধ্যমসমূহ' : 'Official Community & Direct Support Channels'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* 1. Direct Hotline Call */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/40 rounded-2xl p-4 border border-emerald-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">{isBn ? 'সরাসরি হটলাইন কল' : 'Direct Hotline Call'}</h5>
                        <p className="text-[11px] text-emerald-700 font-medium">{isBn ? 'তাৎক্ষণিক কথা বলুন' : 'Instant voice support'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      24/7
                    </span>
                  </div>
                  <div className="mt-3 bg-white px-3 py-2 rounded-xl border border-emerald-200 font-mono text-base sm:text-lg font-bold text-slate-900 flex items-center justify-between">
                    <span>{CONTACT_INFO.phone}</span>
                    <button
                      type="button"
                      onClick={handleCopyPhone}
                      className="text-xs text-slate-500 hover:text-emerald-700 p-1 flex items-center gap-1 font-sans"
                      title={isBn ? 'নম্বর কপি করুন' : 'Copy number'}
                    >
                      {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{copiedPhone ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-emerald-100 flex gap-2">
                  <a
                    href={CONTACT_INFO.phoneTel}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3 rounded-xl text-center shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {isBn ? 'এখনই কল দিন' : 'Call Now'}
                  </a>
                  <a
                    href={CONTACT_INFO.whatsappChat}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1"
                    title="WhatsApp Message"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {isBn ? 'হোয়াটসঅ্যাপ' : 'WhatsApp'}
                  </a>
                </div>
              </div>

              {/* 2. WhatsApp Community Channel */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50/40 rounded-2xl p-4 border border-green-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-green-600 text-white flex items-center justify-center shadow-md">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">{isBn ? 'হোয়াটসঅ্যাপ চ্যানেল' : 'WhatsApp Channel'}</h5>
                        <p className="text-[11px] text-green-700 font-medium">{isBn ? 'সকল আপডেট ও নোটিশ' : 'Official News & Updates'}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded-md">
                      Channel
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs text-slate-600 line-clamp-2">
                    {isBn 
                      ? 'নতুন ফিচার, আপডেট, এবং ব্যবহারবিধি সবার আগে পেতে আমাদের চ্যানেলে যুক্ত থাকুন।' 
                      : 'Stay updated with the latest software features, guides, and official notices.'}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-green-100">
                  <a
                    href={CONTACT_INFO.whatsappChannel}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded-xl text-center shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {isBn ? 'হোয়াটসঅ্যাপ চ্যানেলে যুক্ত হোন' : 'Join WhatsApp Channel'}
                  </a>
                </div>
              </div>

              {/* 3. Facebook Official Page */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40 rounded-2xl p-4 border border-blue-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                        <Facebook className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">{isBn ? 'অফিশিয়াল ফেসবুক পেইজ' : 'Official Facebook Page'}</h5>
                        <p className="text-[11px] text-blue-700 font-medium">@biddaloklive</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                      Official
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs text-slate-600 line-clamp-2">
                    {isBn 
                      ? 'পেইজ ফলো করে লাইভ চ্যাট করুন এবং বিদ্যালোকের নিয়মিত আপডেট গ্রহণ করুন।' 
                      : 'Follow our official page for live chat and latest ERP developments.'}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-blue-100">
                  <a
                    href={CONTACT_INFO.facebookPage}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-3 rounded-xl text-center shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {isBn ? 'ফেসবুক পেইজ ভিজিট করুন' : 'Visit Facebook Page'}
                  </a>
                </div>
              </div>

              {/* 4. Facebook Community Group */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50/40 rounded-2xl p-4 border border-indigo-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm">{isBn ? 'ফেসবুক ইউজার গ্রুপ' : 'Facebook Community Group'}</h5>
                        <p className="text-[11px] text-indigo-700 font-medium">/groups/biddalok</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-md">
                      Community
                    </span>
                  </div>
                  <p className="mt-2.5 text-xs text-slate-600 line-clamp-2">
                    {isBn 
                      ? 'দেশজুড়ে বিদ্যালয়ের শিক্ষক ও অ্যাডমিনদের সাথে অভিজ্ঞতা শেয়ার ও প্রশ্নোত্তর।' 
                      : 'Connect with hundreds of school admins, teachers and exchange ideas.'}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-indigo-100">
                  <a
                    href={CONTACT_INFO.facebookGroup}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded-xl text-center shadow-sm hover:shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {isBn ? 'কমিউনিটি গ্রুপে যোগ দিন' : 'Join Facebook Group'}
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Quick WhatsApp Message Builder */}
          <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Send className="w-3.5 h-3.5 text-indigo-600" />
              {isBn ? 'সরাসরি সহায়তা বার্তা পাঠান (হোয়াটসঅ্যাপে তাৎক্ষণিক উত্তর)' : 'Send Direct Inquiry via WhatsApp'}
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              {isBn 
                ? 'বিষয় নির্বাচন করে আপনার জিজ্ঞাসা লিখুন এবং সরাসরি WhatsApp বাটনে ক্লিক করুন।' 
                : 'Select topic, type your issue, and click to send directly to our support team.'}
            </p>

            <form onSubmit={handleSendWhatsAppMessage} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isBn ? 'সমস্যার ক্ষেত্র / মডিউল' : 'Module / Topic'}
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full text-xs font-medium bg-white border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
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
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {isBn ? 'প্রতিষ্ঠানের নাম' : 'Institution Name'}
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={institution?.name || 'বিদ্যালোক ডেমো প্রতিষ্ঠান'}
                    className="w-full text-xs font-medium bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {isBn ? 'আপনার বার্তা / সমস্যা লিখুন' : 'Describe your question or issue'}
                </label>
                <textarea
                  rows={2}
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder={isBn ? 'এখানে বিস্তারিত লিখুন (যেমন: প্রিন্ট সাইজ কীভাবে অ্যাডজাস্ট করব?)...' : 'Type your message details here...'}
                  className="w-full text-xs bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  {isBn ? 'হোয়াটসঅ্যাপে মেসেজ পাঠান' : 'Send via WhatsApp'}
                </button>
              </div>
            </form>
          </div>

          {/* Developer & Support Hours Footnote */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200 gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{isBn ? 'সাপোর্ট সময়: প্রতিদিন সকাল ৯:০০ - রাত ১০:০০' : 'Support Hours: 9:00 AM - 10:00 PM Daily'}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-slate-400">SoftDows Technologies</span>
              <span>&bull;</span>
              <button 
                type="button" 
                onClick={handleCopyEmail}
                className="text-indigo-600 hover:underline flex items-center gap-1"
              >
                <Mail className="w-3 h-3" />
                {copiedEmail ? (isBn ? 'ইমেইল কপি হয়েছে' : 'Email Copied') : CONTACT_INFO.email}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
