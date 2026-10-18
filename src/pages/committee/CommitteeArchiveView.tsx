import React, { useState } from 'react';
import { 
  History, Calendar, Users, Award, FileText, ArrowLeft, 
  BookOpen, ChevronRight, CheckCircle2, ShieldCheck, 
  Search, Eye, Printer, X, Download, Edit3, Trash2
} from 'lucide-react';
import { ManagingCommitteeInfo, Institution } from '../../types';
import { toBengaliNumber } from '../../utils/bengaliUtils';

interface CommitteeArchiveViewProps {
  currentCommittee: ManagingCommitteeInfo;
  archiveCommittees: ManagingCommitteeInfo[];
  onBackToCurrent: () => void;
  onOpenPolicyGuide: (topicKey: string) => void;
  institution?: Institution | null;
  onOpenDirectEntry?: () => void;
  onPrintArchive?: (committee: ManagingCommitteeInfo) => void;
  onEditArchive?: (committee: ManagingCommitteeInfo) => void;
  onDeleteArchive?: (id: string) => void;
}

export const CommitteeArchiveView: React.FC<CommitteeArchiveViewProps> = ({
  currentCommittee,
  archiveCommittees,
  onBackToCurrent,
  onOpenPolicyGuide,
  institution,
  onOpenDirectEntry,
  onPrintArchive,
  onEditArchive,
  onDeleteArchive
}) => {
  const [selectedCommittee, setSelectedCommittee] = useState<ManagingCommitteeInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Deduplicate and filter past committees (those with status 'expired' or different year)
  const pastList = archiveCommittees.filter(c => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (c.year && c.year.toLowerCase().includes(q)) ||
        (c.titleBn && c.titleBn.toLowerCase().includes(q)) ||
        (c.approvalResolutionNo && c.approvalResolutionNo.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div id="committee-archive-view" className="space-y-6 animate-in fade-in duration-300">
      
      {/* HEADER WITH BACK BUTTON & POLICY GUIDELINE ICON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">কমিটি ব্যবস্থাপনা</span>
            <span className="text-xs text-slate-300">›</span>
            <span className="text-xs font-bold text-emerald-800">কমিটি সমূহ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            পরিচালনা পরিষদ সমূহ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            সাল ও মেয়াদ অনুযায়ী বিগত ও বর্তমান সকল কমিটি, সদস্যবৃন্দ এবং অনুমোদিত রেজুলেশনের তালিকা
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => onOpenPolicyGuide('archive')}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm group"
            title="রেকর্ড সংরক্ষণ সংক্রান্ত নীতিমালা দেখুন"
          >
            <BookOpen className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>রেকর্ড সংরক্ষণ নীতিমালা</span>
          </button>
          <button
            type="button"
            onClick={onBackToCurrent}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>বর্তমান কমিটিতে ফিরে যান</span>
          </button>
        </div>
      </div>

      {/* PRINT HEADER ONLY VISIBLE DURING PRINT */}
      <div className="hidden print:block text-center space-y-2 pb-6 border-b border-slate-300 mb-6">
        <h1 className="text-2xl font-black text-slate-900">{institution?.nameBn || institution?.name || 'বিদ্যালয় ব্যবস্থাপনা কমিটি'}</h1>
        <h2 className="text-lg font-bold text-slate-800">পরিচালনা পরিষদ সমূহ (রেজিস্টার)</h2>
      </div>

      {/* SEARCH / FILTER BAR & ADD NEW BUTTON */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="সাল, কমিটির ধরন বা রেজুলেশন স্মারক দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-end sm:justify-start">
          <span className="text-[11px] text-slate-500 font-medium hidden sm:block">
            মোট রেজিস্টার ভুক্তি: <strong className="text-slate-900 font-mono">{toBengaliNumber(pastList.length)}টি</strong>
          </span>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">রেজিস্টার প্রিন্ট</span>
          </button>
          <button
            type="button"
            id="btn-add-committee-direct"
            onClick={onOpenDirectEntry}
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black shadow-md shadow-emerald-900/20 transition-all cursor-pointer"
          >
            + নতুন কমিটি
          </button>
        </div>
      </div>

      {/* ARCHIVE COMMITTEE TABLE (REGISTER) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200/70">
              <tr>
                <th className="px-4 py-3 text-center w-12">ক্রম</th>
                <th className="px-4 py-3">ধরণ ও মেয়াদকাল</th>
                <th className="px-4 py-3">সভাপতি</th>
                <th className="px-4 py-3">অনুমোদন / মেয়াদ উত্তীর্ণ</th>
                <th className="px-4 py-3 text-center">মোট সভা</th>
                <th className="px-4 py-3 text-right pr-6 print:hidden">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {pastList.map((comm, index) => {
                const isCurrent = comm.id === currentCommittee.id || comm.year === currentCommittee.year;
                const president = comm.members?.find(m => m.role === 'president');
                const meetingCount = comm.meetings?.length || 0;

                return (
                  <tr key={comm.id || comm.year} className={`hover:bg-emerald-50/30 transition-colors ${isCurrent ? 'bg-emerald-50/50 print:bg-transparent' : ''}`}>
                    <td className="px-4 py-3 text-center text-slate-400 font-mono">
                      {toBengaliNumber(index + 1)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                          {comm.committeeType === 'adhoc' ? 'এডহক কমিটি' : 'নিয়মিত'}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-bold print:border print:border-emerald-600 print:text-emerald-800 print:bg-transparent">
                            সক্রিয়
                          </span>
                        )}
                      </div>
                      <strong className="text-slate-900 text-[13px]">{comm.year || 'অনির্ধারিত'}</strong>
                    </td>
                    <td className="px-4 py-3">
                      <strong className="text-slate-800">{president?.nameBn || president?.name || 'অনির্ধারিত'}</strong>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-600">
                        {comm.approvalDate ? <span className="font-mono">{toBengaliNumber(comm.approvalDate)}</span> : 'অনির্ধারিত'}
                      </div>
                      {comm.endDate && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          উত্তীর্ণ: <span className="font-mono">{toBengaliNumber(comm.endDate)}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-mono font-bold text-[11px] print:border print:border-slate-300 print:bg-transparent">
                        {toBengaliNumber(meetingCount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right pr-6 print:hidden">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedCommittee(comm)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                          title="বিস্তারিত দেখুন"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onPrintArchive?.(comm)}
                          className="p-1.5 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all"
                          title="পিডিএফ/প্রিন্ট"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {onEditArchive && (
                          <button
                            type="button"
                            onClick={() => onEditArchive(comm)}
                            className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
                            title="সম্পাদনা"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                        {onDeleteArchive && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm('আপনি কি নিশ্চিত যে এই কমিটি রেকর্ড মুছে ফেলতে চান?')) {
                                onDeleteArchive(comm.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {pastList.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-xs">
              কোনো কমিটির রেকর্ড পাওয়া যায়নি।
            </div>
          )}
        </div>
      </div>

      {/* DETAILED MODAL FOR SELECTED ARCHIVE COMMITTEE */}
      {selectedCommittee && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 print:hidden"
          onClick={() => setSelectedCommittee(null)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-emerald-900 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  আর্কাইভ নথি বিবরণী
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  {selectedCommittee.titleBn || selectedCommittee.title} ({selectedCommittee.year})
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCommittee(null)}
                className="w-8 h-8 rounded-xl bg-emerald-800 text-emerald-100 hover:bg-emerald-700 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* DETAILS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">মেয়াদকাল</span>
                  <strong className="text-slate-800 font-mono">{selectedCommittee.year}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">কমিটির ধরন</span>
                  <strong className="text-slate-800">
                    {selectedCommittee.committeeType === 'adhoc' ? 'এডহক কমিটি' : 'নিয়মিত কমিটি'}
                  </strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">বোর্ড রেজুলেশন</span>
                  <strong className="text-slate-800 font-mono truncate block">
                    {selectedCommittee.approvalResolutionNo || 'অনুমোদিত'}
                  </strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">মোট সদস্য</span>
                  <strong className="text-slate-800 font-mono">
                    {toBengaliNumber(selectedCommittee.members?.length || 11)} জন
                  </strong>
                </div>
              </div>

              {/* MEMBERS ROSTER */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  বিগত কার্যনির্বাহী সদস্য তালিকা
                </h4>

                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {selectedCommittee.members?.map((m, idx) => (
                    <div key={m.id || idx} className="p-3 bg-white flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-900 block font-bold">{m.nameBn || m.name}</strong>
                        <span className="text-slate-400 text-[11px]">{m.roleBn || m.roleTitleBn || m.role}</span>
                      </div>
                      <div className="text-right text-[11px] text-slate-500 font-mono">
                        {m.mobile || 'সংরক্ষিত'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400 hidden sm:block">
                শিক্ষা বোর্ড পরিদর্শন প্রটোকল অনুসারে স্থায়ী রেকর্ড
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {onEditArchive && (
                  <button
                    type="button"
                    onClick={() => {
                      onEditArchive(selectedCommittee);
                      setSelectedCommittee(null);
                    }}
                    className="px-4 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">এডিট</span>
                  </button>
                )}
                {onDeleteArchive && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('আপনি কি নিশ্চিত যে এই কমিটি রেকর্ড মুছে ফেলতে চান?')) {
                        onDeleteArchive(selectedCommittee.id);
                        setSelectedCommittee(null);
                      }
                    }}
                    className="px-4 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">মুছুন</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onPrintArchive?.(selectedCommittee)}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>প্রিন্ট/PDF সেভ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCommittee(null)}
                  className="px-4 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  বন্ধ করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
