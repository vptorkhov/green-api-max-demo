import { REQUEST_TIMEOUT_MS } from '@/constants/greenApi';
import type { TypeGuard } from '@/types/common.types';
import type { GreenApiCredentials } from '@/types/greenApi.types';

import { getErrorKindByStatus, GreenApiError, isAbortError } from './greenApiError';

type HttpMethod = 'GET' | 'POST' | 'DELETE';

type RequestOptions<T> = {
  // Проверка формы ответа: без неё данные из сети в приложение не попадают
  guard: TypeGuard<T>;
  // Параметр после токена: /deleteNotification/{token}/{receiptId}
  pathParam?: string | number;
  query?: Record<string, string | number>;
  // Отменять без аргумента (controller.abort()): тогда fetch выбрасывает AbortError
  signal?: AbortSignal;
  timeoutMs?: number;
};

// Относительный apiUrl браузер дописал бы к адресу нашего сайта — запрос с токеном в пути
// ушёл бы на собственный хостинг. Поэтому допускается только абсолютный http(s)-адрес
function isAbsoluteHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);

    return protocol === 'https:' || protocol === 'http:';
  } catch {
    return false;
  }
}

// {apiUrl}/waInstance{idInstance}/{method}/{apiTokenInstance}[/{pathParam}][?query] — GreenApiNotes.md §1.
// URL никуда не логируется и не попадает в ошибки: в нём токен.
function buildUrl(
  { apiUrl, idInstance, apiTokenInstance }: GreenApiCredentials,
  method: string,
  pathParam?: string | number,
  query?: Record<string, string | number>,
) {
  const baseSegments = [`waInstance${idInstance}`, method, apiTokenInstance];
  const segments = pathParam === undefined ? baseSegments : [...baseSegments, String(pathParam)];

  const path = segments.map(encodeURIComponent).join('/');
  const queryString = query
    ? `?${new URLSearchParams(
        Object.entries(query).map(([key, value]) => [key, String(value)]),
      ).toString()}`
    : '';

  return `${apiUrl.replace(/\/+$/, '')}/${path}${queryString}`;
}

const TOKEN_MASK = '***';

// Ошибка fetch может содержать URL целиком (например, «Failed to parse URL from …» при неверном
// apiUrl), а ошибки логируются в хуках. Поэтому в cause сохраняется копия с замаскированным токеном.
function maskTokenInError(error: unknown, apiTokenInstance: string): Error {
  const maskToken = (text: string) =>
    apiTokenInstance === '' ? text : text.replaceAll(apiTokenInstance, TOKEN_MASK);

  if (!(error instanceof Error)) {
    return new Error(maskToken(String(error)));
  }

  const maskedError = new Error(maskToken(error.message));
  maskedError.name = error.name;

  return maskedError;
}

// Тело ответа читается как текст: GREEN-API отвечает пустым телом, `null`, JSON или HTML nginx
// (GreenApiNotes.md §6, §9). Пустое тело считается тем же, что `null`.
function parseResponseBody(bodyText: string, method: string, status: number): unknown {
  if (bodyText.trim() === '') {
    return null;
  }

  try {
    return JSON.parse(bodyText);
  } catch {
    // Исходная ошибка не сохраняется: её текст содержит фрагмент тела ответа
    throw new GreenApiError('invalidResponse', { method, status });
  }
}

async function request<T>(
  credentials: GreenApiCredentials,
  httpMethod: HttpMethod,
  method: string,
  body: unknown,
  { guard, pathParam, query, signal, timeoutMs = REQUEST_TIMEOUT_MS }: RequestOptions<T>,
): Promise<T> {
  // Неверный адрес для пользователя — та же ситуация, что и недоступный сервер
  if (!isAbsoluteHttpUrl(credentials.apiUrl)) {
    throw new GreenApiError('network', { method });
  }

  const url = buildUrl(credentials, method, pathParam, query);
  const timeoutSignal = AbortSignal.timeout(timeoutMs);
  const hasBody = body !== undefined;

  let response: Response;
  let bodyText: string;

  try {
    response = await fetch(url, {
      method: httpMethod,
      headers: hasBody ? { 'Content-Type': 'application/json' } : undefined,
      body: hasBody ? JSON.stringify(body) : undefined,
      signal: signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal,
    });
    bodyText = await response.text();
  } catch (error) {
    // Отмену вызывающей стороной пробрасываем как есть; таймаут (TimeoutError) и сбой сети — network
    if (isAbortError(error)) {
      throw error;
    }

    throw new GreenApiError('network', {
      method,
      cause: maskTokenInError(error, credentials.apiTokenInstance),
    });
  }

  if (!response.ok) {
    // Тело ошибки используется только для выбора kind: в 400 оно содержит токен в поле path
    throw new GreenApiError(getErrorKindByStatus(response.status, bodyText), {
      method,
      status: response.status,
    });
  }

  const data = parseResponseBody(bodyText, method, response.status);

  if (!guard(data)) {
    throw new GreenApiError('invalidResponse', { method, status: response.status });
  }

  return data;
}

// Общий HTTP-клиент GREEN-API. Учётные данные передаются аргументом:
// клиент не читает их из Context или localStorage. Методы API описывают доменные services.
export const greenApiClient = {
  get<T>(credentials: GreenApiCredentials, method: string, options: RequestOptions<T>) {
    return request(credentials, 'GET', method, undefined, options);
  },

  post<T>(
    credentials: GreenApiCredentials,
    method: string,
    body: unknown,
    options: RequestOptions<T>,
  ) {
    return request(credentials, 'POST', method, body, options);
  },

  // Нужен для deleteNotification (этап 7)
  delete<T>(credentials: GreenApiCredentials, method: string, options: RequestOptions<T>) {
    return request(credentials, 'DELETE', method, undefined, options);
  },
};
