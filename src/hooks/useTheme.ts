import { useContext } from 'react';

import { ThemeContext } from '@/components/ThemeProvider/ThemeContext';

// Режим темы, применённая тема и смена режима. Вне ThemeProvider — ошибка, а не тихий null
export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
