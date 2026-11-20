import type {
  CustomQuoteRequestFormInput,
  SellerQuoteResponseInput,
} from '../types';
import { QUOTE_IMAGE_MAX_COUNT } from './quoteImageUtils';

export interface QuoteStep1Errors {
  images?: string;
  desiredPickupDate?: string;
  desiredPickupTime?: string;
}

export interface QuoteStep2Errors {
  cakeSize?: string;
  cakeShape?: string;
  cakeFlavor?: string;
  cakeColor?: string;
  letteringText?: string;
  designDescription?: string;
}

export type QuoteFormErrors = QuoteStep1Errors & QuoteStep2Errors;

export interface SellerQuoteFormErrors {
  feasibility?: string;
  finalPrice?: string;
  extraFeeAmount?: string;
  extraFeeReason?: string;
  availableDate?: string;
  availableTime?: string;
  designGuide?: string;
  conditionalNote?: string;
  impossibilityReason?: string;
}

export function resolveQuoteColor(form: CustomQuoteRequestFormInput): string {
  if (form.cakeColorPreset === '직접 입력') {
    return form.cakeColorCustom.trim();
  }
  return form.cakeColorPreset.trim();
}

export function validateQuoteStep1(
  form: CustomQuoteRequestFormInput,
  todayStr: string
): QuoteStep1Errors {
  const errors: QuoteStep1Errors = {};

  if (form.images.length === 0) {
    errors.images = '디자인 참고 사진을 최소 1장 이상 첨부해 주세요.';
  } else if (form.images.length > QUOTE_IMAGE_MAX_COUNT) {
    errors.images = `디자인 참고 사진은 최대 ${QUOTE_IMAGE_MAX_COUNT}장까지 첨부할 수 있습니다.`;
  }

  if (!form.desiredPickupDate.trim()) {
    errors.desiredPickupDate = '희망 수령 날짜를 선택해 주세요.';
  } else if (form.desiredPickupDate < todayStr) {
    errors.desiredPickupDate = '과거 날짜는 희망 수령 날짜로 선택할 수 없습니다.';
  }

  if (!form.desiredPickupTime.trim()) {
    errors.desiredPickupTime = '희망 수령 시간을 선택해 주세요.';
  }

  return errors;
}

export function validateQuoteStep2(
  form: CustomQuoteRequestFormInput
): QuoteStep2Errors {
  const errors: QuoteStep2Errors = {};

  if (!form.cakeSize.trim()) {
    errors.cakeSize = '케이크 크기를 선택해 주세요.';
  }
  if (!form.cakeShape.trim()) {
    errors.cakeShape = '케이크 모양을 선택해 주세요.';
  }
  if (!form.cakeFlavor.trim()) {
    errors.cakeFlavor = '맛 또는 시트 종류를 선택해 주세요.';
  }

  const resolvedColor = resolveQuoteColor(form);
  if (!resolvedColor) {
    errors.cakeColor =
      form.cakeColorPreset === '직접 입력'
        ? '원하는 색상을 직접 입력해 주세요.'
        : '원하는 색상을 선택해 주세요.';
  }

  if (!form.letteringText.trim()) {
    errors.letteringText = '레터링 문구를 입력해 주세요.';
  } else if (form.letteringText.trim().length > 30) {
    errors.letteringText = '레터링 문구는 30자 이내로 입력해 주세요.';
  }

  if (!form.designDescription.trim()) {
    errors.designDescription =
      '추가 장식 및 디자인 설명을 입력해 주세요.';
  } else if (form.designDescription.trim().length < 5) {
    errors.designDescription =
      '판매자가 참고할 수 있도록 5자 이상 자세히 설명해 주세요.';
  }

  return errors;
}

export function validateFullQuoteForm(
  form: CustomQuoteRequestFormInput,
  todayStr: string
): QuoteFormErrors {
  return {
    ...validateQuoteStep1(form, todayStr),
    ...validateQuoteStep2(form),
  };
}

export function parseWonAmount(raw: string): number | null {
  const cleaned = raw.replace(/[,\s원]/g, '');
  if (!cleaned || !/^\d+$/.test(cleaned)) return null;
  const num = Number(cleaned);
  return Number.isSafeInteger(num) ? num : null;
}

export function validateSellerQuoteResponse(
  input: SellerQuoteResponseInput,
  todayStr: string
): SellerQuoteFormErrors {
  const errors: SellerQuoteFormErrors = {};

  if (
    input.feasibility !== '제작 가능' &&
    input.feasibility !== '조건부 제작 가능' &&
    input.feasibility !== '제작 불가능'
  ) {
    errors.feasibility = '제작 가능 여부를 선택해 주세요.';
    return errors;
  }

  if (input.feasibility === '제작 불가능') {
    const reason = input.impossibilityReason.trim();
    if (!reason) {
      errors.impossibilityReason =
        '소비자에게 안내할 제작 불가 사유를 입력해 주세요.';
    } else if (reason.length < 2) {
      errors.impossibilityReason =
        '제작 불가 사유는 2자 이상 구체적으로 입력해 주세요.';
    }
    return errors;
  }

  if (input.feasibility === '조건부 제작 가능') {
    const note = input.conditionalNote.trim();
    if (!note) {
      errors.conditionalNote =
        '디자인 변경 필요 사항 또는 조건부 제작 안내를 입력해 주세요.';
    } else if (note.length < 5) {
      errors.conditionalNote =
        '소비자가 이해할 수 있도록 제작 조건을 5자 이상 입력해 주세요.';
    }
  }

  const parsedFinalPrice = parseWonAmount(input.finalPrice);
  if (parsedFinalPrice === null || parsedFinalPrice < 1000) {
    errors.finalPrice =
      '최종 견적 금액을 직접 입력해 주세요. (1,000원 이상 숫자)';
  } else if (parsedFinalPrice > 10_000_000) {
    errors.finalPrice = '최종 견적 금액은 10,000,000원 이하로 입력해 주세요.';
  }

  const hasExtraReason = input.extraFeeReason.trim().length > 0;
  const hasExtraAmount = input.extraFeeAmount.trim().length > 0;

  if (input.hasExtraFee || hasExtraAmount || hasExtraReason) {
    if (hasExtraAmount) {
      const parsedExtra = parseWonAmount(input.extraFeeAmount);
      if (parsedExtra === null || parsedExtra <= 0) {
        errors.extraFeeAmount = '추가 비용 금액은 1원 이상의 숫자로 입력해 주세요.';
      } else if (parsedFinalPrice !== null && parsedExtra > parsedFinalPrice) {
        errors.extraFeeAmount =
          '추가 비용 금액은 최종 견적 금액보다 클 수 없습니다.';
      }
    }
    if (!hasExtraReason) {
      errors.extraFeeReason =
        '추가 비용이 발생한 경우 소비자가 이해할 수 있도록 사유를 입력해 주세요.';
    } else if (input.extraFeeReason.trim().length < 2) {
      errors.extraFeeReason = '추가 비용 사유를 2자 이상 입력해 주세요.';
    }
  }

  if (!input.availableDate.trim()) {
    errors.availableDate = '제작 및 수령 가능 날짜를 선택해 주세요.';
  } else if (input.availableDate < todayStr) {
    errors.availableDate = '과거 날짜는 제작 가능 날짜로 선택할 수 없습니다.';
  }

  if (!input.availableTime.trim()) {
    errors.availableTime = '수령 가능 시간을 선택해 주세요.';
  }

  if (!input.designGuide.trim()) {
    errors.designGuide = '디자인 및 제작 관련 안내를 입력해 주세요.';
  } else if (input.designGuide.trim().length < 5) {
    errors.designGuide =
      '디자인 및 제작 관련 안내는 5자 이상 입력해 주세요.';
  }

  return errors;
}

export interface ConsumerRevisionErrors {
  categories?: string;
  note?: string;
}

export const CONSUMER_REVISION_CATEGORY_OPTIONS = [
  '디자인 · 장식',
  '색상',
  '레터링 문구',
  '케이크 크기 · 모양',
  '수령 날짜 · 시간',
  '기타 제작 조건',
] as const;

export function validateConsumerRevisionRequest(
  categories: string[],
  note: string
): ConsumerRevisionErrors {
  const errors: ConsumerRevisionErrors = {};
  if (categories.length === 0) {
    errors.categories = '수정을 원하는 항목을 최소 1개 이상 선택해 주세요.';
  }
  const trimmed = note.trim();
  if (!trimmed) {
    errors.note = '판매자에게 전달할 수정 요청 내용을 입력해 주세요.';
  } else if (trimmed.length < 5) {
    errors.note = '판매자가 참고할 수 있도록 수정 내용을 5자 이상 자세히 적어 주세요.';
  }
  return errors;
}
