import { isRecord, isString } from '@/utils/typeGuards';

import type { NewChat } from '../types/chat.types';
import type {
  IgnoreReason,
  MessageNotification,
  NotificationEvent,
  TextMessageData,
} from '../types/notification.types';
import {
  isMessageNotification,
  isOutgoingMessageStatusNotification,
  isQuotaExceededNotification,
  isStateInstanceChangedNotification,
  isTextMessageData,
} from './notificationGuards';

const MILLISECONDS_IN_SECOND = 1000;

// typeWebhook, которые приложение разбирает. Уведомление такого вида, не прошедшее guard, — битое
const HANDLED_TYPE_WEBHOOKS = new Set([
  'incomingMessageReceived',
  'outgoingMessageReceived',
  'outgoingAPIMessageReceived',
  'outgoingMessageStatus',
  'stateInstanceChanged',
  'quotaExceeded',
]);

// Неизвестный или битый формат — повод для console.warn; остальное — штатный пропуск
const UNEXPECTED_IGNORE_REASONS = new Set<IgnoreReason>(['unsupportedType', 'malformed']);

function ignore(reason: IgnoreReason): NotificationEvent {
  return { type: 'ignored', reason, isUnexpected: UNEXPECTED_IGNORE_REASONS.has(reason) };
}

function getText(messageData: TextMessageData) {
  return messageData.typeMessage === 'textMessage'
    ? messageData.textMessageData.textMessage
    : messageData.extendedTextMessageData.text;
}

// Данные для нового чата. Номер — только у входящих: senderPhoneNumber — номер отправителя,
// а в исходящих это может быть свой номер (GreenApiNotes.md §14, вопрос 2). 0 — номер скрыт
function getChatDetails({ typeWebhook, senderData }: MessageNotification): NewChat {
  const { chatId, chatName, senderPhoneNumber } = senderData;
  const hasPhone = typeWebhook === 'incomingMessageReceived' && Boolean(senderPhoneNumber);
  const hasName = chatName !== undefined && chatName !== '';

  return {
    chatId,
    ...(hasPhone ? { phone: String(senderPhoneNumber) } : {}),
    ...(hasName ? { name: chatName } : {}),
  };
}

function mapMessageNotification(notification: MessageNotification): NotificationEvent {
  const { typeWebhook, timestamp, idMessage, senderData, messageData } = notification;

  // В приложении чат — собеседник по номеру телефона: группы, каналы и боты не показываются
  if (senderData.chatType !== 'user') {
    return ignore('nonPersonalChat');
  }

  // Только текст (требование задания): фото, стикеры, реакции и прочее пропускаются
  if (!isTextMessageData(messageData)) {
    return ignore('nonTextMessage');
  }

  const text = getText(messageData);

  if (text.trim() === '') {
    return ignore('emptyText');
  }

  const chat = getChatDetails(notification);
  const message = {
    id: idMessage,
    chatId: senderData.chatId,
    text,
    // Секунды сервера → миллисекунды, как у остальных сообщений
    timestamp: timestamp * MILLISECONDS_IN_SECOND,
  };

  // Исходящее — отправленное с телефона или через API (в том числе этим приложением, п. 7.5)
  return typeWebhook === 'incomingMessageReceived'
    ? { type: 'messageReceived', message: { ...message, direction: 'incoming' }, chat }
    : { type: 'messageSent', message: { ...message, direction: 'outgoing', status: 'sent' }, chat };
}

// Тело уведомления (body из receiveNotification) → событие для хранилища (п. 7.5).
// Чистая функция: не пишет в консоль и не бросает — битое уведомление становится ignored
export function mapNotification(body: unknown): NotificationEvent {
  if (isMessageNotification(body)) {
    return mapMessageNotification(body);
  }

  // failed / noAccount приходят всегда, даже после HTTP 200 на sendMessage (GreenApiNotes.md §5)
  if (isOutgoingMessageStatusNotification(body)) {
    const isFailed = body.status === 'failed' || body.status === 'noAccount';

    return isFailed
      ? { type: 'messageFailed', chatId: body.chatId, messageId: body.idMessage }
      : ignore('statusNotHandled');
  }

  if (isStateInstanceChangedNotification(body)) {
    const { stateInstance } = body;

    return stateInstance === 'authorized'
      ? ignore('instanceAuthorized')
      : { type: 'instanceStateChanged', stateInstance };
  }

  if (isQuotaExceededNotification(body)) {
    return { type: 'quotaExceeded' };
  }

  const isHandledType =
    isRecord(body) && isString(body.typeWebhook) && HANDLED_TYPE_WEBHOOKS.has(body.typeWebhook);

  return ignore(isHandledType ? 'malformed' : 'unsupportedType');
}
