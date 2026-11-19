import type { CakeOrder, CakeOrderOptions, CakeShop } from '../types';

const ORDERS_STORAGE_KEY = 'cakeday_orders_v1';

export const PICKUP_TIME_OPTIONS = [
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
];

export const CAKE_SIZE_OPTIONS = [
  '도시락 (미니)',
  '1호 (지름 15cm)',
  '2호 (지름 18cm)',
];

export const CAKE_SHAPE_OPTIONS = ['원형', '하트형', '사각형'];

export const CAKE_FLAVOR_OPTIONS = [
  '바닐라 우유생크림',
  '다크 초코 가나슈',
  '얼그레이 시폰',
  '제주 말차 크림',
  '레몬 커드 크림',
];

export const CAKE_DESIGN_OPTIONS = [
  '심플 레터링',
  '빈티지 리본 파이핑',
  '보태니컬 플라워',
  '과일 데코레이션',
];

export const CAKE_COLOR_PRESETS = [
  '아이보리',
  '소프트 브라운',
  '연핑크',
  '세이지 그린',
  '파스텔 옐로우',
  '직접 입력',
];

function readAllOrders(): CakeOrder[] {
  try {
    const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CakeOrder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAllOrders(orders: CakeOrder[]): void {
  try {
    window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // Ignore storage errors in restricted environments
  }
}

export function loadUserOrders(userId: string): CakeOrder[] {
  return readAllOrders()
    .filter((order) => order.userId === userId)
    .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));
}

export interface CreateOrderPayload {
  userId: string;
  shop: CakeShop;
  pickupDate: string;
  pickupTime: string;
  options: CakeOrderOptions;
}

export function createUserOrder(payload: CreateOrderPayload): {
  createdOrder: CakeOrder;
  orders: CakeOrder[];
} {
  const newOrder: CakeOrder = {
    orderId: `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: payload.userId,
    shopId: payload.shop.shopId,
    shopName: payload.shop.shopName,
    shopRegionText: `${payload.shop.region.sido} ${payload.shop.region.sigungu}`,
    cakeName: payload.shop.representativeCakeName,
    cakePrice: payload.shop.representativeCakePrice,
    cakeImage: payload.shop.representativeImage,
    pickupDate: payload.pickupDate,
    pickupTime: payload.pickupTime,
    options: {
      cakeSize: payload.options.cakeSize,
      cakeShape: payload.options.cakeShape,
      cakeFlavor: payload.options.cakeFlavor,
      designType: payload.options.designType,
      cakeColor: payload.options.cakeColor.trim(),
      letteringText: payload.options.letteringText.trim(),
      additionalRequests: payload.options.additionalRequests.trim(),
    },
    applicationStatus: '주문 신청 완료',
    status: '판매자 확인 대기',
    orderedAt: new Date().toISOString(),
  };

  const all = readAllOrders();
  const updated = [newOrder, ...all];
  writeAllOrders(updated);

  return {
    createdOrder: newOrder,
    orders: updated
      .filter((order) => order.userId === payload.userId)
      .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt)),
  };
}

export function formatOrderTimestampDate(isoString: string): string {
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return isoString;
  const year = parsed.getFullYear();
  const month = parsed.getMonth() + 1;
  const day = parsed.getDate();
  const hours = String(parsed.getHours()).padStart(2, '0');
  const minutes = String(parsed.getMinutes()).padStart(2, '0');
  return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
}
