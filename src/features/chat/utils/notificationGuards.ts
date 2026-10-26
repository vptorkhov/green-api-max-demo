import { isInstanceState } from '@/features/auth';
import { isNumber, isRecord, isString } from '@/utils/typeGuards';

import type {
  MessageNotification,
  MessageTypeWebhook,
  OutgoingMessageStatus,
  OutgoingMessageStatusNotification,
  QuotaExceededNotification,
  ReceiveNotificationResponse,
  SenderData,
  StateInstanceChangedNotification,
  TextMessageData,
} from '../types/notification.types';

// Record по всем значениям: забытое значение — ошибка TypeScript
const MESSAGE_TYPE_WEBHOOKS: Record<MessageTypeWebhook, true> = {
  incomingMessageReceived: true,
  outgoingMessageReceived: true,
  outgoingAPIMessageReceived: true,
};

const OUTGOING_MESSAGE_STATUSES: Record<OutgoingMessageStatus, true> = {
  delivered: true,
  read: true,
  failed: true,
  noAccount: true,
  notInGroup: true,
};

function isOptionalString(value: unknown) {
  return value === undefined || isString(value);
}

function isOptionalNumber(value: unknown) {
  return value === undefined || isNumber(value);
}

// null — очередь пуста. receiptId обязателен: без него уведомление нельзя удалить
export function isReceiveNotificationResponse(
  value: unknown,
): value is ReceiveNotificationResponse {
  return value === null || (isRecord(value) && isNumber(value.receiptId) && 'body' in value);
}

function isSenderData(value: unknown): value is SenderData {
  return (
    isRecord(value) &&
    isString(value.chatId) &&
    value.chatId !== '' &&
    isString(value.chatType) &&
    isOptionalString(value.chatName) &&
    isOptionalNumber(value.senderPhoneNumber)
  );
}

export function isMessageNotification(value: unknown): value is MessageNotification {
  return (
    isRecord(value) &&
    isString(value.typeWebhook) &&
    Object.hasOwn(MESSAGE_TYPE_WEBHOOKS, value.typeWebhook) &&
    isNumber(value.timestamp) &&
    isString(value.idMessage) &&
    value.idMessage !== '' &&
    isSenderData(value.senderData) &&
    isRecord(value.messageData) &&
    isString(value.messageData.typeMessage)
  );
}

// Текст — в textMessageData.textMessage или extendedTextMessageData.text (у quotedMessage — текст ответа)
export function isTextMessageData(value: unknown): value is TextMessageData {
  if (!isRecord(value)) {
    return false;
  }

  if (value.typeMessage === 'textMessage') {
    return isRecord(value.textMessageData) && isString(value.textMessageData.textMessage);
  }

  const isExtendedText =
    value.typeMessage === 'extendedTextMessage' || value.typeMessage === 'quotedMessage';

  return (
    isExtendedText &&
    isRecord(value.extendedTextMessageData) &&
    isString(value.extendedTextMessageData.text)
  );
}

// Неизвестный статус не проходит: такое уведомление маппинг пропустит (п. 7.3)
export function isOutgoingMessageStatusNotification(
  value: unknown,
): value is OutgoingMessageStatusNotification {
  return (
    isRecord(value) &&
    value.typeWebhook === 'outgoingMessageStatus' &&
    isString(value.chatId) &&
    isString(value.idMessage) &&
    isNumber(value.timestamp) &&
    isString(value.status) &&
    Object.hasOwn(OUTGOING_MESSAGE_STATUSES, value.status) &&
    isOptionalString(value.description)
  );
}

export function isStateInstanceChangedNotification(
  value: unknown,
): value is StateInstanceChangedNotification {
  return (
    isRecord(value) &&
    value.typeWebhook === 'stateInstanceChanged' &&
    isInstanceState(value.stateInstance)
  );
}

export function isQuotaExceededNotification(value: unknown): value is QuotaExceededNotification {
  return isRecord(value) && value.typeWebhook === 'quotaExceeded';
}
