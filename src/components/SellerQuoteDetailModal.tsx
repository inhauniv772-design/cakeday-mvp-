import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  History,
  Image as ImageIcon,
  Info,
  Lock,
  Send,
  User,
  X,
  ZoomIn,
} from 'lucide-react';
import { Button } from './Button';
import { DatePickerCalendar } from './DatePickerCalendar';
import { formatPriceKRW, getMockCakeShops } from '../data/mockShops';
import {
  formatOrderTimestampDate,
  PICKUP_TIME_OPTIONS,
} from '../services/orderStorage';
import {
  getQuoteFeasibilityBadgeClass,
  getQuoteStatusBadgeClass,
  isQuoteAwaitingPayment,
  isQuoteReservationConfirmed,
} from '../services/quoteRequestStorage';
import type {
  CustomQuoteRequest,
  QuoteAttachmentImage,
  QuoteFeasibility,
  SellerQuoteResponseInput,
  SellerQuoteVersion,
} from '../types';
import { cn } from '../utils/cn';
import { formatKoreanDate, getTodayString } from '../utils/dateUtils';
import { formatFileSizeLabel } from '../utils/quoteImageUtils';
import {
  parseWonAmount,
  validateSellerQuoteResponse,
  type SellerQuoteFormErrors,
} from '../utils/quoteValidation';

interface SellerQuoteDetailModalProps {
  quote: CustomQuoteRequest | null;
  isMissingQuote?: boolean;
  onClose: () => void;
  onSubmitQuoteResponse: (
    quoteId: string,
    input: SellerQuoteResponseInput
  ) => { ok: boolean; error?: string; updatedQuote?: CustomQuoteRequest };
  onStartEditingQuote: (quoteId: string) => {
    ok: boolean;
    error?: string;
    updatedQuote?: CustomQuoteRequest;
  };
  onCancelEditingQuote: (quoteId: string) => {
    ok: boolean;
    error?: string;
    updatedQuote?: CustomQuoteRequest;
  };
}

const FEASIBILITY_OPTIONS: Array<{
  value: QuoteFeasibility;
  title: string;
  description: string;
}> = [
  {
    value: '제작 가능',
    title: '제작 가능',
    description: '요청하신 디자인과 일정대로 제작할 수 있습니다.',
  },
  {
    value: '조건부 제작 가능',
    title: '조건부 제작 가능',
    description: '일부 디자인·일정 조정 후 제작할 수 있습니다.',
  },
  {
    value: '제작 불가능',
    title: '제작 불가능',
    description: '일정 마감 또는 공정상 제작이 어렵습니다.',
  },
];

function buildInitialSellerForm(
  quote: CustomQuoteRequest,
  todayStr: string
): SellerQuoteResponseInput {
  const defaultAvailableDate =
    quote.desiredPickupDate >= todayStr ? quote.desiredPickupDate : todayStr;
  const existing = quote.latestQuote;

  if (!existing) {
    return {
      feasibility: '제작 가능',
      finalPrice: '',
      hasExtraFee: false,
      extraFeeAmount: '',
      extraFeeReason: '',
      availableDate: defaultAvailableDate,
      availableTime: quote.desiredPickupTime || '14:00',
      designGuide: '',
      conditionalNote: '',
      impossibilityReason: '',
    };
  }

  return {
    feasibility: existing.feasibility,
    finalPrice:
      typeof existing.finalPrice === 'number'
        ? String(existing.finalPrice)
        : '',
    hasExtraFee: Boolean(existing.extraFeeAmount || existing.extraFeeReason),
    extraFeeAmount:
      typeof existing.extraFeeAmount === 'number'
        ? String(existing.extraFeeAmount)
        : '',
    extraFeeReason: existing.extraFeeReason ?? '',
    availableDate:
      existing.availableDate && existing.availableDate >= todayStr
        ? existing.availableDate
        : defaultAvailableDate,
    availableTime:
      existing.availableTime || quote.desiredPickupTime || '14:00',
    designGuide: existing.designGuide ?? '',
    conditionalNote: existing.conditionalNote ?? '',
    impossibilityReason: existing.impossibilityReason ?? '',
  };
}

export const SellerQuoteDetailModal: React.FC<SellerQuoteDetailModalProps> = ({
  quote,
  isMissingQuote = false,
  onClose,
  onSubmitQuoteResponse,
  onStartEditingQuote,
  onCancelEditingQuote,
}) => {
  const todayStr = useMemo(() => getTodayString(), []);
  const shopReference = useMemo(() => {
    if (!quote) return null;
    return getMockCakeShops().find((s) => s.shopId === quote.shopId) ?? null;
  }, [quote]);

  const [zoomedImage, setZoomedImage] = useState<QuoteAttachmentImage | null>(
    null
  );
  const [form, setForm] = useState<SellerQuoteResponseInput>(() =>
    quote
      ? buildInitialSellerForm(quote, todayStr)
      : {
          feasibility: '제작 가능',
          finalPrice: '',
          hasExtraFee: false,
          extraFeeAmount: '',
          extraFeeReason: '',
          availableDate: todayStr,
          availableTime: '14:00',
          designGuide: '',
          conditionalNote: '',
          impossibilityReason: '',
        }
  );
  const [fieldErrors, setFieldErrors] = useState<SellerQuoteFormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (quote) {
      setForm(buildInitialSellerForm(quote, todayStr));
      setFieldErrors({});
      setSubmitError(null);
      setZoomedImage(null);
      setShowHistory(false);
    }
  }, [quote?.quoteId, quote?.status, todayStr]);

  useEffect(() => {
    if (!quote && !isMissingQuote) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (zoomedImage) {
          setZoomedImage(null);
          return;
        }
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [quote, isMissingQuote, zoomedImage, onClose]);

  if (!quote) {
    if (!isMissingQuote) return null;
    return (
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#493B32]/45 backdrop-blur-xs p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="seller-quote-missing-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[#FFFFFF] border border-[#E9DFD0] shadow-xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h2
              id="seller-quote-missing-title"
              className="text-lg font-bold text-[#493B32]"
            >
              해당 견적 요청 정보를 찾을 수 없습니다.
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
            선택하신 견적 요청을 불러올 수 없습니다. 목록에서 다시 확인해 주세요.
          </p>
          <Button variant="primary" size="lg" fullWidth onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    );
  }

  const isLockedByAcceptance = Boolean(
    quote.isAcceptedByConsumer || quote.acceptedQuote || quote.payment?.isPaid
  );
  const awaitingPayment = isQuoteAwaitingPayment(quote);
  const reservationConfirmed = isQuoteReservationConfirmed(quote);
  const hasExistingQuote = Boolean(quote.latestQuote);
  const isFormMode =
    !isLockedByAcceptance &&
    (!hasExistingQuote ||
      quote.status === '견적 수정 중' ||
      quote.status === '소비자 수정 요청');
  const parsedPricePreview = parseWonAmount(form.finalPrice);
  const parsedExtraPreview = parseWonAmount(form.extraFeeAmount);
  const historyList: SellerQuoteVersion[] = quote.quoteHistory ?? [];
  const revisionList = quote.revisionRequests ?? [];

  const handleFieldChange = <K extends keyof SellerQuoteResponseInput>(
    key: K,
    value: SellerQuoteResponseInput[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSubmitError(null);
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const errors = validateSellerQuoteResponse(form, todayStr);
    if (Object.values(errors).some(Boolean)) {
      setFieldErrors(errors);
      setSubmitError('입력되지 않았거나 확인이 필요한 항목을 점검해 주세요.');
      return;
    }

    const result = onSubmitQuoteResponse(quote.quoteId, form);
    if (!result.ok) {
      setSubmitError(result.error ?? '견적 저장에 실패했습니다.');
      return;
    }
    setFieldErrors({});
    setSubmitError(null);
  };

  const handleStartEdit = () => {
    setSubmitError(null);
    const result = onStartEditingQuote(quote.quoteId);
    if (!result.ok) {
      setSubmitError(result.error ?? '견적 수정 상태로 전환하지 못했습니다.');
    }
  };

  const handleCancelEdit = () => {
    setSubmitError(null);
    setFieldErrors({});
    const result = onCancelEditingQuote(quote.quoteId);
    if (!result.ok) {
      setSubmitError(result.error ?? '견적 수정 취소에 실패했습니다.');
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#493B32]/45 backdrop-blur-xs p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="seller-quote-detail-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#FFFFFF] border border-[#E9DFD0] shadow-xl p-5 sm:p-7 space-y-6">
          <div
            className="sm:hidden w-10 h-1.5 rounded-full bg-[#E9DFD0] mx-auto"
            aria-hidden="true"
          />

          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    'inline-block rounded-lg px-3 py-1 text-xs font-semibold',
                    getQuoteStatusBadgeClass(quote.status)
                  )}
                >
                  {quote.status}
                </span>
                {quote.latestQuote && (
                  <span className="inline-block rounded-lg bg-[#FAF8F3] border border-[#E9DFD0] px-2.5 py-1 text-xs font-semibold text-[#8F6849] tabular-nums">
                    최신 견적 v{quote.latestQuote.version}
                  </span>
                )}
              </div>
              <h2
                id="seller-quote-detail-title"
                className="mt-2 text-xl font-bold text-[#493B32]"
              >
                접수된 맞춤 디자인 견적 요청
              </h2>
              <p className="mt-0.5 text-xs text-[#6E5C50] tabular-nums">
                요청 번호: {quote.quoteId}
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

          {/* Consumer Info */}
          <div className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8F6849]">
              <User className="h-4 w-4" aria-hidden="true" />
              <span>요청한 소비자 정보</span>
            </div>
            <dl className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-[#6E5C50]">소비자 이름</dt>
                <dd className="mt-0.5 font-semibold text-[#493B32]">
                  {quote.customerName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[#6E5C50]">소비자 이메일</dt>
                <dd className="mt-0.5 font-medium text-[#493B32] break-all">
                  {quote.customerEmail}
                </dd>
              </div>
            </dl>
          </div>

          {/* Target Shop & Pickup Schedule */}
          <dl className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#6E5C50]">접수 매장</dt>
              <dd className="font-bold text-[#493B32] text-right">
                {quote.shopName}{' '}
                <span className="text-xs font-normal text-[#6E5C50]">
                  ({quote.shopRegionText})
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
              <dt className="text-[#6E5C50]">희망 수령 날짜 및 시간</dt>
              <dd className="font-semibold text-[#493B32] tabular-nums text-right">
                {formatKoreanDate(quote.desiredPickupDate)} ·{' '}
                {quote.desiredPickupTime}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
              <dt className="text-[#6E5C50]">요청 접수 일시</dt>
              <dd className="font-medium text-[#493B32] tabular-nums text-right">
                {formatOrderTimestampDate(quote.createdAt)}
              </dd>
            </div>
          </dl>

          {/* Attached Reference Images with Zoom */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#493B32]">
                <ImageIcon
                  className="h-4 w-4 text-[#B58C6A]"
                  aria-hidden="true"
                />
                <span>소비자 첨부 참고 사진 ({quote.images.length}장)</span>
              </div>
              <span className="text-xs text-[#8F6849]">
                사진을 눌러 크게 확인하세요
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {quote.images.map((img, index) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setZoomedImage(img)}
                  className="group text-left rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] overflow-hidden hover:border-[#B58C6A] transition-colors cursor-pointer"
                >
                  <div className="relative aspect-[4/3] w-full bg-[#FFFFFF]">
                    <img
                      src={img.dataUrl}
                      alt={`소비자 참고 사진 ${index + 1}: ${img.fileName}`}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-lg bg-[#493B32]/80 px-2 py-1 text-[11px] font-medium text-[#FFFFFF]">
                      <ZoomIn className="h-3 w-3" aria-hidden="true" />
                      <span>확대</span>
                    </span>
                  </div>
                  <div className="px-3 py-2 text-[11px] text-[#6E5C50]">
                    <p className="font-medium text-[#493B32] truncate">
                      {img.fileName}
                    </p>
                    <p className="tabular-nums">
                      {formatFileSizeLabel(img.sizeBytes)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cake Specs & Design Requests */}
          <dl className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#6E5C50]">케이크 크기 및 모양</dt>
              <dd className="font-medium text-[#493B32] text-right">
                {quote.cakeSize} · {quote.cakeShape}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
              <dt className="text-[#6E5C50]">맛 또는 시트 종류</dt>
              <dd className="font-medium text-[#493B32] text-right">
                {quote.cakeFlavor}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
              <dt className="text-[#6E5C50]">원하는 색상</dt>
              <dd className="font-medium text-[#493B32] text-right">
                {quote.cakeColor}
              </dd>
            </div>
            <div className="pt-2.5 border-t border-[#E9DFD0]">
              <dt className="text-xs text-[#6E5C50]">레터링 문구</dt>
              <dd className="mt-1 font-semibold text-[#493B32]">
                &ldquo;{quote.letteringText}&rdquo;
              </dd>
            </div>
            <div className="pt-2.5 border-t border-[#E9DFD0]">
              <dt className="text-xs text-[#6E5C50]">
                추가 장식 및 디자인 설명
              </dt>
              <dd className="mt-1 text-[#493B32] leading-relaxed whitespace-pre-wrap">
                {quote.designDescription}
              </dd>
            </div>
            <div className="pt-2.5 border-t border-[#E9DFD0]">
              <dt className="text-xs text-[#6E5C50]">기타 요청 사항</dt>
              <dd className="mt-1 text-[#493B32] leading-relaxed whitespace-pre-wrap">
                {quote.additionalRequests || '없음'}
              </dd>
            </div>
          </dl>

          {/* Divider for Seller Quote Authoring / Sent Quote */}
          <div className="pt-2 border-t border-[#E9DFD0] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#493B32]">
                판매자 견적 응답 및 제작 가능 여부
              </h3>
              {shopReference && (
                <span className="text-xs text-[#6E5C50] tabular-nums">
                  매장 기본 케이크 참고가:{' '}
                  {formatPriceKRW(shopReference.representativeCakePrice)}
                </span>
              )}
            </div>

            {isLockedByAcceptance && quote.acceptedQuote && (
              <div
                className={cn(
                  'rounded-2xl border p-4 space-y-3',
                  reservationConfirmed
                    ? 'border-[#BBD0B5] bg-[#EEF4EC]/80'
                    : 'border-[#C9A882] bg-[#F5EBD9]/75'
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Lock
                      className={cn(
                        'h-4 w-4 shrink-0',
                        reservationConfirmed ? 'text-[#355E3B]' : 'text-[#8F6849]'
                      )}
                      aria-hidden="true"
                    />
                    <span className="text-sm font-bold text-[#493B32]">
                      {reservationConfirmed
                        ? '결제 완료 및 예약 확정 (견적 변경 불가)'
                        : '소비자 견적 수락 완료 · 결제 대기 (견적 변경 불가)'}
                    </span>
                  </div>
                  <span className="rounded-md bg-[#FFFFFF] border border-[#E9DFD0] px-2 py-0.5 text-xs font-semibold text-[#8F6849] tabular-nums">
                    확정 견적 v{quote.acceptedQuote.version}
                  </span>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-[#493B32]">
                  <div>
                    <dt className="text-xs text-[#6E5C50]">최종 확정 금액</dt>
                    <dd className="font-bold text-[#8F6849] tabular-nums">
                      {formatPriceKRW(quote.acceptedQuote.finalPrice)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#6E5C50]">결제 여부</dt>
                    <dd
                      className={cn(
                        'font-semibold',
                        reservationConfirmed ? 'text-[#355E3B]' : 'text-[#8F6849]'
                      )}
                    >
                      {reservationConfirmed && quote.payment
                        ? `결제 완료 (${quote.payment.paymentMethod})`
                        : awaitingPayment
                          ? '미결제 (소비자 결제 대기 중)'
                          : '미결제'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#6E5C50]">예약 확정 여부</dt>
                    <dd
                      className={cn(
                        'font-semibold',
                        reservationConfirmed ? 'text-[#355E3B]' : 'text-[#6E5C50]'
                      )}
                    >
                      {reservationConfirmed ? '예약 확정 완료' : '결제 완료 후 확정'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-[#6E5C50]">수령 예정 날짜 및 시간</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatKoreanDate(
                        quote.payment?.pickupDate ??
                          quote.acceptedQuote.availableDate
                      )}{' '}
                      ·{' '}
                      {quote.payment?.pickupTime ??
                        quote.acceptedQuote.availableTime}
                    </dd>
                  </div>
                </dl>

                {quote.payment && (
                  <p className="text-xs text-[#355E3B] tabular-nums">
                    결제 · 예약 확정 일시:{' '}
                    {formatOrderTimestampDate(quote.payment.confirmedAt)}
                  </p>
                )}
              </div>
            )}

            {/* Consumer Revision Request Notice */}
            {revisionList.length > 0 && (
              <div className="rounded-2xl border border-[#DFB985] bg-[#FDF4E6]/85 p-4 space-y-2.5">
                <p className="text-xs sm:text-sm font-bold text-[#9A5B1A]">
                  소비자 수정 요청 내역 ({revisionList.length}건)
                </p>
                <div className="space-y-2">
                  {revisionList.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-xl bg-[#FFFFFF] border border-[#E9DFD0] p-3 text-xs space-y-1"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[#6E5C50]">
                        <span className="font-semibold text-[#9A5B1A] tabular-nums">
                          견적 v{rev.targetQuoteVersion}에 대한 수정 요청
                        </span>
                        <span className="tabular-nums">
                          {formatOrderTimestampDate(rev.requestedAt)}
                        </span>
                      </div>
                      <p className="font-semibold text-[#493B32]">
                        수정 희망 항목: {rev.categories.join(', ')}
                      </p>
                      <p className="text-[#493B32] leading-relaxed whitespace-pre-wrap">
                        {rev.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Existing Latest Quote Summary (when sent and not currently editing) */}
            {quote.latestQuote && !isFormMode && (
              <div className="rounded-2xl border border-[#B58C6A]/55 bg-[#FAF8F3] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'inline-block rounded-lg px-2.5 py-0.5 text-xs font-semibold',
                        getQuoteFeasibilityBadgeClass(
                          quote.latestQuote.feasibility
                        )
                      )}
                    >
                      {quote.latestQuote.feasibility}
                    </span>
                    <span className="text-xs font-semibold text-[#8F6849] tabular-nums">
                      최신 견적 (v{quote.latestQuote.version})
                    </span>
                  </div>
                  <span className="text-xs text-[#6E5C50] tabular-nums">
                    전송일시{' '}
                    {formatOrderTimestampDate(quote.latestQuote.respondedAt)}
                  </span>
                </div>

                {quote.latestQuote.feasibility === '제작 불가능' ? (
                  <div className="rounded-xl bg-[#FBF0ED] border border-[#E4B8AF] p-3.5 text-sm text-[#9F4A3B] space-y-1">
                    <p className="text-xs font-semibold">제작 불가 사유</p>
                    <p className="leading-relaxed whitespace-pre-wrap">
                      {quote.latestQuote.impossibilityReason}
                    </p>
                  </div>
                ) : (
                  <dl className="space-y-3 text-sm">
                    {quote.latestQuote.feasibility === '조건부 제작 가능' &&
                      quote.latestQuote.conditionalNote && (
                        <div className="rounded-xl bg-[#F7EFE6] border border-[#D6B89C] p-3.5 text-[#493B32] space-y-1">
                          <dt className="text-xs font-semibold text-[#8F6849]">
                            조건부 제작 및 디자인 변경 안내
                          </dt>
                          <dd className="leading-relaxed whitespace-pre-wrap">
                            {quote.latestQuote.conditionalNote}
                          </dd>
                        </div>
                      )}

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <dt className="text-[#6E5C50]">최종 견적 금액</dt>
                      <dd className="text-lg font-bold text-[#8F6849] tabular-nums">
                        {formatPriceKRW(quote.latestQuote.finalPrice ?? 0)}
                      </dd>
                    </div>

                    {(quote.latestQuote.extraFeeAmount ||
                      quote.latestQuote.extraFeeReason) && (
                      <div className="rounded-xl bg-[#FFFFFF] border border-[#E9DFD0] p-3 text-xs space-y-1">
                        <dt className="font-semibold text-[#8F6849]">
                          추가 비용 내역 및 사유
                          {typeof quote.latestQuote.extraFeeAmount === 'number'
                            ? ` (+${formatPriceKRW(quote.latestQuote.extraFeeAmount)})`
                            : ''}
                        </dt>
                        <dd className="text-[#493B32] leading-relaxed">
                          {quote.latestQuote.extraFeeReason}
                        </dd>
                      </div>
                    )}

                    {quote.latestQuote.availableDate && (
                      <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
                        <dt className="text-[#6E5C50]">제작·수령 가능 일시</dt>
                        <dd className="font-semibold text-[#493B32] tabular-nums text-right">
                          {formatKoreanDate(quote.latestQuote.availableDate)} ·{' '}
                          {quote.latestQuote.availableTime}
                        </dd>
                      </div>
                    )}

                    {quote.latestQuote.designGuide && (
                      <div className="pt-2.5 border-t border-[#E9DFD0]">
                        <dt className="text-xs text-[#6E5C50]">
                          디자인 및 제작 관련 안내
                        </dt>
                        <dd className="mt-1 text-[#493B32] leading-relaxed whitespace-pre-wrap">
                          {quote.latestQuote.designGuide}
                        </dd>
                      </div>
                    )}
                  </dl>
                )}

                {!isLockedByAcceptance && (
                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      size="md"
                      fullWidth
                      onClick={handleStartEdit}
                    >
                      <Edit3 className="h-4 w-4" aria-hidden="true" />
                      <span>견적 수정 및 재전송</span>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Seller Quote Input / Edit Form */}
            {isFormMode && (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {quote.status === '견적 수정 중' && quote.latestQuote && (
                  <div className="flex items-start gap-2.5 rounded-2xl border border-[#D6B89C] bg-[#F7EFE6] p-4 text-xs sm:text-sm text-[#493B32]">
                    <Edit3
                      className="h-4 w-4 text-[#8F6849] mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <div className="space-y-1">
                      <p className="font-semibold">
                        견적 수정 중 (기존 견적 v{quote.latestQuote.version} 보관됨)
                      </p>
                      <p className="text-xs text-[#6E5C50] leading-relaxed">
                        수정된 견적을 전송하면 상태가 &lsquo;견적 재전송&rsquo;으로 변경되며, 기존 견적은 이전 견적 이력에 보존됩니다.
                      </p>
                    </div>
                  </div>
                )}

                {/* Feasibility Selection */}
                <fieldset className="space-y-2.5">
                  <legend className="text-sm font-bold text-[#493B32]">
                    1. 제작 가능 여부 선택 *
                  </legend>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {FEASIBILITY_OPTIONS.map((option) => {
                      const isSelected = form.feasibility === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            handleFieldChange('feasibility', option.value)
                          }
                          aria-pressed={isSelected}
                          className={cn(
                            'rounded-2xl border p-3.5 text-left transition-colors cursor-pointer',
                            isSelected
                              ? 'border-[#8F6849] bg-[#FAF8F3] ring-1 ring-[#8F6849]'
                              : 'border-[#E9DFD0] bg-[#FFFFFF] hover:border-[#B58C6A]'
                          )}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-[#493B32]">
                              {option.title}
                            </span>
                            {isSelected && (
                              <CheckCircle2
                                className="h-4 w-4 text-[#8F6849] shrink-0"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                          <p className="mt-1 text-xs text-[#6E5C50] leading-relaxed">
                            {option.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {fieldErrors.feasibility && (
                    <p className="text-xs font-medium text-[#9F4A3B]">
                      {fieldErrors.feasibility}
                    </p>
                  )}
                </fieldset>

                {form.feasibility === '제작 불가능' ? (
                  <div className="space-y-2">
                    <label
                      htmlFor="seller-impossibility-reason"
                      className="block text-sm font-bold text-[#493B32]"
                    >
                      제작 불가 안내 사유 *
                    </label>
                    <textarea
                      id="seller-impossibility-reason"
                      rows={3}
                      value={form.impossibilityReason}
                      onChange={(e) =>
                        handleFieldChange('impossibilityReason', e.target.value)
                      }
                      placeholder="예: 요청하신 날짜의 제작 예약이 마감되었거나, 해당 구조 장식 제작이 어렵습니다."
                      className="w-full rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] px-4 py-3 text-sm text-[#493B32] placeholder:text-[#6E5C50]/60 focus:border-[#B58C6A] focus:bg-[#FFFFFF] focus:outline-none"
                    />
                    {fieldErrors.impossibilityReason && (
                      <p className="text-xs font-medium text-[#9F4A3B]">
                        {fieldErrors.impossibilityReason}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {form.feasibility === '조건부 제작 가능' && (
                      <div className="space-y-2">
                        <label
                          htmlFor="seller-conditional-note"
                          className="block text-sm font-bold text-[#493B32]"
                        >
                          변경이 필요한 디자인 및 제작 조건 설명 *
                        </label>
                        <textarea
                          id="seller-conditional-note"
                          rows={3}
                          value={form.conditionalNote}
                          onChange={(e) =>
                            handleFieldChange('conditionalNote', e.target.value)
                          }
                          placeholder="예: 생화 데코 대신 슈가 플라워로 대체 제작 가능하며, 레터링 길이상 테두리 리본을 상단 2곳으로 조정해야 합니다."
                          className="w-full rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] px-4 py-3 text-sm text-[#493B32] placeholder:text-[#6E5C50]/60 focus:border-[#B58C6A] focus:bg-[#FFFFFF] focus:outline-none"
                        />
                        {fieldErrors.conditionalNote && (
                          <p className="text-xs font-medium text-[#9F4A3B]">
                            {fieldErrors.conditionalNote}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Manual Quote Price Entry (No AI Auto-Calculation) */}
                    <div className="rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] p-4 space-y-4">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="seller-final-price"
                          className="block text-sm font-bold text-[#493B32]"
                        >
                          2. 최종 견적 금액 (판매자 직접 입력) *
                        </label>
                        <p className="text-xs text-[#6E5C50]">
                          AI 자동 계산 없이 공방 기준에 따라 최종 금액(원)을 직접 입력해 주세요.
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            id="seller-final-price"
                            type="text"
                            inputMode="numeric"
                            value={form.finalPrice}
                            onChange={(e) =>
                              handleFieldChange('finalPrice', e.target.value)
                            }
                            placeholder="예: 68000"
                            className="w-full rounded-2xl border border-[#E9DFD0] bg-[#FFFFFF] px-4 py-3 text-sm font-semibold text-[#493B32] tabular-nums placeholder:text-[#6E5C50]/60 focus:border-[#B58C6A] focus:outline-none"
                          />
                          <span className="text-sm font-semibold text-[#493B32] shrink-0">
                            원
                          </span>
                        </div>
                        {parsedPricePreview !== null && (
                          <p className="text-xs font-semibold text-[#8F6849] tabular-nums">
                            소비자 표시 금액: {formatPriceKRW(parsedPricePreview)}
                          </p>
                        )}
                        {fieldErrors.finalPrice && (
                          <p className="text-xs font-medium text-[#9F4A3B]">
                            {fieldErrors.finalPrice}
                          </p>
                        )}
                      </div>

                      {/* Optional Extra Cost Breakdown */}
                      <div className="pt-3 border-t border-[#E9DFD0] space-y-3">
                        <label className="inline-flex items-center gap-2.5 text-sm font-semibold text-[#493B32] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.hasExtraFee}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setForm((prev) => ({
                                ...prev,
                                hasExtraFee: checked,
                                extraFeeAmount: checked ? prev.extraFeeAmount : '',
                                extraFeeReason: checked ? prev.extraFeeReason : '',
                              }));
                              setFieldErrors((prev) => ({
                                ...prev,
                                extraFeeAmount: undefined,
                                extraFeeReason: undefined,
                              }));
                            }}
                            className="h-4 w-4 rounded accent-[#8F6849]"
                          />
                          <span>추가 비용이 포함된 견적입니다 (사유 기재)</span>
                        </label>

                        {(form.hasExtraFee ||
                          form.extraFeeAmount.trim() !== '' ||
                          form.extraFeeReason.trim() !== '') && (
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label
                                htmlFor="seller-extra-fee-amount"
                                className="block text-xs font-semibold text-[#6E5C50]"
                              >
                                추가 비용 금액 (선택)
                              </label>
                              <input
                                id="seller-extra-fee-amount"
                                type="text"
                                inputMode="numeric"
                                value={form.extraFeeAmount}
                                onChange={(e) =>
                                  handleFieldChange(
                                    'extraFeeAmount',
                                    e.target.value
                                  )
                                }
                                placeholder="예: 12000"
                                className="w-full rounded-xl border border-[#E9DFD0] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#493B32] tabular-nums focus:border-[#B58C6A] focus:outline-none"
                              />
                              {parsedExtraPreview !== null &&
                                parsedExtraPreview > 0 && (
                                  <p className="text-[11px] text-[#8F6849] tabular-nums">
                                    +{formatPriceKRW(parsedExtraPreview)}
                                  </p>
                                )}
                              {fieldErrors.extraFeeAmount && (
                                <p className="text-xs font-medium text-[#9F4A3B]">
                                  {fieldErrors.extraFeeAmount}
                                </p>
                              )}
                            </div>

                            <div className="sm:col-span-2 space-y-1">
                              <label
                                htmlFor="seller-extra-fee-reason"
                                className="block text-xs font-semibold text-[#6E5C50]"
                              >
                                추가 비용 발생 사유 *
                              </label>
                              <input
                                id="seller-extra-fee-reason"
                                type="text"
                                value={form.extraFeeReason}
                                onChange={(e) =>
                                  handleFieldChange(
                                    'extraFeeReason',
                                    e.target.value
                                  )
                                }
                                placeholder="예: 입체 리본 파이핑, 생화 톤 조색 및 투명 박스 포장"
                                className="w-full rounded-xl border border-[#E9DFD0] bg-[#FFFFFF] px-3 py-2.5 text-sm text-[#493B32] focus:border-[#B58C6A] focus:outline-none"
                              />
                              {fieldErrors.extraFeeReason && (
                                <p className="text-xs font-medium text-[#9F4A3B]">
                                  {fieldErrors.extraFeeReason}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Available Date & Time */}
                    <div className="space-y-3">
                      <p className="text-sm font-bold text-[#493B32]">
                        3. 제작 가능 날짜 및 수령 가능 시간 *
                      </p>
                      <DatePickerCalendar
                        value={form.availableDate}
                        onChange={(nextDate) =>
                          handleFieldChange('availableDate', nextDate)
                        }
                        minDate={todayStr}
                      />
                      {fieldErrors.availableDate && (
                        <p className="text-xs font-medium text-[#9F4A3B]">
                          {fieldErrors.availableDate}
                        </p>
                      )}

                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-[#6E5C50]">
                          수령 가능 시간 선택
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {PICKUP_TIME_OPTIONS.map((time) => {
                            const isSelected = form.availableTime === time;
                            return (
                              <button
                                key={time}
                                type="button"
                                onClick={() =>
                                  handleFieldChange('availableTime', time)
                                }
                                aria-pressed={isSelected}
                                className={cn(
                                  'min-h-[40px] rounded-xl border px-3.5 text-sm font-medium tabular-nums transition-colors cursor-pointer',
                                  isSelected
                                    ? 'bg-[#8F6849] text-[#FFFFFF] border-[#8F6849]'
                                    : 'bg-[#FFFFFF] text-[#493B32] border-[#E9DFD0] hover:border-[#B58C6A]'
                                )}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                        {fieldErrors.availableTime && (
                          <p className="text-xs font-medium text-[#9F4A3B]">
                            {fieldErrors.availableTime}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Design & Production Guide */}
                    <div className="space-y-2">
                      <label
                        htmlFor="seller-design-guide"
                        className="block text-sm font-bold text-[#493B32]"
                      >
                        4. 디자인 및 제작 관련 안내 *
                      </label>
                      <textarea
                        id="seller-design-guide"
                        rows={3}
                        value={form.designGuide}
                        onChange={(e) =>
                          handleFieldChange('designGuide', e.target.value)
                        }
                        placeholder="예: 참고 이미지의 파스텔 색감으로 조색 가능하며, 식용 색소 특성상 약간의 톤 차이가 있을 수 있습니다. 픽업 30분 전 냉장 보관 권장드립니다."
                        className="w-full rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] px-4 py-3 text-sm text-[#493B32] placeholder:text-[#6E5C50]/60 focus:border-[#B58C6A] focus:bg-[#FFFFFF] focus:outline-none"
                      />
                      {fieldErrors.designGuide && (
                        <p className="text-xs font-medium text-[#9F4A3B]">
                          {fieldErrors.designGuide}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {submitError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-2xl border border-[#E4B8AF] bg-[#FBF0ED] p-3.5 text-xs sm:text-sm text-[#9F4A3B]"
                  >
                    <AlertCircle
                      className="h-4 w-4 mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2.5">
                  {quote.status === '견적 수정 중' && quote.latestQuote && (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleCancelEdit}
                    >
                      수정 취소
                    </Button>
                  )}
                  <Button type="submit" variant="primary" size="lg" fullWidth>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    <span>
                      {quote.latestQuote
                        ? '수정된 견적 재전송'
                        : form.feasibility === '제작 불가능'
                          ? '제작 불가 안내 전송'
                          : '견적 전송하기'}
                    </span>
                  </Button>
                </div>
              </form>
            )}

            {/* Previous Quote History */}
            {historyList.length > 0 && (
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={() => setShowHistory((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#8F6849] hover:text-[#493B32] transition-colors cursor-pointer"
                >
                  <History className="h-4 w-4" aria-hidden="true" />
                  <span>
                    이전 견적 이력 ({historyList.length}건){' '}
                    {showHistory ? '접기' : '펼쳐 보기'}
                  </span>
                </button>

                {showHistory && (
                  <div className="space-y-2.5">
                    {historyList.map((item) => (
                      <div
                        key={`seller-history-v${item.version}`}
                        className="rounded-2xl border border-[#E9DFD0] bg-[#FFFFFF] p-4 space-y-2 text-xs text-[#6E5C50]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-[#E9DFD0] px-2 py-0.5 font-semibold text-[#493B32] tabular-nums">
                              이전 버전 v{item.version}
                            </span>
                            <span
                              className={cn(
                                'rounded-md px-2 py-0.5 font-semibold',
                                getQuoteFeasibilityBadgeClass(item.feasibility)
                              )}
                            >
                              {item.feasibility}
                            </span>
                          </div>
                          <span className="tabular-nums">
                            {formatOrderTimestampDate(item.respondedAt)}
                          </span>
                        </div>
                        {item.feasibility === '제작 불가능' ? (
                          <p className="text-[#9F4A3B]">
                            사유: {item.impossibilityReason}
                          </p>
                        ) : (
                          <div className="space-y-1">
                            <p className="font-semibold text-[#493B32] tabular-nums">
                              금액: {formatPriceKRW(item.finalPrice ?? 0)}
                              {item.extraFeeReason
                                ? ` (추가 비용 사유: ${item.extraFeeReason})`
                                : ''}
                            </p>
                            {item.availableDate && (
                              <p className="tabular-nums">
                                수령 가능: {formatKoreanDate(item.availableDate)}{' '}
                                · {item.availableTime}
                              </p>
                            )}
                            {item.conditionalNote && (
                              <p>조건: {item.conditionalNote}</p>
                            )}
                            {item.designGuide && <p>안내: {item.designGuide}</p>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stage 10 Scope Notice */}
          <div className="flex items-start gap-2.5 rounded-2xl border border-[#D6B89C] bg-[#F7EFE6]/65 p-4 text-xs text-[#493B32]">
            <Info
              className="h-4 w-4 text-[#8F6849] mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <p className="leading-relaxed">
              판매자가 작성·재전송한 견적을 소비자가 수락하고 모의 결제를 완료하면 예약 확정 상태가 자동으로 반영됩니다. 수락된 이후에는 기존 견적을 임의로 수정할 수 없습니다.
            </p>
          </div>

          <Button variant="outline" size="lg" fullWidth onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>

      {/* Image Zoom Lightbox Overlay */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#231B16]/85 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`참고 사진 확대 보기: ${zoomedImage.fileName}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setZoomedImage(null);
          }}
        >
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#FFFFFF] border border-[#E9DFD0] p-4 sm:p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#493B32] truncate">
                  {zoomedImage.fileName}
                </p>
                <p className="text-xs text-[#6E5C50] tabular-nums">
                  {formatFileSizeLabel(zoomedImage.sizeBytes)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#493B32] hover:bg-[#FAF8F3] cursor-pointer shrink-0"
                aria-label="확대 사진 닫기"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <div className="max-h-[72vh] overflow-hidden rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] flex items-center justify-center">
              <img
                src={zoomedImage.dataUrl}
                alt={`확대 보기: ${zoomedImage.fileName}`}
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
