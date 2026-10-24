import { useTranslation } from 'react-i18next';

import type { Chat } from '../../types/chat.types';
import { getChatTitle } from '../../utils/getChatTitle';
import { formatPhone } from '../../utils/phone';
import { ChatAvatar } from '../ChatAvatar/ChatAvatar';

import styles from './ChatHeader.module.css';

type Props = {
  chat: Chat;
};

// Шапка переписки: аватар и имя собеседника. Если есть и имя, и номер — номер подписью ниже.
// Кнопка «Назад» для узкого экрана добавляется на этапе 8
export function ChatHeader({ chat }: Props) {
  const { t } = useTranslation();

  const title = getChatTitle(chat) ?? t('pages.chat.unknownContact');
  const subtitle = chat.name && chat.phone ? formatPhone(chat.phone) : null;
  const hasSubtitle = subtitle !== null;

  return (
    <header className={styles.header}>
      <ChatAvatar name={chat.name} size="header" />
      <div className={styles.info}>
        <h2 className={styles.title}>{title}</h2>
        {hasSubtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </header>
  );
}
