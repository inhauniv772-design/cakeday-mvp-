import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Edit3,
  ImagePlus,
  Info,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { DatePickerCalendar } from '../components/DatePickerCalendar';
import { SafeImage } from '../components/SafeImage';
import { TextInput } from '../components/TextInput';
import {
  CAKE_COLOR_PRESETS,
  CAKE_FLAVOR_OPTIONS,
  CAKE_SHAPE_OPTIONS,
  CAKE_SIZE_OPTIONS,
  formatOrderTimestampDate,
  PICKUP_TIME_OPTIONS,
} from '../services/orderStorage';
import type {
  CakeShop,
  CustomQuoteRequest,
  CustomQuoteRequestFormInput,
  QuoteAttachmentImage,
} from '../types';
import { cn } from '../utils/cn';
import { formatKoreanDate, getTodayString } from '../utils/dateUtils';
import {
  formatFileSizeLabel,
  processQuoteImageFile,
  QUOTE_IMAGE_MAX_COUNT,
} from '../utils/quoteImageUtils';
import {
  resolveQuoteColor,
  validateFullQuoteForm,
  validateQuoteStep1,
  validateQuoteStep2,
  type QuoteFormErrors,
} from '../utils/quoteValidation';

interface CustomDesignQuoteFormViewProps {
  shop: CakeShop;
  initialPickupDate: string;
  draftStep?: 1 | 2 | 3;
  draftForm?: CustomQuoteRequestFormInput;
  onDraftChange?: (step: 1 | 2 | 3, form: CustomQuoteRequestFormInput) => void;
  onBackToDetail: () => void;
  onBackToSearch: () => void;
  onGoToMyPage: () => void;
  onSubmitQuote: (payload: {
    shop: CakeShop;
    images: QuoteAttachmentImage[];
    desiredPickupDate: string;
    desiredPickupTime: string;
    cakeSize: string;
    cakeShape: string;
    cakeFlavor: string;
    cakeColor: string;
    letteringText: string;
    designDescription: string;
    additionalRequests: string;
  }) => { ok: true; createdQuote: CustomQuoteRequest } | { ok: false; error: string };
}

type QuoteStep = 1 | 2 | 3;

export const CustomDesignQuoteFormView: React.FC<
  CustomDesignQuoteFormViewProps
> = ({
  shop,
  initialPickupDate,
  draftStep,
  draftForm,
  onDraftChange,
  onBackToDetail,
  onBackToSearch,
  onGoToMyPage,
  onSubmitQuote,
}) => {
  const todayStr = useMemo(() => getTodayString(), []);
  const [step, setStep] = useState<QuoteStep>(draftStep ?? 1);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [form, setForm] = useState<CustomQuoteRequestFormInput>(() =>
    draftForm
      ? {
          ...draftForm,
          images: draftForm.images.map((img) => ({ ...img })),
        }
      : {
          desiredPickupDate: initialPickupDate >= todayStr ? initialPickupDate : todayStr,
          desiredPickupTime: '',
          cakeSize: '',
          cakeShape: '',
          cakeFlavor: '',
          cakeColorPreset: '',
          cakeColorCustom: '',
          letteringText: '',
          designDescription: '',
          additionalRequests: '',
          images: [],
        }
  );

  const [errors, setErrors] = useState<QuoteFormErrors>({});
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedQuote, setCompletedQuote] =
    useState<CustomQuoteRequest | null>(null);

  const isSubmittingRef = useRef(false);
  const addFileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);
  const replacingImageIdRef = useRef<string | null>(null);

  const onDraftChangeRef = useRef(onDraftChange);
  onDraftChangeRef.current = onDraftChange;

  useEffect(() => {
    if (!completedQuote) {
      onDraftChangeRef.current?.(step, form);
    }
  }, [step, form, completedQuote]);

  const handleAddFilesSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    // Reset value immediately so the same file can be re-selected after deletion
    event.target.value = '';

    setUploadNotice(null);
    setErrors((prev) => ({ ...prev, images: undefined }));

    const remainingSlots = QUOTE_IMAGE_MAX_COUNT - form.images.length;
    if (remainingSlots <= 0) {
      setUploadNotice(
        `디자인 참고 사진은 최대 ${QUOTE_IMAGE_MAX_COUNT}장까지 첨부할 수 있습니다.`
      );
      return;
    }

    setIsProcessingImages(true);
    try {
      const filesToProcess = files.slice(0, remainingSlots);
      const nextImages: QuoteAttachmentImage[] = [];
      const errorMessages: string[] = [];

      if (files.length > remainingSlots) {
        errorMessages.push(
          `최대 ${QUOTE_IMAGE_MAX_COUNT}장까지 첨부 가능하여 처음 ${remainingSlots}장만 확인했습니다.`
        );
      }

      for (const file of filesToProcess) {
        const result = await processQuoteImageFile(file);
        if (result.ok) {
          nextImages.push(result.image);
        } else {
          errorMessages.push(result.error);
        }
      }

      if (nextImages.length > 0) {
        setForm((prev) => ({
          ...prev,
          images: [...prev.images, ...nextImages].slice(0, QUOTE_IMAGE_MAX_COUNT),
        }));
      }

      if (errorMessages.length > 0) {
        setUploadNotice(errorMessages.join(' '));
      }
    } finally {
      setIsProcessingImages(false);
    }
  };

  const handleTriggerReplace = (imageId: string) => {
    replacingImageIdRef.current = imageId;
    replaceFileInputRef.current?.click();
  };

  const handleReplaceFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    const targetId = replacingImageIdRef.current;
    event.target.value = '';
    replacingImageIdRef.current = null;

    if (!file || !targetId) return;

    setUploadNotice(null);
    setErrors((prev) => ({ ...prev, images: undefined }));
    setIsProcessingImages(true);

    try {
      const result = await processQuoteImageFile(file);
      if (!result.ok) {
        setUploadNotice(result.error);
        return;
      }

      setForm((prev) => ({
        ...prev,
        images: prev.images.map((img) =>
          img.id === targetId ? result.image : img
        ),
      }));
    } finally {
      setIsProcessingImages(false);
    }
  };

  const handleDeleteImage = (imageId: string) => {
    setUploadNotice(null);
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));
  };

  const handleNextFromStep1 = () => {
    const step1Errors = validateQuoteStep1(form, todayStr);
    setErrors((prev) => ({
      ...prev,
      images: step1Errors.images,
      desiredPickupDate: step1Errors.desiredPickupDate,
      desiredPickupTime: step1Errors.desiredPickupTime,
    }));
    if (Object.keys(step1Errors).length > 0) {
      return;
    }
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep2 = () => {
    const step2Errors = validateQuoteStep2(form);
    setErrors((prev) => ({
      ...prev,
      cakeSize: step2Errors.cakeSize,
      cakeShape: step2Errors.cakeShape,
      cakeFlavor: step2Errors.cakeFlavor,
      cakeColor: step2Errors.cakeColor,
      letteringText: step2Errors.letteringText,
      designDescription: step2Errors.designDescription,
    }));
    if (Object.keys(step2Errors).length > 0) {
      return;
    }
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmSubmit = () => {
    if (isSubmittingRef.current || completedQuote) {
      return;
    }

    setSubmitError(null);
    const allErrors = validateFullQuoteForm(form, todayStr);
    setErrors(allErrors);
    if (Object.keys(allErrors).length > 0) {
      if (
        allErrors.images ||
        allErrors.desiredPickupDate ||
        allErrors.desiredPickupTime
      ) {
        setStep(1);
      } else {
        setStep(2);
      }
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const result = onSubmitQuote({
        shop,
        images: form.images,
        desiredPickupDate: form.desiredPickupDate,
        desiredPickupTime: form.desiredPickupTime,
        cakeSize: form.cakeSize,
        cakeShape: form.cakeShape,
        cakeFlavor: form.cakeFlavor,
        cakeColor: resolveQuoteColor(form),
        letteringText: form.letteringText.trim(),
        designDescription: form.designDescription.trim(),
        additionalRequests: form.additionalRequests.trim(),
      });

      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }

      setCompletedQuote(result.createdQuote);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (completedQuote) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-start gap-3.5">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E9DFD0] text-[#8F6849] shrink-0">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold text-[#8F6849]">
                {completedQuote.status}
              </p>
              <h1 className="mt-1 text-xl sm:text-2xl font-bold text-[#493B32]">
                견적 요청이 접수되었습니다. 판매자의 검토를 기다려 주세요.
              </h1>
              <p className="mt-2 text-sm text-[#6E5C50] leading-relaxed">
                첨부하신 참고 사진과 제작 요청 내역이 저장되었습니다. 마이페이지의 &lsquo;맞춤 디자인 견적 요청&rsquo; 영역에서 언제든 다시 확인할 수 있습니다.
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 sm:p-5 text-sm">
            <div>
              <dt className="text-xs text-[#6E5C50]">요청 매장</dt>
              <dd className="mt-1 font-semibold text-[#493B32]">
                {completedQuote.shopName}
              </dd>
              <dd className="text-xs text-[#6E5C50]">
                {completedQuote.shopRegionText}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#6E5C50]">희망 수령 일시</dt>
              <dd className="mt-1 font-semibold text-[#493B32] tabular-nums">
                {formatKoreanDate(completedQuote.desiredPickupDate)} ·{' '}
                {completedQuote.desiredPickupTime}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#6E5C50]">첨부 참고 사진</dt>
              <dd className="mt-1 font-semibold text-[#493B32] tabular-nums">
                {completedQuote.images.length}장 첨부됨
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[#6E5C50]">요청 상태 · 접수 일시</dt>
              <dd className="mt-1 font-semibold text-[#8F6849]">
                {completedQuote.status}
              </dd>
              <dd className="text-xs text-[#6E5C50] tabular-nums">
                {formatOrderTimestampDate(completedQuote.createdAt)}
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
              마이페이지에서 견적 요청 확인하기
            </Button>
            <Button variant="outline" size="lg" onClick={onBackToSearch}>
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
          맞춤 디자인 견적 요청 · 단계 {step} / 3
        </span>
      </div>

      {/* Target Shop Summary Strip */}
      <Card tone="beige" className="p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <SafeImage
            src={shop.representativeImage}
            alt={shop.shopName}
            containerClassName="h-16 w-20 sm:h-20 sm:w-24 rounded-2xl border border-[#E9DFD0] shrink-0"
            fallbackTitle={shop.shopName}
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-[#8F6849]">
              맞춤 디자인 견적 요청 매장 · {shop.region.sido} {shop.region.sigungu}
            </p>
            <h1 className="mt-0.5 text-base sm:text-lg font-bold text-[#493B32] truncate">
              {shop.shopName}
            </h1>
            <p className="mt-0.5 text-xs text-[#6E5C50] leading-relaxed">
              원하는 디자인 참고 사진과 제작 사양을 보내면 판매자가 확인 후 검토할 수 있습니다. (일반 주문과 별도 접수)
            </p>
          </div>
        </div>
      </Card>

      {/* Step Indicator */}
      <div
        aria-label="견적 요청 단계"
        className="grid grid-cols-3 gap-2 rounded-2xl bg-[#E9DFD0]/55 p-1.5"
      >
        {[
          { num: 1 as QuoteStep, label: '1. 사진 & 수령 일정' },
          { num: 2 as QuoteStep, label: '2. 제작 사양 & 설명' },
          { num: 3 as QuoteStep, label: '3. 요청 확인 & 제출' },
        ].map((item) => {
          const isCurrent = step === item.num;
          const isPassed = step > item.num;
          return (
            <button
              key={item.num}
              type="button"
              disabled={item.num > step}
              onClick={() => {
                if (item.num < step) setStep(item.num);
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

      {/* Hidden File Inputs */}
      <input
        ref={addFileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={handleAddFilesSelected}
      />
      <input
        ref={replaceFileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleReplaceFileSelected}
      />

      {/* STEP 1: Design Reference Photos + Desired Pickup Date & Time */}
      {step === 1 && (
        <Card className="p-5 sm:p-7 space-y-6">
          <div>
            <p className="text-xs font-medium text-[#8F6849]">
              * 표시는 필수 입력 항목입니다
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#493B32]">
              디자인 참고 사진과 희망 수령 일정을 입력해 주세요
            </h2>
          </div>

          {/* Photo Attachment Section */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-medium text-[#493B32]">
                디자인 참고 사진 첨부{' '}
                <span className="text-[#9F4A3B]">* 필수 (최대 3장)</span>
              </span>
              <span className="text-xs font-semibold text-[#8F6849] tabular-nums">
                {form.images.length} / {QUOTE_IMAGE_MAX_COUNT}장 첨부됨
              </span>
            </div>

            <button
              type="button"
              disabled={
                isProcessingImages ||
                form.images.length >= QUOTE_IMAGE_MAX_COUNT
              }
              onClick={() => addFileInputRef.current?.click()}
              className={cn(
                'w-full rounded-2xl border-2 border-dashed p-5 sm:p-6 text-center transition-colors flex flex-col items-center justify-center gap-2',
                form.images.length >= QUOTE_IMAGE_MAX_COUNT
                  ? 'border-[#E9DFD0] bg-[#FAF8F3]/60 text-[#6E5C50] cursor-not-allowed'
                  : 'border-[#B58C6A]/65 bg-[#FAF8F3] hover:bg-[#F7EFE6]/60 hover:border-[#8F6849] cursor-pointer'
              )}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9DFD0] text-[#8F6849]">
                <ImagePlus className="h-5 w-5" aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-[#493B32]">
                {isProcessingImages
                  ? '이미지를 불러오는 중입니다...'
                  : form.images.length >= QUOTE_IMAGE_MAX_COUNT
                    ? '최대 3장까지 모두 첨부되었습니다'
                    : '클릭하여 케이크 디자인 참고 사진 추가하기'}
              </p>
              <p className="text-xs text-[#6E5C50]">
                지원 형식: JPG, JPEG, PNG, WEBP · 파일당 최대 5MB · 최대 3장
              </p>
            </button>

            {(uploadNotice || errors.images) && (
              <div
                role="alert"
                className="rounded-2xl border border-[#E4B8AF] bg-[#FBF0ED] px-4 py-3 text-xs sm:text-sm text-[#9F4A3B] leading-relaxed"
              >
                {uploadNotice || errors.images}
              </div>
            )}

            {/* Uploaded Images Preview Grid */}
            {form.images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {form.images.map((img, index) => (
                  <div
                    key={img.id}
                    className="rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] overflow-hidden flex flex-col"
                  >
                    <div className="aspect-[4/3] w-full bg-[#FFFFFF] border-b border-[#E9DFD0] overflow-hidden">
                      <img
                        src={img.dataUrl}
                        alt={`첨부한 케이크 참고 사진 ${index + 1} (${img.fileName})`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#493B32] truncate">
                          {index + 1}. {img.fileName}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#6E5C50] tabular-nums">
                          {formatFileSizeLabel(img.sizeBytes)}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleTriggerReplace(img.id)}
                          className="min-h-[36px] rounded-xl border border-[#D8C9B5] bg-[#FFFFFF] px-2 text-xs font-medium text-[#493B32] hover:border-[#B58C6A] inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="h-3 w-3" aria-hidden="true" />
                          <span>교체</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="min-h-[36px] rounded-xl border border-[#E4B8AF] bg-[#FBF0ED] px-2 text-xs font-medium text-[#9F4A3B] hover:bg-[#F6DFD9] inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" aria-hidden="true" />
                          <span>삭제</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-start gap-2 rounded-2xl bg-[#E9DFD0]/45 px-3.5 py-3 text-xs text-[#6E5C50]">
              <Info
                className="h-4 w-4 text-[#8F6849] mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <p className="leading-relaxed">
                현재는 실제 서버와 클라우드 이미지 저장소 없이 브라우저 로컬 저장소(localStorage)를 사용하는 데모 환경이므로, 저장 용량 초과를 막기 위해 첨부 사진은 최적화된 미리보기로 저장됩니다. 실제 서비스에서는 별도 백엔드 및 전용 이미지 스토리지가 연동됩니다.
              </p>
            </div>
          </div>

          {/* Desired Pickup Date */}
          <div className="space-y-2.5 pt-2 border-t border-[#E9DFD0]">
            <span className="block text-sm font-medium text-[#493B32]">
              희망 수령 날짜 <span className="text-[#9F4A3B]">* 필수</span>
            </span>

            <button
              type="button"
              onClick={() => setIsDatePickerOpen((prev) => !prev)}
              aria-expanded={isDatePickerOpen}
              className={cn(
                'min-h-[48px] w-full rounded-2xl border bg-[#FAF8F3] px-4 py-3 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer',
                errors.desiredPickupDate
                  ? 'border-[#9F4A3B]'
                  : 'border-[#E9DFD0] hover:border-[#B58C6A]'
              )}
            >
              <span className="inline-flex items-center gap-2.5 text-sm sm:text-base font-medium text-[#493B32]">
                <Calendar
                  className="h-4 w-4 text-[#B58C6A] shrink-0"
                  aria-hidden="true"
                />
                <span>{formatKoreanDate(form.desiredPickupDate)}</span>
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

            {errors.desiredPickupDate && (
              <p className="text-xs font-medium text-[#9F4A3B]">
                {errors.desiredPickupDate}
              </p>
            )}

            {isDatePickerOpen && (
              <div className="pt-2">
                <DatePickerCalendar
                  value={form.desiredPickupDate}
                  minDate={todayStr}
                  onChange={(nextDate) => {
                    setForm((prev) => ({
                      ...prev,
                      desiredPickupDate: nextDate,
                    }));
                    setErrors((prev) => ({
                      ...prev,
                      desiredPickupDate: undefined,
                    }));
                    setIsDatePickerOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Desired Pickup Time */}
          <div className="space-y-2.5">
            <span className="block text-sm font-medium text-[#493B32]">
              희망 수령 시간 <span className="text-[#9F4A3B]">* 필수</span>
            </span>
            <div
              role="group"
              aria-label="희망 수령 시간 선택"
              className="grid grid-cols-3 sm:grid-cols-5 gap-2"
            >
              {PICKUP_TIME_OPTIONS.map((time) => {
                const isSelected = form.desiredPickupTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, desiredPickupTime: time }));
                      if (errors.desiredPickupTime) {
                        setErrors((prev) => ({
                          ...prev,
                          desiredPickupTime: undefined,
                        }));
                      }
                    }}
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
            {errors.desiredPickupTime && (
              <p className="text-xs font-medium text-[#9F4A3B]">
                {errors.desiredPickupTime}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-[#E9DFD0] flex flex-col-reverse sm:flex-row justify-between gap-3">
            <Button variant="outline" size="lg" onClick={onBackToDetail}>
              매장 상세로
            </Button>
            <Button variant="primary" size="lg" onClick={handleNextFromStep1}>
              <span>다음: 제작 사양 & 설명</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Cake Specs, Color, Lettering, Design Description & Requests */}
      {step === 2 && (
        <Card className="p-5 sm:p-7 space-y-6">
          <div>
            <p className="text-xs font-medium text-[#8F6849]">
              * 표시는 필수 입력 항목입니다
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#493B32]">
              원하시는 케이크 제작 사양과 디자인을 설명해 주세요
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
                      setForm((prev) => ({ ...prev, cakeSize: option }));
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
                      setForm((prev) => ({ ...prev, cakeShape: option }));
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
              맛 또는 시트 종류 <span className="text-[#9F4A3B]">* 필수</span>
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
                      setForm((prev) => ({ ...prev, cakeFlavor: option }));
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

          {/* Desired Color */}
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
                      setForm((prev) => ({
                        ...prev,
                        cakeColorPreset: preset,
                      }));
                      if (errors.cakeColor) {
                        setErrors((prev) => ({
                          ...prev,
                          cakeColor: undefined,
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
                    {preset}
                  </button>
                );
              })}
            </div>

            {form.cakeColorPreset === '직접 입력' && (
              <TextInput
                id="quote-custom-color"
                label="원하는 색상 직접 입력"
                type="text"
                placeholder="예: 연한 버터 크림 바탕에 코코아 리본 포인트"
                value={form.cakeColorCustom}
                onChange={(e) => {
                  setForm((prev) => ({
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
              id="quote-lettering"
              label="레터링 문구 (* 필수)"
              type="text"
              maxLength={30}
              placeholder="예: Happy Birthday! 소중한 하루"
              value={form.letteringText}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  letteringText: e.target.value,
                }));
                if (errors.letteringText) {
                  setErrors((prev) => ({
                    ...prev,
                    letteringText: undefined,
                  }));
                }
              }}
              error={errors.letteringText}
              helperText={`최대 30자까지 입력할 수 있습니다 (${form.letteringText.length}/30)`}
            />
          </div>

          {/* Additional Decoration & Design Description (Required) */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="quote-design-description"
              className="text-sm font-medium text-[#493B32]"
            >
              추가 장식 및 디자인 설명{' '}
              <span className="text-[#9F4A3B]">* 필수</span>
            </label>
            <textarea
              id="quote-design-description"
              rows={4}
              placeholder="첨부하신 사진을 기준으로 원하는 장식 위치, 파이핑 스타일, 생화/리본/토핑 포인트 등을 구체적으로 적어 주세요"
              value={form.designDescription}
              onChange={(e) => {
                setForm((prev) => ({
                  ...prev,
                  designDescription: e.target.value,
                }));
                if (errors.designDescription) {
                  setErrors((prev) => ({
                    ...prev,
                    designDescription: undefined,
                  }));
                }
              }}
              className={cn(
                'w-full rounded-2xl border bg-[#FAF8F3] px-4 py-3 text-base text-[#493B32] placeholder:text-[#6E5C50]/65 transition-colors focus:bg-[#FFFFFF] focus:outline-none resize-none',
                errors.designDescription
                  ? 'border-[#9F4A3B] focus:border-[#9F4A3B]'
                  : 'border-[#E9DFD0] focus:border-[#B58C6A]'
              )}
            />
            {errors.designDescription && (
              <p className="text-xs font-medium text-[#9F4A3B]">
                {errors.designDescription}
              </p>
            )}
          </div>

          {/* Additional Requests (Optional) */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="quote-additional-requests"
              className="text-sm font-medium text-[#493B32]"
            >
              기타 요청 사항{' '}
              <span className="font-normal text-[#6E5C50]">(선택 사항)</span>
            </label>
            <textarea
              id="quote-additional-requests"
              rows={3}
              placeholder="알레르기 성분 제외, 보냉백/투명 상자 포장 요청 등 추가 전달 사항을 입력해 주세요"
              value={form.additionalRequests}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  additionalRequests: e.target.value,
                }))
              }
              className="w-full rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] px-4 py-3 text-base text-[#493B32] placeholder:text-[#6E5C50]/65 transition-colors focus:bg-[#FFFFFF] focus:border-[#B58C6A] focus:outline-none resize-none"
            />
          </div>

          <div className="pt-4 border-t border-[#E9DFD0] flex flex-col-reverse sm:flex-row justify-between gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(1)}>
              이전: 사진 & 수령 일정
            </Button>
            <Button variant="primary" size="lg" onClick={handleNextFromStep2}>
              <span>다음: 요청 내용 확인</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Final Review & Submit */}
      {step === 3 && (
        <Card className="p-5 sm:p-7 space-y-6">
          <div>
            <p className="text-xs font-medium text-[#8F6849]">최종 확인</p>
            <h2 className="mt-1 text-xl font-bold text-[#493B32]">
              선택한 매장과 견적 요청 내용을 확인해 주세요
            </h2>
            <p className="mt-1.5 text-sm text-[#6E5C50]">
              수정할 내용이 있다면 아래 수정 버튼을 눌러 이전 단계로 돌아갈 수 있습니다.
            </p>
          </div>

          {/* Shop & Pickup Summary */}
          <div className="rounded-2xl bg-[#FAF8F3] border border-[#E9DFD0] p-4 sm:p-5 space-y-3 text-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-[#6E5C50]">대상 매장 정보</p>
                <p className="mt-1 font-bold text-[#493B32]">{shop.shopName}</p>
                <p className="text-xs text-[#6E5C50]">
                  {shop.region.sido} {shop.region.sigungu} · {shop.address}
                </p>
              </div>
              <span className="rounded-lg bg-[#E9DFD0] px-2.5 py-1 text-xs font-semibold text-[#493B32] shrink-0">
                견적 요청
              </span>
            </div>

            <div className="pt-3 border-t border-[#E9DFD0] flex items-center justify-between gap-3">
              <span className="text-[#6E5C50]">희망 수령 날짜 및 시간</span>
              <span className="font-semibold text-[#493B32] tabular-nums">
                {formatKoreanDate(form.desiredPickupDate)} ·{' '}
                {form.desiredPickupTime}
              </span>
            </div>
          </div>

          {/* Attached Photos Preview */}
          <div className="space-y-2.5">
            <p className="text-sm font-bold text-[#493B32]">
              첨부한 디자인 참고 사진 ({form.images.length}장)
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {form.images.map((img, index) => (
                <div
                  key={img.id}
                  className="rounded-2xl border border-[#E9DFD0] bg-[#FAF8F3] overflow-hidden"
                >
                  <div className="aspect-[4/3] w-full bg-[#FFFFFF]">
                    <img
                      src={img.dataUrl}
                      alt={`디자인 참고 사진 ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <p className="px-2.5 py-1.5 text-[11px] text-[#6E5C50] truncate">
                    {img.fileName}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Cake Specs & Descriptions */}
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
              <dt className="text-[#6E5C50]">맛 또는 시트 종류</dt>
              <dd className="font-medium text-[#493B32]">{form.cakeFlavor}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 pt-2.5 border-t border-[#E9DFD0]">
              <dt className="text-[#6E5C50]">원하는 색상</dt>
              <dd className="font-medium text-[#493B32]">
                {resolveQuoteColor(form)}
              </dd>
            </div>
            <div className="pt-2.5 border-t border-[#E9DFD0]">
              <dt className="text-xs text-[#6E5C50]">레터링 문구</dt>
              <dd className="mt-1 font-semibold text-[#493B32]">
                &ldquo;{form.letteringText.trim()}&rdquo;
              </dd>
            </div>
            <div className="pt-2.5 border-t border-[#E9DFD0]">
              <dt className="text-xs text-[#6E5C50]">
                추가 장식 및 디자인 설명
              </dt>
              <dd className="mt-1 text-[#493B32] leading-relaxed whitespace-pre-wrap">
                {form.designDescription.trim()}
              </dd>
            </div>
            <div className="pt-2.5 border-t border-[#E9DFD0]">
              <dt className="text-xs text-[#6E5C50]">기타 요청 사항</dt>
              <dd className="mt-1 text-[#493B32] leading-relaxed whitespace-pre-wrap">
                {form.additionalRequests.trim() || '없음'}
              </dd>
            </div>
          </dl>

          {submitError && (
            <div
              role="alert"
              className="rounded-2xl border border-[#E4B8AF] bg-[#FBF0ED] px-4 py-3 text-xs sm:text-sm text-[#9F4A3B]"
            >
              {submitError}
            </div>
          )}

          <div className="flex items-start gap-2.5 rounded-2xl bg-[#E9DFD0]/45 p-4 text-xs sm:text-sm text-[#6E5C50]">
            <Info
              className="h-4 w-4 text-[#8F6849] mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <p className="leading-relaxed">
              견적 요청 제출 시 상태가 &lsquo;판매자 검토 대기&rsquo;로 저장됩니다. 판매자가 제작 가능 여부와 견적 금액을 보내면 마이페이지에서 견적을 수락하거나 수정을 요청한 뒤 시연용 모의 결제를 진행할 수 있습니다.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E9DFD0] flex flex-col-reverse sm:flex-row justify-between gap-3">
            <Button variant="outline" size="lg" onClick={() => setStep(2)}>
              <Edit3 className="h-4 w-4" aria-hidden="true" />
              <span>수정하기</span>
            </Button>
            <Button
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              onClick={handleConfirmSubmit}
            >
              {isSubmitting ? '요청 저장 중...' : '견적 요청 제출하기'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
