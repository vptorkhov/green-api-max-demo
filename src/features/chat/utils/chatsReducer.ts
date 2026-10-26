import { ORPHAN_MESSAGE_MATCH_WINDOW_MS } from '@/constants/greenApi';

import type {
  Chat,
  ChatsAction,
  ChatsState,
  Message,
  NewChat,
  OutgoingMessage,
  StoredChats,
} from '../types/chat.types';
import { isTemporaryMessageId } from './messageId';

// Сохранённое sending — запрос оборвался перезагрузкой, ответа уже не будет. Результат неизвестен,
// поэтому failed: пользователь может повторить (решение разработчика в 6.2). Если сообщение
// на самом деле ушло, копию уберёт уведомление об исходящем (п. 7.5)
function failInterruptedMessage(message: Message): Message {
  return message.direction === 'outgoing' && message.status === 'sending'
    ? { ...message, status: 'failed' }
    : message;
}

export function createChatsState(stored: StoredChats | null): ChatsState {
  const messages = Object.fromEntries(
    Object.entries(stored?.messages ?? {}).map(([chatId, chatMessages]) => [
      chatId,
      chatMessages.map(failInterruptedMessage),
    ]),
  );

  return {
    chats: stored?.chats ?? {},
    messages,
    activeChatId: null,
  };
}

// Сообщения чата держатся в порядке времени; обычно новое — последнее, поэтому поиск места с конца
function insertByTimestamp(messages: Message[], message: Message) {
  const insertIndex = messages.findLastIndex(({ timestamp }) => timestamp <= message.timestamp) + 1;

  return [...messages.slice(0, insertIndex), message, ...messages.slice(insertIndex)];
}

function createEmptyChat(chatId: string, updatedAt: number): Chat {
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

// Добавляет сообщение (дубль уже отсечён). Чата может не быть — собеседник написал первым (этап 7):
// он создаётся. Входящее в неактивный чат — непрочитанное; чат поднимается вверх списка
function addMessageToChat(
  state: ChatsState,
  message: Message,
  chatMessages: Message[],
  details: Pick<NewChat, 'phone' | 'name'> = {},
): ChatsState {
  const existingChat = state.chats[message.chatId];
  const chat = withChatDetails(existingChat ?? createEmptyChat(message.chatId, message.timestamp), {
    phone: existingChat?.phone ?? details.phone,
    name: existingChat?.name ?? details.name,
  });
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

// «Осиротевшая» копия (решение разработчика в 6.2): failed с временным id — запрос оборвался
// перезагрузкой или ошибкой, но сообщение могло уйти. Тот же текст, время в пределах окна;
// из нескольких — самая ранняя: одно уведомление убирает одну копию, и «ок», «ок» подряд
// не схлопываются. sending не трогаем — его закроет messageConfirmed (п. 6.2)
function findOrphanMessage(chatMessages: Message[], sentMessage: OutgoingMessage) {
  return chatMessages.find(
    (item) =>
      item.direction === 'outgoing' &&
      item.status === 'failed' &&
      isTemporaryMessageId(item.id) &&
      item.text === sentMessage.text &&
      Math.abs(item.timestamp - sentMessage.timestamp) <= ORPHAN_MESSAGE_MATCH_WINDOW_MS,
  );
}

// Время сервера — источник правды (решение разработчика в 7.9). У своего сообщения до уведомления
// время клиента: если часы компьютера спешат, ответ собеседника встал бы выше вопроса. Сообщение
// переставляется на место по времени сервера; если время чата задано этим сообщением — оно тоже
function adoptServerTimestamp(
  state: ChatsState,
  message: Message,
  serverTimestamp: number,
): ChatsState {
  const chat = state.chats[message.chatId];

  if (message.timestamp === serverTimestamp || chat === undefined) {
    return state;
  }

  const chatMessages = insertByTimestamp(
    (state.messages[message.chatId] ?? []).filter((item) => item !== message),
    { ...message, timestamp: serverTimestamp },
  );
  const isChatTimeFromMessage = chat.updatedAt === message.timestamp;
  const lastTimestamp = chatMessages.at(-1)?.timestamp ?? serverTimestamp;

  return {
    ...state,
    chats: isChatTimeFromMessage
      ? { ...state.chats, [chat.chatId]: { ...chat, updatedAt: lastTimestamp } }
      : state.chats,
    messages: { ...state.messages, [chat.chatId]: chatMessages },
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
      const chat = withChatDetails(existingChat ?? createEmptyChat(newChat.chatId, createdAt), {
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

    // idMessage уникален только в пределах чата, поэтому дубль ищется среди сообщений этого чата
    case 'messageAdded': {
      const { message } = action;
      const chatMessages = state.messages[message.chatId] ?? [];

      if (chatMessages.some(({ id }) => id === message.id)) {
        return state;
      }

      return addMessageToChat(state, message, chatMessages);
    }

    // Сообщение из уведомления (п. 7.5). Уже есть с тем же id — меняется только время (см.
    // adoptServerTimestamp): своё сообщение после ответа sendMessage уже sent, а failed
    // из outgoingMessageStatus новее уведомления. Исходящее убирает свою «осиротевшую» копию failed;
    // чата нет — создаётся с phone / name
    case 'notificationMessageAdded': {
      const { message, chat } = action;
      const chatMessages = state.messages[message.chatId] ?? [];
      const existingMessage = chatMessages.find(({ id }) => id === message.id);

      if (existingMessage !== undefined) {
        return adoptServerTimestamp(state, existingMessage, message.timestamp);
      }

      const orphanMessage =
        message.direction === 'outgoing' ? findOrphanMessage(chatMessages, message) : undefined;

      return addMessageToChat(
        state,
        message,
        chatMessages.filter((item) => item !== orphanMessage),
        chat,
      );
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

    // Временный id → idMessage, статус sent. Замена id обязательна: уведомление об этом же сообщении
    // (этап 7) придёт с idMessage, и дедупликация не даст ему задвоиться.
    // Гонка: уведомление пришло раньше ответа и сообщение с idMessage уже есть — временное удаляется
    case 'messageConfirmed': {
      const { chatId, temporaryId, idMessage } = action;
      const chatMessages = state.messages[chatId] ?? [];
      const message = chatMessages.find(({ id }) => id === temporaryId);

      if (message?.direction !== 'outgoing') {
        return state;
      }

      const isAlreadyAdded = chatMessages.some(({ id }) => id === idMessage);
      const confirmedMessages = isAlreadyAdded
        ? chatMessages.filter((item) => item !== message)
        : chatMessages.map((item) =>
            item === message ? { ...message, id: idMessage, status: 'sent' as const } : item,
          );

      return { ...state, messages: { ...state.messages, [chatId]: confirmedMessages } };
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
