import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/ui/IconButton/IconButton';
import { ArrowLeftIcon } from '@/components/ui/icons/ArrowLeftIcon';

import type { Chat } from '../../types/chat.types';
import { getChatTitle } from '../../utils/getChatTitle';
import { formatPhone } from '../../utils/phone';
import { ChatAvatar } from '../ChatAvatar/ChatAvatar';

import styles from './ChatHeader.module.css';

type Props = {
  chat: Chat;
  onBack: () => void;
};

// Шапка переписки: аватар и имя собеседника. Если есть и имя, и номер — номер подписью ниже.
// Кнопка «Назад» к списку чатов — только на узком экране (п. 8.6), на широком список виден рядом
export function ChatHeader({ chat, onBack }: Props) {
  const { t } = useTranslation();

  const title = getChatTitle(chat) ?? t('pages.chat.unknownContact');
  const subtitle = chat.name && chat.phone ? formatPhone(chat.phone) : null;
  const hasSubtitle = subtitle !== null;

  return (
    <header className={styles.header}>
      <IconButton
        className={styles.back}
        label={t('common.actions.back')}
        icon={<ArrowLeftIcon />}
        onClick={onBack}
      />
      <ChatAvatar name={chat.name} size="header" />
      <div className={styles.info}>
        <h2 className={styles.title}>{title}</h2>
        {hasSubtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
    </header>
  );
}
