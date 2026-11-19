import React, { useCallback, useEffect, useState } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import type { AppPage, UserRole } from './types';

function resolveInitialPage(): AppPage {
  const hash = window.location.hash.replace('#/', '').trim();
  if (hash === 'login' || hash === 'signup') {
    return hash;
  }
  return 'home';
}

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppPage>(resolveInitialPage);
  const [presetRole, setPresetRole] = useState<UserRole>('consumer');

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(resolveInitialPage());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = useCallback((page: AppPage, role?: UserRole) => {
    if (role) {
      setPresetRole(role);
    }
    setCurrentPage(page);
    const nextHash = page === 'home' ? '' : `#/${page}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, '', nextHash || window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <MainLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {currentPage === 'home' && <HomePage onNavigate={handleNavigate} />}
      {currentPage === 'login' && (
        <LoginPage initialRole={presetRole} onNavigate={handleNavigate} />
      )}
      {currentPage === 'signup' && (
        <SignupPage initialRole={presetRole} onNavigate={handleNavigate} />
      )}
    </MainLayout>
  );
};

export default App;
