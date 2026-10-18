import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  BookOpen, 
  Sliders, 
  Download, 
  Printer, 
  UserCheck, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  ChevronRight, 
  FileText, 
  Users, 
  Globe, 
  Layers,
  Sparkles,
  ChevronDown,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  Filter,
  ShieldCheck,
  Undo2
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { 
  TestimonialExam, 
  TestimonialRosterItem, 
  DistributionRegisterEntry, 
  DEFAULT_EXAM_TYPES, 
  DEFAULT_BOARD_TESTIMONIAL_SETTINGS 
} from '../../types/testimonial';
import { TestimonialSettings, Student, ExamResult, IssuedTestimonial } from '../../types';
import { BoardTestimonialRenderer } from './BoardTestimonialRenderer';
import { ExamCreateModal } from './ExamCreateModal';
import { StudentImportModal } from './StudentImportModal';
import { RosterTableView } from './RosterTableView';
import { BulkEditorModal } from './BulkEditorModal';
import { DistributionRegisterView } from './DistributionRegisterView';
import { TestimonialLayoutSettingsModal } from './TestimonialLayoutSettingsModal';
import { TestimonialQrVerificationModal } from './TestimonialQrVerificationModal';
import { toBengaliNumber, getBengaliBoard } from '../../utils/bengaliUtils';
import { 
  downloadSingleTestimonialPdf, 
  downloadBulkTestimonialsPdf, 
  triggerDirectPrint 
} from './testimonialPdfExporter';
import { 
  resolveBilingualAddress, 
  resolveBilingualCenter, 
  isBengaliScript, 
  isEnglishScript 
} from './testimonialLocationResolver';
import { 
  validateOfficialTestimonialReadiness,
  generateCanonicalVerificationToken,
  createIssuedTestimonialEntity,
  saveTestimonialRosterChangesAtomic
} from '../../services/testimonialService';
import { 
  DEMO_TESTIMONIAL_EXAM, 
  DEMO_EXAM_RESULTS 
} from '../../fixtures/testimonialFixtures';
import toast from 'react-hot-toast';

interface TestimonialWorkspaceProps {
  onBackToHub: () => void;
}

export const TestimonialWorkspace: React.FC<TestimonialWorkspaceProps> = ({ onBackToHub }) => {
  const {
    students,
    staff,
    institution,
    academicClasses: classes,
    academicSections: sections,
    academicGroups: groups,
    examResults,
    saveExamResults,
    bulkAddExamResults,
    updateExamResult,
    deleteExamResult,
    bulkDeleteExamResults,
    issuedTestimonials,
    addIssuedTestimonial,
    updateIssuedTestimonial,
    testimonialSettings,
    updateTestimonialSettings,
    updateStudent,
    learnedLocations,
  } = useAppStore();

  // Active Tab: 'roster' | 'preview' | 'distribution'
  const [activeTab, setActiveTab] = useState<'roster' | 'preview' | 'distribution'>('roster');

  // Exams State (Stored in localStorage or derived from canonical state)
  const [exams, setExams] = useState<TestimonialExam[]>(() => {
    try {
      const saved = localStorage.getItem('bidyalok_testimonial_exams');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [activeExamId, setActiveExamId] = useState<string>(() => exams[0]?.id || '');

  // Save exams to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem('bidyalok_testimonial_exams', JSON.stringify(exams));
    } catch (e) {
      console.error(e);
    }
  }, [exams]);

  // Keep activeExamId synced
  useEffect(() => {
    if (exams.length > 0 && (!activeExamId || !exams.some(e => e.id === activeExamId))) {
      setActiveExamId(exams[0].id);
    }
  }, [exams, activeExamId]);

  const activeExam = useMemo<TestimonialExam | null>(() => {
    return exams.find(e => e.id === activeExamId) || exams[0] || null;
  }, [exams, activeExamId]);

  // Selected Student IDs in the Active Exam Roster
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Active Student for Preview Tab
  const [activeStudentId, setActiveStudentId] = useState<string>('');
  const [previewSearchTerm, setPreviewSearchTerm] = useState('');
  const [previewFilter, setPreviewFilter] = useState<'all' | 'ready' | 'missing'>('all');
  const [previewScale, setPreviewScale] = useState<number>(0.8);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Auto shrink-to-fit: calculate scale so 1123px width certificate fits inside the container without scrolling
  useEffect(() => {
    if (activeTab !== 'preview') return;

    const updateScale = () => {
      if (!previewContainerRef.current) return;
      const containerWidth = previewContainerRef.current.clientWidth - 32; // account for padding
      if (containerWidth > 0) {
        const calculatedScale = Math.min(1, Math.max(0.35, containerWidth / 1123));
        setPreviewScale(Number(calculatedScale.toFixed(3)));
      }
    };

    updateScale();
    const resizeObserver = new ResizeObserver(updateScale);
    if (previewContainerRef.current) {
      resizeObserver.observe(previewContainerRef.current);
    }
    window.addEventListener('resize', updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [activeTab]);

  // Modals
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBulkEditorOpen, setIsBulkEditorOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);

  // Manual Explicit Issue Confirmation Modal State
  const [issueConfirmModal, setIssueConfirmModal] = useState<{
    isOpen: boolean;
    item: TestimonialRosterItem | null;
    serialNo: string;
    issueDate: string;
  }>({
    isOpen: false,
    item: null,
    serialNo: '',
    issueDate: new Date().toLocaleDateString('en-GB'),
  });

  // Pre-delete snapshot for undo
  const [deletedSnapshot, setDeletedSnapshot] = useState<{ examId: string; results: ExamResult[] } | null>(null);

  // PDF Generation Progress
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<{ current: number; total: number } | null>(null);

  // Merge Testimonial Settings with Defaults
  const currentSettings: TestimonialSettings = useMemo(() => ({
    ...DEFAULT_BOARD_TESTIMONIAL_SETTINGS,
    ...testimonialSettings,
  }), [testimonialSettings]);

  // 1. Build Relational Roster Items for the Active Exam
  const rosterItems: TestimonialRosterItem[] = useMemo(() => {
    if (!activeExam) return [];

    // Filter examResults belonging strictly to this examId
    const relevantResults = examResults.filter(er => er.examId === activeExam.id);

    // Create a student map for fast resolution
    const studentMap = new Map<string, Student>();
    students.forEach(s => studentMap.set(s.studentId, s));

    return relevantResults.map(er => {
      const student = studentMap.get(er.studentId);
      const studentDbId = er.studentDbId || student?.id || '';
      
      // Issued testimonial lookup (exact studentId and examId)
      const issued = issuedTestimonials.find(
        it => it.studentId === er.studentId && it.examId === activeExam.id
      );

      // Resolve address via resolveBilingualAddress
      const addr = resolveBilingualAddress(
        {
          village: er.village || student?.village,
          villageBn: er.villageBn || student?.villageBn,
          postOffice: er.postOffice || student?.postOffice,
          postOfficeBn: er.postOfficeBn || student?.postOfficeBn,
          upazila: er.upazila || student?.upazila,
          upazilaBn: er.upazilaBn || student?.upazilaBn,
          district: er.district || student?.district,
          districtBn: er.districtBn || student?.districtBn,
          upazilaId: student?.upazilaId,
          districtId: student?.districtId,
        },
        institution,
        learnedLocations
      );

      // Names script awareness
      const rawName = (er.name || student?.name || '').trim();
      const rawNameBn = (er.nameBn || student?.nameBn || '').trim();
      const nameBn = isBengaliScript(rawNameBn) ? rawNameBn : (isBengaliScript(rawName) ? rawName : rawNameBn);
      const name = isEnglishScript(rawName) ? rawName : (isEnglishScript(rawNameBn) ? rawNameBn : '');

      const rawFather = (er.fatherName || student?.fatherName || '').trim();
      const rawFatherBn = (er.fatherNameBn || student?.fatherNameBn || '').trim();
      const fatherNameBn = isBengaliScript(rawFatherBn) ? rawFatherBn : (isBengaliScript(rawFather) ? rawFather : rawFatherBn);
      const fatherName = isEnglishScript(rawFather) ? rawFather : (isEnglishScript(rawFatherBn) ? rawFatherBn : '');

      const rawMother = (er.motherName || student?.motherName || '').trim();
      const rawMotherBn = (er.motherNameBn || student?.motherNameBn || '').trim();
      const motherNameBn = isBengaliScript(rawMotherBn) ? rawMotherBn : (isBengaliScript(rawMother) ? rawMother : rawMotherBn);
      const motherName = isEnglishScript(rawMother) ? rawMother : (isEnglishScript(rawMotherBn) ? rawMotherBn : '');

      const dateOfBirth = er.dateOfBirth || student?.dateOfBirth || '';
      const gender = er.gender || student?.gender || 'Male';

      const village = addr.villageEn;
      const villageBn = addr.villageBn;
      const postOffice = addr.postOfficeEn;
      const postOfficeBn = addr.postOfficeBn;
      const upazila = addr.upazilaEn;
      const upazilaBn = addr.upazilaBn;
      const district = addr.districtEn;
      const districtBn = addr.districtBn;

      const boardRollNo = er.boardRollNo || '';
      const registrationNo = er.registrationNo || student?.registrationNo || '';
      const session = er.session || student?.session || activeExam.session || '';
      const group = er.group || student?.group || '';
      const gpa = er.gpa || (student as any)?.gpa || '';
      const board = er.board || activeExam.board || institution?.board || '';

      const center = resolveBilingualCenter(
        er.examCenter,
        er.examCenterBn,
        activeExam.examCenter,
        activeExam.examCenterBn,
        upazila,
        upazilaBn,
        learnedLocations
      );

      const partialItem: TestimonialRosterItem = {
        id: er.id,
        studentId: er.studentId,
        studentDbId,
        examId: activeExam.id,
        examName: activeExam.displayName,
        examNameBn: activeExam.displayNameBn,
        passingYear: activeExam.year,
        session,
        group,
        boardRollNo,
        registrationNo,
        gpa,
        board,
        examCenter: center.en,
        examCenterBn: center.bn,
        name,
        nameBn,
        fatherName,
        fatherNameBn,
        motherName,
        motherNameBn,
        dateOfBirth,
        gender,
        village,
        villageBn,
        postOffice,
        postOfficeBn,
        union: er.union || student?.union || '',
        unionBn: er.unionBn || student?.unionBn || '',
        upazila,
        upazilaBn,
        district,
        districtBn,
        isIssued: !!issued,
        issuedSerialNo: issued?.serialNo || issued?.memoNo,
        issuedDate: issued?.issueDate,
        verificationToken: issued?.verificationToken,
        distributionStatus: (issued?.distributionStatus as any) || 'pending',
      };

      // Strict readiness validation
      const readiness = validateOfficialTestimonialReadiness(
        partialItem,
        institution,
        currentSettings.language || 'bn'
      );

      return {
        ...partialItem,
        isCompleteEn: readiness.missingFields.length === 0,
        isCompleteBn: readiness.missingFields.length === 0,
        missingFieldsEn: readiness.missingFields,
        missingFieldsBn: readiness.missingFieldLabelsBn,
        activeMissing: readiness.missingFieldLabelsBn,
      };
    });
  }, [activeExam, examResults, students, issuedTestimonials, institution, currentSettings.language, learnedLocations]);

  // Set default active student if empty
  useEffect(() => {
    if (rosterItems.length > 0 && (!activeStudentId || !rosterItems.some(r => r.studentId === activeStudentId))) {
      setActiveStudentId(rosterItems[0].studentId);
    }
  }, [rosterItems, activeStudentId]);

  const currentActiveRosterItem = useMemo(() => {
    return rosterItems.find(r => r.studentId === activeStudentId) || rosterItems[0] || null;
  }, [rosterItems, activeStudentId]);

  // 2. Build Distribution Register Entries
  const distributionEntries: DistributionRegisterEntry[] = useMemo(() => {
    if (!activeExam) return [];

    return rosterItems.map(item => {
      const issued = issuedTestimonials.find(
        it => it.studentId === item.studentId && it.examId === activeExam.id
      );

      return {
        id: issued?.id || `dist_${item.studentId}_${activeExam.id}`,
        studentId: item.studentId, examId: activeExam.id, examName: activeExam.displayName, boardRollNo: item.boardRollNo || '', registrationNo: item.registrationNo || '', language: 'bn', issuanceStatus: 'issued', distributionStatus: 'distributed',
        studentName: item.name || item.nameBn,
          verificationToken: '',
        studentNameBn: item.nameBn || item.name,
        rollNo: item.boardRollNo,
        regNo: item.registrationNo,
        group: item.group,
        serialNo: issued?.serialNo || issued?.memoNo || item.issuedSerialNo || '—',
        issueDate: issued?.issueDate || item.issuedDate || '—',
        status: (issued?.distributionStatus as any) || 'pending',
        receivedBy: issued?.receivedBy,
        receiverRelation: issued?.receiverRelation,
        distributedAt: issued?.distributedAt,
        remarks: issued?.remarks,
      };
    });
  }, [rosterItems, issuedTestimonials, activeExam]);

  // Readiness Metrics
  const previewReadyCount = useMemo(() => {
    return rosterItems.filter(r => !r.activeMissing || r.activeMissing.length === 0).length;
  }, [rosterItems]);

  const previewMissingCount = useMemo(() => {
    return rosterItems.filter(r => r.activeMissing && r.activeMissing.length > 0).length;
  }, [rosterItems]);

  // Filtered Preview Student List for Sidebar
  const filteredPreviewStudents = useMemo(() => {
    return rosterItems.filter(item => {
      if (previewFilter === 'ready' && item.activeMissing && item.activeMissing.length > 0) return false;
      if (previewFilter === 'missing' && (!item.activeMissing || item.activeMissing.length === 0)) return false;

      if (previewSearchTerm.trim()) {
        const q = previewSearchTerm.toLowerCase().trim();
        const matchesName = (item.name || '').toLowerCase().includes(q) || (item.nameBn || '').includes(q);
        const matchesRoll = (item.boardRollNo || '').includes(q);
        const matchesReg = (item.registrationNo || '').includes(q);
        const matchesGroup = (item.group || '').toLowerCase().includes(q);
        if (!matchesName && !matchesRoll && !matchesReg && !matchesGroup) return false;
      }

      return true;
    });
  }, [rosterItems, previewSearchTerm, previewFilter]);

  // 3. Handlers for Exam & Roster
  const handleCreateNewExam = (newExam: TestimonialExam) => {
    setExams(prev => [newExam, ...prev]);
    setActiveExamId(newExam.id);
    toast.success(`"${newExam.displayNameBn}" তৈরি সম্পন্ন হয়েছে!`);
  };

  const handleLoadDemoFixtures = () => {
    setExams([DEMO_TESTIMONIAL_EXAM]);
    setActiveExamId(DEMO_TESTIMONIAL_EXAM.id);
    bulkAddExamResults(DEMO_EXAM_RESULTS);
    toast.success('ডেমো ফিক্সচার সফলভাবে লোড করা হয়েছে (টেস্টিং মোড)');
  };

  const handleImportStudents = (selectedStudents: Student[]) => {
    if (!activeExam) return;

    const newExamResults: ExamResult[] = selectedStudents.map((s, idx) => {
      const upazila = s.upazila || institution?.upazila || '';
      const district = s.district || institution?.district || '';
      return {
        id: `er_${activeExam.id}_${s.studentId}_${Date.now()}_${idx}`,
        studentId: s.studentId,
        studentDbId: s.id,
        examId: activeExam.id,
        examName: activeExam.displayName,
        examNameBn: activeExam.displayNameBn,
        examType: activeExam.examType,
        passingYear: activeExam.year,
        session: s.session || activeExam.session || '',
        group: s.group || '',
        boardRollNo: s.roll ? String(s.roll) : '',
        registrationNo: s.registrationNo || '',
        gpa: (s as any).gpa || '',
        board: activeExam.board || institution?.board || '',
        boardBn: activeExam.boardBn || (institution?.board ? getBengaliBoard(institution.board) : ''),
        examCenter: activeExam.examCenter || '',
        examCenterBn: activeExam.examCenterBn || '',
        name: s.name,
        nameBn: s.nameBn,
        fatherName: s.fatherName,
        fatherNameBn: s.fatherNameBn,
        motherName: s.motherName,
        motherNameBn: s.motherNameBn,
        dateOfBirth: s.dateOfBirth,
        gender: s.gender,
        village: s.village,
        villageBn: s.villageBn,
        postOffice: s.postOffice,
        postOfficeBn: s.postOfficeBn,
        upazila,
        upazilaBn: s.upazilaBn || institution?.upazilaBn,
        district,
        districtBn: s.districtBn || institution?.districtBn,
      };
    });

    bulkAddExamResults(newExamResults);
    toast.success(`${selectedStudents.length} জন শিক্ষার্থী রোস্টারে যুক্ত করা হয়েছে`);
  };

  // Exact-scoped deletion with pre-delete snapshot & Undo
  const handleRemoveStudentsFromExam = (studentIds: string[]) => {
    if (!activeExam) return;

    const targetedResults = examResults.filter(
      er => er.examId === activeExam.id && studentIds.includes(er.studentId)
    );

    if (targetedResults.length === 0) {
      toast.error('মুছে ফেলার মতো কোনো রেকর্ড পাওয়া যায়নি');
      return;
    }

    setDeletedSnapshot({ examId: activeExam.id, results: targetedResults });
    const idsToDelete = targetedResults.map(er => er.id);
    bulkDeleteExamResults(idsToDelete);
    setSelectedStudentIds(new Set());

    toast(
      (t) => (
        <div className="flex items-center justify-between gap-3 text-xs">
          <span>{targetedResults.length} জন শিক্ষার্থীকে পরীক্ষা থেকে সরানো হয়েছে।</span>
          <button
            onClick={() => {
              bulkAddExamResults(targetedResults);
              setDeletedSnapshot(null);
              toast.dismiss(t.id);
              toast.success('সফলভাবে পূর্বাবস্থায় ফেরত আনা হয়েছে (Undo)');
            }}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg cursor-pointer"
          >
            আনডু (Undo)
          </button>
        </div>
      ),
      { duration: 8000 }
    );
  };

  // Atomic bulk edit commit using immutable studentDbId
  const handleSaveBulkChanges = async (updatedItems: TestimonialRosterItem[]) => {
    try {
      const studentMap = new Map(students.map(s => [s.studentId, s]));

      const transactions = updatedItems.map(item => {
        const student = studentMap.get(item.studentId);
        const resolvedStudentDbId = item.studentDbId || student?.id || '';
        return {
          item,
          studentDbId: resolvedStudentDbId,
          examResultId: item.id,
        };
      });

      const result = await saveTestimonialRosterChangesAtomic({
        transactions,
        updateExamResult,
        updateStudent,
      });

      if (result.failedRecords.length === 0) {
        toast.success(`${result.successfulIds.length} জন শিক্ষার্থীর তথ্য সফলভাবে সংরক্ষিত হয়েছে!`);
      } else {
        toast.error(
          `${result.failedRecords.length} জনের তথ্য সংরক্ষণ ব্যর্থ হয়েছে। সফল: ${result.successfulIds.length} জন। অনুগ্রহ করে তথ্য পরীক্ষা করে পুনরায় চেষ্টা করুন।`,
          { duration: 7000 }
        );
      }
    } catch (err: any) {
      console.error('Error in atomic bulk update:', err);
      toast.error(`পরিবর্তন সংরক্ষণে ত্রুটি: ${err.message || 'অপ্রত্যাশিত সমস্যা'}`);
    }
  };

  // 4. Testimonial Issuance & Distribution Handlers
  const registerOrUpdateIssuedTestimonial = async (item: TestimonialRosterItem, serial: string, customDate?: string) => {
    if (!activeExam) return;

    const readiness = validateOfficialTestimonialReadiness(item, institution, currentSettings.language || 'bn');
    if (!readiness.isReady) {
      toast.error(`ইস্যু করা সম্ভব নয়! অসম্পূর্ণ তথ্য: ${readiness.missingFieldLabelsBn.join(', ')}`);
      return;
    }

    const studentMap = new Map(students.map(s => [s.studentId, s]));
    const student = studentMap.get(item.studentId);
    const resolvedStudentDbId = item.studentDbId || student?.id || item.studentId;

    const issuedEntity = await createIssuedTestimonialEntity(
      item,
      activeExam,
      institution,
      currentSettings.language || 'bn',
      serial,
      resolvedStudentDbId
    );

    if (customDate) {
      issuedEntity.issueDate = customDate;
    }

    const existing = issuedTestimonials.find(
      it => it.studentId === item.studentId && it.examId === activeExam.id
    );

    if (existing) {
      updateIssuedTestimonial(existing.id, {
        serialNo: serial,
        issueDate: issuedEntity.issueDate,
        language: currentSettings.language || 'bn',
        verificationToken: issuedEntity.verificationToken,
        verificationUrl: issuedEntity.verificationUrl,
        snapshotHash: issuedEntity.snapshotHash,
        history: [
          ...(existing.history || []),
          {
            action: 'reissued',
            timestamp: new Date().toISOString(),
            actor: 'Admin',
            details: `Re-issued with Serial: ${serial}`,
          }
        ]
      });
      toast.success(`প্রশংসাপত্র সফলভাবে পুনরায় ইস্যু করা হয়েছে (ক্রমিক: ${serial})`);
    } else {
      addIssuedTestimonial(issuedEntity);
      toast.success(`প্রশংসাপত্র সফলভাবে ইস্যু করা হয়েছে (ক্রমিক: ${serial})`);
    }
  };

  const handleOpenExplicitIssueModal = (item: TestimonialRosterItem) => {
    const defaultSerial = item.issuedSerialNo || `${activeExam?.year || '2026'}/${item.boardRollNo || (rosterItems.indexOf(item) + 1).toString().padStart(2, '0')}`;
    const defaultDate = item.issuedDate || new Date().toLocaleDateString('en-GB');

    setIssueConfirmModal({
      isOpen: true,
      item,
      serialNo: defaultSerial,
      issueDate: defaultDate,
    });
  };

  const handleConfirmExplicitIssue = () => {
    if (!issueConfirmModal.item || !issueConfirmModal.serialNo.trim()) {
      toast.error('ক্রমিক নম্বর আবশ্যক');
      return;
    }

    registerOrUpdateIssuedTestimonial(
      issueConfirmModal.item,
      issueConfirmModal.serialNo.trim(),
      issueConfirmModal.issueDate.trim()
    );

    setIssueConfirmModal({ isOpen: false, item: null, serialNo: '', issueDate: '' });
  };

  const handleMarkDistributed = (
    entryIds: string[], 
    data: { receivedBy: string; receiverRelation: string; distributedAt: string; remarks?: string }
  ) => {
    entryIds.forEach(id => {
      updateIssuedTestimonial(id, {
        distributionStatus: 'distributed',
        distributedAt: data.distributedAt,
        receivedBy: data.receivedBy,
        receiverRelation: data.receiverRelation,
        remarks: data.remarks,
      });
    });
    toast.success(`${entryIds.length} জনের প্রশংসাপত্র বিতরণ সম্পন্ন হিসেবে চিহ্নিত হয়েছে!`);
  };

  // 5. PDF Generation & Direct Print Engine
  const generateSinglePdf = async (item: TestimonialRosterItem) => {
    if (!activeExam) return;

    try {
      setIsGeneratingPdf(true);
      toast.loading('পিডিএফ প্রস্তুত হচ্ছে...', { id: 'pdf-toast' });

      await downloadSingleTestimonialPdf(
        item,
        institution,
        currentSettings,
        staff,
        activeExam,
        {
          onStudentIssued: async (issuedItem, serial) => {
            await registerOrUpdateIssuedTestimonial(issuedItem, serial);
          }
        }
      );

      toast.success('পিডিএফ সফলভাবে প্রস্তুত ও ডাউনলোড হয়েছে!', { id: 'pdf-toast' });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'পিডিএফ তৈরিতে সমস্যা হয়েছে! আবার চেষ্টা করুন।', { id: 'pdf-toast', duration: 5000 });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const generateBulkPdf = async (items: TestimonialRosterItem[]) => {
    if (items.length === 0 || !activeExam) return;

    try {
      setIsGeneratingPdf(true);
      setPdfProgress({ current: 1, total: items.length });
      toast.loading(`বাল্ক পিডিএফ প্রস্তুত হচ্ছে (১/${items.length})...`, { id: 'pdf-toast' });

      await downloadBulkTestimonialsPdf(
        items,
        institution,
        currentSettings,
        staff,
        activeExam,
        {
          onProgress: (cur, tot) => {
            setPdfProgress({ current: cur, total: tot });
            toast.loading(`বাল্ক পিডিএফ প্রস্তুত হচ্ছে (${cur}/${tot})...`, { id: 'pdf-toast' });
          },
          onStudentIssued: async (issuedItem, serial) => {
            await registerOrUpdateIssuedTestimonial(issuedItem, serial);
          }
        }
      );

      toast.success(`${items.length} জন শিক্ষার্থীর পিডিএফ সফলভাবে প্রস্তুত ও ডাউনলোড হয়েছে!`, { id: 'pdf-toast' });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'বাল্ক পিডিএফ তৈরিতে সমস্যা হয়েছে! আবার চেষ্টা করুন।', { id: 'pdf-toast', duration: 6000 });
    } finally {
      setIsGeneratingPdf(false);
      setPdfProgress(null);
    }
  };

  const handleDirectPrint = async (items: TestimonialRosterItem[]) => {
    if (items.length === 0 || !activeExam) return;
    try {
      toast.loading('প্রিন্ট প্রস্তুত হচ্ছে...', { id: 'print-toast' });
      await triggerDirectPrint(
        items,
        institution,
        currentSettings,
        staff,
        activeExam
      );
      toast.success('প্রিন্ট ডায়ালগ চালু হয়েছে!', { id: 'print-toast' });
    } catch (err) {
      console.error(err);
      toast.error('প্রিন্ট চালু করতে সমস্যা হয়েছে!', { id: 'print-toast' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Back & Exam Selector */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHub}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>প্রত্যয়ন হাবে ফিরুন</span>
            </button>

            <span className="text-slate-300">|</span>

            {/* Active Exam Dropdown */}
            {activeExam ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <select
                      value={activeExamId}
                      onChange={(e) => {
                        setActiveExamId(e.target.value);
                        setSelectedStudentIds(new Set());
                      }}
                      className="bg-transparent font-black text-slate-900 text-sm focus:outline-hidden cursor-pointer hover:text-emerald-700 transition-colors"
                    >
                      {exams.map(ex => (
                        <option key={ex.id} value={ex.id}>
                          {ex.displayNameBn} ({toBengaliNumber(ex.year)})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">
                    {activeExam.board || 'বোর্ড অনুল্লিখিত'} বোর্ড • কেন্দ্র: {activeExam.examCenter || 'অনুল্লিখিত'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-800 font-bold flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>কোনো পরীক্ষা সক্রিয় নেই</span>
              </div>
            )}
          </div>

          {/* New Exam Button, Fixture Loader & Settings */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateExamOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন পরীক্ষা তৈরি</span>
            </button>

            {exams.length === 0 && (
              <button
                type="button"
                onClick={handleLoadDemoFixtures}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>ডেমো ফিক্সচার লোড (টেস্টিং)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>লেআউট সেটিংস</span>
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        {activeExam && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'roster'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>পরীক্ষা ও রোস্টার ({toBengaliNumber(rosterItems.length)})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'preview'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>লাইভ প্রিভিউ ও প্রিন্ট</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('distribution')}
              className={`flex items-center gap-2 py-2.5 px-3 border-b-2 text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'distribution'
                  ? 'border-emerald-700 text-emerald-800'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>বিতরণ রেজিস্টার ({toBengaliNumber(distributionEntries.length)})</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {/* EMPTY EXAM STATE */}
        {!activeExam ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">কোনো প্রশংসাপত্র পরীক্ষা তৈরি করা হয়নি</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              বোর্ড প্রশংসাপত্র তৈরি, প্রিভিউ, ভেরিফিকেশন ও বিতরণের জন্য একটি অফিসিয়াল পরীক্ষা (যেমন: এসএসসি বা এইচএসসি) তৈরি করুন অথবা টেস্ট ডেটা দিয়ে যাচাই করতে ডেমো ফিক্সচার লোড করুন।
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsCreateExamOpen(true)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                নতুন পরীক্ষা তৈরি করুন
              </button>
              <button
                onClick={handleLoadDemoFixtures}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                টেস্টিং ডেমো ফিক্সচার লোড করুন
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* TAB 1: ROSTER VIEW */}
            {activeTab === 'roster' && (
              <div className="space-y-4">
                <RosterTableView
                  rosterItems={rosterItems}
                  activeExam={activeExam}
                  selectedStudentIds={selectedStudentIds}
                  onToggleSelectStudent={(studentId) => {
                    const updated = new Set(selectedStudentIds);
                    if (updated.has(studentId)) updated.delete(studentId);
                    else updated.add(studentId);
                    setSelectedStudentIds(updated);
                  }}
                  onSelectAllStudents={() => {
                    if (selectedStudentIds.size === rosterItems.length) {
                      setSelectedStudentIds(new Set());
                    } else {
                      setSelectedStudentIds(new Set(rosterItems.map(r => r.studentId)));
                    }
                  }}
                  onPreviewStudent={(studentId) => {
                    setActiveStudentId(studentId);
                    setActiveTab('preview');
                  }}
                  onEditStudent={(studentId) => {
                    setActiveStudentId(studentId);
                    setIsBulkEditorOpen(true);
                  }}
                  onRemoveStudentFromExam={handleRemoveStudentsFromExam}
                  onOpenBulkEditor={() => setIsBulkEditorOpen(true)}
                  onOpenStudentImport={() => setIsImportOpen(true)}
                />
              </div>
            )}

            {/* TAB 2: LIVE PREVIEW & PRINT VIEW WITH LEFT STUDENT SELECTOR SIDEBAR */}
            {activeTab === 'preview' && (
              <div className="flex flex-col lg:flex-row gap-5 items-start">
                {/* LEFT SIDEBAR: STUDENT LIST & SELECTION */}
                <div className="w-full lg:w-80 shrink-0 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col max-h-[calc(100vh-130px)] sticky top-18">
                  {/* Sidebar Header */}
                  <div className="p-3.5 border-b border-slate-200 bg-slate-50/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-700" />
                        <span className="text-xs font-black text-slate-800">শিক্ষার্থী তালিকা</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                          {toBengaliNumber(rosterItems.length)} জন
                        </span>
                      </div>

                      {/* Select All Checkbox Button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedStudentIds.size === rosterItems.length) {
                            setSelectedStudentIds(new Set());
                          } else {
                            setSelectedStudentIds(new Set(rosterItems.map(r => r.studentId)));
                          }
                        }}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
                      >
                        {selectedStudentIds.size === rosterItems.length && rosterItems.length > 0 ? (
                          <CheckSquare className="w-3.5 h-3.5 text-emerald-700" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-slate-400" />
                        )}
                        <span>{selectedStudentIds.size === rosterItems.length ? 'সবাই বাতিল' : 'সবাই নির্বাচন'}</span>
                      </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        value={previewSearchTerm}
                        onChange={(e) => setPreviewSearchTerm(e.target.value)}
                        placeholder="রোল, নাম বা বিভাগ খুঁজুন..."
                        className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 outline-hidden transition-all"
                      />
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-1 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setPreviewFilter('all')}
                        className={`flex-1 py-1 rounded-lg transition-colors text-center cursor-pointer ${
                          previewFilter === 'all'
                            ? 'bg-slate-800 text-white shadow-2xs'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        সব ({toBengaliNumber(rosterItems.length)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewFilter('ready')}
                        className={`flex-1 py-1 rounded-lg transition-colors text-center cursor-pointer ${
                          previewFilter === 'ready'
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        প্রস্তুত ({toBengaliNumber(previewReadyCount)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewFilter('missing')}
                        className={`flex-1 py-1 rounded-lg transition-colors text-center cursor-pointer ${
                          previewFilter === 'missing'
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
                        }`}
                      >
                        বাকি ({toBengaliNumber(previewMissingCount)})
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Student List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1.5 space-y-1">
                    {filteredPreviewStudents.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 font-medium">
                        কোনো শিক্ষার্থী পাওয়া যায়নি
                      </div>
                    ) : (
                      filteredPreviewStudents.map((item) => {
                        const isSelected = selectedStudentIds.has(item.studentId);
                        const isActive = activeStudentId === item.studentId;
                        const hasMissing = item.activeMissing && item.activeMissing.length > 0;

                        return (
                          <div
                            key={item.studentId}
                            onClick={() => setActiveStudentId(item.studentId)}
                            className={`group px-2 py-1.5 rounded-lg cursor-pointer transition-all border text-xs ${
                              isActive
                                ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300 font-medium'
                                : isSelected
                                ? 'bg-slate-50 border-slate-300'
                                : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {/* Selection Checkbox */}
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updated = new Set(selectedStudentIds);
                                  if (updated.has(item.studentId)) updated.delete(item.studentId);
                                  else updated.add(item.studentId);
                                  setSelectedStudentIds(updated);
                                }}
                                className="text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer shrink-0"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-emerald-700" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </div>

                              {/* Student Brief Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold text-slate-900 truncate">
                                    {item.nameBn || item.name}
                                  </span>
                                  <span className="font-mono text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                                    রোল: {toBengaliNumber(item.boardRollNo || '—')}
                                  </span>
                                </div>
                                <div className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center justify-between">
                                  <span>{item.group || 'বিভাগ নেই'}</span>
                                  {hasMissing ? (
                                    <span className="text-amber-700 font-bold flex items-center gap-0.5">
                                      <AlertTriangle className="w-2.5 h-2.5" />
                                      বাকি {toBengaliNumber(item.activeMissing?.length || 0)}
                                    </span>
                                  ) : (
                                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                      {item.isIssued ? 'ইস্যুকৃত' : 'প্রস্তুত'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Batch Selection Action Bar in Left Sidebar */}
                  {selectedStudentIds.size > 0 && (
                    <div className="p-2.5 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-emerald-900">
                        {toBengaliNumber(selectedStudentIds.size)} জন নির্বাচিত
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const selectedItems = rosterItems.filter(r => selectedStudentIds.has(r.studentId));
                          generateBulkPdf(selectedItems);
                        }}
                        disabled={isGeneratingPdf}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-[11px] rounded-lg shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>বাল্ক PDF</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* RIGHT PANEL: LIVE CERTIFICATE PREVIEW & CONTROL BAR */}
                <div className="flex-1 min-w-0 space-y-4">
                  {/* Top Bar for Live Preview */}
                  <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                    {/* Readiness & Language Toggle */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Language Toggle */}
                      <div className="flex items-center bg-slate-100 border border-slate-300 rounded-xl p-0.5 text-xs font-bold text-slate-700">
                        <button
                          type="button"
                          onClick={() => updateTestimonialSettings({ language: 'en' })}
                          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                            currentSettings.language !== 'bn' ? 'bg-emerald-700 text-white shadow-2xs' : 'hover:bg-slate-200'
                          }`}
                        >
                          English
                        </button>
                        <button
                          type="button"
                          onClick={() => updateTestimonialSettings({ language: 'bn' })}
                          className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                            currentSettings.language === 'bn' ? 'bg-emerald-700 text-white shadow-2xs' : 'hover:bg-slate-200'
                          }`}
                        >
                          বাংলা
                        </button>
                      </div>

                      {/* Readiness Badge & Field Correction Link */}
                      {currentActiveRosterItem && (
                        <div>
                          {currentActiveRosterItem.activeMissing && currentActiveRosterItem.activeMissing.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => setIsBulkEditorOpen(true)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors cursor-pointer"
                              title={`অনুপস্থিত: ${currentActiveRosterItem.activeMissing.join(', ')}`}
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              <span>{toBengaliNumber(currentActiveRosterItem.activeMissing.length)}টি তথ্য বাকি (ঠিক করুন)</span>
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>অফিসিয়াল তথ্য সম্পূর্ণ</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Controls: Official Issuance, PDF Download & Print */}
                    <div className="flex items-center gap-2">
                      {/* Mark as Officially Issued */}
                      <button
                        type="button"
                        disabled={!currentActiveRosterItem || (currentActiveRosterItem.activeMissing && currentActiveRosterItem.activeMissing.length > 0)}
                        onClick={() => currentActiveRosterItem && handleOpenExplicitIssueModal(currentActiveRosterItem)}
                        className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="অফিসিয়াল ইস্যু ও রেজিস্ট্রি এন্ট্রি"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-200" />
                        <span>{currentActiveRosterItem?.isIssued ? 'পুনরায় ইস্যু' : 'অফিসিয়াল ইস্যু'}</span>
                      </button>

                      {/* QR Verification Info */}
                      <button
                        type="button"
                        disabled={!currentActiveRosterItem}
                        onClick={() => setIsVerificationModalOpen(true)}
                        className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="ডিজিটাল ভেরিফিকেশন ও লিংক"
                      >
                        <Globe className="w-3.5 h-3.5 text-emerald-600" />
                        <span>QR ভেরিফিকেশন</span>
                      </button>

                      {/* PDF Download */}
                      <button
                        type="button"
                        disabled={!currentActiveRosterItem || isGeneratingPdf}
                        onClick={() => currentActiveRosterItem && generateSinglePdf(currentActiveRosterItem)}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF ডাউনলোড</span>
                      </button>

                      {/* Print Button */}
                      <button
                        type="button"
                        disabled={!currentActiveRosterItem}
                        onClick={() => currentActiveRosterItem && handleDirectPrint([currentActiveRosterItem])}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        <span>প্রিন্ট করুন</span>
                      </button>
                    </div>
                  </div>

                  {/* Progress Notification */}
                  {pdfProgress && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                        <span>মাল্টি-পেজ পিডিএফ তৈরি হচ্ছে: পেজ {pdfProgress.current} / {pdfProgress.total}</span>
                      </div>
                      <div className="font-bold">
                        {Math.round((pdfProgress.current / pdfProgress.total) * 100)}%
                      </div>
                    </div>
                  )}

                  {/* Live Certificate Preview Canvas (Shrink-to-Fit, Auto Scaling, No Overflow) */}
                  <div 
                    ref={previewContainerRef}
                    className="w-full flex justify-center items-start overflow-hidden bg-slate-200/50 p-4 rounded-2xl border border-slate-200 min-h-[500px]"
                  >
                    <div 
                      className="transform origin-top transition-transform duration-150"
                      style={{
                        transform: `scale(${previewScale})`,
                        transformOrigin: 'top center',
                        width: '1123px',
                        height: '794px',
                        marginBottom: `${-(794 * (1 - previewScale))}px`,
                      }}
                    >
                      {currentActiveRosterItem ? (
                        <BoardTestimonialRenderer
                          item={currentActiveRosterItem}
                          institution={institution}
                          settings={currentSettings}
                          staffList={staff}
                          serialNo={currentActiveRosterItem.issuedSerialNo || `${activeExam.year}/${rosterItems.indexOf(currentActiveRosterItem) + 1}`}
                          issueDate={currentActiveRosterItem.issuedDate || new Date().toLocaleDateString('en-GB')}
                          verificationToken={currentActiveRosterItem.verificationToken || generateCanonicalVerificationToken(currentActiveRosterItem.studentId, activeExam.year)}
                        />
                      ) : (
                        <div className="w-[1123px] h-[794px] bg-white border border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-3">
                          <FileText className="w-12 h-12 text-slate-300" />
                          <p className="text-sm font-semibold">প্রিভিউ দেখার জন্য কোনো শিক্ষার্থী পাওয়া যায়নি</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: DISTRIBUTION REGISTER VIEW */}
            {activeTab === 'distribution' && (
              <DistributionRegisterView
                activeExam={activeExam}
                entries={distributionEntries}
                institution={institution}
                onMarkDistributed={handleMarkDistributed}
                onRedownloadTestimonial={(entry) => {
                  const item = rosterItems.find(r => r.studentId === entry.studentId);
                  if (item) {
                    setActiveStudentId(item.studentId);
                    setActiveTab('preview');
                    setTimeout(() => generateSinglePdf(item), 300);
                  }
                }}
              />
            )}
          </>
        )}
      </main>

      {/* EXPLICIT ISSUE CONFIRMATION MODAL */}
      {issueConfirmModal.isOpen && issueConfirmModal.item && activeExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">অফিসিয়াল প্রশংসাপত্র ইস্যু</h3>
                <p className="text-xs text-slate-500">
                  {issueConfirmModal.item.nameBn || issueConfirmModal.item.name} (রোল: {issueConfirmModal.item.boardRollNo})
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  প্রশংসাপত্র ক্রমিক নম্বর (Serial No) *
                </label>
                <input
                  type="text"
                  value={issueConfirmModal.serialNo}
                  onChange={(e) => setIssueConfirmModal(prev => ({ ...prev, serialNo: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-hidden"
                  placeholder="e.g. 2026/01"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ইস্যুর তারিখ (Issue Date) *
                </label>
                <input
                  type="text"
                  value={issueConfirmModal.issueDate}
                  onChange={(e) => setIssueConfirmModal(prev => ({ ...prev, issueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-hidden"
                  placeholder="DD/MM/YYYY"
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                ইস্যু নিশ্চিত করলে এই শিক্ষার্থীর জন্য একটি অকাট্য ভেরিফিকেশন টোকেন ও বিতরণ রেজিস্ট্রি রেকর্ড সংরক্ষিত হবে।
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIssueConfirmModal({ isOpen: false, item: null, serialNo: '', issueDate: '' })}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                বাতিল
              </button>
              <button
                type="button"
                onClick={handleConfirmExplicitIssue}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer"
              >
                ইস্যু নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <ExamCreateModal
        isOpen={isCreateExamOpen}
        onClose={() => setIsCreateExamOpen(false)}
        onSave={handleCreateNewExam}
        existingExams={exams}
        institution={institution}
        onSelectExisting={(examId) => setActiveExamId(examId)}
      />

      {activeExam && (
        <>
          <StudentImportModal
            isOpen={isImportOpen}
            onClose={() => setIsImportOpen(false)}
            activeExam={activeExam}
            allStudents={students}
            classes={classes}
            sections={sections}
            groups={groups}
            existingRosterItems={rosterItems}
            onImportStudents={handleImportStudents}
          />

          <BulkEditorModal
            isOpen={isBulkEditorOpen}
            onClose={() => setIsBulkEditorOpen(false)}
            activeExam={activeExam}
            rosterItems={rosterItems}
            onSaveBulkChanges={handleSaveBulkChanges}
          />

          <TestimonialLayoutSettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setIsSettingsModalOpen(false)}
            settings={currentSettings}
            onUpdateSettings={updateTestimonialSettings}
            staffList={staff}
            institution={institution}
          />

          {currentActiveRosterItem && (
            <TestimonialQrVerificationModal
              isOpen={isVerificationModalOpen}
              onClose={() => setIsVerificationModalOpen(false)}
              item={currentActiveRosterItem}
              exam={activeExam}
              institution={institution}
              serialNo={currentActiveRosterItem.issuedSerialNo || `${activeExam.year}/${rosterItems.indexOf(currentActiveRosterItem) + 1}`}
              issueDate={currentActiveRosterItem.issuedDate || new Date().toLocaleDateString('en-GB')}
              verificationToken={currentActiveRosterItem.verificationToken || generateCanonicalVerificationToken(currentActiveRosterItem.studentId, activeExam.year)}
            />
          )}
        </>
      )}
    </div>
  );
};
