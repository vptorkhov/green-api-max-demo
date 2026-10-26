import { isBoolean, isNumber, isRecord, isString } from '@/utils/typeGuards';

import type { Chat, Message, MessageStatus, StoredChats } from '../types/chat.types';
import type {
  ChatHistoryItem,
  CheckAccountResponse,
  DeleteNotificationResponse,
  GetSettingsResponse,
  SendMessageResponse,
} from '../types/greenApiChat.types';
import { NOTIFICATION_SETTING_KEYS } from './getDisabledNotificationSettings';

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

// Ответ checkAccount. exist: true с пустым chatId — неожиданный ответ: такой чат нельзя открыть
export function isCheckAccountResponse(value: unknown): value is CheckAccountResponse {
  return (
    isRecord(value) &&
    isBoolean(value.exist) &&
    isString(value.chatId) &&
    isBoolean(value.fromCache) &&
    (!value.exist || value.chatId !== '')
  );
}

// Ответ sendMessage. Пустой idMessage — неожиданный ответ: им подменяется временный id сообщения (п. 6.2)
export function isSendMessageResponse(value: unknown): value is SendMessageResponse {
  return isRecord(value) && isString(value.idMessage) && value.idMessage !== '';
}

export function isDeleteNotificationResponse(value: unknown): value is DeleteNotificationResponse {
  return isRecord(value) && isBoolean(value.result);
}

// Ответ getSettings: проверяются только флаги уведомлений, остальные поля не используются
export function isGetSettingsResponse(value: unknown): value is GetSettingsResponse {
  return isRecord(value) && NOTIFICATION_SETTING_KEYS.every((key) => isString(value[key]));
}

// Ответ getChatHistory — массив. Элементы проверяются по одному (isChatHistoryItem): битый элемент
// пропускается при маппинге, а не роняет загрузку всей истории
export function isChatHistoryResponse(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isChatHistoryItem(value: unknown): value is ChatHistoryItem {
  return (
    isRecord(value) &&
    (value.type === 'incoming' || value.type === 'outgoing') &&
    isString(value.idMessage) &&
    value.idMessage !== '' &&
    isNumber(value.timestamp) &&
    isString(value.typeMessage) &&
    isString(value.chatId) &&
    isString(value.chatType) &&
    isOptionalString(value.textMessage) &&
    (value.isDeleted === undefined || isBoolean(value.isDeleted))
  );
}
