import { type ReactNode, useCallback, useEffect, useMemo, useReducer } from 'react';

import { useAuthContext } from '@/features/auth';

import type { ChatContextValue, Message, MessageStatus, NewChat } from '../../types/chat.types';
import { chatsReducer, createChatsState } from '../../utils/chatsReducer';
import { readStoredChats, writeStoredChats } from '../../utils/chatsStorage';
import { ChatContext } from './ChatContext';

type Props = {
  children: ReactNode;
};

// Чаты и сообщения текущего инстанса. Провайдер живёт только на экране чата: при выходе
// он размонтируется, при входе — монтируется заново и читает чаты своего idInstance.
// При выходе чаты не удаляются — при повторном входе в тот же инстанс история на месте (п. 5.3)
export function ChatProvider({ children }: Props) {
  const { credentials } = useAuthContext();

  if (credentials === null) {
    throw new Error('ChatProvider must be rendered only for an authorized user');
  }

  const { idInstance } = credentials;
  const [state, dispatch] = useReducer(chatsReducer, idInstance, (initialIdInstance) =>
    createChatsState(readStoredChats(initialIdInstance)),
  );
  const { chats, messages, activeChatId } = state;

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

  const markChatRead = useCallback((chatId: string) => {
    dispatch({ type: 'chatRead', chatId });
  }, []);

  // Смена только activeChatId сохранения не требует, поэтому зависимости — chats и messages
  useEffect(() => {
    writeStoredChats(idInstance, { chats, messages, activeChatId: null });
  }, [idInstance, chats, messages]);

  const value = useMemo<ChatContextValue>(
    () => ({
      chats,
      messages,
      activeChatId,
      createChat,
      selectChat,
      addMessage,
      changeMessageStatus,
      markChatRead,
    }),
    [
      chats,
      messages,
      activeChatId,
      createChat,
      selectChat,
      addMessage,
      changeMessageStatus,
      markChatRead,
    ],
  );

  return <ChatContext value={value}>{children}</ChatContext>;
}
