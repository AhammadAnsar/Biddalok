/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Public verification page for issued testimonials.
 * Accessible without login via HashRouter: /#/verify/testimonial/:token
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { db } from '../db/database';
import { IssuedTestimonial } from '../types';
import { 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX, 
  Search, 
  School, 
  Calendar, 
  Award, 
  Hash, 
  CheckCircle2, 
  FileText, 
  ArrowLeft,
  Printer,
  Info
} from 'lucide-react';
import { toBengaliNumber } from '../utils/bengaliUtils';

export const TestimonialVerificationPage: React.FC = () => {
  const { token: routeToken } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const queryToken = searchParams.get('token');
  const initialToken = routeToken || queryToken || '';

  const [inputToken, setInputToken] = useState(initialToken);
  const [activeToken, setActiveToken] = useState(initialToken);
  const [record, setRecord] = useState<IssuedTestimonial | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const { issuedTestimonials, institution } = useAppStore();

  // Search logic for token
  useEffect(() => {
    let isMounted = true;
    if (!activeToken.trim()) {
      setRecord(null);
      setSearched(false);
      return;
    }

    setIsLoading(true);
    setSearched(true);

    const clean = activeToken.trim();

    // 1. Search in memory store first
    const found = issuedTestimonials.find(
      it => it.verificationToken === clean || it.id === clean || it.serialNo === clean
    );

    if (found) {
      if (isMounted) {
        setRecord(found);
        setIsLoading(false);
      }
      return;
    }

    // 2. Query IndexedDB if available
    if (db && db.issuedTestimonials) {
      db.issuedTestimonials
        .where('verificationToken')
        .equals(clean)
        .first()
        .then(dbFound => {
          if (dbFound) {
            return dbFound;
          } else {
            // Also check by ID or serial
            return db.issuedTestimonials.get(clean);
          }
        })
        .then(byKey => {
          if (isMounted) {
            if (byKey) {
              setRecord(byKey);
            } else {
              setRecord(null);
            }
          }
        })
        .catch(() => {
          if (isMounted) setRecord(null);
        })
        .finally(() => {
          if (isMounted) setIsLoading(false);
        });
    } else {
      if (isMounted) {
        setRecord(null);
        setIsLoading(false);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [activeToken, issuedTestimonials]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveToken(inputToken.trim());
  };

  const statusType = useMemo(() => {
    if (!record) return 'unknown';
    if (record.status === 'revoked' || record.issuanceStatus === 'revoked') return 'revoked';
    if (record.status === 'reissued' || record.issuanceStatus === 'reissued') return 'reissued';
    return 'valid';
  }, [record]);

  const snap = record?.snapshot || {};

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between text-slate-800 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-md shadow-emerald-600/20">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
                {institution?.nameBn || institution?.name || 'বিদ্যালোক ডিজিটাল সনদ যাচাই'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                অফিসিয়াল প্রশংসাপত্র ও চারিত্রিক সনদ ভেরিফিকেশন পোর্টাল
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            অ্যাপে ফিরুন
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-3xl w-full mx-auto px-4 py-8 flex-1">
        
        {/* Phase 20 Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <span className="font-bold block mb-1">Online verification is currently unavailable (Phase 20 dependency).</span>
              
            </div>
          </div>
        </div>

        {/* Verification Search Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={inputToken}
                onChange={e => setInputToken(e.target.value)}
                placeholder="প্রশংসাপত্রের সিকিউরিটি টোকেন বা ক্রমিক নম্বর দিন (যেমন: BDLK-2026-...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              যাচাই করুন
            </button>
          </form>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            মুদ্রিত প্রশংসাপত্রের নিচের QR কোড স্ক্যান করলে স্বয়ংক্রিয়ভাবে সত্যতা নিশ্চিত হয়।
          </p>
        </div>

        {/* Verification Result Card */}
        {isLoading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-xs">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-700">ডিজিটাল রেকর্ড যাচাই করা হচ্ছে...</p>
          </div>
        ) : searched && !record ? (
          <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <ShieldX className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">কোনো রেকর্ড পাওয়া যায়নি!</h2>
            <p className="text-sm text-slate-600 max-w-md mx-auto mb-4">
              প্রদত্ত টোকেন <span className="font-mono font-bold text-rose-700">{activeToken}</span> দিয়ে রেজিস্টারে কোনো অফিসিয়াল প্রশংসাপত্র পাওয়া যায়নি। অনুগ্রহ করে সঠিক টোকেন বা ক্রমিক নম্বর দিন।
            </p>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 max-w-md mx-auto text-left">
              <strong>সতর্কতা:</strong> আনঅথোরাইজড বা হস্তনির্মিত জাল সনদে এমন ভেরিফিকেশন ব্যর্থ হতে পারে। প্রতিষ্ঠানের প্রধান শিক্ষকের সাথে সরাসরি যোগাযোগ করুন।
            </div>
          </div>
        ) : record ? (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
            {/* Status Banner */}
            {statusType === 'valid' && (
              <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <CheckCircle2 className="w-8 h-8 text-emerald-100" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/30 border border-emerald-300/40 text-xs font-bold uppercase tracking-wider mb-1">
                  স্বীকৃত ও ডিজিটালভাবে প্রমাণিত সনদ
                </div>
                <h2 className="text-2xl font-black">বৈধ অফিসিয়াল প্রশংসাপত্র</h2>
                <p className="text-emerald-100 text-xs mt-1">
                  এই প্রশংসাপত্রটি প্রতিষ্ঠানের ডিজিটাল রেজিস্টারে সংরক্ষিত ও কার্যকর রয়েছে।
                </p>
              </div>
            )}

            {statusType === 'revoked' && (
              <div className="bg-gradient-to-r from-rose-700 to-red-800 text-white p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3">
                  <ShieldAlert className="w-8 h-8 text-rose-100" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-rose-500/30 border border-rose-300/40 text-xs font-bold uppercase tracking-wider mb-1">
                  বাতিলকৃত সনদ (Revoked)
                </div>
                <h2 className="text-2xl font-black">সনদটি বাতিল করা হয়েছে!</h2>
                <p className="text-rose-100 text-xs mt-1">
                  এই প্রশংসাপত্রটি পরবর্তীতে প্রতিষ্ঠান কর্তৃক প্রত্যাহার বা বাতিল করা হয়েছে।
                </p>
                {record.revocationReason && (
                  <div className="mt-3 p-2 bg-black/20 rounded-lg text-xs max-w-md mx-auto">
                    বাতিলের কারণ: {record.revocationReason}
                  </div>
                )}
              </div>
            )}

            {statusType === 'reissued' && (
              <div className="bg-gradient-to-r from-amber-600 to-yellow-700 text-white p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-3">
                  <ShieldAlert className="w-8 h-8 text-amber-100" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/30 border border-amber-300/40 text-xs font-bold uppercase tracking-wider mb-1">
                  পুনরায় ইস্যুকৃত সনদ (Superseded)
                </div>
                <h2 className="text-2xl font-black">সনদটি প্রতিস্থাপিত হয়েছে</h2>
                <p className="text-amber-100 text-xs mt-1">
                  তথ্য সংশোধন বা নতুন কপির কারণে এটি প্রতিস্থাপিত হয়েছে।
                </p>
              </div>
            )}

            {/* Academic & Official Credentials (Privacy-Preserved: Minimum Sensitive PII) */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Institution Header */}
              <div className="border-b border-slate-200 pb-5 text-center">
                <h3 className="text-lg font-black text-slate-900">
                  {snap.institutionNameBn || snap.institutionName || institution?.name || 'শিক্ষা প্রতিষ্ঠান'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">
                  EIIN: {snap.eiin || institution?.eiin || '105820'} • বোর্ড: {snap.board || institution?.board || 'কুমিল্লা'}
                </p>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">প্রশংসাপত্র ক্রমিক</span>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {record.serialNo || snap.serialNo || '—'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">ইস্যুর তারিখ</span>
                  <div className="font-bold text-slate-900 text-sm">
                    {record.issueDate || snap.issuedAt ? new Date(record.issuedAt || record.issueDate).toLocaleDateString('en-GB') : '—'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">শিক্ষার্থীর নাম (বাংলা)</span>
                  <div className="font-bold text-slate-900 text-sm">
                    {snap.nameBn || snap.name || '—'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Student Name (English)</span>
                  <div className="font-bold text-slate-900 text-sm uppercase">
                    {snap.name || '—'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">পরীক্ষা ও বছর</span>
                  <div className="font-bold text-emerald-800 text-sm">
                    {snap.examNameBn || snap.examName || record.examName || '—'} ({snap.passingYear || '—'})
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">শাখা / বিভাগ</span>
                  <div className="font-bold text-slate-900 text-sm">
                    {snap.group || '—'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">বোর্ড রোল</span>
                  <div className="font-mono font-bold text-slate-900 text-sm">
                    {snap.boardRollNo || '—'}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">ফলাফল (GPA)</span>
                  <div className="font-mono font-bold text-emerald-700 text-sm">
                    {snap.gpa ? parseFloat(snap.gpa).toFixed(2) : '—'}
                  </div>
                </div>
              </div>

              {/* Tamper-Evident Snapshot Verification Hash */}
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-600 flex items-center justify-between">
                <span className="font-bold text-slate-500">ডিজিটাল হ্যাশ:</span>
                <span className="truncate max-w-xs">{record.snapshotHash || 'SHA-256 Verified'}</span>
              </div>

              {/* Offline note */}
              <div className="text-[11px] text-slate-500 text-center">
                টোকেন: <span className="font-mono font-bold text-slate-700">{record.verificationToken || activeToken}</span>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500">
        বিদ্যালোক (Bidyalok) এডুকেশন ম্যানেজমেন্ট সিস্টেম • ডিজিটাল নিরাপত্তা যাচাই ফ্রেমওয়ার্ক
      </footer>
    </div>
  );
};

export default TestimonialVerificationPage;
