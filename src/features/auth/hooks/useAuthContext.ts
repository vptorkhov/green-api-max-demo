import { useContext } from 'react';

import { AuthContext } from '../components/AuthContext';

// Доступ к учётным данным и выходу. Вне AuthProvider — ошибка, а не тихий null
export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }

  return context;
}
