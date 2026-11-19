import React, { useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
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
  onStartOrder: () => void;
}

export const ShopDetailView: React.FC<ShopDetailViewProps> = ({
  shop,
  pickupDate,
  onBackToSearch,
  onStartOrder,
}) => {
  const todayStr = useMemo(() => getTodayString(), []);
  const evaluation = useMemo(
    () => evaluateShopPickup(shop, pickupDate, todayStr),
    [shop, pickupDate, todayStr]
  );

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
                onClick={onStartOrder}
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
