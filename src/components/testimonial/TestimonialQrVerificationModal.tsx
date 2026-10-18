import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, Copy, ExternalLink, QrCode } from 'lucide-react';
import { TestimonialRosterItem, TestimonialExam } from '../../types/testimonial';
import { Institution } from '../../types';
import { toBengaliNumber } from '../../utils/bengaliUtils';
import { buildCanonicalVerificationUrl, generateCanonicalVerificationToken } from '../../services/testimonialService';
import toast from 'react-hot-toast';

interface TestimonialQrVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: TestimonialRosterItem;
  exam: TestimonialExam;
  institution?: Institution | null;
  serialNo?: string;
  issueDate?: string;
  verificationToken?: string;
}

export const TestimonialQrVerificationModal: React.FC<TestimonialQrVerificationModalProps> = ({
  isOpen,
  onClose,
  item,
  exam,
  institution,
  serialNo,
  issueDate,
  verificationToken,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const token = verificationToken || item.verificationToken || generateCanonicalVerificationToken(item.studentId, exam.year);
  const verifyUrl = buildCanonicalVerificationUrl(token, institution?.website);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    toast.success('ভেরিফিকেশন লিংক কপি হয়েছে');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenVerifier = () => {
    window.open(verifyUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
        {/* Verification Banner */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 text-center relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ShieldCheck className="w-9 h-9 text-emerald-200" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/30 border border-emerald-300/40 text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            অফিসিয়াল ডিজিটাল ভেরিফিকেশন লিংক
          </span>

          <h3 className="text-lg font-black text-white">
            {institution?.name || 'শিক্ষা প্রতিষ্ঠান'}
          </h3>
          <p className="text-emerald-200 text-xs mt-0.5">
            EIIN: {institution?.eiin || '—'} {institution?.upazila ? `• ${institution.upazila}, ${institution.district}` : ''}
          </p>
        </div>

        {/* Certificate Details Card */}
        <div className="p-6 space-y-4 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-bold uppercase tracking-wider">প্রশংসাপত্র ক্রমিক</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {serialNo || item.issuedSerialNo || '—'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">শিক্ষার্থীর নাম (বাংলা):</span>
              <span className="font-bold text-slate-900 text-sm">
                {item.nameBn || item.name}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">Name (English):</span>
              <span className="font-bold text-slate-900 uppercase">
                {item.name || '—'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">পরীক্ষা ও সাল:</span>
              <span className="font-bold text-emerald-800">
                {exam.displayNameBn} ({toBengaliNumber(exam.year)})
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">বোর্ড রোল ও রেজি:</span>
              <span className="font-mono font-bold text-slate-900">
                রোল: {item.boardRollNo || '—'} | রেজি: {item.registrationNo || '—'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">ভেরিফিকেশন টোকেন:</span>
              <span className="font-mono font-bold text-emerald-700 select-all">
                {token}
              </span>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-slate-200">
              <span className="text-slate-500 font-semibold">ইস্যুর তারিখ:</span>
              <span className="font-semibold text-slate-700">
                {issueDate || item.issuedDate || new Date().toLocaleDateString('en-GB')}
              </span>
            </div>
          </div>

          {/* Verification URL Box */}
          <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                পাবলিক ভেরিফিকেশন ইউআরএল
              </span>
            </div>
            <p className="font-mono text-[11px] text-slate-600 break-all select-all bg-white p-2 rounded-lg border border-slate-200">
              {verifyUrl}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-1.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'কপি হয়েছে!' : 'লিংক কপি করুন'}</span>
              </button>
              <button
                type="button"
                onClick={handleOpenVerifier}
                className="flex-1 py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>পোর্টাল খুলুন</span>
              </button>
            </div>
          </div>

          <div className="text-center text-slate-500 text-[11px] leading-relaxed">
            এই প্রশংসাপত্রটি কেন্দ্রীয় বিদ্যালয় ম্যানেজমেন্ট সিস্টেম (বিদ্যালোক) কর্তৃক ডিজিটালভাবে সংরক্ষিত এবং QR কোড স্ক্যান করে যে কেউ তাৎক্ষণিকভাবে সত্যতা যাচাই করতে পারবেন।
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
};
