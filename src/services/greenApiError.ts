// Категории ошибок GREEN-API. По kind хук выбирает текст для пользователя
// (ключ common.errors.<kind>, п. 3.7) и решает, повторять ли запрос (этап 7).
export type GreenApiErrorKind =
  | 'network'
  | 'unauthorized'
  | 'notFound'
  | 'validation'
  | 'instanceUnavailable'
  | 'rateLimit'
  | 'quotaExceeded'
  | 'server'
  | 'invalidResponse'
  | 'unknown';

type GreenApiErrorOptions = {
  method?: string;
  status?: number;
  cause?: unknown;
};

// Сообщение ошибки не содержит тела ответа и URL: в них может быть токен (GreenApiNotes.md §9).
// Имя метода API (sendMessage, receiveNotification) секретов не содержит и помогает при отладке.
export class GreenApiError extends Error {
  readonly kind: GreenApiErrorKind;
  readonly method: string | null;
  readonly status: number | null;

  constructor(kind: GreenApiErrorKind, { method, status, cause }: GreenApiErrorOptions = {}) {
    const statusSuffix = status === undefined ? '' : ` (HTTP ${status})`;

    super(`GREEN-API ${method ?? 'request'} failed: ${kind}${statusSuffix}`, { cause });
    this.name = 'GreenApiError';
    this.kind = kind;
    this.method = method ?? null;
    this.status = status ?? null;
  }
}

// Тексты 400, означающие, что инстанс недоступен, а не что запрос неверен
// (api-docs/general/common-errors.md). Сравниваются без учёта регистра.
const INSTANCE_UNAVAILABLE_MARKERS = [
  'instance in starting process',
  'instance is starting or not authorized',
  'instance account is expired',
  'instance is deleted',
];

// Сопоставление HTTP-кода с kind по таблице GreenApiNotes.md §9.
// bodyText нужен только для 400: им различаются validation и instanceUnavailable.
export function getErrorKindByStatus(status: number, bodyText = ''): GreenApiErrorKind {
  if (status === 400) {
    const normalizedBody = bodyText.toLowerCase();
    const isInstanceUnavailable = INSTANCE_UNAVAILABLE_MARKERS.some((marker) =>
      normalizedBody.includes(marker),
    );

    return isInstanceUnavailable ? 'instanceUnavailable' : 'validation';
  }

  if (status === 401 || status === 403) {
    return 'unauthorized';
  }

  if (status === 404) {
    return 'notFound';
  }

  if (status === 429) {
    return 'rateLimit';
  }

  if (status === 466) {
    return 'quotaExceeded';
  }

  // 499 — соединение закрыто до ответа сервера
  if (status === 499) {
    return 'network';
  }

  if (status >= 500 && status <= 599) {
    return 'server';
  }

  return 'unknown';
}

// Отмена запроса через AbortController — штатная ситуация (остановка long polling,
// размонтирование, выход), а не ошибка: её не показываем и не повторяем.
// Таймаут клиента (AbortSignal.timeout) даёт имя TimeoutError и сюда не попадает.
export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}
