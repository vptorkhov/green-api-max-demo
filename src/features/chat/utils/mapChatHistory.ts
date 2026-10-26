import type { Message } from '../types/chat.types';
import type { ChatHistoryItem } from '../types/greenApiChat.types';
import { isChatHistoryItem } from './chatGuards';

const MILLISECONDS_IN_SECOND = 1000;

// Текстовые типы: у quotedMessage в textMessage — текст ответа без цитаты, как в уведомлениях (п. 7.3)
const TEXT_MESSAGE_TYPES = new Set(['textMessage', 'extendedTextMessage', 'quotedMessage']);

function mapChatHistoryItem(item: ChatHistoryItem): Message | null {
  const { type, idMessage, timestamp, typeMessage, chatId, chatType, textMessage, isDeleted } =
    item;

  // Те же правила, что у уведомлений (п. 7.3): только текст в личном чате, без пустых и удалённых
  if (
    chatType !== 'user' ||
    !TEXT_MESSAGE_TYPES.has(typeMessage) ||
    textMessage === undefined ||
    textMessage.trim() === '' ||
    isDeleted === true
  ) {
    return null;
  }

  const message = {
    id: idMessage,
    chatId,
    text: textMessage,
    timestamp: timestamp * MILLISECONDS_IN_SECOND,
  };

  // statusMessage (delivered / read) не используется: в приложении у принятого сервером — sent
  return type === 'incoming'
    ? { ...message, direction: 'incoming' }
    : { ...message, direction: 'outgoing', status: 'sent' };
}

// Ответ getChatHistory (п. 7.10) → сообщения открытого чата. Чистая функция: битые элементы,
// нетекстовые и чужие (другой chatId) пропускаются
export function mapChatHistory(items: unknown[], chatId: string): Message[] {
  return items.flatMap((item) => {
    const message =
      isChatHistoryItem(item) && item.chatId === chatId ? mapChatHistoryItem(item) : null;

    return message === null ? [] : [message];
  });
}
