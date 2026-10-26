// Режим темы, который выбирает пользователь: system — вслед за ОС (по умолчанию, п. 8.5)
export type ThemeMode = 'system' | 'light' | 'dark';

// Тема, которая применяется на самом деле: значение data-theme у <html>
export type ResolvedTheme = Exclude<ThemeMode, 'system'>;

export type ThemeContextValue = {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
};
