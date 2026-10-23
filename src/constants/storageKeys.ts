// Все ключи localStorage приложения. Префикс отделяет их от данных других приложений на том же origin.
const STORAGE_PREFIX = 'green-api-max-demo';

export const STORAGE_KEYS = {
  // Продублирован в inline-скрипте index.html (применение темы до загрузки бандла) — менять вместе
  theme: `${STORAGE_PREFIX}:theme`,
  language: `${STORAGE_PREFIX}:language`,
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
