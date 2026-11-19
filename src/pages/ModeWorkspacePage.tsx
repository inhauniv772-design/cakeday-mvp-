import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import type { AppPage, UserAccount, UserRole } from '../types';
import { formatRolesSummary, hasRole } from '../utils/auth';
import { ConsumerDashboardPage } from './ConsumerDashboardPage';
import { SellerDashboardPage } from './SellerDashboardPage';

interface ModeWorkspacePageProps {
  mode: UserRole;
  user: UserAccount;
  onNavigate: (page: AppPage) => void;
  onSwitchMode: (targetMode: UserRole) => boolean;
  onLogout: () => void;
}

export const ModeWorkspacePage: React.FC<ModeWorkspacePageProps> = ({
  mode,
  user,
  onNavigate,
  onSwitchMode,
  onLogout,
}) => {
  const isAuthorized = hasRole(user, mode);

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

  if (mode === 'consumer') {
    return (
      <ConsumerDashboardPage
        user={user}
        onNavigate={onNavigate}
        onSwitchMode={onSwitchMode}
        onLogout={onLogout}
      />
    );
  }

  return (
    <SellerDashboardPage
      user={user}
      onNavigate={onNavigate}
      onSwitchMode={onSwitchMode}
      onLogout={onLogout}
    />
  );
};
