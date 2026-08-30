import React, { useState } from 'react';
import { calculateSupportRecoveryOTP } from '../utils/security';
import { Wrench, Key, Copy, Check, X, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

interface SupportOtpGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialChallengeCode?: string;
}

export const SupportOtpGeneratorModal: React.FC<SupportOtpGeneratorModalProps> = ({
  isOpen,
  onClose,
  initialChallengeCode = '',
}) => {
  const { language } = useAppStore();
  const isBn = language === 'bn';

  const [challengeInput, setChallengeInput] = useState(initialChallengeCode);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [copied, setCopied] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeInput.trim()) return;

    setIsCalculating(true);
    try {
      const otp = await calculateSupportRecoveryOTP(challengeInput.trim());
      setGeneratedOtp(otp);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleCopy = () => {
    if (!generatedOtp) return;
    navigator.clipboard.writeText(generatedOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700 max-w-md w-full overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/80 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/30">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                {isBn ? 'সফটডোজ সাপোর্ট ওটিপি জেনারেটর' : 'SoftDows Support OTP Generator'}
              </h3>
              <p className="text-xs text-slate-400">
                {isBn ? 'গ্রাহকের জন্য সিঙ্গেল-ইউজ আনলক কোড' : 'Instant Single-Use Unlock OTP for Client'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isBn 
                ? 'গ্রাহক তার স্ক্রিনে দেখানো "চ্যালেঞ্জ কোড" দিলে সেটি এখানে ইনপুট করুন। প্রাপ্ত ওটিপিটি গ্রাহককে বলে দিন।'
                : 'Enter the Challenge Code provided by the client to calculate their 6-digit unlock OTP.'}
            </p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {isBn ? 'গ্রাহকের চ্যালেঞ্জ কোড (Challenge Code)' : 'Client Challenge Code'} *
              </label>
              <input
                type="text"
                required
                value={challengeInput}
                onChange={e => setChallengeInput(e.target.value)}
                placeholder="e.g. BD-106103-270826"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-800 border border-slate-600 rounded-xl text-white font-mono placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isCalculating || !challengeInput.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>{isCalculating ? (isBn ? 'গণনা করা হচ্ছে...' : 'Calculating...') : (isBn ? '৬-সংখ্যার ওটিপি বের করুন' : 'Generate 6-Digit OTP')}</span>
            </button>
          </form>

          {generatedOtp && (
            <div className="bg-slate-800/90 border-2 border-emerald-500/40 rounded-xl p-4 flex items-center justify-between animate-fade-in shadow-inner">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                  {isBn ? 'গ্রাহকের জন্য আনলক ওটিপি (OTP):' : 'Unlock OTP for Customer:'}
                </span>
                <span className="text-2xl font-mono font-extrabold text-emerald-400 tracking-widest mt-1 block select-all">
                  {generatedOtp}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            SoftDows Internal Support Security Protocol • Biddalok ERP
          </p>
        </div>
      </div>
    </div>
  );
};
