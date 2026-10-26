import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/ui/IconButton/IconButton';
import { ArrowDownIcon } from '@/components/ui/icons/ArrowDownIcon';
import type { ErrorMessageKey } from '@/utils/getErrorMessageKey';

import { useAutoScroll } from '../../hooks/useAutoScroll';
import type { Message, OutgoingMessage } from '../../types/chat.types';
import { isSameDay } from '../../utils/formatDate';
import { DateSeparator } from '../DateSeparator/DateSeparator';
import { HistoryStatus } from '../HistoryStatus/HistoryStatus';
import { MessageBubble } from '../MessageBubble/MessageBubble';

import styles from './MessageList.module.css';

type Props = {
  messages: Message[];
  // Последняя ошибка отправки и сообщение этого чата, к которому она относится (п. 6.5)
  sendErrorKey: ErrorMessageKey | null;
  failedMessageId: string | null;
  isRetryDisabled: boolean;
  onRetry: (message: OutgoingMessage) => void;
  // Загрузка истории с сервера (п. 7.10)
  isHistoryLoading: boolean;
  historyErrorKey: ErrorMessageKey | null;
  onHistoryRetry: () => void;
};

// Переписка открытого чата. Прокрутка — useAutoScroll (п. 8.2): компонент монтируется заново
// для каждого чата (key в ChatPanel). Пока пользователь читает историю — кнопка «вниз», как в MAX
export function MessageList({
  messages,
  sendErrorKey,
  failedMessageId,
  isRetryDisabled,
  onRetry,
  isHistoryLoading,
  historyErrorKey,
  onHistoryRetry,
}: Props) {
  const { t } = useTranslation();

  const { scrollRef, isAtBottom, scrollToBottom } = useAutoScroll(messages);
  const hasMessages = messages.length > 0;
  // «Нет сообщений» — только когда история загружена: иначе пустой чат мелькнул бы до её прихода
  const isEmpty = !hasMessages && !isHistoryLoading && historyErrorKey === null;

  return (
    <div className={styles.list}>
      {/* role="log": скринридер озвучивает новые сообщения, не перебивая пользователя.
          tabIndex — переписку можно прокручивать с клавиатуры, даже если в ней нет кнопок */}
      <div
        ref={scrollRef}
        className={styles.scroll}
        role="log"
        aria-label={t('pages.chat.messageListLabel')}
        tabIndex={0}
      >
        <div className={styles.column}>
          <HistoryStatus
            isLoading={isHistoryLoading}
            errorKey={historyErrorKey}
            onRetry={onHistoryRetry}
          />
          {messages.map((message, index) => {
            const previousMessage = messages[index - 1];
            // Сообщения уже в порядке времени (п. 5.3): разделитель перед первым сообщением дня
            const isNewDay =
              previousMessage === undefined ||
              !isSameDay(previousMessage.timestamp, message.timestamp);
            // Блокировка повтора нужна только неотправленным: у остальных пропс не меняется,
            // и мемоизированные пузыри не перерисовываются на каждой отправке (п. 8.9)
            const isFailed = message.direction === 'outgoing' && message.status === 'failed';

            return (
              <Fragment key={message.id}>
                {isNewDay && <DateSeparator timestamp={message.timestamp} />}
                <MessageBubble
                  message={message}
                  errorKey={message.id === failedMessageId ? sendErrorKey : null}
                  isRetryDisabled={isFailed && isRetryDisabled}
                  onRetry={onRetry}
                />
              </Fragment>
            );
          })}
          {isEmpty && <p className={styles.empty}>{t('pages.chat.noMessages')}</p>}
        </div>
      </div>
      {/* Обёртка задаёт положение: у самой кнопки position занят зоной касания (IconButton) */}
      {!isAtBottom && (
        <div className={styles.scrollButton}>
          <IconButton
            label={t('pages.chat.scrollToBottom')}
            icon={<ArrowDownIcon />}
            variant="floating"
            onClick={scrollToBottom}
          />
        </div>
      )}
    </div>
  );
}
