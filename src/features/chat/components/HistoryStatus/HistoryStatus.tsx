import { useTranslation } from 'react-i18next';

import { Spinner } from '@/components/ui/Spinner/Spinner';
import type { ErrorMessageKey } from '@/utils/getErrorMessageKey';

import styles from './HistoryStatus.module.css';

type Props = {
  isLoading: boolean;
  errorKey: ErrorMessageKey | null;
  onRetry: () => void;
};

// Загрузка истории чата (п. 7.10) — капсула вверху переписки, как разделитель дат в MAX.
// При ошибке — причина и «Повторить», как у неотправленного сообщения (п. 6.5)
export function HistoryStatus({ isLoading, errorKey, onRetry }: Props) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <p className={styles.capsule} role="status">
        <Spinner className={styles.spinner} />
        {t('pages.chat.history.loading')}
      </p>
    );
  }

  if (errorKey === null) {
    return null;
  }

  return (
    <div className={styles.capsule} role="alert">
      <p className={styles.text}>
        {t('pages.chat.history.error')}
        <span className={styles.reason}>{t(errorKey)}</span>
      </p>
      <button type="button" className={styles.retry} onClick={onRetry}>
        {t('common.actions.retry')}
      </button>
    </div>
  );
}
