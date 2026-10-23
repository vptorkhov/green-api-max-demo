import { isLanguage, type Language } from './languages';

// Временная обёртка: на этапе 3 переезжает на общие src/constants/storageKeys.ts и src/utils/storage.ts.
// Формат значения — JSON-строка, как у темы в index.html.
const LANGUAGE_STORAGE_KEY = 'green-api-max-demo:language';

export function readStoredLanguage(): Language | null {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(LANGUAGE_STORAGE_KEY) ?? 'null');

    return isLanguage(stored) ? stored : null;
  } catch (error) {
    console.error(error);

    return null;
  }
}

export function writeStoredLanguage(language: Language) {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(language));
  } catch (error) {
    console.error(error);
  }
}
