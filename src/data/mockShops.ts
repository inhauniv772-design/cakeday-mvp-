import cakeChocolateGanacheImg from '../assets/images/cake_chocolate_ganache_1795101869475.jpg';
import cakeEarlGreyFigImg from '../assets/images/cake_earl_grey_fig_1795101870777.jpg';
import cakeLemonChamomileImg from '../assets/images/cake_lemon_chamomile_1795101869534.jpg';
import cakeMatchaBentoImg from '../assets/images/cake_matcha_bento_1795101869431.jpg';
import cakeStrawberryVintageImg from '../assets/images/cake_strawberry_vintage_1795101867927.jpg';
import heroCustomCakeImg from '../assets/images/hero_custom_cake_1795099685809.jpg';
import type { CakeShop } from '../types';
import { addDaysToDateParts, formatDateParts, getTodayDateParts } from '../utils/dateUtils';

function buildDatesFromOffsets(offsets: number[]): string[] {
  const today = getTodayDateParts();
  return offsets.map((offset) => formatDateParts(addDaysToDateParts(today, offset)));
}

export function getMockCakeShops(): CakeShop[] {
  return [
    {
      shopId: 'mock-shop-001',
      shopName: '온기 케이크 아틀리에',
      region: { sido: '서울특별시', sigungu: '마포구' },
      address: '서울특별시 마포구 동교로 241-18 1층',
      introduction:
        '동물성 생크림과 제철 과일만을 사용해 부드럽고 과하지 않은 단맛의 빈티지 케이크를 제작하는 연남동 공방입니다.',
      representativeImage: cakeStrawberryVintageImg,
      representativeCakeName: '생딸기 빈티지 리본 케이크',
      representativeCakePrice: 54000,
      representativeCakeDescription:
        '촉촉한 바닐라 제누와즈에 생딸기와 우유 생크림, 섬세한 아이보리 리본 파이핑을 더한 1호 케이크입니다.',
      sameDayAvailable: true,
      pickupAvailableDates: buildDatesFromOffsets([
        0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 14,
      ]),
      operatingHours: '매일 11:00 - 20:00 (수요일 휴무)',
      contactInformation: '02-334-0192 (가상 연락처)',
      isMockData: true,
    },
    {
      shopId: 'mock-shop-002',
      shopName: '메종 얼그레이 베이커리',
      region: { sido: '서울특별시', sigungu: '성동구' },
      address: '서울특별시 성동구 서울숲2길 19 2층',
      introduction:
        '깊게 우린 홍차 크림과 제철 과일의 조화를 중심으로 차분한 무드의 기념일 케이크를 예약제로 선보입니다.',
      representativeImage: cakeEarlGreyFigImg,
      representativeCakeName: '무화과 얼그레이 시폰 케이크',
      representativeCakePrice: 58000,
      representativeCakeDescription:
        '향긋한 얼그레이 크림 위에 신선한 무화과와 구운 피스타치오를 올린 성수동 시그니처 케이크입니다.',
      sameDayAvailable: false,
      pickupAvailableDates: buildDatesFromOffsets([
        1, 2, 3, 4, 5, 7, 8, 9, 10, 12, 13, 14,
      ]),
      operatingHours: '화-일 11:30 - 19:30 (월요일 휴무)',
      contactInformation: '02-468-5521 (가상 연락처)',
      isMockData: true,
    },
    {
      shopId: 'mock-shop-003',
      shopName: '코코아 누아르 파티세리',
      region: { sido: '서울특별시', sigungu: '강남구' },
      address: '서울특별시 강남구 선릉로158길 12 1층',
      introduction:
        '벨기에산 다크 커버춰 초콜릿과 수제 베리 콩포트를 활용해 기념일에 어울리는 진한 풍미의 케이크를 만듭니다.',
      representativeImage: cakeChocolateGanacheImg,
      representativeCakeName: '라즈베리 다크 가나슈 케이크',
      representativeCakePrice: 62000,
      representativeCakeDescription:
        '묵직하고 진한 다크 초콜릿 가나슈에 상큼한 산딸기와 카카오 닙스를 얹은 클래식 축하 케이크입니다.',
      sameDayAvailable: true,
      pickupAvailableDates: buildDatesFromOffsets([
        0, 1, 2, 4, 5, 6, 7, 9, 10, 11, 13,
      ]),
      operatingHours: '매일 10:30 - 20:30',
      contactInformation: '02-542-8830 (가상 연락처)',
      isMockData: true,
    },
    {
      shopId: 'mock-shop-004',
      shopName: '소소 말차 도시락 공방',
      region: { sido: '경기도', sigungu: '성남시 분당구' },
      address: '경기도 성남시 분당구 정자일로 166 1층',
      introduction:
        '부담 없이 마음을 전할 수 있는 미니 도시락 케이크와 소규모 축하 케이크를 당일·사전 예약으로 정성껏 준비합니다.',
      representativeImage: cakeMatchaBentoImg,
      representativeCakeName: '제주 말차 미니 도시락 케이크',
      representativeCakePrice: 28000,
      representativeCakeDescription:
        '은은하고 쌉싸름한 제주 말차 크림과 부드러운 화이트 시트가 어우러진 1~2인용 미니 케이크입니다.',
      sameDayAvailable: true,
      pickupAvailableDates: buildDatesFromOffsets([
        0, 1, 3, 4, 5, 6, 8, 9, 11, 12, 14,
      ]),
      operatingHours: '매일 11:00 - 19:00',
      contactInformation: '031-712-4089 (가상 연락처)',
      isMockData: true,
    },
    {
      shopId: 'mock-shop-005',
      shopName: '들꽃 캐모마일 케이크',
      region: { sido: '인천광역시', sigungu: '연수구' },
      address: '인천광역시 연수구 센트럴로 194 102호',
      introduction:
        '식용 꽃과 상큼한 시트러스 향으로 특별한 날의 테이블을 화사하게 채워주는 송도 커스텀 케이크 스튜디오입니다.',
      representativeImage: cakeLemonChamomileImg,
      representativeCakeName: '레몬 캐모마일 플라워 케이크',
      representativeCakePrice: 74000,
      representativeCakeDescription:
        '상큼한 레몬 커드와 부드러운 버터크림 위에 식용 캐모마일 꽃을 장식한 기념일용 2단 케이크입니다.',
      sameDayAvailable: false,
      pickupAvailableDates: buildDatesFromOffsets([
        2, 3, 4, 5, 6, 7, 9, 10, 12, 13, 14,
      ]),
      operatingHours: '수-일 11:00 - 19:00 (월·화 휴무)',
      contactInformation: '032-831-7745 (가상 연락처)',
      isMockData: true,
    },
    {
      shopId: 'mock-shop-006',
      shopName: '베이지 블룸 케이크숍',
      region: { sido: '인천광역시', sigungu: '남동구' },
      address: '인천광역시 남동구 인주대로 593 1층',
      introduction:
        '차분한 파스텔 톤의 보태니컬 버터크림 파이핑으로 생일과 부모님 기념일에 잘 어울리는 케이크를 제작합니다.',
      representativeImage: heroCustomCakeImg,
      representativeCakeName: '보태니컬 파스텔 플라워 케이크',
      representativeCakePrice: 49000,
      representativeCakeDescription:
        '아이보리 톤 버터크림 바탕에 잔잔한 들꽃 파이핑을 올려 어느 기념일에도 잘 어울리는 1호 케이크입니다.',
      sameDayAvailable: false,
      pickupAvailableDates: buildDatesFromOffsets([
        1, 2, 3, 5, 6, 7, 8, 10, 11, 13, 14,
      ]),
      operatingHours: '화-토 11:00 - 19:30 (일·월 휴무)',
      contactInformation: '032-425-9104 (가상 연락처)',
      isMockData: true,
    },
  ];
}

export function formatPriceKRW(price: number): string {
  return `${price.toLocaleString('ko-KR')}원`;
}
