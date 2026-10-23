export const SUPPORTED_LANGUAGES = ['ru', 'en'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'ru';

export function isLanguage(value: unknown): value is Language {
  return SUPPORTED_LANGUAGES.some((language) => language === value);
}
