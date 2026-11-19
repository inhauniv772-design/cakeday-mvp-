import React from 'react';
import { ArrowLeftRight, LogOut } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/Button';
import { BRAND_CONTENT } from '../data/cakedayData';
import type { AppPage, UserAccount } from '../types';
import { canSwitchModes, formatRolesSummary, getModeDisplayName } from '../utils/auth';
import { scrollToSection } from '../utils/cn';

interface MainLayoutProps {
  currentPage: AppPage;
  currentUser: UserAccount | null;
  onNavigate: (page: AppPage) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentPage,
  currentUser,
  onNavigate,
  onLogout,
  children,
}) => {
  const isDualRole = canSwitchModes(currentUser);

  const handleSectionLink = (sectionId: string) => {
    if (currentPage !== 'home') {
      onNavigate('home');
      window.setTimeout(() => scrollToSection(sectionId), 60);
      return;
    }
    scrollToSection(sectionId);
  };

  const handleBrandClick = () => {
    if (currentUser) {
      onNavigate(currentUser.currentMode ?? 'mode-select');
      return;
    }
    onNavigate('home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#493B32]">
      <header className="sticky top-0 z-30 h-12 sm:h-14 md:h-16 bg-[#FAF8F3]/95 backdrop-blur-md border-b border-[#E9DFD0]">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-2 sm:gap-8 px-3 sm:px-6 lg:px-8">
          <BrandLogo size="sm" onClick={handleBrandClick} className="sm:hidden" />
          <BrandLogo onClick={handleBrandClick} className="hidden sm:inline-flex" />

          {currentUser ? (
            <>
              <div className="hidden md:flex items-center gap-2.5 text-sm text-[#6E5C50] whitespace-nowrap">
                <span className="font-medium text-[#493B32]">{currentUser.name}님</span>
                <span aria-hidden="true">·</span>
                <span className="font-medium text-[#8F6849]">
                  {getModeDisplayName(currentUser.currentMode)}
                </span>
                <span aria-hidden="true">·</span>
                <span>권한: {formatRolesSummary(currentUser.roles)}</span>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {isDualRole && (
                  <Button
                    variant="secondary"
                    size="md"
                    className="min-h-[40px] sm:min-h-[44px] px-3 sm:px-5 text-xs sm:text-sm"
                    onClick={() => onNavigate('mode-select')}
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                    <span>모드 전환</span>
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="md"
                  className="min-h-[40px] sm:min-h-[44px] px-3 sm:px-5 text-xs sm:text-sm"
                  onClick={onLogout}
                >
                  <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span>로그아웃</span>
                </Button>
              </div>
            </>
          ) : (
            <>
              <nav
                aria-label="주요 메뉴"
                className="hidden md:flex items-center gap-6 text-sm font-medium text-[#6E5C50]"
              >
                <button
                  type="button"
                  onClick={() => handleSectionLink('service-intro')}
                  className="min-h-[44px] px-1 hover:text-[#493B32] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  서비스 소개
                </button>
                <button
                  type="button"
                  onClick={() => handleSectionLink('user-roles')}
                  className="min-h-[44px] px-1 hover:text-[#493B32] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  이용 안내
                </button>
                <button
                  type="button"
                  onClick={() => handleSectionLink('get-started')}
                  className="min-h-[44px] px-1 hover:text-[#493B32] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  사전 안내
                </button>
              </nav>

              <div className="flex items-center shrink-0">
                {currentPage === 'home' ? (
                  <Button
                    variant="primary"
                    size="md"
                    className="min-h-[40px] sm:min-h-[44px]"
                    onClick={() => onNavigate('login')}
                  >
                    로그인
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="md"
                    className="min-h-[40px] sm:min-h-[44px]"
                    onClick={() => onNavigate('home')}
                  >
                    홈으로
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </header>

      {currentUser && (
        <div className="md:hidden border-b border-[#E9DFD0] bg-[#E9DFD0]/40">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-1.5 text-xs sm:text-sm">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[#6E5C50]">
              <span className="font-semibold text-[#493B32]">{currentUser.name}님</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-[#8F6849]">
                {getModeDisplayName(currentUser.currentMode)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('mode-select')}
              className="min-h-[44px] px-2.5 font-medium text-[#8F6849] hover:text-[#493B32] whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isDualRole ? '모드 선택 화면' : '권한 정보'}
            </button>
          </div>
        </div>
      )}

      <main className="flex-1">{children}</main>

      <footer
        className={`border-t border-[#E9DFD0] bg-[#FAF8F3] ${
          currentUser && currentPage === 'consumer' ? 'pb-16 md:pb-0' : ''
        }`}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-12">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <BrandLogo size="sm" onClick={() => onNavigate('home')} />
              <p className="text-sm text-[#6E5C50]">{BRAND_CONTENT.slogan}</p>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#6E5C50]">
              <button
                type="button"
                onClick={() => handleSectionLink('service-intro')}
                className="min-h-[44px] hover:text-[#493B32] transition-colors whitespace-nowrap cursor-pointer"
              >
                서비스 소개
              </button>
              <button
                type="button"
                onClick={() => handleSectionLink('user-roles')}
                className="min-h-[44px] hover:text-[#493B32] transition-colors whitespace-nowrap cursor-pointer"
              >
                이용 안내
              </button>
              {currentUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigate('mode-select')}
                    className="min-h-[44px] hover:text-[#493B32] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    모드 선택
                  </button>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="min-h-[44px] hover:text-[#493B32] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onNavigate('login')}
                    className="min-h-[44px] hover:text-[#493B32] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    로그인
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('signup')}
                    className="min-h-[44px] hover:text-[#493B32] transition-colors whitespace-nowrap cursor-pointer"
                  >
                    회원가입
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="mt-8 border-t border-[#E9DFD0] pt-6 text-xs text-[#6E5C50]">
            {BRAND_CONTENT.copyright}
          </div>
        </div>
      </footer>
    </div>
  );
};
