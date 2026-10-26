import { useTranslation } from 'react-i18next';

import { VisuallyHidden } from '@/components/ui/VisuallyHidden/VisuallyHidden';
import { joinClassNames } from '@/utils/joinClassNames';

import type { Chat, Message } from '../../types/chat.types';
import { formatChatListTime } from '../../utils/formatDate';
import { getChatTitle } from '../../utils/getChatTitle';
import { ChatAvatar } from '../ChatAvatar/ChatAvatar';

import styles from './ChatListItem.module.css';

type Props = {
  chat: Chat;
  lastMessage?: Message;
  isActive: boolean;
  onSelect: (chatId: string) => void;
};

// Строка списка как в MAX: аватар, имя или номер, превью последнего сообщения, время, непрочитанные.
// data-chat-id — чтобы ChatList вернул фокус на строку закрытого чата (п. 8.7)
export function ChatListItem({ chat, lastMessage, isActive, onSelect }: Props) {
  const { t, i18n } = useTranslation();

  const title = getChatTitle(chat) ?? t('pages.chat.unknownContact');
  const preview = lastMessage?.text ?? t('pages.chat.noMessages');
  const time = formatChatListTime(lastMessage?.timestamp ?? chat.updatedAt, i18n.language);
  const hasUnread = chat.unreadCount > 0;

  function handleClick() {
    onSelect(chat.chatId);
  }

  return (
    <button
      type="button"
      className={joinClassNames(styles.item, isActive && styles.active)}
      aria-current={isActive}
      data-chat-id={chat.chatId}
      onClick={handleClick}
    >
      <span className={styles.avatar}>
        <ChatAvatar name={chat.name} size="list" />
      </span>
      <span className={styles.title}>{title}</span>
      <span className={styles.time}>{time}</span>
      <span className={styles.preview}>{preview}</span>
      {/* Скринридер читает «Непрочитанных: N» вместо голого числа */}
      {hasUnread && (
        <span className={styles.unread}>
          <span aria-hidden>{chat.unreadCount}</span>
          <VisuallyHidden>
            {t('pages.chat.unreadCount', { count: chat.unreadCount })}
          </VisuallyHidden>
        </span>
      )}
    </button>
  );
}
