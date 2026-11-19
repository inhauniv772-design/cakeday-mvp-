import React, { useCallback, useEffect, useState } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { ModeSelectPage } from './pages/ModeSelectPage';
import { ModeWorkspacePage } from './pages/ModeWorkspacePage';
import { SignupPage } from './pages/SignupPage';
import type { AppPage, UserAccount, UserRole } from './types';
import { hasRole } from './utils/auth';

function resolveInitialPage(): AppPage {
  const hash = window.location.hash.replace('#/', '').trim();
  if (hash === 'login' || hash === 'signup') {
    return hash;
  }
  if (hash === 'mode-select' || hash === 'consumer' || hash === 'seller') {
    return 'login';
  }
  return 'home';
}

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<AppPage>(resolveInitialPage);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<UserAccount[]>([]);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [sessionNotice, setSessionNotice] = useState<string | null>(null);

  const syncUrl = useCallback((page: AppPage) => {
    const nextHash = page === 'home' ? '' : `#/${page}`;
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, '', nextHash || window.location.pathname);
    }
  }, []);

  const handleNavigate = useCallback(
    (page: AppPage) => {
      const requiresAuth =
        page === 'mode-select' || page === 'consumer' || page === 'seller';

      if (requiresAuth && !currentUser) {
        setAuthNotice('로그인 후 이용할 수 있는 화면입니다.');
        setCurrentPage('login');
        syncUrl('login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (page === 'consumer' || page === 'seller') {
        if (currentUser && hasRole(currentUser, page)) {
          setCurrentUser((prev) =>
            prev ? { ...prev, currentMode: page } : null
          );
        }
      }

      setAuthNotice(null);
      setCurrentPage(page);
      syncUrl(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [currentUser, syncUrl]
  );

  useEffect(() => {
    const handleHashChange = () => {
      const target = resolveInitialPage();
      const requiresAuth =
        target === 'mode-select' || target === 'consumer' || target === 'seller';
      if (requiresAuth && !currentUser) {
        setAuthNotice('로그인 후 이용할 수 있는 화면입니다.');
        setCurrentPage('login');
        return;
      }
      setCurrentPage(target);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  const handleLoginSuccess = useCallback(
    (account: UserAccount, notice?: string) => {
      setCurrentUser({
        ...account,
        currentMode: null,
      });
      setAuthNotice(null);
      setSessionNotice(notice ?? null);
      setCurrentPage('mode-select');
      syncUrl('mode-select');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [syncUrl]
  );

  const handleSignupComplete = useCallback(
    (newUser: UserAccount, notice: string) => {
      setRegisteredUsers((prev) => [...prev, newUser]);
      setCurrentUser({
        ...newUser,
        currentMode: null,
      });
      setAuthNotice(null);
      setSessionNotice(notice);
      setCurrentPage('mode-select');
      syncUrl('mode-select');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [syncUrl]
  );

  const handleSelectMode = useCallback(
    (targetMode: UserRole): boolean => {
      if (!currentUser || !hasRole(currentUser, targetMode)) {
        return false;
      }

      setCurrentUser((prev) =>
        prev ? { ...prev, currentMode: targetMode } : null
      );
      setSessionNotice(null);
      setCurrentPage(targetMode);
      syncUrl(targetMode);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return true;
    },
    [currentUser, syncUrl]
  );

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setSessionNotice(null);
    setAuthNotice('로그아웃되었습니다.');
    setCurrentPage('login');
    syncUrl('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [syncUrl]);

  const renderPage = () => {
    if (currentPage === 'login') {
      return (
        <LoginPage
          registeredUsers={registeredUsers}
          redirectNotice={authNotice}
          onNavigate={handleNavigate}
          onLoginSuccess={handleLoginSuccess}
        />
      );
    }

    if (currentPage === 'signup') {
      return (
        <SignupPage
          registeredUsers={registeredUsers}
          onNavigate={handleNavigate}
          onSignupComplete={handleSignupComplete}
        />
      );
    }

    if (currentPage === 'mode-select' && currentUser) {
      return (
        <ModeSelectPage
          user={currentUser}
          sessionNotice={sessionNotice}
          onSelectMode={handleSelectMode}
        />
      );
    }

    if (
      (currentPage === 'consumer' || currentPage === 'seller') &&
      currentUser
    ) {
      return (
        <ModeWorkspacePage
          mode={currentPage}
          user={currentUser}
          onNavigate={handleNavigate}
          onSwitchMode={handleSelectMode}
        />
      );
    }

    return <HomePage currentUser={currentUser} onNavigate={handleNavigate} />;
  };

  return (
    <MainLayout
      currentPage={currentPage}
      currentUser={currentUser}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderPage()}
    </MainLayout>
  );
};

export default App;
