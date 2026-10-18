import React, { useState } from 'react';
import { X, Plus, BookOpen, AlertCircle } from 'lucide-react';
import { 
  DEFAULT_EXAM_TYPES, 
  BANGLADESH_EDUCATION_BOARDS, 
  TestimonialExam 
} from '../../types/testimonial';
import { Institution } from '../../types';

interface ExamCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exam: TestimonialExam) => void;
  existingExams: TestimonialExam[];
  institution?: Institution | null;
  onSelectExisting?: (examId: string) => void;
}

export const ExamCreateModal: React.FC<ExamCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingExams,
  institution,
  onSelectExisting,
}) => {
  const currentYear = new Date().getFullYear().toString();
  const [examType, setExamType] = useState('SSC');
  const [year, setYear] = useState(currentYear);
  const [board, setBoard] = useState(institution?.board || 'Cumilla');
  const [examCenter, setExamCenter] = useState(institution?.upazila ? `${institution.upazila}-1` : 'Nangalkot-1');
  const [customNameBn, setCustomNameBn] = useState('');
  const [customNameEn, setCustomNameEn] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Find selected exam metadata
  const selectedTypeObj = DEFAULT_EXAM_TYPES.find(t => t.id === examType) || DEFAULT_EXAM_TYPES[0];
  const selectedBoardObj = BANGLADESH_EDUCATION_BOARDS.find(b => b.id === board) || BANGLADESH_EDUCATION_BOARDS[0];

  // Auto-derived display names
  const derivedNameBn = customNameBn.trim() || `${selectedTypeObj.nameBn} ${year}`;
  const derivedNameEn = customNameEn.trim() || `${selectedTypeObj.name} ${year}`;

  // Composite uniqueness check: examType + year
  const duplicateExam = existingExams.find(
    e => e.examType.toLowerCase() === examType.toLowerCase() && e.year === year
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!year || year.length !== 4) {
      setErrorMsg('সঠিক ৪ ডিজিটের সাল লিখুন (যেমন: ২০২৬ বা 2026)');
      return;
    }

    if (duplicateExam) {
      setErrorMsg(`"${duplicateExam.displayNameBn}" ডেটাসেটটি ইতিমধ্যে তৈরি রয়েছে!`);
      return;
    }

    const newExam: TestimonialExam = {
      id: `exam_${examType.toLowerCase()}_${year}_${Date.now()}`,
      institutionId: institution?.eiin || 'inst_default',
      examType: selectedTypeObj.id,
      examTypeId: selectedTypeObj.id,
      year: year.trim(),
      board: selectedBoardObj.id,
      boardBn: selectedBoardObj.nameBn,
      displayName: derivedNameEn,
      displayNameBn: derivedNameBn,
      examCenter: examCenter.trim(),
      examCenterBn: examCenter.trim(),
      gradingScale: '5.00',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newExam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">নতুন পরীক্ষা ডেটাসেট তৈরি করুন</h3>
              <p className="text-emerald-100 text-xs mt-0.5">বোর্ড বা সমাপনী পরীক্ষার প্রশংসাপত্র রোস্টার</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {duplicateExam && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start justify-between gap-3 text-amber-900 text-xs">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">{duplicateExam.displayNameBn}</span> ইতিমধ্যে তৈরি করা আছে।
                </div>
              </div>
              {onSelectExisting && (
                <button
                  type="button"
                  onClick={() => {
                    onSelectExisting(duplicateExam.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md font-medium text-xs shrink-0"
                >
                  ওপেন করুন
                </button>
              )}
            </div>
          )}

          {errorMsg && !duplicateExam && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Exam Type & Year Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পরীক্ষার ধরন <span className="text-red-500">*</span>
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden"
              >
                {DEFAULT_EXAM_TYPES.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.nameBn} ({type.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পরীক্ষার সাল / বছর <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2026"
                maxLength={4}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden"
                required
              />
            </div>
          </div>

          {/* Board & Exam Center */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                শিক্ষা বোর্ড <span className="text-red-500">*</span>
              </label>
              <select
                value={board}
                onChange={(e) => setBoard(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden"
              >
                {BANGLADESH_EDUCATION_BOARDS.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nameBn} ({b.nameEn})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                পরীক্ষার কেন্দ্র (Roll prefix)
              </label>
              <input
                type="text"
                value={examCenter}
                onChange={(e) => setExamCenter(e.target.value)}
                placeholder="e.g. Nangalkot-1"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-hidden"
              />
            </div>
          </div>

          {/* Generated Display Names Preview */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              স্বয়ংক্রিয় প্রদর্শন নাম
            </span>
            <div className="text-xs text-slate-800 space-y-1">
              <div><span className="text-slate-500 font-medium">বাংলা:</span> <strong className="text-emerald-800">{derivedNameBn}</strong></div>
              <div><span className="text-slate-500 font-medium">English:</span> <strong className="text-emerald-800">{derivedNameEn}</strong></div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={!!duplicateExam}
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>তৈরি করুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
