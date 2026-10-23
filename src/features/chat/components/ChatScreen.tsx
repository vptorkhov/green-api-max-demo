import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { useAuthContext } from '@/features/auth';

import styles from './ChatScreen.module.css';

// ЗАГЛУШКА этапа 4: заголовок и выход. Настоящий экран чата — этап 5
export function ChatScreen() {
  const { logout } = useAuthContext();
  const { t } = useTranslation();

  function handleLogoutClick() {
    logout();
  }

  return (
    <main className={styles.screen}>
      <h1 className={styles.title}>{t('pages.chat.title')}</h1>
      <Button variant="secondary" onClick={handleLogoutClick}>
        {t('common.actions.logout')}
      </Button>
    </main>
  );
}
