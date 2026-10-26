import { useTranslation } from 'react-i18next';

import { VisuallyHidden } from '@/components/ui/VisuallyHidden/VisuallyHidden';
import { joinClassNames } from '@/utils/joinClassNames';

import { MESSAGE_STATUS_ICONS } from '../../constants/messageStatusIcons';
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

// Строка списка как в MAX: аватар, имя или номер, превью последнего сообщения, время (со статусом
// последнего исходящего), непрочитанные.
// data-chat-id — чтобы ChatList вернул фокус на строку закрытого чата (п. 8.7)
export function ChatListItem({ chat, lastMessage, isActive, onSelect }: Props) {
  const { t, i18n } = useTranslation();

  const title = getChatTitle(chat) ?? t('pages.chat.unknownContact');
  const preview = lastMessage?.text ?? t('pages.chat.noMessages');
  const time = formatChatListTime(lastMessage?.timestamp ?? chat.updatedAt, i18n.language);
  const hasUnread = chat.unreadCount > 0;
  // Статус — только если последнее сообщение наше, как в MAX (п. 8.8)
  const status = lastMessage?.direction === 'outgoing' ? lastMessage.status : null;
  const StatusIcon = status === null ? null : MESSAGE_STATUS_ICONS[status];
  const statusLabel = status === null ? '' : t(`pages.chat.messageStatus.${status}`);
  const hasStatus = StatusIcon !== null;
  const isFailed = status === 'failed';

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
      <span className={styles.time}>
        {hasStatus && (
          <span
            className={joinClassNames(styles.status, isFailed && styles.statusFailed)}
            role="img"
            aria-label={statusLabel}
          >
            <StatusIcon />
          </span>
        )}
        {time}
      </span>
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
