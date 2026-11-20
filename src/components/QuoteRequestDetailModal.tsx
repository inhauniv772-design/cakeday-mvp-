import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  Edit3,
  History,
  Image as ImageIcon,
  Info,
  Lock,
  MessageSquarePlus,
  X,
  ZoomIn,
} from 'lucide-react';
import { Button } from './Button';
import { formatPriceKRW } from '../data/mockShops';
import { formatOrderTimestampDate } from '../services/orderStorage';
import {
  canConsumerRespondToQuote,
  getQuoteFeasibilityBadgeClass,
  getQuoteStatusBadgeClass,
  isQuoteAwaitingPayment,
  isQuoteReservationConfirmed,
} from '../services/quoteRequestStorage';
import type {
  CustomQuoteRequest,
  QuoteAttachmentImage,
  QuoteRequestStatus,
  SellerQuoteVersion,
} from '../types';
import { cn } from '../utils/cn';
import { formatKoreanDate } from '../utils/dateUtils';
import { formatFileSizeLabel } from '../utils/quoteImageUtils';
import {
  CONSUMER_REVISION_CATEGORY_OPTIONS,
  validateConsumerRevisionRequest,
  type ConsumerRevisionErrors,
} from '../utils/quoteValidation';

interface QuoteRequestDetailModalProps {
  quote: CustomQuoteRequest | null;
  isMissingQuote?: boolean;
  onClose: () => void;
  onAcceptQuote: (quoteId: string) => {
    ok: boolean;
    error?: string;
    updatedQuote?: CustomQuoteRequest;
  };
  onRequestRevision: (
    quoteId: string,
    categories: string[],
    note: string
  ) => {
    ok: boolean;
    error?: string;
    updatedQuote?: CustomQuoteRequest;
  };
  onOpenPayment: (quoteId: string) => void;
}

function getConsumerStatusBanner(status: QuoteRequestStatus): {
  title: string;
  body: string;
  toneClass: string;
  icon: 'waiting' | 'success' | 'warning' | 'danger' | 'editing' | 'locked';
} {
  switch (status) {
    case '예약 확정':
    case '결제 완료':
      return {
        title: '모의 결제가 완료되어 맞춤 케이크 예약이 확정되었습니다',
        body: '수락하신 견적 금액과 제작 조건으로 예약이 최종 확정되었습니다. 중복 결제는 진행되지 않습니다.',
        toneClass: 'border-[#BBD0B5] bg-[#EEF4EC] text-[#355E3B]',
        icon: 'success',
      };
    case '견적 수락':
    case '결제 대기':
      return {
        title: '견적을 수락했습니다 · 결제를 진행해 주세요',
        body: '수락한 견적 금액과 제작 조건이 확정되었습니다. 아래에서 모의 결제를 완료하면 예약이 최종 확정됩니다.',
        toneClass: 'border-[#C9A882] bg-[#F5EBD9] text-[#6B4A2D]',
        icon: 'locked',
      };
    case '소비자 수정 요청':
      return {
        title: '판매자에게 수정 요청을 전달했습니다',
        body: '작성하신 디자인·사양 수정 요청을 판매자가 확인한 뒤 새로운 견적을 다시 보내드릴 예정입니다.',
        toneClass: 'border-[#DFB985] bg-[#FDF4E6] text-[#9A5B1A]',
        icon: 'editing',
      };
    case '견적 도착':
      return {
        title: '판매자 견적이 도착했습니다',
        body: '최종 견적 금액과 제작 조건을 확인한 뒤 견적을 수락하거나 수정을 요청할 수 있습니다.',
        toneClass: 'border-[#BBD0B5] bg-[#EEF4EC] text-[#355E3B]',
        icon: 'success',
      };
    case '조건부 제작 가능':
      return {
        title: '조건부 제작 가능 안내가 도착했습니다',
        body: '판매자가 제시한 제작 조건과 최종 금액을 꼼꼼히 확인한 뒤 수락 또는 수정 요청을 선택해 주세요.',
        toneClass: 'border-[#D6B89C] bg-[#F7EFE6] text-[#8F6849]',
        icon: 'warning',
      };
    case '제작 불가능':
      return {
        title: '현재 요청 조건으로 제작이 어렵습니다',
        body: '매장에서 검토한 결과 제작 불가 사유를 회신했습니다. 아래 안내를 확인한 뒤 다른 날짜나 디자인으로 다시 문의하실 수 있습니다.',
        toneClass: 'border-[#E4B8AF] bg-[#FBF0ED] text-[#9F4A3B]',
        icon: 'danger',
      };
    case '견적 수정 중':
      return {
        title: '판매자가 견적을 수정하고 있습니다',
        body: '매장에서 기존 견적 내용을 재검토·수정 중입니다. 수정된 견적이 재전송될 때까지 직전 견적 내용도 아래에서 확인하실 수 있습니다.',
        toneClass: 'border-[#D7C3A8] bg-[#F6F1E6] text-[#7D5836]',
        icon: 'editing',
      };
    case '견적 재전송':
      return {
        title: '수정된 최신 견적이 재전송되었습니다',
        body: '판매자가 수정된 견적을 다시 보냈습니다. 최신 견적을 확인한 뒤 수락하거나 추가 수정 요청을 보낼 수 있습니다.',
        toneClass: 'border-[#AFC8BE] bg-[#E9F1EE] text-[#2F5249]',
        icon: 'success',
      };
    case '판매자 검토 대기':
    default:
      return {
        title: '판매자 검토 대기 중입니다',
        body: '매장에서 첨부하신 참고 사진과 제작 사양을 확인하고 있습니다. 판매자가 답변을 등록하면 이곳과 마이페이지에 표시됩니다.',
        toneClass: 'border-[#E9DFD0] bg-[#FAF8F3] text-[#6E5C50]',
        icon: 'waiting',
      };
  }
}

export const QuoteRequestDetailModal: React.FC<
  QuoteRequestDetailModalProps
> = ({
  quote,
  isMissingQuote = false,
  onClose,
  onAcceptQuote,
  onRequestRevision,
  onOpenPayment,
}) => {
  const [zoomedImage, setZoomedImage] = useState<QuoteAttachmentImage | null>(
    null
  );
  const [showHistory, setShowHistory] = useState(false);
  const [actionPanel, setActionPanel] = useState<'none' | 'accept' | 'revision'>(
    'none'
  );
  const [revisionCategories, setRevisionCategories] = useState<string[]>([]);
  const [revisionNote, setRevisionNote] = useState('');
  const [revisionErrors, setRevisionErrors] = useState<ConsumerRevisionErrors>(
    {}
  );
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    setZoomedImage(null);
    setShowHistory(false);
    setActionPanel('none');
    setRevisionCategories([]);
    setRevisionNote('');
    setRevisionErrors({});
    setActionError(null);
    setActionNotice(null);
  }, [quote?.quoteId]);

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
        aria-labelledby="quote-missing-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-[#FFFFFF] border border-[#E9DFD0] shadow-xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h2
              id="quote-missing-modal-title"
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
            요청 내역이 초기화되었거나 삭제되어 정보를 불러올 수 없습니다. 목록에서 다시 확인해 주세요.
          </p>
          <Button variant="primary" size="lg" fullWidth onClick={onClose}>
            닫기
          </Button>
        </div>
      </div>
    );
  }

  const banner = getConsumerStatusBanner(quote.status);
  const latestQuote = quote.latestQuote;
  const historyList: SellerQuoteVersion[] = quote.quoteHistory ?? [];
  const revisionList = quote.revisionRequests ?? [];
  const canRespond = canConsumerRespondToQuote(quote);
  const awaitingPayment = isQuoteAwaitingPayment(quote);
  const reservationConfirmed = isQuoteReservationConfirmed(quote);
  const acceptedQuote = quote.acceptedQuote;

  const toggleCategory = (category: string) => {
    setActionError(null);
    setRevisionErrors((prev) => ({ ...prev, categories: undefined }));
    setRevisionCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category]
    );
  };

  const handleConfirmAccept = () => {
    setActionError(null);
    const result = onAcceptQuote(quote.quoteId);
    if (!result.ok) {
      setActionError(result.error ?? '견적 수락 처리에 실패했습니다.');
      return;
    }
    setActionPanel('none');
    setActionNotice(
      '견적을 수락하여 금액과 제작 조건을 확정했습니다. 이제 모의 결제를 진행할 수 있습니다.'
    );
  };

  const handleSubmitRevision = (event: React.FormEvent) => {
    event.preventDefault();
    setActionError(null);
    const errors = validateConsumerRevisionRequest(
      revisionCategories,
      revisionNote
    );
    if (errors.categories || errors.note) {
      setRevisionErrors(errors);
      return;
    }

    const result = onRequestRevision(
      quote.quoteId,
      revisionCategories,
      revisionNote
    );
    if (!result.ok) {
      setActionError(result.error ?? '수정 요청 전송에 실패했습니다.');
      return;
    }
    setActionPanel('none');
    setRevisionCategories([]);
    setRevisionNote('');
    setRevisionErrors({});
    setActionNotice(
      '판매자에게 수정 요청을 전달했습니다. 새 견적이 도착하면 다시 확인해 주세요.'
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#493B32]/45 backdrop-blur-xs p-0 sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-detail-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-[#FFFFFF] border border-[#E9DFD0] shadow-xl p-5 sm:p-7 space-y-5">
          <div
            className="sm:hidden w-10 h-1.5 rounded-full bg-[#E9DFD0] mx-auto"
            aria-hidden="true"
          />

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
                {awaitingPayment && (
                  <span
                    className={cn(
                      'inline-block rounded-lg px-2.5 py-1 text-xs font-semibold',
                      getQuoteStatusBadgeClass('결제 대기')
                    )}
                  >
                    결제 대기
                  </span>
                )}
                {reservationConfirmed && (
                  <span
                    className={cn(
                      'inline-block rounded-lg px-2.5 py-1 text-xs font-semibold',
                      getQuoteStatusBadgeClass('결제 완료')
                    )}
                  >
                    결제 완료
                  </span>
                )}
                {latestQuote && (
                  <span className="inline-block rounded-lg bg-[#FAF8F3] border border-[#E9DFD0] px-2.5 py-1 text-xs font-semibold text-[#8F6849] tabular-nums">
                    최신 v{latestQuote.version}
                  </span>
                )}
              </div>
              <h2
                id="quote-detail-modal-title"
                className="mt-2 text-xl font-bold text-[#493B32]"
              >
                맞춤 디자인 견적 요청 상세
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

          {/* Action Feedback Notice */}
          {actionNotice && (
            <div
              role="status"
              className="flex items-start gap-2 rounded-2xl border border-[#BBD0B5] bg-[#EEF4EC] p-3.5 text-xs sm:text-sm text-[#355E3B]"
            >
              <CheckCircle2
                className="h-4 w-4 mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span className="leading-relaxed">{actionNotice}</span>
            </div>
          )}

          {/* Status Banner */}
          <div
            className={cn(
              'flex items-start gap-2.5 rounded-2xl border p-4 text-xs sm:text-sm',
              banner.toneClass
            )}
          >
            {banner.icon === 'success' && (
              <CheckCircle2
                className="h-4 w-4 mt-0.5 shrink-0"
                aria-hidden="true"
              />
            )}
            {banner.icon === 'danger' && (
              <AlertCircle
                className="h-4 w-4 mt-0.5 shrink-0"
                aria-hidden="true"
              />
            )}
            {banner.icon === 'editing' && (
              <Edit3
                className="h-4 w-4 mt-0.5 shrink-0"
                aria-hidden="true"
              />
            )}
            {banner.icon === 'locked' && (
              <Lock className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
            )}
            {(banner.icon === 'waiting' || banner.icon === 'warning') && (
              <Clock3
                className="h-4 w-4 mt-0.5 shrink-0"
                aria-hidden="true"
              />
            )}
            <div className="space-y-1">
              <p className="font-bold">{banner.title}</p>
              <p className="leading-relaxed opacity-90">{banner.body}</p>
            </div>
          </div>

          {/* Confirmed Reservation Payment Info (Stage 11) */}
          {reservationConfirmed && quote.payment && acceptedQuote && (
            <div className="rounded-2xl border border-[#BBD0B5] bg-[#EEF4EC]/75 p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-[#355E3B]">
                  결제 완료 및 예약 확정 정보
                </h3>
                <span className="rounded-lg bg-[#FFFFFF] border border-[#BBD0B5] px-2.5 py-0.5 text-xs font-semibold text-[#355E3B] tabular-nums">
                  수락 견적 v{quote.payment.acceptedVersion}
                </span>
              </div>
              <dl className="space-y-2 text-xs sm:text-sm text-[#493B32]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#6E5C50]">결제 방식</dt>
                  <dd className="font-semibold">
                    {quote.payment.paymentMethod} (시연용 결제 완료)
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#6E5C50]">최종 결제 금액</dt>
                  <dd className="font-bold text-[#355E3B] tabular-nums">
                    {formatPriceKRW(quote.payment.paidAmount)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#6E5C50]">수령 예정 날짜 및 시간</dt>
                  <dd className="font-semibold tabular-nums text-right">
                    {formatKoreanDate(quote.payment.pickupDate)} ·{' '}
                    {quote.payment.pickupTime}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#6E5C50]">결제 · 예약 확정 일시</dt>
                  <dd className="font-medium tabular-nums text-right">
                    {formatOrderTimestampDate(quote.payment.confirmedAt)}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Accepted Quote Snapshot awaiting payment */}
          {awaitingPayment && acceptedQuote && (
            <div className="rounded-2xl border border-[#C9A882] bg-[#F5EBD9]/75 p-5 space-y-3.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Lock
                    className="h-4 w-4 text-[#8F6849] shrink-0"
                    aria-hidden="true"
                  />
                  <h3 className="text-sm font-bold text-[#493B32]">
                    수락 확정 견적 (v{acceptedQuote.version}) · 결제 대기
                  </h3>
                </div>
                <span className="text-xs text-[#6E5C50] tabular-nums">
                  수락일시 {formatOrderTimestampDate(acceptedQuote.acceptedAt)}
                </span>
              </div>
              <dl className="space-y-2 text-xs sm:text-sm text-[#493B32]">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#6E5C50]">확정 견적 금액</dt>
                  <dd className="text-base font-bold text-[#8F6849] tabular-nums">
                    {formatPriceKRW(acceptedQuote.finalPrice)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-[#6E5C50]">수령 가능 일시</dt>
                  <dd className="font-semibold tabular-nums">
                    {formatKoreanDate(acceptedQuote.availableDate)} ·{' '}
                    {acceptedQuote.availableTime}
                  </dd>
                </div>
                {acceptedQuote.conditionalNote && (
                  <p className="rounded-xl bg-[#FFFFFF] border border-[#D6B89C] p-3 text-xs leading-relaxed">
                    <strong>확정된 제작 조건:</strong>{' '}
                    {acceptedQuote.conditionalNote}
                  </p>
                )}
              </dl>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => onOpenPayment(quote.quoteId)}
              >
                <CreditCard className="h-4 w-4" aria-hidden="true" />
                <span>
                  모의 결제하기 ({formatPriceKRW(acceptedQuote.finalPrice)})
                </span>
              </Button>
            </div>
          )}

          {/* Seller Quote Response Section (Latest Quote) */}
          {latestQuote && (
            <div className="rounded-2xl border border-[#B58C6A]/55 bg-[#FAF8F3] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-[#493B32]">
                    판매자 견적 답변
                  </span>
                  <span
                    className={cn(
                      'inline-block rounded-lg px-2.5 py-0.5 text-xs font-semibold',
                      getQuoteFeasibilityBadgeClass(latestQuote.feasibility)
                    )}
                  >
                    {latestQuote.feasibility}
                  </span>
                  <span className="rounded-md bg-[#FFFFFF] border border-[#E9DFD0] px-2 py-0.5 text-[11px] font-semibold text-[#8F6849] tabular-nums">
                    최신 견적 v{latestQuote.version}
                  </span>
                </div>
                <span className="text-xs text-[#6E5C50] tabular-nums">
                  {formatOrderTimestampDate(latestQuote.respondedAt)}
                </span>
              </div>

              {latestQuote.feasibility === '제작 불가능' ? (
                <div className="rounded-xl bg-[#FBF0ED] border border-[#E4B8AF] p-4 space-y-1.5 text-sm text-[#9F4A3B]">
                  <p className="text-xs font-bold">판매자 제작 불가 안내 사유</p>
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {latestQuote.impossibilityReason}
                  </p>
                </div>
              ) : (
                <dl className="space-y-3 text-sm">
                  {latestQuote.feasibility === '조건부 제작 가능' &&
                    latestQuote.conditionalNote && (
                      <div className="rounded-xl bg-[#F7EFE6] border border-[#D6B89C] p-3.5 text-[#493B32] space-y-1">
                        <dt className="text-xs font-bold text-[#8F6849]">
                          판매자가 제시한 제작 조건
                        </dt>
                        <dd className="leading-relaxed whitespace-pre-wrap">
                          {latestQuote.conditionalNote}
                        </dd>
                      </div>
                    )}

                  <div className="rounded-xl bg-[#FFFFFF] border border-[#E9DFD0] p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="font-semibold text-[#493B32]">
                        최종 견적 금액
                      </dt>
                      <dd className="text-lg font-bold text-[#8F6849] tabular-nums">
                        {formatPriceKRW(latestQuote.finalPrice ?? 0)}
                      </dd>
                    </div>

                    {latestQuote.extraFeeReason ||
                    typeof latestQuote.extraFeeAmount === 'number' ? (
                      <div className="pt-2 border-t border-[#E9DFD0] text-xs space-y-1">
                        <dt className="font-semibold text-[#8F6849] tabular-nums">
                          추가 비용 내역 및 사유
                          {typeof latestQuote.extraFeeAmount === 'number'
                            ? ` (추가 비용 ${formatPriceKRW(latestQuote.extraFeeAmount)} 포함)`
                            : ''}
                        </dt>
                        <dd className="text-[#493B32] leading-relaxed">
                          {latestQuote.extraFeeReason}
                        </dd>
                      </div>
                    ) : (
                      <p className="pt-2 border-t border-[#E9DFD0] text-xs text-[#6E5C50]">
                        별도 추가 비용 안내 없이 기본 맞춤 제작 비용으로 산정된 견적입니다.
                      </p>
                    )}
                  </div>

                  {latestQuote.availableDate && (
                    <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
                      <dt className="text-[#6E5C50]">수령 가능 날짜 및 시간</dt>
                      <dd className="font-semibold text-[#493B32] tabular-nums text-right">
                        {formatKoreanDate(latestQuote.availableDate)} ·{' '}
                        {latestQuote.availableTime}
                      </dd>
                    </div>
                  )}

                  {latestQuote.designGuide && (
                    <div className="pt-2.5 border-t border-[#E9DFD0]">
                      <dt className="text-xs text-[#6E5C50]">
                        판매자 답변 (디자인 · 제작 안내)
                      </dt>
                      <dd className="mt-1 text-[#493B32] leading-relaxed whitespace-pre-wrap">
                        {latestQuote.designGuide}
                      </dd>
                    </div>
                  )}
                </dl>
              )}

              {/* Consumer Accept / Revision Actions */}
              {canRespond && actionPanel === 'none' && (
                <div className="pt-2 border-t border-[#E9DFD0] flex flex-col sm:flex-row gap-2.5">
                  <Button
                    variant="outline"
                    size="lg"
                    fullWidth
                    onClick={() => {
                      setActionError(null);
                      setActionNotice(null);
                      setActionPanel('revision');
                    }}
                  >
                    <MessageSquarePlus
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    <span>수정 요청</span>
                  </Button>
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => {
                      setActionError(null);
                      setActionNotice(null);
                      setActionPanel('accept');
                    }}
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    <span>견적 수락</span>
                  </Button>
                </div>
              )}

              {/* Acceptance Confirmation Sub-Panel */}
              {canRespond && actionPanel === 'accept' && (
                <div className="rounded-2xl border border-[#8F6849] bg-[#FFFFFF] p-4 space-y-3.5">
                  <h4 className="text-sm font-bold text-[#493B32]">
                    견적 수락 전 최종 확인
                  </h4>
                  <dl className="space-y-1.5 text-xs sm:text-sm text-[#493B32]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-[#6E5C50]">수락할 견적 버전</dt>
                      <dd className="font-semibold tabular-nums">
                        v{latestQuote.version} ({latestQuote.feasibility})
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-[#6E5C50]">최종 견적 금액</dt>
                      <dd className="font-bold text-[#8F6849] tabular-nums">
                        {formatPriceKRW(latestQuote.finalPrice ?? 0)}
                      </dd>
                    </div>
                    {latestQuote.availableDate && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-[#6E5C50]">수령 가능 일시</dt>
                        <dd className="font-semibold tabular-nums text-right">
                          {formatKoreanDate(latestQuote.availableDate)} ·{' '}
                          {latestQuote.availableTime}
                        </dd>
                      </div>
                    )}
                    {latestQuote.conditionalNote && (
                      <div className="rounded-xl bg-[#F7EFE6] border border-[#D6B89C] p-3 text-xs">
                        <strong className="text-[#8F6849]">제작 조건:</strong>{' '}
                        {latestQuote.conditionalNote}
                      </div>
                    )}
                  </dl>
                  <p className="text-xs text-[#6E5C50] leading-relaxed">
                    견적을 수락하면 금액과 제작 조건이 확정되며, 이후에는 수정 요청이나 판매자의 임의 변경이 불가능합니다.
                  </p>
                  {actionError && (
                    <p
                      role="alert"
                      className="text-xs font-medium text-[#9F4A3B]"
                    >
                      {actionError}
                    </p>
                  )}
                  <div className="flex flex-col-reverse sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="md"
                      fullWidth
                      onClick={() => setActionPanel('none')}
                    >
                      취소
                    </Button>
                    <Button
                      variant="primary"
                      size="md"
                      fullWidth
                      onClick={handleConfirmAccept}
                    >
                      금액·조건 확정 및 견적 수락
                    </Button>
                  </div>
                </div>
              )}

              {/* Consumer Revision Request Form Sub-Panel */}
              {canRespond && actionPanel === 'revision' && (
                <form
                  onSubmit={handleSubmitRevision}
                  className="rounded-2xl border border-[#DFB985] bg-[#FFFFFF] p-4 space-y-3.5"
                  noValidate
                >
                  <h4 className="text-sm font-bold text-[#493B32]">
                    판매자에게 수정 요청 보내기
                  </h4>
                  <p className="text-xs text-[#6E5C50] leading-relaxed">
                    수정을 원하는 디자인, 색상, 문구, 크기 등을 선택하고 구체적인 요청 내용을 작성해 주세요.
                  </p>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[#493B32]">
                      수정 희망 항목 *
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {CONSUMER_REVISION_CATEGORY_OPTIONS.map((category) => {
                        const selected = revisionCategories.includes(category);
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => toggleCategory(category)}
                            aria-pressed={selected}
                            className={cn(
                              'min-h-[36px] rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer',
                              selected
                                ? 'bg-[#8F6849] text-[#FFFFFF] border-[#8F6849]'
                                : 'bg-[#FAF8F3] text-[#493B32] border-[#E9DFD0] hover:border-[#B58C6A]'
                            )}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>
                    {revisionErrors.categories && (
                      <p className="text-xs font-medium text-[#9F4A3B]">
                        {revisionErrors.categories}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="consumer-revision-note"
                      className="block text-xs font-semibold text-[#493B32]"
                    >
                      수정 요청 상세 내용 *
                    </label>
                    <textarea
                      id="consumer-revision-note"
                      rows={3}
                      value={revisionNote}
                      onChange={(e) => {
                        setRevisionNote(e.target.value);
                        setActionError(null);
                        setRevisionErrors((prev) => ({
                          ...prev,
                          note: undefined,
                        }));
                      }}
                      placeholder="예: 리본 색상을 연핑크로 변경하고 케이크 크기를 2호로 키워서 다시 견적을 받고 싶습니다."
                      className="w-full rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] px-3.5 py-2.5 text-sm text-[#493B32] placeholder:text-[#6E5C50]/60 focus:border-[#B58C6A] focus:bg-[#FFFFFF] focus:outline-none"
                    />
                    {revisionErrors.note && (
                      <p className="text-xs font-medium text-[#9F4A3B]">
                        {revisionErrors.note}
                      </p>
                    )}
                  </div>

                  {actionError && (
                    <p
                      role="alert"
                      className="text-xs font-medium text-[#9F4A3B]"
                    >
                      {actionError}
                    </p>
                  )}

                  <div className="flex flex-col-reverse sm:flex-row gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="md"
                      fullWidth
                      onClick={() => setActionPanel('none')}
                    >
                      취소
                    </Button>
                    <Button type="submit" variant="primary" size="md" fullWidth>
                      수정 요청 전송
                    </Button>
                  </div>
                </form>
              )}

              {/* Previous Quote History */}
              {historyList.length > 0 && (
                <div className="pt-2 border-t border-[#E9DFD0] space-y-2">
                  <button
                    type="button"
                    onClick={() => setShowHistory((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8F6849] hover:text-[#493B32] transition-colors cursor-pointer"
                  >
                    <History className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>
                      이전 견적 이력 ({historyList.length}건){' '}
                      {showHistory ? '접기' : '보기'}
                    </span>
                  </button>

                  {showHistory && (
                    <div className="space-y-2">
                      {historyList.map((item) => (
                        <div
                          key={`consumer-history-v${item.version}`}
                          className="rounded-xl border border-[#E9DFD0] bg-[#FFFFFF] p-3 text-xs text-[#6E5C50] space-y-1"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="rounded bg-[#E9DFD0] px-1.5 py-0.5 font-semibold text-[#493B32] tabular-nums">
                                이전 견적 v{item.version}
                              </span>
                              <span
                                className={cn(
                                  'rounded px-1.5 py-0.5 font-semibold',
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
                            <>
                              <p className="font-semibold text-[#493B32] tabular-nums">
                                견적 금액: {formatPriceKRW(item.finalPrice ?? 0)}
                                {item.extraFeeReason
                                  ? ` · 추가 비용 사유: ${item.extraFeeReason}`
                                  : ''}
                              </p>
                              {item.availableDate && (
                                <p className="tabular-nums">
                                  수령 가능:{' '}
                                  {formatKoreanDate(item.availableDate)} ·{' '}
                                  {item.availableTime}
                                </p>
                              )}
                              {item.conditionalNote && (
                                <p>조건: {item.conditionalNote}</p>
                              )}
                              {item.designGuide && (
                                <p>안내: {item.designGuide}</p>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Consumer Revision Request History */}
          {revisionList.length > 0 && (
            <div className="rounded-2xl border border-[#DFB985] bg-[#FDF4E6]/70 p-4 space-y-2.5">
              <p className="text-xs font-bold text-[#9A5B1A]">
                내가 보낸 수정 요청 내역 ({revisionList.length}건)
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
                    <p className="font-medium text-[#493B32]">
                      수정 항목: {rev.categories.join(', ')}
                    </p>
                    <p className="text-[#493B32] leading-relaxed whitespace-pre-wrap">
                      {rev.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shop & Schedule Summary */}
          <dl className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#6E5C50]">요청 매장</dt>
              <dd className="font-bold text-[#493B32] text-right">
                {quote.shopName}{' '}
                <span className="font-normal text-xs text-[#6E5C50]">
                  ({quote.shopRegionText})
                </span>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
              <dt className="text-[#6E5C50]">희망 수령 일시</dt>
              <dd className="font-semibold text-[#493B32] tabular-nums text-right">
                {formatKoreanDate(quote.desiredPickupDate)} ·{' '}
                {quote.desiredPickupTime}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
              <dt className="text-[#6E5C50]">견적 요청 일시</dt>
              <dd className="font-medium text-[#493B32] tabular-nums text-right">
                {formatOrderTimestampDate(quote.createdAt)}
              </dd>
            </div>
          </dl>

          {/* Attached Reference Photos */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-sm font-bold text-[#493B32]">
                <ImageIcon
                  className="h-4 w-4 text-[#B58C6A]"
                  aria-hidden="true"
                />
                <span>첨부한 디자인 참고 사진 ({quote.images.length}장)</span>
              </div>
              <span className="text-xs text-[#8F6849]">
                눌러서 크게 보기
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {quote.images.map((img, index) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setZoomedImage(img)}
                  className="text-left rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] overflow-hidden hover:border-[#B58C6A] transition-colors cursor-pointer"
                >
                  <div className="relative aspect-[4/3] w-full bg-[#FFFFFF]">
                    <img
                      src={img.dataUrl}
                      alt={`참고 사진 ${index + 1}: ${img.fileName}`}
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

          {/* Cake Specs & Custom Descriptions */}
          <dl className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[#6E5C50]">케이크 크기</dt>
              <dd className="font-medium text-[#493B32]">{quote.cakeSize}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
              <dt className="text-[#6E5C50]">케이크 모양</dt>
              <dd className="font-medium text-[#493B32]">{quote.cakeShape}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
              <dt className="text-[#6E5C50]">맛 또는 시트 종류</dt>
              <dd className="font-medium text-[#493B32]">{quote.cakeFlavor}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
              <dt className="text-[#6E5C50]">원하는 색상</dt>
              <dd className="font-medium text-[#493B32]">{quote.cakeColor}</dd>
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

          <div className="flex items-start gap-2 rounded-2xl bg-[#E9DFD0]/45 p-3.5 text-xs text-[#6E5C50]">
            <Info
              className="h-4 w-4 text-[#8F6849] mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <p className="leading-relaxed">
              견적 수락 후 진행되는 결제는 실제 금융정보를 수집하지 않는 시연용 모의 결제이며, 결제 완료 시 브라우저 로컬 저장소에 예약 확정 상태가 기록됩니다.
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
