import React, { useEffect } from 'react';
import { CheckCircle2, Clock3, CreditCard, X, XCircle } from 'lucide-react';
import { Button } from './Button';
import { SafeImage } from './SafeImage';
import { formatPriceKRW } from '../data/mockShops';
import {
  formatOrderTimestampDate,
  getConsumerOrderStatusLabel,
  getOrderStatusBadgeClass,
} from '../services/orderStorage';
import type { CakeOrder } from '../types';
import { cn } from '../utils/cn';
import { formatKoreanDate } from '../utils/dateUtils';

interface OrderDetailModalProps {
  order: CakeOrder | null;
  onClose: () => void;
  onOpenPayment?: (orderId: string) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onOpenPayment,
}) => {
  useEffect(() => {
    if (!order) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [order, onClose]);

  if (!order) return null;

  const statusLabel = getConsumerOrderStatusLabel(order);
  const isApprovedAwaitingPayment =
    order.status === '판매자 승인 완료' && !order.payment?.isPaid;
  const isPaidConfirmed =
    order.status === '결제 완료 및 예약 확정' || Boolean(order.payment?.isPaid);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#493B32]/45 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-detail-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#FFFFFF] border border-[#E9DFD0] shadow-xl p-5 sm:p-7 space-y-5">
        <div
          className="sm:hidden w-10 h-1.5 rounded-full bg-[#E9DFD0] mx-auto"
          aria-hidden="true"
        />

        <div className="flex items-start justify-between gap-4">
          <div>
            <span
              className={cn(
                'inline-block rounded-lg px-3 py-1 text-xs font-semibold',
                getOrderStatusBadgeClass(order.status)
              )}
            >
              {statusLabel}
            </span>
            <h2
              id="order-detail-modal-title"
              className="mt-2 text-xl font-bold text-[#493B32]"
            >
              {isPaidConfirmed ? '예약 확정 및 결제 정보' : '주문 상세 내역'}
            </h2>
            <p className="mt-0.5 text-xs text-[#6E5C50] tabular-nums">
              주문 번호: {order.orderId}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[#6E5C50] hover:bg-[#FAF8F3] hover:text-[#493B32] transition-colors cursor-pointer shrink-0"
            aria-label="닫기"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Status Feedback Banner */}
        {isPaidConfirmed && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-[#BBD0B5] bg-[#EEF4EC] p-4 text-xs sm:text-sm text-[#355E3B]">
            <CheckCircle2
              className="h-4 w-4 mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="font-bold">결제 완료 및 예약이 최종 확정되었습니다.</p>
              <p className="leading-relaxed">
                예약된 픽업 일정({formatKoreanDate(order.pickupDate)} ·{' '}
                {order.pickupTime})에 맞춰 매장에서 케이크를 준비합니다.
              </p>
            </div>
          </div>
        )}

        {isApprovedAwaitingPayment && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-[#D6B89C] bg-[#F7EFE6] p-4 text-xs sm:text-sm text-[#493B32]">
            <CheckCircle2
              className="h-4 w-4 text-[#8F6849] mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="font-bold text-[#8F6849]">
                판매자가 주문을 승인했습니다. 결제를 진행해 주세요.
              </p>
              <p className="leading-relaxed text-[#6E5C50]">
                아래 결제하기 버튼을 눌러 시연용 결제를 완료하면 예약이 최종 확정됩니다.
              </p>
              {order.reviewedAt && (
                <p className="text-xs text-[#6E5C50] tabular-nums">
                  승인 일시: {formatOrderTimestampDate(order.reviewedAt)}
                </p>
              )}
            </div>
          </div>
        )}

        {order.status === '판매자 거절' && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-[#E4B8AF] bg-[#FBF0ED] p-4 text-xs sm:text-sm text-[#9F4A3B]">
            <XCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            <div className="space-y-1.5">
              <p className="font-bold">판매자가 주문을 거절했습니다.</p>
              <div className="rounded-xl bg-[#FFFFFF]/85 border border-[#E4B8AF]/80 px-3 py-2 text-[#493B32]">
                <span className="text-xs font-semibold text-[#9F4A3B] block">
                  거절 사유
                </span>
                <p className="mt-0.5 text-sm leading-relaxed">
                  {order.rejectionReason || '등록된 거절 사유가 없습니다.'}
                </p>
              </div>
              {order.reviewedAt && (
                <p className="text-xs opacity-90 tabular-nums">
                  처리 일시: {formatOrderTimestampDate(order.reviewedAt)}
                </p>
              )}
            </div>
          </div>
        )}

        {order.status === '판매자 확인 대기' && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] p-3.5 text-xs sm:text-sm text-[#6E5C50]">
            <Clock3
              className="h-4 w-4 text-[#8F6849] mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <p className="leading-relaxed">
              매장에서 주문 내용을 확인하고 있습니다. 판매자 승인 완료 후 결제를 진행할 수 있습니다.
            </p>
          </div>
        )}

        {/* Paid Order Payment Summary */}
        {isPaidConfirmed && order.payment && (
          <dl className="rounded-2xl bg-[#EEF4EC]/60 border border-[#BBD0B5] p-4 space-y-2.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#355E3B]">결제 완료 여부</dt>
              <dd className="font-bold text-[#355E3B]">결제 완료 (시연용)</dd>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#BBD0B5]/60">
              <dt className="text-[#355E3B]">결제 수단</dt>
              <dd className="font-semibold text-[#493B32]">
                {order.payment.paymentMethod}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#BBD0B5]/60">
              <dt className="text-[#355E3B]">결제 완료 날짜 및 시간</dt>
              <dd className="font-medium text-[#493B32] tabular-nums">
                {formatOrderTimestampDate(order.payment.paidAt)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#BBD0B5]/60">
              <dt className="text-[#355E3B]">결제 금액</dt>
              <dd className="font-bold text-[#493B32] tabular-nums">
                {formatPriceKRW(order.payment.paidAmount)}
              </dd>
            </div>
          </dl>
        )}

        <div className="flex items-center gap-3.5 rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-3.5">
          <SafeImage
            src={order.cakeImage}
            alt={order.cakeName}
            containerClassName="h-16 w-20 rounded-xl border border-[#E9DFD0] shrink-0"
            fallbackTitle={order.shopName}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[#8F6849]">
              {order.shopName} · {order.shopRegionText}
            </p>
            <p className="mt-0.5 text-sm sm:text-base font-bold text-[#493B32] truncate">
              {order.cakeName}
            </p>
            <p className="mt-0.5 text-xs sm:text-sm font-bold text-[#8F6849] tabular-nums">
              {formatPriceKRW(order.cakePrice)}
            </p>
          </div>
        </div>

        <dl className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#6E5C50]">픽업 일시</dt>
            <dd className="font-semibold text-[#493B32] tabular-nums">
              {formatKoreanDate(order.pickupDate)} · {order.pickupTime}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
            <dt className="text-[#6E5C50]">주문 신청 날짜</dt>
            <dd className="font-medium text-[#493B32] tabular-nums">
              {formatOrderTimestampDate(order.orderedAt)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
            <dt className="text-[#6E5C50]">현재 주문 상태</dt>
            <dd className="font-semibold text-[#493B32]">{statusLabel}</dd>
          </div>
        </dl>

        <dl className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#6E5C50]">케이크 크기</dt>
            <dd className="font-medium text-[#493B32]">
              {order.options.cakeSize}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
            <dt className="text-[#6E5C50]">케이크 모양</dt>
            <dd className="font-medium text-[#493B32]">
              {order.options.cakeShape}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
            <dt className="text-[#6E5C50]">케이크 맛</dt>
            <dd className="font-medium text-[#493B32]">
              {order.options.cakeFlavor}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
            <dt className="text-[#6E5C50]">디자인 유형</dt>
            <dd className="font-medium text-[#493B32]">
              {order.options.designType}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
            <dt className="text-[#6E5C50]">원하는 색상</dt>
            <dd className="font-medium text-[#493B32]">
              {order.options.cakeColor}
            </dd>
          </div>
          <div className="pt-2.5 border-t border-[#E9DFD0]">
            <dt className="text-xs text-[#6E5C50]">레터링 문구</dt>
            <dd className="mt-1 font-semibold text-[#493B32]">
              &ldquo;{order.options.letteringText}&rdquo;
            </dd>
          </div>
          <div className="pt-2.5 border-t border-[#E9DFD0]">
            <dt className="text-xs text-[#6E5C50]">추가 요청 사항</dt>
            <dd className="mt-1 text-[#493B32] leading-relaxed">
              {order.options.additionalRequests || '없음'}
            </dd>
          </div>
        </dl>

        {isApprovedAwaitingPayment && onOpenPayment ? (
          <div className="flex flex-col-reverse sm:flex-row gap-2.5">
            <Button variant="outline" size="lg" fullWidth onClick={onClose}>
              닫기
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => onOpenPayment(order.orderId)}
            >
              <CreditCard className="h-4 w-4" aria-hidden="true" />
              <span>결제하기</span>
            </Button>
          </div>
        ) : (
          <Button variant="primary" size="lg" fullWidth onClick={onClose}>
            확인
          </Button>
        )}
      </div>
    </div>
  );
};
