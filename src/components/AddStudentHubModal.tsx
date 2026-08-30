import React, { useState, useRef } from 'react';
import { X, UserPlus, FileSpreadsheet, Wand2, Download, Upload, Check, AlertCircle, Edit2, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAppStore } from '../store/useAppStore';
import { Student } from '../types';
import { generateStudentId } from '../utils/generateId';
import { normalizeClassName, normalizeGroupName, normalizeSectionName, normalizeSession } from '../utils/classNormalizer';
import { extractDobFromRow, parseExcelDate } from '../utils/dateNormalizer';
import { SmartImportModal } from './SmartImportModal';
import { processAsyncBatch } from '../utils/asyncBatch';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onManualEntry: () => void;
  onSmartImportSubmit: (data: Partial<Student>) => void;
  onExcelImportSubmit: (students: Student[]) => void;
}

export const AddStudentHubModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onManualEntry,
  onSmartImportSubmit,
  onExcelImportSubmit
}) => {
  const { language, students, academicClasses, academicGroups, academicSections } = useAppStore();
  const isBn = language === 'bn';
  const classesList = Array.isArray(academicClasses) ? academicClasses : [];
  const groupsList = Array.isArray(academicGroups) ? academicGroups : [];
  const sectionsList = Array.isArray(academicSections) ? academicSections : [];

  const defaultClassName = classesList.find(c => c.isDefault)?.name || classesList[0]?.name || 'Class 6';
  const defaultGroupName = groupsList.find(g => g.isDefault)?.name || groupsList[0]?.name || 'প্রযোজ্য নয়';
  const defaultSectionName = sectionsList.find(s => s.isDefault)?.name || sectionsList[0]?.name || 'প্রযোজ্য নয়';

  const [activeTab, setActiveTab] = useState<'manual' | 'excel' | 'smart'>('excel');
  const [targetClass, setTargetClass] = useState<string>(defaultClassName);
  const [targetGroup, setTargetGroup] = useState<string>(defaultGroupName);
  const [targetSection, setTargetSection] = useState<string>(defaultSectionName);
  const [targetSession, setTargetSession] = useState<string>(new Date().getFullYear().toString());
  const [excelData, setExcelData] = useState<Student[] | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [previewPage, setPreviewPage] = useState(1);
  const previewPageSize = 30;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showSmartModal, setShowSmartModal] = useState(false);

  if (!isOpen) return null;

  const downloadSampleExcel = () => {
    const wsData = [
      ['Student ID', 'Form No', 'Application Date', 'Session', 'Class', 'Group', 'Section', 'Roll', 'Name (English)', 'Name (Bangla)', 
       'Birth Registration No', 'Date of Birth', 'Gender', 'Religion', 'Nationality', 'Blood Group',
       'Permanent Village', 'Permanent Post Office', 'Permanent Upazila', 'Permanent District',
       'Present Village', 'Present Post Office', 'Present Upazila', 'Present District',
       'Father Name (English)', 'Father Name (Bangla)', 'Father NID', 'Father Mobile', 'Father Profession',
       'Mother Name (English)', 'Mother Name (Bangla)', 'Mother NID', 'Mother Mobile', 'Mother Profession',
       'Parents Status', 'Previous School', 'Previous Class', 'Admission Payment', 'Payment Method', 'Transaction No'],
      ['', '1001', '2026-01-01', targetSession, targetClass, targetGroup, targetSection, '1', 'John Doe', 'জন ডো', 
       '12345678901234567', '2010-05-15', 'Male', 'Islam', 'বাংলাদেশি', 'A+',
       'vil_sample', 'po_sample', 'upz_sample', 'dist_sample',
       'vil_sample', 'po_sample', 'upz_sample', 'dist_sample',
       'Richard Doe', 'রিচার্ড ডো', '9876543210', '01700000000', 'Business',
       'Jane Doe', 'জেন ডো', '1234567890', '01800000000', 'Housewife',
       'দুজনেই জীবিত', 'Sample Primary School', '5', '1000', 'বিকাশ', 'TRX123456']
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample');
    XLSX.writeFile(wb, `student_import_${targetClass.replace(/\s+/g, '_')}_${targetSession}.xlsx`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setImportProgress(0);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);
      
      const newStudents = await processAsyncBatch<any, Student>(
        data,
        (row: any, index: number) => {
          const rawClass = row['Class'] || row['class'] || row['শ্রেণি'] || row['শ্রেণী'] || targetClass;
          const normalizedClass = normalizeClassName(String(rawClass), classesList, targetClass);
          const normalizedSess = normalizeSession(String(row['Session'] || row['session'] || row['শিক্ষাবর্ষ'] || targetSession), targetSession);

          const rawGroup = row['Group'] || row['group'] || row['বিভাগ'] || row['শাখা/বিভাগ'] || targetGroup;
          const normalizedGroup = normalizeGroupName(String(rawGroup), groupsList, targetGroup);

          const rawSection = row['Section'] || row['section'] || row['শাখা'] || targetSection;
          const normalizedSection = normalizeSectionName(String(rawSection), sectionsList, targetSection);

          const generatedId = generateStudentId(normalizedClass, students);
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
        {
          chunkSize: 40,
          onProgress: (percent) => setImportProgress(percent)
        }
      );
      setExcelData(newStudents);
      setPreviewPage(1);
    } catch (error: any) {
      console.error(error);
      alert(language === 'bn' ? 'ফাইল পড়তে সমস্যা হয়েছে: ' + (error?.message || '') : 'Error reading file: ' + (error?.message || ''));
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      if (e.target) e.target.value = '';
    }
  };

  const handleCellChange = (index: number, field: keyof Student, value: string) => {
    if (!excelData) return;
    const newData = [...excelData];
    newData[index] = { ...newData[index], [field]: value };
    setExcelData(newData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {language === 'bn' ? 'নতুন শিক্ষার্থী যুক্ত করুন' : 'Add New Student'}
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              {language === 'bn' ? 'আপনার সুবিধামতো মাধ্যম নির্বাচন করুন' : 'Choose your preferred method'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50 p-4 flex md:flex-col gap-2 shrink-0 overflow-x-auto md:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => { setActiveTab('manual'); setExcelData(null); }}
              className={`whitespace-nowrap flex-1 md:w-full flex justify-center md:justify-start items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all ${
                activeTab === 'manual' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <UserPlus className="w-5 h-5" />
              <span className="font-medium text-left">{language === 'bn' ? 'ম্যানুয়াল এন্ট্রি' : 'Manual Entry'}</span>
            </button>
            <button
              onClick={() => { setActiveTab('excel'); }}
              className={`whitespace-nowrap flex-1 md:w-full flex justify-center md:justify-start items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all ${
                activeTab === 'excel' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span className="font-medium text-left">{language === 'bn' ? 'এক্সেল ইমপোর্ট' : 'Excel Import'}</span>
            </button>
            <button
              onClick={() => { setActiveTab('smart'); setExcelData(null); }}
              className={`whitespace-nowrap flex-1 md:w-full flex justify-center md:justify-start items-center gap-2 md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-xl transition-all ${
                activeTab === 'smart' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              <Wand2 className="w-5 h-5" />
              <span className="font-medium text-left">{language === 'bn' ? 'স্মার্ট অটো-ফিল' : 'Smart Auto-fill'}</span>
            </button>
          </div>

          {/* Main Area */}
          <div className="flex-1 overflow-y-auto bg-white">
            {activeTab === 'manual' && (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                  <UserPlus className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {language === 'bn' ? 'ম্যানুয়াল ডেটা এন্ট্রি' : 'Manual Data Entry'}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  {language === 'bn' 
                    ? 'শিক্ষার্থীর সকল তথ্য ধাপে ধাপে পূরণের মাধ্যমে নতুন প্রোফাইল তৈরি করুন।'
                    : 'Create a new profile by filling in the student information step by step.'}
                </p>
                <button
                  onClick={() => { onClose(); onManualEntry(); }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium shadow-sm transition-all flex items-center gap-2"
                >
                  {language === 'bn' ? 'ফর্ম পূরণ শুরু করুন' : 'Start Filling Form'}
                </button>
              </div>
            )}

            {activeTab === 'smart' && (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                  <Wand2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {language === 'bn' ? 'এআই স্মার্ট অটো-ফিল' : 'AI Smart Auto-fill'}
                </h3>
                <p className="text-slate-500 max-w-md mx-auto mb-8">
                  {language === 'bn' 
                    ? 'কোনো ছবি বা টেক্সট থেকে এআই (AI) এর মাধ্যমে স্বয়ংক্রিয়ভাবে তথ্য এক্সট্রাক্ট করে ফর্ম পূরণ করুন।'
                    : 'Automatically extract information from an image or text using AI to pre-fill the form.'}
                </p>
                <button
                  onClick={() => setShowSmartModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-medium shadow-sm transition-all flex items-center gap-2"
                >
                  <Wand2 className="w-5 h-5" />
                  {language === 'bn' ? 'স্মার্ট ফিল শুরু করুন' : 'Start Smart Fill'}
                </button>
              </div>
            )}

            {activeTab === 'excel' && (
              <div className="h-full flex flex-col p-6 overflow-y-auto">
                {!excelData ? (
                  <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 text-blue-600">
                      <FileSpreadsheet className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1 text-center">
                      {language === 'bn' ? 'এক্সেল থেকে সরাসরি শিক্ষার্থী তালিকা আপলোড' : 'Bulk Import from Excel'}
                    </h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto mb-6 text-center">
                      {language === 'bn' 
                        ? 'শ্রেণি, বিভাগ, শাখা ও শিক্ষাবর্ষ নির্বাচন করে এক্সেল ফাইল আপলোড করুন। ভুল এড়াতে স্বয়ংক্রিয়ভাবে ডাটা ভ্যালিডেট হবে।'
                        : 'Select target hierarchy (session, class, group, section), then upload your Excel file.'}
                    </p>

                    {/* Class, Group, Section & Session Selection Card */}
                    <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        <Filter className="w-4 h-4 text-indigo-600" />
                        <span>{language === 'bn' ? 'ডিফল্ট একাডেমিক স্ট্রাকচার নির্ধারণ' : 'Default Academic Hierarchy'}</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            {language === 'bn' ? 'শিক্ষাবর্ষ *' : 'Session *'}
                          </label>
                          <input
                            type="text"
                            value={targetSession}
                            onChange={(e) => setTargetSession(e.target.value)}
                            placeholder="2026"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            {language === 'bn' ? 'শ্রেণি *' : 'Class *'}
                          </label>
                          <select
                            value={targetClass}
                            onChange={(e) => setTargetClass(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          >
                            {classesList.map(c => (
                              <option key={c.id} value={c.name}>{c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            {language === 'bn' ? 'বিভাগ *' : 'Group *'}
                          </label>
                          <select
                            value={targetGroup}
                            onChange={(e) => setTargetGroup(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          >
                            {groupsList.map(g => (
                              <option key={g.id} value={g.name}>{g.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            {language === 'bn' ? 'শাখা *' : 'Section *'}
                          </label>
                          <select
                            value={targetSection}
                            onChange={(e) => setTargetSection(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          >
                            {sectionsList.map(s => (
                              <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                      <button
                        onClick={downloadSampleExcel}
                        className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-sm font-medium transition-all flex items-center gap-2 justify-center"
                      >
                        <Download className="w-4 h-4" />
                        <span>{language === 'bn' ? 'স্যাম্পল ফরম্যাট ডাউনলোড' : 'Download Sample'}</span>
                      </button>
                      
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium shadow-sm transition-all flex items-center gap-2 justify-center disabled:opacity-70"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isImporting ? (language === 'bn' ? 'পড়া হচ্ছে...' : 'Reading...') : (language === 'bn' ? 'এক্সেল ফাইল আপলোড করুন' : 'Upload Excel File')}</span>
                      </button>
                      <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-4 shrink-0">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          <Check className="w-5 h-5 text-emerald-500" />
                          {language === 'bn' ? 'ডেটা প্রিভিউ' : 'Data Preview'}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {excelData.length} {language === 'bn' ? 'জন শিক্ষার্থীর তথ্য পাওয়া গেছে' : 'students found'}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setExcelData(null)}
                          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg font-medium transition-colors"
                        >
                          {language === 'bn' ? 'বাতিল' : 'Cancel'}
                        </button>
                        <button
                          onClick={() => { onExcelImportSubmit(excelData); onClose(); }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          {language === 'bn' ? 'কনফার্ম ও সেভ' : 'Confirm & Save'}
                        </button>
                      </div>
                    </div>

                    
                    <div className="flex-1 overflow-auto border border-slate-200 rounded-xl relative">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 sticky top-0 z-10 border-b border-slate-200 shadow-sm">
                          <tr>
                            {[
                              { k: 'studentId', l: 'Student ID', w: 'w-24' },
                              { k: 'formNo', l: 'Form No', w: 'w-24' },
                              { k: 'applicationDate', l: 'App. Date', w: 'w-28' },
                              { k: 'session', l: 'Session', w: 'w-24' },
                              { k: 'class', l: 'Class', w: 'w-20' },
                              { k: 'group', l: 'Group', w: 'w-24' },
                              { k: 'section', l: 'Section', w: 'w-20' },
                              { k: 'roll', l: 'Roll', w: 'w-16' },
                              { k: 'name', l: 'Name (En)', w: 'w-32' },
                              { k: 'nameBn', l: 'Name (Bn)', w: 'w-32' },
                              { k: 'dateOfBirth', l: 'DOB', w: 'w-28' },
                              { k: 'birthRegistrationNo', l: 'Birth Reg. No', w: 'w-32' },
                              { k: 'gender', l: 'Gender', w: 'w-24' },
                              { k: 'religion', l: 'Religion', w: 'w-24' },
                              { k: 'bloodGroup', l: 'Blood Group', w: 'w-24' },
                              { k: 'fatherName', l: 'Father Name (En)', w: 'w-32' },
                              { k: 'fatherMobile', l: 'Father Mobile', w: 'w-28' },
                              { k: 'fatherNid', l: 'Father NID', w: 'w-32' },
                              { k: 'motherName', l: 'Mother Name (En)', w: 'w-32' },
                              { k: 'motherMobile', l: 'Mother Mobile', w: 'w-28' },
                              { k: 'motherNid', l: 'Mother NID', w: 'w-32' },
                              { k: 'village', l: 'Perm. Village', w: 'w-32' },
                              { k: 'postOffice', l: 'Perm. PO', w: 'w-32' },
                              { k: 'upazila', l: 'Perm. Upazila', w: 'w-32' },
                              { k: 'district', l: 'Perm. District', w: 'w-32' },
                              { k: 'presentVillage', l: 'Pres. Village', w: 'w-32' },
                              { k: 'presentPostOffice', l: 'Pres. PO', w: 'w-32' },
                              { k: 'presentUpazila', l: 'Pres. Upazila', w: 'w-32' },
                              { k: 'presentDistrict', l: 'Pres. District', w: 'w-32' },
                              { k: 'prevSchoolName', l: 'Prev. School', w: 'w-32' },
                              { k: 'prevClass', l: 'Prev. Class', w: 'w-24' },
                              { k: 'admissionPayment', l: 'Payment', w: 'w-24' },
                              { k: 'paymentMethod', l: 'Pay Method', w: 'w-24' },
                              { k: 'transactionNo', l: 'TRX No', w: 'w-32' }
                            ].map(col => (
                              <th key={col.k} className="px-4 py-3 font-semibold text-slate-600 border-r border-slate-200 bg-slate-50">{col.l}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {excelData.slice((previewPage - 1) * previewPageSize, previewPage * previewPageSize).map((student, pageIdx) => {
                            const actualIdx = (previewPage - 1) * previewPageSize + pageIdx;
                            return (
                              <tr key={actualIdx} className="hover:bg-slate-50">
                                {[
                                  { k: 'studentId', w: 'w-24' },
                                  { k: 'formNo', w: 'w-24' },
                                  { k: 'applicationDate', w: 'w-28' },
                                  { k: 'session', w: 'w-24' },
                                  { k: 'class', w: 'w-20' },
                                  { k: 'group', w: 'w-24' },
                                  { k: 'section', w: 'w-20' },
                                  { k: 'roll', w: 'w-16' },
                                  { k: 'name', w: 'w-32' },
                                  { k: 'nameBn', w: 'w-32' },
                                  { k: 'dateOfBirth', w: 'w-28' },
                                  { k: 'birthRegistrationNo', w: 'w-32' },
                                  { k: 'gender', w: 'w-24' },
                                  { k: 'religion', w: 'w-24' },
                                  { k: 'bloodGroup', w: 'w-24' },
                                  { k: 'fatherName', w: 'w-32' },
                                  { k: 'fatherMobile', w: 'w-28' },
                                  { k: 'fatherNid', w: 'w-32' },
                                  { k: 'motherName', w: 'w-32' },
                                  { k: 'motherMobile', w: 'w-28' },
                                  { k: 'motherNid', w: 'w-32' },
                                  { k: 'village', w: 'w-32' },
                                  { k: 'postOffice', w: 'w-32' },
                                  { k: 'upazila', w: 'w-32' },
                                  { k: 'district', w: 'w-32' },
                                  { k: 'presentVillage', w: 'w-32' },
                                  { k: 'presentPostOffice', w: 'w-32' },
                                  { k: 'presentUpazila', w: 'w-32' },
                                  { k: 'presentDistrict', w: 'w-32' },
                                  { k: 'prevSchoolName', w: 'w-32' },
                                  { k: 'prevClass', w: 'w-24' },
                                  { k: 'admissionPayment', w: 'w-24' },
                                  { k: 'paymentMethod', w: 'w-24' },
                                  { k: 'transactionNo', w: 'w-32' }
                                ].map(col => (
                                  <td key={col.k} className="px-4 py-2 border-r border-slate-100 p-0 m-0 relative focus-within:bg-white focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500">
                                    <input 
                                      value={String((student as any)[col.k] || '')} 
                                      onChange={e => handleCellChange(actualIdx, col.k as keyof Student, e.target.value)}
                                      className={`${col.w} bg-transparent outline-none w-full h-full py-2 text-xs`}
                                    />
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {Math.ceil(excelData.length / previewPageSize) > 1 && (
                      <div className="flex items-center justify-between mt-2 px-1">
                        <span className="text-xs text-slate-500">
                          {language === 'bn' ? `পৃষ্ঠা ${previewPage} / ${Math.ceil(excelData.length / previewPageSize)}` : `Page ${previewPage} of ${Math.ceil(excelData.length / previewPageSize)}`}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            disabled={previewPage <= 1}
                            onClick={() => setPreviewPage(p => Math.max(1, p - 1))}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-xs disabled:opacity-40"
                          >
                            {language === 'bn' ? 'পূর্ববর্তী' : 'Prev'}
                          </button>
                          <button
                            type="button"
                            disabled={previewPage >= Math.ceil(excelData.length / previewPageSize)}
                            onClick={() => setPreviewPage(p => Math.min(Math.ceil(excelData.length / previewPageSize), p + 1))}
                            className="px-2 py-1 bg-white border border-slate-200 rounded text-xs disabled:opacity-40"
                          >
                            {language === 'bn' ? 'পরবর্তী' : 'Next'}
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 rounded-lg text-amber-800 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <p>
                        {language === 'bn' 
                          ? 'আপনি চাইলে টেবিলের সেলে ক্লিক করে সরাসরি এডিট করতে পারবেন। সব ঠিক থাকলে "কনফার্ম ও সেভ" বাটনে ক্লিক করুন।' 
                          : 'You can click on any cell to edit directly. If everything looks good, click "Confirm & Save".'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <SmartImportModal 
        isOpen={showSmartModal} 
        onClose={() => setShowSmartModal(false)}
        onImport={(data) => {
          setShowSmartModal(false);
          onClose();
          onSmartImportSubmit(data);
        }}
      />
    </div>
  );
};
