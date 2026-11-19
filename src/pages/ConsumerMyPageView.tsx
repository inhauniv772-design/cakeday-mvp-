import React from 'react';
import { ArrowLeftRight, Info, LogOut } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import type { AppPage, UserAccount, UserRole } from '../types';
import { canSwitchModes, formatRolesSummary } from '../utils/auth';

interface ConsumerMyPageViewProps {
  user: UserAccount;
  anniversaryCount: number;
  onNavigate: (page: AppPage) => void;
  onSwitchMode: (mode: UserRole) => boolean;
  onLogout: () => void;
}

export const ConsumerMyPageView: React.FC<ConsumerMyPageViewProps> = ({
  user,
  anniversaryCount,
  onNavigate,
  onSwitchMode,
  onLogout,
}) => {
  const isDualRole = canSwitchModes(user);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-xs sm:text-sm font-medium text-[#8F6849]">
          소비자 마이페이지
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[#493B32]">내 계정 정보</h1>
      </div>

      <Card>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4">
            <dt className="text-xs text-[#6E5C50]">이름</dt>
            <dd className="mt-1 text-base font-bold text-[#493B32]">
              {user.name}
            </dd>
          </div>
          <div className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4">
            <dt className="text-xs text-[#6E5C50]">이메일</dt>
            <dd className="mt-1 text-base font-medium text-[#493B32] break-all">
              {user.email}
            </dd>
          </div>
          <div className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4">
            <dt className="text-xs text-[#6E5C50]">보유 권한 · 현재 모드</dt>
            <dd className="mt-1 text-sm font-semibold text-[#8F6849]">
              소비자 모드 ({formatRolesSummary(user.roles)})
            </dd>
          </div>
          <div className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4">
            <dt className="text-xs text-[#6E5C50]">등록한 기념일</dt>
            <dd className="mt-1 text-base font-bold text-[#493B32] tabular-nums">
              {anniversaryCount}개
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[#E9DFD0]/45 p-4 text-xs sm:text-sm text-[#6E5C50]">
          <Info className="h-4 w-4 text-[#8F6849] mt-0.5 shrink-0" aria-hidden="true" />
          <p className="leading-relaxed">
            현재 단계에서는 기본 계정 요약 화면만 제공됩니다. 관심 매장, 주문 내역 및 프로필 설정 기능은 다음 단계에서 추가될 예정입니다.
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-[#E9DFD0] flex flex-col sm:flex-row gap-3">
          {isDualRole && (
            <Button
              variant="primary"
              size="lg"
              onClick={() => onSwitchMode('seller')}
            >
              <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
              <span>판매자 모드로 전환</span>
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            onClick={() => onNavigate('mode-select')}
          >
            모드 선택 화면
          </Button>
          <Button variant="ghost" size="lg" onClick={onLogout}>
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>로그아웃</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
