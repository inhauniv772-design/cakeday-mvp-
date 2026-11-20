import React, { useEffect } from 'react';
import { Image as ImageIcon, Info, User, X } from 'lucide-react';
import { Button } from './Button';
import { formatOrderTimestampDate } from '../services/orderStorage';
import type { CustomQuoteRequest } from '../types';
import { formatKoreanDate } from '../utils/dateUtils';
import { formatFileSizeLabel } from '../utils/quoteImageUtils';

interface SellerQuoteDetailModalProps {
  quote: CustomQuoteRequest | null;
  isMissingQuote?: boolean;
  onClose: () => void;
}

export const SellerQuoteDetailModal: React.FC<SellerQuoteDetailModalProps> = ({
  quote,
  isMissingQuote = false,
  onClose,
}) => {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#493B32]/45 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="seller-quote-detail-title"
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
            <span className="inline-block rounded-lg bg-[#E9DFD0] border border-[#D8C9B5] px-3 py-1 text-xs font-semibold text-[#493B32]">
              {quote.status}
            </span>
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

        {/* Attached Reference Images */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-sm font-bold text-[#493B32]">
            <ImageIcon className="h-4 w-4 text-[#B58C6A]" aria-hidden="true" />
            <span>소비자 첨부 참고 사진 ({quote.images.length}장)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {quote.images.map((img, index) => (
              <div
                key={img.id}
                className="rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] overflow-hidden"
              >
                <div className="aspect-[4/3] w-full bg-[#FFFFFF]">
                  <img
                    src={img.dataUrl}
                    alt={`소비자 참고 사진 ${index + 1}: ${img.fileName}`}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="px-3 py-2 text-[11px] text-[#6E5C50]">
                  <p className="font-medium text-[#493B32] truncate">
                    {img.fileName}
                  </p>
                  <p className="tabular-nums">
                    {formatFileSizeLabel(img.sizeBytes)}
                  </p>
                </div>
              </div>
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

        {/* Stage 9 Scope Notice */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-[#D6B89C] bg-[#F7EFE6]/65 p-4 text-xs sm:text-sm text-[#493B32]">
          <Info
            className="h-4 w-4 text-[#8F6849] mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p className="leading-relaxed">
            현재 단계에서는 접수된 맞춤 디자인 견적 요청 정보와 첨부 사진을 확인하는 기능까지 제공됩니다. 판매자의 견적 금액 입력, 제작 가능 여부 회신 및 답변 전송 기능은 다음 단계에서 구현될 예정입니다.
          </p>
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
};
