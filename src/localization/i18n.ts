import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import { readStorage, writeStorage } from '@/utils/storage';

import { DEFAULT_LANGUAGE, isLanguage, SUPPORTED_LANGUAGES } from './languages';
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
    writeStorage(STORAGE_KEYS.language, language);
  }
});

void i18n.use(initReactI18next).init({
  resources,
  lng: readStorage(STORAGE_KEYS.language, isLanguage) ?? DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: [...SUPPORTED_LANGUAGES],
  interpolation: {
    // React сам экранирует значения
    escapeValue: false,
  },
  initAsync: false,
});
