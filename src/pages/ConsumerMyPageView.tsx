import React, { useState } from 'react';
import { ArrowLeftRight, ChevronRight, LogOut, Search, ShoppingBag } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { OrderDetailModal } from '../components/OrderDetailModal';
import { formatOrderTimestampDate } from '../services/orderStorage';
import type { AppPage, CakeOrder, UserAccount, UserRole } from '../types';
import { canSwitchModes, formatRolesSummary } from '../utils/auth';
import { formatKoreanShortDate } from '../utils/dateUtils';

interface ConsumerMyPageViewProps {
  user: UserAccount;
  anniversaryCount: number;
  orders: CakeOrder[];
  onNavigate: (page: AppPage) => void;
  onGoToSearch: () => void;
  onSwitchMode: (mode: UserRole) => boolean;
  onLogout: () => void;
}

export const ConsumerMyPageView: React.FC<ConsumerMyPageViewProps> = ({
  user,
  anniversaryCount,
  orders,
  onNavigate,
  onGoToSearch,
  onSwitchMode,
  onLogout,
}) => {
  const isDualRole = canSwitchModes(user);
  const [selectedOrder, setSelectedOrder] = useState<CakeOrder | null>(null);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Account Summary */}
      <div className="space-y-4">
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
              <dt className="text-xs text-[#6E5C50]">기념일 · 주문 내역</dt>
              <dd className="mt-1 text-base font-bold text-[#493B32] tabular-nums">
                기념일 {anniversaryCount}개 · 주문 {orders.length}건
              </dd>
            </div>
          </dl>

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

      {/* Order History Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#B58C6A]" aria-hidden="true" />
            <h2 className="text-xl font-bold text-[#493B32]">주문 내역</h2>
          </div>
          <span className="text-xs sm:text-sm text-[#6E5C50] tabular-nums">
            총 {orders.length}건
          </span>
        </div>

        {orders.length === 0 ? (
          <Card className="py-10 text-center space-y-3">
            <p className="text-base font-semibold text-[#493B32]">
              아직 신청한 케이크 주문이 없어요.
            </p>
            <p className="text-sm text-[#6E5C50]">
              케이크 찾기 화면에서 매장을 선택하고 원하는 옵션으로 주문을 신청해 보세요.
            </p>
            <div className="pt-2">
              <Button variant="secondary" size="md" onClick={onGoToSearch}>
                <Search className="h-4 w-4" aria-hidden="true" />
                <span>케이크 매장 찾아보기</span>
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-0 sm:p-0 divide-y divide-[#E9DFD0] overflow-hidden">
            {orders.map((order) => (
              <button
                key={order.orderId}
                type="button"
                onClick={() => setSelectedOrder(order)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-[#FAF8F3] transition-colors cursor-pointer"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-block rounded-full bg-[#E9DFD0] px-2.5 py-0.5 text-xs font-semibold text-[#493B32]">
                      {order.applicationStatus} · {order.status}
                    </span>
                    <span className="text-xs text-[#6E5C50] tabular-nums">
                      신청일 {formatOrderTimestampDate(order.orderedAt)}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-[#493B32] truncate">
                    {order.shopName}
                  </h3>

                  <p className="text-sm font-medium text-[#493B32]">
                    {order.cakeName}{' '}
                    <span className="text-xs font-normal text-[#6E5C50]">
                      ({order.options.cakeSize} · {order.options.cakeFlavor})
                    </span>
                  </p>

                  <p className="text-xs sm:text-sm text-[#8F6849] font-medium tabular-nums">
                    픽업 일정: {formatKoreanShortDate(order.pickupDate)} ·{' '}
                    {order.pickupTime}
                  </p>
                </div>

                <ChevronRight
                  className="h-5 w-5 text-[#B58C6A] shrink-0"
                  aria-hidden="true"
                />
              </button>
            ))}
          </Card>
        )}
      </div>

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};
