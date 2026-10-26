import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ErrorMessage } from '@/components/ui/ErrorMessage/ErrorMessage';
import { IconButton } from '@/components/ui/IconButton/IconButton';
import { LogoutIcon } from '@/components/ui/icons/LogoutIcon';
import { PlusIcon } from '@/components/ui/icons/PlusIcon';
import { useAuthContext } from '@/features/auth';
import { useReturnFocusOnClose } from '@/hooks/useReturnFocusOnClose';
import { joinClassNames } from '@/utils/joinClassNames';

import { useChatContext } from '../../hooks/useChatContext';
import { useNotificationSettingsCheck } from '../../hooks/useNotificationSettingsCheck';
import { ChatList } from '../ChatList/ChatList';
import { NewChatPanel } from '../NewChatPanel/NewChatPanel';
import { SettingsMenu } from '../SettingsMenu/SettingsMenu';

import styles from './ChatSidebar.module.css';

// Левая колонка: шапка «Чаты» с кнопками и список. Кнопка «+» открывает панель «Найти по номеру»
// поверх списка — меню MAX (группа, канал, звонок…) не нужно, сценарий у нас один (п. 5.5).
// Индикатор соединения (п. 7.6): при ошибке опроса заголовок уменьшается и под ним строка
// «Нет соединения…», как в MAX; причина — блоком под шапкой. В нормальном состоянии ничего нет.
// Там же предупреждение о выключенных уведомлениях в настройках инстанса (п. 7.7).
// На узком экране колонка скрыта, пока открыт чат (п. 8.6)
export function ChatSidebar() {
  const { logout } = useAuthContext();
  const { activeChatId, connectionError, isQuotaExceeded } = useChatContext();
  const { disabledSettings } = useNotificationSettingsCheck();
  const { t } = useTranslation();

  const newChatButtonRef = useRef<HTMLButtonElement>(null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  // Ошибка опроса сбрасывается первым успешным запросом — пока она есть, идёт переподключение
  const isReconnecting = connectionError !== null;
  const hasActiveChat = activeChatId !== null;

  // «Назад» и Escape в панели «Найти по номеру» возвращают фокус на «+». После создания чата
  // фокус уже в поле ввода открытого чата — хук его не трогает
  const getNewChatButton = useCallback(() => newChatButtonRef.current, []);
  useReturnFocusOnClose(isNewChatOpen, getNewChatButton);

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
    <aside className={joinClassNames(styles.sidebar, hasActiveChat && styles.withActiveChat)}>
      {isNewChatOpen ? (
        <NewChatPanel onClose={handleNewChatClose} />
      ) : (
        <>
          <header className={joinClassNames(styles.header, isReconnecting && styles.reconnecting)}>
            <div className={styles.info}>
              <h1 className={styles.title}>{t('pages.chat.title')}</h1>
              {isReconnecting && (
                <p className={styles.connectionStatus}>{t('pages.chat.connection.reconnecting')}</p>
              )}
            </div>
            <SettingsMenu />
            <IconButton
              ref={newChatButtonRef}
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
          {connectionError !== null && (
            <ErrorMessage className={styles.alert} message={t(connectionError)} />
          )}
          {/* Лимит тарифа держится до конца сессии: соединение при этом в порядке (п. 7.5) */}
          {isQuotaExceeded && (
            <ErrorMessage className={styles.alert} message={t('common.errors.quotaExceeded')} />
          )}
          {disabledSettings.length > 0 && (
            <ErrorMessage
              className={styles.alert}
              message={t('pages.chat.notificationSettings.disabled', {
                settings: disabledSettings.map((key) =>
                  t(`pages.chat.notificationSettings.names.${key}`),
                ),
              })}
            />
          )}
          <ChatList />
        </>
      )}
    </aside>
  );
}
