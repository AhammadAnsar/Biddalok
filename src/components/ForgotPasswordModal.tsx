import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { 
  KeyRound, ShieldAlert, Phone, FileUp, 
  CheckCircle2, AlertTriangle, X, Lock, Building, 
  RefreshCw, HelpCircle, Copy, Check, MessageSquare
} from 'lucide-react';
import { generateSupportChallengeCode } from '../utils/security';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newUsername: string, tempNewPass?: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { language, institution, importBackupJSON } = useAppStore();
  const { recoverPassword, adminUser } = useAuthStore();
  const isBn = language === 'bn';

  const [activeTab, setActiveTab] = useState<'verify' | 'supportOtp' | 'backup'>('verify');

  // Verify form state (Self recovery by Institution details)
  const [inputEiin, setInputEiin] = useState('');
  const [inputContact, setInputContact] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'idle' | 'success' | 'error'; text: string }>({ type: 'idle', text: '' });

  // Challenge-Response Support OTP recovery state
  const [challengeCode, setChallengeCode] = useState('');
  const [enteredSupportOtp, setEnteredSupportOtp] = useState('');
  const [otpNewPassword, setOtpNewPassword] = useState('');
  const [otpConfirmPassword, setOtpConfirmPassword] = useState('');
  const [otpStatus, setOtpStatus] = useState<{ type: 'idle' | 'success' | 'error'; text: string }>({ type: 'idle', text: '' });
  const [copiedChallenge, setCopiedChallenge] = useState(false);

  // Backup restore state
  const [backupFile, setBackupFile] = useState<File | null>(null);
  const [backupNewPass, setBackupNewPass] = useState('');
  const [backupStatus, setBackupStatus] = useState<{ type: 'idle' | 'success' | 'error'; text: string }>({ type: 'idle', text: '' });

  useEffect(() => {
    if (isOpen) {
      const code = generateSupportChallengeCode(institution?.eiin || adminUser || 'BD101');
      setChallengeCode(code);
      if (!inputEiin && institution?.eiin) {
        setInputEiin(institution.eiin);
      }
    }
  }, [isOpen, institution?.eiin, adminUser]);

  if (!isOpen) return null;

  const handleCopyChallenge = () => {
    navigator.clipboard.writeText(challengeCode);
    setCopiedChallenge(true);
    setTimeout(() => setCopiedChallenge(false), 2500);
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage({ type: 'idle', text: '' });

    if (!inputEiin.trim() || !inputContact.trim()) {
      setStatusMessage({
        type: 'error',
        text: isBn ? 'দয়া করে EIIN এবং নিবন্ধিত ফোন/ইমেইল প্রদান করুন।' : 'Please provide EIIN and registered contact.',
      });
      return;
    }

    const cleanPass = newPassword.trim();
    if (cleanPass !== confirmPassword.trim()) {
      setStatusMessage({
        type: 'error',
        text: isBn ? 'নতুন পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড মেলেনি।' : 'Passwords do not match.',
      });
      return;
    }

    if (cleanPass.length < 4) {
      setStatusMessage({
        type: 'error',
        text: isBn ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters.',
      });
      return;
    }

    try {
      setIsProcessing(true);
      const res = await recoverPassword(
        cleanPass, 
        {
          inputEiin: inputEiin.trim(),
          inputContact: inputContact.trim(),
          institution,
        },
        inputEiin.trim()
      );

      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: isBn ? 'পাসওয়ার্ড সফলভাবে রিসেট হয়েছে! আপনাকে লগইন পেজে নিয়ে যাওয়া হচ্ছে...' : res.message,
        });
        setTimeout(() => {
          onSuccess(res.username || inputEiin.trim(), cleanPass);
          onClose();
        }, 1200);
      } else {
        setStatusMessage({
          type: 'error',
          text: isBn 
            ? 'যাচাইকরণ ব্যর্থ হয়েছে! প্রদত্ত EIIN বা যোগাযোগ নম্বর প্রতিষ্ঠানের রেকর্ডের সাথে মেলেনি।' 
            : res.message,
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: isBn ? 'পাসওয়ার্ড রিকভারি প্রক্রিয়ায় ত্রুটি হয়েছে।' : 'An error occurred during recovery.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSupportOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpStatus({ type: 'idle', text: '' });

    const cleanOtp = enteredSupportOtp.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setOtpStatus({
        type: 'error',
        text: isBn ? 'অনুগ্রহ করে ৬-সংখ্যার সঠিক সাপোর্ট OTP কোডটি লিখুন।' : 'Please enter the 6-digit Support Recovery OTP.',
      });
      return;
    }

    const cleanPass = otpNewPassword.trim();
    if (cleanPass !== otpConfirmPassword.trim()) {
      setOtpStatus({
        type: 'error',
        text: isBn ? 'পাসওয়ার্ড দুটি মেলেনি।' : 'Passwords do not match.',
      });
      return;
    }

    if (cleanPass.length < 4) {
      setOtpStatus({
        type: 'error',
        text: isBn ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters.',
      });
      return;
    }

    try {
      setIsProcessing(true);
      const targetUser = adminUser || institution?.eiin || 'admin';
      const res = await recoverPassword(
        cleanPass, 
        {
          challengeCode,
          supportOtp: cleanOtp,
        },
        targetUser
      );

      if (res.success) {
        setOtpStatus({
          type: 'success',
          text: isBn ? 'অফিসিয়াল সাপোর্ট ওটিপি যাচাই সফল! পাসওয়ার্ড রিসেট সম্পন্ন হয়েছে।' : res.message,
        });
        setTimeout(() => {
          onSuccess(res.username || targetUser, cleanPass);
          onClose();
        }, 1200);
      } else {
        setOtpStatus({
          type: 'error',
          text: isBn ? 'ভুল বা মেয়াদোত্তীর্ণ ওটিপি (Invalid/Expired OTP)। অনুগ্রহ করে সাপোর্টের সাথে পুনরায় চেক করুন।' : res.message,
        });
      }
    } catch (err) {
      setOtpStatus({
        type: 'error',
        text: isBn ? 'ওটিপি যাচাই প্রক্রিয়ায় সমস্যা হয়েছে।' : 'Failed to verify Support OTP.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackupRestore = async (e: React.FormEvent) => {
    e.preventDefault();
    setBackupStatus({ type: 'idle', text: '' });

    if (!backupFile) {
      setBackupStatus({
        type: 'error',
        text: isBn ? 'অনুগ্রহ করে ব্যাকআপ JSON ফাইল নির্বাচন করুন।' : 'Please select a backup JSON file.',
      });
      return;
    }

    const cleanPass = backupNewPass.trim();
    if (cleanPass.length < 4) {
      setBackupStatus({
        type: 'error',
        text: isBn ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters.',
      });
      return;
    }

    try {
      setIsProcessing(true);
      const text = await backupFile.text();
      const parsed = JSON.parse(text);
      const success = importBackupJSON(text);

      if (success) {
        const instEiin = parsed.institution?.eiin || institution.eiin || 'admin';
        const res = await recoverPassword(
          cleanPass, 
          {
            inputEiin: instEiin,
            inputContact: parsed.institution?.mobile || institution.mobile,
            institution: parsed.institution || institution,
          },
          instEiin
        );

        setBackupStatus({
          type: 'success',
          text: isBn ? 'ব্যাকআপ থেকে ডেটা এবং নতুন পাসওয়ার্ড সফলভাবে রিস্টোর হয়েছে!' : 'Data and password restored successfully from backup!',
        });
        setTimeout(() => {
          onSuccess(res.username || instEiin, cleanPass);
          onClose();
        }, 1200);
      } else {
        setBackupStatus({
          type: 'error',
          text: isBn ? 'ব্যাকআপ ফাইলটি সঠিক নয় বা করাপ্ট।' : 'Invalid or corrupted backup JSON file.',
        });
      }
    } catch (err) {
      setBackupStatus({
        type: 'error',
        text: isBn ? 'ফাইল পার্সিং ব্যর্থ হয়েছে।' : 'Failed to parse JSON file.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const whatsAppText = encodeURIComponent(
    `Hello SoftDows Support, I need password recovery for Biddalok ERP.\nInstitution: ${institution?.name || 'School'}\nEIIN: ${institution?.eiin || 'N/A'}\nChallenge Code: ${challengeCode}`
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-sm">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {isBn ? 'পাসওয়ার্ড পুনরুদ্ধার (Recovery & Support)' : 'Password Recovery & Support'}
              </h3>
              <p className="text-xs text-slate-500">
                {isBn ? 'নিরাপদ অফলাইন যাচাইকরণ বা সাপোর্ট ওটিপি দ্বারা পাসওয়ার্ড রিসেট' : 'Reset password via local verification or Support One-Time OTP'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/60 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'verify' 
                ? 'border-indigo-600 text-indigo-700 bg-white' 
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>{isBn ? 'প্রতিষ্ঠান যাচাই' : 'Verify Details'}</span>
          </button>
          <button
            onClick={() => setActiveTab('supportOtp')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'supportOtp' 
                ? 'border-indigo-600 text-indigo-700 bg-white' 
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{isBn ? 'সাপোর্ট ওটিপি (Helpline)' : 'Support OTP'}</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'backup' 
                ? 'border-indigo-600 text-indigo-700 bg-white' 
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileUp className="w-4 h-4" />
            <span>{isBn ? 'ব্যাকআপ ফাইল' : 'Backup File'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* TAB 1: Self Recovery via Institution Details */}
          {activeTab === 'verify' && (
            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3.5 text-xs text-indigo-900 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <p>
                  {isBn 
                    ? 'প্রতিষ্ঠানের নিবন্ধিত EIIN নম্বর এবং যোগাযোগ নম্বর/ইমেইল প্রদান করে নিজেই পাসওয়ার্ড রিসেট করুন।' 
                    : 'Provide registered EIIN and contact number/email to reset password yourself.'}
                </p>
              </div>

              {statusMessage.type !== 'idle' && (
                <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
                  statusMessage.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'প্রতিষ্ঠানের EIIN নম্বর' : 'Institution EIIN'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={inputEiin}
                    onChange={e => setInputEiin(e.target.value)}
                    placeholder="e.g. 106103"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'নিবন্ধিত মোবাইল বা ইমেইল' : 'Registered Mobile / Email'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={inputContact}
                    onChange={e => setInputContact(e.target.value)}
                    placeholder="01815... or school@gmail.com"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'} *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'} *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2.5">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isProcessing 
                      ? (isBn ? 'যাচাই ও রিসেট করা হচ্ছে...' : 'Verifying & Resetting...') 
                      : (isBn ? 'পাসওয়ার্ড রিসেট ও সেভ করুন' : 'Reset & Save Password')}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-xl text-xs"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Dynamic Challenge-Response Support OTP */}
          {activeTab === 'supportOtp' && (
            <form onSubmit={handleSupportOtpSubmit} className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    {isBn ? '১. আপনার চ্যালেঞ্জ কোড (Challenge Code):' : '1. Your Daily Challenge Code:'}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyChallenge}
                    className="text-xs text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg"
                  >
                    {copiedChallenge ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedChallenge ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি করুন' : 'Copy')}</span>
                  </button>
                </div>

                <div className="bg-white border-2 border-indigo-200 p-2.5 rounded-xl font-mono text-center text-sm sm:text-base font-bold text-indigo-700 tracking-wider select-all">
                  {challengeCode || 'GENERATING...'}
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {isBn 
                    ? 'উপরের কোডটি সফটডোজ সাপোর্ট টিমে জানান। সাপোর্ট টিম আপনাকে একটি তাৎক্ষণিক ৬-সংখ্যার ওয়ান-টাইম রিকভারি ওটিপি দেবে।' 
                    : 'Share this challenge code with SoftDows support to receive your instant 6-digit One-Time Recovery OTP.'}
                </p>

                <div className="flex gap-2 pt-1">
                  <a
                    href={`https://wa.me/8801815598926?text=${whatsAppText}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{isBn ? 'সাপোর্টে WhatsApp করুন' : 'WhatsApp Support'}</span>
                  </a>
                  <a
                    href="tel:+8801815598926"
                    className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{isBn ? 'কল করুন' : 'Call'}</span>
                  </a>
                </div>
              </div>

              {otpStatus.type !== 'idle' && (
                <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
                  otpStatus.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {otpStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{otpStatus.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? '২. সাপোর্ট থেকে প্রাপ্ত ৬-সংখ্যার OTP কোড' : '2. Enter 6-digit Support Recovery OTP'} *
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={enteredSupportOtp}
                  onChange={e => setEnteredSupportOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="e.g. 849201"
                  className="w-full px-3 py-2 text-center tracking-widest font-mono text-base font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? '৩. নতুন পাসওয়ার্ড' : '3. New Password'} *
                  </label>
                  <input
                    type="password"
                    required
                    value={otpNewPassword}
                    onChange={e => setOtpNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {isBn ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'} *
                  </label>
                  <input
                    type="password"
                    required
                    value={otpConfirmPassword}
                    onChange={e => setOtpConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isProcessing 
                      ? (isBn ? 'ওটিপি যাচাই করা হচ্ছে...' : 'Verifying OTP...') 
                      : (isBn ? 'ওটিপি দিয়ে পাসওয়ার্ড আনলক করুন' : 'Verify & Unlock Password')}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-xl text-xs"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Backup Restore */}
          {activeTab === 'backup' && (
            <form onSubmit={handleBackupRestore} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                <FileUp className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  {isBn 
                    ? 'আপনার পূর্বে ডাউনলোড করা Biddalok JSON ব্যাকআপ ফাইলটি আপলোড করুন এবং নতুন পাসওয়ার্ড দিন।' 
                    : 'Upload your previously downloaded Biddalok JSON backup file and define a new password.'}
                </p>
              </div>

              {backupStatus.type !== 'idle' && (
                <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
                  backupStatus.type === 'success' 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {backupStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  <span>{backupStatus.text}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'ব্যাকআপ JSON ফাইল নির্বাচন করুন' : 'Select Backup JSON File'} *
                </label>
                <input
                  type="file"
                  accept=".json"
                  required
                  onChange={e => setBackupFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 border border-slate-300 rounded-xl p-1"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'} *
                </label>
                <input
                  type="password"
                  required
                  value={backupNewPass}
                  onChange={e => setBackupNewPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="pt-3 flex gap-2.5">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>
                    {isProcessing 
                      ? (isBn ? 'রিস্টোর হচ্ছে...' : 'Restoring...') 
                      : (isBn ? 'ব্যাকআপ থেকে রিস্টোর করুন' : 'Restore from Backup')}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-xl text-xs"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
