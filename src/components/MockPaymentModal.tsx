import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  CreditCard,
  Info,
  Landmark,
  Smartphone,
  X,
} from 'lucide-react';
import { Button } from './Button';
import { SafeImage } from './SafeImage';
import { formatPriceKRW } from '../data/mockShops';
import {
  formatOrderTimestampDate,
  PAYMENT_METHOD_OPTIONS,
} from '../services/orderStorage';
import type { CakeOrder, PaymentMethod } from '../types';
import { cn } from '../utils/cn';
import { formatKoreanDate } from '../utils/dateUtils';

interface MockPaymentModalProps {
  order: CakeOrder | null;
  onClose: () => void;
  onConfirmPayment: (
    orderId: string,
    paymentMethod: PaymentMethod
  ) => { ok: boolean; error?: string; updatedOrder?: CakeOrder };
}

type PaymentStep = 'select' | 'confirm' | 'completed';

const PAYMENT_ICONS: Record<PaymentMethod, React.FC<{ className?: string }>> = {
  '신용·체크카드': CreditCard,
  간편결제: Smartphone,
  무통장입금: Landmark,
};

export const MockPaymentModal: React.FC<MockPaymentModalProps> = ({
  order,
  onClose,
  onConfirmPayment,
}) => {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>('신용·체크카드');
  const [step, setStep] = useState<PaymentStep>('select');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<CakeOrder | null>(null);

  useEffect(() => {
    setSelectedMethod('신용·체크카드');
    setErrorMessage(null);
    if (order?.status === '결제 완료 및 예약 확정' || order?.payment?.isPaid) {
      setCompletedOrder(order);
      setStep('completed');
    } else {
      setCompletedOrder(null);
      setStep('select');
    }
  }, [order?.orderId, order?.status, order?.payment?.isPaid]);

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

  const activeOrder = completedOrder ?? order;
  const isAlreadyPaid =
    activeOrder.status === '결제 완료 및 예약 확정' ||
    Boolean(activeOrder.payment?.isPaid);
  const isApprovedAwaitingPayment =
    activeOrder.status === '판매자 승인 완료' && !isAlreadyPaid;

  const handleProceedConfirm = () => {
    setErrorMessage(null);
    if (!isApprovedAwaitingPayment) {
      setErrorMessage('판매자 승인 완료 상태의 주문만 결제할 수 있습니다.');
      return;
    }
    setStep('confirm');
  };

  const handleFinalizeDemoPayment = () => {
    setErrorMessage(null);
    const result = onConfirmPayment(activeOrder.orderId, selectedMethod);
    if (!result.ok || !result.updatedOrder) {
      setErrorMessage(result.error || '모의 결제를 진행할 수 없습니다.');
      setStep('select');
      return;
    }
    setCompletedOrder(result.updatedOrder);
    setStep('completed');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#493B32]/45 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mock-payment-modal-title"
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
            <p className="text-xs font-semibold text-[#8F6849]">
              시연용 모의 결제 · 예약 확정
            </p>
            <h2
              id="mock-payment-modal-title"
              className="mt-1 text-xl font-bold text-[#493B32]"
            >
              {step === 'completed'
                ? '결제 완료 및 예약 확정'
                : '주문 결제 진행'}
            </h2>
            <p className="mt-0.5 text-xs text-[#6E5C50] tabular-nums">
              주문 번호: {activeOrder.orderId}
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

        {/* Mandatory Demo Payment Disclaimer */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-[#D6B89C] bg-[#FAF8F3] p-4 text-xs sm:text-sm text-[#493B32]">
          <Info
            className="h-4 w-4 text-[#8F6849] mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="font-bold">
              실제 결제가 진행되지 않는 시연용 결제입니다.
            </p>
            <p className="text-xs text-[#6E5C50] leading-relaxed">
              실제 카드번호, 계좌번호 등 금융정보는 입력받거나 저장하지 않으며, 로컬 데모 환경에서만 예약 확정 상태가 저장됩니다.
            </p>
          </div>
        </div>

        {/* Completed State */}
        {step === 'completed' && activeOrder.payment && (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 rounded-2xl border border-[#BBD0B5] bg-[#EEF4EC] p-4 text-sm text-[#355E3B]">
              <CheckCircle2
                className="h-5 w-5 mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="font-bold">
                  모의 결제가 완료되어 예약이 최종 확정되었습니다.
                </p>
                <p className="text-xs leading-relaxed">
                  픽업 일정({formatKoreanDate(activeOrder.pickupDate)} ·{' '}
                  {activeOrder.pickupTime})에 맞춰 매장에서 케이크를 준비합니다.
                </p>
              </div>
            </div>

            <dl className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#6E5C50]">결제 완료 여부</dt>
                <dd className="font-semibold text-[#355E3B]">
                  결제 완료 (시연용)
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E9DFD0]">
                <dt className="text-[#6E5C50]">결제 수단</dt>
                <dd className="font-semibold text-[#493B32]">
                  {activeOrder.payment.paymentMethod}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E9DFD0]">
                <dt className="text-[#6E5C50]">결제 완료 날짜 및 시간</dt>
                <dd className="font-medium text-[#493B32] tabular-nums">
                  {formatOrderTimestampDate(activeOrder.payment.paidAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E9DFD0]">
                <dt className="text-[#6E5C50]">결제 금액</dt>
                <dd className="font-bold text-[#493B32] tabular-nums">
                  {formatPriceKRW(activeOrder.payment.paidAmount)}
                </dd>
              </div>
            </dl>

            <Button variant="primary" size="lg" fullWidth onClick={onClose}>
              마이페이지로 돌아가기
            </Button>
          </div>
        )}

        {/* Guard for Non-Payable Orders */}
        {step !== 'completed' && !isApprovedAwaitingPayment && (
          <div className="space-y-4">
            <div
              role="alert"
              className="rounded-2xl border border-[#E4B8AF] bg-[#FBF0ED] p-4 text-sm text-[#9F4A3B]"
            >
              현재 주문 상태({activeOrder.status})에서는 결제를 진행할 수 없습니다. 판매자가 승인한 주문만 결제할 수 있습니다.
            </div>
            <Button variant="primary" size="lg" fullWidth onClick={onClose}>
              확인
            </Button>
          </div>
        )}

        {/* Active Payment Selection / Confirmation Flow */}
        {step !== 'completed' && isApprovedAwaitingPayment && (
          <>
            {/* Order & Selected Options Summary */}
            <div className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 space-y-3.5">
              <div className="flex items-center gap-3.5">
                <SafeImage
                  src={activeOrder.cakeImage}
                  alt={activeOrder.cakeName}
                  containerClassName="h-16 w-20 rounded-xl border border-[#E9DFD0] shrink-0"
                  fallbackTitle={activeOrder.shopName}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#8F6849]">
                    {activeOrder.shopName} · {activeOrder.shopRegionText}
                  </p>
                  <p className="mt-0.5 text-sm sm:text-base font-bold text-[#493B32] truncate">
                    {activeOrder.cakeName}
                  </p>
                  <p className="mt-0.5 text-xs text-[#6E5C50] tabular-nums">
                    픽업: {formatKoreanDate(activeOrder.pickupDate)} ·{' '}
                    {activeOrder.pickupTime}
                  </p>
                </div>
              </div>

              <dl className="pt-3 border-t border-[#E9DFD0] space-y-2 text-xs sm:text-sm">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-[#6E5C50] shrink-0">선택한 케이크 옵션</dt>
                  <dd className="text-right font-medium text-[#493B32]">
                    {activeOrder.options.cakeSize} ·{' '}
                    {activeOrder.options.cakeShape} ·{' '}
                    {activeOrder.options.cakeFlavor}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-[#6E5C50] shrink-0">디자인 · 색상</dt>
                  <dd className="text-right font-medium text-[#493B32]">
                    {activeOrder.options.designType} ·{' '}
                    {activeOrder.options.cakeColor}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-[#6E5C50] shrink-0">레터링 문구</dt>
                  <dd className="text-right font-medium text-[#493B32]">
                    &ldquo;{activeOrder.options.letteringText}&rdquo;
                  </dd>
                </div>
                {activeOrder.options.additionalRequests && (
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-[#6E5C50] shrink-0">추가 요청</dt>
                    <dd className="text-right text-[#493B32]">
                      {activeOrder.options.additionalRequests}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Price Breakdown */}
            <div className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 space-y-3">
              <h3 className="text-sm font-bold text-[#493B32]">주문 금액 안내</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#6E5C50]">기본 가격</dt>
                  <dd className="font-semibold text-[#493B32] tabular-nums">
                    {formatPriceKRW(activeOrder.cakePrice)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#6E5C50]">추가 옵션 가격</dt>
                  <dd className="text-xs sm:text-sm font-medium text-[#8F6849] text-right">
                    등록된 가격 정보 없음 (판매자 확인 필요)
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
                  <dt className="font-bold text-[#493B32]">
                    최종 결제 금액 (기본가 기준)
                  </dt>
                  <dd className="text-lg font-bold text-[#8F6849] tabular-nums">
                    {formatPriceKRW(activeOrder.cakePrice)}
                  </dd>
                </div>
              </dl>
              <p className="text-xs text-[#6E5C50] leading-relaxed">
                현재 매장 데이터에는 기본 케이크 가격만 등록되어 있어 임의로 추가 요금을 계산하지 않습니다. 선택한 세부 옵션에 따라 정확한 최종 주문 금액이 변동될 수 있으므로 판매자 확인이 필요합니다.
              </p>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-2xl border border-[#E4B8AF] bg-[#FBF0ED] px-4 py-3 text-xs sm:text-sm text-[#9F4A3B]"
              >
                {errorMessage}
              </div>
            )}

            {/* Step 1: Select Payment Method */}
            {step === 'select' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-[#493B32]">
                    결제 수단 선택 (시연용)
                  </h3>
                  <div
                    role="radiogroup"
                    aria-label="시연용 결제 수단 선택"
                    className="mt-2.5 space-y-2.5"
                  >
                    {PAYMENT_METHOD_OPTIONS.map(({ method, subtitle }) => {
                      const isSelected = selectedMethod === method;
                      const MethodIcon = PAYMENT_ICONS[method];
                      return (
                        <button
                          key={method}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          onClick={() => {
                            setSelectedMethod(method);
                            if (errorMessage) setErrorMessage(null);
                          }}
                          className={cn(
                            'w-full min-h-[52px] rounded-2xl border p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer',
                            isSelected
                              ? 'border-[#8F6849] bg-[#F7EFE6]/70'
                              : 'border-[#E9DFD0] bg-[#FFFFFF] hover:border-[#B58C6A]'
                          )}
                        >
                          <MethodIcon
                            className={cn(
                              'h-5 w-5 mt-0.5 shrink-0',
                              isSelected ? 'text-[#8F6849]' : 'text-[#6E5C50]'
                            )}
                            aria-hidden="true"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-[#493B32]">
                              {method}
                            </p>
                            <p className="mt-0.5 text-xs text-[#6E5C50] leading-relaxed">
                              {subtitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={onClose}
                  >
                    취소
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleProceedConfirm}
                  >
                    결제하기
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Confirmation Prompt */}
            {step === 'confirm' && (
              <div className="rounded-2xl border border-[#D6B89C] bg-[#F7EFE6]/75 p-4 space-y-3.5">
                <h3 className="text-sm sm:text-base font-bold text-[#493B32]">
                  결제 확인 안내
                </h3>
                <dl className="space-y-1.5 text-xs sm:text-sm text-[#493B32]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#6E5C50]">매장 · 케이크</dt>
                    <dd className="font-semibold text-right">
                      {activeOrder.shopName} · {activeOrder.cakeName}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#6E5C50]">선택 결제 수단</dt>
                    <dd className="font-semibold text-right">
                      {selectedMethod}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#6E5C50]">최종 결제 금액</dt>
                    <dd className="font-bold text-[#8F6849] tabular-nums">
                      {formatPriceKRW(activeOrder.cakePrice)}
                    </dd>
                  </div>
                </dl>
                <p className="text-xs text-[#6E5C50] leading-relaxed">
                  실제 결제가 진행되지 않는 시연용 결제입니다. &lsquo;결제 확정&rsquo;을 누르면 주문 상태가 &lsquo;결제 완료 및 예약 확정&rsquo;으로 변경됩니다.
                </p>
                <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={() => setStep('select')}
                  >
                    이전
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={handleFinalizeDemoPayment}
                  >
                    결제 확정
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
