import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { GraduationCap, Building2, User, Lock, Upload, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const { updateInstitution, institution, language } = useAppStore();
  const setOnboarded = useAuthStore(state => state.setOnboarded);

  // Institution Data
  const [instName, setInstName] = useState('');
  const [instEiin, setInstEiin] = useState('');
  const [instLogo, setInstLogo] = useState('');

  // Admin Data
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // When moving to step 2, default username to EIIN
    if (step === 2 && instEiin && !username) {
      setUsername(instEiin);
    }
  }, [step, instEiin]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInstLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (step === 1) {
      if (!instName.trim()) {
        setErrorMessage(language === 'bn' ? 'প্রতিষ্ঠানের নাম প্রদান করা আবশ্যক।' : 'Institution name is required.');
        return;
      }
      updateInstitution({
        name: instName.trim(),
        eiin: instEiin.trim(),
        logoUrl: instLogo,
      });
      setStep(2);
    } else {
      if (!username.trim() || !password.trim()) {
        setErrorMessage(language === 'bn' ? 'ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন।' : 'Username and Password are required.');
        return;
      }
      if (password.trim().length < 4) {
        setErrorMessage(language === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৪ অক্ষরের হতে হবে।' : 'Password must be at least 4 characters long.');
        return;
      }
      try {
        setIsSubmitting(true);
        await setOnboarded(username.trim(), password.trim());
      } catch (err) {
        setErrorMessage(language === 'bn' ? 'সেটআপ সংরক্ষণে সমস্যা হয়েছে।' : 'Failed to save setup.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          {language === 'bn' ? 'সিস্টেম সেটআপ' : 'System Setup'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {step === 1 
            ? (language === 'bn' ? 'প্রতিষ্ঠানের প্রাথমিক তথ্য দিন' : 'Enter basic institution details')
            : (language === 'bn' ? 'লগইন করার জন্য এডমিন প্যানেল সেটআপ করুন' : 'Setup admin credentials')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200">
          
          {/* Progress Bar */}
          <div className="mb-8 relative">
            <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full -translate-y-1/2"></div>
            <div className="absolute left-0 top-1/2 h-1 bg-indigo-600 -z-10 rounded-full -translate-y-1/2 transition-all duration-300" style={{ width: step === 1 ? '50%' : '100%' }}></div>
            <div className="flex justify-between">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>1</div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-400'}`}>2</div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleNext}>
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
                <span>{errorMessage}</span>
              </div>
            )}
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {language === 'bn' ? 'প্রতিষ্ঠানের নাম' : 'Institution Name'} *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      value={instName}
                      onChange={e => setInstName(e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    EIIN {language === 'bn' ? 'নম্বর (যদি থাকে)' : 'Number (Optional)'}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GraduationCap className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={instEiin}
                      onChange={e => setInstEiin(e.target.value)}
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {language === 'bn' ? 'প্রতিষ্ঠানের লোগো (অপশনাল)' : 'Institution Logo (Optional)'}
                  </label>
                  <div className="flex items-center gap-4">
                    {instLogo ? (
                      <div className="relative w-16 h-16 rounded-lg border border-slate-200 overflow-hidden">
                        <img src={instLogo} alt="Logo" className="w-full h-full object-contain bg-slate-50" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-lg border border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                        <Building2 className="w-6 h-6 text-slate-400" />
                      </div>
                    )}
                    <label className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer">
                      <Upload className="w-4 h-4 mr-2 text-slate-500" />
                      {language === 'bn' ? 'ছবি আপলোড' : 'Upload Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-indigo-50 border border-indigo-100 rounded-md p-4 text-sm text-indigo-800 mb-6 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>{language === 'bn' ? 'এই ইউজারনেম এবং পাসওয়ার্ড দিয়ে পরবর্তীতে সফটওয়্যারে লগইন করতে হবে। এগুলো মনে রাখুন।' : 'You will use this username and password to log in next time. Keep them safe.'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {language === 'bn' ? 'এডমিন ইউজারনেম' : 'Admin Username'} *
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
                      className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-md py-2 border outline-none font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    {language === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'} *
                  </label>
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
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                {step === 1 ? (
                  <>
                    {language === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    {language === 'bn' ? 'সফটওয়্যার চালু করুন' : 'Launch Software'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
