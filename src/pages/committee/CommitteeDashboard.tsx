import React, { useMemo, useState } from 'react';
import { 
  Users, UserCheck, UserX, Calendar, Award, ShieldCheck, 
  ShieldAlert, Clock, Sparkles, ArrowRight, GraduationCap, 
  Building, Phone, Mail, CheckCircle2, AlertTriangle, 
  FileText, Printer, Edit3, UserPlus, Eye, User, BookOpen,
  Share2, Image as ImageIcon, Search, Trash2, Filter, Plus
} from 'lucide-react';
import { ManagingCommitteeInfo, ManagingCommitteeMember, Institution } from '../../types';
import { toBengaliNumber } from '../../utils/bengaliUtils';
import { useAppStore } from '../../store/useAppStore';

interface CommitteeDashboardProps {
  committee: ManagingCommitteeInfo;
  members: ManagingCommitteeMember[];
  institution?: Institution | null;
  onOpenInfoModal: () => void;
  onOpenAddMember: () => void;
  onEditMember: (member: ManagingCommitteeMember) => void;
  onDeleteMember?: (memberId: string) => void;
  onNavigateTab: (tab: 'overview' | 'meetings' | 'formation' | 'archive' | 'reports') => void;
  onOpenPolicyGuide?: (topicKey: string) => void;
  onOpenSocialCard?: (member: ManagingCommitteeMember) => void;
  onOpenQuickAction?: (action: 'notice' | 'session' | 'register' | 'resolution') => void;
  onPrintRoster?: () => void;
  selectedTerm?: string;
  onSelectTerm?: (term: string) => void;
  termsList?: string[];
  committeeTypeName?: string;
}

export const CommitteeDashboard: React.FC<CommitteeDashboardProps> = ({
  committee,
  members = [],
  institution,
  onOpenInfoModal,
  onOpenAddMember,
  onEditMember,
  onDeleteMember,
  onNavigateTab,
  onOpenPolicyGuide,
  onOpenSocialCard,
  onOpenQuickAction,
  onPrintRoster,
  selectedTerm,
  onSelectTerm,
  termsList = [],
  committeeTypeName = 'ম্যানেজিং কমিটি'
}) => {
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState('all');

  const { staff = [] } = useAppStore();

  // Relational Fallback for Member Secretary: Head Teacher / Principal from Staff
  const headTeacher = useMemo(() => {
    return staff.find(s => 
      s.designationId === 'des_head_teacher' || 
      s.designation?.toLowerCase().includes('head teacher') ||
      s.designation?.toLowerCase().includes('principal') ||
      s.designationBn?.includes('প্রধান শিক্ষক') ||
      s.designationBn?.includes('অধ্যক্ষ')
    );
  }, [staff]);

  // Determine if real committee data has been entered
  const hasCommitteeData = Boolean(
    (committee && (
      committee.hasCommittee ||
      committee.title || 
      committee.titleBn || 
      committee.name || 
      committee.nameBn || 
      committee.startDate || 
      committee.resolutionNo ||
      committee.approvalResolutionNo
    )) ||
    (members && members.length > 0)
  );

  // If no committee data has been added yet, show clear empty state
  if (!hasCommitteeData) {
    return (
      <div id="committee-dashboard-root" className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">কমিটি ব্যবস্থাপনা</span>
              <span className="text-xs text-slate-300">›</span>
              <span className="text-xs font-bold text-emerald-800">ওভারভিউ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              বর্তমান কার্যকরী পরিষদ ({committeeTypeName})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              শিক্ষা বোর্ড অনুমোদিত পরিচালনা পরিষদ ও প্রাতিষ্ঠানিক মনিটরিং ড্যাশবোর্ড
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {onOpenPolicyGuide && (
              <button
                type="button"
                onClick={() => onOpenPolicyGuide('overview')}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm group"
                title="কমিটি পরিচালনা সংক্রান্ত সরকারি ও বোর্ড নীতিমালা পড়ুন"
              >
                <BookOpen className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>পরিচালনা বিধিমালা</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenInfoModal}
              className="px-4 py-2 text-xs font-black text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-md shadow-emerald-900/20 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>কমিটি তথ্য যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Empty State Card */}
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-5 shadow-xs">
          <div className="w-20 h-20 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-10 h-10" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl font-black text-slate-900">কমিটির তথ্য এখনো যোগ হয়নি</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              আপনার প্রতিষ্ঠানে এখনো কোনো সক্রিয় কার্যকরী পরিষদ বা ম্যানেজিং কমিটির তথ্য এন্ট্রি করা হয়নি। কমিটির তথ্য ও সদস্য যুক্ত করলেই এখানে ডায়নামিক ড্যাশবোর্ড ও রিপোর্ট প্রদর্শিত হবে।
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
            <button
              type="button"
              onClick={onOpenInfoModal}
              className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black shadow-md shadow-emerald-900/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>কমিটির তথ্য ও সদস্য যোগ করুন</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateTab('formation')}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>কমিটি গঠন পাইপলাইন</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Computed Member Statistics
  const totalMembers = members.length;
  const activeMembersList = members.filter(m => !m.isResigned && m.status !== 'resigned');
  const resignedMembersList = members.filter(m => m.isResigned || m.status === 'resigned');

  const activeCount = activeMembersList.length;
  const resignedCount = resignedMembersList.length;

  const maleMembers = activeMembersList.filter(m => m.gender === 'Male');
  const femaleMembers = activeMembersList.filter(m => m.gender === 'Female');
  const maleCount = maleMembers.length;
  const femaleCount = femaleMembers.length;

  // Key officers
  const president = members.find(m => m.role === 'president');
  const secretary = members.find(m => m.role === 'member_secretary');

  // Tenure timeline calculations (Strictly dynamic - NO hardcoded fallbacks!)
  const tenureStats = (() => {
    const startStr = committee?.startDate || '';
    const endStr = committee?.endDate || '';
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const now = new Date().getTime();

    if (!committee?.startDate || !committee?.endDate || isNaN(start) || isNaN(end)) {
      return {
        totalDays: 0,
        elapsedDays: 0,
        remainingDays: 0,
        percentage: 0,
        isExpired: false,
        isUpcomingElection: false
      };
    }

    const totalDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    const elapsedDays = Math.max(0, Math.round((now - start) / (1000 * 60 * 60 * 24)));
    const remainingDays = Math.max(0, Math.round((end - now) / (1000 * 60 * 60 * 24)));
    const percentage = Math.min(100, Math.max(0, Math.round((elapsedDays / totalDays) * 100)));
    const isExpired = now > end || committee.status === 'expired';
    const isUpcomingElection = remainingDays <= 120 && !isExpired;

    return {
      totalDays,
      elapsedDays,
      remainingDays,
      percentage,
      isExpired,
      isUpcomingElection
    };
  })();

  // Filtered members list for the embedded directory table
  const filteredMembers = members.filter(m => {
    if (memberRoleFilter !== 'all') {
      if (memberRoleFilter === 'president' && m.role !== 'president') return false;
      if (memberRoleFilter === 'secretary' && m.role !== 'member_secretary') return false;
      if (memberRoleFilter === 'guardian' && !m.role.includes('guardian')) return false;
      if (memberRoleFilter === 'teacher' && !m.role.includes('teacher')) return false;
    }
    if (memberSearchQuery) {
      const q = memberSearchQuery.toLowerCase();
      return (
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.nameBn && m.nameBn.toLowerCase().includes(q)) ||
        (m.roleBn && m.roleBn.toLowerCase().includes(q)) ||
        (m.mobile && m.mobile.includes(q)) ||
        (m.profession && m.profession.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Decisions metrics from committee
  const decisions = committee.decisions || [];
  const implementedDecisions = decisions.filter(d => d.status === 'implemented').length;
  const inProgressDecisions = decisions.filter(d => d.status === 'in_progress').length;
  const delayedDecisions = decisions.filter(d => d.status === 'delayed').length;

  return (
    <div id="committee-dashboard-root" className="space-y-6 sm:space-y-7">
      {/* 1. TOP HEADER WITH BREADCRUMB & POLICY GUIDELINE ICON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">কমিটি ব্যবস্থাপনা</span>
            <span className="text-xs text-slate-300">›</span>
            <span className="text-xs font-bold text-emerald-800">ওভারভিউ</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            বর্তমান কার্যকরী পরিষদ ({committee.titleBn || committee.title || committeeTypeName})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            শিক্ষা বোর্ড অনুমোদিত বৈধ পরিচালনা পরিষদ ও প্রাতিষ্ঠানিক মনিটরিং ড্যাশবোর্ড
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenPolicyGuide && (
            <button
              type="button"
              onClick={() => onOpenPolicyGuide('overview')}
              className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm group"
              title="কমিটি পরিচালনা সংক্রান্ত সরকারি ও বোর্ড নীতিমালা পড়ুন"
            >
              <BookOpen className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>পরিচালনা বিধিমালা</span>
            </button>
          )}

          <button
            type="button"
            onClick={onPrintRoster || (() => onNavigateTab('reports'))}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            <span>কমিটি তালিকা প্রিন্ট</span>
          </button>

          <button
            type="button"
            onClick={onOpenInfoModal}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>কমিটি তথ্য সম্পাদন</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddMember}
            className="px-4 py-2 text-xs font-black text-white bg-emerald-800 hover:bg-emerald-900 rounded-xl transition-all shadow-md shadow-emerald-900/20 cursor-pointer flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>সদস্য যুক্ত করুন</span>
          </button>
        </div>
      </div>

      {/* 2. HERO TENURE BANNER WITH COUNTDOWN & ELECTION ALERT */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl shadow-emerald-950/15 border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-12 w-64 h-64 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-700/80 text-emerald-100 border border-emerald-500/30">
                {committee.titleBn || committee.title || committeeTypeName} {committee.year ? `• ${committee.year}` : ''}
              </span>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1.5 ${
                tenureStats.isExpired 
                  ? 'bg-rose-500/80 text-white' 
                  : 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${tenureStats.isExpired ? 'bg-white' : 'bg-emerald-400 animate-pulse'}`} />
                <span>{tenureStats.isExpired ? 'মেয়াদ উত্তীর্ণ' : 'সক্রিয় পরিচালনা পরিষদ'}</span>
              </span>

              {committee.approvalResolutionNo && (
                <span className="text-xs text-emerald-200/80 font-mono">
                  স্মারক: {committee.approvalResolutionNo}
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              মেয়াদকাল: {committee.startDate ? toBengaliNumber(committee.startDate) : '—'} থেকে {committee.endDate ? toBengaliNumber(committee.endDate) : '—'}
            </h3>

            <div className="flex items-center gap-4 text-xs text-emerald-100/80 flex-wrap">
              <span>মোট অনুমোদিত সদস্য: <strong>{toBengaliNumber(totalMembers)} জন</strong></span>
              <span>•</span>
              <span>সক্রিয় সদস্য: <strong className="text-white">{toBengaliNumber(activeCount)} জন</strong> ({toBengaliNumber(maleCount)} পুরুষ / {toBengaliNumber(femaleCount)} নারী)</span>
              {tenureStats.totalDays > 0 && (
                <>
                  <span>•</span>
                  <span className="font-mono">অবশিষ্ট মেয়াদ: <strong className="text-emerald-300 font-black">{toBengaliNumber(tenureStats.remainingDays)} দিন</strong></span>
                </>
              )}
            </div>

            {/* PROGRESS BAR */}
            {tenureStats.totalDays > 0 && (
              <div className="pt-2 max-w-lg space-y-1">
                <div className="flex items-center justify-between text-[11px] text-emerald-200/90 font-medium">
                  <span>মেয়াদ অতিবাহিত: {toBengaliNumber(tenureStats.percentage)}%</span>
                  <span className="font-mono">{toBengaliNumber(tenureStats.elapsedDays)} / {toBengaliNumber(tenureStats.totalDays)} দিন</span>
                </div>
                <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-emerald-400 rounded-full transition-all" 
                    style={{ width: `${tenureStats.percentage}%` }} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* ASIDE ALERT / ACTION BOX */}
          <div className="bg-white/10 rounded-2xl p-4 sm:p-5 border border-white/15 max-w-sm space-y-3 shrink-0">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs font-bold text-white block">নির্বাচন ও নতুন কমিটি প্রস্তুতি</strong>
                <p className="text-[11px] text-emerald-100/80 leading-relaxed mt-0.5">
                  বোর্ড নীতিমালা অনুযায়ী মেয়াদ সমাপ্তির অন্তত ৯০ দিন পূর্বে নতুন কমিটি গঠনের আনুষ্ঠানিক কার্যক্রম শুরু করতে হবে।
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('formation')}
              className="w-full py-2 px-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
            >
              <span>কমিটি গঠন পাইপলাইনে যান</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. KEY LEADERS ROW (PRESIDENT & MEMBER SECRETARY) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* PRESIDENT CARD */}
        {president ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200/80 rounded-full text-xs font-black">
                  পরিচালনা পরিষদের সভাপতি
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {president.mobile || '-'}
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 border-2 border-amber-300/80 flex items-center justify-center font-black text-xl shrink-0 overflow-hidden shadow-sm">
                  {president.photo ? (
                    <img src={president.photo} alt={president.nameBn || president.name} className="w-full h-full object-cover" />
                  ) : (
                    (president.nameBn || president.name || 'সভাপতি').slice(0, 2)
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {president.nameBn || president.name}
                  </h4>
                  <p className="text-xs font-bold text-emerald-800">
                    {president.roleTitleBn || 'সভাপতি'}
                  </p>
                  <p className="text-xs text-slate-500">
                    পেশা: {president.profession || '-'} • যোগ্যতা: {president.educationalQualification || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                শিক্ষা বোর্ড কর্তৃক অনুমোদিত বৈধ সভাপতি
              </span>

              <div className="flex items-center gap-2">
                {onOpenSocialCard && (
                  <button
                    type="button"
                    onClick={() => onOpenSocialCard(president)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="সোশ্যাল মিডিয়া শেয়ারযোগ্য ১০৮০×১০৮০ এইচডি কার্ড তৈরি করুন"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>স্মার্ট কার্ড</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onEditMember(president)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">পরিচালনা পরিষদের সভাপতি</h4>
              <p className="text-xs text-slate-400 mt-0.5">কমিটিতে এখনো কোনো সভাপতি যুক্ত করা হয়নি</p>
            </div>
            <button
              type="button"
              onClick={onOpenAddMember}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              + সভাপতি যোগ করুন
            </button>
          </div>
        )}

        {/* MEMBER SECRETARY (HEADMASTER) CARD */}
        {secretary ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200/80 rounded-full text-xs font-black">
                  সদস্য সচিব (প্রধান শিক্ষক)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {secretary.mobile || '-'}
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-900 border-2 border-emerald-300/80 flex items-center justify-center font-black text-xl shrink-0 overflow-hidden shadow-sm">
                  {secretary.photo ? (
                    <img src={secretary.photo} alt={secretary.nameBn || secretary.name} className="w-full h-full object-cover" />
                  ) : (
                    (secretary.nameBn || secretary.name || 'সচিব').slice(0, 2)
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {secretary.nameBn || secretary.name}
                  </h4>
                  <p className="text-xs font-bold text-emerald-800">
                    {secretary.roleTitleBn || 'সদস্য সচিব'}
                  </p>
                  <p className="text-xs text-slate-500">
                    এমপিও ইনডেক্স: {secretary.indexNumber || '-'} • যোগ্যতা: {secretary.educationalQualification || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                সচিবীয় দায়িত্ব ও যৌথ ব্যাংক হিসাব পরিচালনা
              </span>

              <div className="flex items-center gap-2">
                {onOpenSocialCard && (
                  <button
                    type="button"
                    onClick={() => onOpenSocialCard(secretary)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="সোশ্যাল মিডিয়া শেয়ারযোগ্য ১০৮০×১০৮০ এইচডি কার্ড তৈরি করুন"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>স্মার্ট কার্ড</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onEditMember(secretary)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ) : headTeacher ? (
          /* Relational Fallback from Institution Staff */
          <div className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-sm flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-200/80 rounded-full text-xs font-black">
                  পদাধিকারবলে সদস্য সচিব (প্রতিষ্ঠান প্রধান)
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  স্টাফ তালিকা থেকে সংযুক্ত
                </span>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-900 border-2 border-emerald-300/80 flex items-center justify-center font-black text-xl shrink-0 overflow-hidden shadow-sm">
                  {headTeacher.photo ? (
                    <img src={headTeacher.photo} alt={headTeacher.nameBn || headTeacher.name} className="w-full h-full object-cover" />
                  ) : (
                    (headTeacher.nameBn || headTeacher.name || 'প্রধান').slice(0, 2)
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {headTeacher.nameBn || headTeacher.name}
                  </h4>
                  <p className="text-xs font-bold text-emerald-800">
                    {headTeacher.designationBn || headTeacher.designation || 'প্রধান শিক্ষক'}
                  </p>
                  <p className="text-xs text-slate-500">
                    ইনডেক্স: {(headTeacher as any).indexNumber || '-'} • মোবাইল: {headTeacher.mobile || '-'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-medium">
                আইনত প্রতিষ্ঠান প্রধান কমিটির পদাধিকারবলে সদস্য সচিব
              </span>

              <button
                type="button"
                onClick={onOpenAddMember}
                className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all cursor-pointer"
              >
                + সদস্য সচিব হিসেবে নিবন্ধন
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">সদস্য সচিব (প্রধান শিক্ষক)</h4>
              <p className="text-xs text-slate-400 mt-0.5">কমিটিতে এখনো কোনো সদস্য সচিব যুক্ত করা হয়নি</p>
            </div>
            <button
              type="button"
              onClick={onOpenAddMember}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              + সদস্য সচিব যোগ করুন
            </button>
          </div>
        )}
      </div>

      {/* 4. QUICK ACTIONS & RECENT DECISIONS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* QUICK ACTIONS FOR MEETINGS & RESOLUTIONS */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-black text-slate-900">
              কমিটি সভার দ্রুত অ্যাকশন (Quick Actions)
            </h3>
            <p className="text-xs text-slate-500">
              নোটিশ জারি, উপস্থিতি রেজিস্টার ও রেজুলেশন মুদ্রণ
            </p>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => onOpenQuickAction?.('notice')}
              className="w-full p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl text-left transition-all flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-emerald-700 flex items-center justify-center border border-slate-200 group-hover:border-emerald-300 shadow-sm">
                  <FileText className="w-4 h-4" />
                </div>
                <span>সভার নোটিশ তৈরি ও জারি</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
            </button>

            <button
              type="button"
              onClick={() => onOpenQuickAction?.('session')}
              className="w-full p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl text-left transition-all flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-emerald-700 flex items-center justify-center border border-slate-200 group-hover:border-emerald-300 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>সভার অধিবেশন এন্ট্রি ও কার্যবিবরণী</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
            </button>

            <button
              type="button"
              onClick={() => onOpenQuickAction?.('resolution')}
              className="w-full p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl text-left transition-all flex items-center justify-between text-xs font-bold text-slate-800 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-emerald-700 flex items-center justify-center border border-slate-200 group-hover:border-emerald-300 shadow-sm">
                  <Printer className="w-4 h-4" />
                </div>
                <span>রেজুলেশন প্রিন্ট ও রেজিস্টার</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">মোট সভা: {toBengaliNumber(committee.meetings?.length || 0)}টি</span>
            <button
              type="button"
              onClick={() => onNavigateTab('meetings')}
              className="text-emerald-800 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>সকল সভা দেখুন</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* RECENT DECISIONS IMPLEMENTATION PROGRESS */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900">
                গৃহীত সিদ্ধান্তের বাস্তবায়ন মনিটরিং
              </h3>
              <p className="text-xs text-slate-500">
                কমিটি সভায় অনুমোদিত প্রস্তাব ও সিদ্ধান্তের অগ্রগতি
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-lg font-bold">
                বাস্তবায়িত: {toBengaliNumber(implementedDecisions)}টি
              </span>
              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-lg font-bold">
                চলমান: {toBengaliNumber(inProgressDecisions)}টি
              </span>
              <span className="px-2 py-0.5 bg-rose-50 text-rose-800 rounded-lg font-bold">
                বিলম্বিত: {toBengaliNumber(delayedDecisions)}টি
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {decisions.length > 0 ? (
              decisions.slice(0, 3).map((dec) => (
                <div key={dec.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <strong className="text-slate-900 font-black truncate">{dec.title}</strong>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      dec.status === 'implemented' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {dec.status === 'implemented' ? 'বাস্তবায়িত' : 'চলমান'} ({toBengaliNumber(dec.progressPercent)}%)
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${dec.status === 'implemented' ? 'bg-emerald-600' : 'bg-amber-500'}`}
                      style={{ width: `${dec.progressPercent}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-600">এখনো কোনো সভার সিদ্ধান্ত যুক্ত করা হয়নি</p>
                <p className="text-[11px] text-slate-400 mt-0.5">'সভা ও সিদ্ধান্ত' ট্যাব থেকে নতুন সভার রেজুলেশন যুক্ত করুন</p>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => onNavigateTab('meetings')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
            >
              <span>পূর্ণাঙ্গ সিদ্ধান্ত তালিকা ও আপডেট ট্র্যাকার</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. FULL EMBEDDED MEMBER DIRECTORY TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-5">
        
        {/* TABLE CONTROLS (SEARCH & FILTER) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              কার্যনির্বাহী সদস্যবৃন্দের পূর্ণাঙ্গ তালিকা
            </h3>
            <p className="text-xs text-slate-500">
              অভিভাবক প্রতিনিধি, শিক্ষক প্রতিনিধি ও সংরক্ষিত নারী কোটার সদস্য তালিকা
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* SEARCH */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="সদস্য খুঁজুন..."
                value={memberSearchQuery}
                onChange={e => setMemberSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none w-44"
              />
            </div>

            {/* FILTER */}
            <select
              value={memberRoleFilter}
              onChange={e => setMemberRoleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none font-semibold text-slate-700"
            >
              <option value="all">সকল পদবী</option>
              <option value="president">সভাপতি</option>
              <option value="secretary">সদস্য সচিব</option>
              <option value="guardian">অভিভাবক প্রতিনিধি</option>
              <option value="teacher">শিক্ষক প্রতিনিধি</option>
            </select>
          </div>
        </div>

        {/* RESPONSIVE TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200/70">
              <tr>
                <th className="py-3 px-3">সদস্যের নাম ও পরিচয়</th>
                <th className="py-3 px-3">পদবী ও ক্যাটাগরি</th>
                <th className="py-3 px-3">মোবাইল</th>
                <th className="py-3 px-3">শিক্ষাগত যোগ্যতা</th>
                <th className="py-3 px-3">স্ট্যাটাস</th>
                <th className="py-3 px-3 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {member.photo ? (
                            <img src={member.photo} alt={member.nameBn} className="w-full h-full object-cover" />
                          ) : (
                            (member.nameBn || member.name).slice(0, 2)
                          )}
                        </div>
                        <div>
                          <strong className="text-slate-900 block font-bold text-xs">{member.nameBn || member.name}</strong>
                          <span className="text-[11px] text-slate-400">{member.profession || '-'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                        {member.roleTitleBn || member.roleBn || member.role}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px]">
                      {member.mobile || '—'}
                    </td>

                    <td className="py-3 px-3 text-slate-700">
                      {member.educationalQualification || '-'}
                    </td>

                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        member.isResigned ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {member.isResigned ? 'পদত্যাগী' : 'সক্রিয়'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {onOpenSocialCard && (
                          <button
                            type="button"
                            onClick={() => onOpenSocialCard(member)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-all cursor-pointer"
                            title="১০৮০×১০৮০ এইচডি সোশ্যাল কার্ড তৈরি করুন"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onEditMember(member)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                          title="সম্পাদনা করুন"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {onDeleteMember && (
                          <button
                            type="button"
                            onClick={() => onDeleteMember(member.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-600">কোনো কমিটির সদস্য পাওয়া যায়নি</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">নতুন সদস্য যুক্ত করতে উপরের 'সদস্য যুক্ত করুন' বাটনে ক্লিক করুন</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
