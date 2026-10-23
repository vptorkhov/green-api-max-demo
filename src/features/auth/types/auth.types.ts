import type ru from '@/localization/locales/ru.json';
import type { GreenApiCredentials } from '@/types/greenApi.types';

// Статусы инстанса MAX (GreenApiNotes.md §2, api-docs/account/GetStateInstance.md).
// Вход разрешён только при authorized; для остальных — своё сообщение (п. 4.3)
export type InstanceState =
  'authorized' | 'notAuthorized' | 'starting' | 'blocked' | 'suspended' | 'pendingPassword';

// Ответ getStateInstance: {"stateInstance":"authorized"}
export type GetStateInstanceResponse = {
  stateInstance: InstanceState;
};

// Значения формы входа как есть, до обрезки пробелов и проверки
export type CredentialsFormValues = GreenApiCredentials;

export type CredentialsField = keyof CredentialsFormValues;

// Ключ локализации ошибки поля формы входа (выводится из ru.json — опечатка в ключе ловится TypeScript)
export type CredentialsValidationErrorKey =
  `pages.auth.validation.${keyof (typeof ru)['pages']['auth']['validation']}`;

export type CredentialsFieldErrors = Partial<
  Record<CredentialsField, CredentialsValidationErrorKey>
>;

// При успехе — нормализованные учётные данные, готовые для запроса
export type CredentialsValidationResult =
  | { isValid: true; credentials: GreenApiCredentials }
  | { isValid: false; fieldErrors: CredentialsFieldErrors };
