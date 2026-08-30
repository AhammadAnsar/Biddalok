import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import packageJson from '../../package.json';
import { 
  LayoutDashboard, Users, BookOpen, UserCircle, 
  Building2, Wallet, School, Trophy, Globe, 
  BarChart3, Settings, Menu, X, Award,
  Headphones, Phone, MessageSquare, Facebook, ExternalLink,
  Sparkles, Download, BellRing
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useUpdateStore } from '../store/useUpdateStore';
import { translations, TranslationKey } from '../locales';
import { SupportModal } from './SupportModal';
import { FloatingSupportWidget } from './FloatingSupportWidget';
import { UniversalUpdateModal } from './UniversalUpdateModal';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [supportTopic, setSupportTopic] = useState('general');
  const { language, setLanguage, institution, whiteLabel } = useAppStore();
  const { 
    hasUpdate, latestRelease, isUpdateModalOpen, 
    bannerDismissed, checkUpdates, openUpdateModal, 
    closeUpdateModal, dismissBanner 
  } = useUpdateStore();
  const location = useLocation();

  const appName = whiteLabel?.enabled && whiteLabel.appName ? whiteLabel.appName : (institution?.name || 'Biddalok');
  const appIcon = whiteLabel?.enabled && whiteLabel.appIcon ? whiteLabel.appIcon : (institution?.logoUrl || './icon.svg');
  const appVersion = packageJson.version;
  const isBn = language === 'bn';

  const t = (key: TranslationKey) => translations[language][key];

  const handleOpenSupport = (topic: string = 'general') => {
    setSupportTopic(topic);
    setSupportModalOpen(true);
  };

  // Check for GitHub updates silently once when layout mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      checkUpdates(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    
    // Initial check
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, path: '/', label: 'dashboard' },
    { id: 'students', icon: Users, path: '/students', label: 'students' },
    { id: 'academic', icon: BookOpen, path: '/academic', label: 'academic' },
    { id: 'testimonial', icon: Award, path: '/testimonial', label: 'testimonial' },
    { id: 'hr', icon: UserCircle, path: '/hr', label: 'hr' },
    { id: 'administration', icon: Building2, path: '/administration', label: 'administration' },
    { id: 'finance', icon: Wallet, path: '/finance', label: 'finance' },
    { id: 'institution', icon: School, path: '/institution', label: 'institution' },
    { id: 'activities', icon: Trophy, path: '/activities', label: 'activities' },
    { id: 'website', icon: Globe, path: '/website', label: 'website' },
    { id: 'reports', icon: BarChart3, path: '/reports', label: 'reports' },
    { id: 'system', icon: Settings, path: '/system', label: 'system' },
    { id: 'support', icon: Headphones, path: '/support', label: 'support' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden relative">
      
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          bg-indigo-900 text-white flex flex-col shadow-2xl lg:shadow-xl transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0 w-72 lg:w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'}
        `}
      >
        <div className="h-16 flex items-center justify-between border-b border-indigo-800 px-4 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <img 
              src={appIcon} 
              alt="Logo" 
              className="w-9 h-9 rounded-xl flex-shrink-0 object-cover bg-white/10 shadow-inner" 
            />
            {(sidebarOpen || isMobile) && (
              <div className="flex flex-col">
                <h1 className="text-base font-bold tracking-tight text-white leading-tight truncate" title={appName}>
                  {appName.length > 18 ? `${appName.substring(0, 18)}...` : appName}
                </h1>
                <p className="text-[10px] text-indigo-300 font-medium tracking-wide">by SoftDows</p>
              </div>
            )}
          </div>
          {isMobile && (
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-indigo-800 scrollbar-track-transparent">
          <ul className="space-y-1.5 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <li key={item.id}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20' 
                        : 'text-indigo-200 hover:bg-indigo-800/60 hover:text-white hover:translate-x-1'
                    }`}
                    title={t(item.label as TranslationKey)}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-100' : 'text-indigo-300'}`} />
                    {(sidebarOpen || isMobile) && (
                      <span className="ml-3.5 text-sm font-medium tracking-wide">{t(item.label as TranslationKey)}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        {(sidebarOpen || isMobile) ? (
          <div className="p-4 border-t border-indigo-800/80 bg-indigo-950/40 shrink-0">
            <p className="font-semibold text-white text-xs truncate">{appName} v{appVersion}</p>
            <p className="text-indigo-300/80 text-[10px] truncate mt-0.5">by SoftDows</p>
          </div>
        ) : (
          <div className="p-3 border-t border-indigo-800/80 text-center text-[10px] text-indigo-400 font-medium shrink-0">
            v{appVersion}
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 z-10 shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h2 className="font-bold text-slate-800 leading-tight text-sm sm:text-base truncate max-w-[180px] xs:max-w-[240px] sm:max-w-none">
                {language === 'bn' && institution.nameBn ? institution.nameBn : institution.name}
              </h2>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium hidden sm:block">EIIN: {institution.eiin}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Update Alert Notification Pill if new version found */}
            {hasUpdate && latestRelease && (
              <button
                onClick={openUpdateModal}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold py-1.5 px-3 rounded-xl shadow-md flex items-center gap-1.5 animate-bounce"
                title={isBn ? `নতুন আপডেট v${latestRelease.version} পাওয়া গেছে` : `New update v${latestRelease.version} available`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{isBn ? `আপডেট v${latestRelease.version}` : `Update v${latestRelease.version}`}</span>
                <span className="sm:hidden">Update</span>
              </button>
            )}

            {/* Language Toggle */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 shadow-sm">
              <button
                onClick={() => setLanguage('bn')}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-all ${
                  language === 'bn' 
                    ? 'bg-white shadow-sm text-indigo-700 font-bold' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 text-xs sm:text-sm rounded-lg font-medium transition-all ${
                  language === 'en' 
                    ? 'bg-white shadow-sm text-indigo-700 font-bold' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </header>

        {/* Smart Non-Intrusive GitHub Update Notification Banner */}
        {hasUpdate && latestRelease && !bannerDismissed && (
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs shrink-0 border-b border-indigo-500/30">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <BellRing className="w-4 h-4 text-amber-300 shrink-0" />
              <p className="truncate">
                <strong className="text-amber-300">{isBn ? 'নতুন ভার্সন রিলিজ হয়েছে:' : 'New Release Available:'}</strong> {latestRelease.name} (v{latestRelease.version}) — {isBn ? 'আপনার ডেটা অক্ষত রেখে সরাসরি ইন-অ্যাপ আপডেট করুন।' : 'Zero data loss in-app update ready.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={openUpdateModal}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1 shadow"
              >
                <Download className="w-3 h-3" />
                <span>{isBn ? 'আপডেট দেখুন' : 'Update Now'}</span>
              </button>
              <button
                onClick={dismissBanner}
                className="text-slate-400 hover:text-white p-1 transition-colors"
                title={isBn ? 'হাইড করুন' : 'Dismiss'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>

        {/* Universal In-App Update Modal */}
        <UniversalUpdateModal
          isOpen={isUpdateModalOpen}
          onClose={closeUpdateModal}
        />

        {/* Support Modal & Floating Support Widget */}
        <SupportModal
          isOpen={supportModalOpen}
          onClose={() => setSupportModalOpen(false)}
          initialTopic={supportTopic}
        />
        
        <FloatingSupportWidget
          onOpenSupportModal={handleOpenSupport}
        />

        {/* Mobile Bottom Navigation */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-[72px] pb-safe z-40 lg:hidden shadow-[0_-8px_20px_-10px_rgba(0,0,0,0.1)]">
            <Link to="/" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              <LayoutDashboard className={`w-5 h-5 ${location.pathname === '/' ? 'fill-indigo-50' : ''}`} />
              <span className="text-[10px] font-medium">{t('dashboard')}</span>
            </Link>
            <Link to="/students" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname.startsWith('/students') ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              <Users className={`w-5 h-5 ${location.pathname.startsWith('/students') ? 'fill-indigo-50' : ''}`} />
              <span className="text-[10px] font-medium">{t('students')}</span>
            </Link>
            <Link to="/academic" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/academic' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              <BookOpen className={`w-5 h-5 ${location.pathname === '/academic' ? 'fill-indigo-50' : ''}`} />
              <span className="text-[10px] font-medium">{t('academic')}</span>
            </Link>
            <Link to="/finance" className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${location.pathname === '/finance' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}>
              <Wallet className={`w-5 h-5 ${location.pathname === '/finance' ? 'fill-indigo-50' : ''}`} />
              <span className="text-[10px] font-medium">{t('finance')}</span>
            </Link>
            <button onClick={() => setSidebarOpen(true)} className="flex flex-col items-center justify-center w-full h-full space-y-1 text-slate-500 hover:text-slate-800 hover:bg-slate-50">
              <Menu className="w-5 h-5" />
              <span className="text-[10px] font-medium">{language === 'bn' ? 'মেনু' : 'Menu'}</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Layout;
