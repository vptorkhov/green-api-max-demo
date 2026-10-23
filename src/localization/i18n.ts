import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LANGUAGE, isLanguage, SUPPORTED_LANGUAGES } from './languages';
import { readStoredLanguage, writeStoredLanguage } from './languageStorage';
import en from './locales/en.json';
import ru from './locales/ru.json';

// Наборы ключей словарей должны совпадать: проверка в обе стороны (ProjectRules §10)
const resources = {
  ru: { translation: ru satisfies typeof en },
  en: { translation: en satisfies typeof ru },
};

function syncDocumentWithLanguage(language: string) {
  document.documentElement.lang = language;
  document.title = i18n.t('common.appTitle');
}

i18n.on('languageChanged', (language) => {
  syncDocumentWithLanguage(language);

  if (isLanguage(language)) {
    writeStoredLanguage(language);
  }
});

void i18n.use(initReactI18next).init({
  resources,
  lng: readStoredLanguage() ?? DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: [...SUPPORTED_LANGUAGES],
  interpolation: {
    // React сам экранирует значения
    escapeValue: false,
  },
  initAsync: false,
});
