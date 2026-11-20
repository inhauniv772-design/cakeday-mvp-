import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  Info,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { DatePickerCalendar } from '../components/DatePickerCalendar';
import { SafeImage } from '../components/SafeImage';
import { TextInput } from '../components/TextInput';
import { formatPriceKRW } from '../data/mockShops';
import {
  CAKE_COLOR_PRESETS,
  CAKE_DESIGN_OPTIONS,
  CAKE_FLAVOR_OPTIONS,
  CAKE_SHAPE_OPTIONS,
  CAKE_SIZE_OPTIONS,
  formatOrderTimestampDate,
  PICKUP_TIME_OPTIONS,
} from '../services/orderStorage';
import type {
  CakeOrder,
  CakeOrderFormInput,
  CakeOrderOptions,
  CakeShop,
} from '../types';
import { cn } from '../utils/cn';
import { formatKoreanDate, getTodayString } from '../utils/dateUtils';
import {
  resolveOrderColor,
  validateFullOrderForm,
  validateOrderStep1,
  validateOrderStep2,
  type OrderFormErrors,
} from '../utils/orderValidation';

interface CakeOrderFormViewProps {
  shop: CakeShop;
  initialPickupDate: string;
  draftStep?: 1 | 2 | 3;
  draftForm?: CakeOrderFormInput;
  onDraftChange?: (step: 1 | 2 | 3, form: CakeOrderFormInput) => void;
  onBackToDetail: () => void;
  onBackToSearch: () => void;
  onGoToMyPage: () => void;
  onSubmitOrder: (payload: {
    shop: CakeShop;
    pickupDate: string;
    pickupTime: string;
    options: CakeOrderOptions;
  }) => CakeOrder;
}

type OrderStep = 1 | 2 | 3;

export const CakeOrderFormView: React.FC<CakeOrderFormViewProps> = ({
  shop,
  initialPickupDate,
  draftStep,
  draftForm,
  onDraftChange,
  onBackToDetail,
  onBackToSearch,
  onGoToMyPage,
  onSubmitOrder,
}) => {
  const todayStr = useMemo(() => getTodayString(), []);
  const [step, setStep] = useState<OrderStep>(draftStep ?? 1);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [form, setForm] = useState<CakeOrderFormInput>(() =>
    draftForm
      ? { ...draftForm }
      : {
          pickupDate: initialPickupDate,
          pickupTime: '',
          cakeSize: '',
          cakeShape: '',
          cakeFlavor: '',
          designType: '',
          cakeColorPreset: '',
          cakeColorCustom: '',
          letteringText: '',
          additionalRequests: '',
        }
  );
  const [errors, setErrors] = useState<OrderFormErrors>({});
  const [completedOrder, setCompletedOrder] = useState<CakeOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const onDraftChangeRef = useRef(onDraftChange);
  onDraftChangeRef.current = onDraftChange;

  useEffect(() => {
    if (!completedOrder) {
      onDraftChangeRef.current?.(step, form);
    }
  }, [step, form, completedOrder]);

  const updateStep = (nextStep: OrderStep) => {
    setStep(nextStep);
  };

  const updateForm = (
    updater: (prev: CakeOrderFormInput) => CakeOrderFormInput
  ) => {
    setForm(updater);
  };

  const isPickupDateAvailable = shop.pickupAvailableDates.includes(
    form.pickupDate
  );

  const handleNextFromStep1 = () => {
    const step1Errors = validateOrderStep1(form, shop, todayStr);
    setErrors((prev) => ({
      ...prev,
      pickupDate: step1Errors.pickupDate,
      pickupTime: step1Errors.pickupTime,
    }));
    if (Object.keys(step1Errors).length > 0) {
      return;
    }
    updateStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep2 = () => {
    const step2Errors = validateOrderStep2(form);
    setErrors((prev) => ({
      ...prev,
      cakeSize: step2Errors.cakeSize,
      cakeShape: step2Errors.cakeShape,
      cakeFlavor: step2Errors.cakeFlavor,
      designType: step2Errors.designType,
      cakeColor: step2Errors.cakeColor,
      letteringText: step2Errors.letteringText,
    }));
    if (Object.keys(step2Errors).length > 0) {
      return;
    }
    updateStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmSubmit = () => {
    if (isSubmittingRef.current || completedOrder) {
      return;
    }

    const allErrors = validateFullOrderForm(form, shop, todayStr);
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      if (allErrors.pickupDate || allErrors.pickupTime) {
        updateStep(1);
      } else {
        updateStep(2);
      }
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const created = onSubmitOrder({
        shop,
        pickupDate: form.pickupDate,
        pickupTime: form.pickupTime,
        options: {
          cakeSize: form.cakeSize,
          cakeShape: form.cakeShape,
          cakeFlavor: form.cakeFlavor,
          designType: form.designType,
          cakeColor: resolveOrderColor(form),
          letteringText: form.letteringText.trim(),
          additionalRequests: form.additionalRequests.trim(),
        },
      });
      setCompletedOrder(created);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (completedOrder) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-3.5">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E9DFD0] text-[#8F6849] shrink-0">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-medium text-[#8F6849]">
                {completedOrder.applicationStatus} · {completedOrder.status}
              </p>
              <h1 className="mt-1 text-2xl font-bold text-[#493B32]">
                주문 신청이 완료되었습니다
              </h1>
              <p className="mt-2 text-sm text-[#6E5C50] leading-relaxed">
                신청하신 케이크 주문 정보가 저장되었습니다. 마이페이지에서 언제든 주문 내역과 세부 옵션을 다시 확인할 수 있습니다.
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 sm:p-5 text-sm">
            <div>
              <dt className="text-xs text-[#6E5C50]">가게 이름</dt>
              <dd className="mt-1 font-semibold text-[#493B32]">
                {completedOrder.shopName}
              </dd>
              <dd className="text-xs text-[#6E5C50]">
                {completedOrder.shopRegionText}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#6E5C50]">케이크 정보</dt>
              <dd className="mt-1 font-semibold text-[#493B32]">
                {completedOrder.cakeName}
              </dd>
              <dd className="text-xs font-semibold text-[#8F6849] tabular-nums">
                {formatPriceKRW(completedOrder.cakePrice)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#6E5C50]">픽업 일시</dt>
              <dd className="mt-1 font-semibold text-[#493B32]">
                {formatKoreanDate(completedOrder.pickupDate)} ·{' '}
                {completedOrder.pickupTime}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#6E5C50]">주문 상태</dt>
              <dd className="mt-1 font-semibold text-[#8F6849]">
                {completedOrder.applicationStatus} ({completedOrder.status})
              </dd>
              <dd className="text-xs text-[#6E5C50]">
                신청일시: {formatOrderTimestampDate(completedOrder.orderedAt)}
              </dd>
            </div>
          </dl>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              onClick={onGoToMyPage}
            >
              마이페이지에서 주문 내역 확인하기
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onBackToSearch}
            >
              가게 검색으로 돌아가기
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToDetail}
          className="inline-flex items-center gap-2 min-h-[44px] text-sm font-medium text-[#6E5C50] hover:text-[#493B32] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          매장 상세로 돌아가기
        </button>

        <span className="text-xs font-medium text-[#8F6849] tabular-nums">
          단계 {step} / 3
        </span>
      </div>

      {/* Selected Shop & Cake Summary Strip */}
      <Card tone="beige" className="p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <SafeImage
            src={shop.representativeImage}
            alt={shop.representativeCakeName}
            containerClassName="h-16 w-20 sm:h-20 sm:w-24 rounded-2xl border border-[#E9DFD0] shrink-0"
            fallbackTitle={shop.shopName}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[#8F6849]">
              {shop.shopName} · {shop.region.sido} {shop.region.sigungu}
            </p>
            <h1 className="mt-0.5 text-base sm:text-lg font-bold text-[#493B32] truncate">
              {shop.representativeCakeName}
            </h1>
            <p className="mt-0.5 text-sm font-bold text-[#8F6849] tabular-nums">
              기본 {formatPriceKRW(shop.representativeCakePrice)}
            </p>
          </div>
        </div>
      </Card>

      {/* Step Indicator */}
      <div
        aria-label="주문 신청 단계"
        className="grid grid-cols-3 gap-2 rounded-2xl bg-[#E9DFD0]/55 p-1.5"
      >
        {[
          { num: 1 as OrderStep, label: '1. 픽업 일정' },
          { num: 2 as OrderStep, label: '2. 케이크 옵션' },
          { num: 3 as OrderStep, label: '3. 주문 확인' },
        ].map((item) => {
          const isCurrent = step === item.num;
          const isPassed = step > item.num;
          return (
            <button
              key={item.num}
              type="button"
              disabled={item.num > step}
              onClick={() => {
                if (item.num < step) updateStep(item.num);
              }}
              className={cn(
                'min-h-[44px] rounded-xl px-2 py-2 text-xs sm:text-sm font-medium text-center transition-colors',
                isCurrent
                  ? 'bg-[#FFFFFF] text-[#493B32] font-bold shadow-sm shadow-[#493B32]/5'
                  : isPassed
                    ? 'text-[#8F6849] hover:bg-[#FFFFFF]/50 cursor-pointer'
                    : 'text-[#6E5C50]/70 cursor-default'
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* STEP 1: Pickup Date & Time */}
      {step === 1 && (
        <Card className="p-5 sm:p-7 space-y-6">
          <div>
            <p className="text-xs font-medium text-[#8F6849]">
              표시가 있는 항목은 필수 입력입니다 (* 필수)
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#493B32]">
              픽업 날짜와 시간을 선택해 주세요
            </h2>
          </div>

          {/* Pickup Date */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-[#493B32]">
                픽업 날짜 <span className="text-[#9F4A3B]">* 필수</span>
              </span>
              <span
                className={cn(
                  'text-xs font-medium',
                  isPickupDateAvailable ? 'text-[#8F6849]' : 'text-[#9F4A3B]'
                )}
              >
                {isPickupDateAvailable
                  ? '선택 날짜 픽업 가능'
                  : '선택 날짜 픽업 불가'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsDatePickerOpen((prev) => !prev)}
              aria-expanded={isDatePickerOpen}
              className={cn(
                'min-h-[48px] w-full rounded-2xl border bg-[#FAF8F3] px-4 py-3 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer',
                errors.pickupDate
                  ? 'border-[#9F4A3B]'
                  : 'border-[#E9DFD0] hover:border-[#B58C6A]'
              )}
            >
              <span className="inline-flex items-center gap-2.5 text-sm sm:text-base font-medium text-[#493B32]">
                <Calendar className="h-4 w-4 text-[#B58C6A] shrink-0" aria-hidden="true" />
                <span>{formatKoreanDate(form.pickupDate)}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#8F6849] shrink-0">
                <span>{isDatePickerOpen ? '달력 닫기' : '날짜 변경'}</span>
                {isDatePickerOpen ? (
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                )}
              </span>
            </button>

            {errors.pickupDate && (
              <p className="text-xs font-medium text-[#9F4A3B]">
                {errors.pickupDate}
              </p>
            )}

            {isDatePickerOpen && (
              <div className="pt-2">
                <DatePickerCalendar
                  value={form.pickupDate}
                  minDate={todayStr}
                  onChange={(nextDate) => {
                    updateForm((prev) => ({ ...prev, pickupDate: nextDate }));
                    setErrors((prev) => ({ ...prev, pickupDate: undefined }));
                    setIsDatePickerOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Pickup Time */}
          <div className="space-y-2.5">
            <span className="block text-sm font-medium text-[#493B32]">
              픽업 시간 <span className="text-[#9F4A3B]">* 필수</span>
            </span>
            <div
              role="group"
              aria-label="픽업 시간 선택"
              className="grid grid-cols-3 sm:grid-cols-5 gap-2"
            >
              {PICKUP_TIME_OPTIONS.map((time) => {
                const isSelected = form.pickupTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => {
                      updateForm((prev) => ({ ...prev, pickupTime: time }));
                      if (errors.pickupTime) {
                        setErrors((prev) => ({ ...prev, pickupTime: undefined }));
                      }
                    }}
                    aria-pressed={isSelected}
                    className={cn(
                      'min-h-[44px] rounded-2xl border text-sm font-medium tabular-nums transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-[#8F6849] text-[#FFFFFF] border-[#8F6849]'
                        : 'bg-[#FAF8F3] text-[#493B32] border-[#E9DFD0] hover:border-[#B58C6A]'
                    )}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
            {errors.pickupTime && (
              <p className="text-xs font-medium text-[#9F4A3B]">
                {errors.pickupTime}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-[#E9DFD0] flex flex-col-reverse sm:flex-row justify-between gap-3">
            <Button variant="outline" size="lg" onClick={onBackToDetail}>
              매장 상세로
            </Button>
            <Button variant="primary" size="lg" onClick={handleNextFromStep1}>
              <span>다음: 케이크 옵션 선택</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Cake Custom Options */}
      {step === 2 && (
        <Card className="p-5 sm:p-7 space-y-6">
          <div>
            <p className="text-xs font-medium text-[#8F6849]">
              * 표시는 필수 입력 항목입니다
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#493B32]">
              원하는 케이크 옵션을 입력해 주세요
            </h2>
          </div>

          {/* Cake Size */}
          <div className="space-y-2">
            <span className="block text-sm font-medium text-[#493B32]">
              케이크 크기 <span className="text-[#9F4A3B]">* 필수</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {CAKE_SIZE_OPTIONS.map((option) => {
                const isSelected = form.cakeSize === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      updateForm((prev) => ({ ...prev, cakeSize: option }));
                      if (errors.cakeSize) {
                        setErrors((prev) => ({ ...prev, cakeSize: undefined }));
                      }
                    }}
                    className={cn(
                      'min-h-[44px] px-4 py-2.5 rounded-2xl border text-sm font-medium transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-[#8F6849] text-[#FFFFFF] border-[#8F6849]'
                        : 'bg-[#FAF8F3] text-[#493B32] border-[#E9DFD0] hover:border-[#B58C6A]'
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {errors.cakeSize && (
              <p className="text-xs font-medium text-[#9F4A3B]">
                {errors.cakeSize}
              </p>
            )}
          </div>

          {/* Cake Shape */}
          <div className="space-y-2">
            <span className="block text-sm font-medium text-[#493B32]">
              케이크 모양 <span className="text-[#9F4A3B]">* 필수</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              {CAKE_SHAPE_OPTIONS.map((option) => {
                const isSelected = form.cakeShape === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      updateForm((prev) => ({ ...prev, cakeShape: option }));
                      if (errors.cakeShape) {
                        setErrors((prev) => ({ ...prev, cakeShape: undefined }));
                      }
                    }}
                    className={cn(
                      'min-h-[44px] px-3 py-2.5 rounded-2xl border text-sm font-medium transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-[#8F6849] text-[#FFFFFF] border-[#8F6849]'
                        : 'bg-[#FAF8F3] text-[#493B32] border-[#E9DFD0] hover:border-[#B58C6A]'
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {errors.cakeShape && (
              <p className="text-xs font-medium text-[#9F4A3B]">
                {errors.cakeShape}
              </p>
            )}
          </div>

          {/* Cake Flavor */}
          <div className="space-y-2">
            <span className="block text-sm font-medium text-[#493B32]">
              케이크 맛 <span className="text-[#9F4A3B]">* 필수</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {CAKE_FLAVOR_OPTIONS.map((option) => {
                const isSelected = form.cakeFlavor === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      updateForm((prev) => ({ ...prev, cakeFlavor: option }));
                      if (errors.cakeFlavor) {
                        setErrors((prev) => ({
                          ...prev,
                          cakeFlavor: undefined,
                        }));
                      }
                    }}
                    className={cn(
                      'min-h-[44px] px-4 py-2 rounded-2xl border text-sm font-medium transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-[#8F6849] text-[#FFFFFF] border-[#8F6849]'
                        : 'bg-[#FAF8F3] text-[#493B32] border-[#E9DFD0] hover:border-[#B58C6A]'
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {errors.cakeFlavor && (
              <p className="text-xs font-medium text-[#9F4A3B]">
                {errors.cakeFlavor}
              </p>
            )}
          </div>

          {/* Design Type */}
          <div className="space-y-2">
            <span className="block text-sm font-medium text-[#493B32]">
              디자인 유형 <span className="text-[#9F4A3B]">* 필수</span>
            </span>
            <div className="grid grid-cols-2 gap-2">
              {CAKE_DESIGN_OPTIONS.map((option) => {
                const isSelected = form.designType === option;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      updateForm((prev) => ({ ...prev, designType: option }));
                      if (errors.designType) {
                        setErrors((prev) => ({
                          ...prev,
                          designType: undefined,
                        }));
                      }
                    }}
                    className={cn(
                      'min-h-[44px] px-3 py-2.5 rounded-2xl border text-sm font-medium transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-[#8F6849] text-[#FFFFFF] border-[#8F6849]'
                        : 'bg-[#FAF8F3] text-[#493B32] border-[#E9DFD0] hover:border-[#B58C6A]'
                    )}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {errors.designType && (
              <p className="text-xs font-medium text-[#9F4A3B]">
                {errors.designType}
              </p>
            )}
          </div>

          {/* Desired Color (Choice + Direct Input) */}
          <div className="space-y-2.5">
            <span className="block text-sm font-medium text-[#493B32]">
              원하는 색상 <span className="text-[#9F4A3B]">* 필수</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {CAKE_COLOR_PRESETS.map((preset) => {
                const isSelected = form.cakeColorPreset === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      updateForm((prev) => ({
                        ...prev,
                        cakeColorPreset: preset,
                      }));
                      if (errors.cakeColor) {
                        setErrors((prev) => ({ ...prev, cakeColor: undefined }));
                      }
                    }}
                    className={cn(
                      'min-h-[44px] px-4 py-2 rounded-2xl border text-sm font-medium transition-colors cursor-pointer',
                      isSelected
                        ? 'bg-[#8F6849] text-[#FFFFFF] border-[#8F6849]'
                        : 'bg-[#FAF8F3] text-[#493B32] border-[#E9DFD0] hover:border-[#B58C6A]'
                    )}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>

            {form.cakeColorPreset === '직접 입력' && (
              <TextInput
                id="order-custom-color"
                label="원하는 색상 직접 입력"
                type="text"
                placeholder="예: 연한 버터 옐로우 바탕에 코코아 테두리"
                value={form.cakeColorCustom}
                onChange={(e) => {
                  updateForm((prev) => ({
                    ...prev,
                    cakeColorCustom: e.target.value,
                  }));
                  if (errors.cakeColor) {
                    setErrors((prev) => ({ ...prev, cakeColor: undefined }));
                  }
                }}
              />
            )}

            {errors.cakeColor && (
              <p className="text-xs font-medium text-[#9F4A3B]">
                {errors.cakeColor}
              </p>
            )}
          </div>

          {/* Lettering Text */}
          <div className="space-y-1">
            <TextInput
              id="order-lettering"
              label="레터링 문구 (* 필수)"
              type="text"
              maxLength={30}
              placeholder="예: Happy Birthday! 소중한 하루"
              value={form.letteringText}
              onChange={(e) => {
                updateForm((prev) => ({
                  ...prev,
                  letteringText: e.target.value,
                }));
                if (errors.letteringText) {
                  setErrors((prev) => ({ ...prev, letteringText: undefined }));
                }
              }}
              error={errors.letteringText}
              helperText={`최대 30자까지 입력할 수 있습니다 (${form.letteringText.length}/30)`}
            />
          </div>

          {/* Additional Requests */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="order-additional-requests"
              className="text-sm font-medium text-[#493B32]"
            >
              추가 요청 사항{' '}
              <span className="font-normal text-[#6E5C50]">(선택 사항)</span>
            </label>
            <textarea
              id="order-additional-requests"
              rows={3}
              placeholder="초 요청, 알레르기 유의 사항, 포장 요청 등 전달하고 싶은 내용을 적어 주세요"
              value={form.additionalRequests}
              onChange={(e) =>
                updateForm((prev) => ({
                  ...prev,
                  additionalRequests: e.target.value,
                }))
              }
              className="w-full rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] px-4 py-3 text-base text-[#493B32] placeholder:text-[#6E5C50]/65 transition-colors focus:bg-[#FFFFFF] focus:border-[#B58C6A] focus:outline-none resize-none"
            />
          </div>

          <div className="pt-4 border-t border-[#E9DFD0] flex flex-col-reverse sm:flex-row justify-between gap-3">
            <Button variant="outline" size="lg" onClick={() => updateStep(1)}>
              이전: 픽업 일정
            </Button>
            <Button variant="primary" size="lg" onClick={handleNextFromStep2}>
              <span>다음: 주문 내용 확인</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Order Summary & Confirmation */}
      {step === 3 && (
        <Card className="p-5 sm:p-7 space-y-6">
          <div>
            <p className="text-xs font-medium text-[#8F6849]">최종 확인</p>
            <h2 className="mt-1 text-xl font-bold text-[#493B32]">
              입력한 주문 내용을 확인해 주세요
            </h2>
            <p className="mt-1.5 text-sm text-[#6E5C50]">
              수정할 부분이 있다면 아래 수정 버튼을 눌러 이전 입력 화면으로 돌아갈 수 있습니다.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 sm:p-5 space-y-3 text-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-[#6E5C50]">가게 및 케이크 정보</p>
                  <p className="mt-1 font-bold text-[#493B32]">
                    {shop.shopName}
                  </p>
                  <p className="text-[#493B32]">{shop.representativeCakeName}</p>
                </div>
                <span className="font-bold text-[#8F6849] tabular-nums shrink-0">
                  {formatPriceKRW(shop.representativeCakePrice)}
                </span>
              </div>

              <div className="pt-3 border-t border-[#E9DFD0] flex items-center justify-between gap-3">
                <span className="text-[#6E5C50]">픽업 날짜 및 시간</span>
                <span className="font-semibold text-[#493B32] tabular-nums">
                  {formatKoreanDate(form.pickupDate)} · {form.pickupTime}
                </span>
              </div>
            </div>

            <dl className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 sm:p-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-[#6E5C50]">케이크 크기</dt>
                <dd className="font-medium text-[#493B32]">{form.cakeSize}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
                <dt className="text-[#6E5C50]">케이크 모양</dt>
                <dd className="font-medium text-[#493B32]">{form.cakeShape}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
                <dt className="text-[#6E5C50]">케이크 맛</dt>
                <dd className="font-medium text-[#493B32]">{form.cakeFlavor}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
                <dt className="text-[#6E5C50]">디자인 유형</dt>
                <dd className="font-medium text-[#493B32]">{form.designType}</dd>
              </div>
              <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
                <dt className="text-[#6E5C50]">원하는 색상</dt>
                <dd className="font-medium text-[#493B32]">
                  {resolveOrderColor(form)}
                </dd>
              </div>
              <div className="pt-2.5 border-t border-[#E9DFD0]">
                <dt className="text-xs text-[#6E5C50]">레터링 문구</dt>
                <dd className="mt-1 font-semibold text-[#493B32]">
                  &ldquo;{form.letteringText.trim()}&rdquo;
                </dd>
              </div>
              <div className="pt-2.5 border-t border-[#E9DFD0]">
                <dt className="text-xs text-[#6E5C50]">추가 요청 사항</dt>
                <dd className="mt-1 text-[#493B32] leading-relaxed">
                  {form.additionalRequests.trim() || '없음'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex items-start gap-2.5 rounded-2xl bg-[#E9DFD0]/45 p-4 text-xs sm:text-sm text-[#6E5C50]">
            <Info className="h-4 w-4 text-[#8F6849] mt-0.5 shrink-0" aria-hidden="true" />
            <p className="leading-relaxed">
              주문 신청을 완료하면 상태가 &lsquo;판매자 확인 대기&rsquo;로 저장됩니다. 판매자가 주문을 승인한 뒤 마이페이지에서 시연용 모의 결제를 완료하면 예약이 최종 확정됩니다.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E9DFD0] flex flex-col-reverse sm:flex-row justify-between gap-3">
            <Button variant="outline" size="lg" onClick={() => updateStep(2)}>
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              <span>수정하기</span>
            </Button>
            <Button
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              onClick={handleConfirmSubmit}
            >
              {isSubmitting ? '주문 처리 중...' : '주문 신청하기'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
