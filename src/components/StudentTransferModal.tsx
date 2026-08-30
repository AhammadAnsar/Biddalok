import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  ArrowRightLeft, 
  ArrowRight, 
  Users, 
  CheckCircle2, 
  Layers, 
  GitFork, 
  BookmarkCheck, 
  Calendar, 
  Sparkles, 
  Search, 
  CheckSquare, 
  Square, 
  AlertCircle,
  Hash,
  Filter
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Student, AcademicClass, AcademicGroup, AcademicSection } from '../types';

interface StudentTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStudent?: Student | null;
  initialSelectedStudentIds?: string[];
}

export const StudentTransferModal: React.FC<StudentTransferModalProps> = ({
  isOpen,
  onClose,
  initialStudent,
  initialSelectedStudentIds
}) => {
  const { 
    language, 
    students, 
    academicClasses, 
    academicGroups, 
    academicSections, 
    bulkUpdateStudents 
  } = useAppStore();

  const isBn = language === 'bn';

  const classesList: AcademicClass[] = useMemo(() => Array.isArray(academicClasses) ? academicClasses : [], [academicClasses]);
  const groupsList: AcademicGroup[] = useMemo(() => Array.isArray(academicGroups) ? academicGroups : [], [academicGroups]);
  const sectionsList: AcademicSection[] = useMemo(() => Array.isArray(academicSections) ? academicSections : [], [academicSections]);
  const studentList: Student[] = useMemo(() => Array.isArray(students) ? students : [], [students]);

  // Active Mode: 'batch' (Filter & migrate) or 'single' (Individual student)
  const [transferMode, setTransferMode] = useState<'batch' | 'single'>('batch');

  // Available sessions in DB
  const availableSessions = useMemo(() => {
    const sSet = new Set<string>();
    const currentYr = new Date().getFullYear();
    sSet.add(currentYr.toString());
    sSet.add((currentYr + 1).toString());
    sSet.add((currentYr - 1).toString());
    studentList.forEach(s => {
      if (s.session) sSet.add(s.session);
    });
    return Array.from(sSet);
  }, [studentList]);

  // Source Filters for Batch Mode
  const [sourceSession, setSourceSession] = useState<string>('all');
  const [sourceClass, setSourceClass] = useState<string>('all');
  const [sourceGroup, setSourceGroup] = useState<string>('all');
  const [sourceSection, setSourceSection] = useState<string>('all');

  // Destination Targets
  const [targetSession, setTargetSession] = useState<string>('');
  const [targetClass, setTargetClass] = useState<string>('');
  const [targetGroup, setTargetGroup] = useState<string>('');
  const [targetSection, setTargetSection] = useState<string>('');

  // Roll Reassignment Options: 'keep' | 'auto_1' | 'custom_start'
  const [rollOption, setRollOption] = useState<'keep' | 'auto_1' | 'custom_start'>('keep');
  const [customStartRoll, setCustomStartRoll] = useState<number>(1);

  // Selected Student IDs for Transfer
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Single Student Mode State
  const [singleStudent, setSingleStudent] = useState<Student | null>(null);
  const [singleRoll, setSingleRoll] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSuccessMessage(null);
      setIsProcessing(false);
      setSearchTerm('');

      const defaultClass = classesList.find(c => c.isDefault)?.name || classesList[0]?.name || 'Class 6';
      const defaultGroup = groupsList.find(g => g.isDefault)?.name || groupsList[0]?.name || 'General';
      const defaultSection = sectionsList.find(s => s.isDefault)?.name || sectionsList[0]?.name || 'Section A';
      const currentYrStr = new Date().getFullYear().toString();

      if (initialStudent) {
        setTransferMode('single');
        setSingleStudent(initialStudent);
        setSingleRoll(initialStudent.roll || '1');
        setTargetSession(initialStudent.session || currentYrStr);
        setTargetClass(initialStudent.class || defaultClass);
        setTargetGroup(initialStudent.group || defaultGroup);
        setTargetSection(initialStudent.section || defaultSection);
      } else {
        setTransferMode('batch');
        setSingleStudent(null);
        setSourceSession('all');
        setSourceClass('all');
        setSourceGroup('all');
        setSourceSection('all');

        setTargetSession(currentYrStr);
        setTargetClass(defaultClass);
        setTargetGroup(defaultGroup);
        setTargetSection(defaultSection);

        if (initialSelectedStudentIds && initialSelectedStudentIds.length > 0) {
          setSelectedIds(new Set(initialSelectedStudentIds));
        } else {
          setSelectedIds(new Set());
        }
      }
    }
  }, [isOpen, initialStudent, initialSelectedStudentIds, classesList, groupsList, sectionsList]);

  // Filtered Source Students
  const eligibleSourceStudents = useMemo(() => {
    return studentList.filter(s => {
      if (sourceSession !== 'all' && s.session !== sourceSession) return false;
      if (sourceClass !== 'all' && s.class !== sourceClass) return false;
      if (sourceGroup !== 'all' && s.group !== sourceGroup) return false;
      if (sourceSection !== 'all' && s.section !== sourceSection) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        (s.name && s.name.toLowerCase().includes(term)) ||
        (s.nameBn && s.nameBn.includes(term)) ||
        (s.roll && s.roll.includes(term)) ||
        (s.studentId && s.studentId.toLowerCase().includes(term))
      );
    });
  }, [studentList, sourceSession, sourceClass, sourceGroup, sourceSection, searchTerm]);

  // When source filter changes and no pre-selection, auto-select all eligible students
  useEffect(() => {
    if (transferMode === 'batch' && !initialSelectedStudentIds?.length) {
      setSelectedIds(new Set(eligibleSourceStudents.map(s => s.id)));
    }
  }, [sourceSession, sourceClass, sourceGroup, sourceSection, eligibleSourceStudents.length, transferMode]);

  const handleToggleSelectAll = () => {
    if (selectedIds.size === eligibleSourceStudents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(eligibleSourceStudents.map(s => s.id)));
    }
  };

  const handleToggleStudent = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Execution: Batch Transfer
  const handleExecuteBatchTransfer = () => {
    if (selectedIds.size === 0) return;
    if (!targetClass) {
      alert(isBn ? 'অনুগ্রহ করে গন্তব্য শ্রেণি নির্বাচন করুন।' : 'Please select target class.');
      return;
    }

    setIsProcessing(true);

    const studentsToUpdate: Student[] = [];
    const selectedArray = studentList.filter(s => selectedIds.has(s.id));

    // Sort by roll ascending if auto renumbering
    if (rollOption === 'auto_1' || rollOption === 'custom_start') {
      selectedArray.sort((a, b) => (parseInt(a.roll) || 0) - (parseInt(b.roll) || 0));
    }

    let currentRollSeq = rollOption === 'custom_start' ? customStartRoll : 1;

    selectedArray.forEach((student, index) => {
      let newRoll = student.roll;
      if (rollOption === 'auto_1') {
        newRoll = (index + 1).toString();
      } else if (rollOption === 'custom_start') {
        newRoll = (currentRollSeq + index).toString();
      }

      studentsToUpdate.push({
        ...student,
        session: targetSession || student.session,
        class: targetClass,
        group: targetGroup || student.group,
        section: targetSection || student.section,
        roll: newRoll
      });
    });

    bulkUpdateStudents(studentsToUpdate);
    setIsProcessing(false);
    setSuccessMessage(
      isBn 
        ? `${studentsToUpdate.length} জন শিক্ষার্থীর শ্রেণি, বিভাগ ও শাখা সফলভাবে স্থানান্তরিত ও মাইগ্রেট হয়েছে!`
        : `Successfully transferred ${studentsToUpdate.length} students!`
    );

    setTimeout(() => {
      onClose();
    }, 1400);
  };

  // Execution: Single Student Transfer
  const handleExecuteSingleTransfer = () => {
    if (!singleStudent || !targetClass) return;

    setIsProcessing(true);
    const updated: Student = {
      ...singleStudent,
      session: targetSession || singleStudent.session,
      class: targetClass,
      group: targetGroup || singleStudent.group,
      section: targetSection || singleStudent.section,
      roll: singleRoll || singleStudent.roll
    };

    bulkUpdateStudents([updated]);
    setIsProcessing(false);
    setSuccessMessage(
      isBn 
        ? `শিক্ষার্থী ${singleStudent.name}-এর স্থানান্তর সফলভাবে সম্পন্ন হয়েছে!`
        : `Student ${singleStudent.name} transferred successfully!`
    );

    setTimeout(() => {
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col border border-slate-200 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-xs">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-800">
                  {isBn ? 'শিক্ষার্থী স্থানান্তর ও মাইগ্রেশন সেন্টার' : 'Student Transfer & Academic Migration'}
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {isBn ? 'আন্তঃ শ্রেণি / বিভাগ / শাখা' : 'Inter Class / Group / Section'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isBn 
                  ? 'এক শ্রেণি, বিভাগ বা শাখা থেকে অন্য শ্রেণি, বিভাগ বা শাখায় একক বা দলগতভাবে শিক্ষার্থীদের মাইগ্রেশন করুন' 
                  : 'Transfer and migrate students between sessions, classes, groups, and sections with automatic roll management'}
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

        {/* Mode Selector Tabs */}
        {!initialStudent && (
          <div className="flex border-b border-slate-200 bg-slate-50 px-6 py-2 gap-3 shrink-0">
            <button
              onClick={() => setTransferMode('batch')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                transferMode === 'batch'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{isBn ? 'দলগত / শ্রেণি ভিত্তিক মাইগ্রেশন (Batch)' : 'Batch / Class Migration'}</span>
            </button>
            <button
              onClick={() => setTransferMode('single')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                transferMode === 'single'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              <span>{isBn ? 'একক শিক্ষার্থী স্থানান্তর (Individual)' : 'Individual Student Transfer'}</span>
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold rounded-xl flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ===================== MODE 1: BATCH MIGRATION ===================== */}
          {transferMode === 'batch' && (
            <div className="space-y-6">
              {/* Dual Panel: Source vs Destination */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SOURCE PANEL */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm border-b border-slate-200 pb-2">
                    <Filter className="w-4 h-4 text-indigo-600" />
                    <span>{isBn ? '১. উৎস নির্বাচন (বর্তমান অবস্থান)' : '1. Select Source (Current Position)'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">{isBn ? 'উৎস সেশন' : 'Source Session'}</label>
                      <select
                        value={sourceSession}
                        onChange={(e) => setSourceSession(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="all">{isBn ? 'সকল সেশন' : 'All Sessions'}</option>
                        {availableSessions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">{isBn ? 'উৎস শ্রেণি' : 'Source Class'}</label>
                      <select
                        value={sourceClass}
                        onChange={(e) => setSourceClass(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="all">{isBn ? 'সকল শ্রেণি' : 'All Classes'}</option>
                        {classesList.map(c => <option key={c.id} value={c.name}>{c.name} {c.nameBn ? `(${c.nameBn})` : ''}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">{isBn ? 'উৎস বিভাগ' : 'Source Group'}</label>
                      <select
                        value={sourceGroup}
                        onChange={(e) => setSourceGroup(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="all">{isBn ? 'সকল বিভাগ' : 'All Groups'}</option>
                        {groupsList.map(g => <option key={g.id} value={g.name}>{g.name} {g.nameBn ? `(${g.nameBn})` : ''}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">{isBn ? 'উৎস শাখা' : 'Source Section'}</label>
                      <select
                        value={sourceSection}
                        onChange={(e) => setSourceSection(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="all">{isBn ? 'সকল শাখা' : 'All Sections'}</option>
                        {sectionsList.map(s => <option key={s.id} value={s.name}>{s.name} {s.nameBn ? `(${s.nameBn})` : ''}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-200">
                    <span>{isBn ? 'উপযুক্ত শিক্ষার্থী পাওয়া গেছে:' : 'Matching students found:'}</span>
                    <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                      {eligibleSourceStudents.length} {isBn ? 'জন' : ''}
                    </span>
                  </div>
                </div>

                {/* DESTINATION PANEL */}
                <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-200 space-y-4">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm border-b border-indigo-200/80 pb-2">
                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                    <span>{isBn ? '২. গন্তব্য নির্ধারণ (নতুন শ্রেণি/বিভাগ/শাখা)' : '2. Target Destination (New Details)'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-indigo-950 mb-1">
                        {isBn ? 'নতুন শিক্ষাবর্ষ (Session)' : 'Target Session'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={targetSession}
                        onChange={(e) => setTargetSession(e.target.value)}
                        className="w-full bg-white border border-indigo-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="e.g. 2026"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-indigo-950 mb-1">
                        {isBn ? 'নতুন শ্রেণি (Class)' : 'Target Class'} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={targetClass}
                        onChange={(e) => setTargetClass(e.target.value)}
                        className="w-full bg-white border border-indigo-300 rounded-xl px-3 py-2 text-xs font-bold text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {classesList.map(c => <option key={c.id} value={c.name}>{c.name} {c.nameBn ? `(${c.nameBn})` : ''}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-indigo-950 mb-1">
                        {isBn ? 'নতুন বিভাগ (Group)' : 'Target Group'} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={targetGroup}
                        onChange={(e) => setTargetGroup(e.target.value)}
                        className="w-full bg-white border border-indigo-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {groupsList.map(g => <option key={g.id} value={g.name}>{g.name} {g.nameBn ? `(${g.nameBn})` : ''}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-indigo-950 mb-1">
                        {isBn ? 'নতুন শাখা (Section)' : 'Target Section'} <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={targetSection}
                        onChange={(e) => setTargetSection(e.target.value)}
                        className="w-full bg-white border border-indigo-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {sectionsList.map(s => <option key={s.id} value={s.name}>{s.name} {s.nameBn ? `(${s.nameBn})` : ''}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Roll Reassignment Method */}
                  <div className="pt-2 border-t border-indigo-200/80">
                    <label className="block text-xs font-semibold text-indigo-950 mb-1.5 flex items-center gap-1">
                      <Hash className="w-3.5 h-3.5 text-indigo-600" />
                      {isBn ? 'রোল নম্বর বিন্যাস পদ্ধতি:' : 'Roll Numbering Option:'}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${rollOption === 'keep' ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : 'bg-white text-slate-700 border-slate-300'}`}>
                        <input type="radio" name="rollOpt" checked={rollOption === 'keep'} onChange={() => setRollOption('keep')} className="hidden" />
                        <span>{isBn ? 'বর্তমান রোল রাখুন' : 'Keep Current Roll'}</span>
                      </label>
                      <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${rollOption === 'auto_1' ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : 'bg-white text-slate-700 border-slate-300'}`}>
                        <input type="radio" name="rollOpt" checked={rollOption === 'auto_1'} onChange={() => setRollOption('auto_1')} className="hidden" />
                        <span>{isBn ? '১ থেকে ক্রমানুসারে' : 'Auto 1, 2, 3...'}</span>
                      </label>
                      <label className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer ${rollOption === 'custom_start' ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : 'bg-white text-slate-700 border-slate-300'}`}>
                        <input type="radio" name="rollOpt" checked={rollOption === 'custom_start'} onChange={() => setRollOption('custom_start')} className="hidden" />
                        <span>{isBn ? 'কাস্টম রোল থেকে' : 'Custom Start Roll'}</span>
                      </label>
                    </div>

                    {rollOption === 'custom_start' && (
                      <div className="mt-2 flex items-center gap-2 bg-white p-2 rounded-lg border border-indigo-200">
                        <span className="text-xs text-slate-600">{isBn ? 'শুরুর রোল নম্বর:' : 'Starting Roll:'}</span>
                        <input
                          type="number"
                          min="1"
                          value={customStartRoll}
                          onChange={(e) => setCustomStartRoll(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 px-2 py-1 border border-slate-300 rounded text-xs font-bold text-center outline-none"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Student Checklist Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-100 shadow-2xs"
                    >
                      {selectedIds.size === eligibleSourceStudents.length && eligibleSourceStudents.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                      <span>
                        {selectedIds.size === eligibleSourceStudents.length && eligibleSourceStudents.length > 0
                          ? (isBn ? 'সবগুলো আন-সিলেক্ট করুন' : 'Deselect All')
                          : (isBn ? 'সবগুলো নির্বাচন করুন' : 'Select All')}
                      </span>
                    </button>

                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                      {isBn 
                        ? `${selectedIds.size} / ${eligibleSourceStudents.length} জন নির্বাচিত` 
                        : `${selectedIds.size} of ${eligibleSourceStudents.length} selected`}
                    </span>
                  </div>

                  <div className="relative w-full sm:w-60">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={isBn ? 'শিক্ষার্থী খুঁজুন...' : 'Search student...'}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {eligibleSourceStudents.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      {isBn ? 'উৎস ফিল্টারের সাথে মিলে এমন কোনো শিক্ষার্থী পাওয়া যায়নি।' : 'No students found matching current source filters.'}
                    </div>
                  ) : (
                    eligibleSourceStudents.map(student => {
                      const isSelected = selectedIds.has(student.id);
                      return (
                        <div
                          key={student.id}
                          onClick={() => handleToggleStudent(student.id)}
                          className={`p-3 px-4 flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected ? 'bg-indigo-50/40 hover:bg-indigo-50/70' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // handled by parent onClick
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-800 text-xs">{student.name}</span>
                                {student.nameBn && (
                                  <span className="text-[11px] text-slate-500">({student.nameBn})</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span>{isBn ? 'আইডি:' : 'ID:'} {student.studentId}</span>
                                <span>•</span>
                                <span>{isBn ? 'শ্রেণি:' : 'Class:'} {student.class}</span>
                                <span>•</span>
                                <span>{isBn ? 'বিভাগ:' : 'Group:'} {student.group || '-'}</span>
                                <span>•</span>
                                <span>{isBn ? 'শাখা:' : 'Section:'} {student.section || '-'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200">
                              {isBn ? 'রোল:' : 'Roll:'} {student.roll || '-'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ===================== MODE 2: SINGLE STUDENT TRANSFER ===================== */}
          {transferMode === 'single' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              {!initialStudent && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {isBn ? 'স্থানান্তরের জন্য শিক্ষার্থী নির্বাচন করুন:' : 'Select Student to Transfer:'}
                  </label>
                  <select
                    value={singleStudent?.id || ''}
                    onChange={(e) => {
                      const found = studentList.find(s => s.id === e.target.value);
                      if (found) {
                        setSingleStudent(found);
                        setSingleRoll(found.roll || '1');
                        setTargetClass(found.class || classesList[0]?.name || 'Class 6');
                        setTargetGroup(found.group || groupsList[0]?.name || 'General');
                        setTargetSection(found.section || sectionsList[0]?.name || 'Section A');
                        setTargetSession(found.session || new Date().getFullYear().toString());
                      }
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">{isBn ? '-- শিক্ষার্থী বাছুন --' : '-- Choose a Student --'}</option>
                    {studentList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.studentId}) - {s.class} [{s.group || ''} / {s.section || ''}] Roll: {s.roll}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {singleStudent && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                  {/* Current Summary Card */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase text-slate-500">{isBn ? 'বর্তমান তথ্য' : 'Current Details'}</span>
                      <span className="text-xs font-mono font-bold text-indigo-600">{singleStudent.studentId}</span>
                    </div>
                    <h3 className="font-bold text-base text-slate-800">{singleStudent.name} {singleStudent.nameBn ? `(${singleStudent.nameBn})` : ''}</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs text-slate-600">
                      <div><span className="text-slate-400">{isBn ? 'সেশন:' : 'Session:'}</span> <span className="font-semibold">{singleStudent.session || '-'}</span></div>
                      <div><span className="text-slate-400">{isBn ? 'শ্রেণি:' : 'Class:'}</span> <span className="font-semibold">{singleStudent.class || '-'}</span></div>
                      <div><span className="text-slate-400">{isBn ? 'বিভাগ:' : 'Group:'}</span> <span className="font-semibold">{singleStudent.group || '-'}</span></div>
                      <div><span className="text-slate-400">{isBn ? 'শাখা/রোল:' : 'Sec/Roll:'}</span> <span className="font-semibold">{singleStudent.section || '-'} / {singleStudent.roll || '-'}</span></div>
                    </div>
                  </div>

                  {/* Transfer Destination Form */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-indigo-900 border-b border-indigo-100 pb-2">
                      {isBn ? 'নতুন স্থানান্তরিত শ্রেণি, বিভাগ ও রোল নির্ধারণ' : 'Set New Destination & Roll'}
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isBn ? 'নতুন শিক্ষাবর্ষ (Session)' : 'New Session'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={targetSession}
                          onChange={(e) => setTargetSession(e.target.value)}
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="2026"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isBn ? 'নতুন শ্রেণি (Class)' : 'New Class'} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={targetClass}
                          onChange={(e) => setTargetClass(e.target.value)}
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                          {classesList.map(c => (
                            <option key={c.id} value={c.name}>{c.name} {c.nameBn ? `(${c.nameBn})` : ''}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isBn ? 'নতুন বিভাগ (Group)' : 'New Group'} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={targetGroup}
                          onChange={(e) => setTargetGroup(e.target.value)}
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                          {groupsList.map(g => (
                            <option key={g.id} value={g.name}>{g.name} {g.nameBn ? `(${g.nameBn})` : ''}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isBn ? 'নতুন শাখা (Section)' : 'New Section'} <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={targetSection}
                          onChange={(e) => setTargetSection(e.target.value)}
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        >
                          {sectionsList.map(s => (
                            <option key={s.id} value={s.name}>{s.name} {s.nameBn ? `(${s.nameBn})` : ''}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          {isBn ? 'নতুন রোল নম্বর (Roll No)' : 'New Roll Number'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={singleRoll}
                          onChange={(e) => setSingleRoll(e.target.value)}
                          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                          placeholder="e.g. 1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {transferMode === 'batch' ? (
              <span>
                {isBn 
                  ? `নির্বাচিত ${selectedIds.size} জন শিক্ষার্থীকে [${targetClass} / ${targetGroup} / ${targetSection}] এ স্থানান্তর করা হবে`
                  : `Migrating ${selectedIds.size} students to [${targetClass} / ${targetGroup} / ${targetSection}]`}
              </span>
            ) : (
              <span>{isBn ? 'স্থানান্তর শেষে শিক্ষার্থীর প্রোফাইল স্বয়ংক্রিয়ভাবে আপডেট হবে' : 'Student profile will be updated immediately'}</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 bg-slate-100 rounded-xl transition-colors text-sm"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>

            {transferMode === 'batch' ? (
              <button
                onClick={handleExecuteBatchTransfer}
                disabled={isProcessing || selectedIds.size === 0 || !targetClass}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>
                  {isProcessing 
                    ? (isBn ? 'মাইগ্রেশন হচ্ছে...' : 'Migrating...') 
                    : (isBn ? `${selectedIds.size} জন শিক্ষার্থী মাইগ্রেট করুন` : `Migrate ${selectedIds.size} Students`)}
                </span>
              </button>
            ) : (
              <button
                onClick={handleExecuteSingleTransfer}
                disabled={isProcessing || !singleStudent || !targetClass}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>
                  {isProcessing ? (isBn ? 'স্থানান্তর হচ্ছে...' : 'Transferring...') : (isBn ? 'স্থানান্তর নিশ্চিত করুন' : 'Confirm Transfer')}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
