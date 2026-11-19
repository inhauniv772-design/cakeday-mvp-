import React from 'react';
import { ArrowLeft, ArrowLeftRight, Info, ShieldAlert } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SafeImage } from '../components/SafeImage';
import { CORE_VALUE_MEDIA, MODE_OVERVIEWS, ROLE_GUIDES } from '../data/cakedayData';
import type { AppPage, UserAccount, UserRole } from '../types';
import { canSwitchModes, formatRolesSummary, hasRole } from '../utils/auth';

interface ModeWorkspacePageProps {
  mode: UserRole;
  user: UserAccount;
  onNavigate: (page: AppPage) => void;
  onSwitchMode: (targetMode: UserRole) => boolean;
}

export const ModeWorkspacePage: React.FC<ModeWorkspacePageProps> = ({
  mode,
  user,
  onNavigate,
  onSwitchMode,
}) => {
  const isAuthorized = hasRole(user, mode);
  const overview = MODE_OVERVIEWS[mode];
  const oppositeMode: UserRole = mode === 'consumer' ? 'seller' : 'consumer';
  const canSwitch = canSwitchModes(user);

  if (!isAuthorized) {
    return (
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="mx-auto max-w-lg">
          <Card className="text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E9DFD0] text-[#9F4A3B]">
              <ShieldAlert className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="mt-4 text-xl sm:text-2xl font-bold text-[#493B32]">
              접근 권한이 제한되었습니다
            </h1>
            <p className="mt-3 text-sm sm:text-base text-[#6E5C50] leading-relaxed">
              {mode === 'seller'
                ? '판매자 모드는 판매자 권한이 부여된 계정만 이용할 수 있습니다. 현재 계정에는 소비자 권한만 등록되어 있습니다.'
                : '소비자 모드는 소비자 권한이 부여된 계정만 이용할 수 있습니다.'}
            </p>
            <p className="mt-3 text-xs text-[#6E5C50]">
              계정: {user.email} · 보유 권한: {formatRolesSummary(user.roles)}
            </p>
            <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => onNavigate('mode-select')}
              >
                모드 선택 화면으로 이동
              </Button>
            </div>
          </Card>
        </div>
      </section>
    );
  }

  const modeMedia =
    mode === 'consumer'
      ? CORE_VALUE_MEDIA
      : {
          src: ROLE_GUIDES[1].imageSrc,
          alt: ROLE_GUIDES[1].imageAlt,
        };

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-14">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => onNavigate('mode-select')}
          className="inline-flex items-center gap-2 min-h-[44px] text-sm font-medium text-[#6E5C50] hover:text-[#493B32] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          모드 선택 화면으로 돌아가기
        </button>

        <Card className="mt-4 p-0 sm:p-0 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
            <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-[#E9DFD0]">
              <SafeImage
                src={modeMedia.src}
                alt={modeMedia.alt}
                containerClassName="aspect-[4/3] lg:aspect-auto lg:h-full w-full rounded-none"
                fallbackTitle={overview.title}
              />
            </div>

            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-[#8F6849]">
                  {overview.audienceLabel}
                </p>
                <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-[#493B32]">
                  {overview.title}
                </h1>
                <p className="mt-3 text-sm sm:text-base text-[#6E5C50] leading-relaxed">
                  {overview.description}
                </p>

                {/* Active Account Data Summary */}
                <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 text-sm">
                  <div>
                    <dt className="text-xs text-[#6E5C50]">로그인 계정</dt>
                    <dd className="mt-1 font-semibold text-[#493B32]">
                      {user.name}
                    </dd>
                    <dd className="text-xs text-[#6E5C50]">{user.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#6E5C50]">권한 및 활성 모드</dt>
                    <dd className="mt-1 font-semibold text-[#8F6849]">
                      {overview.title} 이용 중
                    </dd>
                    <dd className="text-xs text-[#6E5C50]">
                      보유 권한: {formatRolesSummary(user.roles)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[#E9DFD0]/45 p-4 text-xs sm:text-sm text-[#6E5C50]">
                  <Info
                    className="h-4 w-4 text-[#8F6849] mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <div className="space-y-1">
                    <p className="font-medium text-[#493B32]">
                      {overview.nextStepSummary}
                    </p>
                    <p className="leading-relaxed">{overview.workspaceNotice}</p>
                  </div>
                </div>
              </div>

              <div className="mt-7 pt-5 border-t border-[#E9DFD0] flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => onNavigate('mode-select')}
                >
                  모드 선택 화면
                </Button>
                {canSwitch && (
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={() => onSwitchMode(oppositeMode)}
                  >
                    <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {oppositeMode === 'seller'
                        ? '판매자 모드로 전환'
                        : '소비자 모드로 전환'}
                    </span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
