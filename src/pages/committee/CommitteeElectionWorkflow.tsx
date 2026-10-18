import React, { useState, useMemo } from 'react';
import { 
 CheckCircle2, Circle, Clock, ChevronDown, ChevronUp, 
 FileText, ShieldCheck, AlertCircle, Calendar, Sparkles,
 ExternalLink, Printer, Check, Info, BookOpen, RefreshCw, 
 Lock, Unlock, ArrowRight, UserCheck, Vote, Award, 
 Upload, HelpCircle, Users, CheckSquare, Layers
} from 'lucide-react';
import { calculateUniqueGuardians, calculateEligibleTeachers } from '../../utils/committeeUtils';
import { Institution, ManagingCommitteeInfo } from '../../types';
import { toBengaliNumber } from '../../utils/bengaliUtils';
import { useAppStore } from '../../store/useAppStore';

interface CommitteeElectionWorkflowProps {
 institution?: Institution | null;
 currentCommittee?: ManagingCommitteeInfo;
 onOpenPolicyGuide: (topicKey: string) => void;
 onActivateCommittee?: (activatedCommittee: ManagingCommitteeInfo) => void;
 onBackToOverview?: () => void;
}

type FormationStepKey = 
 | 'voters' 
 | 'officer' 
 | 'schedule' 
 | 'nomination' 
 | 'scrutiny' 
 | 'ballot' 
 | 'result' 
 | 'chairman' 
 | 'submission' 
 | 'approval' 
 | 'firstMeeting';

export const CommitteeElectionWorkflow: React.FC<CommitteeElectionWorkflowProps> = ({
 institution,
 currentCommittee,
 onOpenPolicyGuide,
 onActivateCommittee,
 onBackToOverview
}) => {
 const { students, staff, saveManagingCommitteeRecord } = useAppStore();

 const [committeeMode, setCommitteeMode] = useState<'regular' | 'adhoc'>('regular');
 const [viewMode, setViewMode] = useState<'interactive' | 'roadmap'>('interactive');
 const [currentStep, setCurrentStep] = useState<FormationStepKey>('voters');

 // STEP 1: Voters State
 const studentGuardiansCount = useMemo(() => calculateUniqueGuardians(students), [students]);
 const teachersCount = useMemo(() => calculateEligibleTeachers(staff), [staff]);
 const femaleGuardiansCount = 0;
 const donorEduCount = 0;
 const totalVotersCount = studentGuardiansCount + teachersCount + donorEduCount;

 const [isVoterListApproved, setIsVoterListApproved] = useState(false);
 const [toastMessage, setToastMessage] = useState<string | null>(null);

 // STEP 2: Presiding Officer Form State
 const [officerRecipient, setOfficerRecipient] = useState('');
 const [officerMemoNo, setOfficerMemoNo] = useState('');
 const [officerLetterDate, setOfficerLetterDate] = useState('');

 // STEP 3: Schedule State
 const [scheduleData, setScheduleData] = useState({
 nominationDistStart: '',
 nominationSubEnd: '',
 scrutinyDate: '',
 withdrawalEnd: '',
 finalCandidateListDate: '',
 electionDate: ''
 });

 // STEP 4: Nominations State
 const [nominationTab, setNominationTab] = useState<'dist' | 'rec'>('dist');
 const [nominationsList, setNominationsList] = useState<any[]>([]);

 // STEP 5: Scrutiny Criteria Check State
 const [scrutinyChecks, setScrutinyChecks] = useState({
 voterMatch: false,
 correctCategory: false,
 requiredAttachments: false,
 noDualCandidacy: false,
 legalEligibility: false
 });
 const [isScrutinySubmitted, setIsScrutinySubmitted] = useState(false);

 // STEP 7: Election Results State
 const [turnoutVotes, setTurnoutVotes] = useState<number>(0);
 const [invalidVotes, setInvalidVotes] = useState<number>(0);
 const [isResultLocked, setIsResultLocked] = useState(false);
 const [candidateVotes, setCandidateVotes] = useState<Record<string, number>>({});

 // STEP 8: Chairman Election State
 const [chairmanMeetingDate, setChairmanMeetingDate] = useState('');
 const [chairmanCandidateVotes, setChairmanCandidateVotes] = useState<{ name: string; votes: number }[]>([]);
 const [isChairmanResolutionCreated, setIsChairmanResolutionCreated] = useState(false);

 // STEP 9: Board Submission Checklist State
 const [submissionChecklist, setSubmissionChecklist] = useState({
 finalVoterList: true,
 scheduleAndResults: true,
 chairmanResolution: true,
 presidingOfficerCertUploaded: false
 });

 // STEP 10: Board Approval State
 const [boardSubmissionDate, setBoardSubmissionDate] = useState('');
 const [boardTrackingNo, setBoardTrackingNo] = useState('');
 const [boardApprovalDate, setBoardApprovalDate] = useState('2026-07-02');
 const [boardApprovalMemoNo, setBoardApprovalMemoNo] = useState('বোর্ড/মাধ্য/কমিটি/২০২৬/৫৯৪');
 const [boardAttachmentName, setBoardAttachmentName] = useState<string | null>('Approval_Order_2026_594.pdf');

 // STEP 11: First Meeting & Activation State
 const [firstMeetingDate, setFirstMeetingDate] = useState('2026-07-10');
 const [firstMeetingTime, setFirstMeetingTime] = useState('১১:০০');
 const [firstMeetingAttendees, setFirstMeetingAttendees] = useState(11);
 const [coOptedMemberName, setCoOptedMemberName] = useState('মোঃ সাইফুল ইসলাম (বিশিষ্ট শিক্ষানুরাগী)');
 const [isActivated, setIsActivated] = useState(false);

 // Overall Progress Percentage
 const progressPercent = useMemo(() => {
 let completedSteps = 0;
 if (isVoterListApproved) completedSteps++;
 if (officerRecipient) completedSteps++;
 if (scheduleData.electionDate) completedSteps++;
 if (nominationsList.some(n => n.status === 'submitted')) completedSteps++;
 if (isScrutinySubmitted) completedSteps++;
 completedSteps++; // Ballot
 if (isResultLocked) completedSteps++;
 if (isChairmanResolutionCreated) completedSteps++;
 if (submissionChecklist.finalVoterList && submissionChecklist.presidingOfficerCertUploaded) completedSteps++;
 if (boardApprovalMemoNo) completedSteps++;
 if (isActivated) completedSteps++;
 return Math.min(100, Math.round((completedSteps / 11) * 100));
 }, [
 isVoterListApproved, officerRecipient, scheduleData.electionDate,
 nominationsList, isScrutinySubmitted, isResultLocked,
 isChairmanResolutionCreated, submissionChecklist,
 boardApprovalMemoNo, isActivated
 ]);

 const showToast = (msg: string) => {
 setToastMessage(msg);
 setTimeout(() => setToastMessage(null), 3000);
 };

 const handleActivateNewCommittee = () => {
 const newYearTerm = '2026–2028';
 const newCommRecord: ManagingCommitteeInfo = {
 id: `mc_${Date.now()}`,
 title: `Managing Committee (${newYearTerm})`,
 titleBn: `ম্যানেজিং কমিটি (${newYearTerm})`,
 hasCommittee: true,
 year: newYearTerm,
 committeeType: 'regular',
 committeeTypeId: 'comm_managing',
 approvalResolutionNo: boardApprovalMemoNo,
 approvalDate: boardApprovalDate,
 firstMeetingDate,
 startDate: firstMeetingDate,
 endDate: '2028-07-09',
 electionDate: scheduleData.electionDate.split('T')[0],
 attachmentName: boardAttachmentName || undefined,
 remarks: 'বোর্ড অনুমোদিত নবগঠিত কার্যনির্বাহী নিয়মিত ব্যবস্থাপনা কমিটি।',
 status: 'active',
 members: currentCommittee?.members || []
 };

 setIsActivated(true);
 saveManagingCommitteeRecord(newCommRecord);
 if (onActivateCommittee) {
 onActivateCommittee(newCommRecord);
 }
 showToast('নতুন কমিটি সফলভাবে Activate হয়েছে! বর্তমান কমিটি আর্কাইভে সংরক্ষিত হয়েছে।');
 };

 const stepsList: { key: FormationStepKey; stepNo: string; title: string; subtitle: string }[] = [
 { key: 'voters', stepNo: '১', title: 'ভোটার তালিকা', subtitle: 'খসড়া প্রস্তুত ও অনুমোদন' },
 { key: 'officer', stepNo: '২', title: 'প্রিজাইডিং অফিসার', subtitle: 'নিয়োগের আবেদনপত্র' },
 { key: 'schedule', stepNo: '৩', title: 'তফসিল ঘোষণা', subtitle: 'তারিখ ও বিজ্ঞপ্তি' },
 { key: 'nomination', stepNo: '৪', title: 'মনোনয়নপত্র', subtitle: 'বিতরণ, গ্রহণ ও বাছাই' },
 { key: 'scrutiny', stepNo: '৫', title: 'বাছাই ও প্রার্থী তালিকা', subtitle: 'যোগ্যতা যাচাই ও খসড়া' },
 { key: 'ballot', stepNo: '৬', title: 'প্রতীক ও ব্যালট', subtitle: 'ক্যাটাগরিভিত্তিক ব্যালট' },
 { key: 'result', stepNo: '৭', title: 'নির্বাচন ও ফলাফল', subtitle: 'ভোট এন্ট্রি ও ফলাফলপত্র' },
 { key: 'chairman', stepNo: '৮', title: 'সভাপতি নির্বাচন', subtitle: 'ভোট ও রেজুলেশন' },
 { key: 'submission', stepNo: '৯', title: 'কমিটি সাবমিশন', subtitle: 'Checklist ও board file' },
 { key: 'approval', stepNo: '১০', title: 'বোর্ড অনুমোদন', subtitle: 'চিঠি ও অনুমোদনের তারিখ' },
 { key: 'firstMeeting', stepNo: '১১', title: 'প্রথম সভা ও কো-অব', subtitle: 'কমিটি activate করুন' },
 ];

 return (
 <div id="committee-election-workflow-root" className="space-y-6 ">
 
 {/* TOAST ALERT */}
 {toastMessage && (
 <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-3 slide-in-from-bottom-5">
 <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
 <span className="text-xs font-bold">{toastMessage}</span>
 </div>
 )}

 {/* PAGE HEAD */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
 <div>
 <div className="flex items-center gap-2">
 <span className="text-xs font-semibold text-slate-400">কমিটি ব্যবস্থাপনা</span>
 <span className="text-xs text-slate-300">›</span>
 <span className="text-xs font-bold text-emerald-800">কমিটি গঠন ও নির্বাচন</span>
 </div>
 <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
 নতুন পরিচালনা পরিষদ গঠন
 </h2>
 <p className="text-xs text-slate-500 mt-0.5">
 শিক্ষা বোর্ড ও সরকারি বিধিমালা অনুযায়ী স্বচ্ছ ধাপে ধাপে নির্বাচন ও অনুমোদন প্রক্রিয়া সম্পন্ন করুন
 </p>
 </div>

 <div className="flex items-center gap-2.5 flex-wrap">
 {/* POLICY GUIDELINE BUTTON */}
 <button
 type="button"
 onClick={() => onOpenPolicyGuide(currentStep)}
 className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm group"
 title="বর্তমান ধাপের জন্য সরকারি প্রবিধান ও বোর্ডের আইনি নির্দেশিকা দেখুন"
 >
 <BookOpen className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
 <span>আইনি নির্দেশিকা ও নীতিমালা</span>
 </button>

 {onBackToOverview && (
 <button
 type="button"
 onClick={onBackToOverview}
 className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
 >
 ← বর্তমান কমিটি
 </button>
 )}
 </div>
 </div>

 {/* COMMITTEE TYPE SELECTOR (REGULAR VS ADHOC) */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <button
 type="button"
 onClick={() => setCommitteeMode('regular')}
 className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
 committeeMode === 'regular'
 ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-600/20 shadow-sm'
 : 'bg-white border-slate-200 hover:border-slate-300'
 }`}
 >
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
 committeeMode === 'regular' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
 }`}>
 ✓
 </div>
 <div>
 <strong className="text-sm font-black text-slate-900 block">নিয়মিত কমিটি</strong>
 <span className="text-xs text-slate-500">ম্যানেজিং / গভর্নিং বডি (নির্বাচনী প্রক্রিয়া)</span>
 </div>
 </button>

 <button
 type="button"
 onClick={() => setCommitteeMode('adhoc')}
 className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
 committeeMode === 'adhoc'
 ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-600/20 shadow-sm'
 : 'bg-white border-slate-200 hover:border-slate-300'
 }`}
 >
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
 committeeMode === 'adhoc' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-600'
 }`}>
 <Clock className="w-5 h-5" />
 </div>
 <div>
 <strong className="text-sm font-black text-slate-900 block">এডহক কমিটি</strong>
 <span className="text-xs text-slate-500">মনোনয়ন ও বিশেষ পরিস্থিতি ভিত্তিক প্রক্রিয়া</span>
 </div>
 </button>
 </div>

 {committeeMode === 'adhoc' ? (
 /* ADHOC COMMITTEE NOTICE / WORKFLOW */
 <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-4 shadow-sm">
 <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
 <Clock className="w-7 h-7" />
 </div>
 <div className="max-w-md mx-auto space-y-1">
 <h3 className="text-lg font-black text-slate-900">এডহক কমিটি গঠন প্রক্রিয়া</h3>
 <p className="text-xs text-slate-600 leading-relaxed">
 বোর্ড প্রবিধান অনুযায়ী বিশেষ পরিস্থিতিতে (যেমন মেয়াদ শেষ হলেও নির্বাচন সম্ভব না হলে) ৬ মাসের মেয়াদে সভাপতি, সদস্য সচিব ও ৩ জন সদস্য সমন্বয়ে ৫ সদস্যবিশিষ্ট এডহক কমিটি অনুমোদনের আবেদন প্রস্তুত করা হয়।
 </p>
 </div>
 <div className="pt-2 flex justify-center gap-3">
 <button
 type="button"
 onClick={() => onOpenPolicyGuide('formation_general')}
 className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold"
 >
 এডহক নীতিমালা পড়ুন
 </button>
 <button
 type="button"
 onClick={() => setCommitteeMode('regular')}
 className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold"
 >
 নিয়মিত নির্বাচন পাইপলাইনে ফিরুন
 </button>
 </div>
 </div>
 ) : (
 /* REGULAR COMMITTEE 11-STEP INTERACTIVE EXECUTIVE PIPELINE */
 <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm">
 
 {/* FLOW HEADER WITH PROGRESS BAR */}
 <div className="p-5 sm:p-6 border-b border-slate-200/90 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
 চলমান নির্বাচন কার্যক্রম
 </span>
 <h3 className="text-lg font-black text-slate-900 mt-0.5">
 নিয়মিত ব্যবস্থাপনা কমিটি নির্বাচন ও অনুমোদন • ২০২৬
 </h3>
 <p className="text-xs text-slate-500 font-mono mt-0.5">
 শুরু: ১২ মে ২০২৬ • লক্ষ্যমাত্রা: ৩০ জুন ২০২৬
 </p>
 </div>

 <div className="sm:text-right space-y-1.5 min-w-[170px]">
 <div className="flex items-center justify-between sm:justify-end gap-2">
 <span className="text-xs text-slate-500 font-medium">সামগ্রিক অগ্রগতি:</span>
 <span className="text-base font-black text-emerald-800 font-mono">
 {toBengaliNumber(progressPercent)}%
 </span>
 </div>
 <div className="w-full sm:w-44 h-2 bg-slate-200 rounded-full overflow-hidden">
 <div 
 className="h-full bg-emerald-600 rounded-full transition-all " 
 style={{ width: `${progressPercent}%` }} 
 />
 </div>
 </div>
 </div>

 {/* TWO COLUMN INTERACTIVE BODY */}
 <div className="grid grid-cols-1 lg:grid-cols-12">
 
 {/* STEP BUTTONS SIDEBAR (11 STEPS) */}
 <aside className="lg:col-span-4 border-r border-slate-200/90 bg-slate-50/50 p-3 space-y-1 overflow-x-auto lg:overflow-x-visible flex lg:flex-col shrink-0">
 {stepsList.map((st) => {
 const isActive = currentStep === st.key;
 return (
 <button
 key={st.key}
 type="button"
 onClick={() => setCurrentStep(st.key)}
 className={`w-full text-left p-3 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer shrink-0 lg:shrink ${
 isActive
 ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
 : 'text-slate-700 hover:bg-white hover:text-slate-900'
 }`}
 >
 <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
 isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-700'
 }`}>
 {st.stepNo}
 </div>
 <div className="truncate">
 <strong className="block truncate">{st.title}</strong>
 <span className={`block text-[10px] font-normal truncate mt-0.5 ${isActive ? 'text-emerald-200' : 'text-slate-400'}`}>
 {st.subtitle}
 </span>
 </div>
 </button>
 );
 })}
 </aside>

 {/* STEP CONTENT PANE */}
 <main className="lg:col-span-8 p-6 sm:p-7 space-y-6">
 
 {/* STEP 1: VOTERS LIST */}
 {currentStep === 'voters' && (
 <div className="space-y-5 ">
 <div className="flex items-center justify-between border-b border-slate-100 pb-4">
 <div>
 <span className="text-[10px] font-bold uppercase text-emerald-700">ধাপ ১</span>
 <h3 className="text-lg font-black text-slate-900">ভোটার তালিকা তৈরি</h3>
 <p className="text-xs text-slate-500">
 বিদ্যমান শিক্ষার্থী ও শিক্ষক ডাটাবেজ থেকে স্বয়ংক্রিয় ক্যাটাগরিভিত্তিক তালিকা প্রস্তুত করুন
 </p>
 </div>

 <button
 type="button"
 onClick={() => showToast(`ডাটাবেজ থেকে ${toBengaliNumber(totalVotersCount)} জন ভোটার সিঙ্ক হয়েছে`)}
 className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
 >
 <RefreshCw className="w-3.5 h-3.5" />
 <span>↻ ডাটাবেজ থেকে সিঙ্ক</span>
 </button>
 </div>

 {/* DATA SOURCE BADGE */}
 <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
 <div>
 <strong className="block font-black">স্বয়ংক্রিয় ডাটাবেজ উৎস:</strong>
 <span className="text-[11px] text-emerald-800">
 চলতি শিক্ষাবর্ষের বৈধ শিক্ষার্থী ও অভিভাবক • শিক্ষক ও কর্মচারী • প্রতিষ্ঠাতা ও দাতা
 </span>
 </div>
 <span className="text-[10px] text-emerald-700 font-mono bg-white px-2 py-1 rounded-lg border border-emerald-200">
 Sync: আজ, {new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>

 {/* VOTER CATEGORY TILES */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
 <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
 <span className="text-[11px] text-slate-500 font-medium block">অভিভাবক</span>
 <div className="text-2xl font-black text-slate-900 font-mono">{toBengaliNumber(studentGuardiansCount)}</div>
 <span className="text-[10px] text-emerald-700 font-bold block">✓ প্রস্তুত</span>
 </div>

 <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
 <span className="text-[11px] text-slate-500 font-medium block">শিক্ষক</span>
 <div className="text-2xl font-black text-slate-900 font-mono">{toBengaliNumber(teachersCount)}</div>
 <span className="text-[10px] text-emerald-700 font-bold block">✓ প্রস্তুত</span>
 </div>

 <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
 <span className="text-[11px] text-slate-500 font-medium block">নারী অভিভাবক</span>
 <div className="text-2xl font-black text-slate-900 font-mono">{toBengaliNumber(femaleGuardiansCount)}</div>
 <span className="text-[10px] text-emerald-700 font-bold block">✓ প্রস্তুত</span>
 </div>

 <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
 <span className="text-[11px] text-slate-500 font-medium block">প্রতিষ্ঠাতা / দাতা</span>
 <div className="text-2xl font-black text-slate-900 font-mono">{toBengaliNumber(donorEduCount)}</div>
 <span className="text-[10px] text-amber-700 font-bold block">যাচাই প্রয়োজন</span>
 </div>
 </div>

 {/* DRAFT DOCUMENT ROW */}
 <div className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
 <FileText className="w-5 h-5" />
 </div>
 <div>
 <strong className="text-xs font-black text-slate-900 block">খসড়া ভোটার তালিকা (Draft Voter List)</strong>
 <span className="text-[11px] text-slate-500">
 {toBengaliNumber(totalVotersCount)} জন ভোটার • তৈরি: {new Date().toLocaleDateString('bn-BD')}
 </span>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => showToast('খসড়া ভোটার তালিকা PDF প্রস্তুত')}
 className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
 >
 খসড়া PDF
 </button>
 <button
 type="button"
 onClick={() => {
 setIsVoterListApproved(true);
 showToast('খসড়া অনুমোদিত হয়েছে এবং চূড়ান্ত ভোটার তালিকা লক হয়েছে');
 }}
 className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
 isVoterListApproved 
 ? 'bg-emerald-100 text-emerald-800' 
 : 'bg-emerald-800 hover:bg-emerald-900 text-white'
 }`}
 >
 {isVoterListApproved ? '✓ অনুমোদিত' : 'খসড়া অনুমোদন'}
 </button>
 </div>
 </div>

 {/* FINAL DOCUMENT ROW */}
 <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
 isVoterListApproved ? 'bg-white border-emerald-200' : 'bg-slate-50 border-slate-200 opacity-60'
 }`}>
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center">
 {isVoterListApproved ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Lock className="w-5 h-5" />}
 </div>
 <div>
 <strong className="text-xs font-black text-slate-900 block">চূড়ান্ত ভোটার তালিকা (Final Voter List)</strong>
 <span className="text-[11px] text-slate-500">
 {isVoterListApproved ? 'অনুমোদিত • তালিকাটি lock করা হয়েছে' : 'খসড়া অনুমোদনের পর lock ও download হবে'}
 </span>
 </div>
 </div>

 <button
 type="button"
 disabled={!isVoterListApproved}
 onClick={() => showToast('চূড়ান্ত ভোটার তালিকা PDF ডাউনলোড হয়েছে')}
 className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
 isVoterListApproved 
 ? 'bg-emerald-800 text-white hover:bg-emerald-900 shadow-md' 
 : 'bg-slate-200 text-slate-400 cursor-not-allowed'
 }`}
 >
 চূড়ান্ত PDF ⇩
 </button>
 </div>
 </div>
 )}

 {/* STEP 2: PRESIDING OFFICER */}
 {currentStep === 'officer' && (
 <div className="space-y-5 ">
 <div className="border-b border-slate-100 pb-4">
 <span className="text-[10px] font-bold uppercase text-emerald-700">ধাপ ২</span>
 <h3 className="text-lg font-black text-slate-900">প্রিজাইডিং অফিসার মনোনয়ন</h3>
 <p className="text-xs text-slate-500">
 প্রতিষ্ঠানের প্যাডে উপজেলা প্রশাসনের নিকট সরকারি কর্মকর্তা নিয়োগের আনুষ্ঠানিক আবেদনপত্র
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
 {/* LETTERHEAD PREVIEW */}
 <div className="md:col-span-7 p-6 bg-white border border-slate-200 rounded-2xl space-y-3 font-serif shadow-sm">
 <div className="text-center border-b pb-2 border-slate-200">
 <h4 className="font-bold text-base text-slate-900">{institution?.nameBn || institution?.name || '-'}</h4>
 <p className="text-xs text-slate-500">EIIN: {institution?.eiin || '-'} • {institution?.addressBn || institution?.address || '-'}</p>
 </div>

 <div className="text-xs space-y-2 text-slate-800 leading-relaxed pt-2">
 <p>তারিখ: {officerLetterDate}</p>
 <p>স্মারক নং: {officerMemoNo}</p>
 <div className="pt-1">
 <strong>বরাবর,<br />{officerRecipient}</strong>
 </div>
 <p className="font-bold">
 বিষয়: বেসরকারি মাধ্যমিক বিদ্যালয় ম্যানেজিং কমিটি নির্বাচন অনুষ্ঠানের লক্ষ্যে প্রিজাইডিং অফিসার মনোনয়ন প্রসঙ্গে।
 </p>
 <p>
 মহোদয়, যথাবিহীত সম্মানপূর্বক নিবেদন এই যে, অত্র বিদ্যালয়ের বর্তমান পরিচালনা পরিষদের মেয়াদ আগামী ৩০ জুন ২০২৬ তারিখ সমাপ্ত হতে যাচ্ছে। বিধি মোতাবেক অবাধ, নিরপেক্ষ ও সুষ্ঠুভাবে নির্বাচন পরিচালনার জন্য একজন উপযুক্ত প্রিজাইডিং অফিসার নিয়োগের সদয় মর্জি কামনা করছি।
 </p>
 <div className="pt-4 text-right">
 <p className="font-bold">প্রধান শিক্ষক ও সদস্য সচিব</p>
 <p>{institution?.nameBn || institution?.name || '-'}</p>
 </div>
 </div>
 </div>

 {/* LETTER INPUTS */}
 <div className="md:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3.5 self-start">
 <h4 className="text-xs font-bold uppercase text-slate-700">পত্রের তথ্য ও প্যারামিটার</h4>
 
 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">প্রাপক</label>
 <select
 value={officerRecipient}
 onChange={e => setOfficerRecipient(e.target.value)}
 className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none"
 >
 <option value="উপজেলা নির্বাহী অফিসার">উপজেলা নির্বাহী অফিসার</option>
 <option value="জেলা প্রশাসক">জেলা প্রশাসক</option>
 <option value="উপজেলা মাধ্যমিক শিক্ষা অফিসার">উপজেলা মাধ্যমিক শিক্ষা অফিসার</option>
 </select>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">স্মারক নম্বর</label>
 <input
 type="text"
 value={officerMemoNo}
 onChange={e => setOfficerMemoNo(e.target.value)}
 className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none font-mono"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-600 mb-1">পত্রের তারিখ</label>
 <input
 type="date"
 value={officerLetterDate}
 onChange={e => setOfficerLetterDate(e.target.value)}
 className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none"
 />
 </div>

 <button
 type="button"
 onClick={() => showToast('প্রিজাইডিং অফিসার আবেদনপত্র PDF ডাউনলোড হয়েছে')}
 className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-emerald-900/20"
 >
 আবেদনপত্র PDF ⇩
 </button>
 </div>
 </div>
 </div>
 )}

 {/* STEP 3: SCHEDULE */}
 {currentStep === 'schedule' && (
 <div className="space-y-5 ">
 <div className="border-b border-slate-100 pb-4">
 <span className="text-[10px] font-bold uppercase text-emerald-700">ধাপ ৩</span>
 <h3 className="text-lg font-black text-slate-900">নির্বাচন তফসিল ঘোষণা</h3>
 <p className="text-xs text-slate-500">
 তারিখ ও সময়সীমা নির্ধারণ করলেই সরকারি বিধি অনুযায়ী ব্যবহারের উপযোগী তফসিল স্বয়ংক্রিয়ভাবে তৈরি হবে
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
 <label className="text-xs font-bold text-slate-700 block">মনোনয়নপত্র বিতরণ শুরু</label>
 <input
 type="datetime-local"
 value={scheduleData.nominationDistStart}
 onChange={e => setScheduleData({ ...scheduleData, nominationDistStart: e.target.value })}
 className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
 />
 </div>

 <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
 <label className="text-xs font-bold text-slate-700 block">মনোনয়নপত্র জমার শেষ সময়</label>
 <input
 type="datetime-local"
 value={scheduleData.nominationSubEnd}
 onChange={e => setScheduleData({ ...scheduleData, nominationSubEnd: e.target.value })}
 className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
 />
 </div>

 <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
 <label className="text-xs font-bold text-slate-700 block">মনোনয়নপত্র বাছাই (Scrutiny)</label>
 <input
 type="datetime-local"
 value={scheduleData.scrutinyDate}
 onChange={e => setScheduleData({ ...scheduleData, scrutinyDate: e.target.value })}
 className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
 />
 </div>

 <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
 <label className="text-xs font-bold text-slate-700 block">প্রার্থিতা প্রত্যাহারের শেষ সময়</label>
 <input
 type="datetime-local"
 value={scheduleData.withdrawalEnd}
 onChange={e => setScheduleData({ ...scheduleData, withdrawalEnd: e.target.value })}
 className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
 />
 </div>

 <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
 <label className="text-xs font-bold text-slate-700 block">চূড়ান্ত প্রার্থী তালিকা প্রকাশ</label>
 <input
 type="datetime-local"
 value={scheduleData.finalCandidateListDate}
 onChange={e => setScheduleData({ ...scheduleData, finalCandidateListDate: e.target.value })}
 className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
 />
 </div>

 <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
 <label className="text-xs font-black text-emerald-900 block">ভোটগ্রহণের চূড়ান্ত তারিখ ও সময়</label>
 <input
 type="datetime-local"
 value={scheduleData.electionDate}
 onChange={e => setScheduleData({ ...scheduleData, electionDate: e.target.value })}
 className="w-full px-3 py-2 text-xs border border-emerald-300 rounded-xl bg-white font-bold"
 />
 </div>
 </div>

 <div className="flex items-center justify-between pt-2">
 <span className="text-xs text-slate-500 font-medium">
 ✓ প্রবিধান অনুযায়ী তারিখের ন্যূনতম বিধিবদ্ধ ব্যবধান সংরক্ষিত রয়েছে
 </span>

 <button
 type="button"
 onClick={() => showToast('নির্বাচন তফসিল প্রজ্ঞাপন ও PDF প্রস্তুত')}
 className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-900/20"
 >
 তফসিল তৈরি ও PDF ⇩
 </button>
 </div>
 </div>
 )}

 {/* STEP 4: NOMINATIONS */}
 {currentStep === 'nomination' && (
 <div className="space-y-5 ">
 <div className="flex items-center justify-between border-b border-slate-100 pb-4">
 <div>
 <span className="text-[10px] font-bold uppercase text-emerald-700">ধাপ ৪</span>
 <h3 className="text-lg font-black text-slate-900">মনোনয়নপত্র বিতরণ ও গ্রহণ রেজিস্টার</h3>
 <p className="text-xs text-slate-500">
 বিতরণ ও জমা—দুটি ইন্টারলিঙ্কড রেজিস্টার থেকে পরিচালিত হবে
 </p>
 </div>

 <button
 type="button"
 onClick={() => showToast('নতুন প্রার্থীর মনোনয়নপত্র ইস্যু করা হয়েছে')}
 className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold"
 >
 ＋ মনোনয়নপত্র বিতরণ
 </button>
 </div>

 {/* MINI STATS */}
 <div className="grid grid-cols-4 gap-3">
 <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
 <strong className="text-lg font-black text-slate-900 block">২৪</strong>
 <span className="text-slate-500 text-[11px]">বিতরণকৃত ফরম</span>
 </div>
 <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
 <strong className="text-lg font-black text-slate-900 block">১৯</strong>
 <span className="text-slate-500 text-[11px]">জমাকৃত ফরম</span>
 </div>
 <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
 <strong className="text-lg font-black text-emerald-800 block">১৬</strong>
 <span className="text-emerald-700 text-[11px]">গৃহীত ও বৈধ</span>
 </div>
 <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
 <strong className="text-lg font-black text-amber-800 block">০৩</strong>
 <span className="text-amber-700 text-[11px]">যাচাইাধীন</span>
 </div>
 </div>

 {/* CANDIDATES SMART LIST */}
 <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
 {nominationsList.map((nom) => (
 <div key={nom.id} className="p-3.5 bg-white flex items-center justify-between gap-3 text-xs">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
 {nom.name.slice(0, 2)}
 </div>
 <div>
 <strong className="text-slate-900 block">{nom.name}</strong>
 <span className="text-slate-400 text-[11px]">{nom.category} • ফরম {nom.formNo}</span>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
 nom.status === 'submitted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
 }`}>
 {nom.status === 'submitted' ? 'জমা হয়েছে' : 'বিতরণকৃত'}
 </span>
 <button
 type="button"
 onClick={() => showToast(`ফরম ${nom.formNo} PDF প্রস্তুত`)}
 className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700"
 >
 PDF
 </button>
 </div>
 </div>
 ))}
 </div>

 <div className="flex justify-end gap-2 pt-1">
 <button
 type="button"
 onClick={() => showToast('বিতরণ রেজিস্টার PDF প্রস্তুত')}
 className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
 >
 ⇩ বিতরণ রেজিস্টার
 </button>
 <button
 type="button"
 onClick={() => showToast('জমা গ্রহণ রেজিস্টার PDF প্রস্তুত')}
 className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
 >
 ⇩ জমা রেজিস্টার
 </button>
 </div>
 </div>
 )}

 {/* STEP 5: SCRUTINY */}
 {currentStep === 'scrutiny' && (
 <div className="space-y-5 ">
 <div className="border-b border-slate-100 pb-4">
 <span className="text-[10px] font-bold uppercase text-emerald-700">ধাপ ৫</span>
 <h3 className="text-lg font-black text-slate-900">মনোনয়নপত্র বাছাই ও বৈধ প্রার্থী তালিকা</h3>
 <p className="text-xs text-slate-500">
 নীতিমালার মানদণ্ড অনুযায়ী প্রতিটি প্রার্থীর যোগ্যতা ও সংযুক্তি স্ক্রুটিনি করুন
 </p>
 </div>

 {/* CRITERIA CHECKLIST */}
 <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80 space-y-2">
 <span className="text-xs font-black text-emerald-900 uppercase tracking-wider block">
 আইনি যাচাই চেকলিস্ট (Scrutiny Checklist)
 </span>
 <div className="flex flex-wrap gap-2 text-xs">
 <span className="px-3 py-1 bg-white border border-emerald-200 rounded-full font-bold text-emerald-800">
 ✓ ভোটার তালিকায় বৈধ অন্তর্ভুক্তি
 </span>
 <span className="px-3 py-1 bg-white border border-emerald-200 rounded-full font-bold text-emerald-800">
 ✓ নির্দিষ্ট ক্যাটাগরি মিল
 </span>
 <span className="px-3 py-1 bg-white border border-emerald-200 rounded-full font-bold text-emerald-800">
 ✓ ব্যাংক জামানত ও সংযুক্তি
 </span>
 <span className="px-3 py-1 bg-white border border-emerald-200 rounded-full font-bold text-emerald-800">
 ✓ দ্বৈত প্রার্থিতা বর্জন
 </span>
 <span className="px-3 py-1 bg-white border border-emerald-200 rounded-full font-bold text-emerald-800">
 ✓ ঋণখেলাপি না হওয়ার প্রত্যয়ন
 </span>
 </div>
 </div>

 {/* CANDIDATE SCRUTINY LIST */}
 <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
 <div className="p-3.5 bg-white flex items-center justify-between text-xs">
 <div>
 <strong className="text-slate-900 block font-bold">মোঃ মনির হোসেন</strong>
 <span className="text-emerald-700 text-[11px]">৫/৫টি শর্তাবলি সফলভাবে পূরণ হয়েছে</span>
 </div>
 <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">
 বৈধ প্রার্থী
 </span>
 </div>

 <div className="p-3.5 bg-white flex items-center justify-between text-xs">
 <div>
 <strong className="text-slate-900 block font-bold">সাবিনা ইয়াসমিন</strong>
 <span className="text-emerald-700 text-[11px]">সংরক্ষিত নারী কোটায় প্রয়োজনীয় প্রত্যয়ন সংযুক্ত</span>
 </div>
 <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold">
 বৈধ প্রার্থী
 </span>
 </div>
 </div>

 {/* MAKER CHECKER APPROVAL BAR */}
 <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
 <div>
 <strong className="text-xs font-black text-slate-900 block">Maker–checker Approval</strong>
 <span className="text-[11px] text-slate-500">যাচাইকারী: সহকারী শিক্ষক • অনুমোদনকারী: প্রিজাইডিং অফিসার</span>
 </div>

 <button
 type="button"
 onClick={() => {
 setIsScrutinySubmitted(true);
 showToast('খসড়া বৈধ প্রার্থী তালিকা অনুমোদিত হয়েছে');
 }}
 className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black"
 >
 {isScrutinySubmitted ? '✓ অনুমোদিত' : 'অনুমোদনে পাঠান →'}
 </button>
 </div>
 </div>
 )}

 {/* STEP 6: BALLOT GENERATOR */}
 {currentStep === 'ballot' && (
 <div className="space-y-5 ">
 <div className="flex items-center justify-between border-b border-slate-100 pb-4">
 <div>
 <span className="text-[10px] font-bold uppercase text-emerald-700">ধাপ ৬</span>
 <h3 className="text-lg font-black text-slate-900">প্রতীক বরাদ্দ ও ব্যালট পেপার প্রস্তুত</h3>
 <p className="text-xs text-slate-500">
 বৈধ প্রার্থীদের তালিকা থেকে ক্যাটাগরিভিত্তিক ব্যালট স্বয়ংক্রিয়ভাবে তৈরি হবে
 </p>
 </div>

 <button
 type="button"
 onClick={() => showToast('সকল ক্যাটাগরির ব্যালট পেপার জেনারেট হয়েছে')}
 className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold"
 >
 ব্যালট তৈরি করুন
 </button>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
 <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
 <span className="text-[10px] font-bold text-slate-400 uppercase">অভিভাবক প্রতিনিধি</span>
 <strong className="text-sm font-black text-slate-900 block">৮ প্রার্থী • ৪ পদ</strong>
 <span className="text-xs text-slate-500 block">ব্যালট নং ০১–০৮</span>
 <button
 type="button"
 onClick={() => showToast('অভিভাবক ব্যালট PDF প্রস্তুত')}
 className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
 >
 Preview / PDF
 </button>
 </div>

 <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
 <span className="text-[10px] font-bold text-slate-400 uppercase">শিক্ষক প্রতিনিধি</span>
 <strong className="text-sm font-black text-slate-900 block">৩ প্রার্থী • ২ পদ</strong>
 <span className="text-xs text-slate-500 block">ব্যালট নং ০১–০৩</span>
 <button
 type="button"
 onClick={() => showToast('শিক্ষক ব্যালট PDF প্রস্তুত')}
 className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
 >
 Preview / PDF
 </button>
 </div>

 <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
 <span className="text-[10px] font-bold text-slate-400 uppercase">সংরক্ষিত নারী অভিভাবক</span>
 <strong className="text-sm font-black text-slate-900 block">২ প্রার্থী • ১ পদ</strong>
 <span className="text-xs text-slate-500 block">ব্যালট নং ০১–০২</span>
 <button
 type="button"
 onClick={() => showToast('নারী কোটা ব্যালট PDF প্রস্তুত')}
 className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-700"
 >
 Preview / PDF
 </button>
 </div>
 </div>
 </div>
 )}

 {/* STEP 7: RESULTS */}
 {currentStep === 'result' && (
 <div className="space-y-5 ">
 <div className="flex items-center justify-between border-b border-slate-100 pb-4">
 <div>
 <span className="text-[10px] font-bold uppercase text-emerald-700">ধাপ ৭</span>
 <h3 className="text-lg font-black text-slate-900">নির্বাচন অনুষ্ঠান ও ফলাফল</h3>
 <p className="text-xs text-slate-500">
 ভোটের সংখ্যা এন্ট্রি করে ক্যাটাগরিভিত্তিক ফলাফল লক করুন
 </p>
 </div>

 <button
 type="button"
 onClick={() => showToast('ফলাফল বিবরণী Sheet PDF প্রস্তুত')}
 className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
 >
 ফলাফল Sheet PDF
 </button>
 </div>

 {/* TURNOUT SUMMARY */}
 <div className="grid grid-cols-4 gap-3">
 <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
 <span className="text-slate-400 block font-medium">মোট ভোটার</span>
 <strong className="text-lg font-black text-slate-900 font-mono">{toBengaliNumber(studentGuardiansCount)}</strong>
 </div>
 <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
 <span className="text-slate-400 block font-medium">ভোট প্রদান</span>
 <strong className="text-lg font-black text-emerald-800 font-mono">{toBengaliNumber(turnoutVotes)}</strong>
 </div>
 <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
 <span className="text-slate-400 block font-medium">বাতিল ভোট</span>
 <strong className="text-lg font-black text-rose-700 font-mono">{toBengaliNumber(invalidVotes)}</strong>
 </div>
 <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
 <span className="text-slate-400 block font-medium">Turnout</span>
 <strong className="text-lg font-black text-slate-900 font-mono">৮২.৪%</strong>
 </div>
 </div>

 {/* CANDIDATES VOTE COUNT */}
 <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
 <div className="p-3.5 bg-white flex items-center justify-between text-xs">
 <div>
 <strong className="text-slate-900 block font-bold">মোঃ মনির হোসেন</strong>
 <span className="text-slate-400">অভিভাবক প্রতিনিধি</span>
 </div>
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-1">
 <span className="text-slate-500">প্রাপ্ত ভোট:</span>
 <input
 type="number"
 disabled={isResultLocked}
 value={candidateVotes['c_1']}
 onChange={e => setCandidateVotes({ ...candidateVotes, 'c_1': Number(e.target.value) })}
 className="w-20 px-2 py-1 text-xs border border-slate-200 rounded-lg text-center font-bold font-mono"
 />
 </div>
 <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg">
 নির্বাচিত
 </span>
 </div>
 </div>

 <div className="p-3.5 bg-white flex items-center justify-between text-xs">
 <div>
 <strong className="text-slate-900 block font-bold">সাবিনা ইয়াসমিন</strong>
 <span className="text-slate-400">সংরক্ষিত নারী অভিভাবক প্রতিনিধি</span>
 </div>
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-1">
 <span className="text-slate-500">প্রাপ্ত ভোট:</span>
 <input
 type="number"
 disabled={isResultLocked}
 value={candidateVotes['c_2']}
 onChange={e => setCandidateVotes({ ...candidateVotes, 'c_2': Number(e.target.value) })}
 className="w-20 px-2 py-1 text-xs border border-slate-200 rounded-lg text-center font-bold font-mono"
 />
 </div>
 <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg">
 নির্বাচিত
 </span>
 </div>
 </div>
 </div>

 <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
 <div>
 <strong className="text-xs font-black text-slate-900 block">
 {isResultLocked ? 'ফলাফল লক করা হয়েছে' : 'ফলাফল এখনো লক হয়নি'}
 </strong>
 <span className="text-[11px] text-slate-500">
 {isResultLocked ? 'প্রিজাইডিং অফিসার কর্তৃক সিলমোহরকৃত চূড়ান্ত ফলাফল' : 'লক করার পর কোনো পরিবর্তন করতে হলে অডিট অনুমোদন লাগবে'}
 </span>
 </div>

 <button
 type="button"
 onClick={() => {
 setIsResultLocked(true);
 showToast('নির্বাচন ফলাফল সিলমোহর ও লক করা হয়েছে');
 }}
 className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black"
 >
 {isResultLocked ? '✓ ফলাফল Locked' : 'ফলাফল Lock করুন'}
 </button>
 </div>
 </div>
 )}

 {/* STEP 8: CHAIRMAN ELECTION */}
 {currentStep === 'chairman' && (
 <div className="space-y-5 ">
 <div className="border-b border-slate-100 pb-4">
 <span className="text-[10px] font-bold uppercase text-emerald-700">ধাপ ৮</span>
 <h3 className="text-lg font-black text-slate-900">সভাপতি নির্বাচন</h3>
 <p className="text-xs text-slate-500">
 নবনির্বাচিত সদস্যদের নিয়ে প্রিজাইডিং অফিসারের সভাপতিত্বে বিশেষ সভা ও রেজুলেশন
 </p>
 </div>

 <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
 <div>
 <label className="text-slate-600 block mb-1 font-semibold">সভার তারিখ</label>
 <input
 type="date"
 value={chairmanMeetingDate}
 onChange={e => setChairmanMeetingDate(e.target.value)}
 className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl"
 />
 </div>
 <div>
 <label className="text-slate-600 block mb-1 font-semibold">সময়</label>
 <input
 type="time"
 defaultValue="১১:০০"
 className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl"
 />
 </div>
 <div>
 <label className="text-slate-600 block mb-1 font-semibold">স্থান</label>
 <input
 type="text"
 defaultValue="বিদ্যালয়ের সভাকক্ষ"
 className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl"
 />
 </div>
 <div>
 <label className="text-slate-600 block mb-1 font-semibold">উপস্থিত সদস্য</label>
 <input
 type="number"
 defaultValue={11}
 className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl"
 />
 </div>
 </div>

 {/* CANDIDATE VOTE COMPARISON */}
 <div className="space-y-2">
 <span className="text-xs font-bold text-slate-700 block">সভাপতি পদপ্রার্থী ও প্রাপ্ত ভোট</span>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 {chairmanCandidateVotes.map((cand, idx) => (
 <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between">
 <div>
 <strong className="text-xs font-black text-slate-900 block">{cand.name}</strong>
 <span className="text-[11px] text-slate-400">সভাপতি প্রার্থী</span>
 </div>
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-slate-500">ভোট:</span>
 <span className="text-base font-black text-emerald-800 font-mono px-2 py-0.5 bg-emerald-50 rounded-lg">
 {toBengaliNumber(cand.votes)}
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>

 <div className="flex justify-end gap-2 pt-2">
 <button
 type="button"
 onClick={() => showToast('সভাপতি নির্বাচন সভা নোটিশ PDF প্রস্তুত')}
 className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
 >
 সভা নোটিশ PDF
 </button>
 <button
 type="button"
 onClick={() => {
 setIsChairmanResolutionCreated(true);
 showToast('সভাপতি নির্বাচন রেজুলেশন তৈরি ও সংরক্ষিত হয়েছে');
 }}
 className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black"
 >
 {isChairmanResolutionCreated ? '✓ রেজুলেশন তৈরি হয়েছে' : 'Resolution তৈরি করুন'}
 </button>
 </div>
 </div>
 )}

 {/* STEP 9: BOARD SUBMISSION */}
 {currentStep === 'submission' && (
 <div className="space-y-5 ">
 <div className="flex items-center justify-between border-b border-slate-100 pb-4">
 <div>
 <span className="text-[10px] font-bold uppercase text-emerald-700">ধাপ ৯</span>
 <h3 className="text-lg font-black text-slate-900">কমিটি সাবমিশন চেকলিস্ট</h3>
 <p className="text-xs text-slate-500">
 বোর্ডে পাঠানোর যাবতীয় নথিপত্র ও স্বয়ংক্রিয় ফাইল ফরোয়ার্ডিং
 </p>
 </div>

 <button
 type="button"
 onClick={() => showToast('Board submission complete file প্রস্তুত')}
 className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
 >
 Complete File PDF ⇩
 </button>
 </div>

 <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100">
 <div className="p-3.5 flex items-center justify-between text-xs">
 <div className="flex items-center gap-2.5">
 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
 <div>
 <strong className="text-slate-900 block font-bold">চূড়ান্ত ভোটার তালিকা</strong>
 <span className="text-slate-400 text-[11px]">System generated • verified</span>
 </div>
 </div>
 <span className="text-emerald-700 font-bold">প্রস্তুত</span>
 </div>

 <div className="p-3.5 flex items-center justify-between text-xs">
 <div className="flex items-center gap-2.5">
 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
 <div>
 <strong className="text-slate-900 block font-bold">নির্বাচন তফসিল ও ফলাফল বিবরণী</strong>
 <span className="text-slate-400 text-[11px]">Signed by presiding officer</span>
 </div>
 </div>
 <span className="text-emerald-700 font-bold">প্রস্তুত</span>
 </div>

 <div className="p-3.5 flex items-center justify-between text-xs">
 <div className="flex items-center gap-2.5">
 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
 <div>
 <strong className="text-slate-900 block font-bold">সভাপতি নির্বাচন রেজুলেশন</strong>
 <span className="text-slate-400 text-[11px]">Approved & signed copy</span>
 </div>
 </div>
 <span className="text-emerald-700 font-bold">প্রস্তুত</span>
 </div>

 <div className="p-3.5 flex items-center justify-between text-xs">
 <div className="flex items-center gap-2.5">
 {submissionChecklist.presidingOfficerCertUploaded ? (
 <CheckCircle2 className="w-4 h-4 text-emerald-600" />
 ) : (
 <AlertCircle className="w-4 h-4 text-amber-600" />
 )}
 <div>
 <strong className="text-slate-900 block font-bold">প্রিজাইডিং অফিসারের প্রত্যয়নপত্র</strong>
 <span className="text-slate-400 text-[11px]">
 {submissionChecklist.presidingOfficerCertUploaded ? 'Signed certificate uploaded' : 'Signed attachment upload প্রয়োজন'}
 </span>
 </div>
 </div>
 <button
 type="button"
 onClick={() => {
 setSubmissionChecklist({ ...submissionChecklist, presidingOfficerCertUploaded: true });
 showToast('প্রিজাইডিং অফিসারের প্রত্যয়নপত্র আপলোড সম্পন্ন');
 }}
 className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold"
 >
 {submissionChecklist.presidingOfficerCertUploaded ? '✓ Uploaded' : 'Upload'}
 </button>
 </div>
 </div>

 <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
 <div>
 <strong className="text-xs font-black text-slate-900 block">৪ / ৪টি ডকুমেন্ট প্রস্তুত</strong>
 <span className="text-[11px] text-slate-500">বোর্ডে সাবমিশনের জন্য ফাইল অনুমোদিত</span>
 </div>

 <button
 type="button"
 disabled={!submissionChecklist.presidingOfficerCertUploaded}
 onClick={() => showToast('ফাইল শিক্ষা বোর্ডে সফলভাবে সাবমিট করা হয়েছে')}
 className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
 submissionChecklist.presidingOfficerCertUploaded
 ? 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-md'
 : 'bg-slate-200 text-slate-400 cursor-not-allowed'
 }`}
 >
 বোর্ডে সাবমিট করুন →
 </button>
 </div>
 </div>
 )}

 {/* STEP 10: BOARD APPROVAL */}
 {currentStep === 'approval' && (
 <div className="space-y-5 ">
 <div className="border-b border-slate-100 pb-4">
 <span className="text-[10px] font-bold uppercase text-emerald-700">ধাপ ১০</span>
 <h3 className="text-lg font-black text-slate-900">বোর্ড অনুমোদন প্রজ্ঞাপন</h3>
 <p className="text-xs text-slate-500">
 শিক্ষা বোর্ডের অফিসিয়াল অনুমোদন চিঠি ও স্মারক নম্বর সংরক্ষণ
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
 <div>
 <label className="text-slate-600 block mb-1 font-semibold">বোর্ডে সাবমিশনের তারিখ</label>
 <input
 type="date"
 value={boardSubmissionDate}
 onChange={e => setBoardSubmissionDate(e.target.value)}
 className="w-full px-3 py-2 border border-slate-200 rounded-xl"
 />
 </div>
 <div>
 <label className="text-slate-600 block mb-1 font-semibold">Tracking / স্মারক নম্বর</label>
 <input
 type="text"
 value={boardTrackingNo}
 onChange={e => setBoardTrackingNo(e.target.value)}
 className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
 />
 </div>
 <div>
 <label className="text-slate-600 block mb-1 font-semibold">অনুমোদনের তারিখ</label>
 <input
 type="date"
 value={boardApprovalDate}
 onChange={e => setBoardApprovalDate(e.target.value)}
 className="w-full px-3 py-2 border border-slate-200 rounded-xl"
 />
 </div>
 <div>
 <label className="text-slate-600 block mb-1 font-semibold">অনুমোদন স্মারক নম্বর</label>
 <input
 type="text"
 value={boardApprovalMemoNo}
 onChange={e => setBoardApprovalMemoNo(e.target.value)}
 className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
 />
 </div>
 </div>

 {/* UPLOAD BOX */}
 <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2 bg-slate-50/50">
 <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
 <strong className="text-xs font-black text-slate-800 block">বোর্ডের মূল অনুমোদনপত্র আপলোড</strong>
 <p className="text-[11px] text-slate-400">PDF / JPG / PNG • সিলমোহর ও স্বাক্ষরিত কপি</p>
 <button
 type="button"
 onClick={() => {
 setBoardAttachmentName('BISE_Approval_Letter_2026.pdf');
 showToast('বোর্ডের অনুমোদনপত্র আপলোড সম্পন্ন');
 }}
 className="px-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm"
 >
 {boardAttachmentName ? `✓ ${boardAttachmentName}` : 'ফাইল নির্বাচন করুন'}
 </button>
 </div>

 <div className="flex items-center justify-between pt-1">
 <span className="text-xs text-slate-500 font-medium">
 প্রথম সভা না হওয়া পর্যন্ত কমিটি “Pending activation” থাকবে
 </span>
 <button
 type="button"
 onClick={() => showToast('বোর্ড অনুমোদনের তথ্য সংরক্ষিত হয়েছে')}
 className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black"
 >
 অনুমোদন সংরক্ষণ
 </button>
 </div>
 </div>
 )}

 {/* STEP 11: FIRST MEETING & ACTIVATION */}
 {currentStep === 'firstMeeting' && (
 <div className="space-y-5 ">
 <div className="border-b border-slate-100 pb-4">
 <span className="text-[10px] font-bold uppercase text-emerald-700">ধাপ ১১</span>
 <h3 className="text-lg font-black text-slate-900">প্রথম সভা, কো-অপ নির্বাচন ও সক্রিয়করণ</h3>
 <p className="text-xs text-slate-500">
 প্রথম সভার তারিখ থেকেই কমিটির মেয়াদ গণনা ও আনুষ্ঠানিক সক্রিয়করণ হবে
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
 <div>
 <label className="text-slate-600 block mb-1 font-semibold">প্রথম সভার তারিখ</label>
 <input
 type="date"
 value={firstMeetingDate}
 onChange={e => setFirstMeetingDate(e.target.value)}
 className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold text-emerald-900 bg-emerald-50/40"
 />
 </div>
 <div>
 <label className="text-slate-600 block mb-1 font-semibold">সভার সময়</label>
 <input
 type="time"
 value={firstMeetingTime}
 onChange={e => setFirstMeetingTime(e.target.value)}
 className="w-full px-3 py-2 border border-slate-200 rounded-xl"
 />
 </div>
 <div>
 <label className="text-slate-600 block mb-1 font-semibold">উপস্থিত সদস্য (কোরাম)</label>
 <input
 type="number"
 value={firstMeetingAttendees}
 onChange={e => setFirstMeetingAttendees(Number(e.target.value))}
 className="w-full px-3 py-2 border border-slate-200 rounded-xl"
 />
 </div>
 <div>
 <label className="text-slate-600 block mb-1 font-semibold">কো-অপ (বিদ্যোৎসাহী) সদস্য</label>
 <input
 type="text"
 value={coOptedMemberName}
 onChange={e => setCoOptedMemberName(e.target.value)}
 className="w-full px-3 py-2 border border-slate-200 rounded-xl"
 />
 </div>
 </div>

 {/* ACTIVATION ACTION BOX */}
 <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex items-start gap-3">
 <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 mt-0.5">
 <CheckCircle2 className="w-6 h-6" />
 </div>
 <div className="space-y-0.5">
 <strong className="text-sm font-black text-emerald-950 block">
 চূড়ান্ত ধাপ: নতুন কমিটি কার্যকর ও সক্রিয়করণ
 </strong>
 <p className="text-xs text-emerald-800 leading-relaxed">
 কমিটি Activate করলে এটি বর্তমান কার্যকরী পরিষদ হিসেবে সেট হবে এবং পূর্ববর্তী কমিটি স্বয়ংক্রিয়ভাবে সংরক্ষিত আর্কাইভে স্থানান্তরিত হবে।
 </p>
 </div>
 </div>

 <button
 type="button"
 onClick={handleActivateNewCommittee}
 className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-900/30 transition-all cursor-pointer shrink-0 self-start sm:self-center flex items-center gap-2"
 >
 <Sparkles className="w-4 h-4" />
 <span>কমিটি Activate করুন</span>
 </button>
 </div>
 </div>
 )}
 </main>
 </div>
 </div>
 )}
 </div>
 );
};
