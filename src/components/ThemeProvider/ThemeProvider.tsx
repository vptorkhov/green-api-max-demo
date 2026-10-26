import { type ReactNode, useLayoutEffect, useMemo } from 'react';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import { DEFAULT_THEME_MODE } from '@/constants/theme';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import { usePrefersDarkScheme } from '@/hooks/usePrefersDarkScheme';
import type { ResolvedTheme, ThemeContextValue } from '@/types/theme.types';
import { isThemeMode } from '@/utils/typeGuards';

import { ThemeContext } from './ThemeContext';

type Props = {
  children: ReactNode;
};

// Тема оформления (п. 8.5). До загрузки бандла тему уже выставил inline-скрипт index.html (п. 2.6),
// провайдер продолжает с того же значения из localStorage: смена режима и следование за ОС.
// Провайдер — на уровне App, поэтому подписка на тему ОС работает на любом экране
export function ThemeProvider({ children }: Props) {
  const { value: mode, setValue: setMode } = useLocalStorageState(
    STORAGE_KEYS.theme,
    isThemeMode,
    DEFAULT_THEME_MODE,
  );
  const prefersDarkScheme = usePrefersDarkScheme();

  const systemTheme: ResolvedTheme = prefersDarkScheme ? 'dark' : 'light';
  const resolvedTheme = mode === 'system' ? systemTheme : mode;

  // До отрисовки кадра: без вспышки старой темы при переключении
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
  }, [resolvedTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolvedTheme, setMode }),
    [mode, resolvedTheme, setMode],
  );

  return <ThemeContext value={value}>{children}</ThemeContext>;
}
