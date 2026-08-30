import React, { useState, useRef } from 'react';
import { 
  Search, Settings, Download, Printer, Users, CheckSquare, 
  Square, ChevronLeft, ChevronRight, Upload, Sparkles, Loader2, X, Trash2,
  Award, FileText, GraduationCap, CheckCircle2, SlidersHorizontal, RotateCcw
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { translations, TranslationKey } from '../locales';
import { CertificateTemplate } from '../components/CertificateTemplate';
import { TestimonialImportModal } from '../components/TestimonialImportModal';
import { TestimonialBulkEditModal } from '../components/TestimonialBulkEditModal';
import { AttestationManager } from '../components/AttestationManager';
import { downloadCertificatePDF, downloadBulkCertificatesPDF } from '../utils/pdfGenerator';
import { toBengaliNumber } from '../utils/bengaliUtils';

const Testimonial = () => {
  const { language, examResults, institution, testimonialSettings, updateTestimonialSettings, deleteExamResult } = useAppStore();
  const t = (key: TranslationKey) => translations[language][key];
  const isBn = language === 'bn';
  
  // Top Level Sub-Module Tab: 'testimonial' (প্রশংসাপত্র) or 'attestation' (প্রত্যয়নপত্র)
  const [activeModuleTab, setActiveModuleTab] = useState<'testimonial' | 'attestation'>('testimonial');
  
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    (examResults || []).length > 0 ? [examResults[0].id] : []
  );
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showSettings, setShowSettings] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string>('');
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const singleRef = useRef<HTMLDivElement>(null);
  const bulkContainerRef = useRef<HTMLDivElement>(null);

  // Filter students
  const filteredStudents = (examResults || []).filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.nameBn && s.nameBn.includes(searchTerm)) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.boardRollNo.includes(searchTerm);
    const matchesClass = selectedClass === 'all' || s.examName === selectedClass;
    return matchesSearch && matchesClass;
  });

  const availableClasses = Array.from(new Set((examResults || []).map(s => s.examName))).filter(Boolean);

  // Toggle student selection
  const handleDeleteStudent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStudentToDelete(id);
  };
  
  const confirmDelete = () => {
    if (studentToDelete) {
      deleteExamResult(studentToDelete);
      setSelectedStudentIds(prev => prev.filter(item => item !== studentToDelete));
      if (currentPreviewIndex > 0) {
        setCurrentPreviewIndex(prev => prev - 1);
      }
      setStudentToDelete(null);
    }
  };

  const handleToggleStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      if (selectedStudentIds.length === 1) return;
      const updated = selectedStudentIds.filter(item => item !== id);
      setSelectedStudentIds(updated);
      if (currentPreviewIndex >= updated.length) {
        setCurrentPreviewIndex(Math.max(0, updated.length - 1));
      }
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredStudents.map(s => s.id);
    setSelectedStudentIds(allFilteredIds);
    setCurrentPreviewIndex(0);
  };

  const handleDeselectAll = () => {
    if (filteredStudents.length > 0) {
      setSelectedStudentIds([filteredStudents[0].id]);
      setCurrentPreviewIndex(0);
    }
  };

  const activeStudents = (examResults || []).filter(s => selectedStudentIds.includes(s.id));


  const groupedStudents = filteredStudents.reduce((acc, student) => {
    const group = student.examName || (isBn ? 'অন্যান্য' : 'Other');
    if (!acc[group]) acc[group] = [];
    acc[group].push(student);
    return acc;
  }, {} as Record<string, typeof filteredStudents>);
  
  const sortedGroups = Object.keys(groupedStudents).sort((a, b) => b.localeCompare(a));

  const currentPreviewStudent = activeStudents[currentPreviewIndex] || activeStudents[0];

  // Single PDF Download
  const handleDownloadSinglePdf = async () => {
    const targetElement = (currentPreviewStudent && document.getElementById(`cert-preview-${currentPreviewStudent.id}`)) || singleRef.current;
    if (!targetElement || !currentPreviewStudent) return;
    try {
      setIsGeneratingPdf(true);
      const studentFileTitle = isBn && currentPreviewStudent.nameBn 
        ? currentPreviewStudent.nameBn.replace(/\s+/g, '_')
        : currentPreviewStudent.name.replace(/\s+/g, '_');
      const rollNumber = ('boardRollNo' in currentPreviewStudent ? currentPreviewStudent.boardRollNo : (currentPreviewStudent as any).roll) || 'Cert';
      const filename = `${studentFileTitle}_Testimonial_${rollNumber}.pdf`;
      await downloadCertificatePDF(targetElement, filename);
      showToast(isBn ? 'প্রশংসাপত্র পিডিএফ সফলভাবে ডাউনলোড হয়েছে!' : 'Testimonial PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF download error:', err);
      showToast(isBn ? 'পিডিএফ তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন বা সরাসরি প্রিন্ট করুন।' : 'Failed to generate PDF. Please retry or use Direct Print.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Bulk PDF Download
  const handleDownloadBulkPdf = async () => {
    if (!bulkContainerRef.current || activeStudents.length === 0) return;
    try {
      setIsGeneratingPdf(true);
      const pages = Array.from(bulkContainerRef.current.querySelectorAll('.bulk-cert-page')) as HTMLElement[];
      const filename = `Testimonials_${activeStudents.length}_Students.pdf`;
      await downloadBulkCertificatesPDF(pages, filename, (cur, total) => {
        setPdfProgress(isBn ? `${toBengaliNumber(cur)}/${toBengaliNumber(total)}` : `${cur}/${total}`);
      });
      showToast(isBn ? `${toBengaliNumber(activeStudents.length)} জন শিক্ষার্থীর প্রশংসাপত্র পিডিএফ তৈরি সম্পন্ন!` : `Bulk PDF generated for ${activeStudents.length} students!`);
    } catch (err) {
      console.error('Bulk PDF download error:', err);
      showToast(isBn ? 'বাল্ক পিডিএফ তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Failed to generate bulk PDF.');
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  // Print
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=1000,height=800');
    if (!printWindow) return;

    const certsHtml = activeStudents.map(student => {
      return `<div class="print-page">${document.getElementById(`cert-preview-${student.id}`)?.outerHTML || ''}</div>`;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${isBn ? 'প্রশংসাপত্র' : 'Testimonial'} - ${isBn ? (institution.nameBn || institution.name) : institution.name}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Caveat:wght@600;700&family=Cinzel:wght@600;700;800&family=Dancing+Script:wght@700&family=EB+Garamond:ital,wght@0,600;0,700;1,600&family=Great+Vibes&family=Hind+Siliguri:wght@500;600;700&family=Noto+Serif+Bengali:wght@600;700&family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Tiro+Bangla:ital@0;1&display=swap" rel="stylesheet">
          <style>
            @page { size: A4 portrait; margin: 0; }
            body { margin: 0; padding: 0; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .print-page { page-break-after: always; display: flex; justify-content: center; width: 210mm; height: 297mm; }
            .certificate-page { width: 210mm !important; height: 297mm !important; margin: 0 !important; box-shadow: none !important; }
          </style>
        </head>
        <body>
          ${certsHtml || (singleRef.current ? `<div class="print-page">${singleRef.current.outerHTML}</div>` : '')}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 350);
  };

  const handleSignatureUpload = (field: 'preparerSignature' | 'verifierSignature' | 'signatorySignature', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateTestimonialSettings({ [field]: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const certificateDesigns = isBn ? [
    { id: 'classic_blue', name: 'ক্লাসিক নেভি ও গোল্ড' },
    { id: 'royal_gold', name: 'রয়্যাল গোল্ড লাক্সারি' },
    { id: 'emerald', name: 'এমারেল্ড গ্রিন একাডেমিক' },
    { id: 'vintage', name: 'ভিন্টেজ পার্চমেন্ট' },
    { id: 'modern', name: 'মডার্ন মিনিমালিস্ট' },
    { id: 'none', name: 'সার্টিফিকেট ডিজাইন (বর্ডার ছাড়া)' },
  ] : [
    { id: 'classic_blue', name: 'Classic Navy & Gold' },
    { id: 'royal_gold', name: 'Royal Gold Luxury' },
    { id: 'emerald', name: 'Emerald Green Academic' },
    { id: 'vintage', name: 'Vintage Parchment' },
    { id: 'modern', name: 'Modern Minimalist' },
    { id: 'none', name: 'Certificate Design (No Border)' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Sub-Module Navigation Tabs */}
      <div className="flex bg-slate-200/70 p-1.5 rounded-2xl w-full sm:w-auto self-start border border-slate-300/60 shadow-inner">
        <button
          onClick={() => setActiveModuleTab('testimonial')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeModuleTab === 'testimonial'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{isBn ? '১. প্রশংসাপত্র' : '1. Testimonial'}</span>
        </button>

        <button
          onClick={() => setActiveModuleTab('attestation')}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeModuleTab === 'attestation'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>{isBn ? '২. প্রত্যয়নপত্র' : '2. Attestation Certificate'}</span>
        </button>
      </div>

      {activeModuleTab === 'attestation' ? (
        <AttestationManager />
      ) : (
        <>
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-600" />
                {isBn ? 'প্রশংসাপত্র' : 'Testimonial'}
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {isBn 
                  ? 'সরাসরি পিডিএফ তৈরি করুন এবং কোনো লেআউট ভাঙা ছাড়াই প্রিন্ট করুন'
                  : 'Generate direct PDF to print flawlessly without layout breaks'}
              </p>
            </div>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowImport(true)}
                className="flex-1 sm:flex-none justify-center bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-3 sm:px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm shadow-sm"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                {isBn ? 'ইমপোর্ট শিক্ষার্থী ডাটা' : 'Import Student Data'}
              </button>
              <button
                onClick={() => setShowBulkEdit(true)}
                className="flex-1 sm:flex-none justify-center bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm shadow-sm"
              >
                <CheckSquare className="w-4 h-4 text-blue-600" />
                {isBn ? 'বাল্ক এডিট' : 'Bulk Edit'}
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="flex-1 sm:flex-none justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 sm:px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center gap-2 text-sm shadow-sm"
              >
                <Settings className="w-4 h-4 text-indigo-600" />
                {isBn ? 'কনফিগারেশন' : 'Settings'}
              </button>
            </div>
          </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-indigo-100 mb-6 transition-all">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              {isBn ? 'প্রশংসাপত্র সেটিংস ও লেআউট' : 'Certificate Settings & Layout'}
            </h3>
            <button 
              onClick={() => setShowSettings(false)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-medium"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Format & Language */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {isBn ? 'প্রশংসাপত্রের ভাষা ও ফরম্যাট' : 'Format & Language'}
              </label>
              <select 
                value={testimonialSettings.format}
                onChange={(e) => updateTestimonialSettings({ format: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
              >
                <option value="en_portrait">{isBn ? 'ইংরেজি প্রশংসাপত্র (পোর্ট্রেট)' : 'English Testimonial (Portrait)'}</option>
              </select>
            </div>

            {/* Student Data Font */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {isBn ? 'তথ্যের ফন্ট (Data Font)' : 'Student Data Font'}
              </label>
              <select 
                value={testimonialSettings.studentDataFont || 'Caveat'}
                onChange={(e) => updateTestimonialSettings({ studentDataFont: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
              >
                {testimonialSettings.format === 'bn_portrait' ? (
                  <>
                    <option value="Tiro Bangla">তিরো বাংলা (Tiro Bangla Serif)</option>
                    <option value="Noto Serif Bengali">নোটো সেরিফ বাংলা (Noto Serif)</option>
                    <option value="Hind Siliguri">হিন্দ শিলিগুড়ি (Hind Siliguri)</option>
                  </>
                ) : (
                  <>
                    <optgroup label={isBn ? 'ক্যালিগ্রাফি ও স্ক্রিপ্ট ফন্ট' : 'Calligraphy & Script Fonts'}>
                      <option value="Edwardian Script ITC">Alex Brush / Edwardian Style (Calligraphy)</option>
                      <option value="Dancing Script">Dancing Script (Elegant Hand)</option>
                      <option value="Great Vibes">Great Vibes (Royal Cursive)</option>
                      <option value="Caveat">Caveat (Modern Signature)</option>
                    </optgroup>
                    <optgroup label={isBn ? 'সেরিফ ও ফরমাল ফন্ট' : 'Serif & Formal Fonts'}>
                      <option value="Playfair Display">Playfair Display (Classy Serif)</option>
                      <option value="Cinzel">Cinzel (Diplomatic / Academic)</option>
                      <option value="EB Garamond">EB Garamond (Traditional)</option>
                      <option value="Times New Roman">Times New Roman (Standard)</option>
                      <option value="Arial">Arial (Clean Sans-Serif)</option>
                    </optgroup>
                  </>
                )}
              </select>
            </div>

            {/* SSC Exam Year */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {isBn ? 'এসএসসি পরীক্ষার সন' : 'SSC Exam Year'}
              </label>
              <input 
                type="text" 
                value={testimonialSettings.examYear || ''}
                onChange={(e) => updateTestimonialSettings({ examYear: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                placeholder={isBn ? 'যেমন: ২০২৬' : 'e.g. 2026'}
              />
            </div>

            {/* Certificate Design */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                {isBn ? 'সার্টিফিকেট ফ্রেম ডিজাইন' : 'Certificate Design Frame'}
              </label>
              <select 
                value={
                  certificateDesigns.some(d => d.id === testimonialSettings.certificateDesign)
                    ? testimonialSettings.certificateDesign
                    : 'custom'
                }
                onChange={(e) => {
                  if (e.target.value !== 'custom') {
                    updateTestimonialSettings({ certificateDesign: e.target.value });
                  }
                }}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white font-medium mb-2"
              >
                {certificateDesigns.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
                <option value="custom">{isBn ? 'কাস্টম আপলোড করা ফ্রেম...' : 'Custom Uploaded Frame...'}</option>
              </select>

              {/* Upload Custom Design */}
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        updateTestimonialSettings({ certificateDesign: event.target?.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  id="custom-design-upload"
                />
                <label 
                  htmlFor="custom-design-upload"
                  className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 border border-slate-300 w-full font-medium"
                >
                  <Upload size={14} />
                  {isBn ? 'পিসি থেকে ফ্রেম আপলোড' : 'Upload Frame From PC'}
                </label>
              </div>
            </div>

            {/* Smart Typography & Margin Controls */}
            <div className="col-span-full border-t border-slate-100 pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
                  {isBn ? 'ফন্ট সাইজ, লাইন স্পেসিং ও মার্জিন কাস্টমাইজেশন' : 'Typography, Spacing & Page Margins'}
                </h4>
                <button
                  type="button"
                  onClick={() => updateTestimonialSettings({
                    instNameFontSize: 24,
                    bodyFontSize: 14.5,
                    bodyLineHeight: 2.1,
                    paragraphSpacing: 12,
                    pageMarginTop: 0.35,
                    pageMarginBottom: 0.35,
                    pageMarginLeft: 0.35,
                    pageMarginRight: 0.35,
                  })}
                  className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-semibold transition-colors"
                >
                  <RotateCcw size={12} /> {isBn ? 'ডিফল্ট রিসেট' : 'Reset'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{isBn ? 'প্রতিষ্ঠানের নাম' : 'Institute'}:</span>
                    <span className="font-bold text-indigo-600">{toBengaliNumber(testimonialSettings.instNameFontSize || 24)}px</span>
                  </div>
                  <input
                    type="range" min="18" max="32" step="1"
                    value={testimonialSettings.instNameFontSize || 24}
                    onChange={(e) => updateTestimonialSettings({ instNameFontSize: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{isBn ? 'বিবরণী সাইজ' : 'Body Size'}:</span>
                    <span className="font-bold text-indigo-600">{toBengaliNumber(testimonialSettings.bodyFontSize || 14.5)}px</span>
                  </div>
                  <input
                    type="range" min="12" max="20" step="0.5"
                    value={testimonialSettings.bodyFontSize || 14.5}
                    onChange={(e) => updateTestimonialSettings({ bodyFontSize: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{isBn ? 'লাইন স্পেসিং' : 'Line Spacing'}:</span>
                    <span className="font-bold text-indigo-600">{toBengaliNumber((testimonialSettings.bodyLineHeight || 2.1).toFixed(2))}</span>
                  </div>
                  <input
                    type="range" min="1.5" max="3.0" step="0.05"
                    value={testimonialSettings.bodyLineHeight || 2.1}
                    onChange={(e) => updateTestimonialSettings({ bodyLineHeight: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{isBn ? 'প্যারাগ্রাফ গ্যাপ' : 'Para Gap'}:</span>
                    <span className="font-bold text-indigo-600">{toBengaliNumber(testimonialSettings.paragraphSpacing || 12)}px</span>
                  </div>
                  <input
                    type="range" min="4" max="24" step="1"
                    value={testimonialSettings.paragraphSpacing || 12}
                    onChange={(e) => updateTestimonialSettings({ paragraphSpacing: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{isBn ? 'উপরের মার্জিন' : 'Top Margin'}:</span>
                    <span className="font-bold text-indigo-600">{toBengaliNumber((testimonialSettings.pageMarginTop ?? 0.35).toFixed(2))} in</span>
                  </div>
                  <input
                    type="range" min="0.1" max="1.0" step="0.05"
                    value={testimonialSettings.pageMarginTop ?? 0.35}
                    onChange={(e) => updateTestimonialSettings({ pageMarginTop: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{isBn ? 'নিচের মার্জিন' : 'Bottom Margin'}:</span>
                    <span className="font-bold text-indigo-600">{toBengaliNumber((testimonialSettings.pageMarginBottom ?? 0.35).toFixed(2))} in</span>
                  </div>
                  <input
                    type="range" min="0.1" max="1.0" step="0.05"
                    value={testimonialSettings.pageMarginBottom ?? 0.35}
                    onChange={(e) => updateTestimonialSettings({ pageMarginBottom: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{isBn ? 'বাম মার্জিন' : 'Left Margin'}:</span>
                    <span className="font-bold text-indigo-600">{toBengaliNumber((testimonialSettings.pageMarginLeft ?? 0.35).toFixed(2))} in</span>
                  </div>
                  <input
                    type="range" min="0.1" max="1.0" step="0.05"
                    value={testimonialSettings.pageMarginLeft ?? 0.35}
                    onChange={(e) => updateTestimonialSettings({ pageMarginLeft: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{isBn ? 'ডান মার্জিন' : 'Right Margin'}:</span>
                    <span className="font-bold text-indigo-600">{toBengaliNumber((testimonialSettings.pageMarginRight ?? 0.35).toFixed(2))} in</span>
                  </div>
                  <input
                    type="range" min="0.1" max="1.0" step="0.05"
                    value={testimonialSettings.pageMarginRight ?? 0.35}
                    onChange={(e) => updateTestimonialSettings({ pageMarginRight: Number(e.target.value) })}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Signatures & Titles */}
            <div className="col-span-full border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                {isBn ? 'স্বাক্ষরকারীগণের নাম, পদবি ও স্বাক্ষর' : 'Signatory Names, Titles & Signatures'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Preparer */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-600">
                      {isBn ? 'প্রস্তুতকারক' : 'Prepared By'}
                    </span>
                    <label className="cursor-pointer text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[10px] font-semibold" title="Upload Signature">
                      <Upload size={12} /> {isBn ? 'স্বাক্ষর' : 'Sign'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSignatureUpload('preparerSignature', e)} />
                    </label>
                  </div>
                  {testimonialSettings.preparerSignature && (
                    <div className="h-10 mb-2 border border-slate-200 rounded bg-white flex items-center justify-center relative group overflow-hidden">
                       <img src={testimonialSettings.preparerSignature} className="h-full object-contain" alt="Signature" />
                       <button onClick={() => updateTestimonialSettings({ preparerSignature: undefined })} className="absolute inset-0 bg-black/50 text-white hidden group-hover:flex items-center justify-center text-[11px] font-bold">
                         <X size={14} />
                       </button>
                    </div>
                  )}
                  <input 
                    type="text" 
                    placeholder={isBn ? 'নাম (যেমন: মো: আনসার আহাম্মদ)' : 'Name (e.g. Ansar Ahammad)'} 
                    value={testimonialSettings.preparerName || ''}
                    onChange={(e) => updateTestimonialSettings({ preparerName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg mb-2 bg-white"
                  />
                  <input 
                    type="text" 
                    placeholder={isBn ? 'পদবি (যেমন: প্রস্তুতকারক)' : 'Title (e.g. Prepared by)'} 
                    value={testimonialSettings.preparerTitle || ''}
                    onChange={(e) => updateTestimonialSettings({ preparerTitle: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                {/* Verifier */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-600">
                      {isBn ? 'যাচাইকারী' : 'Verified By'}
                    </span>
                    <label className="cursor-pointer text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[10px] font-semibold" title="Upload Signature">
                      <Upload size={12} /> {isBn ? 'স্বাক্ষর' : 'Sign'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSignatureUpload('verifierSignature', e)} />
                    </label>
                  </div>
                  {testimonialSettings.verifierSignature && (
                    <div className="h-10 mb-2 border border-slate-200 rounded bg-white flex items-center justify-center relative group overflow-hidden">
                       <img src={testimonialSettings.verifierSignature} className="h-full object-contain" alt="Signature" />
                       <button onClick={() => updateTestimonialSettings({ verifierSignature: undefined })} className="absolute inset-0 bg-black/50 text-white hidden group-hover:flex items-center justify-center text-[11px] font-bold">
                         <X size={14} />
                       </button>
                    </div>
                  )}
                  <input 
                    type="text" 
                    placeholder={isBn ? 'নাম (যেমন: মোসাম্মৎ কামরুন নাহার)' : 'Name (e.g. Kamrun Nahar)'} 
                    value={testimonialSettings.verifierName || ''}
                    onChange={(e) => updateTestimonialSettings({ verifierName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg mb-2 bg-white"
                  />
                  <input 
                    type="text" 
                    placeholder={isBn ? 'পদবি (যেমন: যাচাইকারী)' : 'Title (e.g. Verified by)'} 
                    value={testimonialSettings.verifierTitle || ''}
                    onChange={(e) => updateTestimonialSettings({ verifierTitle: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                {/* Headmaster */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-600">
                      {isBn ? 'প্রতিষ্ঠান প্রধান' : 'Headmaster'}
                    </span>
                    <label className="cursor-pointer text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-[10px] font-semibold" title="Upload Signature">
                      <Upload size={12} /> {isBn ? 'স্বাক্ষর' : 'Sign'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleSignatureUpload('signatorySignature', e)} />
                    </label>
                  </div>
                  {testimonialSettings.signatorySignature && (
                    <div className="h-10 mb-2 border border-slate-200 rounded bg-white flex items-center justify-center relative group overflow-hidden">
                       <img src={testimonialSettings.signatorySignature} className="h-full object-contain" alt="Signature" />
                       <button onClick={() => updateTestimonialSettings({ signatorySignature: undefined })} className="absolute inset-0 bg-black/50 text-white hidden group-hover:flex items-center justify-center text-[11px] font-bold">
                         <X size={14} />
                       </button>
                    </div>
                  )}
                  <input 
                    type="text" 
                    placeholder={isBn ? 'নাম (যেমন: মো: আব্দুর রহমান)' : 'Name (e.g. Md. Abdur Rahman)'} 
                    value={testimonialSettings.signatoryName || ''}
                    onChange={(e) => updateTestimonialSettings({ signatoryName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg mb-2 bg-white"
                  />
                  <input 
                    type="text" 
                    placeholder={isBn ? 'পদবি (যেমন: প্রধান শিক্ষক / অধ্যক্ষ)' : 'Title (e.g. Headmaster)'} 
                    value={testimonialSettings.signatoryTitle || ''}
                    onChange={(e) => updateTestimonialSettings({ signatoryTitle: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Main Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Student Multi-Selector */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-1 h-[calc(100vh-190px)] flex flex-col">
          {/* Filter & Search Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Users size={14} className="text-indigo-600" />
                {isBn 
                  ? `শিক্ষার্থী তালিকা (${toBengaliNumber(selectedStudentIds.length)} নির্বাচিত)`
                  : `Student List (${selectedStudentIds.length} Selected)`}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  {isBn ? 'সবাইকে নির্বাচন' : 'Select All'}
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={handleDeselectAll}
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-700"
                >
                  {isBn ? 'ক্লিয়ার' : 'Clear'}
                </button>
              </div>
            </div>

            {/* Class Filter */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-medium"
            >
              <option value="all">{isBn ? 'সকল শ্রেণি' : 'All Classes'}</option>
              {availableClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder={isBn ? 'নাম বা রোল দিয়ে খুঁজুন...' : 'Search by name or roll...'} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Student List with Checkboxes */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {sortedGroups.length > 0 ? (
              sortedGroups.map(groupName => (
                <div key={groupName} className="mb-2">
                  <div className="sticky top-0 bg-slate-100/90 backdrop-blur-sm px-3.5 py-1.5 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-y border-slate-200 shadow-sm z-10">
                    {groupName}
                  </div>
                  <div className="divide-y divide-slate-50">
                    {groupedStudents[groupName].map((student) => {
                      const isSelected = selectedStudentIds.includes(student.id);
                      const displayName = isBn && student.nameBn ? student.nameBn : student.name;
                      const rollDisplay = isBn ? toBengaliNumber(student.boardRollNo) : student.boardRollNo;
                      const sessionDisplay = isBn ? toBengaliNumber(student.session) : student.session;
                      return (
                        <div
                          key={student.id}
                          onClick={() => handleToggleStudent(student.id)}
                          className={`flex items-center gap-3 px-3.5 py-2.5 cursor-pointer transition-colors ${
                            isSelected ? 'bg-indigo-50/80 border-l-2 border-l-indigo-600' : 'hover:bg-slate-50 border-l-2 border-l-transparent'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStudent(student.id);
                            }}
                            className={`flex-shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}
                          >
                            {isSelected ? <CheckSquare size={17} /> : <Square size={17} />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-bold truncate ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                              {displayName}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                              {isBn 
                                ? `রোল: ${rollDisplay} | সেশন: ${sessionDisplay}`
                                : `Roll: ${rollDisplay} | Session: ${sessionDisplay}`}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteStudent(student.id, e)}
                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded p-1.5 transition-colors"
                            title={isBn ? 'মুছে ফেলুন' : 'Delete'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                {isBn ? 'কোনো শিক্ষার্থী পাওয়া যায়নি' : 'No students found'}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preview & Action Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 lg:col-span-3 p-5 flex flex-col overflow-hidden h-[calc(100vh-190px)]">
          {/* Action Bar */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4 pb-3 border-b border-slate-100">
            {/* Pagination for multi-selected preview */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 font-medium">
                {isBn
                  ? `প্রিভিউ: ${toBengaliNumber(currentPreviewIndex + 1)} / ${toBengaliNumber(activeStudents.length)}`
                  : `Preview: ${currentPreviewIndex + 1} / ${activeStudents.length}`}
              </span>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                <button
                  disabled={currentPreviewIndex === 0}
                  onClick={() => setCurrentPreviewIndex(p => Math.max(0, p - 1))}
                  className="p-1.5 hover:bg-slate-100 disabled:opacity-30"
                  title="Previous"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={currentPreviewIndex >= activeStudents.length - 1}
                  onClick={() => setCurrentPreviewIndex(p => Math.min(activeStudents.length - 1, p + 1))}
                  className="p-1.5 hover:bg-slate-100 disabled:opacity-30"
                  title="Next"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Download & Print Buttons */}
            <div className="flex items-center gap-2.5">
              {/* Direct Print Button */}
              <button
                onClick={handlePrint}
                disabled={!currentPreviewStudent || isGeneratingPdf}
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 disabled:opacity-50 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                title={isBn ? 'সরাসরি প্রিন্ট বা ব্রাউজার থেকে সেভ করুন' : 'Direct Print / Save from Browser'}
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                {isBn ? 'সরাসরি প্রিন্ট' : 'Print'}
              </button>

              {/* Single Download */}
              <button
                onClick={handleDownloadSinglePdf}
                disabled={!currentPreviewStudent || isGeneratingPdf}
                className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {isBn ? 'পিডিএফ ডাউনলোড' : 'Download PDF'}
              </button>

              {/* Bulk Download */}
              {activeStudents.length > 1 && (
                <button
                  onClick={handleDownloadBulkPdf}
                  disabled={isGeneratingPdf}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  {isBn 
                    ? `সবগুলো একত্রে ডাউনলোড (${toBengaliNumber(activeStudents.length)})`
                    : `Download All Bulk (${activeStudents.length})`} {pdfProgress && `[${pdfProgress}]`}
                </button>
              )}
            </div>
          </div>

          {/* Toast Notification */}
          {toastMessage && (
            <div className="mx-4 mb-2 p-3 bg-emerald-900/90 text-white rounded-xl shadow-lg flex items-center gap-2.5 text-xs font-medium animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Live Preview Container */}
          <div className="flex-1 overflow-auto bg-slate-100/80 rounded-xl p-4 flex justify-center items-start">
            {currentPreviewStudent ? (
              <div 
                ref={singleRef}
                className="bg-white shadow-xl rounded-sm transform origin-top transition-transform my-2"
                style={{ transform: 'scale(0.72)', transformOrigin: 'top center', marginBottom: '-180px' }}
              >
                <CertificateTemplate 
                  student={currentPreviewStudent}
                  institution={institution}
                  settings={testimonialSettings}
                  id={`cert-preview-${currentPreviewStudent.id}`}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                {isBn ? 'প্রিভিউ দেখার জন্য শিক্ষার্থী নির্বাচন করুন' : 'Select a student to view preview'}
              </div>
            )}
          </div>

          {/* Hidden offscreen container for bulk PDF generation */}
          <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }} ref={bulkContainerRef}>
            {activeStudents.map(student => (
              <div key={student.id} className="bulk-cert-page">
                <CertificateTemplate 
                  student={student}
                  institution={institution}
                  settings={testimonialSettings}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <TestimonialImportModal isOpen={showImport} onClose={() => setShowImport(false)} />
      <TestimonialBulkEditModal isOpen={showBulkEdit} onClose={() => setShowBulkEdit(false)} />
      
      {studentToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">{isBn ? 'নিশ্চিত করুন' : 'Confirm Deletion'}</h3>
            <p className="text-slate-600 mb-6 text-sm">{isBn ? 'আপনি কি নিশ্চিত যে এই শিক্ষার্থীকে মুছে ফেলতে চান? এটি আর ফেরানো যাবে না।' : 'Are you sure you want to delete this student? This action cannot be undone.'}</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setStudentToDelete(null)} className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium">{isBn ? 'বাতিল' : 'Cancel'}</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">{isBn ? 'মুছে ফেলুন' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )}
</div>
  );
};

export default Testimonial;
