import { createContext } from 'react';

import type { ThemeContextValue } from '@/types/theme.types';

// Отдельный файл: файл компонента экспортирует только компоненты (ProjectRules §2).
// null — вне провайдера: useTheme в этом случае бросает ошибку
export const ThemeContext = createContext<ThemeContextValue | null>(null);
