import type ru from '@/localization/locales/ru.json';

// Доменные типы чата. От формы Message зависят список сообщений, хранилище (п. 5.3),
// отправка (этап 6) и получение (этап 7)

export type MessageDirection = 'incoming' | 'outgoing';

// Статус есть только у исходящих: sending — запрос SendMessage в пути, sent — сервер принял,
// failed — ошибка запроса или outgoingMessageStatus failed / noAccount (этап 7)
export type MessageStatus = 'sending' | 'sent' | 'failed';

type MessageBase = {
  // idMessage GREEN-API. Уникален только в пределах чата (GreenApiNotes.md §3), поэтому сообщения
  // хранятся по chatId. До ответа SendMessage — временный id (createTemporaryMessageId, п. 6.2)
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

// Ошибка под полем номера: номер не прошёл проверку или у него нет аккаунта MAX (checkAccount)
export type PhoneFieldErrorKey = PhoneValidationErrorKey | 'pages.chat.newChatForm.noAccount';

// Сохраняемая часть состояния: активный чат между сессиями не запоминается
export type StoredChats = Pick<ChatsState, 'chats' | 'messages'>;

// Данные нового чата: из checkAccount (п. 5.5) или из уведомления (этап 7)
export type NewChat = Pick<Chat, 'chatId' | 'phone' | 'name'>;

// Действия reducer. Время передаётся в действии: reducer — чистая функция, без Date.now()
export type ChatsAction =
  | { type: 'chatCreated'; chat: NewChat; createdAt: number }
  | { type: 'chatSelected'; chatId: string | null }
  | { type: 'messageAdded'; message: Message }
  | { type: 'messageStatusChanged'; chatId: string; messageId: string; status: MessageStatus }
  // Ответ sendMessage: временный id → idMessage, статус sent (п. 6.2)
  | { type: 'messageConfirmed'; chatId: string; temporaryId: string; idMessage: string }
  | { type: 'chatRead'; chatId: string };

export type ChatContextValue = Pick<ChatsState, 'chats' | 'messages' | 'activeChatId'> & {
  // Создаёт чат или открывает существующий с тем же chatId
  createChat: (chat: NewChat) => void;
  selectChat: (chatId: string | null) => void;
  addMessage: (message: Message) => void;
  // failed — ошибка отправки; sending — повтор (п. 6.3)
  changeMessageStatus: (chatId: string, messageId: string, status: MessageStatus) => void;
  confirmMessage: (chatId: string, temporaryId: string, idMessage: string) => void;
  markChatRead: (chatId: string) => void;
};
