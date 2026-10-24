import { useTranslation } from 'react-i18next';

import { useChatContext } from '../../hooks/useChatContext';
import { ChatHeader } from '../ChatHeader/ChatHeader';
import { MessageList } from '../MessageList/MessageList';

import styles from './ChatPanel.module.css';

// Правая колонка: открытый чат (шапка, переписка, место под поле ввода) или подсказка
export function ChatPanel() {
  const { chats, messages, activeChatId } = useChatContext();
  const { t } = useTranslation();

  const activeChat = activeChatId === null ? undefined : chats[activeChatId];
  const hasActiveChat = activeChat !== undefined;

  return (
    <section className={styles.panel}>
      {hasActiveChat ? (
        <>
          <ChatHeader chat={activeChat} />
          <MessageList chatId={activeChat.chatId} messages={messages[activeChat.chatId] ?? []} />
          {/* Место под поле ввода — этап 6 */}
          <div className={styles.composerSlot} />
        </>
      ) : (
        <div className={styles.empty}>
          <p className={styles.capsule}>{t('pages.chat.selectChat')}</p>
        </div>
      )}
    </section>
  );
}
