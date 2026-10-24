import { isNumber, isRecord, isString } from '@/utils/typeGuards';

import type { Chat, Message, MessageStatus, StoredChats } from '../types/chat.types';

// Record по всем значениям MessageStatus: забытый статус — ошибка TypeScript
const KNOWN_MESSAGE_STATUSES: Record<MessageStatus, true> = {
  sending: true,
  sent: true,
  failed: true,
};

function isOptionalString(value: unknown) {
  return value === undefined || isString(value);
}

function isMessageStatus(value: unknown): value is MessageStatus {
  return isString(value) && Object.hasOwn(KNOWN_MESSAGE_STATUSES, value);
}

export function isChat(value: unknown): value is Chat {
  return (
    isRecord(value) &&
    isString(value.chatId) &&
    isOptionalString(value.phone) &&
    isOptionalString(value.name) &&
    isNumber(value.updatedAt) &&
    isNumber(value.unreadCount)
  );
}

export function isMessage(value: unknown): value is Message {
  if (
    !isRecord(value) ||
    !isString(value.id) ||
    !isString(value.chatId) ||
    !isString(value.text) ||
    !isNumber(value.timestamp)
  ) {
    return false;
  }

  if (value.direction === 'incoming') {
    return true;
  }

  return value.direction === 'outgoing' && isMessageStatus(value.status);
}

// Чаты из localStorage: ключ записи должен совпадать с chatId внутри, иначе данные подменены
export function isStoredChats(value: unknown): value is StoredChats {
  if (!isRecord(value) || !isRecord(value.chats) || !isRecord(value.messages)) {
    return false;
  }

  const areChatsValid = Object.entries(value.chats).every(
    ([chatId, chat]) => isChat(chat) && chat.chatId === chatId,
  );
  const areMessagesValid = Object.entries(value.messages).every(
    ([chatId, messages]) =>
      Array.isArray(messages) &&
      messages.every((message) => isMessage(message) && message.chatId === chatId),
  );

  return areChatsValid && areMessagesValid;
}
