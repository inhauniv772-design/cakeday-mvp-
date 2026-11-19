import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import { SafeImage } from './SafeImage';
import { formatPriceKRW } from '../data/mockShops';
import { formatOrderTimestampDate } from '../services/orderStorage';
import type { CakeOrder } from '../types';
import { formatKoreanDate } from '../utils/dateUtils';

interface OrderDetailModalProps {
  order: CakeOrder | null;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
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
            <p className="text-xs font-medium text-[#8F6849]">
              {order.applicationStatus} · {order.status}
            </p>
            <h2
              id="order-detail-modal-title"
              className="mt-1 text-xl font-bold text-[#493B32]"
            >
              주문 상세 내역
            </h2>
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
            <dt className="text-[#6E5C50]">주문 상태</dt>
            <dd className="font-semibold text-[#8F6849]">
              {order.applicationStatus} ({order.status})
            </dd>
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

        <Button variant="primary" size="lg" fullWidth onClick={onClose}>
          확인
        </Button>
      </div>
    </div>
  );
};
