/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/useAuthStore';
import { useAppStore } from './store/useAppStore';
import { Role } from './types';
import Login from './pages/Login';
import OnboardingWizard from './pages/OnboardingWizard';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import { RouteLoadingFallback } from './components/common/RouteLoadingFallback';
import { ErrorBoundary } from './components/ErrorBoundary';
import { lazyWithRetry } from './utils/lazyWithRetry';

// Public Landing & Compliance Pages (Cloudflare Web Edition)
import { LandingPage } from './landing/LandingPage';
import { PrivacyPolicyPage } from './landing/PrivacyPolicyPage';
import { TermsPage } from './landing/TermsPage';
import { AboutPage } from './landing/AboutPage';
import { ContactPage } from './landing/ContactPage';

// Route-Level Lazy Loading for Secondary Management Pages
const Institution = lazyWithRetry(() => import('./pages/Institution'));
const InstitutionSettings = lazyWithRetry(() => import('./pages/InstitutionSettings'));
const MasterDataSettingsPage = lazyWithRetry(() => import('./pages/MasterDataSettings'));
const AddressManagement = lazyWithRetry(() => import('./pages/AddressManagement'));

const StudentsHome = lazyWithRetry(() => import('./pages/StudentsHome'));
const AdmissionEnrollment = lazyWithRetry(() => import('./pages/AdmissionEnrollment'));
const Students = lazyWithRetry(() => import('./pages/Students'));
const StudentAttendanceWorkspace = lazyWithRetry(() => import('./pages/students/StudentAttendanceWorkspace'));
const GuardianWorkspace = lazyWithRetry(() => import('./pages/students/GuardianWorkspace'));
const StudentFollowup = lazyWithRetry(() => import('./pages/students/followup/StudentFollowup'));
const StudentIdCard = lazyWithRetry(() => import('./pages/StudentIdCard').then(m => ({ default: m.StudentIdCard })));
const ScholarshipsHome = lazyWithRetry(() => import('./pages/scholarships/ScholarshipsHome'));

const Testimonial = lazyWithRetry(() => import('./pages/Testimonial'));
const Communication = lazyWithRetry(() => import('./pages/communication/Communication'));

const Academic = lazyWithRetry(() => import('./pages/Academic'));
const ClassAndSection = lazyWithRetry(() => import('./pages/ClassAndSection'));
const Curriculum = lazyWithRetry(() => import('./pages/academic/Curriculum'));

const ExamHome = lazyWithRetry(() => import('./pages/exam/ExamHome'));

const HumanResources = lazyWithRetry(() => import('./pages/HumanResources'));
const CommitteeModule = lazyWithRetry(() => import('./pages/committee/CommitteeModule'));

const Administration = lazyWithRetry(() => import('./pages/Administration'));
const Finance = lazyWithRetry(() => import('./pages/Finance'));
const SystemAdmin = lazyWithRetry(() => import('./pages/SystemAdmin'));
const MigrationHub = lazyWithRetry(() => import('./pages/MigrationHub').then(m => ({ default: m.MigrationHub })));
const Support = lazyWithRetry(() => import('./pages/Support'));

const Activities = lazyWithRetry(() => import('./pages/Activities'));
const Website = lazyWithRetry(() => import('./pages/Website'));
const Reports = lazyWithRetry(() => import('./pages/Reports'));

const TestimonialVerificationPage = lazyWithRetry(() => import('./pages/TestimonialVerificationPage'));
const PlannedModuleView = lazyWithRetry(() => import('./components/common/PlannedModuleView').then(m => ({ default: m.PlannedModuleView })));

const RequireRole: React.FC<{ children: React.ReactNode; allowedRoles: Role[] }> = ({ children, allowedRoles }) => {
  const { activeRole, currentUser, isAuthenticated } = useAuthStore();
  const { designationPermissions } = useAppStore();
  const location = useLocation();

  if (!isAuthenticated || !activeRole || !allowedRoles.includes(activeRole)) {
    return <Navigate to="/login" replace />;
  }

  if (activeRole !== 'super_admin' && currentUser) {
    let activeModules: string[] | undefined = currentUser.allowedModules;

    if (!activeModules && currentUser.designationId) {
      const dp = designationPermissions?.find(p => p.designationId === currentUser.designationId);
      if (dp) activeModules = dp.allowedModules;
    }

    if (activeModules) {
      const path = location.pathname;
      let requiredModuleId = '';

      if (path.startsWith('/students')) requiredModuleId = 'students';
      else if (path.startsWith('/academic')) requiredModuleId = 'academic';
      else if (path.startsWith('/exam')) requiredModuleId = 'examination';
      else if (path.startsWith('/testimonial')) requiredModuleId = 'testimonial';
      else if (path.startsWith('/hr')) requiredModuleId = 'hr';
      else if (path.startsWith('/committee')) requiredModuleId = 'committee';
      else if (path.startsWith('/institution')) requiredModuleId = 'institution';
      else if (path.startsWith('/system')) requiredModuleId = 'system';
      else if (path === '/dashboard') requiredModuleId = 'dashboard';

      if (requiredModuleId && !activeModules.includes(requiredModuleId) && !(requiredModuleId === 'committee' && activeModules.includes('hr'))) {
        return (
          <div className="flex h-[calc(100vh-64px)] items-center justify-center p-8">
            <div className="bg-white rounded-xl shadow-sm border border-rose-200 p-8 max-w-md text-center space-y-4">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">অ্যাক্সেস সংরক্ষিত</h2>
              <p className="text-sm text-slate-500">আপনার পদবি বা রোলের জন্য এই মডিউলটিতে প্রবেশের অনুমতি নেই। সিস্টেম অ্যাডমিন বা প্রতিষ্ঠান প্রধানের সাথে যোগাযোগ করুন।</p>
            </div>
          </div>
        );
      }
    }
  }

  return <>{children}</>;
};

export default function App() {
  const { _hasHydrated, isOnboarded, isAuthenticated, setHasHydrated } = useAuthStore();

  React.useEffect(() => {
    if (!_hasHydrated) {
      const timer = setTimeout(() => {
        setHasHydrated(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [_hasHydrated, setHasHydrated]);

  const whiteLabel = useAppStore(state => state.whiteLabel);
  const institution = useAppStore(state => state.institution);
  const systemFontSettings = useAppStore(state => state.systemFontSettings);

  React.useEffect(() => {
    const bnFont = systemFontSettings?.defaultBengaliFont || "Kalpurush";
    const enFont = systemFontSettings?.defaultEnglishFont || "Inter";

    const root = document.documentElement;
    root.style.setProperty("--font-bengali", `"${bnFont}", "Hind Siliguri", "Noto Sans Bengali", sans-serif`);
    root.style.setProperty("--font-english", `"${enFont}", "Roboto", -apple-system, sans-serif`);

    document.body.style.fontFamily = `"${bnFont}", "${enFont}", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  }, [systemFontSettings]);

  React.useEffect(() => {
    import('./db/startupOrchestrator').then(m => m.startupOrchestrator.runStartupSequence());
  }, []);

  React.useEffect(() => {
    const appName = whiteLabel?.enabled && whiteLabel.appName ? whiteLabel.appName : (institution?.name || 'বিদ্যালোক — Biddalok ERP');
    const appIcon = whiteLabel?.enabled && whiteLabel.appIcon ? whiteLabel.appIcon : (institution?.logoUrl || '/icon.png');
    
    document.title = appName;
    
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = appIcon;
  }, [whiteLabel, institution]);

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
          <div className="text-slate-400 font-medium text-sm">বিদ্যালোক লোড হচ্ছে...</div>
        </div>
      </div>
    );
  }

  // Root Entry Resolver:
  // First time visitor -> LandingPage
  // Returning onboarded user -> /login
  // Authenticated user -> /dashboard
  const renderRoot = () => {
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    if (isOnboarded) {
      return <Navigate to="/login" replace />;
    }
    return <LandingPage />;
  };

  // App Entry Resolver: handles `/app` gateway
  const renderAppGateway = () => {
    if (!isOnboarded) {
      return (
        <ErrorBoundary>
          <OnboardingWizard />
        </ErrorBoundary>
      );
    }
    if (!isAuthenticated) {
      return (
        <ErrorBoundary>
          <Login />
        </ErrorBoundary>
      );
    }
    return <Navigate to="/dashboard" replace />;
  };

  return (
    <ErrorBoundary>
      <Toaster 
        position="top-right" 
        gutter={8}
        containerStyle={{
          top: 24,
          right: 24,
          zIndex: 999999,
        }}
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "'Hind Siliguri', 'Noto Sans Bengali', system-ui, sans-serif",
            fontSize: '13.5px',
            fontWeight: 500,
            borderRadius: '12px',
            padding: '12px 18px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0',
            color: '#1e293b',
            background: '#ffffff',
          },
          success: {
            duration: 3500,
            iconTheme: {
              primary: '#059669',
              secondary: '#ffffff',
            },
            style: {
              borderLeft: '4px solid #059669',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#e11d48',
              secondary: '#ffffff',
            },
            style: {
              borderLeft: '4px solid #e11d48',
            },
          },
        }}
      />
      <Router>
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            {/* 1. Public Landing & Information Pages */}
            <Route path="/" element={renderRoot()} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* 2. Authentication & Gateway Gateways */}
            <Route path="/app" element={renderAppGateway()} />
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : (!isOnboarded ? <OnboardingWizard /> : <Login />)} />
            <Route path="/onboarding" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <OnboardingWizard />} />

            {/* 3. Public Verification Routes (No login required) */}
            <Route path="/verify/testimonial" element={<TestimonialVerificationPage />} />
            <Route path="/verify/testimonial/:token" element={<TestimonialVerificationPage />} />

            {/* 4. Authenticated Institutional Management Routes (Wrapped in Layout) */}
            <Route
              path="/*"
              element={
                !isAuthenticated ? (
                  <Navigate to="/login" replace />
                ) : (
                  <Layout>
                    <Suspense fallback={<RouteLoadingFallback />}>
                      <Routes>
                        <Route path="/dashboard" element={<Dashboard />} />
                        
                        {/* Institution Routes - Admins Only */}
                        <Route path="/institution" element={<RequireRole allowedRoles={['super_admin', 'admin']}><Institution /></RequireRole>} />
                        <Route path="/institution/settings" element={<RequireRole allowedRoles={['super_admin']}><InstitutionSettings /></RequireRole>} />
                        <Route path="/institution/master-data" element={<RequireRole allowedRoles={['super_admin', 'admin']}><MasterDataSettingsPage /></RequireRole>} />
                        <Route path="/institution/bank-payment" element={<Navigate to="/institution/master-data" replace />} />
                        <Route path="/institution/address" element={<RequireRole allowedRoles={['super_admin']}><AddressManagement /></RequireRole>} />
                        <Route path="/system/master-data" element={<Navigate to="/institution/master-data" replace />} />
                        
                        {/* Student Routes */}
                        <Route path="/students" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher', 'accountant']}><StudentsHome /></RequireRole>} />
                        <Route path="/students/admission" element={<RequireRole allowedRoles={['super_admin', 'admin']}><AdmissionEnrollment /></RequireRole>} />
                        <Route path="/students/list" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher', 'accountant']}><Students /></RequireRole>} />
                        <Route path="/students/attendance" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher']}><StudentAttendanceWorkspace /></RequireRole>} />
                        <Route path="/students/guardian" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher', 'accountant']}><GuardianWorkspace /></RequireRole>} />
                        <Route path="/students/followup" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher']}><StudentFollowup /></RequireRole>} />
                        <Route path="/students/followup/*" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher']}><StudentFollowup /></RequireRole>} />
                        <Route path="/students/id-card" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher', 'accountant', 'staff']}><StudentIdCard /></RequireRole>} />
                        <Route path="/students/scholarships" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher']}><ScholarshipsHome /></RequireRole>} />
                        
                        {/* Testimonial & Communication */}
                        <Route path="/testimonial" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher']}><Testimonial /></RequireRole>} />
                        <Route path="/communication" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher']}><Communication /></RequireRole>} />
                        
                        {/* Academic - Teachers & Admins */}
                        <Route path="/academic" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher']}><Academic /></RequireRole>} />
                        <Route path="/academic/class-section" element={<RequireRole allowedRoles={['super_admin', 'admin']}><ClassAndSection /></RequireRole>} />
                        <Route path="/academic/curriculum" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher']}><Curriculum /></RequireRole>} />

                        {/* Examination Module */}
                        <Route path="/exam" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher']}><ExamHome /></RequireRole>} />
                        <Route path="/exam/settings" element={<Navigate to="/exam?tab=settings" replace />} />
                        <Route path="/exam/routine" element={<Navigate to="/exam?tab=routine" replace />} />
                        <Route path="/exam/admit-card" element={<Navigate to="/exam?tab=admit-card" replace />} />
                        <Route path="/exam/seat-planning" element={<Navigate to="/exam?tab=seat-planning" replace />} />
                        <Route path="/exam/seat-plan" element={<Navigate to="/exam?tab=seat-planning" replace />} />
                        <Route path="/exam/results" element={<Navigate to="/exam?tab=results" replace />} />
                        <Route path="/exam/certificates" element={<Navigate to="/exam?tab=certificates" replace />} />
                        
                        {/* HR / Admin / Finance */}
                        <Route path="/hr" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher', 'accountant']}><HumanResources /></RequireRole>} />
                        <Route path="/hr/staff" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher', 'accountant']}><HumanResources /></RequireRole>} />
                        <Route path="/hr/committee" element={<Navigate to="/committee" replace />} />
                        <Route path="/hr/*" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher', 'accountant']}><HumanResources /></RequireRole>} />

                        {/* Managing Committee Module */}
                        <Route path="/committee" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher', 'staff']}><CommitteeModule /></RequireRole>} />
                        <Route path="/committee/*" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher', 'staff']}><CommitteeModule /></RequireRole>} />
                        
                        <Route path="/administration" element={<RequireRole allowedRoles={['super_admin', 'admin']}><Administration /></RequireRole>} />
                        <Route path="/finance" element={<RequireRole allowedRoles={['super_admin', 'admin', 'accountant']}><Finance /></RequireRole>} />
                        
                        {/* System Admin */}
                        <Route path="/system" element={<RequireRole allowedRoles={['super_admin']}><SystemAdmin /></RequireRole>} />
                        <Route path="/migration" element={<RequireRole allowedRoles={['super_admin']}><MigrationHub /></RequireRole>} />
                        
                        {/* Support & Others */}
                        <Route path="/support" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher', 'accountant']}><Support /></RequireRole>} />
                        <Route path="/activities" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher']}><Activities /></RequireRole>} />
                        <Route path="/website" element={<RequireRole allowedRoles={['super_admin', 'admin']}><Website /></RequireRole>} />
                        <Route path="/reports" element={<RequireRole allowedRoles={['super_admin', 'admin', 'teacher', 'accountant']}><Reports /></RequireRole>} />

                        {/* Planned Roadmap Views */}
                        <Route path="/planned/:moduleId" element={<PlannedModuleView />} />
                        <Route path="/roadmap/:moduleId" element={<PlannedModuleView />} />

                        {/* Fallback inside authenticated app */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                )
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}
