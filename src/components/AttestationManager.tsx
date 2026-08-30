import React, { useState, useRef, useMemo } from 'react';
import { 
  Printer, Download, Settings, Users, CheckSquare, 
  Square, ChevronLeft, ChevronRight, Upload, Sparkles, 
  RotateCcw, SlidersHorizontal, Image, Type, Scaling,
  MoveVertical, Check, ArrowRightLeft, UserCheck, Edit3, Loader2, Database
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { AttestationSettings, Student } from '../types';
import { AttestationTemplate } from './AttestationTemplate';
import { TestimonialImportModal } from './TestimonialImportModal';
import { downloadCertificatePDF, downloadBulkCertificatesPDF } from '../utils/pdfGenerator';
import { toBengaliNumber, getBengaliClassName, getBengaliFormattedDate } from '../utils/bengaliUtils';

export const AttestationManager: React.FC = () => {
  const { 
    language, 
    students, 
    institution, 
    academicClasses, 
    academicGroups, 
    academicSections 
  } = useAppStore();
  
  const isBn = language === 'bn';

  // Selection & Filtering State
  const [studentType, setStudentType] = useState<'currently_studying' | 'previously_studied'>('currently_studying');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedSession, setSelectedSession] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // UI Panels State
  const [showSettings, setShowSettings] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Printable Refs
  const unscaledSnapshotRef = useRef<HTMLDivElement>(null);
  const bulkContainerRef = useRef<HTMLDivElement>(null);

  // Settings State
  const defaultSettings: AttestationSettings = {
    studentType: 'currently_studying',
    memoNo: '',
    issueDate: getBengaliFormattedDate(),
    title: '‘প্রত্যয়নপত্র’',
    subtitle: 'যাহার জন্য প্রযোজ্য',
    frameStyle: 'none',
    showInstituteLogo: true,
    includePhoto: false,
    rightLogoType: 'none',
    showQrCode: true,
    showSignature: true,
    headmasterName: institution.headmasterNameBn || institution.headmasterName || 'মো: আবদুর রহমান',
    headmasterTitle: institution.headmasterTitleBn || 'প্রধান শিক্ষক',
    instNameFontSize: 25,
    bodyFontSize: 16,
    bodyLineHeight: 2.25,
    titleTopSpace: 28,
    titleBottomSpace: 28,
    paragraphSpacing: 14,
    closingTopSpace: 8,
    closingFontSize: 18,
    pageMargin: 0.4,
    pageMarginTop: 0.4,
    pageMarginBottom: 0.4,
    pageMarginLeft: 0.4,
    pageMarginRight: 0.4,
  };

  const [attestationSettings, setAttestationSettings] = useState<AttestationSettings>(defaultSettings);

  const classesList = Array.isArray(academicClasses) ? academicClasses : [];
  const groupsList = Array.isArray(academicGroups) ? academicGroups : [];
  const sectionsList = Array.isArray(academicSections) ? academicSections : [];

  const availableSessions = useMemo(() => {
    return Array.from(new Set((students || []).map(s => s.session).filter(Boolean)));
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return (students || []).filter(s => {
      const matchesClass = selectedClass === 'all' || s.class === selectedClass;
      const matchesGroup = selectedGroup === 'all' || s.group === selectedGroup;
      const matchesSection = selectedSection === 'all' || s.section === selectedSection || (!s.section && selectedSection === 'ক');
      const matchesSession = selectedSession === 'all' || s.session === selectedSession;
      const matchesSearch = !searchTerm.trim() || 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.nameBn && s.nameBn.includes(searchTerm)) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.roll && s.roll.includes(searchTerm));
      return matchesClass && matchesGroup && matchesSection && matchesSession && matchesSearch;
    });
  }, [students, selectedClass, selectedGroup, selectedSection, selectedSession, searchTerm]);

  // Active students to preview/print
  const activeStudents = useMemo(() => {
    if (selectedStudentIds.length === 0) {
      return filteredStudents.slice(0, 1);
    }
    return filteredStudents.filter(s => selectedStudentIds.includes(s.id));
  }, [filteredStudents, selectedStudentIds]);

  const currentPreviewStudent = activeStudents[currentPreviewIndex] || activeStudents[0] || filteredStudents[0];

  // Selection handlers
  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedStudentIds(filteredStudents.map(s => s.id));
  };

  const handleDeselectAll = () => {
    setSelectedStudentIds([]);
    setCurrentPreviewIndex(0);
  };

  // Upload headmaster signature
  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttestationSettings(prev => ({
          ...prev,
          headmasterSignature: event.target?.result as string,
          showSignature: true,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Reset typography & spacing to standard defaults
  const handleResetSpacing = () => {
    setAttestationSettings(prev => ({
      ...prev,
      instNameFontSize: 25,
      bodyFontSize: 16,
      bodyLineHeight: 2.25,
      titleTopSpace: 28,
      titleBottomSpace: 28,
      paragraphSpacing: 14,
      closingTopSpace: 8,
      closingFontSize: 18,
      pageMargin: 0.4,
      pageMarginTop: 0.4,
      pageMarginBottom: 0.4,
      pageMarginLeft: 0.4,
      pageMarginRight: 0.4,
    }));
  };

  // Direct Print Handler
  const handleDirectPrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert(isBn ? 'পপ-আপ ব্লক করা আছে। ব্রাউজার সেটিংসে পপ-আপ অনুমতি দিন।' : 'Pop-up blocked. Please allow pop-ups for this site.');
      return;
    }

    const marginTop = attestationSettings.pageMarginTop !== undefined ? attestationSettings.pageMarginTop : (attestationSettings.pageMargin !== undefined ? attestationSettings.pageMargin : 0.4);
    const marginBottom = attestationSettings.pageMarginBottom !== undefined ? attestationSettings.pageMarginBottom : (attestationSettings.pageMargin !== undefined ? attestationSettings.pageMargin : 0.4);
    const marginLeft = attestationSettings.pageMarginLeft !== undefined ? attestationSettings.pageMarginLeft : (attestationSettings.pageMargin !== undefined ? attestationSettings.pageMargin : 0.4);
    const marginRight = attestationSettings.pageMarginRight !== undefined ? attestationSettings.pageMarginRight : (attestationSettings.pageMargin !== undefined ? attestationSettings.pageMargin : 0.4);

    let certsHtml = '';
    if (bulkContainerRef.current && activeStudents.length > 1) {
      const pages = bulkContainerRef.current.querySelectorAll('.bulk-attestation-page');
      pages.forEach(p => {
        certsHtml += `<div class="print-page-wrapper">${p.innerHTML}</div>`;
      });
    } else if (unscaledSnapshotRef.current) {
      certsHtml = `<div class="print-page-wrapper">${unscaledSnapshotRef.current.innerHTML}</div>`;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="bn">
        <head>
          <title>${isBn ? 'প্রত্যয়নপত্র প্রিন্ট' : 'Print Attestation Certificate'}</title>
          <meta charset="utf-8" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+Bengali:wght@400;500;600;700;800;900&family=Tiro+Bangla:ital@0;1&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin-top: ${marginTop}in;
              margin-bottom: ${marginBottom}in;
              margin-left: ${marginLeft}in;
              margin-right: ${marginRight}in;
            }
            *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            html, body {
              width: 100%; margin: 0; padding: 0; background: #ffffff; color: #020617;
              font-family: 'Tiro Bangla', 'Noto Serif Bengali', 'SolaimanLipi', serif;
              -webkit-print-color-adjust: exact; print-color-adjust: exact;
            }
            .print-page-wrapper {
              page-break-after: always; page-break-inside: avoid; break-after: page; break-inside: avoid;
              width: 100%; height: 100%; box-sizing: border-box; display: block;
            }
            .print-page-wrapper:last-child { page-break-after: auto; break-after: auto; }
            .attestation-a4-page {
              width: 100% !important; height: 100% !important; max-height: 100% !important;
              min-height: auto !important; padding: 0 !important; box-sizing: border-box !important;
              overflow: hidden !important; display: flex !important; flex-direction: column !important;
            }
            img { max-width: 80px !important; max-height: 80px !important; object-fit: contain !important; }
            .flex { display: flex !important; }
            .flex-col { flex-direction: column !important; }
            .flex-1 { flex: 1 1 0% !important; }
            .justify-between { justify-content: space-between !important; }
            .items-center { align-items: center !important; }
            .items-end { align-items: flex-end !important; }
            .text-center { text-align: center !important; }
            .text-justify { text-align: justify !important; }
            .w-full { width: 100% !important; }
            .h-full { height: 100% !important; }
            .border-b-2 { border-bottom: 2px solid #0f172a !important; }
            .border-b { border-bottom: 1px solid #cbd5e1 !important; }
            .border-t { border-top: 1px solid #0f172a !important; }
            .font-bold { font-weight: 700 !important; }
            .font-black { font-weight: 900 !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-medium { font-weight: 500 !important; }
          </style>
        </head>
        <body>
          ${certsHtml}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 600);
  };

  // Single PDF Download
  const handleDownloadSinglePdf = async () => {
    const targetEl = unscaledSnapshotRef.current || (currentPreviewStudent && document.getElementById(`attestation-preview-${currentPreviewStudent.id}`));
    if (!targetEl || !currentPreviewStudent) return;
    try {
      setIsGeneratingPdf(true);
      const studentName = currentPreviewStudent.nameBn || currentPreviewStudent.name;
      const rollNumber = currentPreviewStudent.roll || 'Cert';
      const fileName = `প্রত্যয়নপত্র_${studentName}_রোল_${rollNumber}.pdf`;
      await downloadCertificatePDF(targetEl, fileName);
      showToast(isBn ? 'প্রত্যয়নপত্র পিডিএফ সফলভাবে ডাউনলোড হয়েছে!' : 'Attestation PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF error:', err);
      showToast(isBn ? 'পিডিএফ তৈরিতে সমস্যা হয়েছে।' : 'Failed to generate PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Bulk PDF Download
  const handleDownloadBulkPdf = async () => {
    if (!bulkContainerRef.current) return;
    const certElements = Array.from(
      bulkContainerRef.current.querySelectorAll('.bulk-attestation-page')
    ) as HTMLElement[];

    if (certElements.length === 0) return;

    try {
      setIsGeneratingPdf(true);
      setPdfProgress(isBn ? 'পিডিএফ তৈরি হচ্ছে...' : 'Generating PDF...');
      const classBn = getBengaliClassName(selectedClass);
      const fileName = `বাল্ক_প্রত্যয়নপত্র_${classBn}_${activeStudents.length}_জন_শিক্ষার্থী.pdf`;

      await downloadBulkCertificatesPDF(certElements, fileName, (current, total) => {
        setPdfProgress(`${toBengaliNumber(current)}/${toBengaliNumber(total)}`);
      });
      showToast(isBn ? `${toBengaliNumber(activeStudents.length)} জন শিক্ষার্থীর প্রত্যয়নপত্র তৈরি সম্পন্ন!` : `Bulk PDF generated for ${activeStudents.length} students!`);
    } catch (err) {
      console.error('Bulk PDF Error:', err);
      showToast(isBn ? 'বাল্ক পিডিএফ তৈরিতে সমস্যা হয়েছে।' : 'Failed to generate bulk PDF.');
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress('');
    }
  };

  const frameOptions = isBn ? [
    { id: 'none', name: 'কোনো ফ্রেম নেই (স্ট্যান্ডার্ড)' },
    { id: 'simple', name: 'ক্লাসিক বর্ডার' },
    { id: 'double', name: 'ডাবল লাইন বর্ডার' },
    { id: 'corner', name: 'অফিশিয়াল কর্নার ফ্রেম' },
    { id: 'royal', name: 'রয়্যাল গোল্ড ফ্রেম' },
    { id: 'academic', name: 'একাডেমিক গ্রিন ফ্রেম' },
  ] : [
    { id: 'none', name: 'No Frame (Standard)' },
    { id: 'simple', name: 'Classic Border' },
    { id: 'double', name: 'Double Line Border' },
    { id: 'corner', name: 'Official Corner Frame' },
    { id: 'royal', name: 'Royal Gold Frame' },
    { id: 'academic', name: 'Academic Green Frame' },
  ];

  return (
    <div className="space-y-5">
      {/* Top Banner & Action Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              {isBn ? 'প্রত্যয়নপত্র জেনারেশন' : 'Attestation Certificate Generator'}
            </h1>
            <p className="text-slate-500 text-xs mt-0.5 font-medium">
              {isBn 
                ? 'শিক্ষার্থীদের জন্য A4 সাইজে স্বয়ংক্রিয় প্রত্যয়নপত্র প্রিন্ট ও সংরক্ষণ'
                : 'Generate & print A4 attestation certificates with student enrollment details'}
            </p>
          </div>

          {/* Quick Toolbar */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Direct Photo Switch */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setAttestationSettings(p => ({ ...p, includePhoto: false, rightLogoType: 'none' }))}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  !attestationSettings.includePhoto
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isBn ? 'ছবি ছাড়া' : 'Without Photo'}
              </button>
              <button
                type="button"
                onClick={() => setAttestationSettings(p => ({ ...p, includePhoto: true, rightLogoType: 'student_photo' }))}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  attestationSettings.includePhoto
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isBn ? 'ছবি সহ' : 'With Photo'}
              </button>
            </div>

            <button
              onClick={() => setShowImportModal(true)}
              className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-xl font-bold transition-colors flex items-center gap-1.5 text-xs shadow-2xs"
            >
              <Database className="w-4 h-4 text-emerald-600" />
              {isBn ? 'ডাটা ইমপোর্ট' : 'Import Data'}
            </button>

            <button
              onClick={() => setShowTextEditor(!showTextEditor)}
              className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 px-3 py-2 rounded-xl font-bold transition-colors flex items-center gap-1.5 text-xs shadow-2xs"
            >
              <Edit3 className="w-4 h-4 text-purple-600" />
              {isBn ? 'স্মারক ও তারিখ' : 'Memo & Date'}
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl font-bold transition-colors flex items-center gap-1.5 text-xs shadow-2xs"
            >
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              {isBn ? 'লেআউট কন্ট্রোল' : 'Layout Controls'}
            </button>
          </div>
        </div>

        {/* Student Type Selection */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              setStudentType('currently_studying');
              setAttestationSettings(p => ({ ...p, studentType: 'currently_studying' }));
            }}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
              studentType === 'currently_studying'
                ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-950 shadow-2xs'
                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className={`p-2 rounded-lg ${studentType === 'currently_studying' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">
                {isBn ? '১. বর্তমানে অধ্যয়নরত শিক্ষার্থী' : '1. Currently Studying Student'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {isBn ? 'শ্রেণি, বিভাগ ও শাখা অনুযায়ী নিয়মিত শিক্ষার্থী' : 'Enrolled students by class & section'}
              </p>
            </div>
            {studentType === 'currently_studying' && (
              <Check className="w-4 h-4 text-indigo-600 ml-auto flex-shrink-0" />
            )}
          </button>

          <button
            onClick={() => {
              setStudentType('previously_studied');
              setAttestationSettings(p => ({ ...p, studentType: 'previously_studied' }));
            }}
            className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
              studentType === 'previously_studied'
                ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-500/20 text-indigo-950 shadow-2xs'
                : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            <div className={`p-2 rounded-lg ${studentType === 'previously_studied' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold">
                {isBn ? '২. পূর্বে অধ্যয়নরত শিক্ষার্থী' : '2. Previously Studied / Ex-Student'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                {isBn ? 'পূর্বে অধ্যায়ন সম্পন্নকারী বা ছাড়পত্রপ্রাপ্ত শিক্ষার্থী' : 'Students who studied in previous sessions'}
              </p>
            </div>
            {studentType === 'previously_studied' && (
              <Check className="w-4 h-4 text-indigo-600 ml-auto flex-shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white p-5 rounded-2xl shadow-md border border-indigo-100 space-y-4">
          <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
              {isBn ? 'ফন্ট সাইজ ও স্পেসিং কাস্টমাইজেশন' : 'Typography & Spacing Controls'}
            </h3>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetSpacing}
                className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg font-bold transition-colors"
              >
                <RotateCcw size={12} /> {isBn ? 'রিসেট' : 'Reset'}
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-bold"
              >
                {isBn ? 'সংরক্ষণ ও বন্ধ' : 'Save & Close'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{isBn ? 'প্রতিষ্ঠানের নাম' : 'Institute'}:</span>
                <span className="font-bold text-indigo-600">{toBengaliNumber(attestationSettings.instNameFontSize || 25)}px</span>
              </div>
              <input
                type="range" min="20" max="32" step="1"
                value={attestationSettings.instNameFontSize || 25}
                onChange={(e) => setAttestationSettings(p => ({ ...p, instNameFontSize: Number(e.target.value) }))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{isBn ? 'বিবরণী সাইজ' : 'Body Size'}:</span>
                <span className="font-bold text-indigo-600">{toBengaliNumber(attestationSettings.bodyFontSize || 16)}px</span>
              </div>
              <input
                type="range" min="13" max="20" step="0.5"
                value={attestationSettings.bodyFontSize || 16}
                onChange={(e) => setAttestationSettings(p => ({ ...p, bodyFontSize: Number(e.target.value) }))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{isBn ? 'লাইন স্পেসিং' : 'Line Spacing'}:</span>
                <span className="font-bold text-indigo-600">{toBengaliNumber((attestationSettings.bodyLineHeight || 2.25).toFixed(2))}</span>
              </div>
              <input
                type="range" min="1.6" max="3.0" step="0.05"
                value={attestationSettings.bodyLineHeight || 2.25}
                onChange={(e) => setAttestationSettings(p => ({ ...p, bodyLineHeight: Number(e.target.value) }))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{isBn ? 'প্যারাগ্রাফ গ্যাপ' : 'Para Gap'}:</span>
                <span className="font-bold text-indigo-600">{toBengaliNumber(attestationSettings.paragraphSpacing || 14)}px</span>
              </div>
              <input
                type="range" min="6" max="28" step="1"
                value={attestationSettings.paragraphSpacing || 14}
                onChange={(e) => setAttestationSettings(p => ({ ...p, paragraphSpacing: Number(e.target.value) }))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{isBn ? 'উপরের মার্জিন' : 'Top Margin'}:</span>
                <span className="font-bold text-indigo-600">{toBengaliNumber((attestationSettings.pageMarginTop ?? 0.4).toFixed(2))} in</span>
              </div>
              <input
                type="range" min="0.1" max="1.2" step="0.05"
                value={attestationSettings.pageMarginTop ?? 0.4}
                onChange={(e) => setAttestationSettings(p => ({ ...p, pageMarginTop: Number(e.target.value) }))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{isBn ? 'নিচের মার্জিন' : 'Bottom Margin'}:</span>
                <span className="font-bold text-indigo-600">{toBengaliNumber((attestationSettings.pageMarginBottom ?? 0.4).toFixed(2))} in</span>
              </div>
              <input
                type="range" min="0.1" max="1.2" step="0.05"
                value={attestationSettings.pageMarginBottom ?? 0.4}
                onChange={(e) => setAttestationSettings(p => ({ ...p, pageMarginBottom: Number(e.target.value) }))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{isBn ? 'বাম মার্জিন' : 'Left Margin'}:</span>
                <span className="font-bold text-indigo-600">{toBengaliNumber((attestationSettings.pageMarginLeft ?? 0.4).toFixed(2))} in</span>
              </div>
              <input
                type="range" min="0.1" max="1.2" step="0.05"
                value={attestationSettings.pageMarginLeft ?? 0.4}
                onChange={(e) => setAttestationSettings(p => ({ ...p, pageMarginLeft: Number(e.target.value) }))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{isBn ? 'ডান মার্জিন' : 'Right Margin'}:</span>
                <span className="font-bold text-indigo-600">{toBengaliNumber((attestationSettings.pageMarginRight ?? 0.4).toFixed(2))} in</span>
              </div>
              <input
                type="range" min="0.1" max="1.2" step="0.05"
                value={attestationSettings.pageMarginRight ?? 0.4}
                onChange={(e) => setAttestationSettings(p => ({ ...p, pageMarginRight: Number(e.target.value) }))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="sm:col-span-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>{isBn ? 'ফ্রেম ডিজাইন' : 'Frame'}:</span>
              </div>
              <select
                value={attestationSettings.frameStyle}
                onChange={(e) => setAttestationSettings(p => ({ ...p, frameStyle: e.target.value as any }))}
                className="w-full px-2 py-1 text-xs border border-slate-300 rounded-lg bg-white font-semibold"
              >
                {frameOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-800">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attestationSettings.showInstituteLogo}
                  onChange={(e) => setAttestationSettings(p => ({ ...p, showInstituteLogo: e.target.checked }))}
                  className="rounded text-indigo-600"
                />
                <span>{isBn ? 'প্রতিষ্ঠান লোগো' : 'Institute Logo'}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attestationSettings.showQrCode}
                  onChange={(e) => setAttestationSettings(p => ({ ...p, showQrCode: e.target.checked }))}
                  className="rounded text-indigo-600"
                />
                <span>{isBn ? 'কিউআর কোড' : 'QR Code'}</span>
              </label>
            </div>

            <label className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-slate-300 hover:border-indigo-500 rounded-xl bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer">
              <Upload size={13} />
              <span>{isBn ? 'স্বাক্ষর আপলোড' : 'Upload Signature'}</span>
              <input type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {/* Text Editor Panel */}
      {showTextEditor && (
        <div className="bg-white p-5 rounded-2xl shadow-md border border-purple-100 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-purple-600" />
              {isBn ? 'স্মারক নম্বর ও ইস্যু তারিখ' : 'Memo No & Issue Date'}
            </h3>
            <button
              onClick={() => setShowTextEditor(false)}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg font-bold"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'স্মারক নম্বর (খালি রাখলে স্বয়ংক্রিয় বসবে)' : 'Memo No'}
              </label>
              <input
                type="text"
                value={attestationSettings.memoNo}
                onChange={(e) => setAttestationSettings(p => ({ ...p, memoNo: e.target.value }))}
                placeholder={isBn ? 'যেমন: আউবি/প্রত্যয়নপত্র/২০২৬/০১' : 'e.g. AHS/Attestation/2026/01'}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isBn ? 'ইস্যুর তারিখ' : 'Issue Date'}
              </label>
              <input
                type="text"
                value={attestationSettings.issueDate}
                onChange={(e) => setAttestationSettings(p => ({ ...p, issueDate: e.target.value }))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 font-semibold"
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace: Left List + Right Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Student Filter & List */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 flex flex-col h-[calc(100vh-230px)] min-h-[600px] overflow-hidden">
          
          {/* List Header */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/80 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Users size={14} className="text-indigo-600" />
                {isBn 
                  ? `শিক্ষার্থী (${toBengaliNumber(selectedStudentIds.length > 0 ? selectedStudentIds.length : 1)} নির্বাচিত)`
                  : `Students (${selectedStudentIds.length > 0 ? selectedStudentIds.length : 1} Selected)`}
              </span>
              <div className="flex gap-2 text-[11px] font-bold">
                <button onClick={handleSelectAll} className="text-indigo-600 hover:text-indigo-800">
                  {isBn ? 'সবাই' : 'All'}
                </button>
                <span className="text-slate-300">|</span>
                <button onClick={handleDeselectAll} className="text-slate-500 hover:text-slate-700">
                  {isBn ? 'ক্লিয়ার' : 'Clear'}
                </button>
              </div>
            </div>

            {/* Class, Group, Section, Session Filters */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="all">{isBn ? 'সকল শ্রেণি' : 'All Classes'}</option>
                  {classesList.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="all">{isBn ? 'সকল বিভাগ' : 'All Groups'}</option>
                  {groupsList.map(g => (
                    <option key={g.id} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="all">{isBn ? 'সকল শাখা' : 'All Sections'}</option>
                  {sectionsList.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold"
                >
                  <option value="all">{isBn ? 'সকল সেশন' : 'All Sessions'}</option>
                  {availableSessions.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder={isBn ? 'নাম, আইডি বা রোল দিয়ে খুঁজুন...' : 'Search name, ID or roll...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
              />
            </div>
          </div>

          {/* Student List Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                const isCurrentlyActive = currentPreviewStudent?.id === student.id;
                const displayName = isBn ? (student.nameBn || student.name) : (student.name || student.nameBn);
                const rollDisplay = isBn ? toBengaliNumber(student.roll) : student.roll;
                const classDisplay = isBn ? getBengaliClassName(student.class) : student.class;
                const sectionDisplay = student.section || 'ক';
                const groupDisplay = student.group || 'সাধারণ';

                return (
                  <div
                    key={student.id}
                    onClick={() => {
                      if (!selectedStudentIds.includes(student.id)) {
                        setSelectedStudentIds([student.id]);
                      }
                      const indexInActive = activeStudents.findIndex(s => s.id === student.id);
                      if (indexInActive >= 0) {
                        setCurrentPreviewIndex(indexInActive);
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                      isCurrentlyActive
                        ? 'bg-indigo-50/90 border-l-4 border-l-indigo-600'
                        : isSelected
                        ? 'bg-indigo-50/40 border-l-4 border-l-indigo-300'
                        : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStudent(student.id);
                      }}
                      className={`flex-shrink-0 ${isSelected ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${isCurrentlyActive ? 'text-indigo-950' : 'text-slate-900'}`}>
                        {displayName}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                        {classDisplay} | {sectionDisplay} {groupDisplay !== 'সাধারণ' && groupDisplay !== 'প্রযোজ্য নয়' ? `| ${groupDisplay}` : ''} | রোল: {rollDisplay}
                      </p>
                    </div>

                    {isCurrentlyActive && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                        {isBn ? 'সক্রিয়' : 'Active'}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs font-medium">
                {isBn ? 'কোনো শিক্ষার্থী পাওয়া যায়নি' : 'No students found'}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preview & Print Toolbar */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 lg:col-span-3 p-4 sm:p-5 flex flex-col overflow-hidden h-[calc(100vh-230px)] min-h-[600px]">
          
          <div className="flex flex-wrap justify-between items-center gap-3 mb-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-700 font-bold">
                {isBn
                  ? `প্রিভিউ: ${toBengaliNumber(currentPreviewIndex + 1)} / ${toBengaliNumber(activeStudents.length)}`
                  : `Preview: ${currentPreviewIndex + 1} / ${activeStudents.length}`}
              </span>
              <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                <button
                  disabled={currentPreviewIndex === 0}
                  onClick={() => setCurrentPreviewIndex(p => Math.max(0, p - 1))}
                  className="p-1.5 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={currentPreviewIndex >= activeStudents.length - 1}
                  onClick={() => setCurrentPreviewIndex(p => Math.min(activeStudents.length - 1, p + 1))}
                  className="p-1.5 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Print & Download Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleDirectPrint}
                disabled={!currentPreviewStudent || isGeneratingPdf}
                className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 disabled:opacity-50 px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5 text-slate-700" />
                {isBn ? 'সরাসরি প্রিন্ট' : 'Direct Print'}
              </button>

              <button
                onClick={handleDownloadSinglePdf}
                disabled={!currentPreviewStudent || isGeneratingPdf}
                className="bg-slate-900 hover:bg-black disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {isBn ? 'পিডিএফ ডাউনলোড' : 'PDF Download'}
              </button>

              {activeStudents.length > 1 && (
                <button
                  onClick={handleDownloadBulkPdf}
                  disabled={isGeneratingPdf}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {isGeneratingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                  {isBn ? `একত্রে ডাউনলোড (${toBengaliNumber(activeStudents.length)})` : `Bulk PDF (${activeStudents.length})`}
                  {pdfProgress && ` [${pdfProgress}]`}
                </button>
              )}
            </div>
          </div>

          {toastMessage && (
            <div className="mb-2 p-2.5 bg-emerald-800 text-white rounded-xl shadow-md text-xs font-bold text-center animate-fade-in">
              {toastMessage}
            </div>
          )}

          {/* Live Preview Container */}
          <div className="flex-1 overflow-auto bg-slate-100 rounded-xl p-4 flex justify-center items-start">
            {currentPreviewStudent ? (
              <div 
                className="bg-white shadow-xl rounded-sm transform origin-top my-2"
                style={{ transform: 'scale(0.72)', transformOrigin: 'top center', marginBottom: '-180px' }}
              >
                <AttestationTemplate
                  student={currentPreviewStudent}
                  institution={institution}
                  settings={attestationSettings}
                  id={`attestation-preview-${currentPreviewStudent.id}`}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium">
                {isBn ? 'শিক্ষার্থী নির্বাচন করুন' : 'Select a student'}
              </div>
            )}
          </div>

          {/* Offscreen unscaled render */}
          <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }} ref={unscaledSnapshotRef}>
            {currentPreviewStudent && (
              <AttestationTemplate
                student={currentPreviewStudent}
                institution={institution}
                settings={attestationSettings}
              />
            )}
          </div>

          {/* Bulk Offscreen */}
          <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }} ref={bulkContainerRef}>
            {activeStudents.map(student => (
              <div key={student.id} className="bulk-attestation-page">
                <AttestationTemplate
                  student={student}
                  institution={institution}
                  settings={attestationSettings}
                />
              </div>
            ))}
          </div>

        </div>
      </div>

      <TestimonialImportModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} />
    </div>
  );
};
