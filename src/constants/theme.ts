import type { ThemeMode } from '@/types/theme.types';

// Порядок — порядок вариантов в переключателе. Значения и ключ хранилища продублированы
// в inline-скрипте index.html (тема до первой отрисовки, п. 2.6) — менять вместе
export const THEME_MODES = ['system', 'light', 'dark'] as const satisfies readonly ThemeMode[];

export const DEFAULT_THEME_MODE: ThemeMode = 'system';

// Медиазапрос системной темы — тот же, что в index.html
export const DARK_SCHEME_MEDIA_QUERY = '(prefers-color-scheme: dark)';
