import type { GreenApiCredentials } from '@/types/greenApi.types';

import type {
  CredentialsFieldErrors,
  CredentialsFormValues,
  CredentialsValidationErrorKey,
  CredentialsValidationResult,
} from '../types/auth.types';

const DIGITS_ONLY_PATTERN = /^\d+$/;
const TRAILING_SLASHES_PATTERN = /\/+$/;
// Проверяется по строке, а не по URL.search / URL.hash: у «https://host?» они пустые
const QUERY_OR_HASH_PATTERN = /[?#]/;

function validateIdInstance(idInstance: string): CredentialsValidationErrorKey | null {
  if (idInstance === '') {
    return 'pages.auth.validation.idInstanceRequired';
  }

  // Нечисловой idInstance сервер отклоняет ответом без CORS-заголовков — в браузере это
  // выглядит как сбой сети (GreenApiNotes.md §9), поэтому ловим его до запроса
  if (!DIGITS_ONLY_PATTERN.test(idInstance)) {
    return 'pages.auth.validation.idInstanceNotNumeric';
  }

  return null;
}

function validateApiTokenInstance(apiTokenInstance: string): CredentialsValidationErrorKey | null {
  return apiTokenInstance === '' ? 'pages.auth.validation.apiTokenInstanceRequired' : null;
}

// Только https и только «чистый» адрес: логин/пароль, ?query и #hash сломали бы сборку URL
// запроса. Путь допустим — например, необязательный префикс /v3 (GreenApiNotes.md §1)
function validateApiUrl(apiUrl: string): CredentialsValidationErrorKey | null {
  if (apiUrl === '') {
    return 'pages.auth.validation.apiUrlRequired';
  }

  try {
    const { protocol, hostname, username, password } = new URL(apiUrl);
    const isValid =
      protocol === 'https:' &&
      hostname !== '' &&
      username === '' &&
      password === '' &&
      !QUERY_OR_HASH_PATTERN.test(apiUrl);

    return isValid ? null : 'pages.auth.validation.apiUrlInvalid';
  } catch {
    return 'pages.auth.validation.apiUrlInvalid';
  }
}

// Обрезает пробелы (значения часто вставляют из личного кабинета с лишними символами)
// и убирает завершающий «/» у apiUrl
function normalizeCredentials({
  apiUrl,
  idInstance,
  apiTokenInstance,
}: CredentialsFormValues): GreenApiCredentials {
  return {
    apiUrl: apiUrl.trim().replace(TRAILING_SLASHES_PATTERN, ''),
    idInstance: idInstance.trim(),
    apiTokenInstance: apiTokenInstance.trim(),
  };
}

// Чистая функция: для каждого поля — ключ первой найденной ошибки
export function validateCredentials(values: CredentialsFormValues): CredentialsValidationResult {
  const credentials = normalizeCredentials(values);

  const fieldErrors: CredentialsFieldErrors = {
    idInstance: validateIdInstance(credentials.idInstance) ?? undefined,
    apiTokenInstance: validateApiTokenInstance(credentials.apiTokenInstance) ?? undefined,
    apiUrl: validateApiUrl(credentials.apiUrl) ?? undefined,
  };
  const hasErrors = Object.values(fieldErrors).some((errorKey) => errorKey !== undefined);

  return hasErrors ? { isValid: false, fieldErrors } : { isValid: true, credentials };
}
