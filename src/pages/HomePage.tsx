import React, { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SafeImage } from '../components/SafeImage';
import {
  BRAND_CONTENT,
  CORE_VALUE_MEDIA,
  HERO_MEDIA,
  ROLE_GUIDES,
  SERVICE_HIGHLIGHTS,
} from '../data/cakedayData';
import type { AppPage, RoleFilter, UserAccount } from '../types';
import { cn } from '../utils/cn';

interface HomePageProps {
  currentUser: UserAccount | null;
  onNavigate: (page: AppPage) => void;
}

const ROLE_FILTER_TABS: Array<{ id: RoleFilter; label: string }> = [
  { id: 'all', label: '전체 보기' },
  { id: 'consumer', label: '소비자' },
  { id: 'seller', label: '판매자' },
];

export const HomePage: React.FC<HomePageProps> = ({ currentUser, onNavigate }) => {
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const visibleRoleGuides =
    roleFilter === 'all'
      ? ROLE_GUIDES
      : ROLE_GUIDES.filter((item) => item.role === roleFilter);

  return (
    <div>
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-8 pb-14 md:pt-14 md:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-sm font-medium text-[#8F6849] tracking-tight">
              {BRAND_CONTENT.kicker}
            </p>

            <h1 className="mt-3 text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.2] tracking-tight text-[#493B32] [text-wrap:balance]">
              {BRAND_CONTENT.slogan}
            </h1>

            <p className="mt-5 text-base sm:text-lg text-[#6E5C50] leading-relaxed max-w-xl">
              {BRAND_CONTENT.heroDescription}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:items-center">
              {currentUser ? (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => onNavigate('mode-select')}
                  >
                    모드 선택 화면으로 이동
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  {currentUser.currentMode && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => onNavigate(currentUser.currentMode!)}
                    >
                      {currentUser.currentMode === 'consumer'
                        ? '소비자 모드 바로가기'
                        : '판매자 모드 바로가기'}
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => onNavigate('signup')}
                  >
                    회원가입
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => onNavigate('login')}
                  >
                    로그인
                  </Button>
                </>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#6E5C50]">
              <span>소비자 사전 예약</span>
              <span aria-hidden="true">·</span>
              <span>커스텀 케이크 전문점 연결</span>
              <span aria-hidden="true">·</span>
              <span>계정별 권한 모드 지원</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <SafeImage
              src={HERO_MEDIA.src}
              alt={HERO_MEDIA.alt}
              containerClassName="aspect-[4/3] lg:aspect-auto lg:h-full w-full min-h-[260px] lg:min-h-[420px] border border-[#E9DFD0]"
              fallbackTitle="CakeDay 커스텀 케이크"
            />
          </div>
        </div>
      </section>

      {/* Core Value Section */}
      <section
        id="service-intro"
        className="border-t border-[#E9DFD0] bg-[#FFFFFF]/65 py-14 md:py-20 scroll-mt-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <SafeImage
                src={CORE_VALUE_MEDIA.src}
                alt={CORE_VALUE_MEDIA.alt}
                containerClassName="aspect-[4/3] lg:aspect-auto lg:h-full w-full min-h-[240px] lg:min-h-[400px] border border-[#E9DFD0]"
                fallbackTitle="미리 준비하는 기념일 케이크"
              />
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col justify-center">
              <p className="text-sm font-medium text-[#8F6849]">서비스 핵심 가치</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#493B32] [text-wrap:balance]">
                {BRAND_CONTENT.coreMessageTitle}
              </h2>
              <p className="mt-4 text-base text-[#6E5C50] leading-relaxed max-w-2xl">
                {BRAND_CONTENT.coreMessageBody}
              </p>

              <div className="mt-8 divide-y divide-[#E9DFD0] border-t border-b border-[#E9DFD0]">
                {SERVICE_HIGHLIGHTS.map((item) => (
                  <div
                    key={item.id}
                    className="py-5 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-5"
                  >
                    <span className="font-[var(--font-display)] text-lg font-semibold text-[#B58C6A] tabular-nums shrink-0">
                      {item.orderLabel}.
                    </span>
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-[#493B32]">
                        {item.title}
                      </h3>
                      <p className="mt-1.5 text-sm sm:text-base text-[#6E5C50] leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Consumer & Seller Guide Section */}
      <section
        id="user-roles"
        className="border-t border-[#E9DFD0] py-14 md:py-20 scroll-mt-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-sm font-medium text-[#8F6849]">함께하는 사람들</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#493B32] [text-wrap:balance]">
                소비자와 판매자 모두를 위한 플랫폼
              </h2>
              <p className="mt-3 text-base text-[#6E5C50] max-w-2xl">
                하나의 계정으로 부여된 권한에 따라 소비자 모드와 판매자 모드를 이용할 수 있습니다.
              </p>
            </div>

            <div
              role="tablist"
              aria-label="이용 대상 필터"
              className="inline-flex items-center gap-1 rounded-2xl bg-[#E9DFD0]/70 p-1 self-start md:self-auto"
            >
              {ROLE_FILTER_TABS.map((tab) => {
                const isActive = roleFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setRoleFilter(tab.id)}
                    className={cn(
                      'min-h-[44px] px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer',
                      isActive
                        ? 'bg-[#FFFFFF] text-[#493B32] shadow-sm shadow-[#493B32]/5'
                        : 'text-[#6E5C50] hover:text-[#493B32]'
                    )}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={cn(
              'mt-10 grid gap-6 lg:gap-8',
              visibleRoleGuides.length === 1
                ? 'grid-cols-1 max-w-2xl'
                : 'grid-cols-1 md:grid-cols-2'
            )}
          >
            {visibleRoleGuides.map((guide) => (
              <Card
                key={guide.role}
                className="p-0 sm:p-0 overflow-hidden flex flex-col"
              >
                <div className="aspect-[16/10] w-full overflow-hidden border-b border-[#E9DFD0]">
                  <img
                    src={guide.imageSrc}
                    alt={guide.imageAlt}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                  <p className="text-xs font-medium text-[#8F6849]">
                    {guide.subtitle}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-[#493B32]">
                    {guide.title}
                  </h3>
                  <p className="mt-3 text-sm sm:text-base text-[#6E5C50] leading-relaxed">
                    {guide.summary}
                  </p>

                  <ul className="mt-5 space-y-2.5 text-sm text-[#493B32]">
                    {guide.benefits.map((benefit) => (
                      <li key={benefit} className="flex items-start gap-2.5">
                        <Check
                          className="h-4 w-4 text-[#B58C6A] mt-0.5 shrink-0"
                          aria-hidden="true"
                        />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-7">
                    <Button
                      variant="secondary"
                      fullWidth
                      size="lg"
                      onClick={() =>
                        onNavigate(currentUser ? 'mode-select' : 'login')
                      }
                    >
                      {currentUser ? '모드 선택 화면에서 확인하기' : guide.ctaLabel}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action Section */}
      <section
        id="get-started"
        className="border-t border-[#E9DFD0] py-14 md:py-20 scroll-mt-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Card tone="beige" className="px-6 py-10 sm:px-12 sm:py-14 text-center">
            <p className="text-sm font-medium text-[#8F6849]">
              {BRAND_CONTENT.name}
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#493B32] [text-wrap:balance]">
              기억하고 싶은 날, 지금부터 여유롭게 준비하세요
            </h2>
            <p className="mt-3 mx-auto max-w-xl text-sm sm:text-base text-[#6E5C50] leading-relaxed">
              로그인 화면에서 시연용 데모 계정으로 소비자 전용, 판매자 전용, 통합 권한 계정의 모드 전환을 바로 확인하실 수 있습니다.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              {currentUser ? (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto min-w-[200px]"
                  onClick={() => onNavigate('mode-select')}
                >
                  모드 선택 화면으로 이동
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto min-w-[160px]"
                    onClick={() => onNavigate('signup')}
                  >
                    회원가입
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto min-w-[160px]"
                    onClick={() => onNavigate('login')}
                  >
                    로그인
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};
