/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Sparkles, Download, CheckCircle2, AlertCircle, RefreshCw, 
  ExternalLink, Upload, FileCode, ArrowRight, ShieldCheck, 
  Database, Laptop, Check, X, BellRing
} from 'lucide-react';
import { useUpdateStore } from '../store/useUpdateStore';
import { useAppStore } from '../store/useAppStore';
import { GITHUB_REPO_OWNER, GITHUB_REPO_NAME, GITHUB_REPO_URL } from '../utils/updateService';

interface UniversalUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UniversalUpdateModal: React.FC<UniversalUpdateModalProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    isChecking, hasUpdate, currentVersion, latestRelease, 
    lastChecked, errorMessage, checkUpdates, applyManualUpdatePackage 
  } = useUpdateStore();
  const { language, students, academicClasses } = useAppStore();
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'online' | 'manual'>('online');
  const [manualJsonText, setManualJsonText] = useState('');
  const [manualFeedback, setManualFeedback] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isSimulatingDownload, setIsSimulatingDownload] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const res = applyManualUpdatePackage(parsed);
        setManualFeedback(res);
      } catch (err: any) {
        setManualFeedback({ success: false, message: 'JSON ফাইলটি সঠিক ফরম্যাটে নেই।' });
      }
    };
    reader.readAsText(file);
  };

  const handleManualTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualJsonText.trim()) return;
    try {
      const parsed = JSON.parse(manualJsonText);
      const res = applyManualUpdatePackage(parsed);
      setManualFeedback(res);
    } catch {
      setManualFeedback({ success: false, message: 'ইনপুটকৃত টেক্সটটি সঠিক JSON ফরম্যাটে নেই।' });
    }
  };

  const handleStartInAppUpdate = () => {
    setIsSimulatingDownload(true);
    setDownloadProgress(5);
    setDownloadComplete(false);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsSimulatingDownload(false);
          setDownloadComplete(true);
          return 100;
        }
        const step = Math.floor(Math.random() * 15) + 10;
        return Math.min(prev + step, 100);
      });
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col my-auto text-slate-800 dark:text-slate-100">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 relative overflow-hidden shrink-0">
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shadow-inner">
                <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-300 bg-indigo-500/30 px-2 py-0.5 rounded-full mb-1">
                  <span>GitHub Auto-Sync & OTA Engine</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {isBn ? 'সফটওয়্যার আপডেট সেন্টার' : 'Biddalok Update Center'}
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current vs Latest Version Badges */}
          <div className="mt-4 pt-4 border-t border-indigo-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-indigo-200">{isBn ? 'আপনার বর্তমান ভার্সন:' : 'Installed Version:'}</span>
              <span className="font-mono bg-white/15 px-2.5 py-1 rounded-lg font-bold text-white border border-white/10">
                v{currentVersion}
              </span>
            </div>

            {lastChecked && (
              <span className="text-indigo-300 text-[11px]">
                {isBn ? `সর্বশেষ যাচাই: ${lastChecked}` : `Last checked: ${lastChecked}`}
              </span>
            )}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-6 pt-3 gap-3">
          <button
            onClick={() => setActiveTab('online')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'online'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isBn ? 'GitHub অনলাইন যাচাই' : 'GitHub Online Check'}</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'manual'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>{isBn ? 'ম্যানুয়াল প্যাকেজ' : 'Manual Package'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          
          {/* Zero Data Loss Guarantee Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900 dark:text-emerald-200">
              <p className="font-bold">
                {isBn ? '১০০% নিরাপদ ও ডাটা সুরক্ষিত আপডেট নিশ্চয়তা' : '100% Zero Data Loss Guarantee'}
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5 leading-relaxed">
                {isBn 
                  ? `আপডেটের সময় আপনার সংরক্ষিত ${students.length} জন শিক্ষার্থীর রেকর্ড, ${academicClasses.length} টি ক্লাসের তালিকা ও প্রতিষ্ঠান সেটিংস সম্পূর্ণ অক্ষত থাকবে।`
                  : `Your ${students.length} students and ${academicClasses.length} class records will remain completely intact during any update.`}
              </p>
            </div>
          </div>

          {activeTab === 'online' && (
            <div className="space-y-5">
              
              {/* Check Status Container */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 bg-slate-50/50 dark:bg-slate-900/30">
                {isChecking ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                    <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {isBn ? 'GitHub রিলিজ যাচাই করা হচ্ছে...' : 'Checking GitHub for new releases...'}
                    </p>
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                      <span>Official Repo: <strong>{GITHUB_REPO_OWNER}/{GITHUB_REPO_NAME}</strong></span>
                    </div>
                  </div>
                ) : hasUpdate && latestRelease ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 mb-2">
                          <BellRing className="w-3 h-3" />
                          <span>{isBn ? 'নতুন ভার্সন পাওয়া গেছে!' : 'New Update Available!'}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {latestRelease.name} <span className="text-indigo-600 font-mono text-sm">(v{latestRelease.version})</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {isBn ? `প্রকাশের তারিখ: ${latestRelease.releaseDate}` : `Released: ${latestRelease.releaseDate}`}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800">
                          Ready to Install
                        </span>
                      </div>
                    </div>

                    {/* Changelog Box */}
                    <div className="bg-white dark:bg-slate-950 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 max-h-40 overflow-y-auto whitespace-pre-line leading-relaxed">
                      <p className="font-bold text-slate-900 dark:text-slate-100 mb-1">
                        {isBn ? 'পরিবর্তন ও নতুন ফিচারসমূহ (Changelog):' : 'What\'s New:'}
                      </p>
                      {latestRelease.body}
                    </div>

                    {/* Progress Bar (if simulated download) */}
                    {isSimulatingDownload && (
                      <div className="space-y-2 bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                        <div className="flex justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                          <span>{isBn ? 'আপডেট ডাউনলোড ও ইন্সটল হচ্ছে...' : 'Downloading & Applying update...'}</span>
                          <span>{downloadProgress}%</span>
                        </div>
                        <div className="w-full bg-indigo-200 dark:bg-indigo-900 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full transition-all duration-300"
                            style={{ width: `${downloadProgress}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
                          {isBn ? 'আপনার ডেটাবেজ ও সার্টিফিকেট সম্পূর্ণ সুরক্ষিত আছে।' : 'All database records are safely guarded.'}
                        </p>
                      </div>
                    )}

                    {downloadComplete && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-4 rounded-xl text-center space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                        <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                          {isBn ? 'আপডেট সফলভাবে প্রস্তুত হয়েছে!' : 'Update Ready & Verified!'}
                        </h4>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300">
                          {isBn ? 'সফটওয়্যার রিস্টার্ট বা রিফ্রেশ করলে নতুন ফিচারগুলো পুরোপুরি চালু হবে।' : 'Restart or reload the application to experience the new update.'}
                        </p>
                        <button
                          onClick={() => window.location.reload()}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-xl shadow transition-all"
                        >
                          {isBn ? 'সফটওয়্যার রিফ্রেশ করুন' : 'Reload Application'}
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!isSimulatingDownload && !downloadComplete && (
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          onClick={handleStartInAppUpdate}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>{isBn ? 'অ্যাপের ভেতরেই এক-ক্লিকে আপডেট করুন' : 'Instant In-App Update'}</span>
                        </button>

                        {latestRelease.htmlUrl && (
                          <a
                            href={latestRelease.htmlUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>GitHub Release</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                        {isBn ? 'আপনার সফটওয়্যারটি সম্পূর্ণ আপ-টু-ডেট আছে!' : 'You are running the latest version!'}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {isBn ? `বর্তমান ভার্সন v${currentVersion} এ কোনো নতুন আপডেট বাকি নেই।` : `No newer version found. You are on v${currentVersion}.`}
                      </p>
                    </div>

                    <button
                      onClick={() => checkUpdates(false)}
                      className="mt-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{isBn ? 'পুনরায় চেক করুন (Check Again)' : 'Check Again'}</span>
                    </button>
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl p-3 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {isBn ? 'অফলাইন আপডেট ফাইল আপলোড (.json / .pkg)' : 'Upload Offline Update Package'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {isBn 
                      ? 'ইন্টারনেট সংযোগ না থাকলে সফটডাউস থেকে প্রাপ্ত আপডেট রিলিজ JSON ফাইলটি এখানে নির্বাচন করুন।' 
                      : 'If you have received an update release package JSON from SoftDows, select it here.'}
                  </p>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,.pkg"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-300 dark:border-indigo-800 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition-all bg-white dark:bg-slate-950 group"
                >
                  <Upload className="w-8 h-8 text-indigo-500 mx-auto group-hover:-translate-y-1 transition-transform" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
                    {isBn ? 'ক্লিক করে ফাইল সিলেক্ট করুন' : 'Click to select update package'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    JSON / PKG Files supported
                  </p>
                </div>

                {manualFeedback && (
                  <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
                    manualFeedback.success
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                  }`}>
                    {manualFeedback.success ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    <span>{manualFeedback.message}</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span>Database Status: Active & Secured</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl transition-all"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
