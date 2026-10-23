import type ru from '@/localization/locales/ru.json';
import { GreenApiError } from '@/services/greenApiError';

// Ключ локализации текста ошибки. В состоянии хуков хранится ключ, а не текст,
// чтобы сообщение менялось вместе с языком (ProjectRules §7).
export type ErrorMessageKey = `common.errors.${keyof (typeof ru)['common']['errors']}`;

// Для каждого GreenApiErrorKind должен быть ключ в common.errors — иначе ошибка TypeScript.
// Отмену запроса (isAbortError) сюда не передают: это не ошибка.
export function getErrorMessageKey(error: unknown): ErrorMessageKey {
  if (error instanceof GreenApiError) {
    return `common.errors.${error.kind}`;
  }

  return 'common.errors.unknown';
}
