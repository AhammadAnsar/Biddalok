import React, { useState, useRef } from 'react';
import { X, Download, FileSpreadsheet, Database, Loader2, CheckCircle2, Filter, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ExamResult, Student } from '../types';
import { normalizeClassName, normalizeSession } from '../utils/classNormalizer';
import { extractDobFromRow } from '../utils/dateNormalizer';
import { processAsyncBatch } from '../utils/asyncBatch';
import * as XLSX from 'xlsx';

interface TestimonialImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestimonialImportModal: React.FC<TestimonialImportModalProps> = ({ isOpen, onClose }) => {
  const { 
    language, 
    students, 
    examResults, 
    bulkAddExamResults, 
    bulkAddStudents, 
    academicClasses,
    academicGroups,
    academicSections
  } = useAppStore();
  
  const isBn = language === 'bn';
  const [importMode, setImportMode] = useState<'db' | 'excel'>('db');
  
  const classesList = Array.isArray(academicClasses) ? academicClasses : [];
  const groupsList = Array.isArray(academicGroups) ? academicGroups : [];
  const sectionsList = Array.isArray(academicSections) ? academicSections : [];
  
  const defaultClass = classesList.find(c => c.isDefault)?.name || classesList[0]?.name || 'Class 10';
  const defaultGroup = groupsList[0]?.name || 'Science';
  const defaultSection = sectionsList[0]?.name || 'ক';

  // Available sessions in DB
  const availableSessions = Array.from(
    new Set((students || []).map(s => s.session).filter(Boolean))
  );

  // For DB import filters
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedSection, setSelectedSection] = useState('all');
  const [selectedSession, setSelectedSession] = useState('all');
  const [examName, setExamName] = useState('SSC 2026');

  // For Excel import targets
  const [excelTargetClass, setExcelTargetClass] = useState(defaultClass);
  const [excelTargetGroup, setExcelTargetGroup] = useState(defaultGroup);
  const [excelTargetSection, setExcelTargetSection] = useState(defaultSection);
  const [excelTargetSession, setExcelTargetSession] = useState(new Date().getFullYear().toString());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  // Matching students for DB import preview
  const studentList = Array.isArray(students) ? students : [];
  const matchingStudents = studentList.filter(s => {
    const matchClass = selectedClass === 'all' || s.class === selectedClass;
    const matchGroup = selectedGroup === 'all' || s.group === selectedGroup;
    const matchSection = selectedSection === 'all' || s.section === selectedSection;
    const matchSession = selectedSession === 'all' || s.session === selectedSession;
    return matchClass && matchGroup && matchSection && matchSession;
  });

  const handleDbImport = () => {
    if (matchingStudents.length === 0) {
      alert(isBn ? 'নির্বাচিত ফিল্টারে কোনো শিক্ষার্থী পাওয়া যায়নি।' : 'No students found for the selected criteria.');
      return;
    }

    const newResults: ExamResult[] = [];
    matchingStudents.forEach(s => {
      const exists = (examResults || []).some(er => er.studentDbId === s.id && er.examName === examName);
      if (!exists) {
        newResults.push({
          id: Date.now().toString() + Math.random().toString().slice(2, 6),
          studentDbId: s.id,
          studentId: s.studentId,
          name: s.name,
          nameBn: s.nameBn || '',
          fatherName: s.fatherName || '',
          fatherNameBn: s.fatherNameBn || '',
          motherName: s.motherName || '',
          motherNameBn: s.motherNameBn || '',
          dateOfBirth: s.dateOfBirth || '',
          gender: s.gender || 'Male',
          village: s.village || '',
          postOffice: s.postOffice || '',
          upazila: s.upazila || '',
          district: s.district || '',
          
          examName: examName,
          passingYear: s.passingYear || new Date().getFullYear().toString(),
          session: s.session || (selectedSession !== 'all' ? selectedSession : ''),
          group: s.group || (selectedGroup !== 'all' ? selectedGroup : 'Science'),
          boardRollNo: s.roll || '',
          registrationNo: s.registrationNo || '',
          gpa: s.gpa || '5.00',
          board: s.board || 'Dhaka',
          photo: s.photo || ''
        });
      }
    });

    if (newResults.length > 0) {
      bulkAddExamResults(newResults);
      alert(isBn ? `${newResults.length} জন শিক্ষার্থীর তথ্য সফলভাবে যুক্ত হয়েছে!` : `Successfully imported ${newResults.length} students!`);
      onClose();
    } else {
      alert(isBn ? 'নির্বাচিত সকল শিক্ষার্থীর তথ্য আগেই এই পরীক্ষার তালিকায় বিদ্যমান রয়েছে।' : 'All selected students are already in this exam list.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'array' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const newResults: ExamResult[] = [];
        const newStudentsToCreate: Student[] = [];

        await processAsyncBatch(
          data,
          (row: any, index: number) => {
            const rawClass = row['Class'] || row['class'] || row['শ্রেণি'] || row['শ্রেণী'] || excelTargetClass;
            const normalizedClass = normalizeClassName(String(rawClass), classesList, excelTargetClass);
            
            const rawGroup = row['Group'] || row['group'] || row['বিভাগ'] || row['গ্রুপ'] || excelTargetGroup;
            const rawSection = row['Section'] || row['section'] || row['শাখা'] || excelTargetSection;
            const rawSession = row['Session'] || row['session'] || row['শিক্ষাবর্ষ'] || excelTargetSession;
            const normalizedSess = normalizeSession(String(rawSession), excelTargetSession);

            const studentId = String(row['Student ID'] || row['ID'] || row['আইডি'] || `IMP-${Date.now().toString().slice(-4)}-${index + 1}`);
            const name = String(row['Name'] || row['Name (English)'] || row['নাম'] || row['শিক্ষার্থীর নাম'] || '');
            const nameBn = String(row['Name (Bangla)'] || row['Bangla Name'] || row['বাংলা নাম'] || '');
            const fatherName = String(row['Father Name'] || row['Father Name (English)'] || row["Father's Name"] || row['পিতার নাম'] || '');
            const fatherNameBn = String(row['Father Name (Bangla)'] || row["Father's Name (Bangla)"] || '');
            const motherName = String(row['Mother Name'] || row['Mother Name (English)'] || row["Mother's Name"] || row['মাতার নাম'] || '');
            const motherNameBn = String(row['Mother Name (Bangla)'] || row["Mother's Name (Bangla)"] || '');
            const dob = extractDobFromRow(row);
            const gender = (row['Gender'] === 'Female' || row['লিঙ্গ'] === 'মেয়ে' || row['লিঙ্গ'] === 'ছাত্রী' ? 'Female' : 'Male') as any;
            const village = String(row['Village'] || row['Permanent Village'] || row['গ্রাম'] || '');
            const postOffice = String(row['Post Office'] || row['Permanent Post Office'] || row['ডাকঘর'] || '');
            const upazila = String(row['Upazila'] || row['Permanent Upazila'] || row['উপজেলা'] || '');
            const district = String(row['District'] || row['Permanent District'] || row['জেলা'] || '');
            const passYear = String(row['Passing Year'] || row['পাশের সন'] || new Date().getFullYear().toString());
            const group = String(rawGroup);
            const section = String(rawSection);
            const boardRoll = String(row['Board Roll'] || row['Board Roll No'] || row['Roll'] || row['বোর্ড রোল'] || row['রোল'] || '');
            const regNo = String(row['Registration No'] || row['রেজিস্ট্রেশন নং'] || '');
            const gpaVal = String(row['GPA'] || row['জিপিএ'] || row['ফল'] || '5.00');
            const boardName = String(row['Board'] || row['বোর্ড'] || 'Dhaka');
            const exName = String(row['Exam Name'] || row['পরীক্ষার নাম'] || examName || 'SSC 2026');

            // Check if student exists in store
            let matchedStudent = studentList.find(s => s.studentId === studentId || (s.name.toLowerCase() === name.toLowerCase() && s.roll === boardRoll));
            let studentDbId = matchedStudent ? matchedStudent.id : '';

            if (!matchedStudent && name) {
              const newSt: Student = {
                id: Date.now().toString() + index,
                studentId: studentId,
                name: name,
                nameBn: nameBn,
                fatherName: fatherName,
                fatherNameBn: fatherNameBn,
                motherName: motherName,
                motherNameBn: motherNameBn,
                dateOfBirth: dob,
                gender: gender,
                class: normalizedClass,
                group: group,
                section: section,
                roll: boardRoll || (index + 1).toString(),
                session: normalizedSess,
                village: village,
                postOffice: postOffice,
                upazila: upazila,
                district: district,
                passingYear: passYear,
                registrationNo: regNo,
                gpa: gpaVal,
                board: boardName,
                religion: 'Islam',
                nationality: 'বাংলাদেশি',
                bloodGroup: 'পরীক্ষা করা হয় নাই',
                isAddressSame: true,
                presentVillage: village,
                presentPostOffice: postOffice,
                presentUpazila: upazila,
                presentDistrict: district,
                fatherMobile: '',
                fatherNid: '',
                motherMobile: '',
                motherNid: '',
                parentsStatus: 'দুজনেই জীবিত',
                prevSchoolName: '',
                prevClass: '',
                admissionPayment: '',
                paymentMethod: 'নগদ / ক্যাশ',
                transactionNo: '',
                photo: ''
              };
              newStudentsToCreate.push(newSt);
              studentDbId = newSt.id;
            }

            if (name) {
              newResults.push({
                id: Date.now().toString() + index.toString() + Math.random().toString().slice(2, 6),
                studentDbId: studentDbId || (Date.now().toString() + index),
                studentId: studentId,
                name: name,
                nameBn: nameBn,
                fatherName: fatherName,
                fatherNameBn: fatherNameBn,
                motherName: motherName,
                motherNameBn: motherNameBn,
                dateOfBirth: dob,
                gender: gender,
                village: village,
                postOffice: postOffice,
                upazila: upazila,
                district: district,
                examName: exName,
                passingYear: passYear,
                session: normalizedSess,
                group: group,
                boardRollNo: boardRoll,
                registrationNo: regNo,
                gpa: gpaVal,
                board: boardName
              });
            }
          },
          { chunkSize: 35 }
        );

        if (newStudentsToCreate.length > 0) {
          bulkAddStudents(newStudentsToCreate);
        }

        if (newResults.length > 0) {
          bulkAddExamResults(newResults);
          alert(isBn ? `${newResults.length} জন শিক্ষার্থীর ডাটা সফলভাবে ইমপোর্ট সম্পন্ন হয়েছে!` : `Successfully imported ${newResults.length} students!`);
          onClose();
        } else {
          alert(isBn ? 'ফাইলে কোনো সঠিক শিক্ষার্থীর তথ্য পাওয়া যায়নি।' : 'No valid data found in the file.');
        }
      } catch (error) {
        console.error('Error parsing Excel:', error);
        alert(isBn ? 'ফাইল ইমপোর্টে সমস্যা হয়েছে।' : 'Error importing file.');
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadSampleExcel = () => {
    const wsData = [
      [
        'Student ID', 'Name', 'Name (Bangla)', 'Father Name', 'Father Name (Bangla)', 
        'Mother Name', 'Mother Name (Bangla)', 'Date of Birth', 'Gender', 
        'Village', 'Post Office', 'Upazila', 'District', 
        'Class', 'Group', 'Section', 'Session', 
        'Exam Name', 'Passing Year', 'Board Roll', 'Registration No', 'GPA', 'Board'
      ],
      [
        'STU-2026-001', 'John Doe', 'জন ডো', 'Richard Doe', 'রিচার্ড ডো', 
        'Jane Doe', 'জেন ডো', '2010-05-15', 'Male', 
        'আজিয়ারা', 'আজিয়ারা', 'নাঙ্গলকোট', 'কুমিল্লা', 
        excelTargetClass, excelTargetGroup, excelTargetSection, excelTargetSession, 
        examName, '2026', '123456', '987654321', '5.00', 'Dhaka'
      ]
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students_Sample');
    XLSX.writeFile(wb, `Student_Import_${examName.replace(/\s+/g, '_')}.xlsx`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/90">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isBn ? 'শিক্ষার্থী ডাটা ইমপোর্ট' : 'Import Student Records'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isBn ? 'প্রশংসাপত্র ও প্রত্যয়নপত্র তৈরির জন্য শিক্ষার্থী যুক্ত করুন' : 'Import records for Testimonials & Attestations'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-200 text-slate-500 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Mode Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 p-1 gap-1">
          <button 
            onClick={() => setImportMode('db')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              importMode === 'db' 
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" /> {isBn ? 'ডাটাবেস থেকে ইমপোর্ট' : 'From Database'}
          </button>
          <button 
            onClick={() => setImportMode('excel')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              importMode === 'excel' 
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/80' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> {isBn ? 'এক্সেল ফাইল আপলোড' : 'From Excel File'}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {importMode === 'db' ? (
            <div className="space-y-4">
              
              {/* Exam Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'পরীক্ষার নাম *' : 'Exam Name *'}
                </label>
                <input 
                  type="text" 
                  value={examName} 
                  onChange={e => setExamName(e.target.value)} 
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none" 
                  placeholder="e.g. SSC 2026, JSC 2025" 
                />
              </div>

              {/* Filters Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                
                {/* Class */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {isBn ? 'শ্রেণি' : 'Class'}
                  </label>
                  <select 
                    value={selectedClass} 
                    onChange={e => setSelectedClass(e.target.value)} 
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="all">{isBn ? 'সকল শ্রেণি' : 'All Classes'}</option>
                    {classesList.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Group */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {isBn ? 'বিভাগ (Group)' : 'Group'}
                  </label>
                  <select 
                    value={selectedGroup} 
                    onChange={e => setSelectedGroup(e.target.value)} 
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="all">{isBn ? 'সকল বিভাগ' : 'All Groups'}</option>
                    {groupsList.map(g => (
                      <option key={g.id} value={g.name}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {isBn ? 'শাখা (Section)' : 'Section'}
                  </label>
                  <select 
                    value={selectedSection} 
                    onChange={e => setSelectedSection(e.target.value)} 
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="all">{isBn ? 'সকল শাখা' : 'All Sections'}</option>
                    {sectionsList.map(s => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Session */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {isBn ? 'শিক্ষাবর্ষ (Session)' : 'Session'}
                  </label>
                  <select 
                    value={selectedSession} 
                    onChange={e => setSelectedSession(e.target.value)} 
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="all">{isBn ? 'সকল সেশন' : 'All Sessions'}</option>
                    {availableSessions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between px-4 py-3 bg-indigo-50/70 border border-indigo-200/80 rounded-xl text-xs font-semibold text-indigo-900">
                <span>{isBn ? 'নির্বাচিত মানদণ্ডে মোট শিক্ষার্থী:' : 'Matching students found:'}</span>
                <span className="bg-indigo-600 text-white px-2.5 py-1 rounded-full text-xs font-bold">
                  {matchingStudents.length} {isBn ? 'জন' : 'students'}
                </span>
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Target Defaults Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {isBn ? 'টার্গেট শ্রেণি' : 'Target Class'}
                  </label>
                  <select 
                    value={excelTargetClass} 
                    onChange={e => setExcelTargetClass(e.target.value)} 
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold bg-white"
                  >
                    {classesList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {isBn ? 'টার্গেট বিভাগ' : 'Target Group'}
                  </label>
                  <select 
                    value={excelTargetGroup} 
                    onChange={e => setExcelTargetGroup(e.target.value)} 
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold bg-white"
                  >
                    {groupsList.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {isBn ? 'টার্গেট শাখা' : 'Target Section'}
                  </label>
                  <select 
                    value={excelTargetSection} 
                    onChange={e => setExcelTargetSection(e.target.value)} 
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold bg-white"
                  >
                    {sectionsList.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    {isBn ? 'শিক্ষাবর্ষ' : 'Session'}
                  </label>
                  <input 
                    type="text" 
                    value={excelTargetSession} 
                    onChange={e => setExcelTargetSession(e.target.value)} 
                    className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold bg-white"
                    placeholder="2026"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBn ? 'পরীক্ষার নাম' : 'Exam Name'}
                </label>
                <input 
                  type="text" 
                  value={examName} 
                  onChange={e => setExamName(e.target.value)} 
                  className="w-full border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-none" 
                  placeholder="SSC 2026" 
                />
              </div>
              
              <button 
                onClick={downloadSampleExcel}
                className="w-full py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-emerald-600" /> 
                {isBn ? 'কলাম সমন্বিত স্যাম্পল এক্সেল ডাউনলোড' : 'Download Template (.xlsx)'}
              </button>

              <div>
                <input 
                  type="file" 
                  accept=".xlsx, .xls" 
                  onChange={handleFileUpload} 
                  ref={fileInputRef}
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={importing}
                  className={`w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 ${importing ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                  {importing ? (isBn ? 'ইমপোর্ট প্রক্রিয়া চলছে...' : 'Importing...') : (isBn ? 'এক্সেল ফাইল নির্বাচন ও আপলোড' : 'Select & Upload Excel')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {importMode === 'db' && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2.5">
            <button 
              onClick={onClose} 
              className="px-4 py-2 text-xs text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 font-bold rounded-xl transition-colors"
            >
              {isBn ? 'বাতিল' : 'Cancel'}
            </button>
            <button 
              onClick={handleDbImport} 
              disabled={matchingStudents.length === 0 || !examName} 
              className="px-5 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-2 transition-colors shadow-sm"
            >
              <Database className="w-4 h-4" /> 
              {isBn ? 'ইমপোর্ট নিশ্চিত করুন' : 'Confirm Import'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
