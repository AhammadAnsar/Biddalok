import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ClassTeacherAssignment, SubjectTeacherAssignment } from '../../types';
import { 
  Users, BookOpen, UserCheck, Plus, Trash2, Edit3, 
  Search, Filter, CheckCircle2, AlertCircle, Calendar, 
  Layers, School, Check, X, DoorClosed, Clock, ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

export const TeacherAllocationTab: React.FC = () => {
  const { 
    staff, 
    academicClasses, 
    academicSections,
    classTeacherAssignments, 
    subjectTeacherAssignments,
    addClassTeacherAssignment,
    deleteClassTeacherAssignment,
    addSubjectTeacherAssignment,
    deleteSubjectTeacherAssignment,
    academicSessions,
    curriculumMappings,
    subjects
  } = useAppStore();

  const [activeSubTab, setActiveSubTab] = useState<'class_teacher' | 'subject_teacher'>('class_teacher');
  const [selectedSession, setSelectedSession] = useState(
    academicSessions?.find(s => s.isDefault)?.name || '2026'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');

  // Modals
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  // Form State - Class Teacher
  const [classFormData, setClassFormData] = useState({
    classId: '',
    sectionId: '',
    teacherId: '',
    roomNo: '',
    remarks: ''
  });

  // Form State - Subject Teacher
  const [subjectFormData, setSubjectFormData] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    subjectName: '',
    teacherId: '',
    periodsPerWeek: 5,
    roomNo: ''
  });

  const teachingStaff = (staff || []).filter(s => s.staffType === 'teaching' && s.status === 'active');

  const classCurriculumSubjects = React.useMemo(() => {
    if (!subjectFormData.classId) return [];
    const cls = academicClasses?.find(c => c.id === subjectFormData.classId);
    const clsName = cls?.name || '';
    const fromCurriculum = (curriculumMappings || []).filter(
      m => m.classId === subjectFormData.classId || m.className.toLowerCase() === clsName.toLowerCase()
    );
    if (fromCurriculum.length > 0) {
      return fromCurriculum.map(m => ({
        id: m.id,
        code: m.subjectCode,
        name: m.name,
        nameBn: m.nameBn || m.name
      }));
    }
    return (subjects || [])
      .filter(s => s.classId === subjectFormData.classId || s.className.toLowerCase() === clsName.toLowerCase())
      .map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
        nameBn: s.nameBn || s.name
      }));
  }, [subjectFormData.classId, academicClasses, curriculumMappings, subjects]);

  // Handle Class Teacher Assignment Submit
  const handleSaveClassTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classFormData.classId || !classFormData.teacherId) {
      toast.error('অনুগ্রহ করে শ্রেণি ও শ্রেণি শিক্ষক নির্বাচন করুন');
      return;
    }

    const cls = (academicClasses || []).find(c => c.id === classFormData.classId);
    const sec = (academicSections || []).find(s => s.id === classFormData.sectionId);
    const teacher = (staff || []).find(t => t.id === classFormData.teacherId);

    const newAssignment: ClassTeacherAssignment = {
      id: `cta_${Date.now()}`,
      academicYear: selectedSession,
      classId: classFormData.classId,
      className: cls?.name || '',
      classNameBn: cls?.nameBn || cls?.name || '',
      sectionId: classFormData.sectionId || undefined,
      sectionName: sec?.name || undefined,
      sectionNameBn: sec?.nameBn || sec?.name || undefined,
      teacherId: classFormData.teacherId,
      teacherCustomId: teacher?.customStaffId || teacher?.pdsId,
      teacherName: teacher?.name || '',
      teacherNameBn: teacher?.nameBn || teacher?.name || '',
      teacherDesignation: teacher?.designationBn || teacher?.designation || '',
      roomNo: classFormData.roomNo || undefined,
      assignedDate: new Date().toISOString().split('T')[0],
      status: 'active'
    };

    addClassTeacherAssignment(newAssignment);
    toast.success('শ্রেণি শিক্ষক সফলভাবে যুক্ত করা হয়েছে');
    setIsClassModalOpen(false);
    setClassFormData({ classId: '', sectionId: '', teacherId: '', roomNo: '', remarks: '' });
  };

  // Handle Subject Teacher Assignment Submit
  const handleSaveSubjectTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectFormData.classId || !subjectFormData.subjectName || !subjectFormData.teacherId) {
      toast.error('অনুগ্রহ করে শ্রেণি, বিষয় ও শিক্ষক নির্বাচন করুন');
      return;
    }

    const cls = (academicClasses || []).find(c => c.id === subjectFormData.classId);
    const sec = (academicSections || []).find(s => s.id === subjectFormData.sectionId);
    const teacher = (staff || []).find(t => t.id === subjectFormData.teacherId);

    const newAssignment: SubjectTeacherAssignment = {
      id: `sta_${Date.now()}`,
      academicYear: selectedSession,
      classId: subjectFormData.classId,
      className: cls?.name || '',
      classNameBn: cls?.nameBn || cls?.name || '',
      sectionId: subjectFormData.sectionId || undefined,
      sectionName: sec?.name || undefined,
      sectionNameBn: sec?.nameBn || sec?.name || undefined,
      subjectId: subjectFormData.subjectId || `sub_${Date.now()}`,
      subjectName: subjectFormData.subjectName,
      subjectNameBn: subjectFormData.subjectName,
      teacherId: subjectFormData.teacherId,
      teacherCustomId: teacher?.customStaffId || teacher?.pdsId,
      teacherName: teacher?.name || '',
      teacherNameBn: teacher?.nameBn || teacher?.name || '',
      periodsPerWeek: Number(subjectFormData.periodsPerWeek) || 5,
      roomNo: subjectFormData.roomNo || undefined,
      status: 'active'
    };

    addSubjectTeacherAssignment(newAssignment);
    toast.success('বিষয় শিক্ষক সফলভাবে যুক্ত করা হয়েছে');
    setIsSubjectModalOpen(false);
    setSubjectFormData({ classId: '', sectionId: '', subjectId: '', subjectName: '', teacherId: '', periodsPerWeek: 5, roomNo: '' });
  };

  const currentClassAssignments = (classTeacherAssignments || []).filter(
    a => a.academicYear === selectedSession
  );

  const currentSubjectAssignments = (subjectTeacherAssignments || []).filter(
    a => a.academicYear === selectedSession
  );

  // Filtered lists based on search & class
  const filteredClassAssignments = currentClassAssignments.filter(a => {
    if (selectedClassFilter !== 'all' && a.classId !== selectedClassFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.className.toLowerCase().includes(q) ||
        (a.classNameBn && a.classNameBn.includes(q)) ||
        a.teacherName.toLowerCase().includes(q) ||
        (a.teacherNameBn && a.teacherNameBn.includes(q)) ||
        (a.roomNo && a.roomNo.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredSubjectAssignments = currentSubjectAssignments.filter(a => {
    if (selectedClassFilter !== 'all' && a.classId !== selectedClassFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.className.toLowerCase().includes(q) ||
        (a.classNameBn && a.classNameBn.includes(q)) ||
        a.subjectName.toLowerCase().includes(q) ||
        (a.subjectNameBn && a.subjectNameBn.includes(q)) ||
        a.teacherName.toLowerCase().includes(q) ||
        (a.teacherNameBn && a.teacherNameBn.includes(q))
      );
    }
    return true;
  });

  const totalClassesCount = (academicClasses || []).length;
  const assignedClassesCount = new Set(currentClassAssignments.map(a => a.classId)).size;
  const totalWeeklyPeriods = currentSubjectAssignments.reduce((sum, a) => sum + (a.periodsPerWeek || 0), 0);

  return (
    <div className="space-y-5">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <span>শিক্ষক বণ্টন ও দায়িত্ব ব্যবস্থাপনা (Teacher Allocation)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            প্রতিটি শ্রেণি ও শাখার জন্য ক্লাস শিক্ষক এবং বিষয়ভিত্তিক শিক্ষক ও সাপ্তাহিক পিরিয়ড লোড নির্ধারণ।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Academic Session Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500 font-medium">শিক্ষাবর্ষ:</span>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {(academicSessions || [{ name: '2026' }]).map(s => (
                <option key={s.id || s.name} value={s.name}>
                  {s.name} শিক্ষাবর্ষ
                </option>
              ))}
            </select>
          </div>

          {activeSubTab === 'class_teacher' ? (
            <button
              onClick={() => setIsClassModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>শ্রেণি শিক্ষক অ্যাসাইন</span>
            </button>
          ) : (
            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>বিষয় শিক্ষক অ্যাসাইন</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">শ্রেণি শিক্ষক নির্ধারিত</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {assignedClassesCount} / {totalClassesCount || 1} <span className="text-xs font-normal text-slate-500">শ্রেণি</span>
            </div>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <School className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">মোট বিষয় শিক্ষক বণ্টন</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {currentSubjectAssignments.length} <span className="text-xs font-normal text-slate-500">অ্যাসাইনমেন্ট</span>
            </div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500">সাপ্তাহিক মোট ক্লাস পিরিয়ড</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalWeeklyPeriods} <span className="text-xs font-normal text-slate-500">পিরিয়ড / সপ্তাহ</span>
            </div>
          </div>
          <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl border border-sky-100">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub-tab Navigation & Search */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 w-full md:w-auto">
          <button
            onClick={() => setActiveSubTab('class_teacher')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all ${
              activeSubTab === 'class_teacher'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>শ্রেণি শিক্ষক বণ্টন ({currentClassAssignments.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('subject_teacher')}
            className={`px-3.5 py-2 text-xs font-bold rounded-lg flex items-center gap-2 transition-all ${
              activeSubTab === 'subject_teacher'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>বিষয়ভিত্তিক শিক্ষক বণ্টন ({currentSubjectAssignments.length})</span>
          </button>
        </div>

        {/* Filter by class & search */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          {(academicClasses || []).length > 0 && (
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700 font-medium"
            >
              <option value="all">সকল শ্রেণি</option>
              {(academicClasses || []).map(c => (
                <option key={c.id} value={c.id}>{c.nameBn || c.name}</option>
              ))}
            </select>
          )}

          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="শিক্ষক বা শ্রেণি দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: CLASS TEACHERS */}
      {activeSubTab === 'class_teacher' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          {filteredClassAssignments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 pl-5">শ্রেণি ও শাখা</th>
                    <th className="p-3.5">নির্ধারিত শ্রেণি শিক্ষক (Class Teacher)</th>
                    <th className="p-3.5">পদবি ও মূল বিষয়</th>
                    <th className="p-3.5">রুম নম্বর</th>
                    <th className="p-3.5">অ্যাসাইন তারিখ</th>
                    <th className="p-3.5 pr-5 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClassAssignments.map((item) => {
                    const staffDetails = staff.find(s => s.id === item.teacherId);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 pl-5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">
                              {item.classNameBn || item.className}
                            </span>
                            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-md text-[10px] font-bold">
                              {item.sectionNameBn || item.sectionName || 'সাধারণ শাখা'}
                            </span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            {staffDetails?.photo ? (
                              <img src={staffDetails.photo} alt={item.teacherName} className="w-9 h-9 rounded-xl object-cover border border-slate-200 bg-slate-100" />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-black flex items-center justify-center text-xs">
                                {item.teacherName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">{item.teacherNameBn || item.teacherName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">আইডি: {staffDetails?.customStaffId || '-'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 text-slate-600">
                          <span className="font-medium block">{item.teacherDesignation || staffDetails?.designationBn || '-'}</span>
                          <span className="text-[10px] text-slate-400">{staffDetails?.subject || 'সাধারণ'}</span>
                        </td>

                        <td className="p-3.5">
                          {item.roomNo ? (
                            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold">
                              {item.roomNo}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>

                        <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                          {item.assignedDate || '-'}
                        </td>

                        <td className="p-3.5 pr-5 text-right">
                          <button
                            onClick={() => {
                              if (confirm('আপনি কি এই শ্রেণি শিক্ষকের দায়িত্ব প্রত্যাহার করতে চান?')) {
                                deleteClassTeacherAssignment(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="দায়িত্ব প্রত্যাহার"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <UserCheck className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-bold text-slate-700">{selectedSession} শিক্ষাবর্ষে কোনো ক্লাস শিক্ষক বণ্টন পাওয়া যায়নি।</p>
              <button
                onClick={() => setIsClassModalOpen(true)}
                className="px-4 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors inline-block"
              >
                + ক্লাস শিক্ষক অ্যাসাইন করুন
              </button>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: SUBJECT TEACHERS */}
      {activeSubTab === 'subject_teacher' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          {filteredSubjectAssignments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3.5 pl-5">শ্রেণি ও শাখা</th>
                    <th className="p-3.5">নির্ধারিত বিষয় (Subject)</th>
                    <th className="p-3.5">বিষয় শিক্ষক (Teacher)</th>
                    <th className="p-3.5">সাপ্তাহিক পিরিয়ড লোড</th>
                    <th className="p-3.5">রুম নম্বর</th>
                    <th className="p-3.5 pr-5 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSubjectAssignments.map((item) => {
                    const staffDetails = staff.find(s => s.id === item.teacherId);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 pl-5">
                          <span className="font-bold text-slate-900 text-sm block">
                            {item.classNameBn || item.className}
                          </span>
                          {item.sectionNameBn && (
                            <span className="text-[10px] text-slate-500 font-medium">
                              শাখা: {item.sectionNameBn}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5">
                          <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 inline-block text-xs">
                            {item.subjectNameBn || item.subjectName}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            {staffDetails?.photo ? (
                              <img src={staffDetails.photo} alt={item.teacherName} className="w-8 h-8 rounded-xl object-cover border border-slate-200 bg-slate-100" />
                            ) : (
                              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 font-black flex items-center justify-center text-xs">
                                {item.teacherName.charAt(0)}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-slate-900 block text-xs">{item.teacherNameBn || item.teacherName}</span>
                              <span className="text-[10px] text-slate-400 font-medium">{staffDetails?.designationBn || '-'}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-700">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-xs">
                              {item.periodsPerWeek}
                            </span>
                            <span className="text-slate-500 text-[11px] font-normal">টি ক্লাস / সপ্তাহ</span>
                          </div>
                        </td>

                        <td className="p-3.5">
                          {item.roomNo ? (
                            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold">
                              {item.roomNo}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">-</span>
                          )}
                        </td>

                        <td className="p-3.5 pr-5 text-right">
                          <button
                            onClick={() => {
                              if (confirm('আপনি কি এই বিষয় শিক্ষকের দায়িত্ব মুছে ফেলতে চান?')) {
                                deleteSubjectTeacherAssignment(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-3">
              <BookOpen className="w-12 h-12 mx-auto text-slate-300 stroke-1" />
              <p className="text-sm font-bold text-slate-700">{selectedSession} শিক্ষাবর্ষে বিষয়ভিত্তিক শিক্ষক বণ্টন পাওয়া যায়নি।</p>
              <button
                onClick={() => setIsSubjectModalOpen(true)}
                className="px-4 py-2 text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors inline-block"
              >
                + বিষয় শিক্ষক বণ্টন করুন
              </button>
            </div>
          )}
        </div>
      )}

      {/* CLASS TEACHER ASSIGNMENT MODAL */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">ক্লাস শিক্ষক নির্ধারণ</h3>
                  <p className="text-[11px] text-slate-400">{selectedSession} শিক্ষাবর্ষ</p>
                </div>
              </div>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClassTeacher} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">শ্রেণি নির্বাচন করুন *</label>
                <select
                  required
                  value={classFormData.classId}
                  onChange={(e) => setClassFormData(prev => ({ ...prev, classId: e.target.value, sectionId: '' }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 font-medium"
                >
                  <option value="">-- শ্রেণি বাছাই করুন --</option>
                  {(academicClasses || []).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nameBn || c.name}
                    </option>
                  ))}
                </select>
              </div>

              {classFormData.classId && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">শাখা (যদি থাকে)</label>
                  <select
                    value={classFormData.sectionId}
                    onChange={(e) => setClassFormData(prev => ({ ...prev, sectionId: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 font-medium"
                  >
                    <option value="">-- সকল শাখা / সাধারণ --</option>
                    {(academicSections || []).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nameBn || s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">শ্রেণি শিক্ষক নির্বাচন করুন *</label>
                <select
                  required
                  value={classFormData.teacherId}
                  onChange={(e) => setClassFormData(prev => ({ ...prev, teacherId: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 font-medium"
                >
                  <option value="">-- শিক্ষক বাছাই করুন --</option>
                  {teachingStaff.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nameBn || t.name} - {t.designationBn || t.designation} ({t.subject || 'সাধারণ'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">ক্লাসরুম নম্বর (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={classFormData.roomNo}
                  onChange={(e) => setClassFormData(prev => ({ ...prev, roomNo: e.target.value }))}
                  placeholder="যেমন: Room 204"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all"
                >
                  নির্ধারণ সম্পন্ন করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBJECT TEACHER ASSIGNMENT MODAL */}
      {isSubjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">বিষয়ভিত্তিক শিক্ষক বণ্টন</h3>
                  <p className="text-[11px] text-slate-400">{selectedSession} শিক্ষাবর্ষ</p>
                </div>
              </div>
              <button
                onClick={() => setIsSubjectModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSubjectTeacher} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">শ্রেণি নির্বাচন করুন *</label>
                <select
                  required
                  value={subjectFormData.classId}
                  onChange={(e) => setSubjectFormData(prev => ({ ...prev, classId: e.target.value, sectionId: '' }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 font-medium"
                >
                  <option value="">-- শ্রেণি বাছাই করুন --</option>
                  {(academicClasses || []).map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nameBn || c.name}
                    </option>
                  ))}
                </select>
              </div>

              {subjectFormData.classId && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">শাখা (যদি থাকে)</label>
                  <select
                    value={subjectFormData.sectionId}
                    onChange={(e) => setSubjectFormData(prev => ({ ...prev, sectionId: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 font-medium"
                  >
                    <option value="">-- সকল শাখা / সাধারণ --</option>
                    {(academicSections || []).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nameBn || s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">বিষয় নির্বাচন করুন *</label>
                {classCurriculumSubjects.length > 0 ? (
                  <select
                    required
                    value={subjectFormData.subjectId ? subjectFormData.subjectId : (subjectFormData.subjectName ? 'custom' : '')}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        setSubjectFormData(prev => ({ ...prev, subjectId: '', subjectName: '' }));
                      } else {
                        const found = classCurriculumSubjects.find(s => s.id === val);
                        if (found) {
                          setSubjectFormData(prev => ({
                            ...prev,
                            subjectId: found.id,
                            subjectName: found.nameBn || found.name
                          }));
                        }
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 font-medium mb-2"
                  >
                    <option value="">-- কারিকুলামভুক্ত বিষয় বাছাই করুন --</option>
                    {classCurriculumSubjects.map(sub => (
                      <option key={sub.id} value={sub.id}>
                        [{sub.code}] {sub.nameBn || sub.name}
                      </option>
                    ))}
                    <option value="custom">-- কাস্টম / অন্যান্য বিষয় --</option>
                  </select>
                ) : null}

                {(!classCurriculumSubjects.length || !subjectFormData.subjectId) && (
                  <input
                    type="text"
                    required
                    value={subjectFormData.subjectName}
                    onChange={(e) => setSubjectFormData(prev => ({ ...prev, subjectName: e.target.value }))}
                    placeholder="বিষয়ের নাম লিখুন (যেমন: বাংলা, ইংরেজি...)"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 font-medium"
                  />
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">বিষয় শিক্ষক নির্বাচন করুন *</label>
                <select
                  required
                  value={subjectFormData.teacherId}
                  onChange={(e) => setSubjectFormData(prev => ({ ...prev, teacherId: e.target.value }))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 font-medium"
                >
                  <option value="">-- শিক্ষক বাছাই করুন --</option>
                  {teachingStaff.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nameBn || t.name} - {t.designationBn || t.designation} ({t.subject || 'সাধারণ'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">সাপ্তাহিক পিরিয়ড সংখ্যা</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={subjectFormData.periodsPerWeek}
                    onChange={(e) => setSubjectFormData(prev => ({ ...prev, periodsPerWeek: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">রুম নম্বর (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={subjectFormData.roomNo}
                    onChange={(e) => setSubjectFormData(prev => ({ ...prev, roomNo: e.target.value }))}
                    placeholder="যেমন: Lab 102"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsSubjectModalOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all"
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

