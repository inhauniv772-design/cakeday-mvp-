import heroCustomCakeImg from '../assets/images/hero_custom_cake_1795099685809.jpg';
import bakeryAtelierImg from '../assets/images/bakery_atelier_counter_1795099685983.jpg';
import giftCakePackagingImg from '../assets/images/gift_cake_packaging_1795099687517.jpg';
import type {
  BrandContent,
  DemoAccountPreset,
  ModeOverview,
  RoleGuide,
  ServiceHighlight,
} from '../types';

export const HERO_MEDIA = {
  src: heroCustomCakeImg,
  alt: '따뜻한 아이보리 린넨 테이블 위의 커스텀 버터크림 케이크',
};

export const CORE_VALUE_MEDIA = {
  src: giftCakePackagingImg,
  alt: '소프트 브라운 리본으로 정성스럽게 포장된 케이크 선물 상자와 기념 카드',
};

export const BRAND_CONTENT: BrandContent = {
  name: 'CakeDay',
  slogan: '까먹지 말고 미리 주문하세요!',
  kicker: '기념일 커스텀 케이크 사전 예약 플랫폼',
  heroDescription:
    '생일과 기념일처럼 잊고 싶지 않은 날을 미리 챙길 수 있도록, 소비자와 커스텀 케이크 전문점을 따뜻하게 이어주는 공간입니다.',
  coreMessageTitle: '기념일을 기억하는 가장 여유로운 방법',
  coreMessageBody:
    '마음이 담긴 케이크는 하루아침에 완성되지 않습니다. 소중한 날짜를 먼저 떠올리고 여유 있게 준비할 때, 받는 사람도 만드는 공방도 가장 기분 좋은 하루를 맞이할 수 있습니다.',
  authNoticeTitle: '데모 환경 안내',
  authNoticeBody:
    '현재는 실제 인증 서버나 데이터베이스가 연결되지 않은 데모 단계입니다. 아래 데모 계정 또는 회원가입 시연으로 권한별 모드 전환을 확인할 수 있습니다.',
  copyright: '© 2026 CakeDay. All rights reserved.',
};

export const SERVICE_HIGHLIGHTS: ServiceHighlight[] = [
  {
    id: 'remember-dates',
    orderLabel: '01',
    title: '특별한 날짜를 놓치지 않는 준비',
    description:
      '가족의 생일, 연인과의 기념일, 고마운 분께 전할 날을 미리 떠올리고 여유 있는 일정으로 케이크를 준비할 수 있습니다.',
  },
  {
    id: 'match-atelier',
    orderLabel: '02',
    title: '취향과 일정에 맞춘 전문점 탐색',
    description:
      '원하는 날짜에 맞춰 정성스러운 커스텀 케이크를 제작하는 전문점을 찾고, 부담 없이 사전 주문을 준비할 수 있습니다.',
  },
  {
    id: 'connect-warmly',
    orderLabel: '03',
    title: '소비자와 판매자를 잇는 정돈된 소통',
    description:
      '주문하는 소비자와 제작에 집중하는 케이크 공방 모두가 약속된 일정 안에서 편안하게 연결되는 플랫폼을 지향합니다.',
  },
];

export const ROLE_GUIDES: RoleGuide[] = [
  {
    role: 'consumer',
    title: '소중한 날을 챙기는 소비자',
    subtitle: '생일 · 기념일 · 축하 선물',
    summary:
      '잊기 쉬운 기념일을 미리 기억하고, 원하는 날짜에 맞춰 나만의 커스텀 케이크를 여유롭게 준비할 수 있습니다.',
    benefits: [
      '특별한 날짜를 기준으로 사전 주문 계획 세우기',
      '다양한 커스텀 케이크 전문점 스타일 살펴보기',
      '마감 임박 걱정 없이 여유로운 기념일 준비',
    ],
    ctaLabel: '소비자 이용 안내 · 로그인',
    imageSrc: giftCakePackagingImg,
    imageAlt: '기념일 선물용으로 포장된 케이크 상자',
  },
  {
    role: 'seller',
    title: '정성을 굽는 케이크 판매자',
    subtitle: '커스텀 케이크 공방 · 베이커리',
    summary:
      '우리 매장만의 섬세한 케이크 작업을 소개하고, 사전 예약을 통해 예측 가능한 일정으로 고객을 만날 수 있습니다.',
    benefits: [
      '공방의 대표 커스텀 케이크 무드와 강점 소개',
      '사전 예약 중심의 안정적인 제작 일정 운영',
      '특별한 날을 찾는 고객과의 신뢰 기반 연결',
    ],
    ctaLabel: '판매자 이용 안내 · 로그인',
    imageSrc: bakeryAtelierImg,
    imageAlt: '햇살이 드는 따뜻한 분위기의 커스텀 케이크 공방 카운터',
  },
];

export const DEMO_ACCOUNT_PRESETS: DemoAccountPreset[] = [
  {
    userId: 'demo-dual-001',
    name: '김다온',
    email: 'dual@cakeday.demo',
    roles: ['consumer', 'seller'],
    currentMode: null,
    passwordHint: 'demo1234',
    roleLabel: '소비자 + 판매자 권한',
    description: '하나의 계정으로 소비자 모드와 판매자 모드를 모두 전환할 수 있습니다.',
  },
  {
    userId: 'demo-consumer-002',
    name: '이서연',
    email: 'consumer@cakeday.demo',
    roles: ['consumer'],
    currentMode: null,
    passwordHint: 'demo1234',
    roleLabel: '소비자 전용 권한',
    description: '소비자 모드만 이용할 수 있으며 판매자 모드 접근이 제한됩니다.',
  },
  {
    userId: 'demo-seller-003',
    name: '온기아틀리에',
    email: 'seller@cakeday.demo',
    roles: ['seller'],
    currentMode: null,
    passwordHint: 'demo1234',
    roleLabel: '판매자 전용 권한',
    description: '판매자 모드만 이용할 수 있으며 소비자 모드 접근이 제한됩니다.',
  },
];

export const MODE_OVERVIEWS: Record<'consumer' | 'seller', ModeOverview> = {
  consumer: {
    mode: 'consumer',
    title: '소비자 모드',
    audienceLabel: '일반 소비자를 위한 서비스',
    description: '원하는 날짜에 맞춰 커스텀 케이크를 검색하고 주문할 수 있는 공간입니다.',
    workspaceNotice:
      '기념일 등록, 케이크 검색 및 주문 기능은 다음 개발 단계에서 이 소비자 모드 화면에 연결될 예정입니다.',
    entryButtonLabel: '소비자 모드 진입',
    nextStepSummary: '기념일 관리 · 커스텀 케이크 검색 · 사전 주문 기능 준비 중',
  },
  seller: {
    mode: 'seller',
    title: '판매자 모드',
    audienceLabel: '커스텀 케이크 매장 운영자를 위한 서비스',
    description: '매장에 접수된 주문을 확인하고 제작 일정을 관리할 수 있는 공간입니다.',
    workspaceNotice:
      '매장 등록, 주문 확인 및 일정 관리 기능은 다음 개발 단계에서 이 판매자 모드 화면에 연결될 예정입니다.',
    entryButtonLabel: '판매자 모드 진입',
    nextStepSummary: '주문 확인 · 제작 일정 관리 · 공방 운영 기능 준비 중',
  },
};
