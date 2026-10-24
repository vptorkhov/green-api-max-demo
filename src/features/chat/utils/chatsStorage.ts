import { getChatsStorageKey } from '@/constants/storageKeys';
import { readStorage, writeStorage } from '@/utils/storage';

import type { ChatsState, StoredChats } from '../types/chat.types';
import { isStoredChats } from './chatGuards';

// Сколько последних сообщений чата сохраняется: localStorage ограничен ~5 МБ на origin.
// В памяти во время сессии хранится вся переписка, обрезка — только при записи
const MAX_STORED_MESSAGES_PER_CHAT = 200;

export function readStoredChats(idInstance: string) {
  return readStorage(getChatsStorageKey(idInstance), isStoredChats);
}

// Активный чат не сохраняется (п. 5.3)
export function writeStoredChats(idInstance: string, { chats, messages }: ChatsState) {
  const storedMessages = Object.fromEntries(
    Object.entries(messages).map(([chatId, chatMessages]) => [
      chatId,
      chatMessages.slice(-MAX_STORED_MESSAGES_PER_CHAT),
    ]),
  );
  const storedChats: StoredChats = { chats, messages: storedMessages };

  writeStorage(getChatsStorageKey(idInstance), storedChats);
}
