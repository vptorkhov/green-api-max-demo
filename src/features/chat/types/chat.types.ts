import type ru from '@/localization/locales/ru.json';

// Доменные типы чата. От формы Message зависят список сообщений, хранилище (п. 5.3),
// отправка (этап 6) и получение (этап 7)

export type MessageDirection = 'incoming' | 'outgoing';

// Статус есть только у исходящих: sending — запрос SendMessage в пути, sent — сервер принял,
// failed — ошибка запроса или outgoingMessageStatus failed / noAccount (этап 7)
export type MessageStatus = 'sending' | 'sent' | 'failed';

type MessageBase = {
  // idMessage GREEN-API. Уникален только в пределах чата (GreenApiNotes.md §3), поэтому сообщения
  // хранятся по chatId. До ответа SendMessage — временный crypto.randomUUID() (п. 6.2)
  id: string;
  chatId: string;
  text: string;
  // Миллисекунды Unix-времени: у полученных — timestamp сервера × 1000, у отправленных — время клиента
  timestamp: number;
};

export type IncomingMessage = MessageBase & {
  direction: 'incoming';
};

export type OutgoingMessage = MessageBase & {
  direction: 'outgoing';
  status: MessageStatus;
};

// Размеченное объединение по direction: у входящего не может оказаться статуса отправки
export type Message = IncomingMessage | OutgoingMessage;

// Последнее сообщение чата не хранится, а берётся из messages[chatId]: копия в Chat
// пришлось бы синхронизировать при каждом добавлении, смене статуса и подмене id (этап 6)
export type Chat = {
  // Ключ. Строка цифр, только из checkAccount или уведомления — из номера не вычисляется (п. 5.2)
  chatId: string;
  // Нормализованный номер (только цифры). Нет, если собеседник написал первым со скрытым номером
  phone?: string;
  // Имя из chatName уведомления
  name?: string;
  // Миллисекунды: создание чата или последнее сообщение — по нему сортируется список
  updatedAt: number;
  unreadCount: number;
};

export type ChatsState = {
  // По chatId
  chats: Record<string, Chat>;
  // По chatId, в порядке времени (старые → новые)
  messages: Record<string, Message[]>;
  // Не сохраняется между сессиями (п. 5.3)
  activeChatId: string | null;
};

// Ключ ошибки номера телефона в форме создания чата (выводится из ru.json)
export type PhoneValidationErrorKey =
  `pages.chat.phoneValidation.${keyof (typeof ru)['pages']['chat']['phoneValidation']}`;
