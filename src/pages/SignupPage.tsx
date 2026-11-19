import React, { useState } from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { TextInput } from '../components/TextInput';
import { BRAND_CONTENT } from '../data/cakedayData';
import type { AppPage, AuthFormState, AuthSubmissionPreview, UserRole } from '../types';
import { cn } from '../utils/cn';
import { validateAuthForm, type ValidationErrors } from '../utils/validation';

interface SignupPageProps {
  initialRole?: UserRole;
  onNavigate: (page: AppPage, presetRole?: UserRole) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({
  initialRole = 'consumer',
  onNavigate,
}) => {
  const [form, setForm] = useState<AuthFormState>({
    role: initialRole,
    name: '',
    email: '',
    password: '',
    shopName: '',
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [preview, setPreview] = useState<AuthSubmissionPreview | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validateAuthForm('signup', form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setPreview(null);
      return;
    }

    const roleLabel = form.role === 'consumer' ? '소비자' : '판매자';
    setPreview({
      mode: 'signup',
      role: form.role,
      email: form.email.trim(),
      message: `${roleLabel} 회원가입 입력이 확인되었습니다. 실제 계정 생성 및 저장 기능은 추후 데이터베이스 연동 단계에서 연결될 예정입니다.`,
    });
  };

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
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
            소비자와 커스텀 케이크 판매자 중 가입 유형을 선택해 주세요.
          </p>

          {/* Role Toggle */}
          <div
            role="group"
            aria-label="가입 유형 선택"
            className="mt-6 grid grid-cols-2 gap-1.5 rounded-2xl bg-[#E9DFD0]/70 p-1"
          >
            {(['consumer', 'seller'] as UserRole[]).map((roleOption) => {
              const isSelected = form.role === roleOption;
              return (
                <button
                  key={roleOption}
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({ ...prev, role: roleOption }));
                    setErrors({});
                    setPreview(null);
                  }}
                  className={cn(
                    'min-h-[44px] rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer',
                    isSelected
                      ? 'bg-[#FFFFFF] text-[#493B32] shadow-sm shadow-[#493B32]/5'
                      : 'text-[#6E5C50] hover:text-[#493B32]'
                  )}
                >
                  {roleOption === 'consumer' ? '소비자 가입' : '판매자 가입'}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
            <TextInput
              id="signup-name"
              label={form.role === 'consumer' ? '이름 (닉네임)' : '대표자명'}
              type="text"
              autoComplete="name"
              placeholder={
                form.role === 'consumer' ? '홍길동' : '담당자 성함을 입력해 주세요'
              }
              value={form.name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, name: e.target.value }));
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={errors.name}
            />

            {form.role === 'seller' && (
              <TextInput
                id="signup-shop-name"
                label="공방 / 매장명"
                type="text"
                placeholder="예: 온기 케이크 아틀리에"
                value={form.shopName}
                onChange={(e) => {
                  setForm((prev) => ({ ...prev, shopName: e.target.value }));
                  if (errors.shopName) {
                    setErrors((prev) => ({ ...prev, shopName: undefined }));
                  }
                }}
                error={errors.shopName}
              />
            )}

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

            <div className="pt-2">
              <Button type="submit" variant="primary" size="lg" fullWidth>
                회원가입
              </Button>
            </div>
          </form>

          {preview ? (
            <div
              role="status"
              className="mt-5 rounded-2xl border border-[#B58C6A]/45 bg-[#FAF8F3] p-4 text-sm text-[#493B32]"
            >
              <p className="font-semibold text-[#8F6849]">MVP 화면 안내</p>
              <p className="mt-1 leading-relaxed text-[#6E5C50]">{preview.message}</p>
            </div>
          ) : (
            <div className="mt-5 flex items-start gap-2.5 rounded-2xl bg-[#FAF8F3] p-4 text-xs text-[#6E5C50]">
              <Info className="h-4 w-4 text-[#B58C6A] mt-0.5 shrink-0" aria-hidden="true" />
              <p className="leading-relaxed">
                <strong className="font-semibold text-[#493B32]">
                  {BRAND_CONTENT.authNoticeTitle}:{' '}
                </strong>
                {BRAND_CONTENT.authNoticeBody}
              </p>
            </div>
          )}

          <div className="mt-6 border-t border-[#E9DFD0] pt-5 flex items-center justify-between text-sm">
            <span className="text-[#6E5C50]">이미 계정이 있으신가요?</span>
            <button
              type="button"
              onClick={() => onNavigate('login', form.role)}
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
