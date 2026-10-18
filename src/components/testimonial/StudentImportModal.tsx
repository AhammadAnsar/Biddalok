import React, { useState, useMemo } from 'react';
import { X, Search, Filter, CheckSquare, Square, UserPlus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Student, AcademicClass, AcademicSection, Group } from '../../types';
import { TestimonialExam, TestimonialRosterItem } from '../../types/testimonial';
import { toBengaliNumber } from '../../utils/bengaliUtils';

interface StudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeExam: TestimonialExam;
  allStudents: Student[];
  classes: AcademicClass[];
  sections: AcademicSection[];
  groups: Group[];
  existingRosterItems: TestimonialRosterItem[];
  onImportStudents: (selectedStudents: Student[]) => void;
}

export const StudentImportModal: React.FC<StudentImportModalProps> = ({
  isOpen,
  onClose,
  activeExam,
  allStudents,
  classes,
  sections,
  groups,
  existingRosterItems,
  onImportStudents,
}) => {
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('all');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Set of student IDs already enrolled in this exam roster
  const existingEnrolledIds = useMemo(() => {
    return new Set(existingRosterItems.map(item => item.studentId));
  }, [existingRosterItems]);

  // Filter students based on cascading controls & search
  const filteredStudents = useMemo(() => {
    return allStudents.filter(student => {
      // 1. Class filter
      if (selectedClassId !== 'all') {
        const classObj = classes.find(c => c.id === selectedClassId);
        const matchesClass = student.classId === selectedClassId || 
                             student.class === selectedClassId ||
                             (classObj && (student.class === classObj.name || student.class === classObj.nameBn));
        if (!matchesClass) return false;
      }

      // 2. Group filter
      if (selectedGroupId !== 'all') {
        const groupObj = groups.find(g => g.id === selectedGroupId);
        const matchesGroup = student.groupId === selectedGroupId || 
                             student.group === selectedGroupId ||
                             (groupObj && (student.group === groupObj.name || student.group === groupObj.nameBn));
        if (!matchesGroup) return false;
      }

      // 3. Section filter
      if (selectedSectionId !== 'all') {
        const sectionObj = sections.find(s => s.id === selectedSectionId);
        const matchesSection = student.sectionId === selectedSectionId || 
                               student.section === selectedSectionId ||
                               (sectionObj && (student.section === sectionObj.name || student.section === sectionObj.nameBn));
        if (!matchesSection) return false;
      }

      // 4. Text Search (name, roll, studentId, regNo)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = (student.name || '').toLowerCase().includes(q) || (student.nameBn || '').includes(q);
        const matchesRoll = (student.roll || '').toString().includes(q);
        const matchesId = (student.studentId || '').toLowerCase().includes(q);
        const matchesReg = (student.registrationNo || '').includes(q);
        if (!matchesName && !matchesRoll && !matchesId && !matchesReg) return false;
      }

      return true;
    });
  }, [allStudents, selectedClassId, selectedGroupId, selectedSectionId, searchQuery, classes, groups, sections]);

  // Check if student has missing data
  const checkMissingData = (s: Student) => {
    const missing: string[] = [];
    if (!s.name && !s.nameBn) missing.push('নাম');
    if (!s.fatherName && !s.fatherNameBn) missing.push('পিতা');
    if (!s.motherName && !s.motherNameBn) missing.push('মাতা');
    if (!s.dateOfBirth) missing.push('জন্মতারিখ');
    if (!s.registrationNo) missing.push('রেজিস্ট্রেশন নং');
    return missing;
  };

  const handleToggleSelect = (studentId: string) => {
    const updated = new Set(selectedStudentIds);
    if (updated.has(studentId)) {
      updated.delete(studentId);
    } else {
      updated.add(studentId);
    }
    setSelectedStudentIds(updated);
  };

  const handleSelectAllAvailable = () => {
    const newSelectable = filteredStudents.filter(s => !existingEnrolledIds.has(s.studentId));
    if (selectedStudentIds.size === newSelectable.length && newSelectable.length > 0) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(newSelectable.map(s => s.studentId)));
    }
  };

  const handleConfirmImport = () => {
    const studentsToImport = allStudents.filter(s => selectedStudentIds.has(s.studentId));
    onImportStudents(studentsToImport);
    setSelectedStudentIds(new Set());
    onClose();
  };

  if (!isOpen) return null;

  const selectableCount = filteredStudents.filter(s => !existingEnrolledIds.has(s.studentId)).length;
  const isAllSelected = selectableCount > 0 && selectedStudentIds.size === selectableCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                শিক্ষার্থী ইমপোর্ট — {activeExam.displayNameBn}
              </h3>
              <p className="text-emerald-100 text-xs mt-0.5">
                প্রতিষ্ঠান ডেটাবেজ থেকে ফিল্টার করে এই পরীক্ষার রোস্টারে যুক্ত করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 shrink-0 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            {/* Class Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                শ্রেণি
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value="all">সব শ্রেণি</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.nameBn || c.name}</option>
                ))}
              </select>
            </div>

            {/* Group Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                বিভাগ / শাখা
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value="all">সব বিভাগ</option>
                {groups.map(g => (
                  <option key={g.id} value={g.id}>{g.nameBn || g.name}</option>
                ))}
              </select>
            </div>

            {/* Section Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                সেকশন
              </label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                <option value="all">সব সেকশন</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.nameBn || s.name}</option>
                ))}
              </select>
            </div>

            {/* Search Box */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1 uppercase tracking-wider">
                অনুসন্ধান
              </label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নাম, রোল, রেজি..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Quick Selection Status Bar */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectAllAvailable}
                disabled={selectableCount === 0}
                className="flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 disabled:opacity-40"
              >
                {isAllSelected ? (
                  <CheckSquare className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400" />
                )}
                <span>সব নির্বাচন করুন ({selectableCount})</span>
              </button>
              <span className="text-slate-400">|</span>
              <span className="text-slate-600">
                নির্বাচিত: <strong className="text-emerald-700">{selectedStudentIds.size}</strong> জন
              </span>
            </div>
            <div className="text-slate-500 text-[11px]">
              মোট পাওয়া গেছে: {filteredStudents.length} জন
            </div>
          </div>
        </div>

        {/* Student Table (Scrollable) */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredStudents.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              কোনো শিক্ষার্থী পাওয়া যায়নি
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 sticky top-0 z-10 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3 w-16">রোল</th>
                  <th className="py-2.5 px-3">শিক্ষার্থীর নাম</th>
                  <th className="py-2.5 px-3">পিতার নাম</th>
                  <th className="py-2.5 px-3">রেজি: নং</th>
                  <th className="py-2.5 px-3">শ্রেণি / বিভাগ</th>
                  <th className="py-2.5 px-3 text-right">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const isAlreadyEnrolled = existingEnrolledIds.has(student.studentId);
                  const isSelected = selectedStudentIds.has(student.studentId);
                  const missingFields = checkMissingData(student);

                  return (
                    <tr
                      key={student.studentId}
                      onClick={() => !isAlreadyEnrolled && handleToggleSelect(student.studentId)}
                      className={`transition-colors cursor-pointer ${
                        isAlreadyEnrolled
                          ? 'bg-slate-50/70 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-emerald-50/80 hover:bg-emerald-100/70'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          disabled={isAlreadyEnrolled}
                          checked={isSelected}
                          onChange={() => handleToggleSelect(student.studentId)}
                          className="rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-800">
                        {toBengaliNumber(student.roll || '')}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-bold text-slate-900">
                          {student.nameBn || student.name}
                        </div>
                        {student.name && student.nameBn && (
                          <div className="text-[11px] text-slate-500 font-medium">
                            {student.name}
                          </div>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-700">
                        {student.fatherNameBn || student.fatherName || '—'}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-700">
                        {student.registrationNo || '—'}
                      </td>
                      <td className="py-2 px-3 text-slate-600">
                        {student.class || student.classId || ''} {student.group ? `• ${student.group}` : ''}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {isAlreadyEnrolled ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                            <CheckCircle2 className="w-3 h-3 text-slate-500" />
                            যুক্ত আছে
                          </span>
                        ) : missingFields.length > 0 ? (
                          <span 
                            title={`অনুপস্থিত: ${missingFields.join(', ')}`}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            অসম্পূর্ণ ({missingFields.length})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            যোগযোগ্য
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600">
            নির্বাচিত <strong className="text-emerald-700">{selectedStudentIds.size}</strong> জন শিক্ষার্থীকে <strong className="text-slate-800">{activeExam.displayNameBn}</strong> রোস্টারে যুক্ত করা হবে।
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
            >
              বাতিল
            </button>
            <button
              type="button"
              disabled={selectedStudentIds.size === 0}
              onClick={handleConfirmImport}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 disabled:pointer-events-none rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>ইমপোর্ট সম্পন্ন করুন ({selectedStudentIds.size})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
