import React from 'react';
import { BrandLogo } from '../components/BrandLogo';
import { Button } from '../components/Button';
import { BRAND_CONTENT } from '../data/cakedayData';
import type { AppPage } from '../types';
import { scrollToSection } from '../utils/cn';

interface MainLayoutProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentPage,
  onNavigate,
  children,
}) => {
  const handleSectionLink = (sectionId: string) => {
    if (currentPage !== 'home') {
      onNavigate('home');
      window.setTimeout(() => scrollToSection(sectionId), 60);
      return;
    }
    scrollToSection(sectionId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#493B32]">
      <header className="sticky top-0 z-30 h-14 md:h-16 bg-[#FAF8F3]/95 backdrop-blur-md border-b border-[#E9DFD0]">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
          <BrandLogo onClick={() => onNavigate('home')} />

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
                onClick={() => onNavigate('login')}
              >
                로그인
              </Button>
            ) : (
              <Button
                variant="outline"
                size="md"
                onClick={() => onNavigate('home')}
              >
                홈으로
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-[#E9DFD0] bg-[#FAF8F3]">
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
