import type { AuthFormState } from '../types';

export interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  shopName?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateAuthForm(
  mode: 'login' | 'signup',
  form: AuthFormState
): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!form.email.trim()) {
    errors.email = '이메일 주소를 입력해 주세요.';
  } else if (!EMAIL_REGEX.test(form.email.trim())) {
    errors.email = '올바른 이메일 형식을 확인해 주세요.';
  }

  if (!form.password.trim()) {
    errors.password = '비밀번호를 입력해 주세요.';
  } else if (form.password.trim().length < 6) {
    errors.password = '비밀번호는 6자 이상으로 입력해 주세요.';
  }

  if (mode === 'signup') {
    if (!form.name.trim()) {
      errors.name = '이름 또는 닉네임을 입력해 주세요.';
    }
    if (form.role === 'seller' && !form.shopName.trim()) {
      errors.shopName = '운영 중인 공방 또는 매장명을 입력해 주세요.';
    }
  }

  return errors;
}
