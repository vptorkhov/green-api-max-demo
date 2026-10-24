import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/ui/IconButton/IconButton';
import { LogoutIcon } from '@/components/ui/icons/LogoutIcon';
import { PlusIcon } from '@/components/ui/icons/PlusIcon';
import { useAuthContext } from '@/features/auth';

import { ChatList } from '../ChatList/ChatList';
import { NewChatPanel } from '../NewChatPanel/NewChatPanel';

import styles from './ChatSidebar.module.css';

// Левая колонка: шапка «Чаты» с кнопками и список. Кнопка «+» открывает панель «Найти по номеру»
// поверх списка — меню MAX (группа, канал, звонок…) не нужно, сценарий у нас один (п. 5.5)
export function ChatSidebar() {
  const { logout } = useAuthContext();
  const { t } = useTranslation();

  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  function handleLogoutClick() {
    logout();
  }

  function handleNewChatOpen() {
    setIsNewChatOpen(true);
  }

  function handleNewChatClose() {
    setIsNewChatOpen(false);
  }

  return (
    <aside className={styles.sidebar}>
      {isNewChatOpen ? (
        <NewChatPanel onClose={handleNewChatClose} />
      ) : (
        <>
          <header className={styles.header}>
            <h1 className={styles.title}>{t('pages.chat.title')}</h1>
            <IconButton
              label={t('pages.chat.newChat')}
              icon={<PlusIcon />}
              variant="primary"
              size="small"
              onClick={handleNewChatOpen}
            />
            <IconButton
              label={t('common.actions.logout')}
              icon={<LogoutIcon />}
              onClick={handleLogoutClick}
            />
          </header>
          <ChatList />
        </>
      )}
    </aside>
  );
}
