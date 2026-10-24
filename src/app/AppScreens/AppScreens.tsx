import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';

import { Spinner } from '@/components/ui/Spinner/Spinner';
import { useAuthContext } from '@/features/auth';

import styles from './AppScreens.module.css';

// Экраны — отдельные чанки. Динамический импорт по пути к файлу экрана — исключение
// из правила «только через index.ts» (ProjectRules §2): через index экран попал бы в основной бандл
const LoginScreen = lazy(() =>
  import('@/features/auth/components/LoginScreen/LoginScreen').then((module) => ({
    default: module.LoginScreen,
  })),
);
const ChatScreen = lazy(() =>
  import('@/features/chat/components/ChatScreen/ChatScreen').then((module) => ({
    default: module.ChatScreen,
  })),
);

// Два экрана без роутера: URL-адреса им не нужны (план, п. 4.6)
export function AppScreens() {
  const { isAuthorized } = useAuthContext();
  const { t } = useTranslation();

  return (
    <Suspense
      fallback={
        <div className={styles.fallback}>
          <Spinner label={t('common.loading')} />
        </div>
      }
    >
      {isAuthorized ? <ChatScreen /> : <LoginScreen />}
    </Suspense>
  );
}
