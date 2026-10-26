import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { useReturnFocusOnClose } from '@/hooks/useReturnFocusOnClose';

import { useChatContext } from '../../hooks/useChatContext';
import { ChatListItem } from '../ChatListItem/ChatListItem';

import styles from './ChatList.module.css';

// Список чатов, свежие сверху
export function ChatList() {
  const { chats, messages, activeChatId, selectChat } = useChatContext();
  const { t } = useTranslation();

  const listRef = useRef<HTMLUListElement>(null);
  const lastActiveChatIdRef = useRef(activeChatId);

  // useMemo: chats меняется при каждом сообщении, а сортировка нужна только при его изменении (§13)
  const sortedChats = useMemo(
    () => Object.values(chats).toSorted((first, second) => second.updatedAt - first.updatedAt),
    [chats],
  );
  const hasChats = sortedChats.length > 0;

  // Последний открытый чат: при закрытии activeChatId уже null. Эффект объявлен раньше
  // useReturnFocusOnClose и выполняется раньше него
  useEffect(() => {
    if (activeChatId !== null) {
      lastActiveChatIdRef.current = activeChatId;
    }
  }, [activeChatId]);

  // «Назад» на узком экране исчезает вместе с перепиской — фокус переходит на строку закрытого чата
  const getClosedChatItem = useCallback(() => {
    const chatId = lastActiveChatIdRef.current;

    return chatId === null
      ? null
      : listRef.current?.querySelector<HTMLElement>(`[data-chat-id="${CSS.escape(chatId)}"]`);
  }, []);

  useReturnFocusOnClose(activeChatId !== null, getClosedChatItem);

  if (!hasChats) {
    return <p className={styles.empty}>{t('pages.chat.emptyList')}</p>;
  }

  return (
    <ul ref={listRef} className={styles.list}>
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
