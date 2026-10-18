import React from 'react';
import { StaffMember } from '../../types';
import { AlertTriangle, CheckCircle2, Lock, ArrowRight, X, UserCheck, ShieldAlert } from 'lucide-react';

interface MandatoryProfileLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: StaffMember | null;
  onProceedToEdit: (staff: StaffMember) => void;
  actionTitle?: string;
}

export const MandatoryProfileLockModal: React.FC<MandatoryProfileLockModalProps> = ({
  isOpen,
  onClose,
  staff,
  onProceedToEdit,
  actionTitle = 'এমপিও আবেদন / ইনক্রিমেন্ট / ট্রান্সফার'
}) => {
  if (!isOpen || !staff) return null;

  const completion = staff.profileCompletion || 0;
  const isComplete = completion >= 100;

  // Find missing sections
  const missingItems: string[] = [];
  if (!staff.nid) missingItems.push('জাতীয় পরিচয়পত্র (NID)');
  if (!staff.fatherName && !staff.fatherNameBn) missingItems.push('পিতার নাম');
  if (!staff.motherName && !staff.motherNameBn) missingItems.push('মাতার নাম');
  if (!staff.bankAccountNumber) missingItems.push('ব্যাংক হিসাব নম্বর ও ব্যাংকের নাম');
  if (!staff.basicSalary) missingItems.push('মূল বেতন ও পে-স্কেল গ্রেড');
  if (!staff.educations || staff.educations.length === 0) missingItems.push('শিক্ষাগত যোগ্যতার সনদ বিবরণ');
  if (!staff.joiningDate) missingItems.push('বর্তমান প্রতিষ্ঠানে যোগদানের তারিখ');
  if (!staff.photo) missingItems.push('পাসপোর্ট সাইজের ছবি');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden transition-all transform scale-100">
        
        {/* Header */}
        <div className={`p-6 ${isComplete ? 'bg-emerald-600' : 'bg-amber-500'} text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
              {isComplete ? (
                <CheckCircle2 className="w-7 h-7 text-white" />
              ) : (
                <ShieldAlert className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold">
                {isComplete ? 'প্রোফাইল ভেরিফিকেশন সফল' : 'প্রোফাইল আপডেট লক (Mandatory Lock)'}
              </h3>
              <p className="text-white/90 text-sm mt-0.5">
                {actionTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            {staff.photo ? (
              <img src={staff.photo} alt={staff.name} className="w-12 h-12 rounded-full object-cover border border-slate-300" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg">
                {staff.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-slate-800 truncate">{staff.nameBn || staff.name}</h4>
              <p className="text-xs text-slate-500">
                আইডি: <span className="font-mono font-medium text-slate-700">{staff.customStaffId}</span> | পদবি: {staff.designationBn || staff.designation}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-sm font-bold ${completion >= 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {completion}%
              </div>
              <span className="text-[10px] text-slate-400">সম্পন্নতা</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-600 font-medium">
              <span>প্রোফাইল তথ্য সম্পন্নতা</span>
              <span>{completion}% / ১০০%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  completion >= 100
                    ? 'bg-emerald-500'
                    : completion >= 70
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          {!isComplete ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-slate-700 space-y-3">
              <div className="flex items-start gap-2 text-amber-800 font-medium text-sm">
                <Lock className="w-4 h-4 mt-0.5 text-amber-600 flex-shrink-0" />
                <span>
                  দয়া করে আগে আপনার প্রোফাইলের আর্থিক, শিক্ষাগত ও অন্যান্য প্রয়োজনীয় তথ্যগুলো ১০০% সম্পন্ন করুন।
                </span>
              </div>
              
              {missingItems.length > 0 && (
                <div className="pl-6 space-y-1">
                  <p className="text-xs text-slate-500 font-medium">অসম্পূর্ণ তথ্যসমূহ:</p>
                  <ul className="text-xs text-slate-600 list-disc list-inside space-y-0.5">
                    {missingItems.slice(0, 4).map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                    {missingItems.length > 4 && (
                      <li className="text-slate-400">এবং আরও {missingItems.length - 4} টি ফিল্ড...</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-800 text-sm flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>
                এই শিক্ষক/কর্মচারীর প্রোফাইল ১০০% সম্পন্ন। আপনি এখন যেকোনো প্রাতিষ্ঠানিক ও সরকারি এমপিও আবেদন কার্যক্রম পরিচালনা করতে পারেন।
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            বন্ধ করুন
          </button>
          
          {!isComplete ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onProceedToEdit(staff);
              }}
              className="px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
            >
              <span>প্রোফাইল পূর্ণ করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
            >
              আবেদন এগিয়ে নিন
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
