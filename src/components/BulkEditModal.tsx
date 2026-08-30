import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  X, 
  Save, 
  Edit3, 
  Filter, 
  Layers, 
  Users, 
  Search, 
  Check, 
  Sparkles, 
  ArrowRight,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Student, AcademicClass, AcademicGroup, AcademicSection } from '../types';
import { translations, TranslationKey } from '../locales';

interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ColumnCategory = 'all' | 'academic' | 'basic' | 'parents' | 'address' | 'education_payment';

const RELIGIONS = ['Islam', 'Hinduism', 'Buddhism', 'Christianity', 'Other'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'পরীক্ষা করা হয় নাই'];
const GENDERS = ['Male', 'Female', 'Other'];
const MARITAL_STATUSES = ['অবিবাহিত', 'বিবাহিত'];
const DISABILITIES = ['না', 'শারীরিক', 'দৃষ্টি', 'শ্রবণ', 'বাক', 'বুদ্ধি', 'অন্যান্য'];
const PARENTS_STATUSES = ['দুজনেই জীবিত', 'পিতা মৃত', 'মাতা মৃত', 'উভয়েই মৃত'];
const GUARDIAN_RELATIONS = ['পিতা', 'মাতা', 'ভাই', 'বোন', 'চাচা/মামা', 'দাদা/নানা', 'অন্যান্য'];
const PAYMENT_METHODS = ['নগদ / ক্যাশ', 'বিকাশ', 'নগদ (Nagad)', 'রকেট', 'ব্যাংক', 'অন্যান্য'];
const BOARDS = ['Dhaka', 'Cumilla', 'Chattogram', 'Rajshahi', 'Jashore', 'Barishal', 'Sylhet', 'Dinajpur', 'Mymensingh', 'Madrasah', 'Technical'];
const SPECIAL_FACILITIES = ['প্রযোজ্য নয়', 'মেধাবী কোটা', 'অসহায়/দরিদ্র কোটা', 'মুক্তিযোদ্ধা কোটা', 'প্রতিবন্ধী কোটা', 'উপজাতি কোটা'];

export const BulkEditModal: React.FC<BulkEditModalProps> = ({ isOpen, onClose }) => {
  const { 
    language, 
    students, 
    academicClasses, 
    academicGroups, 
    academicSections, 
    bulkUpdateStudents 
  } = useAppStore();

  const isBn = language === 'bn';
  const t = (key: TranslationKey) => translations[language][key];

  const classesList: AcademicClass[] = useMemo(() => Array.isArray(academicClasses) ? academicClasses : [], [academicClasses]);
  const groupsList: AcademicGroup[] = useMemo(() => Array.isArray(academicGroups) ? academicGroups : [], [academicGroups]);
  const sectionsList: AcademicSection[] = useMemo(() => Array.isArray(academicSections) ? academicSections : [], [academicSections]);
  const studentList: Student[] = useMemo(() => Array.isArray(students) ? students : [], [students]);

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<string>('all');
  
  const [editingStudents, setEditingStudents] = useState<Student[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const [searchFilter, setSearchFilter] = useState<string>('');
  const [columnCategory, setColumnCategory] = useState<ColumnCategory>('all');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Available sessions in DB
  const availableSessions = useMemo(() => {
    const sSet = new Set<string>();
    const currentYr = new Date().getFullYear().toString();
    sSet.add(currentYr);
    sSet.add((new Date().getFullYear() + 1).toString());
    studentList.forEach(s => {
      if (s.session) sSet.add(s.session);
    });
    return Array.from(sSet);
  }, [studentList]);

  useEffect(() => {
    if (isOpen) {
      const defaultClass = classesList.find(c => c.isDefault)?.name || (classesList[0]?.name || 'all');
      setSelectedClass('all');
      setSelectedGroup('all');
      setSelectedSection('all');
      setSelectedSession('all');
      setSuccessToast(null);
      setCurrentPage(1);
      setEditingStudents(studentList.map(s => ({ ...s })));
    } else {
      setEditingStudents([]);
      setSearchFilter('');
      setCurrentPage(1);
    }
  }, [isOpen, studentList, classesList]);

  // Handle filtered view
  const filteredStudents = useMemo(() => {
    return editingStudents.filter(s => {
      if (selectedClass !== 'all' && s.class !== selectedClass) return false;
      if (selectedGroup !== 'all' && s.group !== selectedGroup) return false;
      if (selectedSection !== 'all' && s.section !== selectedSection) return false;
      if (selectedSession !== 'all' && s.session !== selectedSession) return false;

      if (!searchFilter.trim()) return true;
      const term = searchFilter.toLowerCase();
      return (
        (s.name && s.name.toLowerCase().includes(term)) ||
        (s.nameBn && s.nameBn.includes(term)) ||
        (s.studentId && s.studentId.toLowerCase().includes(term)) ||
        (s.roll && s.roll.includes(term)) ||
        (s.fatherMobile && s.fatherMobile.includes(term)) ||
        (s.fatherName && s.fatherName.toLowerCase().includes(term))
      );
    });
  }, [editingStudents, selectedClass, selectedGroup, selectedSection, selectedSession, searchFilter]);

  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    return filteredStudents.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const handleFieldChange = useCallback((id: string, field: keyof Student, value: any) => {
    setEditingStudents(prev => 
      prev.map(s => s.id === id ? { ...s, [field]: value } : s)
    );
  }, []);

  // Batch Fill feature for visible students
  const [batchField, setBatchField] = useState<string>('');
  const [batchValue, setBatchValue] = useState<string>('');

  const handleApplyBatchValue = () => {
    if (!batchField || !batchValue) return;
    const targetIds = new Set(filteredStudents.map(s => s.id));
    setEditingStudents(prev => 
      prev.map(s => targetIds.has(s.id) ? { ...s, [batchField]: batchValue } : s)
    );
    setSuccessToast(
      isBn 
        ? `ফিল্টারকৃত ${targetIds.size} জন শিক্ষার্থীর "${batchField}" ফিল্ডে মান প্রয়োগ করা হয়েছে!`
        : `Applied "${batchValue}" to ${targetIds.size} students!`
    );
    setBatchField('');
    setBatchValue('');
  };

  const handleSave = () => {
    if (editingStudents.length === 0) return;
    setIsSaving(true);
    bulkUpdateStudents(editingStudents);
    setIsSaving(false);
    setSuccessToast(
      isBn 
        ? `${editingStudents.length} জন শিক্ষার্থীর সম্পূর্ণ ডাটা সফলভাবে সংরক্ষিত হয়েছে!` 
        : `${editingStudents.length} Students updated successfully!`
    );
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[98vw] h-[95vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-xs">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800">
                  {isBn ? 'শিক্ষার্থী সম্পূর্ণ ডাটা বাল্ক এডিটর' : 'Comprehensive Student Bulk Editor'}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {filteredStudents.length} {isBn ? 'জন শিক্ষার্থী' : 'Students'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isBn 
                  ? 'এনরোলমেন্ট ও ভর্তি ফরমের সকল তথ্য ড্রপডাউন ও ইনপুটের মাধ্যমে এক নজরে দ্রুত সম্পাদনা করুন' 
                  : 'Edit all student enrollment fields in bulk with specialized dropdowns and instant horizontal grid'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar & Column Category Tabs */}
        <div className="bg-slate-50 p-3 sm:px-6 border-b border-slate-200 space-y-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Filter selectors */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Class Filter */}
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-xs">
                <span className="font-semibold text-slate-600">{isBn ? 'শ্রেণি:' : 'Class:'}</span>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none text-xs"
                >
                  <option value="all">{isBn ? 'সকল শ্রেণি' : 'All Classes'}</option>
                  {classesList.map(c => (
                    <option key={c.id} value={c.name}>{c.name} {c.nameBn ? `(${c.nameBn})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Group Filter */}
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-xs">
                <span className="font-semibold text-slate-600">{isBn ? 'বিভাগ:' : 'Group:'}</span>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none text-xs"
                >
                  <option value="all">{isBn ? 'সকল বিভাগ' : 'All Groups'}</option>
                  {groupsList.map(g => (
                    <option key={g.id} value={g.name}>{g.name} {g.nameBn ? `(${g.nameBn})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Section Filter */}
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-xs">
                <span className="font-semibold text-slate-600">{isBn ? 'শাখা:' : 'Section:'}</span>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none text-xs"
                >
                  <option value="all">{isBn ? 'সকল শাখা' : 'All Sections'}</option>
                  {sectionsList.map(s => (
                    <option key={s.id} value={s.name}>{s.name} {s.nameBn ? `(${s.nameBn})` : ''}</option>
                  ))}
                </select>
              </div>

              {/* Session Filter */}
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-xs">
                <span className="font-semibold text-slate-600">{isBn ? 'সেশন:' : 'Session:'}</span>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 outline-none text-xs"
                >
                  <option value="all">{isBn ? 'সকল শিক্ষাবর্ষ' : 'All Sessions'}</option>
                  {availableSessions.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isBn ? 'খুঁজুন (নাম, রোল, আইডি, মোবাইল)...' : 'Search name, roll, ID, mobile...'}
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              />
            </div>
          </div>

          {/* Column Category View Filters */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/80">
            <div className="flex flex-wrap items-center gap-1">
              <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {isBn ? 'কলাম ভিউ:' : 'Columns:'}
              </span>
              {[
                { id: 'all', label: isBn ? 'সকল কলাম' : 'All Columns' },
                { id: 'academic', label: isBn ? 'একাডেমিক' : 'Academic' },
                { id: 'basic', label: isBn ? 'ব্যক্তিগত ও জন্ম' : 'Personal & DOB' },
                { id: 'parents', label: isBn ? 'পিতা-মাতা ও অভিভাবক' : 'Parents & Guardian' },
                { id: 'address', label: isBn ? 'ঠিকানা' : 'Address' },
                { id: 'education_payment', label: isBn ? 'পূর্ববর্তী শিক্ষা ও ফি' : 'Education & Payment' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setColumnCategory(cat.id as ColumnCategory)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    columnCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Batch Value Helper */}
            <div className="flex items-center gap-1.5 text-xs bg-white px-2 py-1 rounded-lg border border-slate-200">
              <span className="text-slate-500 font-medium">{isBn ? 'বাল্ক সেট:' : 'Bulk Fill:'}</span>
              <select
                value={batchField}
                onChange={(e) => setBatchField(e.target.value)}
                className="border border-slate-200 rounded px-1.5 py-0.5 text-xs outline-none bg-slate-50"
              >
                <option value="">{isBn ? '-- ফিল্ড বাছুন --' : '-- Choose Field --'}</option>
                <option value="session">{isBn ? 'সেশন (Session)' : 'Session'}</option>
                <option value="class">{isBn ? 'শ্রেণি (Class)' : 'Class'}</option>
                <option value="group">{isBn ? 'বিভাগ (Group)' : 'Group'}</option>
                <option value="section">{isBn ? 'শাখা (Section)' : 'Section'}</option>
                <option value="religion">{isBn ? 'ধর্ম (Religion)' : 'Religion'}</option>
                <option value="bloodGroup">{isBn ? 'রক্তের গ্রুপ (Blood Group)' : 'Blood Group'}</option>
                <option value="paymentMethod">{isBn ? 'পেমেন্ট মেথড (Payment Method)' : 'Payment Method'}</option>
              </select>

              {batchField === 'class' ? (
                <select
                  value={batchValue}
                  onChange={(e) => setBatchValue(e.target.value)}
                  className="border border-slate-200 rounded px-1.5 py-0.5 text-xs outline-none bg-slate-50"
                >
                  <option value="">{isBn ? '-- শ্রেণি বাছুন --' : '-- Select Class --'}</option>
                  {classesList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              ) : batchField === 'group' ? (
                <select
                  value={batchValue}
                  onChange={(e) => setBatchValue(e.target.value)}
                  className="border border-slate-200 rounded px-1.5 py-0.5 text-xs outline-none bg-slate-50"
                >
                  <option value="">{isBn ? '-- বিভাগ বাছুন --' : '-- Select Group --'}</option>
                  {groupsList.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                </select>
              ) : batchField === 'section' ? (
                <select
                  value={batchValue}
                  onChange={(e) => setBatchValue(e.target.value)}
                  className="border border-slate-200 rounded px-1.5 py-0.5 text-xs outline-none bg-slate-50"
                >
                  <option value="">{isBn ? '-- শাখা বাছুন --' : '-- Select Section --'}</option>
                  {sectionsList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              ) : batchField === 'religion' ? (
                <select
                  value={batchValue}
                  onChange={(e) => setBatchValue(e.target.value)}
                  className="border border-slate-200 rounded px-1.5 py-0.5 text-xs outline-none bg-slate-50"
                >
                  <option value="">{isBn ? '-- ধর্ম বাছুন --' : '-- Select Religion --'}</option>
                  {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              ) : batchField === 'bloodGroup' ? (
                <select
                  value={batchValue}
                  onChange={(e) => setBatchValue(e.target.value)}
                  className="border border-slate-200 rounded px-1.5 py-0.5 text-xs outline-none bg-slate-50"
                >
                  <option value="">{isBn ? '-- রক্তের গ্রুপ --' : '-- Select Blood Group --'}</option>
                  {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              ) : batchField === 'paymentMethod' ? (
                <select
                  value={batchValue}
                  onChange={(e) => setBatchValue(e.target.value)}
                  className="border border-slate-200 rounded px-1.5 py-0.5 text-xs outline-none bg-slate-50"
                >
                  <option value="">{isBn ? '-- মেথড বাছুন --' : '-- Select Method --'}</option>
                  {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder={isBn ? 'মান লিখুন...' : 'Value...'}
                  value={batchValue}
                  onChange={(e) => setBatchValue(e.target.value)}
                  className="w-24 border border-slate-200 rounded px-1.5 py-0.5 text-xs outline-none"
                />
              )}

              <button
                type="button"
                onClick={handleApplyBatchValue}
                disabled={!batchField || !batchValue}
                className="bg-indigo-600 disabled:opacity-40 hover:bg-indigo-700 text-white px-2 py-0.5 rounded text-xs font-semibold"
              >
                {isBn ? 'প্রয়োগ' : 'Apply'}
              </button>
            </div>
          </div>
        </div>

        {successToast && (
          <div className="mx-6 mt-3 p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>{successToast}</span>
            </div>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 
          CRITICAL: Single Unified Scroll Container with both overflow-x-auto and overflow-y-auto 
          This guarantees the horizontal scrollbar is permanently visible right at the bottom edge of this viewport 
          without requiring the user to scroll vertically to the bottom!
        */}
        <div className="flex-1 w-full overflow-x-auto overflow-y-auto relative bg-slate-100/50 [&::-webkit-scrollbar]:h-3.5 [&::-webkit-scrollbar]:w-3.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-400/80 hover:[&::-webkit-scrollbar-thumb]:bg-slate-500 [&::-webkit-scrollbar-track]:bg-slate-200">
          {paginatedStudents.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              {isBn ? 'নির্বাচিত ফিল্টারে কোনো শিক্ষার্থী পাওয়া যায়নি।' : 'No students found matching your filters.'}
            </div>
          ) : (
            <table className="text-left border-collapse min-w-max w-full bg-white text-xs">
              <thead className="sticky top-0 z-20 bg-slate-100 shadow-xs border-b border-slate-300">
                <tr className="text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                  {/* Sticky ID & Roll Columns */}
                  <th className="p-2.5 pl-4 sticky left-0 z-30 bg-slate-100 border-r border-slate-300 whitespace-nowrap min-w-[70px]">
                    {t('roll')}
                  </th>
                  <th className="p-2.5 sticky left-[70px] z-30 bg-slate-100 border-r border-slate-300 whitespace-nowrap min-w-[120px]">
                    {t('studentId')}
                  </th>
                  <th className="p-2.5 sticky left-[190px] z-30 bg-slate-100 border-r border-slate-300 whitespace-nowrap min-w-[180px]">
                    {isBn ? 'শিক্ষার্থীর নাম (English)' : 'Name (English)'}
                  </th>

                  {/* ACADEMIC COLUMNS */}
                  {(columnCategory === 'all' || columnCategory === 'academic') && (
                    <>
                      <th className="p-2.5 whitespace-nowrap min-w-[110px] bg-indigo-50/70 text-indigo-900 border-r border-slate-200">
                        {isBn ? 'শ্রেণি (Class)' : 'Class'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[110px] bg-indigo-50/70 text-indigo-900 border-r border-slate-200">
                        {isBn ? 'বিভাগ (Group)' : 'Group'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[100px] bg-indigo-50/70 text-indigo-900 border-r border-slate-200">
                        {isBn ? 'শাখা (Section)' : 'Section'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[90px] bg-indigo-50/70 text-indigo-900 border-r border-slate-200">
                        {isBn ? 'সেশন (Session)' : 'Session'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[90px] bg-indigo-50/70 text-indigo-900 border-r border-slate-200">
                        {isBn ? 'ফরম নং' : 'Form No'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[120px] bg-indigo-50/70 text-indigo-900 border-r border-slate-200">
                        {isBn ? 'আবেদনের তারিখ' : 'App Date'}
                      </th>
                    </>
                  )}

                  {/* BASIC / DEMOGRAPHICS COLUMNS */}
                  {(columnCategory === 'all' || columnCategory === 'basic') && (
                    <>
                      <th className="p-2.5 whitespace-nowrap min-w-[160px] bg-emerald-50/70 text-emerald-900 border-r border-slate-200">
                        {isBn ? 'নাম (বাংলা)' : 'Name (Bangla)'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[130px] bg-emerald-50/70 text-emerald-900 border-r border-slate-200">
                        {isBn ? 'জন্ম তারিখ (DOB)' : 'Date of Birth'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[90px] bg-emerald-50/70 text-emerald-900 border-r border-slate-200">
                        {isBn ? 'লিঙ্গ' : 'Gender'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[150px] bg-emerald-50/70 text-emerald-900 border-r border-slate-200">
                        {isBn ? 'জন্ম নিবন্ধন নং' : 'Birth Reg No'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[110px] bg-emerald-50/70 text-emerald-900 border-r border-slate-200">
                        {isBn ? 'ধর্ম (Religion)' : 'Religion'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[120px] bg-emerald-50/70 text-emerald-900 border-r border-slate-200">
                        {isBn ? 'রক্তের গ্রুপ' : 'Blood Group'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[100px] bg-emerald-50/70 text-emerald-900 border-r border-slate-200">
                        {isBn ? 'জাতীয়তা' : 'Nationality'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[100px] bg-emerald-50/70 text-emerald-900 border-r border-slate-200">
                        {isBn ? 'বৈবাহিক অবস্থা' : 'Marital Status'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[100px] bg-emerald-50/70 text-emerald-900 border-r border-slate-200">
                        {isBn ? 'প্রতিবন্ধিতা' : 'Disability'}
                      </th>
                    </>
                  )}

                  {/* PARENTS & GUARDIAN COLUMNS */}
                  {(columnCategory === 'all' || columnCategory === 'parents') && (
                    <>
                      <th className="p-2.5 whitespace-nowrap min-w-[160px] bg-purple-50/70 text-purple-900 border-r border-slate-200">
                        {isBn ? 'পিতার নাম (English)' : 'Father Name (En)'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[150px] bg-purple-50/70 text-purple-900 border-r border-slate-200">
                        {isBn ? 'পিতার নাম (বাংলা)' : 'Father Name (Bn)'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[120px] bg-purple-50/70 text-purple-900 border-r border-slate-200">
                        {isBn ? 'পিতার মোবাইল' : 'Father Mobile'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[130px] bg-purple-50/70 text-purple-900 border-r border-slate-200">
                        {isBn ? 'পিতার NID' : 'Father NID'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[110px] bg-purple-50/70 text-purple-900 border-r border-slate-200">
                        {isBn ? 'পিতার পেশা' : 'Father Profession'}
                      </th>

                      <th className="p-2.5 whitespace-nowrap min-w-[160px] bg-purple-50/70 text-purple-900 border-r border-slate-200">
                        {isBn ? 'মাতার নাম (English)' : 'Mother Name (En)'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[150px] bg-purple-50/70 text-purple-900 border-r border-slate-200">
                        {isBn ? 'মাতার নাম (বাংলা)' : 'Mother Name (Bn)'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[120px] bg-purple-50/70 text-purple-900 border-r border-slate-200">
                        {isBn ? 'মাতার মোবাইল' : 'Mother Mobile'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[130px] bg-purple-50/70 text-purple-900 border-r border-slate-200">
                        {isBn ? 'মাতার NID' : 'Mother NID'}
                      </th>

                      <th className="p-2.5 whitespace-nowrap min-w-[110px] bg-purple-50/70 text-purple-900 border-r border-slate-200">
                        {isBn ? 'পিতামাতার অবস্থা' : 'Parents Status'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[110px] bg-purple-50/70 text-purple-900 border-r border-slate-200">
                        {isBn ? 'অভিভাবকের সম্পর্ক' : 'Guardian Rel'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[140px] bg-purple-50/70 text-purple-900 border-r border-slate-200">
                        {isBn ? 'অভিভাবকের নাম' : 'Guardian Name'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[120px] bg-purple-50/70 text-purple-900 border-r border-slate-200">
                        {isBn ? 'অভিভাবক মোবাইল' : 'Guardian Mobile'}
                      </th>
                    </>
                  )}

                  {/* ADDRESS COLUMNS */}
                  {(columnCategory === 'all' || columnCategory === 'address') && (
                    <>
                      <th className="p-2.5 whitespace-nowrap min-w-[130px] bg-amber-50/70 text-amber-900 border-r border-slate-200">
                        {isBn ? 'স্থায়ী গ্রাম' : 'Perm Village'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[120px] bg-amber-50/70 text-amber-900 border-r border-slate-200">
                        {isBn ? 'স্থায়ী ডাকঘর' : 'Perm Post Office'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[110px] bg-amber-50/70 text-amber-900 border-r border-slate-200">
                        {isBn ? 'স্থায়ী উপজেলা' : 'Perm Upazila'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[110px] bg-amber-50/70 text-amber-900 border-r border-slate-200">
                        {isBn ? 'স্থায়ী জেলা' : 'Perm District'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[120px] bg-amber-50/70 text-amber-900 border-r border-slate-200">
                        {isBn ? 'বর্তমান গ্রাম' : 'Pres Village'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[120px] bg-amber-50/70 text-amber-900 border-r border-slate-200">
                        {isBn ? 'বর্তমান ডাকঘর' : 'Pres Post Office'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[110px] bg-amber-50/70 text-amber-900 border-r border-slate-200">
                        {isBn ? 'বর্তমান উপজেলা' : 'Pres Upazila'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[110px] bg-amber-50/70 text-amber-900 border-r border-slate-200">
                        {isBn ? 'বর্তমান জেলা' : 'Pres District'}
                      </th>
                    </>
                  )}

                  {/* EDUCATION & PAYMENT COLUMNS */}
                  {(columnCategory === 'all' || columnCategory === 'education_payment') && (
                    <>
                      <th className="p-2.5 whitespace-nowrap min-w-[150px] bg-cyan-50/70 text-cyan-900 border-r border-slate-200">
                        {isBn ? 'পূর্ববর্তী বিদ্যালয়' : 'Prev School'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[90px] bg-cyan-50/70 text-cyan-900 border-r border-slate-200">
                        {isBn ? 'পূর্ব শ্রেণি' : 'Prev Class'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[100px] bg-cyan-50/70 text-cyan-900 border-r border-slate-200">
                        {isBn ? 'ভর্তি ফি (টাকা)' : 'Admission Fee'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[110px] bg-cyan-50/70 text-cyan-900 border-r border-slate-200">
                        {isBn ? 'পেমেন্ট মেথড' : 'Payment Method'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[120px] bg-cyan-50/70 text-cyan-900 border-r border-slate-200">
                        {isBn ? 'ট্রানজেকশন নং' : 'Trx No'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[130px] bg-cyan-50/70 text-cyan-900 border-r border-slate-200">
                        {isBn ? 'বিশেষ সুবিধা' : 'Facility'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[120px] bg-cyan-50/70 text-cyan-900 border-r border-slate-200">
                        {isBn ? 'বোর্ড রেজিস্ট্রেশন' : 'Reg No'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[100px] bg-cyan-50/70 text-cyan-900 border-r border-slate-200">
                        {isBn ? 'শিক্ষা বোর্ড' : 'Board'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[70px] bg-cyan-50/70 text-cyan-900 border-r border-slate-200">
                        {isBn ? 'জিপিএ' : 'GPA'}
                      </th>
                      <th className="p-2.5 whitespace-nowrap min-w-[80px] bg-cyan-50/70 text-cyan-900 border-r border-slate-200">
                        {isBn ? 'পাশের সন' : 'Pass Year'}
                      </th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 text-slate-800">
                {paginatedStudents.map(student => (
                  <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                    {/* Sticky ID & Roll Inputs */}
                    <td className="p-1.5 pl-4 sticky left-0 z-10 bg-white border-r border-slate-200">
                      <input 
                        type="text" 
                        value={student.roll || ''} 
                        onChange={(e) => handleFieldChange(student.id, 'roll', e.target.value)} 
                        className="w-14 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-center" 
                      />
                    </td>
                    <td className="p-1.5 sticky left-[70px] z-10 bg-white border-r border-slate-200">
                      <input 
                        type="text" 
                        value={student.studentId || ''} 
                        onChange={(e) => handleFieldChange(student.id, 'studentId', e.target.value)} 
                        className="w-28 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-semibold" 
                      />
                    </td>
                    <td className="p-1.5 sticky left-[190px] z-10 bg-white border-r border-slate-200">
                      <input 
                        type="text" 
                        value={student.name || ''} 
                        onChange={(e) => handleFieldChange(student.id, 'name', e.target.value)} 
                        className="w-40 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-medium" 
                      />
                    </td>

                    {/* ACADEMIC FIELDS */}
                    {(columnCategory === 'all' || columnCategory === 'academic') && (
                      <>
                        <td className="p-1.5 border-r border-slate-200">
                          <select 
                            value={student.class || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'class', e.target.value)} 
                            className="w-28 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-semibold bg-white"
                          >
                            {classesList.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <select 
                            value={student.group || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'group', e.target.value)} 
                            className="w-28 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-white"
                          >
                            {groupsList.map(g => (
                              <option key={g.id} value={g.name}>{g.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <select 
                            value={student.section || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'section', e.target.value)} 
                            className="w-24 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-white"
                          >
                            {sectionsList.map(s => (
                              <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.session || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'session', e.target.value)} 
                            className="w-20 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-center" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.formNo || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'formNo', e.target.value)} 
                            className="w-20 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-center" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="date" 
                            value={student.applicationDate || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'applicationDate', e.target.value)} 
                            className="w-32 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                      </>
                    )}

                    {/* BASIC / DEMOGRAPHICS FIELDS */}
                    {(columnCategory === 'all' || columnCategory === 'basic') && (
                      <>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.nameBn || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'nameBn', e.target.value)} 
                            className="w-36 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="date" 
                            value={student.dateOfBirth || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'dateOfBirth', e.target.value)} 
                            className="w-32 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-mono" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <select 
                            value={student.gender || 'Male'} 
                            onChange={(e) => handleFieldChange(student.id, 'gender', e.target.value)} 
                            className="w-20 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-white"
                          >
                            <option value="Male">{isBn ? 'ছাত্র' : 'Male'}</option>
                            <option value="Female">{isBn ? 'ছাত্রী' : 'Female'}</option>
                            <option value="Other">{isBn ? 'অন্যান্য' : 'Other'}</option>
                          </select>
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.birthRegistrationNo || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'birthRegistrationNo', e.target.value)} 
                            className="w-36 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <select 
                            value={student.religion || 'Islam'} 
                            onChange={(e) => handleFieldChange(student.id, 'religion', e.target.value)} 
                            className="w-24 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-white"
                          >
                            {RELIGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <select 
                            value={student.bloodGroup || 'পরীক্ষা করা হয় নাই'} 
                            onChange={(e) => handleFieldChange(student.id, 'bloodGroup', e.target.value)} 
                            className="w-28 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-white"
                          >
                            {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.nationality || 'বাংলাদেশি'} 
                            onChange={(e) => handleFieldChange(student.id, 'nationality', e.target.value)} 
                            className="w-24 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <select 
                            value={student.maritalStatus || 'অবিবাহিত'} 
                            onChange={(e) => handleFieldChange(student.id, 'maritalStatus', e.target.value)} 
                            className="w-24 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-white"
                          >
                            {MARITAL_STATUSES.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <select 
                            value={student.disability || 'না'} 
                            onChange={(e) => handleFieldChange(student.id, 'disability', e.target.value)} 
                            className="w-24 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-white"
                          >
                            {DISABILITIES.map(d => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </td>
                      </>
                    )}

                    {/* PARENTS & GUARDIAN FIELDS */}
                    {(columnCategory === 'all' || columnCategory === 'parents') && (
                      <>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.fatherName || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'fatherName', e.target.value)} 
                            className="w-36 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.fatherNameBn || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'fatherNameBn', e.target.value)} 
                            className="w-36 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.fatherMobile || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'fatherMobile', e.target.value)} 
                            className="w-28 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.fatherNid || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'fatherNid', e.target.value)} 
                            className="w-28 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.fatherProfession || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'fatherProfession', e.target.value)} 
                            className="w-24 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>

                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.motherName || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'motherName', e.target.value)} 
                            className="w-36 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.motherNameBn || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'motherNameBn', e.target.value)} 
                            className="w-36 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.motherMobile || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'motherMobile', e.target.value)} 
                            className="w-28 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.motherNid || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'motherNid', e.target.value)} 
                            className="w-28 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>

                        <td className="p-1.5 border-r border-slate-200">
                          <select 
                            value={student.parentsStatus || 'দুজনেই জীবিত'} 
                            onChange={(e) => handleFieldChange(student.id, 'parentsStatus', e.target.value)} 
                            className="w-28 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-white"
                          >
                            {PARENTS_STATUSES.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <select 
                            value={student.guardianRelation || 'পিতা'} 
                            onChange={(e) => handleFieldChange(student.id, 'guardianRelation', e.target.value)} 
                            className="w-24 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-white"
                          >
                            {GUARDIAN_RELATIONS.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.guardianName || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'guardianName', e.target.value)} 
                            className="w-32 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.guardianMobile || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'guardianMobile', e.target.value)} 
                            className="w-28 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                      </>
                    )}

                    {/* ADDRESS FIELDS */}
                    {(columnCategory === 'all' || columnCategory === 'address') && (
                      <>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.village || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'village', e.target.value)} 
                            className="w-28 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.postOffice || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'postOffice', e.target.value)} 
                            className="w-28 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.upazila || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'upazila', e.target.value)} 
                            className="w-24 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.district || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'district', e.target.value)} 
                            className="w-24 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.presentVillage || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'presentVillage', e.target.value)} 
                            className="w-28 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.presentPostOffice || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'presentPostOffice', e.target.value)} 
                            className="w-28 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.presentUpazila || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'presentUpazila', e.target.value)} 
                            className="w-24 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.presentDistrict || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'presentDistrict', e.target.value)} 
                            className="w-24 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                      </>
                    )}

                    {/* EDUCATION & PAYMENT FIELDS */}
                    {(columnCategory === 'all' || columnCategory === 'education_payment') && (
                      <>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.prevSchoolName || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'prevSchoolName', e.target.value)} 
                            className="w-36 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.prevClass || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'prevClass', e.target.value)} 
                            className="w-16 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-center" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.admissionPayment || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'admissionPayment', e.target.value)} 
                            className="w-20 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-right font-mono" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <select 
                            value={student.paymentMethod || 'নগদ / ক্যাশ'} 
                            onChange={(e) => handleFieldChange(student.id, 'paymentMethod', e.target.value)} 
                            className="w-28 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-white"
                          >
                            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.transactionNo || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'transactionNo', e.target.value)} 
                            className="w-28 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <select 
                            value={student.specialFacility || 'প্রযোজ্য নয়'} 
                            onChange={(e) => handleFieldChange(student.id, 'specialFacility', e.target.value)} 
                            className="w-28 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-white"
                          >
                            {SPECIAL_FACILITIES.map(f => <option key={f} value={f}>{f}</option>)}
                          </select>
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.registrationNo || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'registrationNo', e.target.value)} 
                            className="w-28 border border-slate-300 rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <select 
                            value={student.board || 'Dhaka'} 
                            onChange={(e) => handleFieldChange(student.id, 'board', e.target.value)} 
                            className="w-24 border border-slate-300 rounded px-1.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs bg-white"
                          >
                            {BOARDS.map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.gpa || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'gpa', e.target.value)} 
                            className="w-14 border border-slate-300 rounded px-1 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-center font-bold" 
                          />
                        </td>
                        <td className="p-1.5 border-r border-slate-200">
                          <input 
                            type="text" 
                            value={student.passingYear || ''} 
                            onChange={(e) => handleFieldChange(student.id, 'passingYear', e.target.value)} 
                            className="w-16 border border-slate-300 rounded px-1 py-1 focus:ring-2 focus:ring-indigo-500 outline-none text-xs text-center font-mono" 
                          />
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer & Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-3">
            <span>
              {isBn 
                ? `মোট ${filteredStudents.length} জন শিক্ষার্থী (পৃষ্ঠা ${currentPage} / ${totalPages})` 
                : `Total ${filteredStudents.length} students (Page ${currentPage} of ${totalPages})`}
            </span>
            <span className="hidden md:inline-block text-slate-400">|</span>
            <span className="hidden md:inline-block text-slate-500">
              {isBn ? 'টিপস: অনুভূমিক স্ক্রলবারটি সব সময় দৃশ্যমান থাকে' : 'Tip: Horizontal scrollbar is permanently pinned to the grid bottom'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {totalPages > 1 && (
              <div className="flex items-center gap-1 mr-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-semibold disabled:opacity-40 hover:bg-slate-50"
                >
                  {isBn ? 'পূর্ববর্তী' : 'Prev'}
                </button>
                <span className="text-xs font-bold text-slate-700 px-2">{currentPage} / {totalPages}</span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-2.5 py-1 bg-white border border-slate-300 rounded text-xs font-semibold disabled:opacity-40 hover:bg-slate-50"
                >
                  {isBn ? 'পরবর্তী' : 'Next'}
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors text-sm"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || editingStudents.length === 0}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm"
            >
              <Save className="w-4 h-4" />
              {isSaving ? (language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'সকল পরিবর্তন সংরক্ষণ করুন' : 'Save Changes')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
