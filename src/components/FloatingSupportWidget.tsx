import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Headphones, Phone, MessageSquare, Facebook, Users, 
  X, ChevronUp, ChevronDown, ExternalLink, Sparkles
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface FloatingSupportWidgetProps {
  onOpenSupportModal: (topic?: string) => void;
}

export const FloatingSupportWidget: React.FC<FloatingSupportWidgetProps> = ({ 
  onOpenSupportModal 
}) => {
  const { language } = useAppStore();
  const isBn = language === 'bn';
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        className="fixed bottom-4 right-4 z-40 bg-indigo-900 text-white p-2.5 rounded-full shadow-lg hover:bg-indigo-800 transition-all text-xs font-semibold flex items-center gap-1.5 border border-indigo-700"
        title={isBn ? 'সাপোর্ট ওপেন করুন' : 'Open Support'}
      >
        <Headphones className="w-4 h-4 text-emerald-400" />
      </button>
    );
  }

  const CONTACT_INFO = {
    phone: '01813011052',
    phoneTel: 'tel:01813011052',
    whatsappChat: 'https://wa.me/8801813011052',
    whatsappChannel: 'https://chat.whatsapp.com/HCpCjSpDapk2fipq1BB9zi',
    facebookPage: 'https://www.facebook.com/biddaloklive/',
    facebookGroup: 'https://www.facebook.com/groups/biddalok',
  };

  return (
    <aside 
      aria-label={isBn ? 'সাপোর্ট ও যোগাযোগ উইজেট' : 'Support & Contact Widget'}
      className="fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 flex flex-col items-end print:hidden select-none"
    >
      {/* Expanded Quick Support Menu */}
      {isExpanded && (
        <div className="mb-3 bg-white rounded-2xl shadow-2xl border border-slate-200/90 w-72 sm:w-80 overflow-hidden animate-fadeIn backdrop-blur-xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 text-white p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <Headphones className="w-4 h-4 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-tight">
                  {isBn ? 'বিদ্যালোক সরাসরি সাপোর্ট' : 'Biddalok Live Support'}
                </h4>
                <p className="text-[10px] text-emerald-300 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {isBn ? 'আমরা অনলাইন আছি' : 'Online & Ready to Help'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1 text-indigo-300 hover:text-white rounded-lg hover:bg-white/10"
              aria-label="Collapse"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action Buttons List */}
          <div className="p-3 space-y-2 bg-slate-50/50">
            
            {/* 1. Phone Call */}
            <a
              href={CONTACT_INFO.phoneTel}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition-all text-slate-800 group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">{isBn ? 'সরাসরি কল দিন' : 'Direct Call'}</div>
                  <div className="text-[11px] font-mono text-slate-500 group-hover:text-emerald-700">{CONTACT_INFO.phone}</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                {isBn ? 'কল' : 'Call'}
              </span>
            </a>

            {/* 2. WhatsApp Channel */}
            <a
              href={CONTACT_INFO.whatsappChannel}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-green-50 border border-slate-200 hover:border-green-300 transition-all text-slate-800 group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">{isBn ? 'হোয়াটসঅ্যাপ চ্যানেল' : 'WhatsApp Channel'}</div>
                  <div className="text-[10px] text-slate-500">{isBn ? 'আপডেট ও নোটিশ' : 'Updates & Notices'}</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-green-600" />
            </a>

            {/* 3. Facebook Page */}
            <a
              href={CONTACT_INFO.facebookPage}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all text-slate-800 group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Facebook className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">{isBn ? 'ফেসবুক পেইজ' : 'Facebook Page'}</div>
                  <div className="text-[10px] text-slate-500">@biddaloklive</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
            </a>

            {/* 4. Facebook Group */}
            <a
              href={CONTACT_INFO.facebookGroup}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all text-slate-800 group shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold">{isBn ? 'ফেসবুক কমিউনিটি গ্রুপ' : 'Facebook Community'}</div>
                  <div className="text-[10px] text-slate-500">/groups/biddalok</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600" />
            </a>

            {/* View Full Hub Button & Support Page Link */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onOpenSupportModal();
                }}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-[11px] font-bold py-2 px-2 rounded-xl shadow transition-all flex items-center justify-center gap-1 text-center"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{isBn ? 'মেসেজ ড্রাফটার' : 'Quick Message'}</span>
              </button>

              <Link
                to="/support"
                onClick={() => setIsExpanded(false)}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-[11px] font-bold py-2 px-2 rounded-xl shadow transition-all flex items-center justify-center gap-1 text-center"
              >
                <Headphones className="w-3 h-3" />
                <span>{isBn ? 'সাপোর্ট পেইজ' : 'Support Page'}</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Trigger Pill / Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`
            flex items-center gap-2.5 px-3.5 py-2.5 rounded-full shadow-xl transition-all duration-300
            ${isExpanded 
              ? 'bg-indigo-950 text-white ring-4 ring-indigo-300/40 scale-105' 
              : 'bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-900 text-white hover:from-indigo-800 hover:to-indigo-950 hover:shadow-indigo-500/25 hover:scale-105'}
            border border-indigo-600/40
          `}
          title={isBn ? 'সাপোর্ট ও যোগাযোগ' : 'Help & Support'}
        >
          <div className="relative">
            <Headphones className="w-5 h-5 text-emerald-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-900 animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-wide hidden sm:inline">
            {isBn ? 'সাপোর্ট ও যোগাযোগ' : 'Support & Contact'}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-indigo-300" />
          ) : (
            <ChevronUp className="w-4 h-4 text-indigo-300" />
          )}
        </button>

        {/* Small dismiss button */}
        {!isExpanded && (
          <button
            onClick={() => setIsDismissed(true)}
            className="w-6 h-6 rounded-full bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center text-[10px] transition-colors"
            title={isBn ? 'হাইড করুন' : 'Hide'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </aside>
  );
};
