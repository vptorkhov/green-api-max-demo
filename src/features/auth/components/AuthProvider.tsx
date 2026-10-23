import { type ReactNode, useCallback, useMemo, useState } from 'react';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import { useLocalStorageState } from '@/hooks/useLocalStorageState';
import type { GreenApiCredentials } from '@/types/greenApi.types';

import type { AuthContextValue, LogoutReasonKey } from '../types/auth.types';
import { isGreenApiCredentials } from '../utils/authGuards';
import { AuthContext } from './AuthContext';

type Props = {
  children: ReactNode;
};

// Учётные данные и выход. Контекст не знает про API: проверку при входе делает useLogin (п. 4.3)
export function AuthProvider({ children }: Props) {
  const {
    value: credentials,
    setValue: setStoredCredentials,
    removeValue: removeStoredCredentials,
  } = useLocalStorageState<GreenApiCredentials | null>(
    STORAGE_KEYS.credentials,
    isGreenApiCredentials,
    null,
  );
  const [logoutReason, setLogoutReason] = useState<LogoutReasonKey | null>(null);

  const isAuthorized = credentials !== null;

  const setCredentials = useCallback(
    (nextCredentials: GreenApiCredentials) => {
      setStoredCredentials(nextCredentials);
      setLogoutReason(null);
    },
    [setStoredCredentials],
  );

  const logout = useCallback(
    (reason?: LogoutReasonKey) => {
      removeStoredCredentials();
      setLogoutReason(reason ?? null);
    },
    [removeStoredCredentials],
  );

  const clearLogoutReason = useCallback(() => {
    setLogoutReason(null);
  }, []);

  // Мемоизация: потребители контекста не перерисовываются, пока значение не изменилось (ProjectRules §13)
  const value = useMemo<AuthContextValue>(
    () => ({ credentials, isAuthorized, logoutReason, setCredentials, logout, clearLogoutReason }),
    [credentials, isAuthorized, logoutReason, setCredentials, logout, clearLogoutReason],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
