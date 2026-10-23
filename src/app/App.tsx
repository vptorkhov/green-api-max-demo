import { AuthProvider } from '@/features/auth';

import { AppScreens } from './AppScreens';

// Корень приложения: провайдеры и переключение экранов
export function App() {
  return (
    <AuthProvider>
      <AppScreens />
    </AuthProvider>
  );
}
