export type AppPage =
  | 'home'
  | 'login'
  | 'signup'
  | 'mode-select'
  | 'consumer'
  | 'seller';

export type UserRole = 'consumer' | 'seller';

export type RoleFilter = 'all' | UserRole;

export type ConsumerTab = 'home' | 'calendar' | 'search' | 'mypage';

export type ShopOrderFilter = 'all' | 'sameDay' | 'reservation';

export interface ShopRegion {
  sido: string;
  sigungu: string;
}

export interface CakeShop {
  shopId: string;
  shopName: string;
  region: ShopRegion;
  address: string;
  introduction: string;
  representativeImage: string;
  representativeCakeName: string;
  representativeCakePrice: number;
  representativeCakeDescription: string;
  sameDayAvailable: boolean;
  pickupAvailableDates: string[];
  operatingHours: string;
  contactInformation: string;
  isMockData: true;
}

export type CakeOrderStatus =
  | '판매자 확인 대기'
  | '판매자 승인 완료'
  | '판매자 거절'
  | '결제 완료 및 예약 확정';

export type SellerOrderFilter =
  | 'all'
  | 'pending'
  | 'approved'
  | 'paid'
  | 'rejected';

export type PaymentMethod = '신용·체크카드' | '간편결제' | '무통장입금';

export interface CakeOrderPayment {
  isPaid: boolean;
  paymentMethod: PaymentMethod;
  paidAt: string;
  paidAmount: number;
  basePrice: number;
  additionalOptionPrice: number | null;
  isDemoPayment: true;
}

export interface CakeOrderOptions {
  cakeSize: string;
  cakeShape: string;
  cakeFlavor: string;
  designType: string;
  cakeColor: string;
  letteringText: string;
  additionalRequests: string;
}

export interface CakeOrderFormInput {
  pickupDate: string;
  pickupTime: string;
  cakeSize: string;
  cakeShape: string;
  cakeFlavor: string;
  designType: string;
  cakeColorPreset: string;
  cakeColorCustom: string;
  letteringText: string;
  additionalRequests: string;
}

export interface CakeOrder {
  orderId: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  shopId: string;
  shopName: string;
  shopRegionText: string;
  cakeName: string;
  cakePrice: number;
  cakeImage: string;
  pickupDate: string;
  pickupTime: string;
  options: CakeOrderOptions;
  applicationStatus: '주문 신청 완료';
  status: CakeOrderStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  payment?: CakeOrderPayment;
  isDemoSeed?: boolean;
  orderedAt: string;
}

export type AnniversaryCategory =
  | 'birthday'
  | 'couple'
  | 'family'
  | 'friend'
  | 'other';

export interface Anniversary {
  id: string;
  userId: string;
  title: string;
  category: AnniversaryCategory;
  date: string; // YYYY-MM-DD (original user-entered date)
  memo: string;
  repeatAnnually: boolean;
  acknowledgedOccurrenceKey?: string;
  isDemoSeed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnniversaryFormInput {
  title: string;
  category: AnniversaryCategory;
  date: string;
  memo: string;
  repeatAnnually: boolean;
}

export interface DDayInfo {
  daysRemaining: number;
  label: string; // e.g., "D-Day", "D-3", "D+2"
  occurrenceDate: string; // YYYY-MM-DD of the target occurrence
  isToday: boolean;
  isPastOneTime: boolean;
}

export interface UserAccount {
  userId: string;
  name: string;
  email: string;
  roles: UserRole[];
  currentMode: UserRole | null;
  ownedShopIds?: string[];
}

export interface DemoAccountPreset extends UserAccount {
  passwordHint: string;
  roleLabel: string;
  description: string;
}

export interface ServiceHighlight {
  id: string;
  orderLabel: string;
  title: string;
  description: string;
}

export interface RoleGuide {
  role: UserRole;
  title: string;
  subtitle: string;
  summary: string;
  benefits: string[];
  ctaLabel: string;
  imageSrc: string;
  imageAlt: string;
}

export interface ModeOverview {
  mode: UserRole;
  title: string;
  audienceLabel: string;
  description: string;
  workspaceNotice: string;
  entryButtonLabel: string;
  nextStepSummary: string;
}

export interface LoginFormState {
  email: string;
  password: string;
}

export interface SignupFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface BrandContent {
  name: string;
  slogan: string;
  kicker: string;
  heroDescription: string;
  coreMessageTitle: string;
  coreMessageBody: string;
  authNoticeTitle: string;
  authNoticeBody: string;
  copyright: string;
}
