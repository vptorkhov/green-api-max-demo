import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button/Button';

import styles from './AppErrorFallback.module.css';

// Экран непредвиденной ошибки рендера или загрузки чанка экрана (п. 8.1) — вместо белого листа.
// Перезагрузка, а не resetErrorBoundary: устаревший чанк после обновления сайта загрузится заново,
// а чаты и учётные данные сохранены в localStorage. Ошибку в консоль пишет сам React (onCaughtError)
export function AppErrorFallback() {
  const { t } = useTranslation();

  function handleReloadClick() {
    window.location.reload();
  }

  return (
    <main className={styles.screen}>
      <div className={styles.card} role="alert">
        <h1 className={styles.title}>{t('common.errorBoundary.title')}</h1>
        <p className={styles.text}>{t('common.errorBoundary.text')}</p>
        <Button onClick={handleReloadClick}>{t('common.errorBoundary.reload')}</Button>
      </div>
    </main>
  );
}
