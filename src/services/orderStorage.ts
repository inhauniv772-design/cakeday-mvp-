import type {
  CakeOrder,
  CakeOrderOptions,
  CakeOrderStatus,
  CakeShop,
  SellerOrderFilter,
} from '../types';

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

export function loadOrdersForSellerShops(ownedShopIds: string[]): CakeOrder[] {
  if (!ownedShopIds || ownedShopIds.length === 0) return [];
  const shopSet = new Set(ownedShopIds);
  return readAllOrders()
    .filter((order) => shopSet.has(order.shopId))
    .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));
}

export function filterSellerOrders(
  orders: CakeOrder[],
  filter: SellerOrderFilter
): CakeOrder[] {
  if (filter === 'pending') {
    return orders.filter((order) => order.status === '판매자 확인 대기');
  }
  if (filter === 'approved') {
    return orders.filter((order) => order.status === '판매자 승인 완료');
  }
  if (filter === 'rejected') {
    return orders.filter((order) => order.status === '판매자 거절');
  }
  return orders;
}

export function getSellerOrderCounts(orders: CakeOrder[]): Record<SellerOrderFilter, number> {
  return {
    all: orders.length,
    pending: orders.filter((o) => o.status === '판매자 확인 대기').length,
    approved: orders.filter((o) => o.status === '판매자 승인 완료').length,
    rejected: orders.filter((o) => o.status === '판매자 거절').length,
  };
}

export interface CreateOrderPayload {
  userId: string;
  customerName: string;
  customerEmail: string;
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
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
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

export interface SellerOrderDecisionResult {
  ok: boolean;
  error?: string;
  updatedOrder?: CakeOrder;
  orders: CakeOrder[];
}

export function approveOrderAsSeller(
  orderId: string,
  ownedShopIds: string[]
): SellerOrderDecisionResult {
  const shopSet = new Set(ownedShopIds);
  const all = readAllOrders();
  const targetIndex = all.findIndex((order) => order.orderId === orderId);

  if (targetIndex === -1) {
    return {
      ok: false,
      error: '해당 주문을 찾을 수 없습니다.',
      orders: loadOrdersForSellerShops(ownedShopIds),
    };
  }

  const target = all[targetIndex];
  if (!shopSet.has(target.shopId)) {
    return {
      ok: false,
      error: '본인이 운영하는 매장의 주문만 승인할 수 있습니다.',
      orders: loadOrdersForSellerShops(ownedShopIds),
    };
  }

  if (target.status !== '판매자 확인 대기') {
    return {
      ok: false,
      error: '이미 처리된 주문은 다시 승인하거나 거절할 수 없습니다.',
      orders: loadOrdersForSellerShops(ownedShopIds),
    };
  }

  const updatedOrder: CakeOrder = {
    ...target,
    status: '판매자 승인 완료',
    reviewedAt: new Date().toISOString(),
  };

  const updatedAll = all.map((order, index) =>
    index === targetIndex ? updatedOrder : order
  );
  writeAllOrders(updatedAll);

  return {
    ok: true,
    updatedOrder,
    orders: updatedAll
      .filter((order) => shopSet.has(order.shopId))
      .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt)),
  };
}

export function rejectOrderAsSeller(
  orderId: string,
  ownedShopIds: string[],
  rejectionReason: string
): SellerOrderDecisionResult {
  const trimmedReason = rejectionReason.trim();
  if (!trimmedReason) {
    return {
      ok: false,
      error: '거절 사유를 입력해 주세요.',
      orders: loadOrdersForSellerShops(ownedShopIds),
    };
  }

  const shopSet = new Set(ownedShopIds);
  const all = readAllOrders();
  const targetIndex = all.findIndex((order) => order.orderId === orderId);

  if (targetIndex === -1) {
    return {
      ok: false,
      error: '해당 주문을 찾을 수 없습니다.',
      orders: loadOrdersForSellerShops(ownedShopIds),
    };
  }

  const target = all[targetIndex];
  if (!shopSet.has(target.shopId)) {
    return {
      ok: false,
      error: '본인이 운영하는 매장의 주문만 거절할 수 있습니다.',
      orders: loadOrdersForSellerShops(ownedShopIds),
    };
  }

  if (target.status !== '판매자 확인 대기') {
    return {
      ok: false,
      error: '이미 처리된 주문은 다시 승인하거나 거절할 수 없습니다.',
      orders: loadOrdersForSellerShops(ownedShopIds),
    };
  }

  const updatedOrder: CakeOrder = {
    ...target,
    status: '판매자 거절',
    rejectionReason: trimmedReason,
    reviewedAt: new Date().toISOString(),
  };

  const updatedAll = all.map((order, index) =>
    index === targetIndex ? updatedOrder : order
  );
  writeAllOrders(updatedAll);

  return {
    ok: true,
    updatedOrder,
    orders: updatedAll
      .filter((order) => shopSet.has(order.shopId))
      .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt)),
  };
}

export function getOrderStatusBadgeClass(status: CakeOrderStatus): string {
  if (status === '판매자 승인 완료') {
    return 'bg-[#EEF4EC] text-[#355E3B] border border-[#BBD0B5]';
  }
  if (status === '판매자 거절') {
    return 'bg-[#FBF0ED] text-[#9F4A3B] border border-[#E4B8AF]';
  }
  return 'bg-[#E9DFD0] text-[#493B32] border border-[#D8C9B5]';
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
