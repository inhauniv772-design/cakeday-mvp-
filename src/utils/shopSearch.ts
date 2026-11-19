import type { CakeShop, ShopOrderFilter } from '../types';

export type ShopPickupBadgeType = 'sameDay' | 'reservation' | 'unavailable';

export interface ShopPickupEvaluation {
  isPickupAvailable: boolean;
  isSameDaySelectable: boolean;
  isReservationAvailable: boolean;
  badgeType: ShopPickupBadgeType;
  badgeLabel: string;
  pickupStatusDescription: string;
}

export function evaluateShopPickup(
  shop: CakeShop,
  pickupDate: string,
  todayStr: string
): ShopPickupEvaluation {
  const isPickupAvailable = shop.pickupAvailableDates.includes(pickupDate);
  const isTodaySelected = pickupDate === todayStr;

  if (!isPickupAvailable) {
    return {
      isPickupAvailable: false,
      isSameDaySelectable: false,
      isReservationAvailable: false,
      badgeType: 'unavailable',
      badgeLabel: '선택한 날짜 픽업 불가',
      pickupStatusDescription:
        '가상 매장 일정상 선택한 날짜에는 픽업 주문이 불가합니다.',
    };
  }

  if (isTodaySelected && shop.sameDayAvailable) {
    return {
      isPickupAvailable: true,
      isSameDaySelectable: true,
      isReservationAvailable: true,
      badgeType: 'sameDay',
      badgeLabel: '당일 주문 가능',
      pickupStatusDescription:
        '오늘 픽업 가능한 당일 주문 지원 매장입니다.',
    };
  }

  if (shop.sameDayAvailable) {
    return {
      isPickupAvailable: true,
      isSameDaySelectable: true,
      isReservationAvailable: true,
      badgeType: 'sameDay',
      badgeLabel: '당일 주문 가능',
      pickupStatusDescription:
        '선택하신 날짜에 사전 예약 픽업이 가능하며 당일 주문도 지원하는 매장입니다.',
    };
  }

  return {
    isPickupAvailable: true,
    isSameDaySelectable: false,
    isReservationAvailable: true,
    badgeType: 'reservation',
    badgeLabel: '예약 주문 가능',
    pickupStatusDescription:
      '당일 주문은 불가하며 선택한 날짜의 사전 예약 픽업이 가능합니다.',
  };
}

export function extractSidoOptions(shops: CakeShop[]): string[] {
  return Array.from(new Set(shops.map((shop) => shop.region.sido)));
}

export function extractSigunguOptions(
  shops: CakeShop[],
  selectedSido: string
): string[] {
  const scoped =
    selectedSido === 'all'
      ? shops
      : shops.filter((shop) => shop.region.sido === selectedSido);
  return Array.from(new Set(scoped.map((shop) => shop.region.sigungu)));
}

export interface SearchShopsParams {
  shops: CakeShop[];
  pickupDate: string;
  todayStr: string;
  selectedSido: string;
  selectedSigungu: string;
  orderFilter: ShopOrderFilter;
}

export interface ShopSearchResultItem {
  shop: CakeShop;
  evaluation: ShopPickupEvaluation;
}

export function filterAndSortShops({
  shops,
  pickupDate,
  todayStr,
  selectedSido,
  selectedSigungu,
  orderFilter,
}: SearchShopsParams): ShopSearchResultItem[] {
  const regionMatched = shops.filter((shop) => {
    if (selectedSido !== 'all' && shop.region.sido !== selectedSido) {
      return false;
    }
    if (selectedSigungu !== 'all' && shop.region.sigungu !== selectedSigungu) {
      return false;
    }
    return true;
  });

  const evaluated = regionMatched.map((shop) => ({
    shop,
    evaluation: evaluateShopPickup(shop, pickupDate, todayStr),
  }));

  const filteredByOrderType = evaluated.filter(({ shop }) => {
    if (orderFilter === 'sameDay') {
      return shop.sameDayAvailable;
    }
    if (orderFilter === 'reservation') {
      return !shop.sameDayAvailable;
    }
    return true;
  });

  // Available shops on selected date appear first, followed by unavailable shops clearly labeled
  return filteredByOrderType.sort((a, b) => {
    if (a.evaluation.isPickupAvailable !== b.evaluation.isPickupAvailable) {
      return a.evaluation.isPickupAvailable ? -1 : 1;
    }
    if (a.shop.sameDayAvailable !== b.shop.sameDayAvailable) {
      return a.shop.sameDayAvailable ? -1 : 1;
    }
    return a.shop.shopName.localeCompare(b.shop.shopName, 'ko');
  });
}
