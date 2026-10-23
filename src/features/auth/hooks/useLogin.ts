import { useEffect, useRef, useState } from 'react';

import { isAbortError } from '@/services/greenApiError';
import type { GreenApiCredentials } from '@/types/greenApi.types';
import { getErrorMessageKey } from '@/utils/getErrorMessageKey';

import { authService } from '../services/authService';
import type {
  CredentialsFieldErrors,
  CredentialsFormValues,
  LoginErrorKey,
} from '../types/auth.types';
import { getInstanceStateErrorKey } from '../utils/getInstanceStateErrorKey';
import { validateCredentials } from '../utils/validateCredentials';

type Options = {
  // Вызывается с нормализованными учётными данными, только если инстанс авторизован.
  // Хук не знает про контекст: связку с AuthContext делает экран входа (п. 4.5)
  onSuccess: (credentials: GreenApiCredentials) => void;
};

// Вход: валидация → проверка статуса инстанса → onSuccess. Вход разрешён только при authorized
export function useLogin({ onSuccess }: Options) {
  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LoginErrorKey | null>(null);
  const [fieldErrors, setFieldErrors] = useState<CredentialsFieldErrors>({});

  async function login(values: CredentialsFormValues) {
    if (isLoadingRef.current) {
      return;
    }

    const validation = validateCredentials(values);

    setError(null);

    // Некорректные поля — запрос не отправляется
    if (!validation.isValid) {
      setFieldErrors(validation.fieldErrors);

      return;
    }

    setFieldErrors({});

    const abortController = new AbortController();

    abortControllerRef.current = abortController;
    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const state = await authService.getInstanceState(
        validation.credentials,
        abortController.signal,
      );

      if (state === 'authorized') {
        onSuccess(validation.credentials);
      } else {
        setError(getInstanceStateErrorKey(state));
      }
    } catch (caughtError) {
      // Отмена при размонтировании — не ошибка
      if (isAbortError(caughtError)) {
        return;
      }

      console.error(caughtError);
      setError(getErrorMessageKey(caughtError));
    } finally {
      abortControllerRef.current = null;
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }

  // Уход с экрана во время запроса отменяет его
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    isLoading,
    error,
    fieldErrors,
    login,
  };
}
