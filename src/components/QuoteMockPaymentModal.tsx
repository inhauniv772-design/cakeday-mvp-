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
import {
  isQuoteAwaitingPayment,
  isQuoteReservationConfirmed,
} from '../services/quoteRequestStorage';
import type { CustomQuoteRequest, PaymentMethod } from '../types';
import { cn } from '../utils/cn';
import { formatKoreanDate } from '../utils/dateUtils';

interface QuoteMockPaymentModalProps {
  quote: CustomQuoteRequest | null;
  isMissingQuote?: boolean;
  onClose: () => void;
  onConfirmPayment: (
    quoteId: string,
    paymentMethod: PaymentMethod
  ) => { ok: boolean; error?: string; updatedQuote?: CustomQuoteRequest };
}

type PaymentStep = 'select' | 'confirm' | 'completed';

const PAYMENT_ICONS: Record<PaymentMethod, React.FC<{ className?: string }>> = {
  '신용·체크카드': CreditCard,
  간편결제: Smartphone,
  무통장입금: Landmark,
};

export const QuoteMockPaymentModal: React.FC<QuoteMockPaymentModalProps> = ({
  quote,
  isMissingQuote = false,
  onClose,
  onConfirmPayment,
}) => {
  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod>('신용·체크카드');
  const [step, setStep] = useState<PaymentStep>('select');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedQuote, setCompletedQuote] =
    useState<CustomQuoteRequest | null>(null);

  useEffect(() => {
    setSelectedMethod('신용·체크카드');
    setErrorMessage(null);
    if (quote && isQuoteReservationConfirmed(quote)) {
      setCompletedQuote(quote);
      setStep('completed');
    } else {
      setCompletedQuote(null);
      setStep('select');
    }
  }, [quote?.quoteId, quote?.status, quote?.payment?.isPaid]);

  useEffect(() => {
    if (!quote && !isMissingQuote) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quote, isMissingQuote, onClose]);

  if (!quote) {
    if (!isMissingQuote) return null;
    return (
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#493B32]/45 backdrop-blur-xs p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-payment-missing-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[#FFFFFF] border border-[#E9DFD0] shadow-xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h2
              id="quote-payment-missing-title"
              className="text-lg font-bold text-[#493B32]"
            >
              결제할 맞춤 견적 정보를 찾을 수 없습니다.
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[#6E5C50] hover:bg-[#FAF8F3] hover:text-[#493B32] transition-colors cursor-pointer shrink-0"
              aria-label="닫기"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <p className="text-sm text-[#6E5C50] leading-relaxed">
            선택하신 맞춤 디자인 견적을 불러올 수 없습니다. 마이페이지 목록을 다시 확인해 주세요.
          </p>
          <Button variant="primary" size="lg" fullWidth onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    );
  }

  const activeQuote = completedQuote ?? quote;
  const acceptedQuote = activeQuote.acceptedQuote;
  const isAlreadyPaid = isQuoteReservationConfirmed(activeQuote);
  const canPay = isQuoteAwaitingPayment(activeQuote);

  const handleProceedConfirm = () => {
    setErrorMessage(null);
    if (!canPay || !acceptedQuote) {
      setErrorMessage(
        '견적을 수락한 상태의 미결제 건만 모의 결제를 진행할 수 있습니다.'
      );
      return;
    }
    setStep('confirm');
  };

  const handleFinalizeDemoPayment = () => {
    setErrorMessage(null);
    const result = onConfirmPayment(activeQuote.quoteId, selectedMethod);
    if (!result.ok || !result.updatedQuote) {
      setErrorMessage(result.error || '모의 결제를 진행할 수 없습니다.');
      setStep('select');
      return;
    }
    setCompletedQuote(result.updatedQuote);
    setStep('completed');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#493B32]/45 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-mock-payment-title"
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
              시연용 모의 결제 · 맞춤 디자인 예약 확정
            </p>
            <h2
              id="quote-mock-payment-title"
              className="mt-1 text-xl font-bold text-[#493B32]"
            >
              {step === 'completed' || isAlreadyPaid
                ? '결제 완료 및 예약 확정'
                : '수락한 견적 모의 결제'}
            </h2>
            <p className="mt-0.5 text-xs text-[#6E5C50] tabular-nums">
              견적 요청 ID: {activeQuote.quoteId}
              {acceptedQuote ? ` · 수락 견적 v${acceptedQuote.version}` : ''}
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

        {/* Simulation Disclaimer */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-[#D6B89C] bg-[#FAF8F3] p-4 text-xs sm:text-sm text-[#493B32]">
          <Info
            className="h-4 w-4 text-[#8F6849] mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="font-bold">
              실제 결제가 진행되지 않는 시뮬레이션 결제입니다.
            </p>
            <p className="text-xs text-[#6E5C50] leading-relaxed">
              실제 카드번호, 계좌번호, 비밀번호 등 금융정보는 입력받거나 저장하지 않으며, 취소 시 예약이 확정되지 않습니다.
            </p>
          </div>
        </div>

        {/* Completed State */}
        {step === 'completed' && activeQuote.payment && (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 rounded-2xl border border-[#BBD0B5] bg-[#EEF4EC] p-4 text-sm text-[#355E3B]">
              <CheckCircle2
                className="h-5 w-5 mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="font-bold">
                  모의 결제가 완료되어 맞춤 케이크 예약이 최종 확정되었습니다.
                </p>
                <p className="text-xs leading-relaxed">
                  수령 예정일({formatKoreanDate(activeQuote.payment.pickupDate)} ·{' '}
                  {activeQuote.payment.pickupTime})에 맞춰 매장에서 제작을 준비합니다.
                </p>
              </div>
            </div>

            <dl className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 space-y-2.5 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#6E5C50]">견적 요청 ID</dt>
                <dd className="font-medium text-[#493B32] tabular-nums">
                  {activeQuote.payment.quoteId}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E9DFD0]">
                <dt className="text-[#6E5C50]">수락한 견적 버전</dt>
                <dd className="font-semibold text-[#8F6849] tabular-nums">
                  v{activeQuote.payment.acceptedVersion}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E9DFD0]">
                <dt className="text-[#6E5C50]">확정 결제 금액</dt>
                <dd className="font-bold text-[#493B32] tabular-nums">
                  {formatPriceKRW(activeQuote.payment.paidAmount)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E9DFD0]">
                <dt className="text-[#6E5C50]">결제 방식</dt>
                <dd className="font-semibold text-[#493B32]">
                  {activeQuote.payment.paymentMethod} (결제 완료)
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E9DFD0]">
                <dt className="text-[#6E5C50]">결제 · 예약 확정 일시</dt>
                <dd className="font-medium text-[#493B32] tabular-nums text-right">
                  {formatOrderTimestampDate(activeQuote.payment.confirmedAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E9DFD0]">
                <dt className="text-[#6E5C50]">수령 예정 날짜 및 시간</dt>
                <dd className="font-semibold text-[#355E3B] tabular-nums text-right">
                  {formatKoreanDate(activeQuote.payment.pickupDate)} ·{' '}
                  {activeQuote.payment.pickupTime}
                </dd>
              </div>
            </dl>

            <Button variant="primary" size="lg" fullWidth onClick={onClose}>
              마이페이지로 돌아가기
            </Button>
          </div>
        )}

        {/* Guard for Non-Payable Quote */}
        {step !== 'completed' && !canPay && (
          <div className="space-y-4">
            <div
              role="alert"
              className="rounded-2xl border border-[#E4B8AF] bg-[#FBF0ED] p-4 text-sm text-[#9F4A3B]"
            >
              {isAlreadyPaid
                ? '이미 결제가 완료되어 예약이 확정된 건입니다. 중복 결제는 불가능합니다.'
                : `현재 상태(${activeQuote.status})에서는 결제를 진행할 수 없습니다. 판매자 견적을 수락한 뒤 결제를 진행해 주세요.`}
            </div>
            <Button variant="primary" size="lg" fullWidth onClick={onClose}>
              확인
            </Button>
          </div>
        )}

        {/* Active Payment Selection / Confirmation Flow */}
        {step !== 'completed' && canPay && acceptedQuote && (
          <>
            {/* Accepted Custom Design Summary */}
            <div className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 space-y-3.5">
              <div className="flex items-center gap-3.5">
                {activeQuote.images[0] ? (
                  <SafeImage
                    src={activeQuote.images[0].dataUrl}
                    alt={`${activeQuote.shopName} 커스텀 케이크 참고 사진`}
                    containerClassName="h-16 w-20 rounded-xl border border-[#E9DFD0] shrink-0"
                    fallbackTitle={activeQuote.shopName}
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[#8F6849]">
                    {activeQuote.shopName} · {activeQuote.shopRegionText}
                  </p>
                  <p className="mt-0.5 text-sm sm:text-base font-bold text-[#493B32] truncate">
                    커스텀 디자인 케이크 ({activeQuote.cakeSize})
                  </p>
                  <p className="mt-0.5 text-xs text-[#6E5C50] tabular-nums">
                    수령: {formatKoreanDate(acceptedQuote.availableDate)} ·{' '}
                    {acceptedQuote.availableTime}
                  </p>
                </div>
              </div>

              <dl className="pt-3 border-t border-[#E9DFD0] space-y-2 text-xs sm:text-sm">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-[#6E5C50] shrink-0">케이크 사양</dt>
                  <dd className="text-right font-medium text-[#493B32]">
                    {activeQuote.cakeSize} · {activeQuote.cakeShape} ·{' '}
                    {activeQuote.cakeFlavor}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-[#6E5C50] shrink-0">색상 · 레터링</dt>
                  <dd className="text-right font-medium text-[#493B32]">
                    {activeQuote.cakeColor} · &ldquo;{activeQuote.letteringText}
                    &rdquo;
                  </dd>
                </div>
                {acceptedQuote.conditionalNote && (
                  <div className="rounded-xl bg-[#F7EFE6] border border-[#D6B89C] p-3 space-y-1">
                    <dt className="text-xs font-bold text-[#8F6849]">
                      견적에 포함된 제작 조건
                    </dt>
                    <dd className="text-xs text-[#493B32] leading-relaxed whitespace-pre-wrap">
                      {acceptedQuote.conditionalNote}
                    </dd>
                  </div>
                )}
                {acceptedQuote.designGuide && (
                  <div className="rounded-xl bg-[#FFFFFF] border border-[#E9DFD0] p-3 space-y-1">
                    <dt className="text-xs font-bold text-[#6E5C50]">
                      판매자 제작 안내
                    </dt>
                    <dd className="text-xs text-[#493B32] leading-relaxed whitespace-pre-wrap">
                      {acceptedQuote.designGuide}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Confirmed Price Summary */}
            <div className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 space-y-2.5">
              <h3 className="text-sm font-bold text-[#493B32]">
                수락한 견적 금액 확인 (v{acceptedQuote.version})
              </h3>
              <dl className="space-y-2 text-sm">
                {acceptedQuote.extraFeeReason && (
                  <div className="flex items-start justify-between gap-3 text-xs">
                    <dt className="text-[#6E5C50] shrink-0">
                      포함된 추가 비용 안내
                    </dt>
                    <dd className="text-right text-[#493B32]">
                      {typeof acceptedQuote.extraFeeAmount === 'number'
                        ? `+${formatPriceKRW(acceptedQuote.extraFeeAmount)} (`
                        : ''}
                      {acceptedQuote.extraFeeReason}
                      {typeof acceptedQuote.extraFeeAmount === 'number'
                        ? ')'
                        : ''}
                    </dd>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#E9DFD0]">
                  <dt className="font-bold text-[#493B32]">
                    최종 확정 견적 금액
                  </dt>
                  <dd className="text-lg font-bold text-[#8F6849] tabular-nums">
                    {formatPriceKRW(acceptedQuote.finalPrice)}
                  </dd>
                </div>
              </dl>
            </div>

            {errorMessage && (
              <div
                role="alert"
                className="rounded-2xl border border-[#E4B8AF] bg-[#FBF0ED] px-4 py-3 text-xs sm:text-sm text-[#9F4A3B]"
              >
                {errorMessage}
              </div>
            )}

            {/* Step 1: Payment Method */}
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
                    취소 (결제 보류)
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

            {/* Step 2: Confirm Prompt */}
            {step === 'confirm' && (
              <div className="rounded-2xl border border-[#D6B89C] bg-[#F7EFE6]/75 p-4 space-y-3.5">
                <h3 className="text-sm sm:text-base font-bold text-[#493B32]">
                  모의 결제 최종 확인
                </h3>
                <dl className="space-y-1.5 text-xs sm:text-sm text-[#493B32]">
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#6E5C50]">매장 · 수락 견적</dt>
                    <dd className="font-semibold text-right">
                      {activeQuote.shopName} · v{acceptedQuote.version}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#6E5C50]">결제 수단</dt>
                    <dd className="font-semibold text-right">
                      {selectedMethod}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-[#6E5C50]">최종 결제 금액</dt>
                    <dd className="font-bold text-[#8F6849] tabular-nums">
                      {formatPriceKRW(acceptedQuote.finalPrice)}
                    </dd>
                  </div>
                </dl>
                <p className="text-xs text-[#6E5C50] leading-relaxed">
                  실제 결제가 진행되지 않는 시연용 결제입니다. &lsquo;결제 확정&rsquo;을 누르면 결제가 완료되고 상태가 &lsquo;예약 확정&rsquo;으로 변경됩니다.
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
