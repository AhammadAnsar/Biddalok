/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useAppStore } from './store/useAppStore';
import Login from './pages/Login';
import OnboardingWizard from './pages/OnboardingWizard';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InstitutionSettings from './pages/InstitutionSettings';
import StudentsHome from './pages/StudentsHome';
import Students from './pages/Students';
import AdmissionEnrollment from './pages/AdmissionEnrollment';
import Academic from './pages/Academic';
import HumanResources from './pages/HumanResources';
import Administration from './pages/Administration';
import Finance from './pages/Finance';
import Institution from './pages/Institution';
import Activities from './pages/Activities';
import Website from './pages/Website';
import Reports from './pages/Reports';
import SystemAdmin from './pages/SystemAdmin';
import Support from './pages/Support';
import Testimonial from './pages/Testimonial';
import ClassAndSection from './pages/ClassAndSection';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  const { isOnboarded, isAuthenticated } = useAuthStore();

  const { whiteLabel, institution } = useAppStore();

  React.useEffect(() => {
    const appName = whiteLabel?.enabled && whiteLabel.appName ? whiteLabel.appName : (institution?.name || 'Biddalok ERP');
    const appIcon = whiteLabel?.enabled && whiteLabel.appIcon ? whiteLabel.appIcon : (institution?.logoUrl || './icon.svg');
    
    document.title = appName;
    
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = appIcon;
  }, [whiteLabel, institution]);


  if (!isOnboarded) {
    return <OnboardingWizard />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/institution" element={<Institution />} />
            <Route path="/institution/settings" element={<InstitutionSettings />} />
            
            <Route path="/students" element={<StudentsHome />} />
            <Route path="/students/admission" element={<AdmissionEnrollment />} />
            <Route path="/students/list" element={<Students />} />
            
            <Route path="/testimonial" element={<Testimonial />} />
            <Route path="/academic" element={<Academic />} />
            <Route path="/academic/class-section" element={<ClassAndSection />} />
            <Route path="/hr" element={<HumanResources />} />
            <Route path="/administration" element={<Administration />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/website" element={<Website />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/system" element={<SystemAdmin />} />
            <Route path="/support" element={<Support />} />
          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}
