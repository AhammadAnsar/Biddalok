import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { generateReport } from '../../services/exportService';
import { ManagingCommitteeMember, ManagingCommitteeInfo } from '../../types';
import { toBengaliNumber } from '../../utils/bengaliUtils';
import { 
 Users, UserPlus, Calendar, Award, 
 ShieldCheck, Phone, Mail, MapPin, 
 Printer, Download, Edit3, Trash2, 
 Plus, CheckCircle2, Clock, FileText, X, Upload, Camera
} from 'lucide-react';
import { toast } from '../../utils/toast';
import { uploadDocumentSecurely } from '../../utils/apiClient';

export const ManagingCommitteeTab: React.FC = () => {
 const { 
 managingCommittee, 
 updateManagingCommittee, 
 addCommitteeMember, 
 updateCommitteeMember, 
 deleteCommitteeMember,
 institution 
 } = useAppStore();

 const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
 const [isCommitteeInfoModalOpen, setIsCommitteeInfoModalOpen] = useState(false);
 const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

 const [memberFormData, setMemberFormData] = useState<Partial<ManagingCommitteeMember>>({
 id: '',
 name: '',
 nameBn: '',
 role: 'guardian_representative',
 roleTitleBn: 'অভিভাবক প্রতিনিধি',
 roleTitleEn: 'Guardian Representative',
 mobile: '',
 email: '',
 nid: '',
 profession: '',
 gender: 'Male',
 address: '',
 status: 'active'
 });

 const [committeeInfoData, setCommitteeInfoData] = useState<Partial<ManagingCommitteeInfo>>({
 ...managingCommittee
 });

 const hasCommitteeData = Boolean(
   managingCommittee && (
     managingCommittee.hasCommittee ||
     managingCommittee.name || 
     managingCommittee.nameBn || 
     managingCommittee.startDate || 
     managingCommittee.resolutionNo ||
     (managingCommittee.members && managingCommittee.members.length > 0)
   )
 );

 const committee: ManagingCommitteeInfo = managingCommittee || {
   id: '',
   name: 'বিদ্যালয় ব্যবস্থাপনা কমিটি (এসএমসি)',
   nameBn: 'বিদ্যালয় ব্যবস্থাপনা কমিটি (এসএমসি)',
   type: 'regular',
   approvalDate: '',
   resolutionNo: '',
   startDate: '',
   endDate: '',
   status: 'active',
   members: []
 };

 const members = committee.members || [];
 const maleCount = members.filter(m => m.gender === 'Male').length;
 const femaleCount = members.filter(m => m.gender === 'Female').length;

 const remainingDays = useMemo(() => {
   if (!committee.endDate) return null;
   const end = new Date(committee.endDate).getTime();
   if (isNaN(end)) return null;
   return Math.max(0, Math.round((end - Date.now()) / (1000 * 60 * 60 * 24)));
 }, [committee.endDate]);

 const handleOpenAddMember = () => {
 setEditingMemberId(null);
 setMemberFormData({
 id: `comm_${Date.now().toString().slice(-6)}`,
 name: '',
 nameBn: '',
 role: 'guardian_representative',
 roleTitleBn: 'অভিভাবক প্রতিনিধি',
 roleTitleEn: 'Guardian Representative',
 mobile: '',
 email: '',
 nid: '',
 profession: '',
 gender: 'Male',
 address: '',
 status: 'active'
 });
 setIsMemberModalOpen(true);
 };

 const handleOpenEditMember = (member: ManagingCommitteeMember) => {
 setEditingMemberId(member.id);
 setMemberFormData({ ...member });
 setIsMemberModalOpen(true);
 };

 const handleMemberPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 const memberId = editingMemberId || memberFormData.id || 'Member_' + Date.now();
 try {
 const result = await uploadDocumentSecurely({
 file,
 type: 'committee',
 id: memberId,
 docType: 'Photo',
 });

 if (result.success && result.filepath) {
 setMemberFormData(prev => ({ ...prev, photo: result.filepath }));
 return;
 }
 } catch (err) {
 console.warn('Committee photo upload failed, fallback to base64', err);
 }

 const reader = new FileReader();
 reader.onloadend = () => {
 setMemberFormData(prev => ({ ...prev, photo: reader.result as string }));
 };
 reader.readAsDataURL(file);
 };

 const handleSaveMember = (e: React.FormEvent) => {
 e.preventDefault();
 if (!memberFormData.nameBn && !memberFormData.name) {
 toast.error('সদস্যের নাম আবশ্যক।');
 return;
 }

 if (editingMemberId) {
 updateCommitteeMember(editingMemberId, memberFormData);
 toast.success('কমিটি সদস্যের তথ্য সফলভাবে আপডেট হয়েছে');
 } else {
 addCommitteeMember(memberFormData as ManagingCommitteeMember);
 toast.success('নতুন কমিটি সদস্য সফলভাবে যুক্ত হয়েছে');
 }
 setIsMemberModalOpen(false);
 };

 const handleDeleteMember = (id: string, nameBn: string) => {
 if (confirm(`আপনি কি নিশ্চিতভাবে "${nameBn}" সদস্যকে কমিটি থেকে অপসারণ করতে চান?`)) {
 deleteCommitteeMember(id);
 toast.success(`"${nameBn}" সদস্যকে কমিটি থেকে অপসারণ করা হয়েছে`);
 }
 };

 const handleSaveCommitteeInfo = (e: React.FormEvent) => {
 e.preventDefault();
 updateManagingCommittee(committeeInfoData);
 toast.success('কমিটির সাধারণ তথ্য সফলভাবে সংরক্ষিত হয়েছে');
 setIsCommitteeInfoModalOpen(false);
 };

 const handlePrint = () => {
 window.print();
 };

 const handleExportCSV = () => {
 const headers = ['ক্রমিক', 'পদবি (বাংলা)', 'পদবি (ইংরেজি)', 'নাম (বাংলা)', 'নাম (ইংরেজি)', 'লিঙ্গ', 'পেশা', 'মোবাইল', 'এনআইডি', 'ঠিকানা'];
 const rows = members.map((m, idx) => [
 idx + 1,
 `"${m.roleTitleBn}"`,
 `"${m.roleTitleEn}"`,
 `"${(m.nameBn || m.name || '').replace(/"/g, '""')}"`,
 `"${(m.name || '').replace(/"/g, '""')}"`,
 `"${m.gender === 'Male' ? 'পুরুষ' : 'মহিলা'}"`,
 `"${m.profession || ''}"`,
 `"${m.mobile || ''}"`,
 `"${m.nid || ''}"`,
 `"${(m.address || '').replace(/"/g, '""')}"`
 ]);

 const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
 const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.setAttribute('href', url);
 link.setAttribute('download', `ব্যবস্থাপনা_কমিটি_সদস্য_তালিকা_${new Date().toISOString().split('T')[0]}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 toast.success('কমিটি সদস্যদের তালিকা CSV আকারে ডাউনলোড হয়েছে');
 };

 return (
 <div className="space-y-6">
 
 {/* Committee Overview Banner Card */}
 <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
 <div className="space-y-2">
 <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
 <Award className="w-4 h-4 text-indigo-500" />
 <span>প্রাতিষ্ঠানিক গভর্ন্যান্স ও এসএমসি</span>
 <span className="text-slate-300">•</span>
 <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
 {committee.status === 'active' ? 'সক্রিয় পরিষদ' : 'মেয়াদোত্তীর্ণ'}
 </span>
 </div>

 <h2 className="text-2xl font-black text-slate-900 tracking-tight">
  {committee.nameBn || committee.name || 'ম্যানেজিং কমিটি'}
 </h2>

 <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500">
  <div>
   রেজুলেশন নং: <strong className="text-slate-800 font-mono">{committee.resolutionNo || '—'}</strong>
  </div>
  <span className="text-slate-300">•</span>
  <div>
   অনুমোদন তারিখ: <strong className="text-slate-800">{committee.approvalDate ? toBengaliNumber(committee.approvalDate) : '—'}</strong>
  </div>
  <span className="text-slate-300">•</span>
  <div className="flex items-center gap-1">
   <Calendar className="w-3.5 h-3.5 text-indigo-500" />
   <span>মেয়াদ: <strong className="text-slate-800">{committee.startDate ? toBengaliNumber(committee.startDate) : '—'}</strong> হতে <strong className="text-slate-800">{committee.endDate ? toBengaliNumber(committee.endDate) : '—'}</strong></span>
  </div>
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
 <button
 onClick={() => {
 setCommitteeInfoData({ ...committee });
 setIsCommitteeInfoModalOpen(true);
 }}
 className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
 >
 <Edit3 className="w-3.5 h-3.5 text-slate-500" />
 <span>কমিটি তথ্য সম্পাদন</span>
 </button>

 <button
 onClick={handlePrint}
 className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
 >
 <Printer className="w-3.5 h-3.5 text-slate-500" />
 <span>তালিকা প্রিন্ট</span>
 </button>

 <button
 onClick={handleExportCSV}
 className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-1.5 transition-all shadow-xs"
 >
 <Download className="w-3.5 h-3.5 text-indigo-600" />
 <span>CSV</span>
 </button>

 <button
 onClick={handleOpenAddMember}
 className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
 >
 <UserPlus className="w-4 h-4" />
 <span>নতুন সদস্য যুক্ত</span>
 </button>
 </div>
 </div>

 {/* Metrics Row */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
 <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
 <div className="text-xs font-bold text-slate-500">মোট পরিষদ সদস্য</div>
 <div className="text-2xl font-black text-slate-900 mt-2">{toBengaliNumber(members.length)} <span className="text-xs font-normal text-slate-500">জন</span></div>
 <div className="text-[11px] text-slate-400 mt-1">পূর্ণাঙ্গ নির্বাচিত ও মনোনীত কমিটি</div>
 </div>

 <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
 <div className="text-xs font-bold text-slate-500">পুরুষ সদস্য</div>
 <div className="text-2xl font-black text-indigo-600 mt-2">{toBengaliNumber(maleCount)} <span className="text-xs font-normal text-slate-500">জন</span></div>
 <div className="text-[11px] text-slate-400 mt-1">মোট সদস্যের {members.length > 0 ? Math.round((maleCount / members.length) * 100) : 0}%</div>
 </div>

 <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
 <div className="text-xs font-bold text-slate-500">মহিলা প্রতিনিধি</div>
 <div className="text-2xl font-black text-rose-600 mt-2">{toBengaliNumber(femaleCount)} <span className="text-xs font-normal text-slate-500">জন</span></div>
 <div className="text-[11px] text-slate-400 mt-1">সংরক্ষিত মহিলা ও অভিভাবক প্রতিনিধি</div>
 </div>

 <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
 <div className="text-xs font-bold text-slate-500">মেয়াদ উত্তীর্ণ হতে বাকি</div>
 <div className="text-2xl font-black text-emerald-600 mt-2">{remainingDays !== null ? toBengaliNumber(remainingDays) : '—'} <span className="text-xs font-normal text-slate-500">{remainingDays !== null ? 'দিন' : ''}</span></div>
 <div className="text-[11px] text-slate-400 mt-1">{committee.endDate ? toBengaliNumber(committee.endDate) + ' পর্যন্ত মেয়াদ বলবৎ' : 'মেয়াদ অনির্ধারিত'}</div>
 </div>
 </div>

 {/* Members Grid & Table */}
 <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden" id="printable-committee-area">
 
 {/* Print Header */}
 <div className="hidden print:block p-6 text-center border-b border-slate-400">
 <h1 className="text-2xl font-black text-slate-900">{institution?.nameBn || institution?.name || 'বিদ্যালয়'}</h1>
 <p className="text-xs text-slate-600">EIIN: {institution?.eiin || '105820'} | {institution?.district || 'ঢাকা'}</p>
 <div className="mt-3 text-base font-bold text-slate-900 underline">{committee.nameBn || committee.name} - সদস্য বিবরণী</div>
 <p className="text-xs text-slate-500 mt-1">অনুমোদন রেজুলেশন: {committee.resolutionNo} | মেয়াদ: {committee.startDate} হতে {committee.endDate}</p>
 </div>

 <div className="p-5 border-b border-slate-100 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Users className="w-4 h-4 text-indigo-600" />
 <h3 className="font-black text-slate-900 text-sm">পরিষদ সদস্যদের বিস্তারিত বিবরণ</h3>
 </div>
 <span className="text-xs font-medium text-slate-500">সর্বমোট {toBengaliNumber(members.length)} জন সদস্য</span>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
 <th className="py-3 px-4 w-12 text-center">#</th>
 <th className="py-3 px-4">কমিটির পদবি ও দায়িত্ব</th>
 <th className="py-3 px-4">সদস্যের নাম</th>
 <th className="py-3 px-4">পেশা ও লিঙ্গ</th>
 <th className="py-3 px-4">মোবাইল ও যোগাযোগ</th>
 <th className="py-3 px-4">এনআইডি নম্বর</th>
 <th className="py-3 px-4">ঠিকানা</th>
 <th className="py-3 px-4 text-right print:hidden">অ্যাকশন</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
 {members.length === 0 ? (
 <tr>
 <td colSpan={8} className="py-12 text-center text-slate-400">
 <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
 <p className="text-xs font-bold text-slate-600">কোনো কমিটির সদস্য পাওয়া যায়নি</p>
 <p className="text-[11px] text-slate-400 mt-0.5">নতুন সদস্য যুক্ত করতে উপরের 'নতুন সদস্য যুক্ত' বাটনে ক্লিক করুন</p>
 </td>
 </tr>
 ) : (
 members.map((member, index) => {
 const isLeader = member.role === 'president' || member.role === 'member_secretary';
 return (
 <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
 <td className="py-3.5 px-4 text-center font-bold text-slate-400">
 {index + 1}
 </td>
 <td className="py-3.5 px-4">
 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
 member.role === 'president'
 ? 'bg-amber-50 text-amber-900 border-amber-300'
 : member.role === 'member_secretary'
 ? 'bg-indigo-50 text-indigo-900 border-indigo-300'
 : 'bg-slate-100 text-slate-700 border-slate-200'
 }`}>
 {isLeader && <Award className="w-3 h-3 text-amber-500" />}
 <span>{member.roleTitleBn}</span>
 </span>
 <div className="text-[10px] text-slate-400 font-mono mt-0.5">{member.roleTitleEn}</div>
 </td>
 <td className="py-3.5 px-4">
 <div className="flex items-center gap-3">
 {member.photo ? (
 <img 
 src={member.photo} 
 alt={member.nameBn || member.name} 
 className="w-9 h-9 rounded-full object-cover border border-indigo-200 shadow-xs"
 />
 ) : (
 <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
 {(member.nameBn || member.name || 'স')[0]}
 </div>
 )}
 <div>
 <div className="font-bold text-slate-900 text-sm">{member.nameBn || member.name}</div>
 <div className="text-[11px] text-slate-500 font-medium">{member.name}</div>
 </div>
 </div>
 </td>
 <td className="py-3.5 px-4">
 <div className="font-medium text-slate-800">{member.profession || '—'}</div>
 <div className="text-[11px] text-slate-400">{member.gender === 'Male' ? 'পুরুষ' : 'মহিলা'}</div>
 </td>
 <td className="py-3.5 px-4 font-mono">
 <div className="flex items-center gap-1 text-slate-800 font-semibold">
 <Phone className="w-3 h-3 text-slate-400" />
 <span>{member.mobile || '—'}</span>
 </div>
 {member.email && (
 <div className="flex items-center gap-1 text-[11px] text-slate-500">
 <Mail className="w-3 h-3 text-slate-400" />
 <span>{member.email}</span>
 </div>
 )}
 </td>
 <td className="py-3.5 px-4 font-mono text-slate-600 text-xs">
 {member.nid || '—'}
 </td>
 <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
 {member.address || '—'}
 </td>
 <td className="py-3.5 px-4 text-right print:hidden">
 <div className="flex items-center justify-end gap-1">
 <button
 onClick={() => handleOpenEditMember(member)}
 className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
 title="সম্পাদনা করুন"
 >
 <Edit3 className="w-3.5 h-3.5" />
 </button>
 <button
 onClick={() => handleDeleteMember(member.id, member.nameBn)}
 className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
 title="মুছে ফেলুন"
 >
 <Trash2 className="w-3.5 h-3.5" />
 </button>
 </div>
 </td>
 </tr>
 );
 }) )}
 </tbody>
 </table>
 </div>

 {/* Print Signatures */}
 <div className="hidden print:grid grid-cols-2 gap-16 p-12 mt-12 text-center text-xs">
 <div>
 <div className="border-t border-slate-400 pt-1.5 font-bold">প্রধান শিক্ষক ও সদস্য সচিব</div>
 <div className="text-[10px] text-slate-500">স্বাক্ষর ও প্রাতিষ্ঠানিক সিল</div>
 </div>
 <div>
 <div className="border-t border-slate-400 pt-1.5 font-bold">সভাপতি, ব্যবস্থাপনা কমিটি</div>
 <div className="text-[10px] text-slate-500">স্বাক্ষর ও সিল</div>
 </div>
 </div>

 </div>

 {/* Member Add/Edit Modal */}
 {isMemberModalOpen && (
 <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
 <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden ">
 <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
 <h3 className="font-bold text-slate-900 text-sm">
 {editingMemberId ? 'কমিটি সদস্য তথ্য সম্পাদন' : 'নতুন কমিটি সদস্য যুক্ত করুন'}
 </h3>
 <button
 onClick={() => setIsMemberModalOpen(false)}
 className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <form onSubmit={handleSaveMember} className="p-5 space-y-4">
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 কমিটিতে পদবি <span className="text-rose-500">*</span>
 </label>
 <select
 value={memberFormData.role || 'guardian_representative'}
 onChange={(e: any) => {
 const role = e.target.value;
 let roleTitleBn = 'অভিভাবক প্রতিনিধি';
 let roleTitleEn = 'Guardian Representative';
 if (role === 'president') {
 roleTitleBn = 'সভাপতি';
 roleTitleEn = 'President';
 } else if (role === 'member_secretary') {
 roleTitleBn = 'সদস্য সচিব (প্রধান শিক্ষক)';
 roleTitleEn = 'Member Secretary';
 } else if (role === 'teacher_representative') {
 roleTitleBn = 'শিক্ষক প্রতিনিধি';
 roleTitleEn = 'Teacher Representative';
 } else if (role === 'donor_member') {
 roleTitleBn = 'দাতা সদস্য';
 roleTitleEn = 'Donor Member';
 } else if (role === 'enthusiast_member') {
 roleTitleBn = 'বিদ্যুৎসাহী সদস্য';
 roleTitleEn = 'Education Enthusiast Member';
 }
 setMemberFormData(prev => ({ ...prev, role, roleTitleBn, roleTitleEn }));
 }}
 className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
 >
 <option value="president">সভাপতি (President)</option>
 <option value="member_secretary">সদস্য সচিব (Member Secretary)</option>
 <option value="teacher_representative">শিক্ষক প্রতিনিধি (Teacher Representative)</option>
 <option value="guardian_representative">অভিভাবক প্রতিনিধি (Guardian Representative)</option>
 <option value="donor_member">দাতা সদস্য (Donor Member)</option>
 <option value="enthusiast_member">বিদ্যুৎসাহী সদস্য (Education Enthusiast)</option>
 <option value="founder_member">প্রতিষ্ঠাতা সদস্য (Founder Member)</option>
 </select>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 পদবির বিবরণ (বাংলা)
 </label>
 <input
 type="text"
 value={memberFormData.roleTitleBn || ''}
 onChange={(e) => setMemberFormData(prev => ({ ...prev, roleTitleBn: e.target.value }))}
 className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 সদস্যের নাম (বাংলা) <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 required
 value={memberFormData.nameBn || ''}
 onChange={(e) => setMemberFormData(prev => ({ ...prev, nameBn: e.target.value }))}
 placeholder="e.g. মো: রফিকুল ইসলাম"
 className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 সদস্যের নাম (ইংরেজি)
 </label>
 <input
 type="text"
 value={memberFormData.name || ''}
 onChange={(e) => setMemberFormData(prev => ({ ...prev, name: e.target.value }))}
 placeholder="e.g. Md. Rafiqul Islam"
 className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 পেশা
 </label>
 <input
 type="text"
 value={memberFormData.profession || ''}
 onChange={(e) => setMemberFormData(prev => ({ ...prev, profession: e.target.value }))}
 placeholder="e.g. সমাজসেবক / ব্যবসা"
 className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 লিঙ্গ
 </label>
 <select
 value={memberFormData.gender || 'Male'}
 onChange={(e: any) => setMemberFormData(prev => ({ ...prev, gender: e.target.value }))}
 className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
 >
 <option value="Male">পুরুষ</option>
 <option value="Female">মহিলা</option>
 </select>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 মোবাইল নম্বর <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 required
 value={memberFormData.mobile || ''}
 onChange={(e) => setMemberFormData(prev => ({ ...prev, mobile: e.target.value }))}
 placeholder="017XXXXXXXX"
 className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 জাতীয় পরিচয়পত্র (NID)
 </label>
 <input
 type="text"
 value={memberFormData.nid || ''}
 onChange={(e) => setMemberFormData(prev => ({ ...prev, nid: e.target.value }))}
 placeholder="10 বা 17 ডিজিটের NID"
 className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">
 ঠিকানা
 </label>
 <input
 type="text"
 value={memberFormData.address || ''}
 onChange={(e) => setMemberFormData(prev => ({ ...prev, address: e.target.value }))}
 placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা"
 className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
 />
 </div>

 {/* Photo Upload Section */}
 <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
 <label className="block text-xs font-semibold text-slate-700 mb-2">
 সদস্যের ছবি (Photo)
 </label>
 <div className="flex items-center gap-4">
 {memberFormData.photo ? (
 <img 
 src={memberFormData.photo} 
 alt="Member" 
 className="w-14 h-14 rounded-xl object-cover border border-indigo-200 shadow-sm"
 />
 ) : (
 <div className="w-14 h-14 rounded-xl bg-white border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
 <Camera className="w-5 h-5" />
 </div>
 )}
 <div className="flex-1">
 <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg cursor-pointer transition-colors text-xs font-semibold">
 <Upload className="w-3.5 h-3.5" />
 <span>ছবি আপলোড করুন</span>
 <input
 type="file"
 accept="image/png,image/jpeg,image/webp"
 className="hidden"
 onChange={handleMemberPhotoUpload}
 />
 </label>
 <p className="text-[10px] text-slate-500 mt-1">
 ছবি স্বয়ংক্রিয়ভাবে সদস্যের নির্দিষ্ট আইডির ফোল্ডারে সংরক্ষিত হবে।
 </p>
 </div>
 </div>
 </div>

 <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
 <button
 type="button"
 onClick={() => setIsMemberModalOpen(false)}
 className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
 >
 বাতিল
 </button>
 <button
 type="submit"
 className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20"
 >
 সংরক্ষণ করুন
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 {/* Committee Info Settings Modal */}
 {isCommitteeInfoModalOpen && (
 <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
 <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden ">
 <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
 <h3 className="font-bold text-slate-900 text-sm">কমিটি সাধারণ বিবরণী পরিবর্তন</h3>
 <button
 onClick={() => setIsCommitteeInfoModalOpen(false)}
 className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
 >
 <X className="w-4 h-4" />
 </button>
 </div>

 <form onSubmit={handleSaveCommitteeInfo} className="p-5 space-y-4">
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">কমিটির নাম (বাংলা)</label>
 <input
 type="text"
 required
 value={committeeInfoData.nameBn || ''}
 onChange={(e) => setCommitteeInfoData(prev => ({ ...prev, nameBn: e.target.value }))}
 className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">কমিটির ধরণ</label>
 <select
 value={committeeInfoData.type || 'regular'}
 onChange={(e: any) => setCommitteeInfoData(prev => ({ ...prev, type: e.target.value }))}
 className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
 >
 <option value="regular">নিয়মিত ম্যানেজিং কমিটি (Regular SMC)</option>
 <option value="ad_hoc">এডহক কমিটি (Ad-hoc Committee)</option>
 <option value="governing_body">গভর্নিং বডি (Governing Body)</option>
 </select>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">রেজুলেশন / মেমো নং</label>
 <input
 type="text"
 value={committeeInfoData.resolutionNo || ''}
 onChange={(e) => setCommitteeInfoData(prev => ({ ...prev, resolutionNo: e.target.value }))}
 className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">অনুমোদনের তারিখ</label>
 <input
 type="date"
 value={committeeInfoData.approvalDate || ''}
 onChange={(e) => setCommitteeInfoData(prev => ({ ...prev, approvalDate: e.target.value }))}
 className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">মেয়াদ শুরুর তারিখ</label>
 <input
 type="date"
 value={committeeInfoData.startDate || ''}
 onChange={(e) => setCommitteeInfoData(prev => ({ ...prev, startDate: e.target.value }))}
 className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 mb-1">মেয়াদ সমাপ্তির তারিখ</label>
 <input
 type="date"
 value={committeeInfoData.endDate || ''}
 onChange={(e) => setCommitteeInfoData(prev => ({ ...prev, endDate: e.target.value }))}
 className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
 />
 </div>
 </div>

 <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
 <button
 type="button"
 onClick={() => setIsCommitteeInfoModalOpen(false)}
 className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
 >
 বাতিল
 </button>
 <button
 type="submit"
 className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20"
 >
 সংরক্ষণ করুন
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 </div>
 );
};
