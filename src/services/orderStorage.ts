import { getMockCakeShops } from '../data/mockShops';
import type {
  CakeOrder,
  CakeOrderOptions,
  CakeOrderStatus,
  CakeShop,
  PaymentMethod,
  SellerOrderFilter,
} from '../types';
import {
  addDaysToDateParts,
  formatDateParts,
  getTodayDateParts,
} from '../utils/dateUtils';

const ORDERS_STORAGE_KEY = 'cakeday_orders_v1';
const ORDERS_SEEDED_KEY = 'cakeday_orders_seeded_v1';

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

export const PAYMENT_METHOD_OPTIONS: Array<{
  method: PaymentMethod;
  subtitle: string;
}> = [
  {
    method: '신용·체크카드',
    subtitle: '시연용 선택 (실제 카드번호를 입력받거나 저장하지 않습니다)',
  },
  {
    method: '간편결제',
    subtitle: '시연용 선택 (외부 결제 앱 연동 없이 즉시 완료 처리됩니다)',
  },
  {
    method: '무통장입금',
    subtitle: '시연용 선택 (실제 계좌이체나 금융정보 입력 없이 처리됩니다)',
  },
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

function isOrdersSeeded(): boolean {
  try {
    return window.localStorage.getItem(ORDERS_SEEDED_KEY) === 'true';
  } catch {
    return false;
  }
}

function markOrdersSeeded(): void {
  try {
    window.localStorage.setItem(ORDERS_SEEDED_KEY, 'true');
  } catch {
    // Ignore storage errors
  }
}

function buildInitialDemoOrders(): CakeOrder[] {
  const shops = getMockCakeShops();
  const shop1 = shops.find((s) => s.shopId === 'mock-shop-001') ?? shops[0];
  const shop3 = shops.find((s) => s.shopId === 'mock-shop-003') ?? shops[2] ?? shops[0];
  const shop4 = shops.find((s) => s.shopId === 'mock-shop-004') ?? shops[3] ?? shops[0];

  const today = getTodayDateParts();
  const now = Date.now();
  const isoOffset = (minutesAgo: number) =>
    new Date(now - minutesAgo * 60_000).toISOString();

  return [
    {
      orderId: 'order-seed-pending-001',
      userId: 'demo-dual-001',
      customerName: '김다온',
      customerEmail: 'dual@cakeday.demo',
      shopId: shop1.shopId,
      shopName: shop1.shopName,
      shopRegionText: `${shop1.region.sido} ${shop1.region.sigungu}`,
      cakeName: shop1.representativeCakeName,
      cakePrice: shop1.representativeCakePrice,
      cakeImage: shop1.representativeImage,
      pickupDate: formatDateParts(addDaysToDateParts(today, 3)),
      pickupTime: '14:00',
      options: {
        cakeSize: '1호 (지름 15cm)',
        cakeShape: '원형',
        cakeFlavor: '바닐라 우유생크림',
        designType: '빈티지 리본 파이핑',
        cakeColor: '아이보리',
        letteringText: 'Happy Birthday 지수!',
        additionalRequests: '숫자 초 1개와 기본 성냥 함께 포장 부탁드립니다.',
      },
      applicationStatus: '주문 신청 완료',
      status: '판매자 확인 대기',
      isDemoSeed: true,
      orderedAt: isoOffset(30),
    },
    {
      orderId: 'order-seed-approved-002',
      userId: 'demo-dual-001',
      customerName: '김다온',
      customerEmail: 'dual@cakeday.demo',
      shopId: shop3.shopId,
      shopName: shop3.shopName,
      shopRegionText: `${shop3.region.sido} ${shop3.region.sigungu}`,
      cakeName: shop3.representativeCakeName,
      cakePrice: shop3.representativeCakePrice,
      cakeImage: shop3.representativeImage,
      pickupDate: formatDateParts(addDaysToDateParts(today, 5)),
      pickupTime: '16:00',
      options: {
        cakeSize: '1호 (지름 15cm)',
        cakeShape: '원형',
        cakeFlavor: '다크 초코 가나슈',
        designType: '과일 데코레이션',
        cakeColor: '소프트 브라운',
        letteringText: '고마워요 엄마 아빠',
        additionalRequests: '보냉백 추가 요청드립니다.',
      },
      applicationStatus: '주문 신청 완료',
      status: '판매자 승인 완료',
      reviewedAt: isoOffset(90),
      isDemoSeed: true,
      orderedAt: isoOffset(180),
    },
    {
      orderId: 'order-seed-rejected-003',
      userId: 'demo-dual-001',
      customerName: '김다온',
      customerEmail: 'dual@cakeday.demo',
      shopId: shop4.shopId,
      shopName: shop4.shopName,
      shopRegionText: `${shop4.region.sido} ${shop4.region.sigungu}`,
      cakeName: shop4.representativeCakeName,
      cakePrice: shop4.representativeCakePrice,
      cakeImage: shop4.representativeImage,
      pickupDate: formatDateParts(addDaysToDateParts(today, 1)),
      pickupTime: '18:00',
      options: {
        cakeSize: '도시락 (미니)',
        cakeShape: '하트형',
        cakeFlavor: '제주 말차 크림',
        designType: '심플 레터링',
        cakeColor: '세이지 그린',
        letteringText: 'Always Happy Day',
        additionalRequests: '말차 크림을 진하게 부탁드립니다.',
      },
      applicationStatus: '주문 신청 완료',
      status: '판매자 거절',
      rejectionReason:
        '요청하신 날짜의 미니 도시락 케이크 예약 수량이 모두 마감되었습니다.',
      reviewedAt: isoOffset(240),
      isDemoSeed: true,
      orderedAt: isoOffset(360),
    },
    {
      orderId: 'order-seed-paid-004',
      userId: 'demo-dual-001',
      customerName: '김다온',
      customerEmail: 'dual@cakeday.demo',
      shopId: shop1.shopId,
      shopName: shop1.shopName,
      shopRegionText: `${shop1.region.sido} ${shop1.region.sigungu}`,
      cakeName: shop1.representativeCakeName,
      cakePrice: shop1.representativeCakePrice,
      cakeImage: shop1.representativeImage,
      pickupDate: formatDateParts(addDaysToDateParts(today, 12)),
      pickupTime: '13:00',
      options: {
        cakeSize: '2호 (지름 18cm)',
        cakeShape: '원형',
        cakeFlavor: '바닐라 우유생크림',
        designType: '보태니컬 플라워',
        cakeColor: '아이보리',
        letteringText: '결혼기념일 축하드립니다',
        additionalRequests: '부모님 선물용이라 리본 포장으로 부탁드립니다.',
      },
      applicationStatus: '주문 신청 완료',
      status: '결제 완료 및 예약 확정',
      reviewedAt: isoOffset(600),
      payment: {
        isPaid: true,
        paymentMethod: '신용·체크카드',
        paidAt: isoOffset(520),
        paidAmount: shop1.representativeCakePrice,
        basePrice: shop1.representativeCakePrice,
        additionalOptionPrice: null,
        isDemoPayment: true,
      },
      isDemoSeed: true,
      orderedAt: isoOffset(720),
    },
    {
      orderId: 'order-seed-consumer-005',
      userId: 'demo-consumer-002',
      customerName: '이서연',
      customerEmail: 'consumer@cakeday.demo',
      shopId: shop1.shopId,
      shopName: shop1.shopName,
      shopRegionText: `${shop1.region.sido} ${shop1.region.sigungu}`,
      cakeName: shop1.representativeCakeName,
      cakePrice: shop1.representativeCakePrice,
      cakeImage: shop1.representativeImage,
      pickupDate: formatDateParts(addDaysToDateParts(today, 5)),
      pickupTime: '15:00',
      options: {
        cakeSize: '1호 (지름 15cm)',
        cakeShape: '원형',
        cakeFlavor: '얼그레이 시폰',
        designType: '심플 레터링',
        cakeColor: '연핑크',
        letteringText: '생신 축하드려요!',
        additionalRequests: '문구 아래 작은 하트 그려 주세요.',
      },
      applicationStatus: '주문 신청 완료',
      status: '판매자 확인 대기',
      isDemoSeed: true,
      orderedAt: isoOffset(45),
    },
  ];
}

export function ensureDemoOrdersSeeded(): void {
  if (isOrdersSeeded()) return;
  const existing = readAllOrders();
  if (existing.length === 0) {
    writeAllOrders(buildInitialDemoOrders());
  }
  markOrdersSeeded();
}

export function resetDemoPresetOrders(presetUserIds: string[]): number {
  const presetSet = new Set(presetUserIds);
  const preservedUserOrders = readAllOrders().filter(
    (order) => !presetSet.has(order.userId) && !order.isDemoSeed
  );
  const freshSeeds = buildInitialDemoOrders();
  writeAllOrders([...preservedUserOrders, ...freshSeeds]);
  markOrdersSeeded();
  return freshSeeds.length;
}

export function loadUserOrders(userId: string): CakeOrder[] {
  ensureDemoOrdersSeeded();
  return readAllOrders()
    .filter((order) => order.userId === userId)
    .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));
}

export function loadOrdersForSellerShops(ownedShopIds: string[]): CakeOrder[] {
  ensureDemoOrdersSeeded();
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
  if (filter === 'paid') {
    return orders.filter((order) => order.status === '결제 완료 및 예약 확정');
  }
  if (filter === 'rejected') {
    return orders.filter((order) => order.status === '판매자 거절');
  }
  return orders;
}

export function getSellerOrderCounts(
  orders: CakeOrder[]
): Record<SellerOrderFilter, number> {
  return {
    all: orders.length,
    pending: orders.filter((o) => o.status === '판매자 확인 대기').length,
    approved: orders.filter((o) => o.status === '판매자 승인 완료').length,
    paid: orders.filter((o) => o.status === '결제 완료 및 예약 확정').length,
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

export interface ConsumerPaymentResult {
  ok: boolean;
  error?: string;
  updatedOrder?: CakeOrder;
  orders: CakeOrder[];
}

export function completeDemoPaymentForOrder(
  orderId: string,
  userId: string,
  paymentMethod: PaymentMethod
): ConsumerPaymentResult {
  const allowedMethods: PaymentMethod[] = [
    '신용·체크카드',
    '간편결제',
    '무통장입금',
  ];
  if (!allowedMethods.includes(paymentMethod)) {
    return {
      ok: false,
      error: '유효한 결제 수단을 선택해 주세요.',
      orders: loadUserOrders(userId),
    };
  }

  const all = readAllOrders();
  const targetIndex = all.findIndex((order) => order.orderId === orderId);

  if (targetIndex === -1) {
    return {
      ok: false,
      error: '해당 주문을 찾을 수 없습니다.',
      orders: loadUserOrders(userId),
    };
  }

  const target = all[targetIndex];
  if (target.userId !== userId) {
    return {
      ok: false,
      error: '본인이 신청한 주문만 결제할 수 있습니다.',
      orders: loadUserOrders(userId),
    };
  }

  if (target.status === '결제 완료 및 예약 확정' || target.payment?.isPaid) {
    return {
      ok: false,
      error: '이미 결제가 완료되어 예약이 확정된 주문입니다.',
      orders: loadUserOrders(userId),
    };
  }

  if (target.status === '판매자 확인 대기') {
    return {
      ok: false,
      error: '판매자가 주문을 승인한 후에만 결제를 진행할 수 있습니다.',
      orders: loadUserOrders(userId),
    };
  }

  if (target.status === '판매자 거절') {
    return {
      ok: false,
      error: '판매자가 거절한 주문은 결제할 수 없습니다.',
      orders: loadUserOrders(userId),
    };
  }

  const updatedOrder: CakeOrder = {
    ...target,
    status: '결제 완료 및 예약 확정',
    payment: {
      isPaid: true,
      paymentMethod,
      paidAt: new Date().toISOString(),
      paidAmount: target.cakePrice,
      basePrice: target.cakePrice,
      additionalOptionPrice: null,
      isDemoPayment: true,
    },
  };

  const updatedAll = all.map((order, index) =>
    index === targetIndex ? updatedOrder : order
  );
  writeAllOrders(updatedAll);

  return {
    ok: true,
    updatedOrder,
    orders: updatedAll
      .filter((order) => order.userId === userId)
      .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt)),
  };
}

export function getConsumerOrderStatusLabel(order: CakeOrder): string {
  if (order.status === '판매자 승인 완료') {
    return '판매자 승인 완료 및 결제 대기';
  }
  return order.status;
}

export function getOrderStatusBadgeClass(status: CakeOrderStatus): string {
  if (status === '결제 완료 및 예약 확정') {
    return 'bg-[#EEF4EC] text-[#355E3B] border border-[#BBD0B5]';
  }
  if (status === '판매자 승인 완료') {
    return 'bg-[#F7EFE6] text-[#8F6849] border border-[#D6B89C]';
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
