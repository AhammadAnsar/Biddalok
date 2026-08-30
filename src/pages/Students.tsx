import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, Edit3, Download, Eye, Trash2, 
  UserPlus, Filter, Users, School, ArrowRight, UserCheck,
  ArrowRightLeft, GitFork, CheckSquare, Square
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { translations, TranslationKey } from '../locales';
import { Student } from '../types';
import { BulkEditModal } from '../components/BulkEditModal';
import { StudentProfileModal } from '../components/StudentProfileModal';
import { StudentEnrollmentModal } from '../components/StudentEnrollmentModal';
import { StudentTransferModal } from '../components/StudentTransferModal';
import { generateStudentId } from '../utils/generateId';
import * as XLSX from 'xlsx';

interface StudentTableRowProps {
  student: Student;
  isBn: boolean;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onView: (student: Student) => void;
  onEdit: (student: Student) => void;
  onTransfer: (student: Student) => void;
  onDelete: (id: string) => void;
}

const StudentTableRow: React.FC<StudentTableRowProps> = React.memo(({
  student,
  isBn,
  isSelected,
  onToggleSelect,
  onView,
  onEdit,
  onTransfer,
  onDelete
}) => {
  return (
    <tr className={`hover:bg-slate-50/80 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}>
      <td className="px-4 py-4 w-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(student.id)}
          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
        />
      </td>
      <td className="px-4 py-4 font-semibold text-slate-900">{student.studentId}</td>
      <td className="px-4 py-4">
        {student.photo ? (
          <img 
            src={student.photo} 
            alt="Photo" 
            className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-xs" 
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-500">
            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
          </div>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="font-medium text-slate-800">{student.name}</div>
        {student.nameBn && (
          <div className="text-xs text-slate-400 mt-0.5">{student.nameBn}</div>
        )}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            {student.class || 'N/A'}
          </span>
          {student.group && student.group !== 'প্রযোজ্য নয়' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
              {student.group}
            </span>
          )}
          {student.section && student.section !== 'প্রযোজ্য নয়' && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              {isBn ? 'শাখা:' : 'Sec:'} {student.section}
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-4 font-medium text-slate-700">
        {student.roll || '-'}
      </td>
      <td className="px-4 py-4">
        <div className="text-xs font-medium text-slate-700">{student.fatherName || student.guardianName || '-'}</div>
        <div className="text-xs text-slate-400 mt-0.5">{student.fatherMobile || student.guardianMobile || student.motherMobile || '-'}</div>
      </td>
      <td className="px-4 py-4 text-xs text-slate-500">
        {student.upazila || student.district ? (
          <span>{[student.upazila, student.district].filter(Boolean).join(', ')}</span>
        ) : (
          <span className="text-slate-400">-</span>
        )}
      </td>
      <td className="px-4 py-4 text-right">
        <div className="flex items-center justify-end gap-1.5">
          <button 
            onClick={() => onView(student)} 
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
            title={isBn ? 'প্রোফাইল দেখুন' : 'View Profile'}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isBn ? 'প্রোফাইল' : 'View'}</span>
          </button>
          <button 
            onClick={() => onTransfer(student)} 
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors border border-sky-200"
            title={isBn ? 'আন্তঃ শ্রেণি/বিভাগ স্থানান্তর' : 'Transfer & Migrate'}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>{isBn ? 'স্থানান্তর' : 'Transfer'}</span>
          </button>
          <button 
            onClick={() => onEdit(student)} 
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors"
            title={isBn ? 'সম্পাদনা করুন' : 'Edit Student'}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isBn ? 'এডিট' : 'Edit'}</span>
          </button>
          <button 
            onClick={() => onDelete(student.id)} 
            className="inline-flex items-center p-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title={isBn ? 'মুছে ফেলুন' : 'Delete'}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

const Students = () => {
  const language = useAppStore(state => state.language);
  const students = useAppStore(state => state.students);
  const academicClasses = useAppStore(state => state.academicClasses);
  const academicGroups = useAppStore(state => state.academicGroups);
  const academicSections = useAppStore(state => state.academicSections);
  const updateStudent = useAppStore(state => state.updateStudent);
  const deleteStudent = useAppStore(state => state.deleteStudent);

  const isBn = language === 'bn';
  const t = (key: TranslationKey) => translations[language][key];
  const navigate = useNavigate();

  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  
  // Transfer & Migration State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTargetStudent, setTransferTargetStudent] = useState<Student | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<string>('all');

  // Pagination for high performance on any PC configuration
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);

  const studentList = Array.isArray(students) ? students : [];
  const classesList = Array.isArray(academicClasses) ? academicClasses : [];
  const groupsList = Array.isArray(academicGroups) ? academicGroups : [];
  const sectionsList = Array.isArray(academicSections) ? academicSections : [];

  // Available unique sessions
  const availableSessions = useMemo(() => {
    const sessions = new Set<string>();
    studentList.forEach(s => {
      if (s.session) sessions.add(s.session);
    });
    return Array.from(sessions);
  }, [studentList]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return studentList.filter(s => {
      if (!s) return false;
      
      // Class filter
      if (selectedClass !== 'all' && s.class !== selectedClass) return false;
      
      // Group filter
      if (selectedGroup !== 'all' && s.group !== selectedGroup) return false;

      // Section filter
      if (selectedSection !== 'all' && s.section !== selectedSection) return false;

      // Gender filter
      if (selectedGender !== 'all' && s.gender !== selectedGender) return false;
      
      // Session filter
      if (selectedSession !== 'all' && s.session !== selectedSession) return false;

      // Search term
      const term = (searchTerm || '').toLowerCase().trim();
      if (!term) return true;

      const name = (s.name || '').toLowerCase();
      const nameBn = (s.nameBn || '').toLowerCase();
      const sId = (s.studentId || '').toLowerCase();
      const roll = (s.roll || '').toLowerCase();
      const cls = (s.class || '').toLowerCase();
      const grp = (s.group || '').toLowerCase();
      const sec = (s.section || '').toLowerCase();
      const mobile = (s.fatherMobile || s.motherMobile || s.guardianMobile || '').toLowerCase();
      const father = (s.fatherName || s.fatherNameBn || '').toLowerCase();

      return name.includes(term) || 
             nameBn.includes(term) || 
             sId.includes(term) || 
             roll.includes(term) || 
             cls.includes(term) || 
             grp.includes(term) || 
             sec.includes(term) || 
             mobile.includes(term) || 
             father.includes(term);
    });
  }, [studentList, searchTerm, selectedClass, selectedGroup, selectedSection, selectedGender, selectedSession]);

  // Paginated students slice
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const handleEdit = useCallback((student: Student) => {
    setSelectedStudentForEdit(student);
    setShowEditModal(true);
  }, []);

  const handleView = useCallback((student: Student) => {
    setViewingStudent(student);
  }, []);

  const handleTransferSingle = useCallback((student: Student) => {
    setTransferTargetStudent(student);
    setShowTransferModal(true);
  }, []);

  const handleOpenBatchTransfer = useCallback(() => {
    setTransferTargetStudent(null);
    setShowTransferModal(true);
  }, []);

  const handleToggleSelectStudent = useCallback((id: string) => {
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAllOnPage = useCallback(() => {
    const pageIds = paginatedStudents.map(s => s.id);
    const allSelected = pageIds.every(id => selectedStudentIds.has(id));
    
    setSelectedStudentIds(prev => {
      const next = new Set(prev);
      if (allSelected) {
        pageIds.forEach(id => next.delete(id));
      } else {
        pageIds.forEach(id => next.add(id));
      }
      return next;
    });
  }, [paginatedStudents, selectedStudentIds]);

  const handleDelete = useCallback((id: string) => {
    if (window.confirm(isBn ? 'আপনি কি নিশ্চিত এই শিক্ষার্থীকে মুছে ফেলতে চান?' : 'Are you sure you want to delete this student?')) {
      deleteStudent(id);
      setSelectedStudentIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [isBn, deleteStudent]);

  const handleSaveEdit = useCallback((updatedData: Partial<Student>) => {
    if (selectedStudentForEdit) {
      updateStudent(selectedStudentForEdit.id, updatedData);
      showToast(isBn ? 'শিক্ষার্থীর তথ্য সফলভাবে আপডেট হয়েছে!' : 'Student information updated successfully!');
    }
    setShowEditModal(false);
    setSelectedStudentForEdit(null);
  }, [selectedStudentForEdit, updateStudent, showToast, isBn]);

  const exportToExcel = () => {
    if (filteredStudents.length === 0) {
      alert(isBn ? 'এক্সপোর্ট করার মত কোন তথ্য নেই!' : 'No data to export!');
      return;
    }

    const exportData = filteredStudents.map((s, idx) => ({
      'SL': idx + 1,
      'Student ID': s.studentId,
      'Name (English)': s.name,
      'Name (Bangla)': s.nameBn || '',
      'Class': s.class,
      'Roll': s.roll,
      'Session': s.session || '',
      'Gender': s.gender,
      'Date of Birth': s.dateOfBirth || '',
      'Father Name': s.fatherName || '',
      'Father Mobile': s.fatherMobile || '',
      'Mother Name': s.motherName || '',
      'District': s.district || '',
      'Upazila': s.upazila || '',
      'Post Office': s.postOffice || '',
      'Village': s.village || ''
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `Student_List_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>{isBn ? 'শিক্ষার্থী প্রোফাইল ও রেকর্ড' : 'Student Profiles & Directory'}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-800">
              {isBn ? 'শিক্ষার্থীর তালিকা ও প্রোফাইল' : 'Student Profile & List'}
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              {filteredStudents.length} {isBn ? 'জন' : 'Students'}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            {isBn 
              ? 'সকল শিক্ষার্থীর তথ্য অনুসন্ধান, প্রোফাইল দর্শন, বাল্ক এডিট এবং বিস্তারিত সম্পাদনা' 
              : 'Search student records, view detailed profile dossiers, bulk edit, and manage records'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Transfer & Migrate button */}
          <button
            onClick={handleOpenBatchTransfer}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-sm font-medium transition-colors shadow-xs"
            title={isBn ? 'আন্তঃ শ্রেণি, বিভাগ ও শাখা মাইগ্রেশন' : 'Transfer & Migrate Students'}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>{isBn ? 'স্থানান্তর ও মাইগ্রেশন' : 'Transfer / Migrate'}</span>
          </button>

          {/* Export button */}
          <button
            onClick={exportToExcel}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors border border-slate-200"
            title={isBn ? 'এক্সেল ডাউনলোড' : 'Export Excel'}
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>{isBn ? 'এক্সপোর্ট' : 'Export'}</span>
          </button>

          {/* Bulk Edit button */}
          <button
            onClick={() => setShowBulkEdit(true)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-medium transition-colors shadow-xs"
          >
            <Edit3 className="w-4 h-4" />
            <span>{isBn ? 'বাল্ক এডিট' : 'Bulk Edit'}</span>
          </button>

          {/* Admission link button */}
          <Link
            to="/students/admission"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isBn ? 'ভর্তি ও তালিকাভুক্তি' : 'Admission & Enrollment'}</span>
          </Link>
        </div>
      </div>

      {/* Floating Selected Batch Action Bar */}
      {selectedStudentIds.size > 0 && (
        <div className="bg-indigo-900 text-white p-3.5 px-5 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-fade-in border border-indigo-700">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-sm">
              {isBn 
                ? `${selectedStudentIds.size} জন শিক্ষার্থী নির্বাচিত হয়েছে` 
                : `${selectedStudentIds.size} students selected`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTransferTargetStudent(null);
                setShowTransferModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{isBn ? 'নির্বাচিতদের মাইগ্রেশন / স্থানান্তর করুন' : 'Migrate Selected'}</span>
            </button>
            <button
              onClick={() => setShowBulkEdit(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isBn ? 'বাল্ক এডিট করুন' : 'Bulk Edit'}</span>
            </button>
            <button
              onClick={() => setSelectedStudentIds(new Set())}
              className="px-3 py-1.5 bg-indigo-800 hover:bg-indigo-700 text-indigo-200 hover:text-white rounded-xl text-xs font-semibold transition-colors"
            >
              {isBn ? 'নির্বাচন বাতিল' : 'Clear Selection'}
            </button>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder={isBn ? 'নাম, আইডি, রোল, মোবাইল বা পিতা...' : 'Search by name, ID, roll, mobile...'} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50/50"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50/50 text-slate-700"
            >
              <option value="all">{isBn ? 'সকল শ্রেণি' : 'All Classes'}</option>
              {classesList.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Group Filter */}
          <div>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50/50 text-slate-700"
            >
              <option value="all">{isBn ? 'সকল বিভাগ' : 'All Groups'}</option>
              {groupsList.map(g => (
                <option key={g.id} value={g.name}>{g.name}</option>
              ))}
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50/50 text-slate-700"
            >
              <option value="all">{isBn ? 'সকল শাখা' : 'All Sections'}</option>
              {sectionsList.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Session Filter */}
          <div>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50/50 text-slate-700"
            >
              <option value="all">{isBn ? 'সকল শিক্ষাবর্ষ' : 'All Sessions'}</option>
              {availableSessions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Clear Button if active */}
        {(searchTerm || selectedClass !== 'all' || selectedGroup !== 'all' || selectedSection !== 'all' || selectedGender !== 'all' || selectedSession !== 'all') && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <span>
              {isBn ? `ফিল্টার ফলাফল: ${filteredStudents.length} জন শিক্ষার্থী দেখানো হচ্ছে` : `Filtered Results: Showing ${filteredStudents.length} students`}
            </span>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedClass('all');
                setSelectedGroup('all');
                setSelectedSection('all');
                setSelectedGender('all');
                setSelectedSession('all');
              }}
              className="text-emerald-600 hover:text-emerald-800 font-medium cursor-pointer"
            >
              {isBn ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
            </button>
          </div>
        )}
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-xs tracking-wider">
              <tr>
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      paginatedStudents.length > 0 &&
                      paginatedStudents.every(s => selectedStudentIds.has(s.id))
                    }
                    onChange={handleToggleSelectAllOnPage}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                    title={isBn ? 'এই পৃষ্ঠার সকল শিক্ষার্থী নির্বাচন করুন' : 'Select all on this page'}
                  />
                </th>
                <th className="px-4 py-4">{t('studentId')}</th>
                <th className="px-4 py-4">{isBn ? 'ছবি' : 'Photo'}</th>
                <th className="px-4 py-4">{t('studentName')}</th>
                <th className="px-4 py-4">{t('class')}</th>
                <th className="px-4 py-4">{t('roll')}</th>
                <th className="px-4 py-4">{isBn ? 'অভিভাবক ও যোগাযোগ' : 'Guardian & Mobile'}</th>
                <th className="px-4 py-4">{isBn ? 'ঠিকানা' : 'Address'}</th>
                <th className="px-4 py-4 text-right">{isBn ? 'অ্যাকশন' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedStudents.length > 0 ? (
                paginatedStudents.map((student) => (
                  <StudentTableRow
                    key={student.id}
                    student={student}
                    isBn={isBn}
                    isSelected={selectedStudentIds.has(student.id)}
                    onToggleSelect={handleToggleSelectStudent}
                    onView={handleView}
                    onEdit={handleEdit}
                    onTransfer={handleTransferSingle}
                    onDelete={handleDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p className="font-semibold text-slate-700 text-base">{t('noData')}</p>
                    <p className="text-xs text-slate-400 mt-1 mb-4">
                      {isBn ? 'কোন শিক্ষার্থী পাওয়া যায়নি। নতুন শিক্ষার্থী ভর্তি করতে নিচের বাটনে চাপ দিন।' : 'No student records match your filter criteria.'}
                    </p>
                    <Link
                      to="/students/admission"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>{isBn ? 'ভর্তি ও তালিকাভুক্তি মডিউলে যান' : 'Go to Admission & Enrollment'}</span>
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredStudents.length > pageSize && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span>{isBn ? 'মোট শিক্ষার্থী:' : 'Total:'} <strong>{filteredStudents.length}</strong></span>
              <span className="text-slate-300">|</span>
              <span>{isBn ? `পৃষ্ঠা ${currentPage} / ${totalPages}` : `Page ${currentPage} of ${totalPages}`}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isBn ? 'পূর্ববর্তী' : 'Previous'}
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = Math.min(totalPages - 4 + i, Math.max(1, currentPage - 2 + i));
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg font-semibold transition-colors ${
                        currentPage === pageNum
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-medium hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {isBn ? 'পরবর্তী' : 'Next'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Student Enrollment / Edit Modal */}
      <StudentEnrollmentModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStudentForEdit(null);
        }}
        student={selectedStudentForEdit}
        onSave={handleSaveEdit}
        generateId={(cls) => generateStudentId(cls, studentList)}
      />

      {/* Bulk Edit Modal */}
      <BulkEditModal 
        isOpen={showBulkEdit} 
        onClose={() => setShowBulkEdit(false)} 
      />

      {/* Student Profile Modal */}
      <StudentProfileModal
        student={viewingStudent}
        isOpen={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
        onEdit={(st) => {
          setViewingStudent(null);
          handleEdit(st);
        }}
        onTransfer={(st) => {
          setViewingStudent(null);
          handleTransferSingle(st);
        }}
      />

      {/* Student Transfer & Academic Migration Modal */}
      <StudentTransferModal
        isOpen={showTransferModal}
        onClose={() => {
          setShowTransferModal(false);
          setTransferTargetStudent(null);
        }}
        initialStudent={transferTargetStudent}
        initialSelectedStudentIds={Array.from(selectedStudentIds)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-fade-in border border-slate-700">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default Students;
