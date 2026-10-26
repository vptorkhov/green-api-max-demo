import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { DEFAULT_LANGUAGE, isLanguage, type Language } from '@/localization/languages';

// Текущий язык интерфейса и его смена (п. 8.4). Сохранение в localStorage, lang и title документа —
// в обработчике languageChanged (localization/i18n.ts, этап 2): язык меняется только через i18next
export function useLanguage() {
  const { i18n } = useTranslation();

  const { resolvedLanguage } = i18n;
  const language: Language = isLanguage(resolvedLanguage) ? resolvedLanguage : DEFAULT_LANGUAGE;

  const changeLanguage = useCallback(
    (nextLanguage: Language) => {
      void i18n.changeLanguage(nextLanguage);
    },
    [i18n],
  );

  return {
    language,
    changeLanguage,
  };
}
