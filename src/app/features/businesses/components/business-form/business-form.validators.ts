import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { BUSINESS_FIELD_RULES } from './business-form.config';

function optional(key: string, test: (value: string) => boolean): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = typeof control.value === 'string' ? control.value.trim() : '';
    return !value || test(value) ? null : { [key]: true };
  };
}

/** Format validators only apply when a value has been supplied. */
export const optionalPhone = optional('phone', (value) => BUSINESS_FIELD_RULES.phone.pattern.test(value));
export const optionalPinCode = optional('pinCode', (value) => BUSINESS_FIELD_RULES.pinCode.pattern.test(value));
export const optionalUrl = optional('url', (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
});

/** A day that is open needs both times when either is entered. Fully empty open days are treated as "not provided". */
export const hoursDayValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const { closed, openTime, closeTime } = (group as FormGroup).getRawValue();
  if (closed) return null;
  return !!openTime !== !!closeTime ? { incompleteHours: true } : null;
};

const MESSAGES: Record<string, (label: string, error: unknown) => string> = {
  required: (label) => `Please enter ${label.toLowerCase()}.`,
  pattern: (label) => `Please enter ${label.toLowerCase()}.`,
  maxlength: (label, error) =>
    `${label} must be ${(error as { requiredLength: number }).requiredLength} characters or fewer.`,
  email: () => 'Please enter a valid email address.',
  phone: () => 'Please enter a valid phone number, for example +91 98765 43210.',
  url: () => 'Please enter a full web address starting with http:// or https://.',
  pinCode: () => 'Please enter a 6-digit PIN code.',
  min: (label, error) => `${label} must be at least ${(error as { min: number }).min}.`,
  max: (label, error) => `${label} must be at most ${(error as { max: number }).max}.`,
  incompleteHours: () => 'Enter both opening and closing times, or mark the day as closed.',
};

export function businessErrorMessage(label: string, errors: ValidationErrors | null): string {
  if (!errors) return '';
  const key = Object.keys(errors).find((item) => MESSAGES[item]);
  return key ? MESSAGES[key](label, errors[key]) : `${label} is not valid.`;
}

