import { type ReactNode, useCallback, useEffect, useMemo, useReducer, useState } from 'react';

import { getInstanceStateErrorKey, useAuthContext } from '@/features/auth';

import { useNotificationsPolling } from '../../hooks/useNotificationsPolling';
import type { ChatContextValue, Message, MessageStatus, NewChat } from '../../types/chat.types';
import type { NotificationEvent } from '../../types/notification.types';
import { chatsReducer, createChatsState } from '../../utils/chatsReducer';
import { readStoredChats, writeStoredChats } from '../../utils/chatsStorage';
import { ChatContext } from './ChatContext';

type Props = {
  children: ReactNode;
};

// Чаты и сообщения текущего инстанса. Провайдер живёт только на экране чата: при выходе
// он размонтируется, при входе — монтируется заново и читает чаты своего idInstance.
// При выходе чаты не удаляются — при повторном входе в тот же инстанс история на месте (п. 5.3).
// Здесь же опрос уведомлений: один на экран чата, независимо от выбранного чата (п. 7.4)
export function ChatProvider({ children }: Props) {
  const { credentials, logout } = useAuthContext();

  if (credentials === null) {
    throw new Error('ChatProvider must be rendered only for an authorized user');
  }

  const { idInstance } = credentials;
  const [state, dispatch] = useReducer(chatsReducer, idInstance, (initialIdInstance) =>
    createChatsState(readStoredChats(initialIdInstance)),
  );
  const { chats, messages, activeChatId } = state;
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);

  // dispatch стабилен, поэтому функции создаются один раз — значение контекста мемоизируется (§13)
  const createChat = useCallback((chat: NewChat) => {
    dispatch({ type: 'chatCreated', chat, createdAt: Date.now() });
  }, []);

  const selectChat = useCallback((chatId: string | null) => {
    dispatch({ type: 'chatSelected', chatId });
  }, []);

  const addMessage = useCallback((message: Message) => {
    dispatch({ type: 'messageAdded', message });
  }, []);

  const changeMessageStatus = useCallback(
    (chatId: string, messageId: string, status: MessageStatus) => {
      dispatch({ type: 'messageStatusChanged', chatId, messageId, status });
    },
    [],
  );

  const confirmMessage = useCallback((chatId: string, temporaryId: string, idMessage: string) => {
    dispatch({ type: 'messageConfirmed', chatId, temporaryId, idMessage });
  }, []);

  const markChatRead = useCallback((chatId: string) => {
    dispatch({ type: 'chatRead', chatId });
  }, []);

  // Применение уведомления (п. 7.5). Повторное применение того же уведомления безопасно:
  // сообщения отсекаются по id, повторный failed и выход ничего не меняют
  const handleNotificationEvent = useCallback(
    (event: NotificationEvent) => {
      switch (event.type) {
        case 'messageReceived':
        case 'messageSent':
          dispatch({ type: 'notificationMessageAdded', message: event.message, chat: event.chat });
          break;

        case 'messageFailed':
          dispatch({
            type: 'messageStatusChanged',
            chatId: event.chatId,
            messageId: event.messageId,
            status: 'failed',
          });
          break;

        // Аккаунт MAX разлогинен, инстанс заблокирован и т. п. — работать дальше нельзя
        case 'instanceStateChanged':
          logout(getInstanceStateErrorKey(event.stateInstance));
          break;

        case 'quotaExceeded':
          setIsQuotaExceeded(true);
          break;

        case 'ignored':
          break;
      }
    },
    [logout],
  );

  const { isConnected, error: connectionError } = useNotificationsPolling({
    onEvent: handleNotificationEvent,
  });

  // Смена только activeChatId сохранения не требует, поэтому зависимости — chats и messages
  useEffect(() => {
    writeStoredChats(idInstance, { chats, messages, activeChatId: null });
  }, [idInstance, chats, messages]);

  const value = useMemo<ChatContextValue>(
    () => ({
      chats,
      messages,
      activeChatId,
      isConnected,
      connectionError,
      isQuotaExceeded,
      createChat,
      selectChat,
      addMessage,
      changeMessageStatus,
      confirmMessage,
      markChatRead,
    }),
    [
      chats,
      messages,
      activeChatId,
      isConnected,
      connectionError,
      isQuotaExceeded,
      createChat,
      selectChat,
      addMessage,
      changeMessageStatus,
      confirmMessage,
      markChatRead,
    ],
  );

  return <ChatContext value={value}>{children}</ChatContext>;
}
