import { ErrorBoundary } from 'react-error-boundary';

import { AuthProvider } from '@/features/auth';

import { AppErrorFallback } from '../AppErrorFallback/AppErrorFallback';
import { AppScreens } from '../AppScreens/AppScreens';

// Корень приложения: граница ошибок, провайдеры и переключение экранов.
// ErrorBoundary — снаружи всего: ловит и ошибки рендера, и сбой загрузки ленивого экрана (п. 8.1)
export function App() {
  return (
    <ErrorBoundary FallbackComponent={AppErrorFallback}>
      <AuthProvider>
        <AppScreens />
      </AuthProvider>
    </ErrorBoundary>
  );
}
