import React, { useState, useRef, useMemo, useCallback } from 'react';
import { 
  UserPlus, FileSpreadsheet, Wand2, Download, Upload, 
  ArrowRight, Users, CheckCircle2, 
  Clock, Search, Eye, Edit3, Trash2, School, 
  CreditCard, Sparkles, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Student } from '../types';
import { StudentEnrollmentModal } from '../components/StudentEnrollmentModal';
import { AddStudentHubModal } from '../components/AddStudentHubModal';
import { SmartImportModal } from '../components/SmartImportModal';
import { StudentProfileModal } from '../components/StudentProfileModal';
import { generateStudentId } from '../utils/generateId';
import { normalizeClassName, normalizeGroupName, normalizeSectionName, normalizeSession } from '../utils/classNormalizer';
import { extractDobFromRow, parseExcelDate } from '../utils/dateNormalizer';
import { processAsyncBatch } from '../utils/asyncBatch';
import * as XLSX from 'xlsx';

const AdmissionEnrollment = () => {
  const language = useAppStore(state => state.language);
  const students = useAppStore(state => state.students);
  const academicClasses = useAppStore(state => state.academicClasses);
  const academicGroups = useAppStore(state => state.academicGroups);
  const academicSections = useAppStore(state => state.academicSections);
  const addStudent = useAppStore(state => state.addStudent);
  const updateStudent = useAppStore(state => state.updateStudent);
  const deleteStudent = useAppStore(state => state.deleteStudent);
  const bulkAddStudents = useAppStore(state => state.bulkAddStudents);

  const isBn = language === 'bn';

  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [showHubModal, setShowHubModal] = useState(false);
  const [showSmartModal, setShowSmartModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [smartData, setSmartData] = useState<Partial<Student> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [isImporting, setIsImporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const studentList = useMemo(() => Array.isArray(students) ? students : [], [students]);
  const classesList = useMemo(() => Array.isArray(academicClasses) ? academicClasses : [], [academicClasses]);
  const groupsList = useMemo(() => Array.isArray(academicGroups) ? academicGroups : [], [academicGroups]);
  const sectionsList = useMemo(() => Array.isArray(academicSections) ? academicSections : [], [academicSections]);

  // Memoized Metrics
  const { totalStudents, maleStudents, femaleStudents, thisYearStudents } = useMemo(() => {
    const currentYear = new Date().getFullYear().toString();
    let male = 0;
    let female = 0;
    let thisYear = 0;

    studentList.forEach(s => {
      if (s.gender === 'Male') male++;
      else if (s.gender === 'Female') female++;

      if (s.session?.includes(currentYear) || s.applicationDate?.startsWith(currentYear)) {
        thisYear++;
      }
    });

    return {
      totalStudents: studentList.length,
      maleStudents: male,
      femaleStudents: female,
      thisYearStudents: thisYear
    };
  }, [studentList]);

  const handleSaveStudent = useCallback((data: Partial<Student>) => {
    if (editingStudent) {
      updateStudent(editingStudent.id, data);
    } else {
      const newStudent: Student = {
        ...data,
        id: Date.now().toString(),
      } as Student;
      addStudent(newStudent);
    }
    setShowEnrollModal(false);
    setEditingStudent(null);
    setSmartData(null);
  }, [editingStudent, updateStudent, addStudent]);

  const handleSmartImportSubmit = (parsed: Partial<Student>) => {
    setSmartData(parsed);
    setEditingStudent(null);
    setShowSmartModal(false);
    setShowEnrollModal(true);
  };

  const handleBulkExcelImport = (newStudents: Student[]) => {
    bulkAddStudents(newStudents);
    showToast(isBn ? `${newStudents.length} জন শিক্ষার্থীর ডাটা সফলভাবে সেভ হয়েছে!` : `${newStudents.length} Students imported successfully!`);
    setShowHubModal(false);
  };

  const downloadSampleExcel = () => {
    const defaultGroup = groupsList.find(g => g.isDefault)?.name || 'প্রযোজ্য নয়';
    const defaultSection = sectionsList.find(s => s.isDefault)?.name || 'প্রযোজ্য নয়';

    const wsData = [
      ['Student ID', 'Form No', 'Application Date', 'Session', 'Class', 'Group', 'Section', 'Roll', 'Name (English)', 'Name (Bangla)', 
       'Birth Registration No', 'Date of Birth', 'Gender', 'Religion', 'Nationality', 'Blood Group',
       'Permanent Village', 'Permanent Post Office', 'Permanent Upazila', 'Permanent District',
       'Present Village', 'Present Post Office', 'Present Upazila', 'Present District',
       'Father Name (English)', 'Father Name (Bangla)', 'Father NID', 'Father Mobile', 'Father Profession',
       'Mother Name (English)', 'Mother Name (Bangla)', 'Mother NID', 'Mother Mobile', 'Mother Profession',
       'Parents Status', 'Previous School', 'Previous Class', 'Admission Payment', 'Payment Method', 'Transaction No'],
      ['', '1001', '2026-01-01', '2026', '6', defaultGroup, defaultSection, '1', 'John Doe', 'জন ডো', 
       '12345678901234567', '2010-05-15', 'Male', 'Islam', 'বাংলাদেশি', 'A+',
       'নাঙ্গলকোট', 'নাঙ্গলকোট', 'নাঙ্গলকোট', 'কুমিল্লা',
       'নাঙ্গলকোট', 'নাঙ্গলকোট', 'নাঙ্গলকোট', 'কুমিল্লা',
       'Richard Doe', 'রিচার্ড ডো', '9876543210', '01700000000', 'Business',
       'Jane Doe', 'জেন ডো', '1234567890', '01800000000', 'Housewife',
       'দুজনেই জীবিত', 'Sample Primary School', '5', '1000', 'বিকাশ', 'TRX123456']
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample');
    XLSX.writeFile(wb, 'student_enrollment_import_format.xlsx');
  };

  const handleDirectExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const defaultClass = classesList.find(c => c.isDefault)?.name || classesList[0]?.name || 'Class 6';
      const defaultGroup = groupsList.find(g => g.isDefault)?.name || groupsList[0]?.name || 'প্রযোজ্য নয়';
      const defaultSection = sectionsList.find(s => s.isDefault)?.name || sectionsList[0]?.name || 'প্রযোজ্য নয়';
      const currentYearStr = new Date().getFullYear().toString();

      const newStudents = await processAsyncBatch<any, Student>(
        data,
        (row: any, index: number) => {
          const rawClass = row['Class'] || row['class'] || row['শ্রেণি'] || row['শ্রেণী'] || defaultClass;
          const normalizedClass = normalizeClassName(String(rawClass), classesList, defaultClass);
          const normalizedSess = normalizeSession(String(row['Session'] || row['session'] || row['শিক্ষাবর্ষ'] || currentYearStr), currentYearStr);

          const rawGroup = row['Group'] || row['group'] || row['বিভাগ'] || row['শাখা/বিভাগ'] || defaultGroup;
          const normalizedGroup = normalizeGroupName(String(rawGroup), groupsList, defaultGroup);

          const rawSection = row['Section'] || row['section'] || row['শাখা'] || defaultSection;
          const normalizedSection = normalizeSectionName(String(rawSection), sectionsList, defaultSection);

          const generatedId = generateStudentId(normalizedClass, studentList);
          const fallbackId = `${generatedId.slice(0,4)}${(parseInt(generatedId.slice(4)) + index).toString().padStart(3, '0')}`;
          
          return {
            id: Date.now().toString() + index,
            studentId: String(row['Student ID'] || row['ID'] || row['আইডি'] || fallbackId),
            formNo: String(row['Form No'] || row['ফরম নং'] || ''),
            applicationDate: parseExcelDate(row['Application Date']) || new Date().toISOString().split('T')[0],
            session: normalizedSess,
            class: normalizedClass,
            group: normalizedGroup,
            section: normalizedSection,
            roll: String(row['Roll'] || row['roll'] || row['রোল'] || (index + 1)),
            name: String(row['Name (English)'] || row['Name'] || row['নাম'] || ''),
            nameBn: String(row['Name (Bangla)'] || row['Bangla Name'] || row['বাংলা নাম'] || ''),
            birthRegistrationNo: String(row['Birth Registration No'] || row['জন্ম নিবন্ধন'] || ''),
            dateOfBirth: extractDobFromRow(row),
            gender: (row['Gender'] === 'Female' || row['লিঙ্গ'] === 'মেয়ে' || row['লিঙ্গ'] === 'ছাত্রী' ? 'Female' : row['Gender'] === 'Other' ? 'Other' : 'Male') as any,
            religion: String(row['Religion'] || row['ধর্ম'] || 'Islam'),
            nationality: String(row['Nationality'] || row['জাতীয়তা'] || 'বাংলাদেশি'),
            bloodGroup: String(row['Blood Group'] || row['রক্তের গ্রুপ'] || 'পরীক্ষা করা হয় নাই'),
            village: String(row['Permanent Village'] || row['Village'] || row['গ্রাম'] || ''),
            postOffice: String(row['Permanent Post Office'] || row['Post Office'] || row['ডাকঘর'] || ''),
            upazila: String(row['Permanent Upazila'] || row['Upazila'] || row['উপজেলা'] || ''),
            district: String(row['Permanent District'] || row['District'] || row['জেলা'] || ''),
            isAddressSame: false,
            presentVillage: String(row['Present Village'] || row['Village'] || row['গ্রাম'] || ''),
            presentPostOffice: String(row['Present Post Office'] || row['Post Office'] || row['ডাকঘর'] || ''),
            presentUpazila: String(row['Present Upazila'] || row['Upazila'] || row['উপজেলা'] || ''),
            presentDistrict: String(row['Present District'] || row['District'] || row['জেলা'] || ''),
            fatherName: String(row['Father Name (English)'] || row["Father's Name (English)"] || row['পিতার নাম (ইংরেজি)'] || row['পিতার নাম'] || ''),
            fatherNameBn: String(row['Father Name (Bangla)'] || row["Father's Name (Bangla)"] || row['পিতার নাম (বাংলা)'] || ''),
            fatherNid: String(row['Father NID'] || row['পিতার এনআইডি'] || ''),
            fatherMobile: String(row['Father Mobile'] || row['Mobile'] || row['মোবাইল'] || ''),
            fatherProfession: String(row['Father Profession'] || ''),
            motherName: String(row['Mother Name (English)'] || row["Mother's Name (English)"] || row['মাতার নাম (ইংরেজি)'] || row['মাতার নাম'] || ''),
            motherNameBn: String(row['Mother Name (Bangla)'] || row["Mother's Name (Bangla)"] || row['মাতার নাম (বাংলা)'] || ''),
            motherNid: String(row['Mother NID'] || row['মাতার এনআইডি'] || ''),
            motherMobile: String(row['Mother Mobile'] || ''),
            motherProfession: String(row['Mother Profession'] || ''),
            parentsStatus: String(row['Parents Status'] || 'দুজনেই জীবিত'),
            prevSchoolName: String(row['Previous School'] || ''),
            prevClass: String(row['Previous Class'] || ''),
            admissionPayment: String(row['Admission Payment'] || ''),
            paymentMethod: String(row['Payment Method'] || 'নগদ / ক্যাশ'),
            transactionNo: String(row['Transaction No'] || ''),
            passingYear: String(row['Passing Year'] || ''),
            gpa: String(row['GPA'] || ''),
            registrationNo: String(row['Registration No'] || ''),
            board: String(row['Board'] || ''),
            photo: ''
          } as Student;
        },
        { chunkSize: 40 }
      );

      if (newStudents.length > 0) {
        bulkAddStudents(newStudents);
        showToast(isBn ? `সফলভাবে ${newStudents.length} জন শিক্ষার্থীর তথ্য ইমপোর্ট হয়েছে!` : `Successfully imported ${newStudents.length} students!`);
      }
    } catch (err: any) {
      console.error(err);
      alert(isBn ? 'এক্সেল ফাইল পড়তে সমস্যা হয়েছে!' : 'Error reading Excel file!');
    } finally {
      setIsImporting(false);
      if (e.target) e.target.value = '';
    }
  };

  const filteredRecentStudents = useMemo(() => {
    return studentList.filter(s => {
      if (!s) return false;
      const matchClass = filterClass === 'all' || s.class === filterClass;
      const term = (searchTerm || '').toLowerCase().trim();
      if (!term) return matchClass;
      const name = (s.name || '').toLowerCase();
      const nameBn = (s.nameBn || '').toLowerCase();
      const sId = (s.studentId || '').toLowerCase();
      const roll = (s.roll || '').toLowerCase();
      return matchClass && (name.includes(term) || nameBn.includes(term) || sId.includes(term) || roll.includes(term));
    });
  }, [studentList, filterClass, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
            <School className="w-4 h-4" />
            <span>{isBn ? 'শিক্ষার্থী ব্যবস্থাপনা' : 'Student Management'}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">
            {isBn ? 'ভর্তি ও তালিকাভুক্তি' : 'Admission & Enrollment'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isBn 
              ? 'নতুন শিক্ষার্থী ভর্তি, ফর্ম পূরণ, এক্সেল বাল্ক ইমপোর্ট এবং স্মার্ট অটো-ফিল হাব' 
              : 'New student admission, enrollment form, Excel bulk import, and smart auto-fill hub'}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            to="/students/list"
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>{isBn ? 'সকল শিক্ষার্থীর তালিকা' : 'Student Profile & List'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Admission Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{isBn ? 'মোট শিক্ষার্থী' : 'Total Students'}</p>
            <h3 className="text-2xl font-bold text-slate-800">{totalStudents}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{isBn ? 'ছাত্র' : 'Male Students'}</p>
            <h3 className="text-2xl font-bold text-slate-800">{maleStudents}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{isBn ? 'ছাত্রী' : 'Female Students'}</p>
            <h3 className="text-2xl font-bold text-slate-800">{femaleStudents}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{isBn ? 'সেশন অনুযায়ী ভর্তি' : 'Current Session'}</p>
            <h3 className="text-2xl font-bold text-slate-800">{thisYearStudents || totalStudents}</h3>
          </div>
        </div>
      </div>

      {/* Primary 3 Admission Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Manual Entry */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:border-indigo-300 transition-all group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
              <UserPlus className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {isBn ? '১. ম্যানুয়াল একক ভর্তি ফর্ম' : '1. Manual Admission Form'}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              {isBn 
                ? 'শিক্ষার্থীর প্রাথমিক তথ্য, স্থায়ী ও বর্তমান ঠিকানা ডাটাবেজ ড্রপডাউন, পিতা-মাতা ও পেমেন্ট হিস্ট্রি ধাপে ধাপে পূরণ করুন।'
                : 'Fill out student profile, auto location dropdowns, guardian details, and payment step-by-step.'}
            </p>
          </div>
          <button
            onClick={() => {
              setEditingStudent(null);
              setSmartData(null);
              setShowEnrollModal(true);
            }}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            <span>{isBn ? 'ভর্তি ফর্ম শুরু করুন' : 'Open Admission Form'}</span>
          </button>
        </div>

        {/* 2. Excel Bulk Import */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:border-emerald-300 transition-all group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {isBn ? '২. এক্সেল বাল্ক ইমপোর্ট হাব' : '2. Excel Bulk Import Hub'}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              {isBn
                ? 'একসাথে বহু শিক্ষার্থীর ডাটা এক্সেল শিট থেকে প্রিভিউ টেবিল সহ সরাসরি ইমপোর্ট ও যাচাই করে সেভ করুন।'
                : 'Import hundreds of students in bulk from Excel spreadsheets with full preview and editing.'}
            </p>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => setShowHubModal(true)}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span>{isBn ? 'ইমপোর্ট হাব খুলুন' : 'Open Excel Hub'}</span>
            </button>
            <button
              onClick={downloadSampleExcel}
              className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-lg transition-colors border border-slate-200 flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isBn ? 'স্যাম্পল এক্সেল ফরম্যাট ডাউনলোড' : 'Download Sample Template'}</span>
            </button>
          </div>
        </div>

        {/* 3. Smart Auto-fill */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md hover:border-purple-300 transition-all group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">
              <Wand2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              {isBn ? '৩. স্মার্ট অটো-ফিল' : '3. Smart Auto-fill'}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              {isBn
                ? 'অনলাইন রেজাল্ট বা টেক্সট কপি করে পেস্ট করুন। সিস্টেম অটোম্যাটিক নাম, রোল, জিপিএ ও ঠিকানা শনাক্ত করে নিবে।'
                : 'Paste text from admission results or documents to automatically extract and populate student data.'}
            </p>
          </div>
          <button
            onClick={() => setShowSmartModal(true)}
            className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>{isBn ? 'স্মার্ট অটো-ফিল শুরু করুন' : 'Start Smart Auto-fill'}</span>
          </button>
        </div>
      </div>

      {/* Hidden File Input for direct quick upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleDirectExcelFile}
        accept=".xlsx, .xls"
        className="hidden"
      />

      {/* Recent Admissions & Enrollment Records */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isBn ? 'সাম্প্রতিক ভর্তিকৃত শিক্ষার্থী ও আবেদনসমূহ' : 'Recent Enrolled Students & Applications'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isBn ? 'সর্বশেষ তালিকাভুক্ত শিক্ষার্থীদের বিস্তারিত তথ্য' : 'List of newly admitted students and quick details'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Class Filter */}
            <div className="relative">
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="pl-3 pr-8 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">{isBn ? 'সকল শ্রেণি' : 'All Classes'}</option>
                {classesList.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={isBn ? 'নাম, আইডি বা রোল খুঁজুন...' : 'Search name, ID or roll...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-3.5">{isBn ? 'আইডি' : 'Student ID'}</th>
                <th className="px-6 py-3.5">{isBn ? 'ছবি' : 'Photo'}</th>
                <th className="px-6 py-3.5">{isBn ? 'শিক্ষার্থীর নাম' : 'Student Name'}</th>
                <th className="px-6 py-3.5">{isBn ? 'শ্রেণি ও রোল' : 'Class & Roll'}</th>
                <th className="px-6 py-3.5">{isBn ? 'পিতার নাম ও মোবাইল' : "Father & Mobile"}</th>
                <th className="px-6 py-3.5">{isBn ? 'ভর্তি ফি / মাধ্যম' : 'Payment / Method'}</th>
                <th className="px-6 py-3.5 text-right">{isBn ? 'অ্যাকশন' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecentStudents.length > 0 ? (
                filteredRecentStudents.slice(0, 15).map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-slate-900">{student.studentId}</td>
                    <td className="px-6 py-3.5">
                      {student.photo ? (
                        <img src={student.photo} alt="Photo" className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-xs" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-500 border border-slate-200">
                          {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="font-semibold text-slate-800">{student.name}</p>
                      {student.nameBn && <p className="text-xs text-slate-500">{student.nameBn}</p>}
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700">
                          {student.class || 'N/A'}
                        </span>
                        {student.group && student.group !== 'প্রযোজ্য নয়' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            {student.group}
                          </span>
                        )}
                        {student.section && student.section !== 'প্রযোজ্য নয়' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {isBn ? 'শাখা:' : 'Sec:'} {student.section}
                          </span>
                        )}
                        <span className="text-xs text-slate-500 font-medium">{isBn ? 'রোল:' : 'Roll:'} {student.roll || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5">
                      <p className="text-xs font-medium text-slate-700">{student.fatherName || '-'}</p>
                      <p className="text-xs text-slate-400">{student.fatherMobile || '-'}</p>
                    </td>
                    <td className="px-6 py-3.5">
                      {student.admissionPayment ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700">
                          <CreditCard className="w-3 h-3" />
                          ৳{student.admissionPayment} ({student.paymentMethod || 'নগদ'})
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingStudent(student)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title={isBn ? 'প্রোফাইল দেখুন' : 'View Profile'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingStudent(student);
                            setShowEnrollModal(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title={isBn ? 'সম্পাদনা' : 'Edit'}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(isBn ? 'আপনি কি নিশ্চিত এই শিক্ষার্থীকে মুছে ফেলতে চান?' : 'Are you sure you want to delete this student?')) {
                              deleteStudent(student.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={isBn ? 'মুছুন' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium">{isBn ? 'কোন শিক্ষার্থী পাওয়া যায়নি' : 'No student records found'}</p>
                    <p className="text-xs text-slate-400 mt-1">{isBn ? 'উপরের বাটনে ক্লিক করে নতুন শিক্ষার্থী ভর্তি করুন।' : 'Use the buttons above to enroll students.'}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filteredRecentStudents.length > 15 && (
          <div className="p-4 border-t border-slate-100 text-center bg-slate-50">
            <Link
              to="/students/list"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <span>{isBn ? `সকল ${studentList.length} জন শিক্ষার্থীর সম্পূর্ণ তালিকা দেখুন` : `View all ${studentList.length} students in Profile & List`}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Modals */}
      <StudentEnrollmentModal
        isOpen={showEnrollModal}
        onClose={() => {
          setShowEnrollModal(false);
          setEditingStudent(null);
          setSmartData(null);
        }}
        student={editingStudent || (smartData as Student | null)}
        onSave={handleSaveStudent}
        generateId={(cls) => generateStudentId(cls, studentList)}
      />

      <AddStudentHubModal
        isOpen={showHubModal}
        onClose={() => setShowHubModal(false)}
        onManualEntry={() => {
          setShowHubModal(false);
          setEditingStudent(null);
          setSmartData(null);
          setShowEnrollModal(true);
        }}
        onSmartImportSubmit={handleSmartImportSubmit}
        onExcelImportSubmit={handleBulkExcelImport}
      />

      <SmartImportModal
        isOpen={showSmartModal}
        onClose={() => setShowSmartModal(false)}
        onImportSuccess={handleSmartImportSubmit}
      />

      <StudentProfileModal
        student={viewingStudent}
        isOpen={!!viewingStudent}
        onClose={() => setViewingStudent(null)}
        onEdit={(st) => {
          setViewingStudent(null);
          setEditingStudent(st);
          setShowEnrollModal(true);
        }}
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

export default AdmissionEnrollment;
