import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, Sparkles, CheckCircle2, AlertTriangle, RefreshCw, 
  Wrench, Trash2, X, Play, ArrowRight, ShieldCheck, Download, 
  HardDrive, Folder, Check, FileCode, Layers, Info, ExternalLink,
  ChevronRight, Laptop, Award, Cpu, Zap, Database, KeyRound
} from 'lucide-react';
import packageJson from '../../package.json';
import { useAppStore } from '../store/useAppStore';

interface DesktopInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchApp?: () => void;
}

type InstallerStep = 'welcome' | 'existing_detected' | 'installing' | 'finished' | 'uninstall_confirm';
type InstallMode = 'fresh' | 'update' | 'repair' | 'remove';

export const DesktopInstallerModal: React.FC<DesktopInstallerModalProps> = ({
  isOpen,
  onClose,
  onLaunchApp,
}) => {
  const { language, institution, whiteLabel } = useAppStore();
  const isBn = language === 'bn';

  const appName = whiteLabel?.enabled && whiteLabel.appName ? whiteLabel.appName : (institution?.name || 'Biddalok by SoftDows');
  const appVersion = packageJson.version || '1.0.5';

  // State
  const [step, setStep] = useState<InstallerStep>('welcome');
  const [installMode, setInstallMode] = useState<InstallMode>('fresh');
  const [simulateExisting, setSimulateExisting] = useState<boolean>(true);
  const [installDir, setInstallDir] = useState('C:\\Program Files\\SoftDows\\Biddalok');
  const [createDesktopShortcut, setCreateDesktopShortcut] = useState(true);
  const [createStartMenuShortcut, setCreateStartMenuShortcut] = useState(true);
  const [runOnFinish, setRunOnFinish] = useState(true);

  // Progress state
  const [progress, setProgress] = useState(0);
  const [currentActionText, setCurrentActionText] = useState('');
  const [featureIndex, setFeatureIndex] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  // Spotlight features
  const spotlightFeatures = [
    {
      icon: Zap,
      color: 'from-amber-500 to-orange-500',
      titleBn: 'সুপার ফাস্ট অফলাইন ডাটাবেজ',
      titleEn: 'Super Fast Offline Local Database',
      descBn: 'কোনো ইন্টারনেট সংযোগ ছাড়াই চোখের পলকে শত শত শিক্ষার্থীর তথ্য লোড ও প্রসেসিং।',
      descEn: 'Instant student records querying and processing with zero internet latency.',
    },
    {
      icon: Award,
      color: 'from-indigo-500 to-purple-600',
      titleBn: '১-ক্লিক ডিজিটাল প্রশংসাপত্র ও প্রত্যয়ন',
      titleEn: '1-Click Testimonials & Attestations',
      descBn: 'ডাইনামিক কিউআর কোড ভেরিফিকেশন এবং প্রিমিয়াম গর্জিয়াস ফ্রেম ডিজাইন সম্বলিত সনদ।',
      descEn: 'Dynamic QR-code verified certificates with custom seal and gorgeous borders.',
    },
    {
      icon: Cpu,
      color: 'from-emerald-500 to-teal-600',
      titleBn: 'স্মার্ট রেজাল্ট ও গ্রেডিং ইঞ্জিন',
      titleEn: 'Smart Result & GPA Processing',
      descBn: 'সহজেই গ্রেডশিট, টেবুলেশন শিট ও একাডেমিক ট্রান্সক্রিপ্ট প্রস্তুতকরণ।',
      descEn: 'Automatic GPA, grade calculation, and instant printable marksheet generation.',
    },
    {
      icon: KeyRound,
      color: 'from-rose-500 to-pink-600',
      titleBn: 'নিরাপদ ক্রিপ্টোগ্রাফিক রিকভারি',
      titleEn: 'Cryptographic Security & SoftDows OTP',
      descBn: 'SHA-256 পাসওয়ার্ড সিকিউরিটি এবং পাসওয়ার্ড ভুলে গেলে তাৎক্ষণিক সাপোর্ট ওটিপি।',
      descEn: 'SHA-256 protected credentials and one-time emergency support challenge-response OTP.',
    },
  ];

  // Rotate spotlight during installation
  useEffect(() => {
    let timer: any;
    if (step === 'installing') {
      timer = setInterval(() => {
        setFeatureIndex((prev) => (prev + 1) % spotlightFeatures.length);
      }, 2400);
    }
    return () => clearInterval(timer);
  }, [step]);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      if (simulateExisting) {
        setStep('existing_detected');
      } else {
        setStep('welcome');
      }
      setProgress(0);
      setLogs([]);
      setConfettiActive(false);
    }
  }, [isOpen, simulateExisting]);

  // Installation simulator loop
  const startInstallation = (mode: InstallMode) => {
    setInstallMode(mode);
    setStep('installing');
    setProgress(0);
    setLogs([]);

    const logMessages = [
      'Checking Windows system architecture (x64 detected)... OK',
      'Checking disk space requirement on C:\\... (120 MB free available)',
      mode === 'repair' ? 'Validating integrity of existing installation files...' : 'Extracting core package resources...',
      'Setting up Electron offline runtime environment...',
      'Configuring IndexedDB local fast database engine...',
      'Generating high-resolution application icons and assets...',
      createDesktopShortcut ? 'Creating desktop shortcut for Biddalok...' : 'Skipping desktop shortcut creation',
      createStartMenuShortcut ? 'Registering start menu programs entry (SoftDows/Biddalok)...' : 'Skipping start menu entry',
      'Registering Windows uninstaller registry entries...',
      'Optimizing GPU acceleration and typography renderers...',
      'Running post-installation diagnostics... All tests passed!',
      'Installation completed with 100% success rate.'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const currentProgress = Math.min(Math.round((currentStep / logMessages.length) * 100), 100);
      setProgress(currentProgress);
      
      const currentLog = logMessages[currentStep - 1] || 'Finalizing configuration...';
      setCurrentActionText(currentLog);
      setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${currentLog}`]);

      if (currentStep >= logMessages.length) {
        clearInterval(interval);
        setTimeout(() => {
          setStep('finished');
          setConfettiActive(true);
        }, 600);
      }
    }, 450);
  };

  const handleLaunch = () => {
    onClose();
    if (onLaunchApp) {
      onLaunchApp();
    }
  };

  const downloadNsiScript = () => {
    const nsiContent = `; ==============================================================================
; Biddalok by SoftDows - Windows NSIS Production Installer Configuration
; Generated by SoftDows Installer Studio v${appVersion}
; ==============================================================================

!define PRODUCT_NAME "${appName}"
!define PRODUCT_VERSION "${appVersion}"
!define PRODUCT_PUBLISHER "SoftDows (Ansar Ahammad)"
!define PRODUCT_WEB_SITE "https://softdows.com/biddalok"
!define PRODUCT_DIR_REGKEY "Software\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Biddalok.exe"
!define PRODUCT_UNINST_KEY "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\\${PRODUCT_NAME}"

!include "MUI2.nsh"
!include "LogicLib.nsh"

; MUI Settings
!define MUI_ABORTWARNING
!define MUI_ICON "public\\icon.png"
!define MUI_UNICON "public\\icon.png"
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_BITMAP "public\\header.bmp"

; Welcome Page
!insertmacro MUI_PAGE_WELCOME
; Detection & Options Page
!insertmacro MUI_PAGE_DIRECTORY
; Installation Progress Page
!insertmacro MUI_PAGE_INSTFILES
; Finish Page with Run Application Checkbox
!define MUI_FINISHPAGE_RUN "$INSTDIR\\Biddalok.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Run \${PRODUCT_NAME} (সফটওয়্যার চালু করুন)"
!insertmacro MUI_PAGE_FINISH

; Language Configuration
!insertmacro MUI_LANGUAGE "English"

Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  SetOverwrite on
  File /r "dist\\*.*"
  File /r "electron\\*.*"
  
  CreateDirectory "$SMPROGRAMS\\SoftDows"
  CreateShortcut "$SMPROGRAMS\\SoftDows\\\${PRODUCT_NAME}.lnk" "$INSTDIR\\Biddalok.exe"
  CreateShortcut "$DESKTOP\\\${PRODUCT_NAME}.lnk" "$INSTDIR\\Biddalok.exe"
SectionEnd
`;

    const blob = new Blob([nsiContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'installer.nsi';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Windows Window Frame Wrapper */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700/80 max-w-2xl w-full overflow-hidden flex flex-col relative animate-scale-in">
        
        {/* Title Bar (Windows 11 Styled) */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between select-none">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
              B
            </div>
            <span className="text-xs font-semibold text-slate-300">
              {appName} Setup &bull; v{appVersion}
            </span>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
              Windows Installer Studio
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher Toggle for Simulation */}
            <button
              onClick={() => {
                const next = !simulateExisting;
                setSimulateExisting(next);
                setStep(next ? 'existing_detected' : 'welcome');
              }}
              title="Toggle between Fresh Setup & Existing Install Detection"
              className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors"
            >
              {simulateExisting ? (isBn ? '🔄 মোড: বিদ্যমান ইন্সটল' : '🔄 Mode: Existing Install') : (isBn ? '✨ মোড: নতুন ইন্সটল' : '✨ Mode: Fresh Install')}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-red-600/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* STEP 1: EXISTING INSTALLATION DETECTED MODAL (Update / Repair / Remove) */}
        {/* ========================================================================= */}
        {step === 'existing_detected' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-0.5 flex-shrink-0 shadow-lg">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Laptop className="w-7 h-7 text-amber-400" />
                </div>
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                  {isBn ? 'বিদ্যমান সফটওয়্যার সনাক্ত হয়েছে' : 'Existing Installation Detected'}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {isBn ? 'Biddalok ইতিমধ্যে আপনার কম্পিউটারে ইন্সটল আছে!' : 'Biddalok is already installed on this PC'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {isBn 
                    ? 'আপনার পিসিতে পূর্ববর্তী সংস্করণ পাওয়া গেছে। আপনি কি এটি আপডেট, মেরামত করতে চান নাকি সম্পূর্ণ রিমুভ করতে চান?' 
                    : 'A previous installation was detected. Please choose how you want to proceed:'}
                </p>
              </div>
            </div>

            {/* Action Cards Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              {/* Option 1: Update */}
              <button
                onClick={() => startInstallation('update')}
                className="group relative p-4 rounded-xl bg-gradient-to-b from-indigo-950/80 to-slate-900 border-2 border-indigo-500/50 hover:border-indigo-400 hover:bg-indigo-900/40 text-left transition-all shadow-lg hover:shadow-indigo-500/10 flex flex-col justify-between"
              >
                <div className="absolute top-2.5 right-2.5">
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                    {isBn ? 'সুপারিশকৃত' : 'Recommended'}
                  </span>
                </div>
                <div>
                  <div className="p-2.5 bg-indigo-600 text-white rounded-lg w-fit shadow">
                    <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  </div>
                  <h3 className="font-bold text-sm text-white mt-3">
                    {isBn ? '১. সফটওয়্যার আপডেট' : '1. Update / Upgrade'}
                  </h3>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    {isBn 
                      ? 'নতুন ফিচার যুক্ত হবে। সমস্ত ডাটাবেজ ও শিক্ষার্থী রেকর্ড সম্পূর্ণ সুরক্ষিত থাকবে।' 
                      : 'Upgrade to latest build. All school records and offline database remain 100% safe.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-indigo-500/20 flex items-center justify-between text-xs font-semibold text-indigo-300 group-hover:text-white">
                  <span>{isBn ? 'আপডেট শুরু করুন' : 'Start Update'}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option 2: Repair */}
              <button
                onClick={() => startInstallation('repair')}
                className="group p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-sky-500/50 hover:bg-sky-950/30 text-left transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="p-2.5 bg-sky-600 text-white rounded-lg w-fit shadow">
                    <Wrench className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="font-bold text-sm text-white mt-3">
                    {isBn ? '২. সিস্টেম মেরামত' : '2. Repair Installation'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {isBn 
                      ? 'শর্টকাট বা কোনো ফাইল ক্ষতিগ্রস্ত হলে পুনরায় সঠিকভাবে মেরামত ও ঠিক করুন।' 
                      : 'Fix missing shortcuts, corrupted binaries and verify local database integrity.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-sky-300">
                  <span>{isBn ? 'মেরামত করুন' : 'Repair Now'}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              {/* Option 3: Remove / Uninstall */}
              <button
                onClick={() => setStep('uninstall_confirm')}
                className="group p-4 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-rose-500/50 hover:bg-rose-950/30 text-left transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="p-2.5 bg-rose-600/90 text-white rounded-lg w-fit shadow">
                    <Trash2 className="w-5 h-5 group-hover:shake" />
                  </div>
                  <h3 className="font-bold text-sm text-white mt-3">
                    {isBn ? '৩. সফটওয়্যার রিমুভ' : '3. Remove / Uninstall'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {isBn 
                      ? 'কম্পিউটার থেকে সফটওয়্যারটি আনইনস্টল করুন (ডাটা ব্যাকআপ সংরক্ষণ সহ)।' 
                      : 'Safely remove software with prompt to keep your school data backups.'}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-300 group-hover:text-rose-300">
                  <span>{isBn ? 'আনইনস্টল করুন' : 'Uninstall'}</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <span className="text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {isBn ? 'অফলাইন ডেটা সুরক্ষা সুরক্ষিত আছে' : 'Your data is 100% preserved'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors font-medium"
                >
                  {isBn ? 'বাতিল করুন (Cancel)' : 'Cancel Setup'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP: UNINSTALL CONFIRMATION SCREEN */}
        {/* ========================================================================= */}
        {step === 'uninstall_confirm' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-2xl">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {isBn ? 'আপনি কি নিশ্চিত যে সফটওয়্যার রিমুভ করতে চান?' : 'Are you sure you want to uninstall?'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                  {isBn 
                    ? 'Biddalok আনইনস্টল করার আগে আপনার স্কুলের সমস্ত শিক্ষার্থী তথ্য ও সনদ রেকর্ড ব্যাকআপ হিসেবে রাখা অত্যন্ত গুরুত্বপূর্ণ।' 
                    : 'Before removing Biddalok, we strongly recommend backing up your student documents and records.'}
                </p>
              </div>
            </div>

            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer text-xs sm:text-sm text-slate-200">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-0"
                />
                <span>
                  {isBn 
                    ? 'বিদ্যালয়ের সমস্ত ডেটাবেজ ব্যাকআপ কম্পিউটারে সুরক্ষিত রাখুন (সুপারিশকৃত)' 
                    : 'Keep local school database backup safely preserved (Recommended)'}
                </span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={() => setStep('existing_detected')}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                {isBn ? '← পিছনে যান' : '← Back'}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  onClick={() => {
                    alert(isBn ? 'সফটওয়্যার আনইনস্টলেশন সফলভাবে সম্পন্ন হয়েছে।' : 'Software uninstalled successfully.');
                    onClose();
                  }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isBn ? 'হ্যাঁ, আনইনস্টল করুন' : 'Confirm Uninstall'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: FRESH INSTALL WELCOME SCREEN */}
        {/* ========================================================================= */}
        {step === 'welcome' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 via-sky-500 to-emerald-400 p-0.5 shadow-xl flex-shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <Monitor className="w-10 h-10 text-indigo-400" />
                </div>
              </div>
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-3 py-1 rounded-full font-medium mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {isBn ? 'অফিসিয়াল উইন্ডোজ সেটআপ' : 'Official Windows Setup'}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Welcome to {appName}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {isBn 
                    ? 'বিদ্যালয় ও শিক্ষা প্রতিষ্ঠান ব্যবস্থাপনার আধুনিক অফলাইন ডেস্কটপ সফটওয়্যার।' 
                    : 'The modern, offline-first school and institution management desktop system.'}
                </p>
              </div>
            </div>

            {/* Options Box */}
            <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isBn ? 'ইনস্টলেশন লোকেশন (Destination Folder):' : 'Installation Folder:'}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="truncate">{installDir}</span>
                  </div>
                  <button 
                    onClick={() => {
                      const newPath = prompt(isBn ? 'ইনস্টলেশন পাথ লিখুন:' : 'Enter custom installation folder:', installDir);
                      if (newPath) setInstallDir(newPath);
                    }}
                    className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-xl transition-colors"
                  >
                    {isBn ? 'ব্রাউজ...' : 'Browse...'}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={createDesktopShortcut}
                    onChange={e => setCreateDesktopShortcut(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <span>{isBn ? 'ডেস্কটপ শর্টকাট তৈরি করুন' : 'Create Desktop Shortcut'}</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="checkbox"
                    checked={createStartMenuShortcut}
                    onChange={e => setCreateStartMenuShortcut(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-0"
                  />
                  <span>{isBn ? 'স্টার্ট মেনু এন্ট্রি তৈরি করুন' : 'Create Start Menu Entry'}</span>
                </label>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                {isBn ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => startInstallation('fresh')}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all flex items-center gap-2"
              >
                <span>{isBn ? 'ইনস্টল শুরু করুন (Install Now)' : 'Install Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: AESTHETIC & ENGAGING INSTALLATION IN PROGRESS */}
        {/* ========================================================================= */}
        {step === 'installing' && (
          <div className="p-6 sm:p-8 space-y-6">
            {/* Header Status */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {installMode === 'update' 
                    ? (isBn ? 'সফটওয়্যার আপডেট হচ্ছে...' : 'Updating Biddalok...')
                    : installMode === 'repair'
                    ? (isBn ? 'সিস্টেম মেরামত হচ্ছে...' : 'Repairing Biddalok...')
                    : (isBn ? 'সফটওয়্যার ইনস্টল হচ্ছে...' : 'Installing Biddalok...')}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-0.5">
                  {isBn ? 'অনুগ্রহ করে অপেক্ষা করুন' : 'Please wait while setup completes'}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-2xl sm:text-3xl font-mono font-black text-indigo-400">
                  {progress}%
                </span>
              </div>
            </div>

            {/* Glowing Gradient Animated Progress Bar */}
            <div className="space-y-2">
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700 shadow-inner">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-400 to-emerald-400 transition-all duration-300 relative"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                </div>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                <span className="truncate max-w-[320px]">{currentActionText || 'Extracting files...'}</span>
                <span>{progress === 100 ? 'Finalizing' : 'Active Setup'}</span>
              </div>
            </div>

            {/* Feature Spotlight Carousel (Keep User Excited & Happy) */}
            <div className="bg-gradient-to-br from-slate-950 to-indigo-950/60 border border-indigo-500/30 rounded-2xl p-5 relative overflow-hidden shadow-xl">
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start gap-4 relative z-10">
                {(() => {
                  const feat = spotlightFeatures[featureIndex];
                  const IconComp = feat.icon;
                  return (
                    <>
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feat.color} p-0.5 flex-shrink-0 shadow-lg`}>
                        <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                          <IconComp className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-h-[70px]">
                        <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-0.5">
                          {isBn ? 'বিদ্যালোকের বিশেষ বৈশিষ্ট্য:' : 'Biddalok Power Feature:'}
                        </div>
                        <h4 className="text-base font-bold text-white">
                          {isBn ? feat.titleBn : feat.titleEn}
                        </h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {isBn ? feat.descBn : feat.descEn}
                        </p>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Carousel Indicators */}
              <div className="flex justify-center gap-1.5 mt-3">
                {spotlightFeatures.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setFeatureIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${idx === featureIndex ? 'w-6 bg-indigo-400' : 'w-2 bg-slate-700'}`}
                  />
                ))}
              </div>
            </div>

            {/* Realtime Terminal / Log Viewer Dropdown */}
            <div>
              <button
                type="button"
                onClick={() => setShowLogs(!showLogs)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{showLogs ? (isBn ? 'লগ লুকান' : 'Hide Details') : (isBn ? 'ইনস্টলেশন লগ দেখুন (Show Details)' : 'Show Details Log')}</span>
              </button>

              {showLogs && (
                <div className="mt-2 p-3 bg-black/80 rounded-xl border border-slate-800 font-mono text-[10px] text-emerald-400 h-28 overflow-y-auto space-y-1">
                  {logs.map((lg, i) => (
                    <div key={i}>{lg}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: CELEBRATION & DELIGHTFUL SUCCESS SCREEN */}
        {/* ========================================================================= */}
        {step === 'finished' && (
          <div className="p-6 sm:p-8 space-y-6 text-center sm:text-left relative overflow-hidden">
            {/* Confetti / Celebration Particles Graphic Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-400 via-teal-500 to-indigo-600 p-0.5 shadow-2xl flex-shrink-0 animate-bounce-short">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                  <CheckCircle2 className="w-11 h-11 text-emerald-400" />
                </div>
              </div>
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs px-3 py-1 rounded-full font-medium mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  {isBn ? 'ইনস্টলেশন ১০০% সম্পন্ন!' : 'Setup Completed Successfully!'}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {isBn ? 'অভিনন্দন! Biddalok প্রস্তুত' : 'Biddalok is Ready to Launch!'}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
                  {isBn 
                    ? 'আপনার কম্পিউটারে Biddalok সফলভাবে ইনস্টল ও কনফিগার করা হয়েছে। এখন আপনি সরাসরি সফটওয়্যারটি ব্যবহার শুরু করতে পারেন।' 
                    : `${appName} has been successfully installed on your computer. Click Finish to launch.`}
                </p>
              </div>
            </div>

            {/* Checklist of Ready Components */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4.5 space-y-2.5 text-left text-xs">
              <div className="flex items-center gap-2.5 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{isBn ? 'সুপার ফাস্ট অফলাইন লোকাল ডাটাবেজ সক্রিয়' : 'Super Fast Local Offline Database Activated'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{isBn ? 'ডেস্কটপ এবং স্টার্ট মেনু শর্টকাট যুক্ত করা হয়েছে' : 'Desktop and Start Menu shortcuts created'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{isBn ? 'ডিজিটাল প্রশংসাপত্র ও সার্টিফিকেট প্রিন্টিং ইঞ্জিন প্রস্তুত' : 'Digital Testimonial & High-Resolution Print Ready'}</span>
              </div>
            </div>

            {/* Launch Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-indigo-300 hover:text-indigo-200">
                <input
                  type="checkbox"
                  checked={runOnFinish}
                  onChange={e => setRunOnFinish(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded bg-slate-900 border-slate-700 focus:ring-0"
                />
                <span>{isBn ? `সফটওয়্যার এখনই চালু করুন (Run ${appName})` : `Run ${appName} immediately`}</span>
              </label>

              <button
                type="button"
                onClick={downloadNsiScript}
                className="text-[11px] text-slate-400 hover:text-slate-200 underline flex items-center gap-1"
                title="Download NSIS Setup script for Electron Builder"
              >
                <Download className="w-3 h-3" />
                <span>{isBn ? 'NSIS স্ক্রিপ্ট (.nsi)' : 'Export .nsi'}</span>
              </button>
            </div>

            {/* Primary Action Button (Big Celebratory Launch Button) */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={handleLaunch}
                className="w-full flex-1 bg-gradient-to-r from-emerald-500 via-teal-600 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold py-3 px-6 rounded-xl shadow-xl hover:shadow-emerald-500/20 text-sm transition-all flex items-center justify-center gap-2 group"
              >
                <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                <span>{isBn ? 'সফটওয়্যার চালু করুন (Launch Software)' : 'Launch Biddalok by SoftDows'}</span>
              </button>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                {isBn ? 'বন্ধ করুন (Finish)' : 'Finish & Close'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
