export type AppPage = 'home' | 'login' | 'signup';

export type UserRole = 'consumer' | 'seller';

export type RoleFilter = 'all' | UserRole;

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

export interface AuthFormState {
  role: UserRole;
  name: string;
  email: string;
  password: string;
  shopName: string;
}

export interface AuthSubmissionPreview {
  mode: 'login' | 'signup';
  role: UserRole;
  email: string;
  message: string;
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
