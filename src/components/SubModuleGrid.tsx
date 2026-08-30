import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { 
  Sparkles, Clock, CheckCircle2, ArrowRight, 
  X, MessageSquare, ShieldCheck, ChevronRight 
} from 'lucide-react';
import { SupportModal } from './SupportModal';

export interface SubModule {
  id: string;
  titleEn: string;
  titleBn: string;
  icon: React.ElementType;
  path?: string;
  color?: string;
}

interface SubModuleGridProps {
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  modules: SubModule[];
}

export const SubModuleGrid: React.FC<SubModuleGridProps> = ({
  titleEn,
  titleBn,
  descriptionEn,
  descriptionBn,
  modules,
}) => {
  const navigate = useNavigate();
  const { language } = useAppStore();
  const isBn = language === 'bn';

  const [selectedModule, setSelectedModule] = useState<SubModule | null>(null);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  const handleModuleClick = (mod: SubModule) => {
    if (mod.path) {
      navigate(mod.path);
    } else {
      setSelectedModule(mod);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {isBn ? titleBn : titleEn}
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {isBn ? descriptionBn : descriptionEn}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 rounded-xl font-medium w-fit">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>{isBn ? 'মডিউল ইকোসিস্টেম' : 'Module Ecosystem'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const isLinked = Boolean(mod.path);
          return (
            <button
              key={mod.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 flex flex-col items-center justify-between text-center gap-4 hover:shadow-md hover:border-indigo-300 transition-all group active:scale-[0.98] w-full relative overflow-hidden"
              onClick={() => handleModuleClick(mod)}
            >
              {/* Status Pill */}
              <div className="w-full flex justify-between items-center text-[10px] font-medium">
                {isLinked ? (
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    {isBn ? 'সক্রিয়' : 'Active'}
                  </span>
                ) : (
                  <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {isBn ? 'রোডম্যাপ (v1.1)' : 'Roadmap v1.1'}
                  </span>
                )}
                <span className="text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className={`p-4 rounded-2xl transition-all duration-300 ${mod.color || 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white shadow-sm'}`}>
                <Icon className="w-8 h-8" />
              </div>

              <div className="w-full">
                <h3 className="font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors text-sm sm:text-base">
                  {isBn ? mod.titleBn : mod.titleEn}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {isLinked 
                    ? (isBn ? 'ক্লিক করে প্রবেশ করুন' : 'Click to open')
                    : (isBn ? 'বিস্তারিত ও রিলিজ পরিকল্পনা' : 'View release roadmap')}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feature Preview & Roadmap Modal */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-scale-in">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 to-slate-50">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${selectedModule.color || 'bg-indigo-600 text-white'}`}>
                  {React.createElement(selectedModule.icon, { className: 'w-6 h-6' })}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                    {isBn ? selectedModule.titleBn : selectedModule.titleEn}
                  </h3>
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded-full">
                    {isBn ? 'পরবর্তী সংস্করণের ফিচার' : 'Next Version Feature'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedModule(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm text-slate-600">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-amber-900 text-xs">
                <Clock className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                <p>
                  {isBn 
                    ? `"${selectedModule.titleBn}" মডিউলটি Biddalok ERP এর v1.1.0 সংস্করণের অংশ হিসেবে সক্রিয় উন্নয়নে রয়েছে। এটি খুব শীঘ্রই স্বয়ংক্রিয় আপডেটে যুক্ত হবে।`
                    : `The "${selectedModule.titleEn}" module is under active engineering for the Biddalok v1.1.0 release roadmap.`}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 mb-2 text-xs uppercase tracking-wider">
                  {isBn ? 'এই মডিউলে যা যা থাকছে:' : 'Planned Capabilities:'}
                </h4>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{isBn ? '১০০% অফলাইন এবং সুপার ফাস্ট লোকাল অপারেশন' : '100% Offline & high-speed local operation'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{isBn ? 'এক ক্লিকে রিপোর্ট ও ভাউচার এক্সপোর্ট (A4 / PDF)' : 'One-click A4 & PDF report generation'}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{isBn ? 'স্বয়ংক্রিয় ব্যাকআপ ও ডেটাবেজ প্রোটেকশন' : 'Automatic backup & database sync'}</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => {
                    setSelectedModule(null);
                    setSupportModalOpen(true);
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{isBn ? 'মতামত বা ফিচারের আবেদন' : 'Request Priority Feature'}</span>
                </button>
                <button
                  onClick={() => setSelectedModule(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-xl transition-colors text-xs"
                >
                  {isBn ? 'বন্ধ করুন' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Support Modal if user triggers feedback */}
      <SupportModal
        isOpen={supportModalOpen}
        onClose={() => setSupportModalOpen(false)}
        initialTopic="feature"
      />
    </div>
  );
};
