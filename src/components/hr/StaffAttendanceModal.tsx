import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { StaffMember } from '../../types';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db/database';
import { markAttendance, bulkMarkAttendance } from '../../services/hrService';
import { AttendanceStatus } from '../../types/staffHr';

import { 
  X, CheckCircle2, XCircle, Clock, Search, 
  Printer, Download, UserCheck, AlertTriangle, 
  Calendar, Building, Filter, Edit2
} from 'lucide-react';

interface StaffAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'present' | 'absent_leave';
}

export const StaffAttendanceModal: React.FC<StaffAttendanceModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'present'
}) => {
  const { staff, institution } = useAppStore();
  const [activeTab, setActiveTab] = useState<'present' | 'absent_leave' | 'unmarked' | 'monthly'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'teaching' | 'non_teaching'>('all');
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<'present' | 'absent' | 'leave'>('present');
  const [newInTime, setNewInTime] = useState('08:45 AM');
  const [newReason, setNewReason] = useState('');
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const attendanceRecords = useLiveQuery(() => db.staffAttendance.where('date').equals(selectedDate).toArray(), [selectedDate]);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const monthStart = `${selectedMonth}-01`;
  const monthEnd = `${selectedMonth}-31`;
  const monthlyRecords = useLiveQuery(() => db.staffAttendance.where('date').between(monthStart, monthEnd, true, true).toArray(), [selectedMonth]);


  if (!isOpen) return null;

  const staffList = staff || [];
  const todayDate = new Date(selectedDate).toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Helper to determine status from real database
  const getAttendanceStatus = (s: StaffMember): { status: 'unmarked' | 'present' | 'absent' | 'leave'; inTime?: string; reason?: string } => {
    const rec = (attendanceRecords || []).find(r => r.staffId === s.id);
    if (rec) {
      return {
        status: rec.status as any,
        inTime: rec.inTime,
        reason: rec.correctionReason
      };
    }
    return { status: 'unmarked' };
  };

  const presentStaff = staffList.filter(s => getAttendanceStatus(s).status === 'present');
  const absentStaff = staffList.filter(s => {
    const st = getAttendanceStatus(s).status;
    return st === 'absent' || st === 'leave';
  });
  const unmarkedStaff = staffList.filter(s => getAttendanceStatus(s).status === 'unmarked');

  const currentList = activeTab === 'present' ? presentStaff : (activeTab === 'absent_leave' ? absentStaff : unmarkedStaff);

  const filteredList = currentList.filter(s => {
    if (filterType === 'teaching' && s.staffType !== 'teaching') return false;
    if (filterType === 'non_teaching' && s.staffType !== 'non_teaching') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        (s.nameBn && s.nameBn.includes(q)) ||
        (s.customStaffId && s.customStaffId.toLowerCase().includes(q)) ||
        (s.pdsId && s.pdsId.toLowerCase().includes(q)) ||
        (s.designation && s.designation.toLowerCase().includes(q)) ||
        (s.designationBn && s.designationBn.includes(q)) ||
        (s.mobile && s.mobile.includes(q))
      );
    }
    return true;
  });

  const handleSaveAttendance = async (staffId: string) => {
    try {
      await markAttendance(
        staffId,
        selectedDate,
        newStatus as AttendanceStatus,
        newStatus === 'present' ? newInTime : '',
        '',
        'manual',
        'admin',
        newStatus !== 'present' ? newReason : ''
      );
      setEditingStaffId(null);
    } catch (e) {
      alert(e);
    }
  };
  
  const handleBulkMarkPresent = async () => {
    try {
      const records = unmarkedStaff.map(s => ({
        staffId: s.id,
        status: 'present' as AttendanceStatus,
        inTime: '08:45 AM'
      }));
      await bulkMarkAttendance(records, selectedDate, 'admin');
    } catch (e) {
      alert(e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['ক্রমিক', 'আইডি', 'PDS নম্বর', 'নাম (বাংলা)', 'নাম (ইংরেজি)', 'পদবি', 'ধরণ', 'উপস্থিতি স্ট্যাটাস', 'প্রবেশের সময় / ছুটির কারণ', 'মোবাইল'];
    const rows = filteredList.map((s, idx) => {
      const att = getAttendanceStatus(s);
      return [
        idx + 1,
        `"${s.customStaffId || ''}"`,
        `"${s.pdsId || ''}"`,
        `"${(s.nameBn || s.name || '').replace(/"/g, '""')}"`,
        `"${(s.name || '').replace(/"/g, '""')}"`,
        `"${(s.designationBn || s.designation || '').replace(/"/g, '""')}"`,
        `"${s.staffType === 'teaching' ? 'শিক্ষক' : 'কর্মচারী'}"`,
        `"${att.status === 'present' ? 'উপস্থিত' : att.status === 'leave' ? 'ছুটি' : 'অনুপস্থিত'}"`,
        `"${(att.inTime || att.reason || '').replace(/"/g, '""')}"`,
        `"${s.mobile || ''}"`
      ];
    });

    const titlePrefix = activeTab === 'present' ? 'উপস্থিত_শিক্ষক_কর্মচারী_তালিকা' : 'অনুপস্থিত_ও_ছুটি_তালিকা';
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${titlePrefix}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl my-auto flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        {activeTab === 'unmarked' && unmarkedStaff.length > 0 && (
          <div className="px-6 py-3 bg-indigo-50/50 border-b border-indigo-100 flex justify-between items-center">
            <span className="text-sm font-medium text-indigo-800">আজকের {unmarkedStaff.length} জনের হাজিরা বাকি আছে।</span>
            <button onClick={handleBulkMarkPresent} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700">সবাইকে 'উপস্থিত' মার্ক করুন</button>
          </div>
        )}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-slate-50">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
              <Building className="w-3.5 h-3.5" />
              <span>{institution?.nameBn || institution?.name || 'বিদ্যালয়'}</span>
              <span className="text-slate-300">•</span>
              <span>EIIN: {institution?.eiin || '105820'}</span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                শিক্ষক-কর্মচারী দৈনিক উপস্থিতি রেজিস্টার
              </h2>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Calendar className="w-3 h-3 mr-1 text-indigo-500" />
                {todayDate}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              title="রিপোর্ট প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>প্রিন্ট</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
              title="সিএসভি ফাইল ডাউনলোড করুন"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>ডাউনলোড</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher & Metrics Banner */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-200/70 p-1 rounded-2xl w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('present')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'present'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>আজকে উপস্থিত ({presentStaff.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('absent_leave')}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                activeTab === 'absent_leave'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>অনুপস্থিত ও ছুটি ({absentStaff.length})</span>
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="নাম, পদবি বা মোবাইল..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <select
              value={filterType}
              onChange={(e: any) => setFilterType(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-slate-700"
            >
              <option value="all">সকল ক্যাটাগরি</option>
              <option value="teaching">শিক্ষকবৃন্দ</option>
              <option value="non_teaching">কর্মচারীবৃন্দ</option>
            </select>
          </div>
        </div>

        {/* Modal Body / Table */}
        <div className="flex-1 overflow-y-auto p-5" id="printable-attendance-area">
          
          {/* Print Letterhead (Hidden on screen, shown in print) */}
          <div className="hidden print:block mb-6 text-center border-b-2 border-slate-900 pb-4">
            <h1 className="text-2xl font-black text-slate-900">{institution?.nameBn || institution?.name || 'বিদ্যালয়'}</h1>
            <p className="text-xs text-slate-600">
              EIIN: {institution?.eiin || '105820'} | স্থাপিত: {institution?.establishedYear || '১৯৯৫'} | {institution?.district || 'ঢাকা'}
            </p>
            <div className="mt-2 text-sm font-bold text-slate-900 underline">
              {activeTab === 'present' ? 'আজকের উপস্থিত শিক্ষক-কর্মচারীদের তালিকা' : 'আজকের অনুপস্থিত ও ছুটিতে থাকা শিক্ষক-কর্মচারীদের তালিকা'}
            </div>
            <p className="text-xs text-slate-500 mt-1">তারিখ: {todayDate}</p>
          </div>

          {filteredList.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
                <UserCheck className="w-7 h-7" />
              </div>
              <p className="text-sm font-bold text-slate-700">কোনো শিক্ষক/কর্মচারী পাওয়া যায়নি</p>
              <p className="text-xs text-slate-500 mt-1">অনুসন্ধানের তথ্য বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">শিক্ষক / কর্মচারীর বিবরণ</th>
                    <th className="py-3 px-4">পদবি ও বিষয়</th>
                    <th className="py-3 px-4">যোগাযোগ</th>
                    <th className="py-3 px-4">উপস্থিতি স্ট্যাটাস</th>
                    <th className="py-3 px-4">প্রবেশের সময় / কারণ</th>
                    <th className="py-3 px-4 text-right print:hidden">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {filteredList.map((member, index) => {
                    const att = getAttendanceStatus(member);
                    const isEditing = editingStaffId === member.id;

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 text-center font-bold text-slate-400 text-xs">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 overflow-hidden">
                              {member.photo ? (
                                <img src={member.photo} alt="" className="w-full h-full object-cover" />
                              ) : (
                                (member.name || 'S').charAt(0)
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">
                                {member.nameBn || member.name}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                <span>ID: {member.customStaffId}</span>
                                {member.pdsId && (
                                  <>
                                    <span className="text-slate-300">•</span>
                                    <span className="font-mono text-indigo-600 font-medium">PDS: {member.pdsId}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800">
                            {member.designationBn || member.designation}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {member.subject ? `বিষয়: ${member.subject}` : member.staffType === 'teaching' ? 'একাডেমিক শিক্ষক' : 'সহায়ক প্রশাসন'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                          {member.mobile || member.contact || '—'}
                        </td>
                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            <select
                              value={newStatus}
                              onChange={(e: any) => setNewStatus(e.target.value)}
                              className="px-2.5 py-1 text-xs bg-white border border-indigo-300 rounded-lg focus:outline-none"
                            >
                              <option value="present">উপস্থিত (Present)</option>
                              <option value="absent">অনুপস্থিত (Absent)</option>
                              <option value="leave">ছুটি (On Leave)</option>
                            </select>
                          ) : (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              att.status === 'unmarked'
                                ? 'bg-slate-100 text-slate-500 border border-slate-200'
                                : att.status === 'present'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : att.status === 'leave'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                att.status === 'present' ? 'bg-emerald-500' : att.status === 'leave' ? 'bg-amber-500' : 'bg-rose-500'
                              }`}></span>
                              <span>{att.status === 'unmarked' ? 'খালি' : att.status === 'present' ? 'উপস্থিত' : att.status === 'leave' ? 'ছুটি' : 'অনুপস্থিত'}</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          {isEditing ? (
                            newStatus === 'present' ? (
                              <input
                                type="text"
                                value={newInTime}
                                onChange={(e) => setNewInTime(e.target.value)}
                                placeholder="e.g. 08:45 AM"
                                className="px-2 py-1 text-xs border border-slate-300 rounded-lg w-28 font-mono"
                              />
                            ) : (
                              <input
                                type="text"
                                value={newReason}
                                onChange={(e) => setNewReason(e.target.value)}
                                placeholder="ছুটির কারণ বা মন্তব্য..."
                                className="px-2 py-1 text-xs border border-slate-300 rounded-lg w-40"
                              />
                            )
                          ) : (
                            <div className="text-xs text-slate-600 flex items-center gap-1">
                              {att.status === 'present' && <Clock className="w-3.5 h-3.5 text-emerald-500" />}
                              <span>{att.status === 'present' ? (att.inTime || '০৮:৪৫ AM') : (att.reason || 'উল্লেখ নেই')}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right print:hidden">
                          {isEditing ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleSaveAttendance(member.id)}
                                className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs"
                              >
                                সংরক্ষণ
                              </button>
                              <button
                                onClick={() => setEditingStaffId(null)}
                                className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                              >
                                বাতিল
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingStaffId(member.id);
                                setNewStatus(att.status === 'unmarked' ? 'present' : att.status);
                                setNewInTime(att.inTime || '08:45 AM');
                                setNewReason(att.reason || '');
                              }}
                              className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 border border-indigo-200 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>পরিবর্তন</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {/* Signature section for Print */}
          <div className="hidden print:grid grid-cols-3 gap-8 mt-16 pt-8 text-center text-xs text-slate-700">
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold">অফিস সহকারী / রেজিস্টার রক্ষক</div>
              <div className="text-[10px] text-slate-500">স্বাক্ষর ও তারিখ</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold">সহকারী প্রধান শিক্ষক</div>
              <div className="text-[10px] text-slate-500">স্বাক্ষর ও তারিখ</div>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1 font-bold">প্রধান শিক্ষক / অধ্যক্ষ</div>
              <div className="text-[10px] text-slate-500">স্বাক্ষর ও সিল</div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>মোট উপস্থিত: <strong className="text-slate-800">{presentStaff.length}</strong> জন</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>অনুপস্থিত/ছুটি: <strong className="text-slate-800">{absentStaff.length}</strong> জন</span>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all shadow-xs"
          >
            বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
