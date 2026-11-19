import type { CakeOrderFormInput, CakeShop } from '../types';

export interface OrderStep1Errors {
  pickupDate?: string;
  pickupTime?: string;
}

export interface OrderStep2Errors {
  cakeSize?: string;
  cakeShape?: string;
  cakeFlavor?: string;
  designType?: string;
  cakeColor?: string;
  letteringText?: string;
}

export type OrderFormErrors = OrderStep1Errors & OrderStep2Errors;

export function validateOrderStep1(
  form: CakeOrderFormInput,
  shop: CakeShop,
  todayStr: string
): OrderStep1Errors {
  const errors: OrderStep1Errors = {};

  if (!form.pickupDate.trim()) {
    errors.pickupDate = '픽업 날짜를 선택해 주세요.';
  } else if (form.pickupDate < todayStr) {
    errors.pickupDate = '과거 날짜는 픽업 날짜로 선택할 수 없습니다.';
  } else if (!shop.pickupAvailableDates.includes(form.pickupDate)) {
    errors.pickupDate =
      '선택하신 날짜에는 해당 매장의 픽업 주문이 불가합니다. 다른 날짜를 선택해 주세요.';
  }

  if (!form.pickupTime.trim()) {
    errors.pickupTime = '원하시는 픽업 시간을 선택해 주세요.';
  }

  return errors;
}

export function resolveOrderColor(form: CakeOrderFormInput): string {
  if (form.cakeColorPreset === '직접 입력') {
    return form.cakeColorCustom.trim();
  }
  return form.cakeColorPreset.trim();
}

export function validateOrderStep2(form: CakeOrderFormInput): OrderStep2Errors {
  const errors: OrderStep2Errors = {};

  if (!form.cakeSize.trim()) {
    errors.cakeSize = '케이크 크기를 선택해 주세요.';
  }
  if (!form.cakeShape.trim()) {
    errors.cakeShape = '케이크 모양을 선택해 주세요.';
  }
  if (!form.cakeFlavor.trim()) {
    errors.cakeFlavor = '케이크 맛을 선택해 주세요.';
  }
  if (!form.designType.trim()) {
    errors.designType = '디자인 유형을 선택해 주세요.';
  }

  const resolvedColor = resolveOrderColor(form);
  if (!resolvedColor) {
    errors.cakeColor =
      form.cakeColorPreset === '직접 입력'
        ? '원하시는 케이크 색상을 직접 입력해 주세요.'
        : '원하는 색상을 선택해 주세요.';
  }

  if (!form.letteringText.trim()) {
    errors.letteringText = '케이크에 들어갈 레터링 문구를 입력해 주세요.';
  } else if (form.letteringText.trim().length > 30) {
    errors.letteringText = '레터링 문구는 30자 이내로 입력해 주세요.';
  }

  return errors;
}

export function validateFullOrderForm(
  form: CakeOrderFormInput,
  shop: CakeShop,
  todayStr: string
): OrderFormErrors {
  return {
    ...validateOrderStep1(form, shop, todayStr),
    ...validateOrderStep2(form),
  };
}
