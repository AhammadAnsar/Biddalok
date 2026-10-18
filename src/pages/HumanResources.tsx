import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { generateReport } from '../services/exportService';
import { StaffMember } from '../types';
import { StaffProfileModal } from '../components/hr/StaffProfileModal';
import { StaffFormModal } from '../components/hr/StaffFormModal';
import { MandatoryProfileLockModal } from '../components/hr/MandatoryProfileLockModal';
import { TeacherAllocationTab } from '../components/hr/TeacherAllocationTab';
import { PayrollManagementTab } from '../components/hr/PayrollManagementTab';
import { StaffIdCardTab } from '../components/hr/StaffIdCardTab';
import { StaffAttendanceModal } from '../components/hr/StaffAttendanceModal';
import { StaffDesignationSubjectSettingsModal } from '../components/hr/StaffDesignationSubjectSettingsModal';
import { StaffReportModal } from '../components/hr/StaffReportModal';
import { STAFF_CATEGORY_LABELS } from '../data/defaultStaffMaster';
import { VirtualizedTable } from '../components/common/VirtualizedTable';
import { 
  notifyTeacherAdded, 
  notifyTeacherUpdated, 
  notifyTeacherDeleted, 
  toast 
} from '../utils/toast';
import { 
  Users, UserPlus, UserCheck, DollarSign, CreditCard, 
  Search, Eye, Edit3, Trash2, ShieldAlert, 
  CheckCircle2, Briefcase, GraduationCap, 
  Lock, LayoutGrid, List, Phone, Mail, Download,
  Check, X, FileSpreadsheet, Printer, ShieldCheck, Building,
  HelpCircle, ChevronRight, ArrowUpDown, Award, Settings,
  Clock, AlertCircle, ChevronDown, ChevronUp, FileText,
  ArrowLeft, ArrowRight, Sparkles, Zap
} from 'lucide-react';

const HumanResources: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    staff, 
    addStaffMember, 
    updateStaffMember, 
    deleteStaffMember,
    institution,
    whiteLabel,
    staffDesignations,
    staffSubjects
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'directory' | 'allocation' | 'payroll' | 'id_card'>('directory');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'teaching' | 'non_teaching' | 'mpo' | 'non_mpo' | 'incomplete'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');

  // Modals state
  const [selectedStaffForProfile, setSelectedStaffForProfile] = useState<StaffMember | null>(null);
  const [selectedStaffForEdit, setSelectedStaffForEdit] = useState<StaffMember | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formInitialStep, setFormInitialStep] = useState(1);
  const [selectedStaffForLockCheck, setSelectedStaffForLockCheck] = useState<StaffMember | null>(null);
  const [isLockModalOpen, setIsLockModalOpen] = useState(false);
  const [lockActionTitle, setLockActionTitle] = useState('এমপিও আবেদন / ইনক্রিমেন্ট / ট্রান্সফার');

  // New sub-module modals
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceModalTab, setAttendanceModalTab] = useState<'present' | 'absent_leave'>('present');
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsModalTab, setSettingsModalTab] = useState<'designations' | 'subjects'>('designations');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState<'working' | 'vacant'>('working');
  const [showDesignationBreakdown, setShowDesignationBreakdown] = useState(false);

  const staffList = staff || [];

  // Get unique departments/subjects for filter dropdown
  const departments = Array.from(
    new Set(staffList.map(s => s.department || s.subject).filter(Boolean))
  ) as string[];

  // Filtered staff calculation
  const filteredStaff = staffList.filter(s => {
    // Type/Category Filter
    if (filterType === 'teaching' && s.staffType !== 'teaching') return false;
    if (filterType === 'non_teaching' && s.staffType !== 'non_teaching') return false;
    if (filterType === 'mpo' && s.employmentType !== 'mpo') return false;
    if (filterType === 'non_mpo' && s.employmentType === 'mpo') return false;
    if (filterType === 'incomplete' && (s.profileCompletion || 0) >= 100) return false;

    // Department Filter
    if (selectedDepartment !== 'all') {
      const staffDept = s.department || s.subject;
      if (staffDept !== selectedDepartment) return false;
    }

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.nameBn && s.nameBn.includes(q)) ||
        (s.customStaffId && s.customStaffId.toLowerCase().includes(q)) ||
        (s.pdsId && s.pdsId.toLowerCase().includes(q)) ||
        (s.designation && s.designation.toLowerCase().includes(q)) ||
        (s.designationBn && s.designationBn.includes(q)) ||
        (s.subject && s.subject.toLowerCase().includes(q)) ||
        (s.mobile && s.mobile.includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // KPI calculations
  const totalStaffCount = staffList.length;
  const teachingCount = staffList.filter(s => s.staffType === 'teaching').length;
  const nonTeachingCount = staffList.filter(s => s.staffType === 'non_teaching').length;
  const mpoCount = staffList.filter(s => s.employmentType === 'mpo').length;
  const nonMpoCount = staffList.filter(s => s.employmentType === 'non_mpo').length;
  const contractualCount = staffList.filter(s => s.employmentType === 'contractual' || s.employmentType === 'part_time').length;

  const designationsList = staffDesignations || [];
  const totalSanctionedPosts = designationsList.reduce((acc, d) => acc + (d.sanctionedPosts || 0), 0);
  const totalWorkingPosts = staffList.length;
  const totalVacantPosts = Math.max(0, totalSanctionedPosts - totalWorkingPosts);

  const todayPresentCount = staffList.filter(s => {
    if (s.todayAttendanceStatus) return s.todayAttendanceStatus === 'present';
    return s.status !== 'on_leave';
  }).length;

  const todayAbsentCount = staffList.filter(s => {
    if (s.todayAttendanceStatus) return s.todayAttendanceStatus === 'absent' || s.todayAttendanceStatus === 'leave';
    return s.status === 'on_leave';
  }).length;

  const getWorkingForDesignation = (desId: string, desName: string, desNameBn: string) => {
    return staffList.filter(s => 
      s.designationId === desId || 
      (s.designation && s.designation.toLowerCase() === desName.toLowerCase()) ||
      (s.designationBn && s.designationBn === desNameBn)
    ).length;
  };

  const incompleteCount = staffList.filter(s => (s.profileCompletion || 0) < 100).length;
  const avgCompletion = totalStaffCount > 0 
    ? Math.round(staffList.reduce((acc, s) => acc + (s.profileCompletion || 0), 0) / totalStaffCount) 
    : 100;

  // Handlers
  const handleOpenEnrollment = () => {
    setSelectedStaffForEdit(null);
    setFormInitialStep(1);
    setIsFormModalOpen(true);
  };

  const handleEditStaff = (staffMember: StaffMember, step = 1) => {
    setSelectedStaffForEdit(staffMember);
    setFormInitialStep(step);
    setIsFormModalOpen(true);
  };

  const handleSaveStaff = (savedStaff: StaffMember) => {
    const exists = staffList.some(s => s.id === savedStaff.id);
    const displayName = savedStaff.nameBn || savedStaff.name;
    if (exists) {
      updateStaffMember(savedStaff.id, savedStaff);
      notifyTeacherUpdated(displayName);
    } else {
      addStaffMember(savedStaff);
      notifyTeacherAdded(displayName);
    }
  };

  const handleDeleteStaff = (id: string, name: string) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে "${name}"-এর তথ্য মুছে ফেলতে চান?`)) {
      deleteStaffMember(id);
      notifyTeacherDeleted(name);
    }
  };

  const handleTriggerLockCheck = (member: StaffMember, actionName: string) => {
    setSelectedStaffForLockCheck(member);
    setLockActionTitle(actionName);
    setIsLockModalOpen(true);
  };

  // Export Staff List to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    if (filteredStaff.length === 0) {
      toast.error('এক্সপোর্ট করার জন্য কোনো শিক্ষক/কর্মচারীর তথ্য নেই।');
      return;
    }

    const headers = [
      'আইডি',
      'PDS নম্বর',
      'নাম (বাংলা)',
      'নাম (ইংরেজি)',
      'পদবি',
      'ধরণ',
      'এমপিও স্ট্যাটাস',
      'মোবাইল',
      'ইমেইল',
      'বিষয় / বিভাগ',
      'রক্তের গ্রুপ',
      'বেতন স্কেল',
      'প্রোফাইল সম্পন্নতা (%)'
    ];

    const rows = filteredStaff.map(s => [
      `"${s.customStaffId || ''}"`,
      `"${s.pdsId || ''}"`,
      `"${(s.nameBn || s.name || '').replace(/"/g, '""')}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.designationBn || s.designation || '').replace(/"/g, '""')}"`,
      `"${s.staffType === 'teaching' ? 'শিক্ষক' : 'কর্মচারী'}"`,
      `"${s.employmentType === 'mpo' ? 'এমপিওভুক্ত' : 'নন-এমপিও'}"`,
      `"${s.mobile || ''}"`,
      `"${s.email || ''}"`,
      `"${s.subject || s.department || ''}"`,
      `"${s.bloodGroup || ''}"`,
      `"${s.payCode || ''}"`,
      `"${s.profileCompletion || 0}%"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `biddalok_staff_list_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Executive Teachers & Staff Header */}
      <div className="bg-white px-5 py-3.5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">বর্তমান মডিউল:</span>
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg font-black flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
            <span>শিক্ষক ও কর্মচারী ব্যবস্থাপনা (Teachers & Staff)</span>
          </span>
        </div>

        <Link
          to="/committee"
          className="px-3.5 py-2 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>ব্যবস্থাপনা কমিটি মডিউলে যান</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Top Header Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                <Building className="w-3.5 h-3.5 text-indigo-500" />
                <span>মানবসম্পদ ও প্রাতিষ্ঠানিক প্রশাসন</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-500 font-normal">EIIN: {institution?.eiin || '105820'}</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                শিক্ষক ও কর্মচারী ব্যবস্থাপনা (Teachers & Staff Management)
              </h1>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                পূর্ণাঙ্গ শিক্ষক ডাটাবেজ, প্রোগ্রেসিভ প্রোফাইল অডিট, একাডেমিক শ্রেণি শিক্ষক বণ্টন, মাসিক বেতন শিট ও স্মার্ট পরিচয়পত্র।
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 flex-wrap">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-2 transition-all shadow-sm"
                title="সিএসভি ফাইল ডাউনলোড করুন"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>এক্সপোর্ট (CSV)</span>
              </button>

              <button
                onClick={handleOpenEnrollment}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>নতুন শিক্ষক/কর্মী এনরোল</span>
              </button>
            </div>
          </div>

          {/* 3-BLOCK STATISTICAL OVERVIEW (User Requested Layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* BLOCK 1: পদবি, অনুমোদিত পদ ও কর্মরত পদ */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between hover:border-indigo-200 transition-all">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Award className="w-4 h-4" />
                    </div>
                    <h3 className="font-black text-sm text-slate-900">অনুমোদিত ও কর্মরত পদবি</h3>
                  </div>
                  <button
                    onClick={() => {
                      setSettingsModalTab('designations');
                      setIsSettingsModalOpen(true);
                    }}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                    title="পদবি ও বিষয় সেটিংস খুলুন"
                  >
                    <Settings className="w-3 h-3" />
                    <span>সেটিংস</span>
                  </button>
                </div>

                {/* Metrics Matrix */}
                <div className="grid grid-cols-3 gap-2 py-4 text-center">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[11px] font-bold text-slate-500">পদবি সংখ্যা</div>
                    <div className="text-lg font-black text-slate-900 mt-1">{designationsList.length} <span className="text-[10px] font-normal text-slate-400">টি</span></div>
                  </div>
                  <div className="p-2.5 bg-indigo-50/50 rounded-xl border border-indigo-100/70">
                    <div className="text-[11px] font-bold text-indigo-700">অনুমোদিত পদ</div>
                    <div className="text-lg font-black text-indigo-900 mt-1">{totalSanctionedPosts} <span className="text-[10px] font-normal text-indigo-400">টি</span></div>
                  </div>
                  <div className="p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100/70">
                    <div className="text-[11px] font-bold text-emerald-700">কর্মরত</div>
                    <div className="text-lg font-black text-emerald-900 mt-1">{totalWorkingPosts} <span className="text-[10px] font-normal text-emerald-500">জন</span></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs px-1 text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <span className="font-medium flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${totalVacantPosts > 0 ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
                    <span>বর্তমানে শূন্যপদ:</span>
                  </span>
                  <strong className={`font-black ${totalVacantPosts > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {totalVacantPosts} টি
                  </strong>
                </div>
              </div>

              {/* Block 1 Action Buttons */}
              <div className="pt-4 mt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setReportModalType('working');
                    setIsReportModalOpen(true);
                  }}
                  className="flex-1 py-1.5 px-2 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center gap-1 transition-all shadow-2xs"
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>কর্মরত তালিকা</span>
                </button>
                <button
                  onClick={() => {
                    setReportModalType('vacant');
                    setIsReportModalOpen(true);
                  }}
                  className="flex-1 py-1.5 px-2 text-[11px] font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center gap-1 transition-all shadow-2xs"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>শূন্যপদের তালিকা</span>
                </button>
                <button
                  onClick={() => setShowDesignationBreakdown(!showDesignationBreakdown)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  title={showDesignationBreakdown ? "তালিকা লুকান" : "পদবিভিত্তিক অনুমোদিত ও শূন্যপদের তালিকা দেখুন"}
                >
                  {showDesignationBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* BLOCK 2: চাকরির ধরণ (এমপিওভুক্ত, নন-এমপিও, খন্ডকালীন) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between hover:border-sky-200 transition-all">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <h3 className="font-black text-sm text-slate-900">চাকরির ধরণ (Employment)</h3>
                  </div>
                  <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                    ৩টি ক্যাটাগরি
                  </span>
                </div>

                {/* Metrics Matrix */}
                <div className="grid grid-cols-3 gap-2 py-4 text-center">
                  <div className="p-2.5 bg-sky-50/60 rounded-xl border border-sky-100">
                    <div className="text-[11px] font-bold text-sky-800">এমপিওভুক্ত</div>
                    <div className="text-lg font-black text-sky-900 mt-1">{mpoCount} <span className="text-[10px] font-normal text-sky-600">জন</span></div>
                  </div>
                  <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-100">
                    <div className="text-[11px] font-bold text-amber-800">নন-এমপিও</div>
                    <div className="text-lg font-black text-amber-900 mt-1">{nonMpoCount} <span className="text-[10px] font-normal text-amber-600">জন</span></div>
                  </div>
                  <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100">
                    <div className="text-[11px] font-bold text-indigo-800">খন্ডকালীন</div>
                    <div className="text-lg font-black text-indigo-900 mt-1">{contractualCount} <span className="text-[10px] font-normal text-indigo-600">জন</span></div>
                  </div>
                </div>

                {/* Ratio visual bar */}
                <div className="space-y-1.5 mt-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>এমপিওভুক্তির অনুপাত</span>
                    <span className="font-bold text-slate-800">
                      {totalStaffCount > 0 ? Math.round((mpoCount / totalStaffCount) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-sky-500 h-full" 
                      style={{ width: `${totalStaffCount > 0 ? (mpoCount / totalStaffCount) * 100 : 0}%` }} 
                      title={`এমপিও: ${mpoCount} জন`}
                    />
                    <div 
                      className="bg-amber-500 h-full" 
                      style={{ width: `${totalStaffCount > 0 ? (nonMpoCount / totalStaffCount) * 100 : 0}%` }} 
                      title={`নন-এমপিও: ${nonMpoCount} জন`}
                    />
                    <div 
                      className="bg-indigo-500 h-full" 
                      style={{ width: `${totalStaffCount > 0 ? (contractualCount / totalStaffCount) * 100 : 0}%` }} 
                      title={`খন্ডকালীন: ${contractualCount} জন`}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>ইনডেক্সধারী: <strong className="text-slate-800">{mpoCount} জন</strong></span>
                <span className="text-slate-300">•</span>
                <span>প্রতিষ্ঠান ফান্ড: <strong className="text-slate-800">{nonMpoCount + contractualCount} জন</strong></span>
              </div>
            </div>

            {/* BLOCK 3: উপস্থিতি ও জনবল হিসাব (Clickable Attendance Cards!) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between hover:border-emerald-200 transition-all">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <h3 className="font-black text-sm text-slate-900">আজকের উপস্থিতি ও জনবল</h3>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>লাইভ</span>
                  </span>
                </div>

                {/* Clickable Matrix */}
                <div className="grid grid-cols-3 gap-2 py-4 text-center">
                  
                  {/* Total Staff */}
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="text-[11px] font-bold text-slate-500">মোট জনবল</div>
                    <div className="text-lg font-black text-slate-900 mt-1">{totalStaffCount} <span className="text-[10px] font-normal text-slate-400">জন</span></div>
                  </div>

                  {/* Clickable: Today Present */}
                  <button
                    onClick={() => {
                      setAttendanceModalTab('present');
                      setIsAttendanceModalOpen(true);
                    }}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100/80 rounded-xl border border-emerald-200 transition-all text-center group cursor-pointer"
                    title="আজকের উপস্থিত শিক্ষকদের তালিকা দেখতে ক্লিক করুন"
                  >
                    <div className="text-[11px] font-bold text-emerald-800 flex items-center justify-center gap-1">
                      <span>আজ উপস্থিত</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-emerald-600" />
                    </div>
                    <div className="text-lg font-black text-emerald-700 mt-1">{todayPresentCount} <span className="text-[10px] font-normal text-emerald-600">জন</span></div>
                  </button>

                  {/* Clickable: Absent / On Leave */}
                  <button
                    onClick={() => {
                      setAttendanceModalTab('absent_leave');
                      setIsAttendanceModalOpen(true);
                    }}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100/80 rounded-xl border border-rose-200 transition-all text-center group cursor-pointer"
                    title="আজকের অনুপস্থিত ও ছুটিতে থাকা তালিকা দেখতে ক্লিক করুন"
                  >
                    <div className="text-[11px] font-bold text-rose-800 flex items-center justify-center gap-1">
                      <span>অনুপস্থিত/ছুটি</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-rose-600" />
                    </div>
                    <div className="text-lg font-black text-rose-700 mt-1">{todayAbsentCount} <span className="text-[10px] font-normal text-rose-600">জন</span></div>
                  </button>

                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">উপস্থিতির হার: <strong className="text-emerald-700 font-bold">{totalStaffCount > 0 ? Math.round((todayPresentCount / totalStaffCount) * 100) : 0}%</strong></span>
                <button
                  onClick={() => {
                    setAttendanceModalTab('present');
                    setIsAttendanceModalOpen(true);
                  }}
                  className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>রেজিস্টার প্রিন্ট/শীট</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>

          </div>

          {/* Collapsible Sanctioned vs Working Table */}
          {showDesignationBreakdown && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-black text-sm text-slate-900">পদবিভিত্তিক অনুমোদিত পদ, কর্মরত ও শূন্যপদের পূর্ণাঙ্গ সারণী</h3>
                </div>
                <button
                  onClick={() => {
                    setSettingsModalTab('designations');
                    setIsSettingsModalOpen(true);
                  }}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>পদবি মাস্টার সেটিংস</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 font-bold text-slate-600 border-b border-slate-200">
                      <th className="py-2.5 px-3">পদবির নাম (বাংলা ও ইংরেজি)</th>
                      <th className="py-2.5 px-3">ক্যাটেগরি</th>
                      <th className="py-2.5 px-3 text-center">অনুমোদিত পদ</th>
                      <th className="py-2.5 px-3 text-center">কর্মরত</th>
                      <th className="py-2.5 px-3 text-center">শূন্যপদ</th>
                      <th className="py-2.5 px-3">বেতন স্কেল</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {designationsList.map((d) => {
                      const working = getWorkingForDesignation(d.id, d.name, d.nameBn);
                      const vacant = Math.max(0, d.sanctionedPosts - working);
                      const catMeta = STAFF_CATEGORY_LABELS[d.category] || STAFF_CATEGORY_LABELS.support_staff;
                      return (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3">
                            <span className="font-bold text-slate-900">{d.nameBn}</span>
                            <span className="text-[11px] text-slate-400 font-mono ml-2">({d.name})</span>
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${catMeta.badgeColor}`}>
                              {catMeta.bn}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-800">{d.sanctionedPosts}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-emerald-600">{working}</td>
                          <td className="py-2.5 px-3 text-center font-bold">
                            <span className={vacant > 0 ? 'text-rose-600' : 'text-slate-400'}>{vacant}</span>
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-500">{d.payGrade || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

      {/* Main Navigation Segmented Tabs */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'directory'
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Users className="w-4 h-4 text-indigo-600" />
          <span>শিক্ষক ও কর্মী ডিরেক্টরি</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
            activeTab === 'directory' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200 text-slate-600'
          }`}>
            {totalStaffCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('allocation')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'allocation'
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>শ্রেণি ও বিষয় শিক্ষক বণ্টন (Teacher Allocation)</span>
        </button>

        <button
          onClick={() => setActiveTab('payroll')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'payroll'
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <DollarSign className="w-4 h-4 text-emerald-600" />
          <span>মাসিক বেতন শিট ও পে-রোল (Payroll)</span>
        </button>

        <button
          onClick={() => setActiveTab('id_card')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'id_card'
              ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <CreditCard className="w-4 h-4 text-indigo-600" />
          <span>স্মার্ট পরিচয়পত্র প্রিন্ট (ID Card Studio)</span>
        </button>
      </div>

      {/* TAB 1: STAFF DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          
          {/* Enhanced Filters & Search Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            
            {/* Filter Pills with Counts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {[
                { id: 'all', label: 'সকল', count: totalStaffCount },
                { id: 'teaching', label: 'শিক্ষক', count: teachingCount },
                { id: 'non_teaching', label: 'কর্মচারী', count: nonTeachingCount },
                { id: 'mpo', label: 'এমপিওভুক্ত', count: mpoCount },
                { id: 'non_mpo', label: 'নন-এমপিও', count: totalStaffCount - mpoCount },
                { id: 'incomplete', label: 'অসম্পূর্ণ প্রোফাইল', count: incompleteCount, alert: incompleteCount > 0 },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id as any)}
                  className={`px-3 py-1.5 text-xs rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    filterType === f.id
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                      : f.alert 
                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100/80 border border-amber-200/80' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    filterType === f.id ? 'bg-white/20 text-white' : 'bg-white/60 text-slate-500'
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Department Dropdown, Search and Layout Toggle */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Department filter */}
              {departments.length > 0 && (
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
                >
                  <option value="all">সকল বিভাগ / বিষয়</option>
                  {departments.map((dept, idx) => (
                    <option key={idx} value={dept}>{dept}</option>
                  ))}
                </select>
              )}

              {/* Search Bar with Clear Button */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="নাম, পদবি বা আইডি খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Table / Grid Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'table' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="টেবিল ভিউ"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`p-1.5 rounded-lg transition-all ${
                    viewMode === 'cards' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="কার্ড ভিউ"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>

          {/* TABLE VIEW WITH VIRTUALIZATION */}
          {viewMode === 'table' ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
              {filteredStaff.length > 15 && (
                <div className="flex items-center justify-between px-5 py-2 bg-slate-50/80 border-b border-slate-200/60 text-xs">
                  <div className="flex items-center gap-2 text-slate-600 font-medium">
                    <span>মোট শিক্ষক/কর্মচারী: <strong className="text-slate-900">{filteredStaff.length}</strong> জন</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-[11px] font-semibold">
                    <Zap className="w-3 h-3 text-emerald-600 fill-emerald-600 animate-pulse" />
                    <span>ভার্চুয়ালাইজড ইঞ্জিন সক্রিয় (৬০ FPS দ্রুত স্ক্রোলিং)</span>
                  </div>
                </div>
              )}
              <VirtualizedTable<StaffMember>
                items={filteredStaff}
                colSpan={7}
                estimatedRowHeight={72}
                maxHeight="650px"
                virtualizationThreshold={15}
                header={
                  <tr className="bg-slate-50/90 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <th className="p-3.5 pl-5">শিক্ষক/কর্মচারী</th>
                    <th className="p-3.5">পদবি ও বিষয়</th>
                    <th className="p-3.5">ক্যাটেগরি ও এমপিও</th>
                    <th className="p-3.5">যোগাযোগ</th>
                    <th className="p-3.5">প্রোফাইল অডিট</th>
                    <th className="p-3.5 text-center">এমপিও / লক গার্ড</th>
                    <th className="p-3.5 pr-5 text-right">অ্যাকশন</th>
                  </tr>
                }
                renderRow={(member) => {
                  const completion = member.profileCompletion || 0;
                  const isLocked = completion < 100;
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/80 transition-colors group">
                      
                      {/* Member Name + Photo + Custom ID */}
                      <td className="p-3.5 pl-5">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            {member.photo ? (
                              <img
                                src={member.photo}
                                alt={member.name}
                                className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-100"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black flex items-center justify-center text-sm">
                                {member.name.charAt(0)}
                              </div>
                            )}
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                              member.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                            }`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm block truncate group-hover:text-indigo-600 transition-colors">
                                {member.nameBn || member.name}
                              </span>
                              {member.bloodGroup && (
                                <span className="px-1.5 py-0.2 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[9px] font-bold">
                                  {member.bloodGroup}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                              <span className="font-mono text-indigo-600 font-semibold bg-indigo-50 px-1.5 py-0.2 rounded text-[10px]">
                                {member.customStaffId}
                              </span>
                              {member.pdsId && (
                                <span className="font-mono text-slate-500 text-[10px]">
                                  PDS: {member.pdsId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Designation */}
                      <td className="p-3.5">
                        <span className="font-bold text-slate-800 text-xs block">
                          {member.designationBn || member.designation}
                        </span>
                        {member.subject ? (
                          <span className="text-[11px] text-slate-500 font-medium">
                            বিষয়: {member.subject}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">সাধারণ শাখা</span>
                        )}
                      </td>

                      {/* Type & MPO */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                            member.staffType === 'teaching'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {member.staffType === 'teaching' ? 'শিক্ষক' : 'কর্মচারী'}
                          </span>
                          <span className={`block text-[10px] font-medium ${
                            member.employmentType === 'mpo' ? 'text-sky-600 font-semibold' : 'text-slate-500'
                          }`}>
                            {member.employmentType === 'mpo' ? 'সরকারি এমপিও' : 'নন-এমপিও (প্রতিষ্ঠান)'}
                          </span>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="p-3.5">
                        <div className="space-y-0.5 text-[11px]">
                          <span className="font-mono text-slate-800 font-medium block">
                            {member.mobile || member.contact || '-'}
                          </span>
                          <span className="text-slate-400 block truncate max-w-[150px]">
                            {member.email || '-'}
                          </span>
                        </div>
                      </td>

                      {/* Profile Completion Bar */}
                      <td className="p-3.5">
                        <div className="w-28 space-y-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className={completion >= 100 ? 'text-emerald-600' : 'text-amber-600'}>
                              {completion}%
                            </span>
                            <span className="text-slate-400 text-[9px] font-normal">
                              {completion >= 100 ? 'সম্পূর্ণ' : 'বাকি আছে'}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
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
                      </td>

                      {/* Mandatory Lock Action Indicator */}
                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleTriggerLockCheck(member, 'এমপিও আবেদন ও ইনক্রিমেন্ট')}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg flex items-center justify-center gap-1 mx-auto transition-all ${
                            isLocked
                              ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 shadow-xs cursor-pointer'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 shadow-xs cursor-pointer'
                          }`}
                          title={isLocked ? 'প্রোফাইল অসম্পূর্ণ লক রয়েছে' : 'আবেদন করার জন্য প্রস্তুত'}
                        >
                          {isLocked ? (
                            <>
                              <Lock className="w-3 h-3 text-amber-600" />
                              <span>লক রয়েছে</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>প্রস্তুত</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 pr-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedStaffForProfile(member)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="পূর্ণাঙ্গ প্রোফাইল / সিভি"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditStaff(member, 1)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="প্রোফাইল সম্পাদনা"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(member.id, member.nameBn || member.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="মুছুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                }}
                emptyState={
                  <div className="p-12 text-center text-slate-400 space-y-3">
                    <Users className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
                    <p className="text-sm font-bold text-slate-700">কোন শিক্ষক বা কর্মচারীর তথ্য পাওয়া যায়নি।</p>
                    <p className="text-xs text-slate-500">ফিল্টার পরিবর্তন করে চেষ্টা করুন অথবা নতুন শিক্ষক যুক্ত করুন।</p>
                    <button
                      onClick={handleOpenEnrollment}
                      className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors inline-block cursor-pointer"
                    >
                      + নতুন শিক্ষক এনরোল করুন
                    </button>
                  </div>
                }
              />
            </div>
          ) : (
            /* MODERN CARD GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStaff.map((member) => {
                const completion = member.profileCompletion || 0;
                const isLocked = completion < 100;
                return (
                  <div
                    key={member.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex items-start gap-3.5">
                        <div className="relative shrink-0">
                          {member.photo ? (
                            <img
                              src={member.photo}
                              alt={member.name}
                              className="w-14 h-14 rounded-2xl object-cover border border-slate-200 bg-slate-100"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xl">
                              {member.name.charAt(0)}
                            </div>
                          )}
                          <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                            member.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              member.staffType === 'teaching' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {member.staffType === 'teaching' ? 'শিক্ষক' : 'কর্মচারী'}
                            </span>
                            {member.bloodGroup && (
                              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                {member.bloodGroup}
                              </span>
                            )}
                          </div>
                          
                          <h4 className="font-bold text-slate-900 text-sm truncate mt-1">
                            {member.nameBn || member.name}
                          </h4>
                          <p className="text-xs text-slate-600 font-medium truncate">
                            {member.designationBn || member.designation}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 font-mono text-[10px] text-slate-400">
                            <span className="text-indigo-600 font-semibold">{member.customStaffId}</span>
                            {member.pdsId && <span>• PDS: {member.pdsId}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Meta Tags */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        {member.mobile && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-mono text-slate-800">{member.mobile}</span>
                          </div>
                        )}
                        {member.subject && (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">বিষয়: {member.subject}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Completion bar & Footer Actions */}
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-500">প্রোফাইল অডিট</span>
                          <span className={completion >= 100 ? 'text-emerald-600' : 'text-amber-600'}>
                            {completion}% {completion >= 100 ? '✓' : ''}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              completion >= 100 ? 'bg-emerald-500' : completion >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => handleTriggerLockCheck(member, 'এমপিও / ইনক্রিমেন্ট')}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 transition-all ${
                            isLocked 
                              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {isLocked ? <Lock className="w-3 h-3 text-amber-600" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          <span>{isLocked ? 'লক চেক' : 'প্রস্তুত'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedStaffForProfile(member)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="পূর্ণাঙ্গ প্রোফাইল"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditStaff(member, 1)}
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="সম্পাদনা"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* TAB 2: TEACHER ALLOCATION */}
      {activeTab === 'allocation' && <TeacherAllocationTab />}

      {/* TAB 3: PAYROLL MANAGEMENT */}
      {activeTab === 'payroll' && <PayrollManagementTab />}

      {/* TAB 4: ID CARD PRINT */}
      {activeTab === 'id_card' && <StaffIdCardTab />}

      {/* MODAL 1: FULL BIO-DATA / PROFILE VIEW */}
      {selectedStaffForProfile && (
        <StaffProfileModal
          isOpen={!!selectedStaffForProfile}
          staff={selectedStaffForProfile}
          onClose={() => setSelectedStaffForProfile(null)}
          onEdit={(staff) => {
            setSelectedStaffForProfile(null);
            handleEditStaff(staff, 1);
          }}
        />
      )}

      {/* MODAL 2: PROGRESSIVE ENROLLMENT / EDIT WIZARD */}
      {isFormModalOpen && (
        <StaffFormModal
          isOpen={isFormModalOpen}
          staffToEdit={selectedStaffForEdit}
          initialStep={formInitialStep}
          onClose={() => {
            setIsFormModalOpen(false);
            setSelectedStaffForEdit(null);
          }}
          onSave={handleSaveStaff}
        />
      )}

      {/* MODAL 3: MANDATORY PROFILE LOCK MODAL */}
      {isLockModalOpen && selectedStaffForLockCheck && (
        <MandatoryProfileLockModal
          isOpen={isLockModalOpen}
          staff={selectedStaffForLockCheck}
          actionTitle={lockActionTitle}
          onClose={() => {
            setIsLockModalOpen(false);
            setSelectedStaffForLockCheck(null);
          }}
          onProceedToEdit={(staff) => {
            setIsLockModalOpen(false);
            handleEditStaff(staff, 2);
          }}
        />
      )}

      {/* MODAL 4: STAFF ATTENDANCE TRACKER & LOGS */}
      <StaffAttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={() => setIsAttendanceModalOpen(false)}
        initialTab={attendanceModalTab}
      />

      {/* MODAL 5: DESIGNATION & SUBJECT MASTER SETTINGS */}
      <StaffDesignationSubjectSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        initialTab={settingsModalTab}
      />

      {/* MODAL 6: OFFICIAL STAFF & VACANCY REPORTS */}
      <StaffReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType={reportModalType}
      />

    </div>
  );
};

export default HumanResources;

