import React, { useEffect, useState } from 'react';
import { CheckCircle2, User, X, XCircle } from 'lucide-react';
import { Button } from './Button';
import { SafeImage } from './SafeImage';
import { formatPriceKRW } from '../data/mockShops';
import {
  formatOrderTimestampDate,
  getOrderStatusBadgeClass,
} from '../services/orderStorage';
import type { CakeOrder } from '../types';
import { cn } from '../utils/cn';
import { formatKoreanDate } from '../utils/dateUtils';

interface SellerOrderDetailModalProps {
  order: CakeOrder | null;
  onClose: () => void;
  onApprove: (orderId: string) => { ok: boolean; error?: string };
  onReject: (
    orderId: string,
    rejectionReason: string
  ) => { ok: boolean; error?: string };
}

type ActionStep =
  | 'idle'
  | 'confirm-approve'
  | 'reject-reason'
  | 'confirm-reject';

export const SellerOrderDetailModal: React.FC<SellerOrderDetailModalProps> = ({
  order,
  onClose,
  onApprove,
  onReject,
}) => {
  const [actionStep, setActionStep] = useState<ActionStep>('idle');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setActionStep('idle');
    setRejectionReason('');
    setActionError(null);
  }, [order?.orderId, order?.status]);

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

  const isPending = order.status === '판매자 확인 대기';

  const handleConfirmApprove = () => {
    setActionError(null);
    const result = onApprove(order.orderId);
    if (!result.ok && result.error) {
      setActionError(result.error);
      return;
    }
    setActionStep('idle');
  };

  const handleProceedToRejectConfirm = () => {
    if (!rejectionReason.trim()) {
      setActionError('거절 사유를 입력해 주세요.');
      return;
    }
    setActionError(null);
    setActionStep('confirm-reject');
  };

  const handleConfirmReject = () => {
    setActionError(null);
    const result = onReject(order.orderId, rejectionReason);
    if (!result.ok && result.error) {
      setActionError(result.error);
      setActionStep('reject-reason');
      return;
    }
    setActionStep('idle');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#493B32]/45 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="seller-order-detail-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#FFFFFF] border border-[#E9DFD0] shadow-xl p-5 sm:p-7 space-y-5">
        <div
          className="sm:hidden w-10 h-1.5 rounded-full bg-[#E9DFD0] mx-auto"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span
              className={cn(
                'inline-block rounded-full px-3 py-1 text-xs font-semibold',
                getOrderStatusBadgeClass(order.status)
              )}
            >
              {order.status}
            </span>
            <h2
              id="seller-order-detail-title"
              className="mt-2 text-xl font-bold text-[#493B32]"
            >
              접수 주문 상세 정보
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

        {/* Customer Info */}
        <div className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#8F6849]">
            <User className="h-4 w-4" aria-hidden="true" />
            <span>주문자 정보</span>
          </div>
          <dl className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-xs text-[#6E5C50]">주문자 이름</dt>
              <dd className="mt-0.5 font-semibold text-[#493B32]">
                {order.customerName || '주문자 정보 없음 (이전 데모 주문)'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#6E5C50]">주문자 이메일</dt>
              <dd className="mt-0.5 font-medium text-[#493B32] break-all">
                {order.customerEmail || '-'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Shop & Cake Info */}
        <div className="flex items-center gap-3.5 rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4">
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

        {/* Schedule & Dates */}
        <dl className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#6E5C50]">픽업 날짜 및 시간</dt>
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
        </dl>

        {/* Consumer-entered Cake Options (read-only verbatim) */}
        <dl className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-[#6E5C50]">케이크 크기 및 모양</dt>
            <dd className="font-medium text-[#493B32] text-right">
              {order.options.cakeSize} · {order.options.cakeShape}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
            <dt className="text-[#6E5C50]">케이크 맛</dt>
            <dd className="font-medium text-[#493B32] text-right">
              {order.options.cakeFlavor}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
            <dt className="text-[#6E5C50]">디자인 유형 및 색상</dt>
            <dd className="font-medium text-[#493B32] text-right">
              {order.options.designType} · {order.options.cakeColor}
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
            <dd className="mt-1 text-[#493B32] leading-relaxed whitespace-pre-wrap">
              {order.options.additionalRequests || '없음'}
            </dd>
          </div>
        </dl>

        {/* Already Processed Banner (Duplicate Decision Guard) */}
        {!isPending && (
          <div
            className={cn(
              'rounded-2xl border p-4 text-sm space-y-2',
              order.status === '판매자 승인 완료'
                ? 'border-[#BBD0B5] bg-[#EEF4EC] text-[#355E3B]'
                : 'border-[#E4B8AF] bg-[#FBF0ED] text-[#9F4A3B]'
            )}
          >
            <div className="flex items-center gap-2 font-bold">
              {order.status === '판매자 승인 완료' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span>
                {order.status === '판매자 승인 완료'
                  ? '이미 승인 완료된 주문입니다.'
                  : '이미 거절 처리된 주문입니다.'}
              </span>
            </div>

            {order.status === '판매자 거절' && (
              <div className="rounded-xl bg-[#FFFFFF]/85 border border-[#E4B8AF]/80 px-3 py-2 text-[#493B32]">
                <span className="text-xs font-semibold text-[#9F4A3B] block">
                  등록된 거절 사유
                </span>
                <p className="mt-0.5 text-sm leading-relaxed">
                  {order.rejectionReason || '-'}
                </p>
              </div>
            )}

            {order.reviewedAt && (
              <p className="text-xs opacity-90 tabular-nums">
                처리 일시: {formatOrderTimestampDate(order.reviewedAt)}
              </p>
            )}
          </div>
        )}

        {/* Inline Error */}
        {actionError && (
          <div
            role="alert"
            className="rounded-2xl border border-[#E4B8AF] bg-[#FBF0ED] px-4 py-3 text-xs sm:text-sm text-[#9F4A3B]"
          >
            {actionError}
          </div>
        )}

        {/* Pending Order Decision Controls */}
        {isPending && actionStep === 'idle' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={() => {
                setActionError(null);
                setActionStep('reject-reason');
              }}
              className="border-[#9F4A3B]/50 text-[#9F4A3B] hover:bg-[#FBF0ED]"
            >
              <XCircle className="h-4 w-4" aria-hidden="true" />
              <span>주문 거절</span>
            </Button>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                setActionError(null);
                setActionStep('confirm-approve');
              }}
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>주문 승인</span>
            </Button>
          </div>
        )}

        {/* Approve Confirmation Panel */}
        {isPending && actionStep === 'confirm-approve' && (
          <div className="rounded-2xl border border-[#BBD0B5] bg-[#EEF4EC] p-4 space-y-3">
            <p className="text-sm font-bold text-[#355E3B]">
              이 주문을 승인하시겠습니까?
            </p>
            <p className="text-xs text-[#355E3B] leading-relaxed">
              승인 확정 시 주문 상태가 &lsquo;판매자 승인 완료&rsquo;로 변경되며, 소비자 마이페이지에도 즉시 반영됩니다. 승인 후에는 다시 변경할 수 없습니다.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => {
                  setActionError(null);
                  setActionStep('idle');
                }}
              >
                취소
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleConfirmApprove}
              >
                승인 확정
              </Button>
            </div>
          </div>
        )}

        {/* Reject Reason Input Panel */}
        {isPending && actionStep === 'reject-reason' && (
          <div className="rounded-2xl border border-[#E4B8AF] bg-[#FBF0ED]/65 p-4 space-y-3">
            <div>
              <label
                htmlFor="seller-rejection-reason"
                className="block text-sm font-bold text-[#493B32]"
              >
                거절 사유 <span className="text-[#9F4A3B]">*필수</span>
              </label>
              <p className="mt-1 text-xs text-[#6E5C50]">
                소비자가 주문 내역에서 확인할 수 있도록 구체적인 거절 사유를 입력해 주세요.
              </p>
              <textarea
                id="seller-rejection-reason"
                rows={3}
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (actionError) setActionError(null);
                }}
                placeholder="예: 선택하신 날짜의 제작 예약이 마감되었습니다. / 요청하신 디자인 작업이 어렵습니다."
                className="mt-2.5 w-full rounded-2xl border border-[#D8C9B5] bg-[#FFFFFF] px-4 py-3 text-sm text-[#493B32] placeholder:text-[#9A8A7E] focus:outline-none focus:ring-2 focus:ring-[#B58C6A]/50"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2.5">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => {
                  setActionError(null);
                  setActionStep('idle');
                }}
              >
                취소
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleProceedToRejectConfirm}
                className="bg-[#9F4A3B] hover:bg-[#863B2E]"
              >
                거절 확인으로 이동
              </Button>
            </div>
          </div>
        )}

        {/* Reject Final Confirmation Panel */}
        {isPending && actionStep === 'confirm-reject' && (
          <div className="rounded-2xl border border-[#E4B8AF] bg-[#FBF0ED] p-4 space-y-3">
            <p className="text-sm font-bold text-[#9F4A3B]">
              입력한 사유로 주문을 거절하시겠습니까?
            </p>
            <div className="rounded-xl bg-[#FFFFFF] border border-[#E4B8AF]/80 px-3 py-2 text-sm text-[#493B32]">
              <span className="text-xs font-semibold text-[#9F4A3B] block">
                거절 사유 미리보기
              </span>
              <p className="mt-0.5 leading-relaxed">{rejectionReason.trim()}</p>
            </div>
            <p className="text-xs text-[#9F4A3B] leading-relaxed">
              거절 확정 후에는 주문 상태가 &lsquo;판매자 거절&rsquo;로 고정되며 다시 변경할 수 없습니다.
            </p>
            <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => setActionStep('reject-reason')}
              >
                사유 수정
              </Button>
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={handleConfirmReject}
                className="bg-[#9F4A3B] hover:bg-[#863B2E]"
              >
                거절 확정
              </Button>
            </div>
          </div>
        )}

        {!isPending && (
          <Button variant="primary" size="lg" fullWidth onClick={onClose}>
            닫기
          </Button>
        )}
      </div>
    </div>
  );
};
