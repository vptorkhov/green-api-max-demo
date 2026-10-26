import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { ErrorMessageKey } from '@/utils/getErrorMessageKey';

import type { Message } from '../../types/chat.types';
import { HistoryStatus } from '../HistoryStatus/HistoryStatus';
import { MessageBubble } from '../MessageBubble/MessageBubble';

import styles from './MessageList.module.css';

type Props = {
  chatId: string;
  messages: Message[];
  // Последняя ошибка отправки и сообщение этого чата, к которому она относится (п. 6.5)
  sendErrorKey: ErrorMessageKey | null;
  failedMessageId: string | null;
  isRetryDisabled: boolean;
  onRetry: (messageId: string) => void;
  // Загрузка истории с сервера (п. 7.10)
  isHistoryLoading: boolean;
  historyErrorKey: ErrorMessageKey | null;
  onHistoryRetry: () => void;
};

// Переписка открытого чата. «Умная» прокрутка (не уводить вниз, если читают историю) — этап 8
export function MessageList({
  chatId,
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;
  // «Нет сообщений» — только когда история загружена: иначе пустой чат мелькнул бы до её прихода
  const isEmpty = !hasMessages && !isHistoryLoading && historyErrorKey === null;

  // При открытии чата и новом сообщении — к последнему сообщению
  useEffect(() => {
    const scrollElement = scrollRef.current;

    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [chatId, messages.length]);

  return (
    <div ref={scrollRef} className={styles.scroll}>
      <div className={styles.column}>
        <HistoryStatus
          isLoading={isHistoryLoading}
          errorKey={historyErrorKey}
          onRetry={onHistoryRetry}
        />
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            errorKey={message.id === failedMessageId ? sendErrorKey : null}
            isRetryDisabled={isRetryDisabled}
            onRetry={onRetry}
          />
        ))}
        {isEmpty && <p className={styles.empty}>{t('pages.chat.noMessages')}</p>}
      </div>
    </div>
  );
}
