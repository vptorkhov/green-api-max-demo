import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatContext } from '../../hooks/useChatContext';
import { useChatHistory } from '../../hooks/useChatHistory';
import { useSendMessage } from '../../hooks/useSendMessage';
import { ChatHeader } from '../ChatHeader/ChatHeader';
import { MessageComposer } from '../MessageComposer/MessageComposer';
import { MessageList } from '../MessageList/MessageList';

import styles from './ChatPanel.module.css';

// Правая колонка: открытый чат (шапка, переписка, поле ввода) или подсказка. История открытого
// чата догружается с сервера (п. 7.10).
// Хук отправки — здесь, а не в поле ввода: повтор (п. 6.5) вызывается из пузырей переписки
export function ChatPanel() {
  const { chats, messages, activeChatId } = useChatContext();
  const { isSending, error, failedMessage, sendMessage, retryMessage } = useSendMessage();
  const {
    isLoading: isHistoryLoading,
    error: historyError,
    retryHistory,
  } = useChatHistory(activeChatId);
  const { t } = useTranslation();

  const activeChat = activeChatId === null ? undefined : chats[activeChatId];
  const hasActiveChat = activeChat !== undefined;
  // Причина ошибки показывается, только если сообщение — в открытом чате
  const failedMessageId =
    failedMessage !== null && failedMessage.chatId === activeChatId
      ? failedMessage.messageId
      : null;

  // Чат берётся в момент отправки: ответ придёт в свой чат, даже если пользователь переключится
  function handleSend(text: string) {
    if (activeChat !== undefined) {
      void sendMessage(activeChat.chatId, text);
    }
  }

  function handleRetry(messageId: string) {
    if (activeChat !== undefined) {
      void retryMessage(activeChat.chatId, messageId);
    }
  }

  return (
    <section className={styles.panel}>
      {hasActiveChat ? (
        // key: для каждого чата шапка, переписка и поле ввода монтируются заново — прокрутка
        // начинается с конца (п. 8.2), поле очищается и получает фокус (черновики не храним).
        // Один key на всю группу: у соседних элементов ключи не должны повторяться
        <Fragment key={activeChat.chatId}>
          <ChatHeader chat={activeChat} />
          <MessageList
            messages={messages[activeChat.chatId] ?? []}
            sendErrorKey={error}
            failedMessageId={failedMessageId}
            isRetryDisabled={isSending}
            onRetry={handleRetry}
            isHistoryLoading={isHistoryLoading}
            historyErrorKey={historyError}
            onHistoryRetry={retryHistory}
          />
          <MessageComposer isSending={isSending} onSend={handleSend} />
        </Fragment>
      ) : (
        <div className={styles.empty}>
          <p className={styles.capsule}>{t('pages.chat.selectChat')}</p>
        </div>
      )}
    </section>
  );
}
