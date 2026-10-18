import React, { useState, useMemo, useEffect } from 'react';
import { X, FileDown, Printer, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, Sliders } from 'lucide-react';
import { ScholarshipRecord, Student, Institution } from '../../../types';
import { toBengaliNumber } from '../../../utils/bengaliUtils';
import { RevenueScholarshipRegisterDocument } from './RevenueScholarshipRegisterDocument';
import { downloadRevenueScholarshipRegisterPdf } from '../utils/revenueScholarshipPdfExporter';
import {
  ScholarshipFormSettings,
  getSavedScholarshipSettings,
} from '../types/scholarshipSettings';
import { ScholarshipLogoSettingsModal } from './ScholarshipLogoSettingsModal';
import { toast } from 'react-hot-toast';

interface RevenueScholarshipRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: ScholarshipRecord[];
  students: Student[];
  institution: Institution;
  financialYear?: string;
  headmasterSignatureUrl?: string;
}

export const RevenueScholarshipRegisterModal: React.FC<RevenueScholarshipRegisterModalProps> = ({
  isOpen,
  onClose,
  records,
  students,
  institution,
  financialYear,
  headmasterSignatureUrl,
}) => {
  const [zoom, setZoom] = useState<number>(0.85);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progressText, setProgressText] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settings, setSettings] = useState<ScholarshipFormSettings>(getSavedScholarshipSettings());

  useEffect(() => {
    const handleSettingsUpdated = (e: any) => {
      if (e.detail) {
        setSettings(e.detail);
      }
    };
    window.addEventListener('biddalok-scholarship-settings-updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('biddalok-scholarship-settings-updated', handleSettingsUpdated);
    };
  }, []);

  const ROWS_PER_PAGE = 6;
  const pages = useMemo(() => {
    const list: ScholarshipRecord[][] = [];
    for (let i = 0; i < records.length; i += ROWS_PER_PAGE) {
      list.push(records.slice(i, i + ROWS_PER_PAGE));
    }
    return list.length > 0 ? list : [[]];
  }, [records]);

  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  if (!isOpen) return null;

  const handleDownloadPdf = async () => {
    if (records.length === 0) {
      toast.error('ডাউনলোড করার মতো কোনো তথ্য নেই');
      return;
    }

    try {
      setIsExporting(true);
      setProgressText('রেজিস্টার পিডিএফ প্রস্তুত হচ্ছে...');
      toast.loading('রেজিস্টার পিডিএফ প্রস্তুত হচ্ছে...', { id: 'reg-pdf-toast' });

      await downloadRevenueScholarshipRegisterPdf(records, students, institution, {
        financialYear,
        headmasterSignatureUrl,
        customSettings: settings,
        onProgress: (cur, total) => {
          setProgressText(`পাতা ${cur} এর ${total} রেন্ডার হচ্ছে...`);
        },
      });

      toast.success('রেজিস্টার পিডিএফ সফলভাবে ডাউনলোড হয়েছে', { id: 'reg-pdf-toast' });
    } catch (err: any) {
      toast.error(err.message || 'পিডিএফ ডাউনলোডে ত্রুটি ঘটেছে', { id: 'reg-pdf-toast' });
    } finally {
      setIsExporting(false);
      setProgressText('');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-2 sm:p-4 overflow-hidden print:static print:p-0 print:bg-transparent print:z-auto print:overflow-visible">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-[1240px] h-[94vh] flex flex-col shadow-2xl overflow-hidden print:bg-transparent print:border-none print:shadow-none print:w-auto print:max-w-none print:h-auto print:overflow-visible">
        {/* Top Modal Header & Action Bar (Hidden on print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-800/95 border-b border-slate-700 shrink-0 text-white print:hidden">
          <div className="flex items-center gap-3">
            <span className="font-bold text-sm tracking-wide flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              রাজস্ব বৃত্তি রেজিস্টার প্রিভিউ (A4 ল্যান্ডস্কেপ)
            </span>
            <span className="text-xs bg-slate-700/80 text-slate-300 px-2.5 py-0.5 rounded-full font-mono">
              মোট: {toBengaliNumber(records.length)} জন | {toBengaliNumber(pages.length)} পৃষ্ঠা
            </span>
          </div>

          {/* Controls: Zoom & Page navigation */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-700/60 rounded-lg p-0.5 text-xs text-slate-200">
              <button
                type="button"
                onClick={() => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(2)))}
                className="p-1 hover:bg-slate-600 rounded transition-colors"
                title="জুম আউট"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 font-mono text-[11px]">{toBengaliNumber(Math.round(zoom * 100))}%</span>
              <button
                type="button"
                onClick={() => setZoom(z => Math.min(1.4, +(z + 0.1).toFixed(2)))}
                className="p-1 hover:bg-slate-600 rounded transition-colors"
                title="জুম ইন"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {pages.length > 1 && (
              <div className="flex items-center bg-slate-700/60 rounded-lg p-0.5 text-xs text-slate-200">
                <button
                  type="button"
                  disabled={currentPageIndex === 0}
                  onClick={() => setCurrentPageIndex(p => Math.max(0, p - 1))}
                  className="p-1 hover:bg-slate-600 rounded disabled:opacity-30 transition-colors"
                  title="পূর্ববর্তী পাতা"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-mono text-[11px]">
                  {toBengaliNumber(currentPageIndex + 1)} / {toBengaliNumber(pages.length)}
                </span>
                <button
                  type="button"
                  disabled={currentPageIndex === pages.length - 1}
                  onClick={() => setCurrentPageIndex(p => Math.min(pages.length - 1, p + 1))}
                  className="p-1 hover:bg-slate-600 rounded disabled:opacity-30 transition-colors"
                  title="পরবর্তী পাতা"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Logo Settings button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 hover:text-amber-400 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="লোগো ও শিরোনাম সেটিংস"
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>লোগো সেটিংস</span>
            </button>

            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{progressText || 'ডাউনলোড হচ্ছে...'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>রেজিস্টার পিডিএফ ডাউনলোড</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/80 rounded-lg transition-colors cursor-pointer ml-1"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Document Preview */}
        <div className="flex-1 overflow-auto p-4 flex flex-col items-center bg-slate-950/60 custom-scrollbar">
          {/* For on-screen display with zoom */}
          <div
            className="transition-transform duration-100 origin-top shadow-2xl rounded-sm"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
              marginBottom: `${(zoom - 1) * 794 + 30}px`,
            }}
          >
            <RevenueScholarshipRegisterDocument
              records={pages[currentPageIndex]}
              allRecordsCount={records.length}
              startIndex={currentPageIndex * ROWS_PER_PAGE}
              students={students}
              institution={institution}
              pageIndex={currentPageIndex}
              totalPages={pages.length}
              financialYear={financialYear}
              headmasterSignatureUrl={headmasterSignatureUrl}
              settings={settings}
              onOpenLogoSettings={() => setIsSettingsOpen(true)}
            />
          </div>

          {/* Hidden multi-page container for native window.print() */}
          <div className="hidden print:block w-full">
            {pages.map((pageRecords, pIdx) => (
              <div
                key={pIdx}
                className="print-sheet mb-4"
                style={{ pageBreakAfter: pIdx < pages.length - 1 ? 'always' : 'auto' }}
              >
                <RevenueScholarshipRegisterDocument
                  records={pageRecords}
                  allRecordsCount={records.length}
                  startIndex={pIdx * ROWS_PER_PAGE}
                  students={students}
                  institution={institution}
                  pageIndex={pIdx}
                  totalPages={pages.length}
                  financialYear={financialYear}
                  headmasterSignatureUrl={headmasterSignatureUrl}
                  settings={settings}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Logo Settings Modal */}
      <ScholarshipLogoSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentSettings={settings}
        institution={institution}
        onSave={(updated) => setSettings(updated)}
      />

      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};
