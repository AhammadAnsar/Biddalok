import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { STAFF_CATEGORY_LABELS } from '../../data/defaultStaffMaster';
import { 
  X, Printer, Download, Building, Award, 
  Users, AlertCircle, CheckCircle2, Calendar 
} from 'lucide-react';

interface StaffReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportType: 'working' | 'vacant';
}

export const StaffReportModal: React.FC<StaffReportModalProps> = ({
  isOpen,
  onClose,
  reportType
}) => {
  const { staff, staffDesignations, institution } = useAppStore();

  if (!isOpen) return null;

  const staffList = staff || [];
  const designations = staffDesignations || [];

  const todayDate = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const todayDateEn = new Date().toISOString().split('T')[0];

  // Helper for working count
  const getWorkingCount = (desId: string, desName: string, desNameBn: string) => {
    return staffList.filter(s => 
      s.designationId === desId || 
      (s.designation && s.designation.toLowerCase() === desName.toLowerCase()) ||
      (s.designationBn && s.designationBn === desNameBn)
    ).length;
  };

  const totalSanctioned = designations.reduce((acc, d) => acc + (d.sanctionedPosts || 0), 0);
  const totalWorking = staffList.length;
  const totalVacant = Math.max(0, totalSanctioned - totalWorking);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (reportType === 'working') {
      const headers = ['ক্রমিক', 'আইডি', 'PDS নম্বর', 'নাম (বাংলা)', 'নাম (ইংরেজি)', 'পদবি', 'বিষয় / বিভাগ', 'ধরণ', 'চাকরির ধরণ', 'যোগদানের তারিখ', 'মোবাইল', 'বেতন কোড'];
      const rows = staffList.map((s, idx) => [
        idx + 1,
        `"${s.customStaffId || ''}"`,
        `"${s.pdsId || ''}"`,
        `"${(s.nameBn || s.name || '').replace(/"/g, '""')}"`,
        `"${(s.name || '').replace(/"/g, '""')}"`,
        `"${(s.designationBn || s.designation || '').replace(/"/g, '""')}"`,
        `"${s.subject || s.department || ''}"`,
        `"${s.staffType === 'teaching' ? 'শিক্ষক' : 'কর্মচারী'}"`,
        `"${s.employmentType === 'mpo' ? 'এমপিওভুক্ত' : 'নন-এমপিও'}"`,
        `"${s.joiningDate || ''}"`,
        `"${s.mobile || s.contact || ''}"`,
        `"${s.payCode || ''}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `কর্মরত_শিক্ষক_কর্মচারী_তালিকা_${todayDateEn}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['ক্রমিক', 'পদবি আইডি', 'পদবি (বাংলা)', 'পদবি (ইংরেজি)', 'ক্যাটেগরি', 'অনুমোদিত পদ', 'কর্মরত পদ', 'শূন্যপদ', 'বেতন গ্রেড', 'স্ট্যাটাস'];
      const rows = designations.map((d, idx) => {
        const working = getWorkingCount(d.id, d.name, d.nameBn);
        const vacant = Math.max(0, d.sanctionedPosts - working);
        const catMeta = STAFF_CATEGORY_LABELS[d.category] || STAFF_CATEGORY_LABELS.support_staff;
        return [
          idx + 1,
          `"${d.id}"`,
          `"${d.nameBn}"`,
          `"${d.name}"`,
          `"${catMeta.bn}"`,
          d.sanctionedPosts,
          working,
          vacant,
          `"${d.payGrade || ''}"`,
          `"${vacant > 0 ? `${vacant}টি পদ শূন্য` : 'পদ পূরণকৃত'}"`
        ];
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `অনুমোদিত_ও_শূন্যপদের_তালিকা_${todayDateEn}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl my-auto flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header (Top Controls) */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 print:hidden">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${reportType === 'working' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {reportType === 'working' ? <Users className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {reportType === 'working' ? 'কর্মরত শিক্ষক-কর্মচারীদের তালিকা ও প্রতিবেদন' : 'অনুমোদিত ও শূন্যপদের প্রাতিষ্ঠানিক প্রতিবেদন'}
              </h2>
              <p className="text-xs text-slate-500">
                {reportType === 'working' ? `মোট কর্মরত জনবল: ${totalWorking} জন` : `মোট শূন্যপদ: ${totalVacant} টি (অনুমোদিত: ${totalSanctioned})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
            >
              <Download className="w-4 h-4" />
              <span>ডাউনলোড (CSV/PDF)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-white" id="printable-report-area">
          
          {/* Institutional Letterhead */}
          <div className="text-center border-b-2 border-slate-900 pb-5 mb-6">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
              <span>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {institution?.nameBn || institution?.name || 'বিদ্যালয় ও কলেজ'}
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              ইআইআইএন (EIIN): <strong className="font-mono">{institution?.eiin || '105820'}</strong> | স্থাপিত: {institution?.establishedYear || '১৯৯৫'} | শিক্ষা বোর্ড: {institution?.board || 'ঢাকা'}
            </p>
            <p className="text-xs text-slate-500">
              ডাকঘর: {institution?.postOffice || 'সদর'}, উপজেলা: {institution?.upazila || 'সদর'}, জেলা: {institution?.district || 'ঢাকা'}
            </p>

            <div className="mt-4 inline-block px-4 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-xs sm:text-sm font-black text-slate-900 tracking-wide uppercase">
              {reportType === 'working' ? 'কর্মরত শিক্ষক ও কর্মচারীদের অনুমোদিত তালিকা' : 'অনুমোদিত পদবিভিত্তিক শূন্যপদের বিবরণী ও প্রতিবেদন'}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 font-medium">প্রতিবেদন প্রস্তুতের তারিখ: {todayDate}</p>
          </div>

          {/* Quick Stat Summary Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6 print:border print:border-slate-300 print:p-3 print:rounded-lg">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="text-[11px] font-bold text-slate-500 uppercase">মোট অনুমোদিত পদ</div>
              <div className="text-xl font-black text-slate-900 mt-0.5">{totalSanctioned} টি</div>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
              <div className="text-[11px] font-bold text-emerald-700 uppercase">বর্তমানে কর্মরত</div>
              <div className="text-xl font-black text-emerald-800 mt-0.5">{totalWorking} জন</div>
            </div>
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-center">
              <div className="text-[11px] font-bold text-rose-700 uppercase">মোট শূন্যপদ</div>
              <div className="text-xl font-black text-rose-800 mt-0.5">{totalVacant} টি</div>
            </div>
          </div>

          {/* Report Data Table */}
          {reportType === 'working' ? (
            <div className="overflow-x-auto rounded-xl border border-slate-300">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="py-2.5 px-3 w-10 text-center border-r border-slate-200">#</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">আইডি ও PDS</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">শিক্ষক/কর্মচারীর নাম</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">পদবি ও বিষয়</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">ধরণ</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">যোগদান</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">মোবাইল</th>
                    <th className="py-2.5 px-3">গ্রেড / স্কেল</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {staffList.map((member, idx) => (
                    <tr key={member.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 text-center font-bold text-slate-500 border-r border-slate-200">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <div className="font-mono font-bold text-slate-900">{member.customStaffId}</div>
                        {member.pdsId && <div className="font-mono text-[10px] text-indigo-600">PDS: {member.pdsId}</div>}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <div className="font-bold text-slate-900">{member.nameBn || member.name}</div>
                        <div className="text-[10px] text-slate-500">{member.name}</div>
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <div className="font-semibold text-slate-800">{member.designationBn || member.designation}</div>
                        {member.subject && <div className="text-[10px] text-slate-500">বিষয়: {member.subject}</div>}
                      </td>
                      <td className="py-2.5 px-3 border-r border-slate-200">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          member.employmentType === 'mpo' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {member.employmentType === 'mpo' ? 'এমপিও' : 'নন-এমপিও'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] border-r border-slate-200">
                        {member.joiningDate || '—'}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] border-r border-slate-200">
                        {member.mobile || member.contact || '—'}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-600">
                        {member.payCode || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-300">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="py-2.5 px-3 w-10 text-center border-r border-slate-200">#</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">পদবির নাম (বাংলা ও ইংরেজি)</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">ক্যাটেগরি</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-200">অনুমোদিত পদ</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-200">কর্মরত পদ</th>
                    <th className="py-2.5 px-3 text-center border-r border-slate-200">শূন্যপদ</th>
                    <th className="py-2.5 px-3 border-r border-slate-200">বেতন স্কেল</th>
                    <th className="py-2.5 px-3">মন্তব্য / বর্তমান অবস্থা</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {designations.map((d, idx) => {
                    const working = getWorkingCount(d.id, d.name, d.nameBn);
                    const vacant = Math.max(0, d.sanctionedPosts - working);
                    const catMeta = STAFF_CATEGORY_LABELS[d.category] || STAFF_CATEGORY_LABELS.support_staff;

                    return (
                      <tr key={d.id} className={vacant > 0 ? 'bg-rose-50/40 hover:bg-rose-50' : 'hover:bg-slate-50'}>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500 border-r border-slate-200">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          <div className="font-bold text-slate-900">{d.nameBn}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{d.name} ({d.id})</div>
                        </td>
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${catMeta.badgeColor}`}>
                            {catMeta.bn}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-slate-900 border-r border-slate-200">
                          {d.sanctionedPosts}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-emerald-700 border-r border-slate-200">
                          {working}
                        </td>
                        <td className="py-2.5 px-3 text-center border-r border-slate-200">
                          <span className={`font-black ${vacant > 0 ? 'text-rose-700 text-sm' : 'text-slate-400'}`}>
                            {vacant}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-600 border-r border-slate-200">
                          {d.payGrade || '—'}
                        </td>
                        <td className="py-2.5 px-3">
                          {vacant > 0 ? (
                            <span className="text-rose-700 font-bold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>{vacant}টি পদ শূন্য (নিয়োগ আবশ্যক)</span>
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>পদ পূরণকৃত</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-black text-slate-900 border-t-2 border-slate-400">
                    <td colSpan={3} className="py-3 px-3 text-right border-r border-slate-300">
                      সর্বমোট:
                    </td>
                    <td className="py-3 px-3 text-center text-sm border-r border-slate-300">
                      {totalSanctioned} টি
                    </td>
                    <td className="py-3 px-3 text-center text-sm text-emerald-800 border-r border-slate-300">
                      {totalWorking} জন
                    </td>
                    <td className="py-3 px-3 text-center text-sm text-rose-800 border-r border-slate-300">
                      {totalVacant} টি
                    </td>
                    <td colSpan={2} className="py-3 px-3 text-slate-600 text-xs font-normal">
                      শূন্যপদের হার: {totalSanctioned > 0 ? Math.round((totalVacant / totalSanctioned) * 100) : 0}%
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Official Signatures */}
          <div className="grid grid-cols-3 gap-8 mt-20 pt-8 text-center text-xs text-slate-800">
            <div>
              <div className="border-t border-slate-400 pt-1.5 font-bold">প্রস্তুতকারী / অফিস সহকারী</div>
              <div className="text-[10px] text-slate-500">স্বাক্ষর ও তারিখ</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1.5 font-bold">প্রধান শিক্ষক / অধ্যক্ষ</div>
              <div className="text-[10px] text-slate-500">স্বাক্ষর ও প্রাতিষ্ঠানিক সিল</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1.5 font-bold">সভাপতি, ম্যানেজিং কমিটি / গভর্নিং বডি</div>
              <div className="text-[10px] text-slate-500">স্বাক্ষর ও সিল</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
