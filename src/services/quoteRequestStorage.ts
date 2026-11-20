import { getMockCakeShops } from '../data/mockShops';
import type {
  AcceptedQuoteSnapshot,
  CakeShop,
  ConsumerRevisionRequest,
  CustomQuotePayment,
  CustomQuoteRequest,
  PaymentMethod,
  QuoteAttachmentImage,
  QuoteFeasibility,
  QuoteRequestStatus,
  SellerQuoteFilter,
  SellerQuoteResponseInput,
  SellerQuoteVersion,
} from '../types';
import {
  addDaysToDateParts,
  formatDateParts,
  getTodayDateParts,
  getTodayString,
} from '../utils/dateUtils';
import {
  parseWonAmount,
  validateConsumerRevisionRequest,
  validateSellerQuoteResponse,
} from '../utils/quoteValidation';

const QUOTE_REQUESTS_STORAGE_KEY = 'cakeday_quote_requests_v1';
const QUOTE_REQUESTS_SEEDED_KEY = 'cakeday_quote_requests_seeded_v1';

// Inline lightweight SVG preview used ONLY for initial demo seed requests so
// seed data renders cleanly offline with minimal localStorage footprint (< 1KB).
const DEMO_SEED_CAKE_SKETCH_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#FAF8F3"/>
      <rect x="30" y="30" width="340" height="240" rx="24" fill="#FFFFFF" stroke="#E9DFD0" stroke-width="4"/>
      <ellipse cx="200" cy="212" rx="108" ry="20" fill="#E9DFD0"/>
      <rect x="115" y="128" width="170" height="82" rx="22" fill="#F5EBDD" stroke="#B58C6A" stroke-width="3"/>
      <path d="M115 152 Q145 168 172 150 Q200 168 228 150 Q255 168 285 152" fill="none" stroke="#B58C6A" stroke-width="4" stroke-linecap="round"/>
      <circle cx="165" cy="118" r="10" fill="#D4846A"/>
      <circle cx="200" cy="114" r="11" fill="#D4846A"/>
      <circle cx="235" cy="118" r="10" fill="#D4846A"/>
      <text x="200" y="254" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#8F6849">시연용 디자인 참고 스케치</text>
    </svg>`
  );

function readAllQuoteRequests(): CustomQuoteRequest[] {
  try {
    const raw = window.localStorage.getItem(QUOTE_REQUESTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CustomQuoteRequest[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAllQuoteRequests(
  items: CustomQuoteRequest[]
): { ok: true } | { ok: false; error: string } {
  try {
    window.localStorage.setItem(QUOTE_REQUESTS_STORAGE_KEY, JSON.stringify(items));
    return { ok: true };
  } catch {
    return {
      ok: false,
      error:
        '브라우저 저장 공간(localStorage) 용량 한도를 초과하여 견적 정보를 저장하지 못했습니다. 첨부 사진 수를 줄이거나 기존 시연 데이터를 정리한 뒤 다시 시도해 주세요.',
    };
  }
}

function isQuoteRequestsSeeded(): boolean {
  try {
    return window.localStorage.getItem(QUOTE_REQUESTS_SEEDED_KEY) === 'true';
  } catch {
    return false;
  }
}

function markQuoteRequestsSeeded(): void {
  try {
    window.localStorage.setItem(QUOTE_REQUESTS_SEEDED_KEY, 'true');
  } catch {
    // Ignore storage errors
  }
}

function buildInitialDemoQuoteRequests(): CustomQuoteRequest[] {
  const shops = getMockCakeShops();
  const shop1 = shops.find((s) => s.shopId === 'mock-shop-001') ?? shops[0];
  const shop2 = shops.find((s) => s.shopId === 'mock-shop-002') ?? shops[1] ?? shops[0];
  const shop3 = shops.find((s) => s.shopId === 'mock-shop-003') ?? shops[2] ?? shops[0];

  const today = getTodayDateParts();
  const now = Date.now();
  const isoOffset = (minutesAgo: number) =>
    new Date(now - minutesAgo * 60_000).toISOString();
  const arrivedPickupDate = formatDateParts(addDaysToDateParts(today, 9));

  return [
    {
      quoteId: 'quote-seed-001',
      userId: 'demo-dual-001',
      customerName: '김다온',
      customerEmail: 'dual@cakeday.demo',
      shopId: shop1.shopId,
      shopName: shop1.shopName,
      shopRegionText: `${shop1.region.sido} ${shop1.region.sigungu}`,
      images: [
        {
          id: 'qimg-seed-001',
          fileName: 'pastel-ribbon-reference.svg',
          mimeType: 'image/svg+xml',
          sizeBytes: 640,
          dataUrl: DEMO_SEED_CAKE_SKETCH_DATA_URL,
        },
      ],
      desiredPickupDate: formatDateParts(addDaysToDateParts(today, 7)),
      desiredPickupTime: '14:00',
      cakeSize: '1호 (지름 15cm)',
      cakeShape: '하트형',
      cakeFlavor: '바닐라 우유생크림',
      cakeColor: '아이보리',
      letteringText: 'Our 1st CakeDay',
      designDescription:
        '참고 이미지처럼 상단 테두리에 리본 파이핑과 얇은 쉘 장식을 넣어 주시고 중앙은 깔끔하게 비워 레터링만 들어가면 좋겠습니다.',
      additionalRequests: '투명 케이크 박스 포장 가능 여부도 함께 확인 부탁드립니다.',
      status: '판매자 검토 대기',
      createdAt: isoOffset(120),
      isDemoSeed: true,
    },
    {
      quoteId: 'quote-seed-002',
      userId: 'demo-consumer-002',
      customerName: '이서연',
      customerEmail: 'consumer@cakeday.demo',
      shopId: shop2.shopId,
      shopName: shop2.shopName,
      shopRegionText: `${shop2.region.sido} ${shop2.region.sigungu}`,
      images: [
        {
          id: 'qimg-seed-002',
          fileName: 'berry-flower-sketch.svg',
          mimeType: 'image/svg+xml',
          sizeBytes: 640,
          dataUrl: DEMO_SEED_CAKE_SKETCH_DATA_URL,
        },
      ],
      desiredPickupDate: formatDateParts(addDaysToDateParts(today, 10)),
      desiredPickupTime: '16:00',
      cakeSize: '2호 (지름 18cm)',
      cakeShape: '원형',
      cakeFlavor: '얼그레이 시폰',
      cakeColor: '연핑크',
      letteringText: '엄마 생신 축하드려요',
      designDescription:
        '파스텔 핑크 크림 바탕에 생화 톤의 작은 데이지 4송이를 비대칭으로 올려 주시면 좋겠습니다.',
      additionalRequests: '견과류는 제외해 주세요.',
      status: '판매자 검토 대기',
      createdAt: isoOffset(60),
      isDemoSeed: true,
    },
    {
      quoteId: 'quote-seed-003',
      userId: 'demo-dual-001',
      customerName: '김다온',
      customerEmail: 'dual@cakeday.demo',
      shopId: shop3.shopId,
      shopName: shop3.shopName,
      shopRegionText: `${shop3.region.sido} ${shop3.region.sigungu}`,
      images: [
        {
          id: 'qimg-seed-003',
          fileName: 'botanical-vintage-reference.svg',
          mimeType: 'image/svg+xml',
          sizeBytes: 640,
          dataUrl: DEMO_SEED_CAKE_SKETCH_DATA_URL,
        },
      ],
      desiredPickupDate: arrivedPickupDate,
      desiredPickupTime: '15:00',
      cakeSize: '1호 (지름 15cm)',
      cakeShape: '원형',
      cakeFlavor: '다크 초코 가나슈',
      cakeColor: '소프트 브라운',
      letteringText: 'Warm Moments Together',
      designDescription:
        '따뜻한 코코아 브라운 톤 크림 위에 심플한 빈티지 드롭 파이핑과 금박 포인트 장식을 요청합니다.',
      additionalRequests: '보냉백 함께 준비 부탁드립니다.',
      status: '견적 도착',
      latestQuote: {
        version: 1,
        feasibility: '제작 가능',
        finalPrice: 68000,
        extraFeeAmount: 8000,
        extraFeeReason: '빈티지 드롭 파이핑 및 식용 금박 데코레이션 추가 공정',
        availableDate: arrivedPickupDate,
        availableTime: '15:00',
        designGuide:
          '요청하신 코코아 가나슈 바탕에 빈티지 파이핑과 금박 포인트로 깔끔하게 제작 가능합니다. 수령 2시간 전 냉장 보관을 권장합니다.',
        respondedAt: isoOffset(45),
        statusAtSend: '견적 도착',
      },
      createdAt: isoOffset(240),
      updatedAt: isoOffset(45),
      isDemoSeed: true,
    },
  ];
}

export function ensureDemoQuoteRequestsSeeded(): void {
  if (isQuoteRequestsSeeded()) return;
  const existing = readAllQuoteRequests();
  if (existing.length === 0) {
    writeAllQuoteRequests(buildInitialDemoQuoteRequests());
  }
  markQuoteRequestsSeeded();
}

export function resetDemoPresetQuoteRequests(presetUserIds: string[]): number {
  const presetSet = new Set(presetUserIds);
  const preservedUserQuotes = readAllQuoteRequests().filter(
    (quote) => !presetSet.has(quote.userId) && !quote.isDemoSeed
  );
  const freshSeeds = buildInitialDemoQuoteRequests();
  writeAllQuoteRequests([...preservedUserQuotes, ...freshSeeds]);
  markQuoteRequestsSeeded();
  return freshSeeds.length;
}

export function loadUserQuoteRequests(userId: string): CustomQuoteRequest[] {
  ensureDemoQuoteRequestsSeeded();
  return readAllQuoteRequests()
    .filter((quote) => quote.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function loadQuoteRequestsForSellerShops(
  ownedShopIds: string[]
): CustomQuoteRequest[] {
  ensureDemoQuoteRequestsSeeded();
  if (!ownedShopIds || ownedShopIds.length === 0) return [];
  const shopSet = new Set(ownedShopIds);
  return readAllQuoteRequests()
    .filter((quote) => shopSet.has(quote.shopId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getQuoteStatusBadgeClass(status: QuoteRequestStatus): string {
  switch (status) {
    case '예약 확정':
    case '결제 완료':
      return 'bg-[#EEF4EC] text-[#355E3B] border border-[#BBD0B5]';
    case '견적 수락':
    case '결제 대기':
      return 'bg-[#F5EBD9] text-[#6B4A2D] border border-[#C9A882]';
    case '견적 도착':
      return 'bg-[#EEF4EC] text-[#355E3B] border border-[#BBD0B5]';
    case '견적 재전송':
      return 'bg-[#E9F1EE] text-[#2F5249] border border-[#AFC8BE]';
    case '조건부 제작 가능':
      return 'bg-[#F7EFE6] text-[#8F6849] border border-[#D6B89C]';
    case '소비자 수정 요청':
      return 'bg-[#FDF4E6] text-[#9A5B1A] border border-[#DFB985]';
    case '견적 수정 중':
      return 'bg-[#F6F1E6] text-[#7D5836] border border-[#D7C3A8]';
    case '제작 불가능':
      return 'bg-[#FBF0ED] text-[#9F4A3B] border border-[#E4B8AF]';
    case '판매자 검토 대기':
    default:
      return 'bg-[#E9DFD0] text-[#493B32] border border-[#D8C9B5]';
  }
}

export function getQuoteFeasibilityBadgeClass(
  feasibility: QuoteFeasibility
): string {
  switch (feasibility) {
    case '제작 가능':
      return 'bg-[#EEF4EC] text-[#355E3B] border border-[#BBD0B5]';
    case '조건부 제작 가능':
      return 'bg-[#F7EFE6] text-[#8F6849] border border-[#D6B89C]';
    case '제작 불가능':
    default:
      return 'bg-[#FBF0ED] text-[#9F4A3B] border border-[#E4B8AF]';
  }
}

export function canConsumerRespondToQuote(quote: CustomQuoteRequest): boolean {
  if (quote.isAcceptedByConsumer || quote.payment?.isPaid) return false;
  if (!quote.latestQuote || quote.latestQuote.feasibility === '제작 불가능') {
    return false;
  }
  return (
    quote.status === '견적 도착' ||
    quote.status === '조건부 제작 가능' ||
    quote.status === '견적 재전송'
  );
}

export function isQuoteAwaitingPayment(quote: CustomQuoteRequest): boolean {
  return (
    Boolean(quote.isAcceptedByConsumer && quote.acceptedQuote) &&
    !quote.payment?.isPaid &&
    (quote.status === '견적 수락' || quote.status === '결제 대기')
  );
}

export function isQuoteReservationConfirmed(quote: CustomQuoteRequest): boolean {
  return quote.status === '예약 확정' && Boolean(quote.payment?.isPaid);
}

export function getSellerQuoteCounts(
  quotes: CustomQuoteRequest[]
): Record<SellerQuoteFilter, number> {
  return {
    all: quotes.length,
    pending: quotes.filter((q) => q.status === '판매자 검토 대기').length,
    responded: quotes.filter(
      (q) =>
        q.status === '견적 도착' ||
        q.status === '조건부 제작 가능' ||
        q.status === '견적 재전송'
    ).length,
    revisionRequested: quotes.filter((q) => q.status === '소비자 수정 요청')
      .length,
    accepted: quotes.filter((q) => isQuoteAwaitingPayment(q)).length,
    confirmed: quotes.filter((q) => isQuoteReservationConfirmed(q)).length,
    editing: quotes.filter((q) => q.status === '견적 수정 중').length,
    impossible: quotes.filter((q) => q.status === '제작 불가능').length,
  };
}

export function filterSellerQuotes(
  quotes: CustomQuoteRequest[],
  filter: SellerQuoteFilter
): CustomQuoteRequest[] {
  if (filter === 'all') return quotes;
  if (filter === 'pending') {
    return quotes.filter((q) => q.status === '판매자 검토 대기');
  }
  if (filter === 'responded') {
    return quotes.filter(
      (q) =>
        q.status === '견적 도착' ||
        q.status === '조건부 제작 가능' ||
        q.status === '견적 재전송'
    );
  }
  if (filter === 'revisionRequested') {
    return quotes.filter((q) => q.status === '소비자 수정 요청');
  }
  if (filter === 'accepted') {
    return quotes.filter((q) => isQuoteAwaitingPayment(q));
  }
  if (filter === 'confirmed') {
    return quotes.filter((q) => isQuoteReservationConfirmed(q));
  }
  if (filter === 'editing') {
    return quotes.filter((q) => q.status === '견적 수정 중');
  }
  return quotes.filter((q) => q.status === '제작 불가능');
}

export interface CreateQuoteRequestPayload {
  userId: string;
  customerName: string;
  customerEmail: string;
  shop: CakeShop;
  images: QuoteAttachmentImage[];
  desiredPickupDate: string;
  desiredPickupTime: string;
  cakeSize: string;
  cakeShape: string;
  cakeFlavor: string;
  cakeColor: string;
  letteringText: string;
  designDescription: string;
  additionalRequests: string;
}

export function createUserQuoteRequest(
  payload: CreateQuoteRequestPayload
):
  | { ok: true; createdQuote: CustomQuoteRequest; quotes: CustomQuoteRequest[] }
  | { ok: false; error: string } {
  const newQuote: CustomQuoteRequest = {
    quoteId: `quote-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: payload.userId,
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    shopId: payload.shop.shopId,
    shopName: payload.shop.shopName,
    shopRegionText: `${payload.shop.region.sido} ${payload.shop.region.sigungu}`,
    images: payload.images.map((img) => ({ ...img })),
    desiredPickupDate: payload.desiredPickupDate,
    desiredPickupTime: payload.desiredPickupTime,
    cakeSize: payload.cakeSize,
    cakeShape: payload.cakeShape,
    cakeFlavor: payload.cakeFlavor,
    cakeColor: payload.cakeColor.trim(),
    letteringText: payload.letteringText.trim(),
    designDescription: payload.designDescription.trim(),
    additionalRequests: payload.additionalRequests.trim(),
    status: '판매자 검토 대기',
    createdAt: new Date().toISOString(),
  };

  const all = readAllQuoteRequests();
  const updated = [newQuote, ...all];
  const writeResult = writeAllQuoteRequests(updated);

  if (!writeResult.ok) {
    return { ok: false, error: writeResult.error };
  }

  return {
    ok: true,
    createdQuote: newQuote,
    quotes: updated
      .filter((quote) => quote.userId === payload.userId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

function scopeSellerQuotes(
  items: CustomQuoteRequest[],
  ownedShopIds: string[]
): CustomQuoteRequest[] {
  const shopSet = new Set(ownedShopIds);
  return items
    .filter((quote) => shopSet.has(quote.shopId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function submitSellerQuoteResponse(
  quoteId: string,
  ownedShopIds: string[],
  input: SellerQuoteResponseInput
): {
  ok: boolean;
  error?: string;
  updatedQuote?: CustomQuoteRequest;
  quotes: CustomQuoteRequest[];
} {
  ensureDemoQuoteRequestsSeeded();
  const all = readAllQuoteRequests();
  const targetIndex = all.findIndex((quote) => quote.quoteId === quoteId);

  if (targetIndex === -1) {
    return {
      ok: false,
      error: '해당 견적 요청 정보를 찾을 수 없습니다.',
      quotes: scopeSellerQuotes(all, ownedShopIds),
    };
  }

  const target = all[targetIndex];
  if (!ownedShopIds.includes(target.shopId)) {
    return {
      ok: false,
      error: '현재 계정이 운영하는 매장의 견적 요청만 작성·수정할 수 있습니다.',
      quotes: scopeSellerQuotes(all, ownedShopIds),
    };
  }

  if (target.isAcceptedByConsumer) {
    return {
      ok: false,
      error: '소비자가 이미 수락한 견적은 수정하거나 재전송할 수 없습니다.',
      quotes: scopeSellerQuotes(all, ownedShopIds),
    };
  }

  const validationErrors = validateSellerQuoteResponse(input, getTodayString());
  const firstError = Object.values(validationErrors).find(Boolean);
  if (firstError) {
    return {
      ok: false,
      error: firstError,
      quotes: scopeSellerQuotes(all, ownedShopIds),
    };
  }

  const isRevision = Boolean(target.latestQuote);
  const nextVersionNumber = (target.latestQuote?.version ?? 0) + 1;
  const nowIso = new Date().toISOString();

  let nextStatus: QuoteRequestStatus;
  if (input.feasibility === '제작 불가능') {
    nextStatus = '제작 불가능';
  } else if (isRevision) {
    nextStatus = '견적 재전송';
  } else if (input.feasibility === '조건부 제작 가능') {
    nextStatus = '조건부 제작 가능';
  } else {
    nextStatus = '견적 도착';
  }

  let newVersion: SellerQuoteVersion;
  if (input.feasibility === '제작 불가능') {
    newVersion = {
      version: nextVersionNumber,
      feasibility: '제작 불가능',
      impossibilityReason: input.impossibilityReason.trim(),
      respondedAt: nowIso,
      statusAtSend: nextStatus,
    };
  } else {
    const finalPrice = parseWonAmount(input.finalPrice) ?? 0;
    const parsedExtra = input.extraFeeAmount.trim()
      ? parseWonAmount(input.extraFeeAmount) ?? undefined
      : undefined;
    const extraReason = input.extraFeeReason.trim();

    newVersion = {
      version: nextVersionNumber,
      feasibility: input.feasibility,
      finalPrice,
      extraFeeAmount: parsedExtra,
      extraFeeReason: extraReason || undefined,
      availableDate: input.availableDate,
      availableTime: input.availableTime,
      designGuide: input.designGuide.trim(),
      conditionalNote:
        input.feasibility === '조건부 제작 가능'
          ? input.conditionalNote.trim()
          : undefined,
      respondedAt: nowIso,
      statusAtSend: nextStatus,
    };
  }

  const nextHistory = target.latestQuote
    ? [target.latestQuote, ...(target.quoteHistory ?? [])]
    : [...(target.quoteHistory ?? [])];

  const updatedQuote: CustomQuoteRequest = {
    ...target,
    status: nextStatus,
    latestQuote: newVersion,
    quoteHistory: nextHistory.length > 0 ? nextHistory : undefined,
    updatedAt: nowIso,
  };

  const nextAll = all.map((quote, idx) =>
    idx === targetIndex ? updatedQuote : quote
  );

  const writeResult = writeAllQuoteRequests(nextAll);
  if (!writeResult.ok) {
    return {
      ok: false,
      error: writeResult.error,
      quotes: scopeSellerQuotes(all, ownedShopIds),
    };
  }

  return {
    ok: true,
    updatedQuote,
    quotes: scopeSellerQuotes(nextAll, ownedShopIds),
  };
}

export function startSellerQuoteEditing(
  quoteId: string,
  ownedShopIds: string[]
): {
  ok: boolean;
  error?: string;
  updatedQuote?: CustomQuoteRequest;
  quotes: CustomQuoteRequest[];
} {
  ensureDemoQuoteRequestsSeeded();
  const all = readAllQuoteRequests();
  const targetIndex = all.findIndex((quote) => quote.quoteId === quoteId);

  if (targetIndex === -1) {
    return {
      ok: false,
      error: '해당 견적 요청 정보를 찾을 수 없습니다.',
      quotes: scopeSellerQuotes(all, ownedShopIds),
    };
  }

  const target = all[targetIndex];
  if (!ownedShopIds.includes(target.shopId)) {
    return {
      ok: false,
      error: '현재 계정이 운영하는 매장의 견적만 수정할 수 있습니다.',
      quotes: scopeSellerQuotes(all, ownedShopIds),
    };
  }

  if (target.isAcceptedByConsumer) {
    return {
      ok: false,
      error: '소비자가 이미 수락한 견적은 수정할 수 없습니다.',
      quotes: scopeSellerQuotes(all, ownedShopIds),
    };
  }

  if (!target.latestQuote) {
    return {
      ok: false,
      error: '아직 전송된 견적이 없어 수정 상태로 전환할 수 없습니다.',
      quotes: scopeSellerQuotes(all, ownedShopIds),
    };
  }

  const updatedQuote: CustomQuoteRequest = {
    ...target,
    status: '견적 수정 중',
    updatedAt: new Date().toISOString(),
  };

  const nextAll = all.map((quote, idx) =>
    idx === targetIndex ? updatedQuote : quote
  );

  const writeResult = writeAllQuoteRequests(nextAll);
  if (!writeResult.ok) {
    return {
      ok: false,
      error: writeResult.error,
      quotes: scopeSellerQuotes(all, ownedShopIds),
    };
  }

  return {
    ok: true,
    updatedQuote,
    quotes: scopeSellerQuotes(nextAll, ownedShopIds),
  };
}

export function cancelSellerQuoteEditing(
  quoteId: string,
  ownedShopIds: string[]
): {
  ok: boolean;
  error?: string;
  updatedQuote?: CustomQuoteRequest;
  quotes: CustomQuoteRequest[];
} {
  ensureDemoQuoteRequestsSeeded();
  const all = readAllQuoteRequests();
  const targetIndex = all.findIndex((quote) => quote.quoteId === quoteId);

  if (targetIndex === -1) {
    return {
      ok: false,
      error: '해당 견적 요청 정보를 찾을 수 없습니다.',
      quotes: scopeSellerQuotes(all, ownedShopIds),
    };
  }

  const target = all[targetIndex];
  if (!ownedShopIds.includes(target.shopId)) {
    return {
      ok: false,
      error: '현재 계정이 운영하는 매장의 견적만 변경할 수 있습니다.',
      quotes: scopeSellerQuotes(all, ownedShopIds),
    };
  }

  if (target.status !== '견적 수정 중' || !target.latestQuote) {
    return {
      ok: false,
      error: '현재 수정 중인 견적이 아닙니다.',
      quotes: scopeSellerQuotes(all, ownedShopIds),
    };
  }

  const updatedQuote: CustomQuoteRequest = {
    ...target,
    status: target.latestQuote.statusAtSend,
    updatedAt: new Date().toISOString(),
  };

  const nextAll = all.map((quote, idx) =>
    idx === targetIndex ? updatedQuote : quote
  );

  const writeResult = writeAllQuoteRequests(nextAll);
  if (!writeResult.ok) {
    return {
      ok: false,
      error: writeResult.error,
      quotes: scopeSellerQuotes(all, ownedShopIds),
    };
  }

  return {
    ok: true,
    updatedQuote,
    quotes: scopeSellerQuotes(nextAll, ownedShopIds),
  };
}

function scopeConsumerQuotes(
  items: CustomQuoteRequest[],
  userId: string
): CustomQuoteRequest[] {
  return items
    .filter((quote) => quote.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function acceptQuoteAsConsumer(
  quoteId: string,
  userId: string
): {
  ok: boolean;
  error?: string;
  updatedQuote?: CustomQuoteRequest;
  quotes: CustomQuoteRequest[];
} {
  ensureDemoQuoteRequestsSeeded();
  const all = readAllQuoteRequests();
  const targetIndex = all.findIndex((quote) => quote.quoteId === quoteId);

  if (targetIndex === -1) {
    return {
      ok: false,
      error: '해당 견적 요청을 찾을 수 없습니다.',
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  const target = all[targetIndex];
  if (target.userId !== userId) {
    return {
      ok: false,
      error: '본인이 요청한 견적만 수락할 수 있습니다.',
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  if (target.payment?.isPaid || target.status === '예약 확정') {
    return {
      ok: false,
      error: '이미 결제가 완료되어 예약이 확정된 견적입니다.',
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  if (target.isAcceptedByConsumer || target.acceptedQuote) {
    return {
      ok: false,
      error: '이미 수락이 완료된 견적입니다. 모의 결제를 진행해 주세요.',
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  if (!target.latestQuote || target.latestQuote.feasibility === '제작 불가능') {
    return {
      ok: false,
      error: '제작 가능한 판매자 견적이 도착한 경우에만 수락할 수 있습니다.',
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  if (
    target.status === '견적 수정 중' ||
    target.status === '소비자 수정 요청'
  ) {
    return {
      ok: false,
      error:
        '현재 판매자가 견적을 수정하거나 검토 중입니다. 최신 견적이 도착한 뒤 수락해 주세요.',
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  const latest = target.latestQuote;
  if (
    typeof latest.finalPrice !== 'number' ||
    latest.finalPrice <= 0 ||
    !latest.availableDate ||
    !latest.availableTime
  ) {
    return {
      ok: false,
      error: '견적 금액 또는 수령 일정 정보가 완전하지 않아 수락할 수 없습니다.',
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  const nowIso = new Date().toISOString();
  const acceptedSnapshot: AcceptedQuoteSnapshot = {
    version: latest.version,
    feasibility: latest.feasibility,
    finalPrice: latest.finalPrice,
    extraFeeAmount: latest.extraFeeAmount,
    extraFeeReason: latest.extraFeeReason,
    availableDate: latest.availableDate,
    availableTime: latest.availableTime,
    designGuide: latest.designGuide,
    conditionalNote: latest.conditionalNote,
    acceptedAt: nowIso,
  };

  const updatedQuote: CustomQuoteRequest = {
    ...target,
    status: '견적 수락',
    isAcceptedByConsumer: true,
    acceptedQuote: acceptedSnapshot,
    updatedAt: nowIso,
  };

  const nextAll = all.map((quote, idx) =>
    idx === targetIndex ? updatedQuote : quote
  );

  const writeResult = writeAllQuoteRequests(nextAll);
  if (!writeResult.ok) {
    return {
      ok: false,
      error: writeResult.error,
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  return {
    ok: true,
    updatedQuote,
    quotes: scopeConsumerQuotes(nextAll, userId),
  };
}

export function requestQuoteRevisionAsConsumer(
  quoteId: string,
  userId: string,
  categories: string[],
  note: string
): {
  ok: boolean;
  error?: string;
  updatedQuote?: CustomQuoteRequest;
  quotes: CustomQuoteRequest[];
} {
  ensureDemoQuoteRequestsSeeded();
  const all = readAllQuoteRequests();
  const targetIndex = all.findIndex((quote) => quote.quoteId === quoteId);

  if (targetIndex === -1) {
    return {
      ok: false,
      error: '해당 견적 요청을 찾을 수 없습니다.',
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  const target = all[targetIndex];
  if (target.userId !== userId) {
    return {
      ok: false,
      error: '본인이 요청한 견적에 대해서만 수정 요청할 수 있습니다.',
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  if (target.isAcceptedByConsumer || target.acceptedQuote || target.payment?.isPaid) {
    return {
      ok: false,
      error: '이미 견적을 수락한 뒤에는 수정 요청을 할 수 없습니다.',
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  if (!target.latestQuote) {
    return {
      ok: false,
      error: '판매자의 견적 답변이 도착한 뒤 수정 요청을 보낼 수 있습니다.',
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  const errors = validateConsumerRevisionRequest(categories, note);
  const firstError = Object.values(errors).find(Boolean);
  if (firstError) {
    return {
      ok: false,
      error: firstError,
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  const nowIso = new Date().toISOString();
  const revision: ConsumerRevisionRequest = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    targetQuoteVersion: target.latestQuote.version,
    categories: [...categories],
    note: note.trim(),
    requestedAt: nowIso,
  };

  const updatedQuote: CustomQuoteRequest = {
    ...target,
    status: '소비자 수정 요청',
    revisionRequests: [revision, ...(target.revisionRequests ?? [])],
    updatedAt: nowIso,
  };

  const nextAll = all.map((quote, idx) =>
    idx === targetIndex ? updatedQuote : quote
  );

  const writeResult = writeAllQuoteRequests(nextAll);
  if (!writeResult.ok) {
    return {
      ok: false,
      error: writeResult.error,
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  return {
    ok: true,
    updatedQuote,
    quotes: scopeConsumerQuotes(nextAll, userId),
  };
}

export function completeDemoPaymentForQuote(
  quoteId: string,
  userId: string,
  paymentMethod: PaymentMethod
): {
  ok: boolean;
  error?: string;
  updatedQuote?: CustomQuoteRequest;
  quotes: CustomQuoteRequest[];
} {
  ensureDemoQuoteRequestsSeeded();
  const allowedMethods: PaymentMethod[] = [
    '신용·체크카드',
    '간편결제',
    '무통장입금',
  ];
  const all = readAllQuoteRequests();

  if (!allowedMethods.includes(paymentMethod)) {
    return {
      ok: false,
      error: '유효한 결제 수단을 선택해 주세요.',
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  const targetIndex = all.findIndex((quote) => quote.quoteId === quoteId);
  if (targetIndex === -1) {
    return {
      ok: false,
      error: '결제할 맞춤 견적 요청을 찾을 수 없습니다.',
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  const target = all[targetIndex];
  if (target.userId !== userId) {
    return {
      ok: false,
      error: '본인이 요청한 견적만 결제할 수 있습니다.',
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  if (
    target.payment?.isPaid ||
    target.status === '예약 확정' ||
    target.status === '결제 완료'
  ) {
    return {
      ok: false,
      error: '이미 결제가 완료되어 예약이 확정된 건입니다. 중복 결제는 불가능합니다.',
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  if (!target.isAcceptedByConsumer || !target.acceptedQuote) {
    return {
      ok: false,
      error: '견적을 먼저 수락한 뒤 결제를 진행할 수 있습니다.',
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  const accepted = target.acceptedQuote;
  if (typeof accepted.finalPrice !== 'number' || accepted.finalPrice <= 0) {
    return {
      ok: false,
      error: '수락된 견적 금액 정보가 올바르지 않습니다.',
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  const nowIso = new Date().toISOString();
  const paymentRecord: CustomQuotePayment = {
    isPaid: true,
    quoteId: target.quoteId,
    acceptedVersion: accepted.version,
    paidAmount: accepted.finalPrice,
    paymentMethod,
    paidAt: nowIso,
    confirmedAt: nowIso,
    pickupDate: accepted.availableDate,
    pickupTime: accepted.availableTime,
    isDemoPayment: true,
  };

  const updatedQuote: CustomQuoteRequest = {
    ...target,
    status: '예약 확정',
    payment: paymentRecord,
    updatedAt: nowIso,
  };

  const nextAll = all.map((quote, idx) =>
    idx === targetIndex ? updatedQuote : quote
  );

  const writeResult = writeAllQuoteRequests(nextAll);
  if (!writeResult.ok) {
    return {
      ok: false,
      error: writeResult.error,
      quotes: scopeConsumerQuotes(all, userId),
    };
  }

  return {
    ok: true,
    updatedQuote,
    quotes: scopeConsumerQuotes(nextAll, userId),
  };
}
