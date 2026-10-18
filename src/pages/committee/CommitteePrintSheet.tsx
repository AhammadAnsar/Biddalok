import React, { useState } from 'react';
import { ManagingCommitteeInfo, ManagingCommitteeMember, Institution } from '../../types';
import { Printer, Download, ArrowLeft, ShieldCheck, FileText } from 'lucide-react';
import { toBengaliNumber } from '../../utils/bengaliUtils';

interface CommitteePrintSheetProps {
 committee: ManagingCommitteeInfo;
 institution: Institution | null;
 onBack: () => void;
}

export const CommitteePrintSheet: React.FC<CommitteePrintSheetProps> = ({
 committee,
 institution,
 onBack,
}) => {
 const [sheetType, setSheetType] = useState<'gazette' | 'resolution_signatures'>('gazette');

 const members = committee.members || [];
 const resolutionNo = committee.approvalResolutionNo || committee.resolutionNo || '-';
 const approvalDate = committee.approvalDate || '-';
 const termPeriod = committee.year || '-';

 const handlePrint = () => {
 window.print();
 };

 return (
 <div className="space-y-6">
 {/* Control Bar (Hidden when printing) */}
 <div className="print:hidden bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <button
 type="button"
 onClick={onBack}
 className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
 >
 <ArrowLeft className="w-4 h-4" />
 <span>কমিটি মডিউলে ফিরে যান</span>
 </button>
 
 <div className="h-4 w-px bg-slate-200" />

 {/* Sheet Selector Tabs */}
 <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
 <button
 type="button"
 onClick={() => setSheetType('gazette')}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
 sheetType === 'gazette' 
 ? 'bg-white text-slate-900 shadow-sm' 
 : 'text-slate-600 hover:text-slate-900'
 }`}
 >
 বোর্ড ফরমেটে পূর্ণাঙ্গ কমিটি বিবরণী শিট
 </button>
 <button
 type="button"
 onClick={() => setSheetType('resolution_signatures')}
 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
 sheetType === 'resolution_signatures' 
 ? 'bg-white text-slate-900 shadow-sm' 
 : 'text-slate-600 hover:text-slate-900'
 }`}
 >
 সভা কার্যবিবরণী ও যৌথ স্বাক্ষর শিট
 </button>
 </div>
 </div>

 <button
 type="button"
 onClick={handlePrint}
 className="px-5 py-2 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
 >
 <Printer className="w-4 h-4" />
 <span>A4 সাইজে প্রিন্ট করুন</span>
 </button>
 </div>

 {/* Printable Sheet Canvas */}
 <div 
 id="printable-committee-sheet"
 className="bg-white mx-auto max-w-[210mm] min-h-[297mm] p-10 sm:p-14 border border-slate-300 shadow-lg print:shadow-none print:border-none print:m-0 print:p-8 text-slate-900 font-serif"
 >
 {/* Institutional Header */}
 <div className="text-center pb-5 border-b-2 border-slate-900 space-y-1">
 <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
 {institution?.nameBn || institution?.name || '-'}
 </h1>
 <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-700 font-sans">
 {institution?.name || '-'}
 </h2>
 <p className="text-xs text-slate-600 font-sans pt-1">
 {institution?.address || '-'} • ইআইআইএন (EIIN): {institution?.eiin || '-'} • স্থাপিত: {institution?.establishedYear || '-'}
 </p>
 <p className="text-[11px] text-slate-500 font-sans">
 ফোন: {institution?.mobile || '-'} • ইমেইল: {institution?.email || '-'}
 </p>
 </div>

 {/* Document Title Banner */}
 <div className="text-center my-6 space-y-1.5">
 <span className="inline-block px-4 py-1 rounded-full border border-slate-800 text-xs font-bold uppercase tracking-wider font-sans bg-slate-50">
 {sheetType === 'gazette' 
 ? 'শিক্ষা বোর্ড অনুমোদিত পরিচালনা পর্ষদ বিবরণী' 
 : 'পরিচালনা পরিষদের সভা কার্যবিবরণী ও যৌথ উপস্থিতি রেজিস্টার'}
 </span>
 <h3 className="text-lg sm:text-xl font-black text-slate-900">
 {committee.titleBn || committee.nameBn || 'বিদ্যালয় ব্যবস্থাপনা কমিটি (এসএমসি)'}
 </h3>
 <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-700 font-sans pt-1">
 <span><strong>মেয়াদকাল:</strong> {termPeriod}</span>
 <span>•</span>
 <span><strong>অনুমোদন স্মারক নম্বর:</strong> {resolutionNo}</span>
 <span>•</span>
 <span><strong>অনুমোদনের তারিখ:</strong> {approvalDate}</span>
 </div>
 </div>

 {/* Specific Sheet Views */}
 {sheetType === 'gazette' ? (
 /* GAZETTE TABLE */
 <div className="space-y-6">
 <table className="w-full text-left border-collapse border border-slate-800 text-xs font-sans">
 <thead>
 <tr className="bg-slate-100 text-slate-900 border-b border-slate-800 text-[11px] font-bold">
 <th className="border border-slate-800 p-2 text-center w-10">ক্র:</th>
 <th className="border border-slate-800 p-2">সদস্যের নাম ও পরিচিতি</th>
 <th className="border border-slate-800 p-2">কমিটি পদবি</th>
 <th className="border border-slate-800 p-2">পেশা ও যোগ্যতা</th>
 <th className="border border-slate-800 p-2">মোবাইল নম্বর</th>
 <th className="border border-slate-800 p-2 text-center">এনআইডি</th>
 <th className="border border-slate-800 p-2 text-center w-24">স্বাক্ষর</th>
 </tr>
 </thead>
 <tbody>
 {members.map((m, idx) => (
 <tr key={m.id} className="border-b border-slate-400">
 <td className="border border-slate-800 p-2 text-center font-mono font-bold">
 {toBengaliNumber(idx + 1)}
 </td>
 <td className="border border-slate-800 p-2">
 <div className="font-bold text-slate-900">{m.nameBn || m.name}</div>
 <div className="text-[10px] text-slate-600 font-mono uppercase">{m.name}</div>
 </td>
 <td className="border border-slate-800 p-2 font-bold text-slate-800">
 {m.roleTitleBn}
 </td>
 <td className="border border-slate-800 p-2">
 <div className="text-[11px]">{m.profession || '-'}</div>
 <div className="text-[10px] text-slate-500">{m.educationalQualification || '-'}</div>
 </td>
 <td className="border border-slate-800 p-2 font-mono text-[11px]">
 {m.mobile || m.phone || '-'}
 </td>
 <td className="border border-slate-800 p-2 text-center font-mono text-[10px]">
 {m.nid || '-'}
 </td>
 <td className="border border-slate-800 p-2 text-center">
 <div className="h-8"></div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>

 {/* Note / Declaration */}
 <div className="text-xs text-slate-700 leading-relaxed font-sans border-l-2 border-slate-800 pl-3">
 <p>
 <strong>প্রত্যয়ন পত্র:</strong> এতদ্বারা প্রত্যয়ন করা যাচ্ছে যে, উপরোল্লিখিত সকল সদস্য মাধ্যমিক ও উচ্চমাধ্যমিক শিক্ষা বোর্ড প্রবিধানমালা এবং সরকারি বিধি মোতাবেক বিদ্যালয় ব্যবস্থাপনা কমিটি (এসএমসি) হিসেবে বৈধভাবে দায়িত্ব পালন করছেন।
 </p>
 </div>
 </div>
 ) : (
 /* RESOLUTION & SIGNATURE SHEET */
 <div className="space-y-6">
 {/* Meeting Agenda & Date Placeholders */}
 <div className="p-4 border border-slate-400 rounded-lg text-xs font-sans space-y-2 bg-slate-50/50">
 <div className="grid grid-cols-2 gap-4">
 <div><strong>সভার স্থান:</strong> প্রধান শিক্ষকের কার্যালয় / শিক্ষক মিলনায়তন</div>
 <div><strong>সভার তারিখ ও সময়:</strong> .....................................</div>
 <div><strong>সভার সভাপতিত্ব:</strong> সভাপতি, পরিচালনা পরিষদ</div>
 <div><strong>রেজুলেশন প্রস্তাবনা নং:</strong> .....................................</div>
 </div>
 <div className="pt-2 border-t border-slate-200">
 <strong>সভার মূল আলোচ্যসূচি (Agenda):</strong>
 <ol className="list-decimal pl-5 pt-1 space-y-0.5 text-[11px] text-slate-700">
 <li>বিগত সভার কার্যবিবরণী পাঠ ও অনুমোদন।</li>
 <li>প্রতিষ্ঠানের একাডেমিক ও অবকাঠামোগত উন্নয়ন পর্যালোচনা।</li>
 <li>আর্থিক আয়-ব্যয় হিসাব নিরীক্ষণ ও বাজেট অনুমোদন।</li>
 <li>বিবিধ বিষয়ে সিদ্ধান্ত গ্রহণ ও সভাপতির সমাপনী বক্তব্য।</li>
 </ol>
 </div>
 </div>

 {/* Members Attendance & Resolution Signatures Table */}
 <table className="w-full text-left border-collapse border border-slate-800 text-xs font-sans">
 <thead>
 <tr className="bg-slate-100 text-slate-900 border-b border-slate-800 text-[11px] font-bold">
 <th className="border border-slate-800 p-2 text-center w-10">ক্র:</th>
 <th className="border border-slate-800 p-2">সদস্যের নাম</th>
 <th className="border border-slate-800 p-2">কমিটি পদবি</th>
 <th className="border border-slate-800 p-2">মোবাইল</th>
 <th className="border border-slate-800 p-2 text-center w-36">উপস্থিতি স্বাক্ষর</th>
 <th className="border border-slate-800 p-2 text-center w-36">মন্তব্য / সিদ্ধান্ত</th>
 </tr>
 </thead>
 <tbody>
 {members.map((m, idx) => (
 <tr key={m.id} className="border-b border-slate-400">
 <td className="border border-slate-800 p-2 text-center font-mono font-bold">
 {toBengaliNumber(idx + 1)}
 </td>
 <td className="border border-slate-800 p-2">
 <div className="font-bold text-slate-900">{m.nameBn || m.name}</div>
 </td>
 <td className="border border-slate-800 p-2 font-bold text-slate-800">
 {m.roleTitleBn}
 </td>
 <td className="border border-slate-800 p-2 font-mono text-[11px]">
 {m.mobile || '-'}
 </td>
 <td className="border border-slate-800 p-2 text-center">
 <div className="h-9"></div>
 </td>
 <td className="border border-slate-800 p-2 text-center">
 <div className="h-9"></div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}

 {/* Bottom Signatures */}
 <div className="grid grid-cols-3 gap-8 pt-20 mt-12 text-center text-xs font-sans">
 <div className="border-t border-slate-900 pt-2 space-y-1">
 <div className="font-bold">সদস্য সচিব</div>
 <div className="text-[11px] text-slate-600">প্রধান শিক্ষক / অধ্যক্ষ</div>
 <div className="text-[10px] text-slate-500">{institution?.nameBn || institution?.name}</div>
 </div>
 
 <div className="border-t border-slate-900 pt-2 space-y-1">
 <div className="font-bold">সভাপতি</div>
 <div className="text-[11px] text-slate-600">বিদ্যালয় ব্যবস্থাপনা কমিটি</div>
 <div className="text-[10px] text-slate-500">{institution?.nameBn || institution?.name}</div>
 </div>

 <div className="border-t border-slate-900 pt-2 space-y-1">
 <div className="font-bold">উপজেলা / থানা মাধ্যমিক শিক্ষা অফিসার</div>
 <div className="text-[11px] text-slate-600">মাধ্যমিক ও উচ্চ শিক্ষা অধিদপ্তর</div>
 <div className="text-[10px] text-slate-500">গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</div>
 </div>
 </div>

 {/* Official Footer Note */}
 <div className="mt-10 pt-3 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-400 font-sans">
 <span>বিদ্যালোক এডুকেশন ম্যানেজমেন্ট সিস্টেম দ্বারা প্রস্তুতকৃত</span>
 <span>মুদ্রণের তারিখ: {new Date().toLocaleDateString('bn-BD')}</span>
 </div>
 </div>
 </div>
 );
};
