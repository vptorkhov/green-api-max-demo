import type { Chat, ChatsAction, ChatsState, Message, StoredChats } from '../types/chat.types';

export function createChatsState(stored: StoredChats | null): ChatsState {
  return {
    chats: stored?.chats ?? {},
    messages: stored?.messages ?? {},
    activeChatId: null,
  };
}

// Сообщения чата держатся в порядке времени; обычно новое — последнее, поэтому поиск места с конца
function insertByTimestamp(messages: Message[], message: Message) {
  const insertIndex = messages.findLastIndex(({ timestamp }) => timestamp <= message.timestamp) + 1;

  return [...messages.slice(0, insertIndex), message, ...messages.slice(insertIndex)];
}

function createChat(chatId: string, updatedAt: number): Chat {
  return { chatId, updatedAt, unreadCount: 0 };
}

// Необязательные поля без значения не записываются: JSON их всё равно отбросит,
// и состояние после перезагрузки должно совпадать с исходным
function withChatDetails(chat: Chat, { phone, name }: Pick<Chat, 'phone' | 'name'>): Chat {
  return {
    ...chat,
    ...(phone === undefined ? {} : { phone }),
    ...(name === undefined ? {} : { name }),
  };
}

// Чистый reducer. Если действие ничего не меняет, возвращается то же состояние —
// без новой ссылки потребители контекста не перерисовываются
export function chatsReducer(state: ChatsState, action: ChatsAction): ChatsState {
  switch (action.type) {
    // Повторное создание не дублирует чат, а открывает его и дописывает недостающие phone / name
    // (собеседник мог написать первым — п. 5.5)
    case 'chatCreated': {
      const { chat: newChat, createdAt } = action;
      const existingChat = state.chats[newChat.chatId];
      const chat = withChatDetails(existingChat ?? createChat(newChat.chatId, createdAt), {
        phone: existingChat?.phone ?? newChat.phone,
        name: existingChat?.name ?? newChat.name,
      });

      return {
        ...state,
        chats: { ...state.chats, [chat.chatId]: chat },
        activeChatId: chat.chatId,
      };
    }

    // Открыть чат — значит прочитать его
    case 'chatSelected': {
      const { chatId } = action;
      const chat = chatId === null ? undefined : state.chats[chatId];
      const hasUnread = chat !== undefined && chat.unreadCount > 0;

      if (state.activeChatId === chatId && !hasUnread) {
        return state;
      }

      return {
        ...state,
        chats: hasUnread
          ? { ...state.chats, [chat.chatId]: { ...chat, unreadCount: 0 } }
          : state.chats,
        activeChatId: chatId,
      };
    }

    // idMessage уникален только в пределах чата, поэтому дубль ищется среди сообщений этого чата.
    // Чата может не быть — собеседник написал первым (этап 7): он создаётся
    case 'messageAdded': {
      const { message } = action;
      const chatMessages = state.messages[message.chatId] ?? [];

      if (chatMessages.some(({ id }) => id === message.id)) {
        return state;
      }

      const chat = state.chats[message.chatId] ?? createChat(message.chatId, message.timestamp);
      const isUnread = message.direction === 'incoming' && state.activeChatId !== message.chatId;

      return {
        ...state,
        chats: {
          ...state.chats,
          [chat.chatId]: {
            ...chat,
            updatedAt: Math.max(chat.updatedAt, message.timestamp),
            unreadCount: isUnread ? chat.unreadCount + 1 : chat.unreadCount,
          },
        },
        messages: { ...state.messages, [chat.chatId]: insertByTimestamp(chatMessages, message) },
      };
    }

    // Статус есть только у исходящих; неизвестное сообщение или тот же статус — без изменений
    case 'messageStatusChanged': {
      const { chatId, messageId, status } = action;
      const chatMessages = state.messages[chatId] ?? [];
      const message = chatMessages.find(({ id }) => id === messageId);

      if (message?.direction !== 'outgoing' || message.status === status) {
        return state;
      }

      return {
        ...state,
        messages: {
          ...state.messages,
          [chatId]: chatMessages.map((item) => (item === message ? { ...message, status } : item)),
        },
      };
    }

    case 'chatRead': {
      const chat = state.chats[action.chatId];

      if (chat === undefined || chat.unreadCount === 0) {
        return state;
      }

      return { ...state, chats: { ...state.chats, [chat.chatId]: { ...chat, unreadCount: 0 } } };
    }
  }
}
