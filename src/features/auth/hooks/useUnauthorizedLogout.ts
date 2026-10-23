import { useCallback } from 'react';

import { GreenApiError } from '@/services/greenApiError';

import { useAuthContext } from './useAuthContext';

// Автоматический выход, если учётные данные перестали действовать (п. 4.7). Сохранённые данные
// при старте не перепроверяются — первый же запрос с unauthorized возвращает на экран входа.
// Для хуков домена chat (создание чата, отправка, получение), чтобы проверка не повторялась в каждом
export function useUnauthorizedLogout() {
  const { logout } = useAuthContext();

  // Возвращает true, если выход выполнен: тогда вызывающему хуку не нужно показывать ошибку.
  // useCallback — функция попадёт в зависимости эффекта long polling (этап 7)
  const logoutIfUnauthorized = useCallback(
    (error: unknown) => {
      const isUnauthorized = error instanceof GreenApiError && error.kind === 'unauthorized';

      if (isUnauthorized) {
        logout('pages.auth.logoutReason.unauthorized');
      }

      return isUnauthorized;
    },
    [logout],
  );

  return {
    logoutIfUnauthorized,
  };
}
