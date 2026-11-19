import React, { useState } from 'react';
import {
  ArrowRight,
  Layers,
  Lock,
  RotateCcw,
  ShieldAlert,
  Store,
  User,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FUTURE_EXPANSION_ITEMS, MODE_OVERVIEWS } from '../data/cakedayData';
import { resetAllDemoTestData } from '../services/demoDataManager';
import type { UserAccount, UserRole } from '../types';
import { formatRolesSummary, getModeDisplayName, hasRole } from '../utils/auth';
import { cn } from '../utils/cn';

interface ModeSelectPageProps {
  user: UserAccount;
  sessionNotice?: string | null;
  onSelectMode: (mode: UserRole) => boolean;
}

export const ModeSelectPage: React.FC<ModeSelectPageProps> = ({
  user,
  sessionNotice,
  onSelectMode,
}) => {
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(
    null
  );
  const [isConfirmingReset, setIsConfirmingReset] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleResetDemoData = () => {
    const summary = resetAllDemoTestData();
    setIsConfirmingReset(false);
    setResetMessage(
      `시연용 데모 데이터(기념일 ${summary.anniversariesCount}건 · 주문 ${summary.ordersCount}건)를 초기 상태로 복원했습니다. 직접 가입한 계정의 데이터는 그대로 유지됩니다.`
    );
  };

  const handleModeClick = (targetMode: UserRole) => {
    const allowed = onSelectMode(targetMode);
    if (!allowed) {
      setAccessDeniedMessage(
        targetMode === 'seller'
          ? '판매자 권한이 없는 계정입니다. 판매자 모드는 판매자 권한이 부여된 계정만 접근할 수 있습니다.'
          : '소비자 권한이 없는 계정입니다. 소비자 모드는 소비자 권한이 부여된 계정만 접근할 수 있습니다.'
      );
      return;
    }
    setAccessDeniedMessage(null);
  };

  const modes: UserRole[] = ['consumer', 'seller'];

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-14">
      <div className="mx-auto max-w-4xl">
        {/* Account & Permission Summary */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-[#8F6849]">계정 모드 선택</p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#493B32] [text-wrap:balance]">
            {user.name}님, 이용할 서비스 모드를 선택해 주세요
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-[#6E5C50]">
            <span>{user.email}</span>
            <span aria-hidden="true">·</span>
            <span>보유 권한: {formatRolesSummary(user.roles)}</span>
            <span aria-hidden="true">·</span>
            <span className="font-medium text-[#493B32]">
              현재 상태: {getModeDisplayName(user.currentMode)}
            </span>
          </div>
        </div>

        {sessionNotice && (
          <div
            role="status"
            className="mt-5 rounded-2xl border border-[#E9DFD0] bg-[#FFFFFF] px-4 py-3.5 text-sm text-[#493B32]"
          >
            {sessionNotice}
          </div>
        )}

        {accessDeniedMessage && (
          <div
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-2xl border border-[#9F4A3B]/45 bg-[#FFFFFF] px-4 py-3.5 text-sm text-[#9F4A3B]"
          >
            <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            <span>{accessDeniedMessage}</span>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {modes.map((modeKey) => {
            const overview = MODE_OVERVIEWS[modeKey];
            const isAuthorized = hasRole(user, modeKey);
            const isCurrent = user.currentMode === modeKey;

            return (
              <Card
                key={modeKey}
                tone={isAuthorized ? 'white' : 'beige'}
                className={cn(
                  'flex flex-col justify-between transition-all duration-150',
                  isCurrent && 'border-[#B58C6A] ring-1 ring-[#B58C6A]/35',
                  !isAuthorized && 'opacity-85'
                )}
              >
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={cn(
                        'inline-flex h-11 w-11 items-center justify-center rounded-2xl',
                        isAuthorized
                          ? 'bg-[#E9DFD0] text-[#493B32]'
                          : 'bg-[#FFFFFF]/80 text-[#6E5C50]'
                      )}
                      aria-hidden="true"
                    >
                      {modeKey === 'consumer' ? (
                        <User className="h-5 w-5" />
                      ) : (
                        <Store className="h-5 w-5" />
                      )}
                    </span>

                    <span className="text-xs font-medium text-[#6E5C50]">
                      {isCurrent
                        ? '현재 활성 모드'
                        : isAuthorized
                          ? '이용 가능'
                          : '접근 제한'}
                    </span>
                  </div>

                  <p className="mt-5 text-xs font-medium text-[#8F6849]">
                    {overview.audienceLabel}
                  </p>
                  <h2 className="mt-1.5 text-xl font-bold text-[#493B32]">
                    {overview.title}
                  </h2>
                  <p className="mt-3 text-sm sm:text-base text-[#6E5C50] leading-relaxed">
                    {overview.description}
                  </p>

                  {!isAuthorized && (
                    <div className="mt-4 flex items-start gap-2 rounded-2xl bg-[#FFFFFF]/80 px-3.5 py-3 text-xs text-[#6E5C50]">
                      <Lock
                        className="h-3.5 w-3.5 text-[#8F6849] mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>
                        현재 계정의 권한({formatRolesSummary(user.roles)})에는{' '}
                        {modeKey === 'seller' ? '판매자' : '소비자'} 권한이 포함되어 있지 않습니다.
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-7 pt-5 border-t border-[#E9DFD0]">
                  <Button
                    variant={isAuthorized ? 'primary' : 'outline'}
                    size="lg"
                    fullWidth
                    onClick={() => handleModeClick(modeKey)}
                  >
                    {isAuthorized ? (
                      <>
                        <span>
                          {isCurrent
                            ? `${overview.title} 계속 이용하기`
                            : overview.entryButtonLabel}
                        </span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" aria-hidden="true" />
                        <span>권한 없음 · 접근 제한</span>
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Presentation Demo Data Reset Utility */}
        <Card tone="beige" className="mt-8 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className="text-base font-bold text-[#493B32]">
                시연용 테스트 데이터 관리
              </h2>
              <p className="text-xs sm:text-sm text-[#6E5C50] leading-relaxed">
                발표 시연을 반복할 때 데모 프리셋 계정의 기념일·주문 상태(확인 대기 / 승인 완료 / 거절 / 결제 완료)만 초기 상태로 안전하게 복원할 수 있습니다.
              </p>
            </div>

            {!isConfirmingReset && (
              <Button
                variant="outline"
                size="md"
                className="shrink-0"
                onClick={() => {
                  setResetMessage(null);
                  setIsConfirmingReset(true);
                }}
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                <span>시연용 테스트 데이터 초기화</span>
              </Button>
            )}
          </div>

          {resetMessage && (
            <div
              role="status"
              className="rounded-2xl border border-[#BBD0B5] bg-[#EEF4EC] px-4 py-3 text-xs sm:text-sm text-[#355E3B]"
            >
              {resetMessage}
            </div>
          )}

          {isConfirmingReset && (
            <div className="rounded-2xl border border-[#D6B89C] bg-[#FFFFFF] p-4 space-y-3">
              <p className="text-xs sm:text-sm font-medium text-[#493B32] leading-relaxed">
                데모 프리셋 계정의 기념일 및 주문 내역만 초기 시연 데이터로 복원합니다. 회원가입으로 생성한 계정의 데이터는 삭제되지 않습니다. 계속할까요?
              </p>
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleResetDemoData}
                >
                  초기화 확정
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsConfirmingReset(false)}
                >
                  취소
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Future Expansion Roadmap (Strictly Non-Interactive & Outside Active MVP Scope) */}
        <section
          aria-labelledby="future-expansion-heading"
          className="mt-10 rounded-3xl border border-dashed border-[#D8C9B5] bg-[#FAF8F3] p-5 sm:p-7 space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8F6849]">
                <Layers className="h-4 w-4" aria-hidden="true" />
                <span>향후 확장 예정 기능 · MVP 범위 외 (미구현 안내)</span>
              </div>
              <h2
                id="future-expansion-heading"
                className="text-lg sm:text-xl font-bold text-[#493B32]"
              >
                실서비스 고도화 단계에서 추가 예정인 기능
              </h2>
            </div>
            <span className="inline-block self-start sm:self-auto rounded-lg border border-[#D8C9B5] bg-[#FFFFFF] px-3 py-1 text-xs font-medium text-[#6E5C50]">
              참고용 로드맵 (비활성)
            </span>
          </div>

          <p className="text-xs sm:text-sm text-[#6E5C50] leading-relaxed">
            현재 CakeDay MVP는 핵심 주문·승인·모의 결제 흐름에 집중해 구현되었으며, 아래 기능은 다음 단계 확장 계획으로 분리되어 있습니다.
          </p>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {FUTURE_EXPANSION_ITEMS.map((item) => (
              <li
                key={item.title}
                className="rounded-2xl border border-[#E9DFD0] bg-[#FFFFFF]/75 p-4 space-y-1"
              >
                <span className="inline-block text-[11px] font-semibold text-[#8F6849]">
                  {item.category}
                </span>
                <h3 className="text-sm font-bold text-[#493B32]">
                  {item.title}
                </h3>
                <p className="text-xs text-[#6E5C50] leading-relaxed">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
};
