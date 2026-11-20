import type { CustomQuoteRequestFormInput } from '../types';
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
