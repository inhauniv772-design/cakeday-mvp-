export type AppPage =
  | 'home'
  | 'login'
  | 'signup'
  | 'mode-select'
  | 'consumer'
  | 'seller';

export type UserRole = 'consumer' | 'seller';

export type RoleFilter = 'all' | UserRole;

export interface UserAccount {
  userId: string;
  name: string;
  email: string;
  roles: UserRole[];
  currentMode: UserRole | null;
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
