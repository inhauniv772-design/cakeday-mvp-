import React, { useState } from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { TextInput } from '../components/TextInput';
import { BRAND_CONTENT, DEMO_ACCOUNT_PRESETS } from '../data/cakedayData';
import type { AppPage, SignupFormState, UserAccount } from '../types';
import { validateSignupForm, type SignupValidationErrors } from '../utils/validation';

interface SignupPageProps {
  registeredUsers: UserAccount[];
  onNavigate: (page: AppPage) => void;
  onSignupComplete: (newUser: UserAccount, notice: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  registeredUsers,
  onNavigate,
  onSignupComplete,
}) => {
  const [form, setForm] = useState<SignupFormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<SignupValidationErrors>({});

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateSignupForm(form);

    const normalizedEmail = form.email.trim().toLowerCase();
    const isDuplicate =
      DEMO_ACCOUNT_PRESETS.some(
        (preset) => preset.email.toLowerCase() === normalizedEmail
      ) ||
      registeredUsers.some(
        (user) => user.email.toLowerCase() === normalizedEmail
      );

    if (!validationErrors.email && isDuplicate) {
      validationErrors.email = '이미 사용 중인 이메일입니다. 다른 이메일을 입력해 주세요.';
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const createdDemoUser: UserAccount = {
      userId: `demo-user-${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      roles: ['consumer'],
      currentMode: null,
    };

    onSignupComplete(
      createdDemoUser,
      `${createdDemoUser.name}님의 데모 계정이 생성되었습니다. 신규 가입 계정은 기본 '소비자' 권한으로 시작되며, 실제 인증 서버는 연결되지 않았습니다.`
    );
  };

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-14">
      <div className="mx-auto max-w-md">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 min-h-[44px] text-sm font-medium text-[#6E5C50] hover:text-[#493B32] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          첫 화면으로 돌아가기
        </button>

        <Card className="mt-4">
          <p className="text-xs font-medium text-[#8F6849]">
            {BRAND_CONTENT.slogan}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#493B32]">회원가입</h1>
          <p className="mt-2 text-sm text-[#6E5C50]">
            기본 정보를 입력해 CakeDay 데모 회원가입을 진행해 보세요.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <TextInput
              id="signup-name"
              label="이름"
              type="text"
              autoComplete="name"
              placeholder="이름을 입력해 주세요"
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={errors.name}
            />

            <TextInput
              id="signup-email"
              label="이메일"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, email: e.target.value }));
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
            />

            <TextInput
              id="signup-password"
              label="비밀번호"
              type="password"
              autoComplete="new-password"
              placeholder="6자 이상 입력해 주세요"
              value={form.password}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, password: e.target.value }));
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
            />

            <TextInput
              id="signup-confirm-password"
              label="비밀번호 확인"
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호를 한 번 더 입력해 주세요"
              value={form.confirmPassword}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, confirmPassword: e.target.value }));
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              error={errors.confirmPassword}
            />

            <div className="pt-2">
              <Button type="submit" variant="primary" size="lg" fullWidth>
                회원가입
              </Button>
            </div>
          </form>

          <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[#FAF8F3] p-4 text-xs text-[#6E5C50]">
            <Info className="h-4 w-4 text-[#B58C6A] mt-0.5 shrink-0" aria-hidden="true" />
            <p className="leading-relaxed">
              신규 회원가입은 기본 <strong className="text-[#493B32]">소비자</strong> 권한으로 등록됩니다. 판매자 권한이 부여된 계정은 로그인 화면의 데모 계정으로 바로 체험하실 수 있습니다.
            </p>
          </div>

          <div className="mt-6 border-t border-[#E9DFD0] pt-5 flex items-center justify-between text-sm">
            <span className="text-[#6E5C50]">이미 계정이 있으신가요?</span>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="min-h-[44px] px-2 font-semibold text-[#8F6849] hover:text-[#493B32] transition-colors cursor-pointer"
            >
              로그인 하기
            </button>
          </div>
        </Card>
      </div>
    </section>
  );
};
