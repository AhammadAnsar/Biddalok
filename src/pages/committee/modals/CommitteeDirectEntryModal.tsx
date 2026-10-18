import React, { useState } from 'react';
import { 
  X, Check, Upload, ShieldCheck, 
  Info
} from 'lucide-react';
import { ManagingCommitteeInfo } from '../../../types';
import { toast } from '../../../utils/toast';

interface CommitteeDirectEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (committee: Partial<ManagingCommitteeInfo>) => void;
  initialData?: ManagingCommitteeInfo | null;
}

export const CommitteeDirectEntryModal: React.FC<CommitteeDirectEntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [formData, setFormData] = useState<Partial<ManagingCommitteeInfo>>({
    committeeType: 'regular',
    hasCommittee: true,
    status: 'active',
  });

  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          committeeType: 'regular',
          hasCommittee: true,
          status: 'active',
        });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.year || !formData.titleBn) {
      toast.error('অবশ্যই কমিটির নাম এবং মেয়াদকাল উল্লেখ করতে হবে।');
      return;
    }
    
    // Preserve existing ID or create new
    const committeeId = initialData?.id || formData.id || `comm_${formData.year?.replace('-', '_')}_${Date.now().toString().slice(-4)}`;
    
    onSave({
      ...formData,
      id: committeeId,
      members: initialData?.members || formData.members || [],
      meetings: initialData?.meetings || formData.meetings || [],
      decisions: initialData?.decisions || formData.decisions || []
    });
    
    toast.success('কমিটির প্রাথমিক তথ্য সফলভাবে সংরক্ষিত হয়েছে।');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header */}
        <div className="bg-emerald-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-800 rounded-xl text-emerald-300">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">সরাসরি কমিটি এন্ট্রি</h3>
              <p className="text-xs text-emerald-200/80 font-medium">নতুন বা পূর্ববর্তী কমিটির তথ্য ম্যানুয়ালি সংযুক্ত করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3 text-emerald-800">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed font-medium">
              এই অপশনের মাধ্যমে আপনি নির্বাচন প্রক্রিয়া ছাড়া সরাসরি বোর্ড অনুমোদিত যেকোনো কমিটির তথ্য সিস্টেমে সংরক্ষণ করতে পারবেন। সংরক্ষণ করার পর মূল ড্যাশবোর্ড থেকে কমিটির সদস্যদের তথ্য যুক্ত করা যাবে।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">কমিটির শিরোনাম (বাংলায়) *</label>
              <input
                type="text"
                required
                value={formData.titleBn || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, titleBn: e.target.value, title: e.target.value }))}
                placeholder="যেমন: নিয়মিত ব্যবস্থাপনা কমিটি ২০২৬-২০২৮"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">কমিটির ধরন *</label>
              <select
                required
                value={formData.committeeType || 'regular'}
                onChange={(e) => setFormData(prev => ({ ...prev, committeeType: e.target.value as any }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                <option value="regular">নিয়মিত ব্যবস্থাপনা কমিটি (SMC)</option>
                <option value="adhoc">এডহক কমিটি (Adhoc)</option>
                <option value="special">বিশেষ কমিটি (Special)</option>
                <option value="governing_body">গভর্নিং বডি (GB)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">মেয়াদকাল (Term) *</label>
              <input
                type="text"
                required
                value={formData.year || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                placeholder="যেমন: 2026-2028"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">বোর্ড অনুমোদনের স্মারক নং</label>
              <input
                type="text"
                value={formData.approvalResolutionNo || formData.resolutionNo || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  approvalResolutionNo: e.target.value,
                  resolutionNo: e.target.value
                }))}
                placeholder="যেমন: BISE/ADM/2026/102"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">অনুমোদনের তারিখ</label>
              <input
                type="date"
                value={formData.approvalDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, approvalDate: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">কার্যকাল শুরুর তারিখ</label>
              <input
                type="date"
                value={formData.startDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">মেয়াদ উত্তীর্ণের তারিখ</label>
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2 mt-2 border-t border-slate-100 pt-4">
              <label className="text-xs font-bold text-slate-700 block mb-2">বোর্ডের অনুমোদন পত্র / সংযুক্তি (অপশনাল)</label>
              <div className="w-full p-4 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="p-2.5 bg-slate-100 rounded-full group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
                </div>
                <div className="text-center">
                  <span className="text-xs font-bold text-slate-700 block">ক্লিক করে ফাইল আপলোড করুন</span>
                  <span className="text-[10px] text-slate-500">PDF, JPG, PNG (Max 5MB)</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-slate-700">মন্তব্য / বিশেষ নোট</label>
              <input
                type="text"
                value={formData.remarks || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                placeholder="যেমন: হাইকোর্টের নির্দেশনায় গঠিত"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black shadow-md shadow-emerald-900/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>কমিটি সেভ করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
