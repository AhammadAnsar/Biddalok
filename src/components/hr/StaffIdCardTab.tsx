import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { StaffMember } from '../../types';
import { 
  CreditCard, Printer, Search, CheckSquare, Square, Download
} from 'lucide-react';
import { notifyIdCardGenerated, toast } from '../../utils/toast';
import { StaffIdCardItem } from './StaffIdCardItem';
import { downloadBulkStaffIdCardsPdf, downloadSingleStaffIdCardPdf } from '../../utils/staffIdCardPdfExporter';

export const StaffIdCardTab: React.FC = () => {
  const { staff, institution, staffIdCardSettings } = useAppStore();

  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'teaching' | 'non_teaching'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cardSide, setCardSide] = useState<'front' | 'back' | 'both'>('both');
  const [isExporting, setIsExporting] = useState(false);

  const filteredStaff = (staff || []).filter(s => {
    if (filterType !== 'all' && s.staffType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.nameBn && s.nameBn.includes(q)) ||
        (s.customStaffId && s.customStaffId.toLowerCase().includes(q)) ||
        (s.pdsId && s.pdsId.toLowerCase().includes(q)) ||
        (s.designation && s.designation.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleExportPdf = async () => {
    if (printableStaff.length === 0) return;
    try {
      setIsExporting(true);
      await downloadBulkStaffIdCardsPdf(
        printableStaff,
        institution!,
        staffIdCardSettings,
        cardSide,
        principalSignatureUrl
      );
      notifyIdCardGenerated(printableStaff.length);
    } catch (error) {
      console.error(error);
      toast.error('PDF ডাউনলোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedStaffIds.length === filteredStaff.length) {
      setSelectedStaffIds([]);
    } else {
      setSelectedStaffIds(filteredStaff.map(s => s.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedStaffIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const printableStaff = filteredStaff.filter(s => 
    selectedStaffIds.length === 0 ? true : selectedStaffIds.includes(s.id)
  );

  // Get Principal Signature from staff list if available
  const principal = staff?.find(s => 
    s.designationId === 'des_head_teacher' || 
    s.designation === 'Head Teacher' || 
    s.designationBn === 'প্রধান শিক্ষক'
  );
  const principalSignatureUrl = principal?.signaturePhoto || institution?.headmasterSignature || '';

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <span>শিক্ষক ও কর্মচারী পরিচয়পত্র (Teacher & Staff ID Card)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            পিডিএস (PDS) ও প্রাতিষ্ঠানিক ৯-ডিজিট ইউনিক আইডি সম্বলিত ডিজিটাল স্মার্ট পরিচয়পত্র তৈরি ও প্রিন্ট।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setCardSide('both')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                cardSide === 'both' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600'
              }`}
            >
              উভয় পাশ
            </button>
            <button
              onClick={() => setCardSide('front')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                cardSide === 'front' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600'
              }`}
            >
              সম্মুখ পাশ
            </button>
            <button
              onClick={() => setCardSide('back')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                cardSide === 'back' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600'
              }`}
            >
              বিপরীত পাশ
            </button>
          </div>

                    <button
            onClick={handleExportPdf}
            disabled={isExporting || printableStaff.length === 0}
            className="px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl shadow-sm flex items-center gap-2 transition-all shrink-0 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'ডাউনলোড হচ্ছে...' : 'PDF ডাউনলোড'}</span>
          </button>
          
          <button
            onClick={() => window.print()}
            disabled={printableStaff.length === 0}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all shrink-0 disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>আইডি কার্ড প্রিন্ট ({printableStaff.length} টি)</span>
          </button>
        </div>
      </div>

      {/* Filter & Selection Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
          >
            {selectedStaffIds.length === filteredStaff.length && filteredStaff.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-indigo-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>সব নির্বাচন ({selectedStaffIds.length}/{filteredStaff.length})</span>
          </button>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                filterType === 'all' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              সকল
            </button>
            <button
              onClick={() => setFilterType('teaching')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                filterType === 'teaching' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              শিক্ষক
            </button>
            <button
              onClick={() => setFilterType('non_teaching')}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                filterType === 'non_teaching' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              কর্মচারী
            </button>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="নাম, পদবি বা আইডি খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>
      </div>

      {/* ID Card Print Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
        {printableStaff.map((member) => (
          <div
            key={member.id}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4 relative group print:p-0 print:border-none print:shadow-none print:bg-transparent"
          >
            {/* Selection Checkbox */}
            <button
              onClick={() => handleToggleSelect(member.id)}
              className="absolute top-3 right-3 z-20 p-1 bg-white/80 backdrop-blur rounded-lg border shadow-sm text-slate-600 hover:text-indigo-600 transition-colors print:hidden"
            >
              {selectedStaffIds.includes(member.id) ? (
                <CheckSquare className="w-4 h-4 text-indigo-600" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Smart ID Card Template */}
            <StaffIdCardItem 
              staff={member} 
              institution={institution!} 
              settings={staffIdCardSettings} 
              side={cardSide} 
              principalSignatureUrl={principalSignatureUrl} 
            />

            {/* Individual Card Quick Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 print:hidden text-xs">
              <span className="text-slate-500 font-medium truncate max-w-[130px]">
                {member.designationBn || member.designation || 'কর্মকর্তা/কর্মচারী'}
              </span>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await downloadSingleStaffIdCardPdf(member, institution!, staffIdCardSettings, cardSide, principalSignatureUrl);
                    toast.success(`${member.nameBn || member.name} এর আইডি কার্ড ডাউনলোড সম্পন্ন হয়েছে`);
                  } catch (err) {
                    console.error(err);
                    toast.error('আইডি কার্ড ডাউনলোড ব্যর্থ হয়েছে');
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                title="একক আইডি কার্ড পিডিএফ ডাউনলোড করুন"
              >
                <Download className="w-3 h-3" />
                <span>পিডিএফ ডাউনলোড</span>
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

