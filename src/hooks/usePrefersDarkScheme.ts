import { useSyncExternalStore } from 'react';

import { DARK_SCHEME_MEDIA_QUERY } from '@/constants/theme';

function subscribe(onChange: () => void) {
  const mediaQuery = window.matchMedia(DARK_SCHEME_MEDIA_QUERY);

  mediaQuery.addEventListener('change', onChange);

  return () => {
    mediaQuery.removeEventListener('change', onChange);
  };
}

function getSnapshot() {
  return window.matchMedia(DARK_SCHEME_MEDIA_QUERY).matches;
}

// Тёмная ли тема в ОС — с подпиской: смена темы ОС перерисовывает без перезагрузки (п. 8.5)
export function usePrefersDarkScheme() {
  return useSyncExternalStore(subscribe, getSnapshot);
}
