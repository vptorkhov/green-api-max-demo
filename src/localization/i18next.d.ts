import 'i18next';

import type ru from './locales/ru.json';

// Типизация ключей: опечатка в t('...') — ошибка TypeScript
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof ru;
    };
  }
}
