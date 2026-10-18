import React, { useState } from 'react';
import { 
 Calendar, Clock, MapPin, Users, CheckCircle2, AlertTriangle, 
 FileText, Plus, Printer, BookOpen, ChevronRight, Check, 
 HelpCircle, ArrowRight, ShieldCheck, Filter, Search 
} from 'lucide-react';
import { CommitteeMeeting, CommitteeDecision, ManagingCommitteeInfo } from '../../types';
import { toBengaliNumber } from '../../utils/bengaliUtils';

interface CommitteeMeetingsManagerProps {
 committee: ManagingCommitteeInfo;
 onOpenQuickAction?: (action: 'notice' | 'session' | 'register' | 'resolution') => void;
 onOpenPolicyGuide?: (topicKey: string) => void;
 onUpdateCommittee?: (updatedFields: Partial<ManagingCommitteeInfo>) => void;
 onUpdateDecisionProgress?: (decisionId: string, progress: number, status: 'implemented' | 'in_progress' | 'delayed') => void;
 onPrintResolution?: (meeting: CommitteeMeeting) => void;
}

export const CommitteeMeetingsManager: React.FC<CommitteeMeetingsManagerProps> = ({
 committee,
 onOpenQuickAction,
 onOpenPolicyGuide,
 onUpdateCommittee,
 onUpdateDecisionProgress,
 onPrintResolution
}) => {
 const [filterType, setFilterType] = useState<'all' | 'completed' | 'scheduled'>('all');
 const [searchQuery, setSearchQuery] = useState('');

 const meetings = committee.meetings || [];
 const decisions = committee.decisions || [];

 // Metrics
 const totalMeetings = meetings.length;
 const completedMeetings = meetings.filter(m => m.status === 'completed').length;
 const scheduledMeetings = meetings.filter(m => m.status === 'scheduled').length;

 const totalDecisions = decisions.length;
 const implementedCount = decisions.filter(d => d.status === 'implemented').length;
 const inProgressCount = decisions.filter(d => d.status === 'in_progress').length;
 const delayedCount = decisions.filter(d => d.status === 'delayed').length;

 const filteredMeetings = meetings.filter(m => {
 if (filterType === 'completed' && m.status !== 'completed') return false;
 if (filterType === 'scheduled' && m.status !== 'scheduled') return false;
 if (searchQuery) {
 const q = searchQuery.toLowerCase();
 return (
 m.meetingNo.toLowerCase().includes(q) ||
 m.title.toLowerCase().includes(q) ||
 (m.place && m.place.toLowerCase().includes(q))
 );
 }
 return true;
 });

 return (
 <div id="committee-meetings-manager" className="space-y-6 ">
 
 {/* PAGE HEADER WITH BREADCRUMB & POLICY GUIDELINE BUTTON */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
 <div>
 <div className="flex items-center gap-2">
 <span className="text-xs font-semibold text-slate-400">কমিটি ব্যবস্থাপনা</span>
 <span className="text-xs text-slate-300">›</span>
 <span className="text-xs font-bold text-emerald-800">সভা ও সিদ্ধান্ত বাস্তবায়ন</span>
 </div>
 <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
 পরিচালনা পরিষদের সভা ও সিদ্ধান্ত রেজিস্টার
 </h2>
 <p className="text-xs text-slate-500 mt-0.5">
 নোটিশ জারি, অধিবেশন কার্যবিবরণী, উপস্থিতি কোরাম, রেজুলেশন ও উন্নয়ন সিদ্ধান্ত ট্র্যাকার
 </p>
 </div>

 <div className="flex items-center flex-wrap gap-2.5">
 {/* POLICY GUIDELINE BUTTON (Requested in prompt) */}
 <button
 type="button"
 onClick={() => onOpenPolicyGuide?.('meetings')}
 className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm group"
 title="সভা পরিচালনার সরকারি ও বোর্ড নীতিমালা দেখুন"
 >
 <BookOpen className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
 <span>সভা পরিচালনা নীতিমালা</span>
 </button>

 <button
 type="button"
 onClick={() => onOpenQuickAction?.('notice')}
 className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
 >
 <Plus className="w-4 h-4 text-emerald-700" />
 <span>সভার নোটিশ তৈরি</span>
 </button>

 <button
 type="button"
 onClick={() => onOpenQuickAction?.('session')}
 className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-900/20"
 >
 <CheckCircle2 className="w-4 h-4" />
 <span>অধিবেশন এন্ট্রি</span>
 </button>
 </div>
 </div>

 {/* STATS TILES (DECISIONS & MEETINGS OVERVIEW) */}
 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
 <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
 <span className="text-[11px] font-bold text-slate-400 block uppercase">মোট সভা অনুষ্ঠিত</span>
 <div className="text-2xl font-black text-slate-900">{toBengaliNumber(totalMeetings)}টি</div>
 <span className="text-[10px] text-slate-500 font-medium">রেকর্ডকৃত অধিবেশন</span>
 </div>

 <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
 <span className="text-[11px] font-bold text-slate-400 block uppercase">আসন্ন সভা</span>
 <div className="text-2xl font-black text-sky-700">{toBengaliNumber(scheduledMeetings)}টি</div>
 <span className="text-[10px] text-sky-600 font-medium">নোটিশ জারি করা</span>
 </div>

 <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-1">
 <span className="text-[11px] font-bold text-slate-400 block uppercase">গৃহীত মোট সিদ্ধান্ত</span>
 <div className="text-2xl font-black text-slate-900">{toBengaliNumber(totalDecisions)}টি</div>
 <span className="text-[10px] text-slate-500 font-medium">রেজুলেশনভুক্ত বিষয়</span>
 </div>

 <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 shadow-sm space-y-1">
 <span className="text-[11px] font-bold text-emerald-800 block uppercase">বাস্তবায়িত</span>
 <div className="text-2xl font-black text-emerald-700">{toBengaliNumber(implementedCount)}টি</div>
 <span className="text-[10px] text-emerald-700 font-medium">১০০% সম্পন্ন</span>
 </div>

 <div className="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/40 shadow-sm space-y-1">
 <span className="text-[11px] font-bold text-amber-800 block uppercase">বাস্তবায়নাধীন</span>
 <div className="text-2xl font-black text-amber-700">{toBengaliNumber(inProgressCount)}টি</div>
 <span className="text-[10px] text-amber-700 font-medium">কাজ চলমান রয়েছে</span>
 </div>

 <div className="bg-white p-4 rounded-2xl border border-rose-200/80 bg-rose-50/40 shadow-sm space-y-1">
 <span className="text-[11px] font-bold text-rose-800 block uppercase">বিলম্বিত</span>
 <div className="text-2xl font-black text-rose-700">{toBengaliNumber(delayedCount)}টি</div>
 <span className="text-[10px] text-rose-700 font-medium">পুনঃপর্যালোচনা প্রয়োজন</span>
 </div>
 </div>

 {/* DECISION IMPLEMENTATION TRACKER MATRIX */}
 <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
 <div>
 <h3 className="text-base font-black text-slate-900">
 গৃহীত সিদ্ধান্তের বাস্তবায়ন অগ্রগতি ও মনিটরিং
 </h3>
 <p className="text-xs text-slate-500">
 কমিটির সভায় অনুমোদিত প্রস্তাবসমূহ ও উপকমিটির বাস্তবায়ন প্রতিবেদন
 </p>
 </div>

 <button
 type="button"
 onClick={() => onOpenQuickAction?.('register')}
 className="px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 self-start sm:self-center"
 >
 <Printer className="w-3.5 h-3.5" />
 <span>সিদ্ধান্ত বাস্তবায়ন রিপোর্ট PDF</span>
 </button>
 </div>

 <div className="space-y-3">
 {decisions.map((dec) => {
 const isCompleted = dec.status === 'implemented';
 const isDelayed = dec.status === 'delayed';

 return (
 <div 
 key={dec.id}
 className={`p-4 rounded-2xl border transition-all ${
 isCompleted 
 ? 'bg-slate-50/60 border-slate-200' 
 : isDelayed
 ? 'bg-rose-50/30 border-rose-200'
 : 'bg-white border-amber-200/80 shadow-sm'
 }`}
 >
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
 <div className="space-y-1">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 font-mono">
 {dec.meetingNo || 'সভা'} • সিদ্ধান্ত নং {dec.decisionNo}
 </span>
 
 <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
 isCompleted
 ? 'bg-emerald-100 text-emerald-800'
 : isDelayed
 ? 'bg-rose-100 text-rose-800'
 : 'bg-amber-100 text-amber-900'
 }`}>
 {isCompleted ? '● বাস্তবায়িত' : isDelayed ? '● বিলম্বিত' : '● চলমান'}
 </span>

 <span className="text-xs text-slate-400 font-mono">তারিখ: {dec.date}</span>
 </div>

 <h4 className="text-sm font-black text-slate-900">{dec.title}</h4>
 {dec.description && (
 <p className="text-xs text-slate-600 leading-relaxed">{dec.description}</p>
 )}
 </div>

 {/* PROGRESS BAR & STATS */}
 <div className="sm:text-right min-w-[180px] space-y-1.5 shrink-0 pt-2 sm:pt-0">
 <div className="flex items-center justify-between text-xs">
 <span className="text-slate-500 font-medium">অগ্রগতি:</span>
 <span className="font-bold text-slate-900 font-mono">{toBengaliNumber(dec.progressPercent)}%</span>
 </div>

 <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
 <div 
 className={`h-full rounded-full transition-all ${
 isCompleted ? 'bg-emerald-600' : isDelayed ? 'bg-rose-500' : 'bg-amber-500'
 }`}
 style={{ width: `${dec.progressPercent}%` }}
 />
 </div>

 <span className="text-[11px] text-slate-500 block truncate">
 দায়িত্বপ্রাপ্ত: <strong className="text-slate-700">{dec.assignedTo || '-'}</strong>
 </span>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>

 {/* MEETINGS SITTINGS DIRECTORY */}
 <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
 <div className="space-y-1">
 <h3 className="text-base font-black text-slate-900">
 সভার পূর্ণাঙ্গ বিবরণী ও রেজুলেশন তালিকা
 </h3>
 <p className="text-xs text-slate-500">
 আইনি কোরাম, নোটিশ ও কার্যবিবরণী রেজিস্টার
 </p>
 </div>

 <div className="flex items-center gap-2">
 <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
 <button
 type="button"
 onClick={() => setFilterType('all')}
 className={`px-3 py-1 rounded-lg transition-all ${filterType === 'all' ? 'bg-white text-emerald-800 shadow-sm' : ''}`}
 >
 সকল সভা
 </button>
 <button
 type="button"
 onClick={() => setFilterType('completed')}
 className={`px-3 py-1 rounded-lg transition-all ${filterType === 'completed' ? 'bg-white text-emerald-800 shadow-sm' : ''}`}
 >
 অনুষ্ঠিত
 </button>
 <button
 type="button"
 onClick={() => setFilterType('scheduled')}
 className={`px-3 py-1 rounded-lg transition-all ${filterType === 'scheduled' ? 'bg-white text-emerald-800 shadow-sm' : ''}`}
 >
 আসন্ন
 </button>
 </div>
 </div>
 </div>

 <div className="space-y-4">
 {filteredMeetings.map((m) => (
 <div 
 key={m.id}
 className="p-5 rounded-2xl border border-slate-200/90 hover:border-emerald-300 transition-all bg-slate-50/50 space-y-4"
 >
 <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
 <div className="space-y-1.5">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-800 text-white">
 {m.meetingNo}
 </span>
 <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
 m.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
 }`}>
 {m.status === 'completed' ? '✓ সম্পন্ন' : '⏳ নির্ধারিত'}
 </span>
 <span className="text-xs text-slate-500 font-mono">স্মারক: {m.resolutionNo || 'বিউবি/রেজু'}</span>
 </div>

 <h4 className="text-base font-black text-slate-900 mt-1">{m.title}</h4>

 <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
 <span className="flex items-center gap-1.5 font-medium">
 <Calendar className="w-3.5 h-3.5 text-slate-400" />
 {m.date}
 </span>
 <span className="flex items-center gap-1.5 font-medium">
 <Clock className="w-3.5 h-3.5 text-slate-400" />
 {m.time || '১১:০০'}
 </span>
 <span className="flex items-center gap-1.5 font-medium">
 <MapPin className="w-3.5 h-3.5 text-slate-400" />
 {m.place || 'বিদ্যালয়ের সভাকক্ষ'}
 </span>
 <span className="flex items-center gap-1.5 font-medium text-emerald-800 font-semibold">
 <Users className="w-3.5 h-3.5 text-emerald-600" />
 উপস্থিতি: {toBengaliNumber(m.attendeesCount || 11)} জন (কোরাম পূর্ণ)
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2 self-start">
 <button
 type="button"
 onClick={() => {
 if (onPrintResolution) {
 onPrintResolution(m);
 } else {
 onOpenQuickAction?.('resolution');
 }
 }}
 className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
 >
 <Printer className="w-3.5 h-3.5 text-emerald-700" />
 <span>রেজুলেশন প্রিন্ট</span>
 </button>
 </div>
 </div>

 {/* AGENDAS */}
 {m.agenda && m.agenda.length > 0 && (
 <div className="pt-2 border-t border-slate-200/60">
 <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
 গৃহীত আলোচ্যসূচি (Agendas)
 </span>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
 {m.agenda.map((ag, idx) => (
 <div key={idx} className="text-xs text-slate-700 bg-white p-2 rounded-xl border border-slate-100 flex items-start gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5" />
 <span>{ag}</span>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 </div>
 );
};
