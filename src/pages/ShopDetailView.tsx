import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Info,
  MapPin,
  Phone,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { SafeImage } from '../components/SafeImage';
import { formatPriceKRW } from '../data/mockShops';
import type { CakeShop } from '../types';
import { cn } from '../utils/cn';
import { formatKoreanDate, getTodayString } from '../utils/dateUtils';
import { evaluateShopPickup } from '../utils/shopSearch';

interface ShopDetailViewProps {
  shop: CakeShop;
  pickupDate: string;
  onBackToSearch: () => void;
}

export const ShopDetailView: React.FC<ShopDetailViewProps> = ({
  shop,
  pickupDate,
  onBackToSearch,
}) => {
  const todayStr = useMemo(() => getTodayString(), []);
  const evaluation = useMemo(
    () => evaluateShopPickup(shop, pickupDate, todayStr),
    [shop, pickupDate, todayStr]
  );

  const [isOrderEntryOpened, setIsOrderEntryOpened] = useState(false);

  if (isOrderEntryOpened) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <button
          type="button"
          onClick={() => setIsOrderEntryOpened(false)}
          className="inline-flex items-center gap-2 min-h-[44px] text-sm font-medium text-[#6E5C50] hover:text-[#493B32] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          매장 상세로 돌아가기
        </button>

        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9DFD0] text-[#8F6849] shrink-0">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-medium text-[#8F6849]">
                주문 화면 연결 준비
              </p>
              <h1 className="mt-1 text-xl sm:text-2xl font-bold text-[#493B32]">
                선택하신 매장 및 픽업 날짜가 전달되었습니다
              </h1>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 text-sm">
            <div>
              <dt className="text-xs text-[#6E5C50]">선택 매장</dt>
              <dd className="mt-1 font-semibold text-[#493B32]">
                {shop.shopName}
              </dd>
              <dd className="text-xs text-[#6E5C50]">
                {shop.region.sido} {shop.region.sigungu}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#6E5C50]">선택한 픽업 날짜</dt>
              <dd className="mt-1 font-semibold text-[#8F6849]">
                {formatKoreanDate(pickupDate)}
              </dd>
              <dd className="text-xs text-[#6E5C50]">{evaluation.badgeLabel}</dd>
            </div>
            <div className="sm:col-span-2 pt-3 border-t border-[#E9DFD0] flex items-baseline justify-between gap-3">
              <div>
                <dt className="text-xs text-[#6E5C50]">대표 케이크</dt>
                <dd className="mt-1 font-semibold text-[#493B32]">
                  {shop.representativeCakeName}
                </dd>
              </div>
              <span className="text-base font-bold text-[#8F6849] tabular-nums">
                {formatPriceKRW(shop.representativeCakePrice)}
              </span>
            </div>
          </dl>

          <div className="flex items-start gap-2.5 rounded-2xl bg-[#E9DFD0]/45 p-4 text-xs sm:text-sm text-[#6E5C50]">
            <Info className="h-4 w-4 text-[#8F6849] mt-0.5 shrink-0" aria-hidden="true" />
            <p className="leading-relaxed">
              케이크 커스터마이징 옵션 선택 및 실제 주문 신청·결제 기능은 다음 개발 단계에서 이 화면에 연결될 예정입니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsOrderEntryOpened(false)}
            >
              매장 상세 보기
            </Button>
            <Button variant="primary" size="lg" onClick={onBackToSearch}>
              다른 매장 더 찾아보기
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToSearch}
          className="inline-flex items-center gap-2 min-h-[44px] text-sm font-medium text-[#6E5C50] hover:text-[#493B32] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          검색 결과로 돌아가기
        </button>

        <span className="text-xs text-[#6E5C50]">
          가상 매장 데이터(데모용)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left: Shop Visual & Basic Information */}
        <div className="lg:col-span-6 space-y-6">
          <SafeImage
            src={shop.representativeImage}
            alt={`${shop.shopName}의 대표 케이크 ${shop.representativeCakeName}`}
            containerClassName="aspect-[4/3] w-full rounded-3xl border border-[#E9DFD0]"
            fallbackTitle={shop.shopName}
          />

          <Card className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={cn(
                  'inline-block rounded-full px-3 py-1 text-xs font-semibold',
                  evaluation.badgeType === 'sameDay'
                    ? 'bg-[#8F6849] text-[#FFFFFF]'
                    : evaluation.badgeType === 'reservation'
                      ? 'bg-[#E9DFD0] text-[#493B32]'
                      : 'bg-[#FAF8F3] text-[#6E5C50] border border-[#E9DFD0]'
                )}
              >
                {evaluation.badgeLabel}
              </span>
              <span className="text-xs text-[#6E5C50]">
                {shop.region.sido} {shop.region.sigungu}
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#493B32]">
                {shop.shopName}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-[#6E5C50] leading-relaxed">
                {shop.introduction}
              </p>
            </div>

            <dl className="pt-4 border-t border-[#E9DFD0] space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-[#B58C6A] mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-[#6E5C50]">주소</dt>
                  <dd className="font-medium text-[#493B32]">{shop.address}</dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="h-4 w-4 text-[#B58C6A] mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-[#6E5C50]">영업시간</dt>
                  <dd className="font-medium text-[#493B32]">
                    {shop.operatingHours}
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-[#B58C6A] mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-[#6E5C50]">연락처</dt>
                  <dd className="font-medium text-[#493B32] tabular-nums">
                    {shop.contactInformation}
                  </dd>
                </div>
              </div>
            </dl>
          </Card>
        </div>

        {/* Right: Cake Product Info + Selected Pickup Status + Order CTA */}
        <div className="lg:col-span-6 space-y-6">
          {/* Cake Product Information */}
          <Card className="p-6 space-y-4">
            <p className="text-xs font-medium text-[#8F6849]">대표 케이크 정보</p>
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-bold text-[#493B32]">
                {shop.representativeCakeName}
              </h2>
              <span className="text-xl font-bold text-[#8F6849] tabular-nums shrink-0">
                {formatPriceKRW(shop.representativeCakePrice)}
              </span>
            </div>
            <p className="text-sm sm:text-base text-[#6E5C50] leading-relaxed">
              {shop.representativeCakeDescription}
            </p>
          </Card>

          {/* Pickup Information & Order Connection */}
          <Card tone="beige" className="p-6 space-y-5">
            <div className="flex items-center gap-2 text-xs font-medium text-[#8F6849]">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>선택한 픽업 일정 확인</span>
            </div>

            <dl className="space-y-3 rounded-2xl bg-[#FFFFFF] border border-[#E9DFD0] p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#6E5C50]">선택한 픽업 날짜</dt>
                <dd className="font-semibold text-[#493B32]">
                  {formatKoreanDate(pickupDate)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
                <dt className="text-[#6E5C50]">선택 날짜 픽업 여부</dt>
                <dd
                  className={cn(
                    'font-semibold',
                    evaluation.isPickupAvailable
                      ? 'text-[#8F6849]'
                      : 'text-[#9F4A3B]'
                  )}
                >
                  {evaluation.isPickupAvailable
                    ? '픽업 가능'
                    : '선택한 날짜 픽업 불가'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
                <dt className="text-[#6E5C50]">당일 주문 가능 여부</dt>
                <dd className="font-medium text-[#493B32]">
                  {shop.sameDayAvailable ? '당일 주문 가능' : '당일 주문 불가'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
                <dt className="text-[#6E5C50]">예약 주문 가능 여부</dt>
                <dd className="font-medium text-[#493B32]">
                  {evaluation.isPickupAvailable
                    ? '예약 주문 가능'
                    : '해당 날짜 예약 불가'}
                </dd>
              </div>
            </dl>

            <p className="text-xs sm:text-sm text-[#6E5C50] leading-relaxed">
              {evaluation.pickupStatusDescription}
            </p>

            <div className="space-y-2.5">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!evaluation.isPickupAvailable}
                onClick={() => setIsOrderEntryOpened(true)}
              >
                케이크 주문하기
              </Button>
              {!evaluation.isPickupAvailable && (
                <p className="text-xs text-[#9F4A3B] text-center">
                  선택하신 날짜에는 픽업이 불가합니다. 검색 화면에서 다른 날짜를 선택해 주세요.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
