import { getMockCakeShops } from '../data/mockShops';
import type {
  CakeShop,
  CustomQuoteRequest,
  QuoteAttachmentImage,
} from '../types';
import {
  addDaysToDateParts,
  formatDateParts,
  getTodayDateParts,
} from '../utils/dateUtils';

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
        '브라우저 저장 공간(localStorage) 용량 한도를 초과하여 견적 요청을 저장하지 못했습니다. 첨부 사진 수를 줄이거나 기존 시연 데이터를 정리한 뒤 다시 시도해 주세요.',
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

  const today = getTodayDateParts();
  const now = Date.now();
  const isoOffset = (minutesAgo: number) =>
    new Date(now - minutesAgo * 60_000).toISOString();

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
