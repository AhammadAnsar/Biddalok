import React, { useState } from 'react';
import { ManagingCommitteeInfo } from '../../types';
import { useMasterData } from '../../hooks/useMasterData';
import { 
 X, Check, Calendar, Award, FileText, Upload, 
 Clock, ShieldCheck, AlertCircle 
} from 'lucide-react';
import { toast } from '../../utils/toast';

interface CommitteeInfoModalProps {
 isOpen: boolean;
 onClose: () => void;
 initialData: ManagingCommitteeInfo;
 onSave: (data: Partial<ManagingCommitteeInfo>) => void;
}

export const CommitteeInfoModal: React.FC<CommitteeInfoModalProps> = ({
 isOpen,
 onClose,
 initialData,
 onSave,
}) => {
 const { categoryMap } = useMasterData();
 const committeeTypes = categoryMap.committeeType || [];

 const [formData, setFormData] = useState<Partial<ManagingCommitteeInfo>>({
 ...initialData,
 hasCommittee: initialData.hasCommittee ?? true,
 committeeTypeId: initialData.committeeTypeId || (committeeTypes[0]?.id || 'comm_managing'),
 year: initialData.year || '',
 approvalResolutionNo: initialData.approvalResolutionNo || initialData.resolutionNo || '',
 status: initialData.status || 'active',
 });

 const [isUploading, setIsUploading] = useState(false);

 if (!isOpen) return null;

 const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 if (file.size > 5 * 1024 * 1024) {
 toast.error('ফাইলের সাইজ ৫ MB এর কম হতে হবে');
 return;
 }

 setIsUploading(true);
 setFormData(prev => ({
 ...prev,
 attachmentName: file.name,
 attachmentSizeKb: Math.round(file.size / 1024),
 attachmentUrl: URL.createObjectURL(file)
 }));
 setIsUploading(false);
 toast.success(`"${file.name}" সফলভাবে সংযুক্ত করা হয়েছে`);
 };

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 if (!formData.titleBn && !formData.title) {
 toast.error('কমিটির শিরোনাম আবশ্যক');
 return;
 }

 const selectedType = committeeTypes.find(t => t.id === formData.committeeTypeId);

 onSave({
 ...formData,
 committeeType: selectedType?.code?.toLowerCase() || 'regular',
 type: selectedType?.code?.toLowerCase() || 'regular',
 resolutionNo: formData.approvalResolutionNo,
 });
 toast.success('কমিটির সাধারণ তথ্য সফলভাবে সংরক্ষিত হয়েছে');
 onClose();
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 overflow-y-auto">
 <div 
 id="committee-info-modal-container"
 className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-2xl w-full overflow-hidden my-8"
 >
 {/* Header */}
 <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
 <ShieldCheck className="w-6 h-6" />
 </div>
 <div>
 <h3 className="text-lg font-black tracking-tight">কমিটির সাধারণ তথ্য ও অনুমোদন কনফিগারেশন</h3>
 <p className="text-xs text-slate-300 font-medium">শিক্ষা বোর্ড কর্তৃক অনুমোদিত পরিচালনা পর্ষদের তথ্যাবলি</p>
 </div>
 </div>
 <button
 id="btn-close-committee-info-modal"
 type="button"
 onClick={onClose}
 className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
 >
 <X className="w-5 h-5" />
 </button>
 </div>

 {/* Form Body */}
 <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(85vh-120px)] overflow-y-auto">
 
 {/* Has Committee Toggle */}
 <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between gap-4">
 <div>
 <span className="text-xs font-bold text-amber-900 block">ব্যবস্থাপনা কমিটি প্রযোজ্য কি না?</span>
 <p className="text-[11px] text-amber-700">প্রতিষ্ঠানটিতে বর্তমানে ব্যবস্থাপনা পরিষদ বা এডহক কমিটি বিদ্যমান রয়েছে কি না</p>
 </div>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setFormData(prev => ({ ...prev, hasCommittee: true }))}
 className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
 formData.hasCommittee 
 ? 'bg-amber-600 text-white shadow-sm' 
 : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
 }`}
 >
 হ্যাঁ (প্রযোজ্য)
 </button>
 <button
 type="button"
 onClick={() => setFormData(prev => ({ ...prev, hasCommittee: false }))}
 className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
 !formData.hasCommittee 
 ? 'bg-slate-800 text-white shadow-sm' 
 : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
 }`}
 >
 প্রযোজ্য নয়
 </button>
 </div>
 </div>

 {/* Committee Title & Academic Year */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="md:col-span-2 space-y-1.5">
 <label className="text-xs font-bold text-slate-700">
 কমিটির শিরোনাম (বাংলায়) <span className="text-rose-500">*</span>
 </label>
 <input
 id="input-committee-title-bn"
 type="text"
 value={formData.titleBn || formData.title || ''}
 onChange={(e) => setFormData(prev => ({ ...prev, titleBn: e.target.value, title: e.target.value }))}
 placeholder="যেমন: বিদ্যালয় ব্যবস্থাপনা কমিটি (২০২৫-২০২৭)"
 className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
 required
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-700">
 মেয়াদকাল / সাল <span className="text-rose-500">*</span>
 </label>
 <input
 id="input-committee-year"
 type="text"
 value={formData.year || ''}
 onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
 placeholder="যেমন: 2025-2027"
 className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
 required
 />
 </div>
 </div>

 {/* Committee Type & Status */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-700">
 কমিটির ধরণ (Committee Type) <span className="text-rose-500">*</span>
 </label>
 <select
 id="select-committee-type"
 value={formData.committeeTypeId || ''}
 onChange={(e) => setFormData(prev => ({ ...prev, committeeTypeId: e.target.value }))}
 className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
 >
 {committeeTypes.map(ct => (
 <option key={ct.id} value={ct.id}>
 {ct.nameBn} ({ct.name})
 </option>
 ))}
 </select>
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-700">
 কমিটির বর্তমান অবস্থা (Status)
 </label>
 <select
 id="select-committee-status"
 value={formData.status || 'active'}
 onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
 className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
 >
 <option value="active">সক্রিয় পরিষদ (Active)</option>
 <option value="in_election">নির্বাচন / গঠন চলমান (In Formation)</option>
 <option value="expired">মেয়াদোত্তীর্ণ (Expired)</option>
 <option value="dissolved">বিলুপ্ত / স্থগিত (Dissolved)</option>
 </select>
 </div>
 </div>

 {/* Board Approval & Resolution */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-700">
 বোর্ড অনুমোদন স্মারক / রেজুলেশন নম্বর
 </label>
 <input
 id="input-committee-resolution"
 type="text"
 value={formData.approvalResolutionNo || ''}
 onChange={(e) => setFormData(prev => ({ ...prev, approvalResolutionNo: e.target.value, resolutionNo: e.target.value }))}
 placeholder="যেমন: BISE/ADM/2025/482"
 className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-700">
 বোর্ড অনুমোদনের তারিখ
 </label>
 <input
 id="input-committee-approval-date"
 type="date"
 value={formData.approvalDate || ''}
 onChange={(e) => setFormData(prev => ({ ...prev, approvalDate: e.target.value }))}
 className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
 />
 </div>
 </div>

 {/* Important Dates */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-700">
 নির্বাচনের তারিখ
 </label>
 <input
 id="input-committee-election-date"
 type="date"
 value={formData.electionDate || ''}
 onChange={(e) => setFormData(prev => ({ ...prev, electionDate: e.target.value }))}
 className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-700">
 প্রথম সভার তারিখ / কার্যকর
 </label>
 <input
 id="input-committee-first-meeting-date"
 type="date"
 value={formData.firstMeetingDate || formData.startDate || ''}
 onChange={(e) => setFormData(prev => ({ ...prev, firstMeetingDate: e.target.value, startDate: e.target.value }))}
 className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-700">
 মেয়াদ সমাপ্তির তারিখ
 </label>
 <input
 id="input-committee-end-date"
 type="date"
 value={formData.endDate || ''}
 onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
 className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
 />
 </div>
 </div>

 {/* Attachment Upload */}
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
 <span>অনুমোদন পত্র / রেজুলেশনের কপি সংযুক্তি (PDF / Image)</span>
 {formData.attachmentName && (
 <span className="text-emerald-600 text-[11px] font-semibold flex items-center gap-1">
 <Check className="w-3.5 h-3.5" /> ফাইল সংরক্ষিত ({formData.attachmentSizeKb} KB)
 </span>
 )}
 </label>
 <div className="p-4 border-2 border-dashed border-slate-300 rounded-2xl text-center bg-slate-50 hover:bg-slate-100/80 transition-colors relative">
 <input
 type="file"
 accept=".pdf,.jpg,.jpeg,.png"
 onChange={handleFileUpload}
 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
 />
 <div className="flex flex-col items-center justify-center gap-1.5 text-slate-600">
 <Upload className="w-6 h-6 text-slate-400" />
 <span className="text-xs font-bold">
 {formData.attachmentName ? formData.attachmentName : 'অনুমোদনপত্রের ফাইল ব্রাউজ করতে এখানে ক্লিক করুন'}
 </span>
 <span className="text-[11px] text-slate-400">সর্বোচ্চ ৫ মেগাবাইট (PDF, JPG, PNG)</span>
 </div>
 </div>
 </div>

 {/* Remarks */}
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-700">মন্তব্য বা বিশেষ নির্দেশনা</label>
 <textarea
 id="textarea-committee-remarks"
 rows={2}
 value={formData.remarks || ''}
 onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
 placeholder="কমিটি গঠন বা বোর্ডের কোনো বিশেষ শর্তাবলী থাকলে এখানে লিখুন..."
 className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none resize-none"
 />
 </div>

 {/* Footer Actions */}
 <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
 <button
 type="button"
 onClick={onClose}
 className="px-5 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all cursor-pointer"
 >
 বাতিল
 </button>
 <button
 id="btn-save-committee-info"
 type="submit"
 className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md shadow-amber-600/20 transition-all flex items-center gap-2 cursor-pointer"
 >
 <Check className="w-4 h-4" />
 <span>তথ্য সংরক্ষণ করুন</span>
 </button>
 </div>

 </form>
 </div>
 </div>
 );
};
