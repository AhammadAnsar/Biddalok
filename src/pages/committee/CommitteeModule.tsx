import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useMasterData } from '../../hooks/useMasterData';
import { ManagingCommitteeInfo, ManagingCommitteeMember, CommitteeMeeting } from '../../types';
import { 
 Users, UserPlus, Calendar, Award, ShieldCheck, 
 Phone, Mail, MapPin, Printer, Download, Edit3, 
 Trash2, Plus, CheckCircle2, Clock, FileText, 
 Search, Filter, AlertTriangle, Sparkles, ChevronRight, 
 Check, Eye, User, FileCheck, Building, ShieldAlert, 
 GraduationCap, BookOpen, History, Share2
} from 'lucide-react';
import { toast } from '../../utils/toast';
import { toBengaliNumber } from '../../utils/bengaliUtils';
import { CommitteeInfoModal } from './CommitteeInfoModal';
import { CommitteeMemberModal } from './CommitteeMemberModal';
import { CommitteeElectionWorkflow } from './CommitteeElectionWorkflow';
import { CommitteePrintSheet } from './CommitteePrintSheet';
import { CommitteeDashboard } from './CommitteeDashboard';
import { CommitteeMeetingsManager } from './CommitteeMeetingsManager';
import { CommitteeArchiveView } from './CommitteeArchiveView';
import { CommitteePolicyGuideModal } from './CommitteePolicyGuideModal';
import { CommitteeMemberSocialCardModal } from './CommitteeMemberSocialCardModal';
import { CommitteeQuickActionModal } from './CommitteeQuickActionModal';
import { CommitteeDirectEntryModal } from './modals/CommitteeDirectEntryModal';

export type CommitteeTab = 'overview' | 'meetings' | 'formation' | 'archive';

export const CommitteeModule: React.FC = () => {
 const { 
 managingCommittee, 
 managingCommitteesList,
 updateManagingCommittee, 
 saveManagingCommitteeRecord,
 addCommitteeMember, 
 updateCommitteeMember, 
 deleteCommitteeMember,
 institution 
 } = useAppStore();

 const { categoryMap } = useMasterData();
 const committeeTypes = categoryMap.committeeType || [];

 // Active sub-tab state matching the prototype
 const [activeTab, setActiveTab] = useState<CommitteeTab>('overview');

 // Print sheet sub-view state
 const [isPrintSheetOpen, setIsPrintSheetOpen] = useState(false);

 // Modals state
 const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
 const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
 const [editingMember, setEditingMember] = useState<ManagingCommitteeMember | null>(null);

 // Policy Guide Modal
 const [isPolicyGuideOpen, setIsPolicyGuideOpen] = useState(false);
 const [policyGuideTopic, setPolicyGuideTopic] = useState('overview');

 // Social Profile Card Modal
 const [isSocialCardOpen, setIsSocialCardOpen] = useState(false);
 const [socialCardMember, setSocialCardMember] = useState<ManagingCommitteeMember | null>(null);

 // Quick Action Modal
 const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
 const [quickActionType, setQuickActionType] = useState<'notice' | 'session' | 'register' | 'resolution'>('notice');

 // Direct Entry Modal
 const [isDirectEntryModalOpen, setIsDirectEntryModalOpen] = useState(false);
 const [directEntryInitialData, setDirectEntryInitialData] = useState<ManagingCommitteeInfo | null>(null);

 // Selected Committee Term / Year
 const currentYear = managingCommittee?.year || '';
 const [selectedTerm, setSelectedTerm] = useState<string>(currentYear);

 // Terms list from historical records + current
 const termsList = useMemo(() => {
 const set = new Set<string>();
 if (managingCommittee?.year) set.add(managingCommittee.year);
 if (managingCommitteesList) {
 managingCommitteesList.forEach(c => {
 if (c.year) set.add(c.year);
 });
 }
 
 
 
 return Array.from(set).sort().reverse();
 }, [managingCommittee, managingCommitteesList]);

 // Active committee record calculation
 const committee: ManagingCommitteeInfo = useMemo(() => {
 if (managingCommitteesList && managingCommitteesList.length > 0) {
 const matched = managingCommitteesList.find(c => c.year === selectedTerm);
 if (matched) return matched;
 }
 return managingCommittee || {
      id: '',
      name: '',
      nameBn: '',
      title: '',
      titleBn: '',
      type: 'regular',
      year: '',
      hasCommittee: false,
      approvalDate: '',
      approvalResolutionNo: '',
      resolutionNo: '',
      startDate: '',
      endDate: '',
      status: 'inactive',
      members: []
    };
 }, [selectedTerm, managingCommitteesList, managingCommittee]);

 const members = committee.members || [];

 // Resolve committee type name
 const committeeTypeName = useMemo(() => {
 if (committee.committeeTypeId) {
 const ct = committeeTypes.find(t => t.id === committee.committeeTypeId);
 if (ct) return ct.nameBn;
 }
 if (committee.type === 'adhoc') return 'এডহক কমিটি';
 if (committee.type === 'governing') return 'গভর্নিং বডি';
 return 'নিয়মিত ব্যবস্থাপনা কমিটি (SMC)';
 }, [committee.committeeTypeId, committee.type, committeeTypes]);

 // Handlers for Member management
 const handleOpenAddMember = () => {
 setEditingMember(null);
 setIsMemberModalOpen(true);
 };

 const handleOpenEditMember = (member: ManagingCommitteeMember) => {
 setEditingMember(member);
 setIsMemberModalOpen(true);
 };

 const handleSaveMember = (member: ManagingCommitteeMember) => {
 if (editingMember) {
 updateCommitteeMember(member.id, member);
 toast.success('সদস্যের তথ্য সফলভাবে আপডেট হয়েছে');
 } else {
 addCommitteeMember(member);
 toast.success('নতুন সদস্য সফলভাবে যুক্ত হয়েছে');
 }
 setIsMemberModalOpen(false);
 };

 const handleDeleteMember = (memberId: string) => {
 const member = members.find(m => m.id === memberId);
 const memberName = member ? (member.nameBn || member.name) : 'এই';
 if (confirm(`আপনি কি নিশ্চিতভাবে "${memberName}" সদস্যকে কমিটি থেকে অপসারণ করতে চান?`)) {
 deleteCommitteeMember(memberId);
 toast.success('সদস্যকে সফলভাবে অপসারণ করা হয়েছে');
 }
 };

 const handleSaveCommitteeInfo = (updatedInfo: Partial<ManagingCommitteeInfo>) => {
 const merged: ManagingCommitteeInfo = {
 ...committee,
 ...updatedInfo,
 id: committee.id || `comm_${Date.now()}`,
 year: updatedInfo.year || committee.year || '',
 members: committee.members || []
 };
 updateManagingCommittee(merged);
 saveManagingCommitteeRecord(merged);
 if (merged.year) {
 setSelectedTerm(merged.year);
 }
 };

 // Update meetings & decisions in Zustand store
 const handleUpdateCommitteeMeetings = (updatedFields: Partial<ManagingCommitteeInfo>) => {
 const merged: ManagingCommitteeInfo = {
 ...committee,
 ...updatedFields
 };
 updateManagingCommittee(merged);
 saveManagingCommitteeRecord(merged);
 toast.success('সভার তথ্য ও রেজুলেশন সফলভাবে সংরক্ষিত হয়েছে');
 };

 const handleSaveSingleMeeting = (meeting: CommitteeMeeting) => {
 const existingMeetings = committee.meetings || [];
 const index = existingMeetings.findIndex(m => m.id === meeting.id);
 let updatedMeetings: CommitteeMeeting[];
 if (index >= 0) {
 updatedMeetings = [...existingMeetings];
 updatedMeetings[index] = meeting;
 } else {
 updatedMeetings = [meeting, ...existingMeetings];
 }
 handleUpdateCommitteeMeetings({ meetings: updatedMeetings });
 };

 // Complete Formation Pipeline callback
 const handleCompleteFormation = (newCommittee: ManagingCommitteeInfo) => {
 updateManagingCommittee(newCommittee);
 saveManagingCommitteeRecord(newCommittee);
 if (newCommittee.year) {
 setSelectedTerm(newCommittee.year);
 }
 setActiveTab('overview');
 toast.success('নতুন কমিটি সফলভাবে গঠিত ও সক্রিয় পরিষদ হিসেবে সংরক্ষিত হয়েছে');
 };

 // Policy Guide Modal opener
 const handleOpenPolicyGuide = (topicKey: string) => {
 setPolicyGuideTopic(topicKey);
 setIsPolicyGuideOpen(true);
 };

 // Social Card Modal opener
 const handleOpenSocialCard = (member: ManagingCommitteeMember) => {
 setSocialCardMember(member);
 setIsSocialCardOpen(true);
 };

 // Quick Action Modal opener
 const handleOpenQuickAction = (action: 'notice' | 'session' | 'register' | 'resolution') => {
 setQuickActionType(action);
 setIsQuickActionOpen(true);
 };

 // Print Roster
 const handleSaveDirectEntry = (newCommittee: Partial<ManagingCommitteeInfo>) => {
 saveManagingCommitteeRecord(newCommittee as ManagingCommitteeInfo);
 if (newCommittee.year) {
 setSelectedTerm(newCommittee.year);
 }
 setActiveTab('overview');
 };

 const handlePrintRoster = () => {
 setIsPrintSheetOpen(true);
 };

 // If user is currently viewing the print sheet
 if (isPrintSheetOpen) {
 return (
 <div className="">
 <CommitteePrintSheet 
 committee={committee}
 institution={institution}
 onBack={() => setIsPrintSheetOpen(false)}
 />
 </div>
 );
 }

 return (
 <div className="space-y-6 pb-12 ">
 
 {/* ============================================================ */}
 {/* 1. TOP NAVIGATION TABS (MATCHING PROTOTYPE SPECIFICATION) */}
 {/* ============================================================ */}
 <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 print:hidden">
 
 {/* Navigation Tabs */}
 <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
 <button
 type="button"
 onClick={() => setActiveTab('overview')}
 className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
 activeTab === 'overview'
 ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
 }`}
 >
 <ShieldCheck className="w-4 h-4" />
 <span>ওভারভিউ</span>
 </button>

 <button
 type="button"
 onClick={() => setActiveTab('meetings')}
 className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
 activeTab === 'meetings'
 ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
 }`}
 >
 <FileText className="w-4 h-4" />
 <span>সভা ও সিদ্ধান্ত</span>
 </button>

 <button
 type="button"
 onClick={() => setActiveTab('formation')}
 className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
 activeTab === 'formation'
 ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
 }`}
 >
 <Sparkles className="w-4 h-4" />
 <span>কমিটি গঠন</span>
 </button>

 <button
 type="button"
 onClick={() => setActiveTab('archive')}
 className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
 activeTab === 'archive'
 ? 'bg-emerald-800 text-white shadow-md shadow-emerald-900/20'
 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
 }`}
 >
 <History className="w-4 h-4" />
 <span>কমিটি সমূহ</span>
 </button>
 </div>

 {/* Right side helper controls */}
 <div className="flex items-center gap-2.5 self-end md:self-center shrink-0">
 
 {/* Term Selector */}
 <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs">
 <Calendar className="w-3.5 h-3.5 text-slate-400" />
 <span className="text-[11px] font-bold text-slate-400 uppercase">সেশন:</span>
 <select
 value={selectedTerm}
 onChange={e => setSelectedTerm(e.target.value)}
 className="bg-transparent font-bold text-slate-800 text-xs focus:outline-none cursor-pointer"
 >
 {termsList.map(t => (
 <option key={t} value={t}>{t}</option>
 ))}
 </select>
 </div>

 {/* Module Guideline Button */}
 <button
 type="button"
 onClick={() => handleOpenPolicyGuide(activeTab)}
 className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
 title="বর্তমান মডিউলের সরকারি ও শিক্ষা বোর্ড পরিচালনা বিধিমালা পড়ুন"
 >
 <BookOpen className="w-4 h-4 text-emerald-700" />
 <span className="hidden sm:inline">বিধিমালা গাইড</span>
 </button>
 </div>
 </div>

 {/* ============================================================ */}
 {/* 2. TAB CONTENT VIEWPORT */}
 {/* ============================================================ */}
 
 {/* TAB 1: OVERVIEW DASHBOARD */}
 {activeTab === 'overview' && (
 <CommitteeDashboard
 committee={committee}
 members={members}
 institution={institution}
 onOpenInfoModal={() => setIsInfoModalOpen(true)}
 onOpenAddMember={handleOpenAddMember}
 onEditMember={handleOpenEditMember}
 onDeleteMember={handleDeleteMember}
 onNavigateTab={(tab) => {
 if (tab === 'reports') {
 setIsPrintSheetOpen(true);
 } else {
 setActiveTab(tab as CommitteeTab);
 }
 }}
 onOpenPolicyGuide={handleOpenPolicyGuide}
 onOpenSocialCard={handleOpenSocialCard}
 onOpenQuickAction={handleOpenQuickAction}
 onPrintRoster={handlePrintRoster}
 selectedTerm={selectedTerm}
 onSelectTerm={setSelectedTerm}
 termsList={termsList}
 committeeTypeName={committeeTypeName}
 />
 )}

 {/* TAB 2: MEETINGS & DECISIONS */}
 {activeTab === 'meetings' && (
 <CommitteeMeetingsManager
 committee={committee}
 onUpdateCommittee={handleUpdateCommitteeMeetings}
 onOpenPolicyGuide={handleOpenPolicyGuide}
 onOpenQuickAction={handleOpenQuickAction}
 onPrintResolution={(_meeting) => {
 handleOpenQuickAction('resolution');
 }}
 />
 )}

 {/* TAB 3: 11-STEP FORMATION WORKFLOW */}
 {activeTab === 'formation' && (
 <CommitteeElectionWorkflow
 onActivateCommittee={handleCompleteFormation}
 onOpenPolicyGuide={handleOpenPolicyGuide}
 />
 )}

 {/* TAB 4: ARCHIVE VIEW */}
 {activeTab === 'archive' && (
 <CommitteeArchiveView
 currentCommittee={committee}
 archiveCommittees={managingCommitteesList || []}
 onBackToCurrent={() => setActiveTab('overview')}
 onOpenPolicyGuide={handleOpenPolicyGuide}
 institution={institution}
 onOpenDirectEntry={() => {
 setDirectEntryInitialData(null);
 setIsDirectEntryModalOpen(true);
 }}
 onPrintArchive={(comm) => {
 if (comm.year) setSelectedTerm(comm.year);
 setIsPrintSheetOpen(true);
 }}
 onEditArchive={(comm) => {
 setDirectEntryInitialData(comm);
 setIsDirectEntryModalOpen(true);
 }}
 onDeleteArchive={(id) => {
 useAppStore.getState().deleteManagingCommitteeRecord(id);
 }}
 />
 )}

 {/* ============================================================ */}
 {/* 3. MODALS & POPUPS */}
 {/* ============================================================ */}

 {/* MODAL: REGULATORY & POLICY GUIDE (EVERY MODULE GUIDANCE) */}
 <CommitteePolicyGuideModal
 isOpen={isPolicyGuideOpen}
 onClose={() => setIsPolicyGuideOpen(false)}
 topicKey={policyGuideTopic}
 />

 {/* MODAL: SOCIAL MEDIA SMART PROFILE CARD (1080x1080) */}
 <CommitteeMemberSocialCardModal
 isOpen={isSocialCardOpen}
 onClose={() => {
 setIsSocialCardOpen(false);
 setSocialCardMember(null);
 }}
 member={socialCardMember}
 institution={institution}
 committeeTerm={committee?.title || committee?.year || ''}
 />

 {/* MODAL: QUICK ACTIONS (NOTICE, SESSION, REGISTER, RESOLUTION) */}
 <CommitteeQuickActionModal
 isOpen={isQuickActionOpen}
 onClose={() => setIsQuickActionOpen(false)}
 actionType={quickActionType}
 committee={committee}
 institution={institution}
 onSaveMeeting={handleSaveSingleMeeting}
 />

 {/* MODAL: COMMITTEE INFO & BOARD APPROVAL */}
 <CommitteeInfoModal
 isOpen={isInfoModalOpen}
 onClose={() => setIsInfoModalOpen(false)}
 initialData={committee}
 onSave={handleSaveCommitteeInfo}
 />

 {/* MODAL: DIRECT ENTRY FOR NEW COMMITTEE */}
 <CommitteeDirectEntryModal
 isOpen={isDirectEntryModalOpen}
 onClose={() => setIsDirectEntryModalOpen(false)}
 initialData={directEntryInitialData}
 onSave={handleSaveDirectEntry}
 />

 {/* MODAL: ADD / EDIT COMMITTEE MEMBER */}
 <CommitteeMemberModal
 isOpen={isMemberModalOpen}
 onClose={() => setIsMemberModalOpen(false)}
 initialData={editingMember}
 onSave={handleSaveMember}
 />

 </div>
 );
};

export default CommitteeModule;
