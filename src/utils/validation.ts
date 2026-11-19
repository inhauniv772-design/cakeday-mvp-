import type { LoginFormState, SignupFormState } from '../types';

export interface LoginValidationErrors {
  email?: string;
  password?: string;
}

export interface SignupValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginForm(form: LoginFormState): LoginValidationErrors {
  const errors: LoginValidationErrors = {};

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

  return errors;
}

export function validateSignupForm(form: SignupFormState): SignupValidationErrors {
  const errors: SignupValidationErrors = {};

  if (!form.name.trim()) {
    errors.name = '이름을 입력해 주세요.';
  }

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

  if (!form.confirmPassword.trim()) {
    errors.confirmPassword = '비밀번호 확인을 입력해 주세요.';
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '비밀번호가 일치하지 않습니다.';
  }

  return errors;
}
