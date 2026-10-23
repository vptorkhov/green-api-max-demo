import type { StorageKey } from '@/constants/storageKeys';
import type { TypeGuard } from '@/types/common.types';

// Значения хранятся как JSON. Формат продублирован в inline-скрипте темы в index.html — менять вместе.
// localStorage может быть недоступен (приватный режим, запрет cookies) или переполнен,
// поэтому все обращения — в try/catch: сбой хранилища не ломает приложение.

// Возвращает null, если значения нет, оно повреждено или имеет неверную форму
export function readStorage<T>(key: StorageKey, guard: TypeGuard<T>): T | null {
  let rawValue: string | null;

  try {
    rawValue = localStorage.getItem(key);
  } catch (error) {
    console.error(error);

    return null;
  }

  if (rawValue === null) {
    return null;
  }

  let value: unknown;

  try {
    value = JSON.parse(rawValue);
  } catch {
    // Ошибку разбора не логируем целиком: её текст содержит фрагмент значения (там может быть токен)
    console.warn(`localStorage: value for "${key}" is not valid JSON, ignored`);

    return null;
  }

  if (!guard(value)) {
    console.warn(`localStorage: value for "${key}" has unexpected shape, ignored`);

    return null;
  }

  return value;
}

export function writeStorage<T>(key: StorageKey, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(error);
  }
}

export function removeStorage(key: StorageKey) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(error);
  }
}
