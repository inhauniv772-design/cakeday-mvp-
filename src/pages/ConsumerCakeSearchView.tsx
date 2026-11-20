import React, { useMemo, useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, ImagePlus, Info, MapPin, RotateCcw } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { DatePickerCalendar } from '../components/DatePickerCalendar';
import { SafeImage } from '../components/SafeImage';
import { formatPriceKRW } from '../data/mockShops';
import type { CakeShop, ShopOrderFilter } from '../types';
import { cn } from '../utils/cn';
import {
  formatKoreanDate,
  formatKoreanShortDate,
  getTodayString,
} from '../utils/dateUtils';
import {
  extractSidoOptions,
  extractSigunguOptions,
  filterAndSortShops,
} from '../utils/shopSearch';

interface ConsumerCakeSearchViewProps {
  shops: CakeShop[];
  pickupDate: string;
  selectedSido: string;
  selectedSigungu: string;
  orderFilter: ShopOrderFilter;
  onChangePickupDate: (date: string) => void;
  onChangeSido: (sido: string) => void;
  onChangeSigungu: (sigungu: string) => void;
  onChangeOrderFilter: (filter: ShopOrderFilter) => void;
  onResetFilters: () => void;
  onSelectShop: (shopId: string) => void;
  onRequestCustomQuote: (shopId: string) => void;
}

const ORDER_FILTER_TABS: Array<{ id: ShopOrderFilter; label: string }> = [
  { id: 'all', label: '전체 매장' },
  { id: 'sameDay', label: '당일 주문 가능 매장' },
  { id: 'reservation', label: '예약 주문 가능 매장' },
];

export const ConsumerCakeSearchView: React.FC<ConsumerCakeSearchViewProps> = ({
  shops,
  pickupDate,
  selectedSido,
  selectedSigungu,
  orderFilter,
  onChangePickupDate,
  onChangeSido,
  onChangeSigungu,
  onChangeOrderFilter,
  onResetFilters,
  onSelectShop,
  onRequestCustomQuote,
}) => {
  const todayStr = useMemo(() => getTodayString(), []);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const sidoOptions = useMemo(() => extractSidoOptions(shops), [shops]);
  const sigunguOptions = useMemo(
    () => extractSigunguOptions(shops, selectedSido),
    [shops, selectedSido]
  );

  const searchResults = useMemo(
    () =>
      filterAndSortShops({
        shops,
        pickupDate,
        todayStr,
        selectedSido,
        selectedSigungu,
        orderFilter,
      }),
    [shops, pickupDate, todayStr, selectedSido, selectedSigungu, orderFilter]
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs sm:text-sm font-medium text-[#8F6849]">
            커스텀 케이크 매장 찾기
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-[#493B32]">
            원하는 날짜와 지역의 케이크 매장
          </h1>
        </div>

        <div className="inline-flex items-center gap-1.5 text-xs text-[#6E5C50]">
          <Info className="h-3.5 w-3.5 text-[#B58C6A] shrink-0" aria-hidden="true" />
          <span>가상 매장 데이터(데모용) 기준 검색 결과입니다.</span>
        </div>
      </div>

      {/* Search Conditions Card: Pickup Date + Region */}
      <Card className="p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* ① Pickup Date Picker Trigger */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            <span className="text-sm font-medium text-[#493B32]">
              ① 픽업 날짜
            </span>
            <button
              type="button"
              onClick={() => setIsDatePickerOpen((prev) => !prev)}
              aria-expanded={isDatePickerOpen}
              className="min-h-[48px] w-full rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] px-4 py-3 text-left flex items-center justify-between gap-3 hover:border-[#B58C6A] transition-colors cursor-pointer"
            >
              <span className="inline-flex items-center gap-2.5 text-sm sm:text-base font-medium text-[#493B32]">
                <Calendar className="h-4 w-4 text-[#B58C6A] shrink-0" aria-hidden="true" />
                <span>
                  {formatKoreanDate(pickupDate)}
                  {pickupDate === todayStr ? ' · 오늘' : ''}
                </span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#8F6849] shrink-0">
                <span>{isDatePickerOpen ? '달력 닫기' : '날짜 변경'}</span>
                {isDatePickerOpen ? (
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
            </button>
          </div>

          {/* ② Region Select (시·도 & 시·군·구) */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="search-region-sido"
                className="text-sm font-medium text-[#493B32]"
              >
                ② 지역 선택 (시·도)
              </label>
              <select
                id="search-region-sido"
                value={selectedSido}
                onChange={(e) => onChangeSido(e.target.value)}
                className="min-h-[48px] w-full rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] px-4 py-3 text-sm sm:text-base text-[#493B32] focus:bg-[#FFFFFF] focus:border-[#B58C6A] focus:outline-none cursor-pointer"
              >
                <option value="all">전체 시·도</option>
                {sidoOptions.map((sido) => (
                  <option key={sido} value={sido}>
                    {sido}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="search-region-sigungu"
                className="text-sm font-medium text-[#493B32]"
              >
                상세 지역 (시·군·구)
              </label>
              <select
                id="search-region-sigungu"
                value={selectedSigungu}
                onChange={(e) => onChangeSigungu(e.target.value)}
                className="min-h-[48px] w-full rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] px-4 py-3 text-sm sm:text-base text-[#493B32] focus:bg-[#FFFFFF] focus:border-[#B58C6A] focus:outline-none cursor-pointer"
              >
                <option value="all">전체 시·군·구</option>
                {sigunguOptions.map((sigungu) => (
                  <option key={sigungu} value={sigungu}>
                    {sigungu}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Expandable Calendar Date Picker (past dates disabled via minDate) */}
        {isDatePickerOpen && (
          <div className="pt-2 border-t border-[#E9DFD0]">
            <div className="max-w-md">
              <p className="mb-2 text-xs text-[#6E5C50]">
                오늘({formatKoreanShortDate(todayStr)}) 이후의 픽업 날짜만 선택할 수 있습니다.
              </p>
              <DatePickerCalendar
                value={pickupDate}
                minDate={todayStr}
                onChange={(nextDate) => {
                  onChangePickupDate(nextDate);
                  setIsDatePickerOpen(false);
                }}
              />
            </div>
          </div>
        )}
      </Card>

      {/* Filter Bar & Count */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div
          role="tablist"
          aria-label="주문 방식 필터"
          className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-[#E9DFD0]/70 p-1 self-start"
        >
          {ORDER_FILTER_TABS.map((tab) => {
            const isActive = orderFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onChangeOrderFilter(tab.id)}
                className={cn(
                  'min-h-[44px] px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-150 cursor-pointer',
                  isActive
                    ? 'bg-[#FFFFFF] text-[#493B32] shadow-sm shadow-[#493B32]/5'
                    : 'text-[#6E5C50] hover:text-[#493B32]'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <p className="text-sm text-[#6E5C50] tabular-nums">
          검색 결과{' '}
          <strong className="font-semibold text-[#493B32]">
            {searchResults.length}
          </strong>
          개 매장
        </p>
      </div>

      {/* Shop Cards Grid */}
      {searchResults.length === 0 ? (
        <Card className="py-12 text-center">
          <p className="text-base font-semibold text-[#493B32]">
            선택하신 조건에 맞는 매장이 없습니다.
          </p>
          <p className="mt-1.5 text-sm text-[#6E5C50]">
            지역이나 주문 방식 필터를 변경해 다른 매장을 살펴보세요.
          </p>
          <div className="mt-6">
            <Button variant="secondary" size="md" onClick={onResetFilters}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              <span>검색 조건 초기화</span>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map(({ shop, evaluation }) => (
            <article
              key={shop.shopId}
              className={cn(
                'group rounded-3xl bg-[#FFFFFF] border border-[#E9DFD0] overflow-hidden flex flex-col justify-between transition-all duration-150 hover:border-[#B58C6A]',
                !evaluation.isPickupAvailable && 'opacity-85'
              )}
            >
              <button
                type="button"
                onClick={() => onSelectShop(shop.shopId)}
                className="text-left flex-1 flex flex-col cursor-pointer"
              >
                <div className="aspect-[4/3] w-full overflow-hidden border-b border-[#E9DFD0]">
                  <SafeImage
                    src={shop.representativeImage}
                    alt={`${shop.shopName} - ${shop.representativeCakeName}`}
                    containerClassName="h-full w-full rounded-none"
                    className="transition-transform duration-300 group-hover:scale-[1.02]"
                    fallbackTitle={shop.shopName}
                  />
                </div>

                <div className="p-5 sm:p-6 flex-1 w-full flex flex-col justify-between gap-4">
                  <div>
                    {/* Single Availability Badge */}
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

                    <h2 className="mt-3 text-lg font-bold text-[#493B32]">
                      {shop.shopName}
                    </h2>

                    <p className="mt-1 inline-flex items-center gap-1 text-xs sm:text-sm text-[#6E5C50]">
                      <MapPin className="h-3.5 w-3.5 text-[#B58C6A] shrink-0" aria-hidden="true" />
                      <span>
                        {shop.region.sido} {shop.region.sigungu}
                      </span>
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#E9DFD0] space-y-1.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-[#493B32] truncate">
                        {shop.representativeCakeName}
                      </span>
                      <span className="text-base font-bold text-[#8F6849] tabular-nums shrink-0">
                        {formatPriceKRW(shop.representativeCakePrice)}
                      </span>
                    </div>
                    <p className="text-xs text-[#6E5C50]">
                      {evaluation.isPickupAvailable
                        ? `${formatKoreanShortDate(pickupDate)} 픽업 가능`
                        : '선택한 날짜 픽업 불가'}
                    </p>
                  </div>
                </div>
              </button>

              <div className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0">
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={() => onRequestCustomQuote(shop.shopId)}
                >
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />
                  <span>맞춤 디자인 견적 요청</span>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
