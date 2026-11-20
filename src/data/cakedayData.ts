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
    ownedShopIds: ['mock-shop-001', 'mock-shop-003', 'mock-shop-004'],
    passwordHint: 'demo1234',
    roleLabel: '소비자 + 판매자 권한',
    description:
      '소비자 모드에서 주문한 뒤 판매자 모드(온기 케이크 아틀리에 외 2곳)에서 주문을 확인하고 승인·거절할 수 있습니다.',
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
    ownedShopIds: ['mock-shop-001'],
    passwordHint: 'demo1234',
    roleLabel: '판매자 전용 권한',
    description:
      '온기 케이크 아틀리에 매장의 주문 관리 화면을 이용할 수 있으며 소비자 모드 접근이 제한됩니다.',
  },
];

export const MODE_OVERVIEWS: Record<'consumer' | 'seller', ModeOverview> = {
  consumer: {
    mode: 'consumer',
    title: '소비자 모드',
    audienceLabel: '일반 소비자를 위한 서비스',
    description: '원하는 날짜에 맞춰 커스텀 케이크를 검색하고 주문할 수 있는 공간입니다.',
    workspaceNotice:
      '기념일 관리, 커스텀 케이크 매장 검색, 맞춤 주문 신청 및 진행 상태 확인을 이용할 수 있습니다.',
    entryButtonLabel: '소비자 모드 진입',
    nextStepSummary: '기념일 관리 · 케이크 검색 · 주문 신청 및 상태 확인',
  },
  seller: {
    mode: 'seller',
    title: '판매자 모드',
    audienceLabel: '커스텀 케이크 매장 운영자를 위한 서비스',
    description: '운영 중인 매장에 접수된 주문을 확인하고 승인 또는 거절할 수 있는 공간입니다.',
    workspaceNotice:
      '운영 매장에 접수된 주문의 세부 옵션을 검토하고 승인 완료 또는 거절 사유를 등록할 수 있습니다.',
    entryButtonLabel: '판매자 모드 진입',
    nextStepSummary: '접수 주문 조회 · 상세 옵션 확인 · 주문 승인 및 거절 관리',
  },
};

export const DEMO_PRESET_USER_IDS = DEMO_ACCOUNT_PRESETS.map(
  (preset) => preset.userId
);

export const FUTURE_EXPANSION_ITEMS: Array<{
  category: string;
  title: string;
  description: string;
}> = [
  {
    category: '맞춤 견적 고도화',
    title: '판매자 견적 금액 작성 및 소비자 수락·결제 연결',
    description:
      '판매자가 요청된 디자인 사진과 사양을 검토해 견적 금액을 제시하고, 소비자가 수락 후 결제까지 이어지는 기능',
  },
  {
    category: '맞춤 디자인 소통',
    title: '판매자 사진 확인 및 제작 가능 여부 응답',
    description:
      '첨부된 참고 이미지를 판매자가 검토하고 제작 가능 여부를 안내하는 기능',
  },
  {
    category: '맞춤 디자인 소통',
    title: '소비자·판매자 간 추가 요청 및 답변',
    description:
      '견적 요청 접수 이후 세부 수정 요청과 매장 답변을 주고받는 1:1 커뮤니케이션 기능',
  },
  {
    category: 'AI 기능 확장',
    title: 'AI 기반 디자인 분석',
    description:
      '참고 케이크 이미지를 분석해 색상·파이핑·난이도 요소를 자동 정리하는 기능',
  },
  {
    category: 'AI 기능 확장',
    title: 'AI 기반 가격 견적',
    description:
      '선택 옵션과 디자인 복잡도를 바탕으로 예상 추가 견적을 산출하는 기능',
  },
  {
    category: 'AI 기능 확장',
    title: 'AI 자동화 및 판매자 업무 보조',
    description:
      '주문 요약, 제작 일정 배치, 안내 문구 작성을 보조하는 판매자 워크플로우 기능',
  },
  {
    category: '실서비스 연동',
    title: '실제 매장 데이터 연동',
    description:
      '외부 서버 데이터베이스를 통한 실시간 매장 재고·예약 가능 시간 동기화',
  },
  {
    category: '실서비스 연동',
    title: '실제 결제 API 연동',
    description:
      'PG사 실결제 모듈 및 환불·정산 처리가 연동된 상용 결제 시스템',
  },
];
