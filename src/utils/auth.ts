import type { UserAccount, UserRole } from '../types';

export function hasRole(user: UserAccount | null, role: UserRole): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

export function canSwitchModes(user: UserAccount | null): boolean {
  if (!user) return false;
  return user.roles.includes('consumer') && user.roles.includes('seller');
}

export function getRoleDisplayName(role: UserRole): string {
  return role === 'consumer' ? '소비자' : '판매자';
}

export function getModeDisplayName(mode: UserRole | null): string {
  if (mode === 'consumer') return '소비자 모드';
  if (mode === 'seller') return '판매자 모드';
  return '모드 선택 전';
}

export function formatRolesSummary(roles: UserRole[]): string {
  if (roles.length === 0) return '권한 없음';
  return roles.map(getRoleDisplayName).join(' · ');
}
