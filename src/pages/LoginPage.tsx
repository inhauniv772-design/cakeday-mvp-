import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Info, KeyRound } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { TextInput } from '../components/TextInput';
import { BRAND_CONTENT, DEMO_ACCOUNT_PRESETS } from '../data/cakedayData';
import type { AppPage, DemoAccountPreset, LoginFormState, UserAccount } from '../types';
import { validateLoginForm, type LoginValidationErrors } from '../utils/validation';

interface LoginPageProps {
  registeredUsers: UserAccount[];
  redirectNotice?: string | null;
  onNavigate: (page: AppPage) => void;
  onLoginSuccess: (account: UserAccount, notice?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  registeredUsers,
  redirectNotice,
  onNavigate,
  onLoginSuccess,
}) => {
  const [form, setForm] = useState<LoginFormState>({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<LoginValidationErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const handleDemoPresetLogin = (preset: DemoAccountPreset) => {
    onLoginSuccess(
      {
        userId: preset.userId,
        name: preset.name,
        email: preset.email,
        roles: [...preset.roles],
        currentMode: null,
      },
      `${preset.name}님(${preset.roleLabel}) 데모 계정으로 로그인되었습니다. 이용할 모드를 선택해 주세요.`
    );
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);

    const validationErrors = validateLoginForm(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const normalizedEmail = form.email.trim().toLowerCase();

    const matchedPreset = DEMO_ACCOUNT_PRESETS.find(
      (preset) => preset.email.toLowerCase() === normalizedEmail
    );
    if (matchedPreset) {
      handleDemoPresetLogin(matchedPreset);
      return;
    }

    const matchedRegistered = registeredUsers.find(
      (user) => user.email.toLowerCase() === normalizedEmail
    );
    if (matchedRegistered) {
      onLoginSuccess(
        {
          ...matchedRegistered,
          roles: [...matchedRegistered.roles],
          currentMode: null,
        },
        `${matchedRegistered.name}님 데모 계정으로 로그인되었습니다.`
      );
      return;
    }

    setAuthError(
      '등록된 데모 계정을 찾을 수 없습니다. 아래 시연용 데모 계정을 선택하거나 회원가입을 진행해 주세요.'
    );
  };

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 md:py-14">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 min-h-[44px] text-sm font-medium text-[#6E5C50] hover:text-[#493B32] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          첫 화면으로 돌아가기
        </button>

        {redirectNotice && (
          <div
            role="status"
            className="mt-4 rounded-2xl border border-[#B58C6A]/50 bg-[#FFFFFF] px-4 py-3 text-sm text-[#493B32]"
          >
            {redirectNotice}
          </div>
        )}

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Standard Login Form */}
          <Card className="lg:col-span-6">
            <p className="text-xs font-medium text-[#8F6849]">
              {BRAND_CONTENT.slogan}
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[#493B32]">로그인</h1>
            <p className="mt-2 text-sm text-[#6E5C50]">
              이메일과 비밀번호를 입력해 CakeDay 계정에 로그인하세요.
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
              <TextInput
                id="login-email"
                label="이메일"
                type="email"
                autoComplete="email"
                placeholder="dual@cakeday.demo"
                value={form.email}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, email: e.target.value }));
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  if (authError) setAuthError(null);
                }}
                error={errors.email}
              />

              <TextInput
                id="login-password"
                label="비밀번호"
                type="password"
                autoComplete="current-password"
                placeholder="6자 이상 입력해 주세요"
                value={form.password}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, password: e.target.value }));
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  if (authError) setAuthError(null);
                }}
                error={errors.password}
              />

              {authError && (
                <div
                  role="alert"
                  className="rounded-2xl border border-[#9F4A3B]/40 bg-[#FAF8F3] px-4 py-3 text-xs sm:text-sm text-[#9F4A3B]"
                >
                  {authError}
                </div>
              )}

              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" fullWidth>
                  로그인
                </Button>
              </div>
            </form>

            <div className="mt-6 border-t border-[#E9DFD0] pt-5 flex items-center justify-between text-sm">
              <span className="text-[#6E5C50]">아직 계정이 없으신가요?</span>
              <button
                type="button"
                onClick={() => onNavigate('signup')}
                className="min-h-[44px] px-2 font-semibold text-[#8F6849] hover:text-[#493B32] transition-colors cursor-pointer"
              >
                회원가입 하기
              </button>
            </div>
          </Card>

          {/* Demo Accounts Panel for Presentation */}
          <Card tone="beige" className="lg:col-span-6">
            <div className="flex items-center gap-2 text-xs font-medium text-[#8F6849]">
              <KeyRound className="h-4 w-4" aria-hidden="true" />
              <span>시연용 데모 계정 로그인</span>
            </div>
            <h2 className="mt-2 text-xl font-bold text-[#493B32]">
              권한별 계정 바로 체험하기
            </h2>
            <p className="mt-2 text-sm text-[#6E5C50] leading-relaxed">
              버튼을 누르면 해당 권한을 가진 데모 계정으로 로그인되어 모드 선택 및 접근 제한 동작을 즉시 확인할 수 있습니다.
            </p>

            <div className="mt-5 space-y-3">
              {DEMO_ACCOUNT_PRESETS.map((preset) => (
                <button
                  key={preset.userId}
                  type="button"
                  onClick={() => handleDemoPresetLogin(preset)}
                  className="w-full min-h-[48px] text-left rounded-2xl bg-[#FFFFFF] border border-[#E9DFD0] p-4 transition-all duration-150 hover:border-[#B58C6A] active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-[#493B32]">
                        {preset.name}{' '}
                        <span className="font-medium text-[#8F6849]">
                          · {preset.roleLabel}
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-[#6E5C50] tabular-nums">
                        {preset.email} / 비밀번호: {preset.passwordHint}
                      </p>
                    </div>
                    <ArrowRight
                      className="h-4 w-4 text-[#B58C6A] shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-2 text-xs text-[#6E5C50] leading-relaxed">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[#FFFFFF]/80 p-4 text-xs text-[#6E5C50]">
              <Info className="h-4 w-4 text-[#B58C6A] mt-0.5 shrink-0" aria-hidden="true" />
              <p className="leading-relaxed">
                <strong className="font-semibold text-[#493B32]">
                  {BRAND_CONTENT.authNoticeTitle}:{' '}
                </strong>
                {BRAND_CONTENT.authNoticeBody}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};
