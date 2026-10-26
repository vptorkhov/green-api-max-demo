import { useEffect, useRef, useState } from 'react';

import { CHAT_HISTORY_COUNT, CHAT_HISTORY_REQUEST_INTERVAL_MS } from '@/constants/greenApi';
import { useAuthContext, useUnauthorizedLogout } from '@/features/auth';
import { isAbortError } from '@/services/greenApiError';
import type { GreenApiCredentials } from '@/types/greenApi.types';
import { type ErrorMessageKey, getErrorMessageKey } from '@/utils/getErrorMessageKey';
import { wait } from '@/utils/wait';

import { chatService } from '../services/chatService';
import { mapChatHistory } from '../utils/mapChatHistory';
import { useChatContext } from './useChatContext';

// Ошибка относится к конкретному чату: после переключения чужая ошибка не показывается
type HistoryError = {
  chatId: string;
  errorKey: ErrorMessageKey;
};

// История открытого чата с сервера (п. 7.10): один раз за сессию на чат. Восстанавливает переписку
// после очистки localStorage и сообщения старше суток, которых уже нет в очереди уведомлений.
// Смена чата отменяет загрузку предыдущего — он догрузится при следующем открытии
export function useChatHistory(chatId: string | null) {
  const { credentials } = useAuthContext();
  const { addHistoryMessages } = useChatContext();
  const { logoutIfUnauthorized } = useUnauthorizedLogout();

  // Время последнего запроса: getChatHistory — 1 запрос в секунду. Ref переживает и смену чата,
  // и повторный запуск эффекта в StrictMode
  const lastRequestAtRef = useRef(0);
  // Чаты, история которых уже загружена в этой сессии
  const [loadedChatIds, setLoadedChatIds] = useState<ReadonlySet<string>>(() => new Set());
  const [error, setError] = useState<HistoryError | null>(null);

  const isLoaded = chatId === null || loadedChatIds.has(chatId);
  const errorKey = error !== null && error.chatId === chatId ? error.errorKey : null;

  useEffect(() => {
    if (credentials === null || chatId === null || isLoaded || errorKey !== null) {
      return;
    }

    const abortController = new AbortController();
    const { signal } = abortController;

    async function loadHistory(authorizedCredentials: GreenApiCredentials, historyChatId: string) {
      const delayMs = lastRequestAtRef.current + CHAT_HISTORY_REQUEST_INTERVAL_MS - Date.now();

      // Пауза и при нулевой задержке: отменённый в StrictMode первый запуск не успевает отправить запрос
      await wait(Math.max(delayMs, 0), signal);

      if (signal.aborted) {
        return;
      }

      lastRequestAtRef.current = Date.now();

      try {
        const items = await chatService.getChatHistory(
          authorizedCredentials,
          { chatId: historyChatId, count: CHAT_HISTORY_COUNT },
          signal,
        );

        addHistoryMessages(mapChatHistory(items, historyChatId));
        setLoadedChatIds((currentChatIds) => new Set(currentChatIds).add(historyChatId));
      } catch (caughtError) {
        // Отмена при смене чата или размонтировании — не ошибка; при unauthorized выполнен выход
        if (isAbortError(caughtError) || logoutIfUnauthorized(caughtError)) {
          return;
        }

        console.error(caughtError);
        setError({ chatId: historyChatId, errorKey: getErrorMessageKey(caughtError) });
      }
    }

    void loadHistory(credentials, chatId);

    return () => {
      abortController.abort();
    };
  }, [chatId, credentials, isLoaded, errorKey, addHistoryMessages, logoutIfUnauthorized]);

  // Повтор доступен, только пока показана ошибка: она сбрасывается, и эффект запускает загрузку заново
  function retryHistory() {
    setError(null);
  }

  return {
    // Загрузка — пока история открытого чата не получена и нет ошибки (включая паузу между запросами)
    isLoading: !isLoaded && errorKey === null,
    error: errorKey,
    retryHistory,
  };
}
