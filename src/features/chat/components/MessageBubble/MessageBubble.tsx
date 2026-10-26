import { useTranslation } from 'react-i18next';

import { AlertIcon } from '@/components/ui/icons/AlertIcon';
import { CheckIcon } from '@/components/ui/icons/CheckIcon';
import { ClockIcon } from '@/components/ui/icons/ClockIcon';
import type { ErrorMessageKey } from '@/utils/getErrorMessageKey';
import { joinClassNames } from '@/utils/joinClassNames';

import type { Message, MessageStatus } from '../../types/chat.types';
import { formatMessageTime } from '../../utils/formatTime';

import styles from './MessageBubble.module.css';

// Record по всем статусам: забытый статус — ошибка TypeScript
const STATUS_ICONS: Record<MessageStatus, typeof CheckIcon> = {
  sending: ClockIcon,
  sent: CheckIcon,
  failed: AlertIcon,
};

type Props = {
  message: Message;
  // Причина ошибки — только у сообщения, отправка которого провалилась последней (п. 6.5)
  errorKey: ErrorMessageKey | null;
  // Повтор блокируется, пока отправляется другое сообщение (п. 6.3)
  isRetryDisabled: boolean;
  onRetry: (messageId: string) => void;
};

// Пузырь сообщения: входящие слева, исходящие справа, время внутри справа снизу.
// У исходящего рядом со временем статус: часы, галочка или ошибка. Под неотправленным —
// «Не отправлено», причина (если известна) и «Повторить»
export function MessageBubble({ message, errorKey, isRetryDisabled, onRetry }: Props) {
  const { t, i18n } = useTranslation();

  const isOutgoing = message.direction === 'outgoing';
  const status = isOutgoing ? message.status : null;
  const StatusIcon = status === null ? null : STATUS_ICONS[status];
  const statusLabel = status === null ? '' : t(`pages.chat.messageStatus.${status}`);
  const hasStatus = StatusIcon !== null;
  const isFailed = status === 'failed';
  const errorMessage = errorKey ? t(errorKey) : null;
  const hasErrorMessage = errorMessage !== null;
  const time = formatMessageTime(message.timestamp, i18n.language);
  const dateTime = new Date(message.timestamp).toISOString();

  function handleRetryClick() {
    onRetry(message.id);
  }

  return (
    <div className={joinClassNames(styles.row, isOutgoing && styles.rowOutgoing)}>
      <div
        className={joinClassNames(styles.bubble, isOutgoing ? styles.outgoing : styles.incoming)}
      >
        <p className={styles.text}>
          {message.text}
          <span className={styles.meta}>
            <time dateTime={dateTime}>{time}</time>
            {hasStatus && (
              <span
                className={joinClassNames(styles.status, isFailed && styles.statusFailed)}
                role="img"
                aria-label={statusLabel}
              >
                <StatusIcon />
              </span>
            )}
          </span>
        </p>
      </div>
      {isFailed && (
        <div className={styles.failure}>
          <p className={styles.failureText}>
            {t('pages.chat.messageStatus.failed')}
            {hasErrorMessage && <span className={styles.failureReason}>{errorMessage}</span>}
          </p>
          <button
            type="button"
            className={styles.retry}
            disabled={isRetryDisabled}
            onClick={handleRetryClick}
          >
            {t('common.actions.retry')}
          </button>
        </div>
      )}
    </div>
  );
}
