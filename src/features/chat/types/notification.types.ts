import type { InstanceState } from '@/features/auth';

// Уведомления GREEN-API (HTTP API). Формы — по реальным JSON и документации (GreenApiNotes.md §6–7).
// Описаны только поля, которые используются дальше (п. 7.3–7.5); прочие не типизируются.
// Данные из сети приходят как unknown и сужаются guard'ами из utils/notificationGuards.ts

// Ответ receiveNotification. null — очередь пуста: так же клиент возвращает пустое тело (§6).
// body сужается отдельно: уведомление неизвестного вида всё равно нужно удалить по receiptId
export type ReceiveNotificationResponse = {
  receiptId: number;
  body: unknown;
} | null;

export type MessageTypeWebhook =
  'incomingMessageReceived' | 'outgoingMessageReceived' | 'outgoingAPIMessageReceived';

// user — личный чат; group / channel / bot приложение не показывает (п. 7.3)
export type ChatType = 'user' | 'group' | 'channel' | 'bot';

// Для исходящих — данные чата получателя. Привязка к чату — только по chatId (§7)
export type SenderData = {
  chatId: string;
  // Неизвестные значения не отбрасывают уведомление: такой чат отфильтрует маппинг
  chatType: string;
  // Имя для нового чата. Необязательные поля не делают уведомление «битым», если их не будет
  chatName?: string;
  // Число; 0 — номер скрыт или это группа
  senderPhoneNumber?: number;
};

// Текстовые сообщения приходят в трёх вариантах (§7, «Где лежит текст»)
export type TextMessageData =
  | { typeMessage: 'textMessage'; textMessageData: { textMessage: string } }
  | { typeMessage: 'extendedTextMessage'; extendedTextMessageData: { text: string } }
  | { typeMessage: 'quotedMessage'; extendedTextMessageData: { text: string } };

export type MessageNotification = {
  typeWebhook: MessageTypeWebhook;
  // Секунды Unix-времени
  timestamp: number;
  idMessage: string;
  senderData: SenderData;
  // Любой typeMessage: нетекстовые сообщения игнорируются, но уведомление удаляется (п. 7.4).
  // Текстовое сужается isTextMessageData
  messageData: { typeMessage: string };
};

// failed / noAccount приходят всегда, их обработка обязательна; delivered / read — опционально
export type OutgoingMessageStatus = 'delivered' | 'read' | 'failed' | 'noAccount' | 'notInGroup';

// chatId — на верхнем уровне, а не в senderData
export type OutgoingMessageStatusNotification = {
  typeWebhook: 'outgoingMessageStatus';
  chatId: string;
  idMessage: string;
  timestamp: number;
  status: OutgoingMessageStatus;
  description?: string;
};

// Значения — как в getStateInstance; не authorized → выход (п. 7.3)
export type StateInstanceChangedNotification = {
  typeWebhook: 'stateInstanceChanged';
  stateInstance: InstanceState;
};

// Исчерпан лимит тарифа. В примере документации нет timestamp, поэтому поля времени нет и в типе;
// quotaData не используется — пользователю показывается общий текст common.errors.quotaExceeded
export type QuotaExceededNotification = {
  typeWebhook: 'quotaExceeded';
};

// Уведомления, которые обрабатывает приложение; остальные typeWebhook игнорируются (п. 7.3)
export type NotificationBody =
  | MessageNotification
  | OutgoingMessageStatusNotification
  | StateInstanceChangedNotification
  | QuotaExceededNotification;
