import { createContext } from 'react';

import type { AuthContextValue } from '../types/auth.types';

// Отдельный файл, а не AuthProvider.tsx: файл компонента должен экспортировать только компоненты,
// иначе Fast Refresh перезагружает страницу целиком (react-refresh, ProjectRules §2).
// null — вне провайдера: useAuthContext в этом случае бросает ошибку
export const AuthContext = createContext<AuthContextValue | null>(null);
