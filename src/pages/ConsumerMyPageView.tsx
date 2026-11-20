import React, { useState } from 'react';
import {
  ArrowLeftRight,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  ImagePlus,
  LogOut,
  Search,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { MockPaymentModal } from '../components/MockPaymentModal';
import { OrderDetailModal } from '../components/OrderDetailModal';
import { QuoteRequestDetailModal } from '../components/QuoteRequestDetailModal';
import { formatPriceKRW } from '../data/mockShops';
import {
  formatOrderTimestampDate,
  getConsumerOrderStatusLabel,
  getOrderStatusBadgeClass,
} from '../services/orderStorage';
import type {
  AppPage,
  CakeOrder,
  CustomQuoteRequest,
  PaymentMethod,
  UserAccount,
  UserRole,
} from '../types';
import { canSwitchModes, formatRolesSummary } from '../utils/auth';
import { cn } from '../utils/cn';
import { formatKoreanShortDate } from '../utils/dateUtils';

interface ConsumerMyPageViewProps {
  user: UserAccount;
  anniversaryCount: number;
  orders: CakeOrder[];
  quoteRequests: CustomQuoteRequest[];
  onNavigate: (page: AppPage) => void;
  onGoToSearch: () => void;
  onSwitchMode: (mode: UserRole) => boolean;
  onCompletePayment: (
    orderId: string,
    paymentMethod: PaymentMethod
  ) => { ok: boolean; error?: string; updatedOrder?: CakeOrder };
  onLogout: () => void;
}

export const ConsumerMyPageView: React.FC<ConsumerMyPageViewProps> = ({
  user,
  anniversaryCount,
  orders,
  quoteRequests,
  onNavigate,
  onGoToSearch,
  onSwitchMode,
  onCompletePayment,
  onLogout,
}) => {
  const isDualRole = canSwitchModes(user);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);

  const selectedOrder =
    orders.find((order) => order.orderId === selectedOrderId) ?? null;
  const paymentOrder =
    orders.find((order) => order.orderId === paymentOrderId) ?? null;
  const selectedQuote =
    quoteRequests.find((quote) => quote.quoteId === selectedQuoteId) ?? null;

  const handleOpenPayment = (orderId: string) => {
    setSelectedOrderId(null);
    setPaymentOrderId(orderId);
  };

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
              <dt className="text-xs text-[#6E5C50]">기념일 · 주문 · 견적</dt>
              <dd className="mt-1 text-base font-bold text-[#493B32] tabular-nums">
                기념일 {anniversaryCount} · 주문 {orders.length} · 견적{' '}
                {quoteRequests.length}
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
            {orders.map((order) => {
              const statusLabel = getConsumerOrderStatusLabel(order);
              const isPending = order.status === '판매자 확인 대기';
              const isApprovedAwaitingPayment =
                order.status === '판매자 승인 완료' && !order.payment?.isPaid;
              const isRejected = order.status === '판매자 거절';
              const isPaidConfirmed =
                order.status === '결제 완료 및 예약 확정' ||
                Boolean(order.payment?.isPaid);

              return (
                <div
                  key={order.orderId}
                  className="p-5 sm:p-6 space-y-4 hover:bg-[#FAF8F3]/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            'inline-block rounded-lg px-2.5 py-0.5 text-xs font-semibold',
                            getOrderStatusBadgeClass(order.status)
                          )}
                        >
                          {statusLabel}
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
                        {order.pickupTime} · 기본가{' '}
                        {formatPriceKRW(order.cakePrice)}
                      </p>

                      {isRejected && order.rejectionReason && (
                        <p className="text-xs text-[#9F4A3B] bg-[#FBF0ED] border border-[#E4B8AF] rounded-xl px-3 py-1.5 leading-relaxed">
                          거절 사유: {order.rejectionReason}
                        </p>
                      )}

                      {isPaidConfirmed && order.payment && (
                        <p className="text-xs text-[#355E3B] bg-[#EEF4EC] border border-[#BBD0B5] rounded-xl px-3 py-1.5 leading-relaxed tabular-nums">
                          결제 완료 ({order.payment.paymentMethod} ·{' '}
                          {formatPriceKRW(order.payment.paidAmount)} ·{' '}
                          {formatOrderTimestampDate(order.payment.paidAt)})
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Per-Status Action Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-[#E9DFD0]/70">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId(order.orderId)}
                      className="min-h-[44px] inline-flex items-center justify-center sm:justify-start gap-1.5 text-sm font-medium text-[#6E5C50] hover:text-[#493B32] transition-colors cursor-pointer px-2"
                    >
                      <span>
                        {isPaidConfirmed
                          ? '결제 · 예약 정보 상세 보기'
                          : '주문 상세 보기'}
                      </span>
                      <ChevronRight
                        className="h-4 w-4 text-[#B58C6A]"
                        aria-hidden="true"
                      />
                    </button>

                    {isPending && (
                      <Button
                        variant="secondary"
                        size="md"
                        disabled
                        title="판매자 승인 후 결제가 가능합니다."
                      >
                        <CreditCard className="h-4 w-4" aria-hidden="true" />
                        <span>결제하기 (판매자 확인 대기)</span>
                      </Button>
                    )}

                    {isApprovedAwaitingPayment && (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleOpenPayment(order.orderId)}
                      >
                        <CreditCard className="h-4 w-4" aria-hidden="true" />
                        <span>결제하기</span>
                      </Button>
                    )}

                    {isRejected && (
                      <Button variant="outline" size="md" disabled>
                        결제 불가
                      </Button>
                    )}

                    {isPaidConfirmed && (
                      <div className="min-h-[44px] inline-flex items-center justify-center gap-1.5 rounded-2xl bg-[#EEF4EC] border border-[#BBD0B5] px-4 py-2 text-xs sm:text-sm font-semibold text-[#355E3B]">
                        <CheckCircle2
                          className="h-4 w-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span>결제 완료 및 예약 확정</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>

      {/* Custom Design Quote Requests Section (Separate from Regular Orders) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ImagePlus className="h-5 w-5 text-[#B58C6A]" aria-hidden="true" />
            <h2 className="text-xl font-bold text-[#493B32]">
              맞춤 디자인 견적 요청
            </h2>
          </div>
          <span className="text-xs sm:text-sm text-[#6E5C50] tabular-nums">
            총 {quoteRequests.length}건
          </span>
        </div>

        {quoteRequests.length === 0 ? (
          <Card tone="beige" className="py-10 text-center space-y-3">
            <p className="text-base font-semibold text-[#493B32]">
              아직 보낸 맞춤 디자인 견적 요청이 없어요.
            </p>
            <p className="text-sm text-[#6E5C50]">
              케이크 찾기 화면이나 매장 상세 화면에서 &lsquo;맞춤 디자인 견적 요청&rsquo;을 눌러 참고 사진과 함께 문의해 보세요.
            </p>
            <div className="pt-2">
              <Button variant="secondary" size="md" onClick={onGoToSearch}>
                <Search className="h-4 w-4" aria-hidden="true" />
                <span>매장 찾아보기</span>
              </Button>
            </div>
          </Card>
        ) : (
          <Card className="p-0 sm:p-0 divide-y divide-[#E9DFD0] overflow-hidden">
            {quoteRequests.map((quote) => (
              <div
                key={quote.quoteId}
                className="p-5 sm:p-6 space-y-3.5 hover:bg-[#FAF8F3]/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-block rounded-lg bg-[#E9DFD0] border border-[#D8C9B5] px-2.5 py-0.5 text-xs font-semibold text-[#493B32]">
                        {quote.status}
                      </span>
                      <span className="text-xs text-[#6E5C50] tabular-nums">
                        요청일 {formatOrderTimestampDate(quote.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-[#493B32] truncate">
                      {quote.shopName}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#8F6849] font-medium tabular-nums">
                      희망 수령일: {formatKoreanShortDate(quote.desiredPickupDate)} ·{' '}
                      {quote.desiredPickupTime} · 첨부 사진 {quote.images.length}장
                    </p>

                    <p className="text-xs sm:text-sm text-[#6E5C50] line-clamp-2 leading-relaxed">
                      {quote.cakeSize} · {quote.cakeShape} · {quote.cakeFlavor} · &ldquo;
                      {quote.letteringText}&rdquo;
                    </p>
                  </div>

                  {quote.images[0] && (
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] overflow-hidden shrink-0">
                      <img
                        src={quote.images[0].dataUrl}
                        alt={`${quote.shopName} 견적 참고 이미지`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#E9DFD0]/70 flex items-center justify-between gap-3">
                  <span className="text-xs text-[#6E5C50]">
                    판매자 검토 대기 중 (견적 답변 기능 다음 단계 예정)
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedQuoteId(quote.quoteId)}
                    className="min-h-[44px] inline-flex items-center gap-1.5 text-sm font-medium text-[#6E5C50] hover:text-[#493B32] transition-colors cursor-pointer px-2 shrink-0"
                  >
                    <span>요청 상세 보기</span>
                    <ChevronRight
                      className="h-4 w-4 text-[#B58C6A]"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>

      <OrderDetailModal
        order={selectedOrder}
        isMissingOrder={selectedOrderId !== null && !selectedOrder}
        onClose={() => setSelectedOrderId(null)}
        onOpenPayment={handleOpenPayment}
      />

      <MockPaymentModal
        order={paymentOrder}
        isMissingOrder={paymentOrderId !== null && !paymentOrder}
        onClose={() => setPaymentOrderId(null)}
        onConfirmPayment={onCompletePayment}
      />

      <QuoteRequestDetailModal
        quote={selectedQuote}
        isMissingQuote={selectedQuoteId !== null && !selectedQuote}
        onClose={() => setSelectedQuoteId(null)}
      />
    </div>
  );
};
