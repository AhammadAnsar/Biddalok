import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { GraduationCap, Lock, User, AlertCircle, CheckCircle2, HelpCircle, Wrench } from 'lucide-react';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { SupportOtpGeneratorModal } from '../components/SupportOtpGeneratorModal';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isSupportOtpModalOpen, setIsSupportOtpModalOpen] = useState(false);

  const login = useAuthStore(state => state.login);
  const { whiteLabel, institution, language } = useAppStore();

  const appName = whiteLabel?.enabled && whiteLabel.appName ? whiteLabel.appName : (institution?.name || 'Biddalok ERP');
  const logo = whiteLabel?.enabled && whiteLabel.appIcon ? whiteLabel.appIcon : (institution?.logoUrl || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const cleanUser = username.trim();
      const cleanPass = password.trim();
      const success = await login(cleanUser, cleanPass, institution?.eiin);
      if (!success) {
        setError(language === 'bn' ? 'ভুল ইউজারনেম বা পাসওয়ার্ড!' : 'Invalid username or password!');
      }
    } catch (err) {
      setError(language === 'bn' ? 'লগইন প্রক্রিয়ায় ত্রুটি হয়েছে।' : 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecoverySuccess = (recoveredUsername: string, tempNewPass?: string) => {
    setUsername(recoveredUsername);
    if (tempNewPass) {
      setPassword(tempNewPass);
    } else {
      setPassword('');
    }
    setError('');
    setSuccessMessage(
      language === 'bn' 
        ? `পাসওয়ার্ড সফলভাবে রিসেট হয়েছে! ইউজারনেম "${recoveredUsername}" দিয়ে সরাসরি লগইন করুন।` 
        : `Password reset successful! Sign in using username "${recoveredUsername}".`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          {logo ? (
            <img src={logo} alt="Logo" className="h-16 w-auto object-contain rounded-lg shadow-sm" />
          ) : (
            <div className="h-16 w-16 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          )}
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          {appName}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {language === 'bn' ? 'সফটওয়্যারে লগইন করুন' : 'Sign in to your account'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-md flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {language === 'bn' ? 'ইউজারনেম (EIIN বা Admin)' : 'Username (EIIN or Admin)'}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border outline-none"
                  placeholder="e.g. 106103 or admin"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">
                  {language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-1"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}</span>
                </button>
              </div>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border outline-none"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading 
                  ? (language === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...')
                  : (language === 'bn' ? 'লগইন করুন' : 'Sign in')}
              </button>
            </div>
          </form>
        </div>

        {/* SoftDows Admin / Support Desk Quick Access */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSupportOtpModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-indigo-600 hover:bg-white/80 border border-transparent hover:border-slate-200 transition-all"
            title="Emergency OTP Generator for SoftDows Support Team"
          >
            <Wrench className="w-3.5 h-3.5 text-indigo-500" />
            <span>
              {language === 'bn' ? 'সফটডোজ সাপোর্ট টুল (OTP Generator)' : 'SoftDows Support Desk (OTP Generator)'}
            </span>
          </button>
        </div>
      </div>

      {/* Password Recovery Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onSuccess={handleRecoverySuccess}
      />

      {/* SoftDows Support OTP Generator Modal */}
      <SupportOtpGeneratorModal
        isOpen={isSupportOtpModalOpen}
        onClose={() => setIsSupportOtpModalOpen(false)}
      />
    </div>
  );
}
