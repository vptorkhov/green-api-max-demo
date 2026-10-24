import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatContext } from '../../hooks/useChatContext';
import { ChatListItem } from '../ChatListItem/ChatListItem';

import styles from './ChatList.module.css';

// Список чатов, свежие сверху
export function ChatList() {
  const { chats, messages, activeChatId, selectChat } = useChatContext();
  const { t } = useTranslation();

  // useMemo: chats меняется при каждом сообщении, а сортировка нужна только при его изменении (§13)
  const sortedChats = useMemo(
    () => Object.values(chats).toSorted((first, second) => second.updatedAt - first.updatedAt),
    [chats],
  );
  const hasChats = sortedChats.length > 0;

  if (!hasChats) {
    return <p className={styles.empty}>{t('pages.chat.emptyList')}</p>;
  }

  return (
    <ul className={styles.list}>
      {sortedChats.map((chat) => (
        <li key={chat.chatId}>
          <ChatListItem
            chat={chat}
            lastMessage={messages[chat.chatId]?.at(-1)}
            isActive={chat.chatId === activeChatId}
            onSelect={selectChat}
          />
        </li>
      ))}
    </ul>
  );
}
