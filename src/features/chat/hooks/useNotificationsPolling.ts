import { useEffect, useRef, useState } from 'react';

import {
  POLLING_RETRY_DELAY_MULTIPLIER,
  POLLING_RETRY_INITIAL_DELAY_MS,
  POLLING_RETRY_MAX_DELAY_MS,
  RECEIVE_TIMEOUT_SECONDS,
} from '@/constants/greenApi';
import { useAuthContext, useUnauthorizedLogout } from '@/features/auth';
import { isAbortError } from '@/services/greenApiError';
import type { GreenApiCredentials } from '@/types/greenApi.types';
import { type ErrorMessageKey, getErrorMessageKey } from '@/utils/getErrorMessageKey';
import { wait } from '@/utils/wait';

import { chatService } from '../services/chatService';
import type { NotificationEvent } from '../types/notification.types';
import { mapNotification } from '../utils/mapNotification';

type Options = {
  // Применение события к хранилищу (п. 7.5). Вызывается до удаления уведомления из очереди,
  // кроме instanceStateChanged — после удаления
  onEvent: (event: NotificationEvent) => void;
};

function getNextRetryDelay(delayMs: number) {
  return Math.min(delayMs * POLLING_RETRY_DELAY_MULTIPLIER, POLLING_RETRY_MAX_DELAY_MS);
}

// Получение уведомлений: последовательный long polling receiveNotification → событие →
// deleteNotification. Одновременно в полёте не больше одного запроса. Запускается один раз
// на экране чата и работает независимо от выбранного чата (п. 7.4)
export function useNotificationsPolling({ onEvent }: Options) {
  const { credentials } = useAuthContext();
  const { logoutIfUnauthorized } = useUnauthorizedLogout();

  // Последний обработчик без перезапуска цикла: цикл зависит только от учётных данных
  const onEventRef = useRef(onEvent);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<ErrorMessageKey | null>(null);

  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    if (credentials === null) {
      return;
    }

    // Свой контроллер у каждого запуска эффекта: в StrictMode первый запуск отменяется
    // до старта второго, и два цикла одновременно не работают
    const abortController = new AbortController();
    const { signal } = abortController;

    async function pollNotifications(authorizedCredentials: GreenApiCredentials) {
      let retryDelayMs = POLLING_RETRY_INITIAL_DELAY_MS;

      while (!signal.aborted) {
        try {
          const notification = await chatService.receiveNotification(
            authorizedCredentials,
            RECEIVE_TIMEOUT_SECONDS,
            signal,
          );

          if (notification !== null) {
            const { receiptId, body } = notification;
            const event = mapNotification(body);

            if (event.type === 'ignored' && event.isUnexpected) {
              // Тело не логируется: в нём личная переписка
              console.warn(`Notification ${receiptId} ignored: ${event.reason}`);
            }

            // Выход по статусу инстанса применяется после удаления: выход отменяет запросы цикла,
            // и неудалённое уведомление при следующем входе разлогинило бы снова (п. 7.5)
            const isSessionEnding = event.type === 'instanceStateChanged';

            if (!isSessionEnding) {
              onEventRef.current(event);
            }

            // Удаляется всегда, включая ignored и битые, — иначе очередь встанет на нём.
            // Если удаление не удалось, уведомление придёт снова: повторное применение безопасно
            // (дедупликация по id, п. 5.3)
            await chatService.deleteNotification(authorizedCredentials, receiptId, signal);

            if (isSessionEnding) {
              onEventRef.current(event);
              return;
            }
          }

          retryDelayMs = POLLING_RETRY_INITIAL_DELAY_MS;
          setIsConnected(true);
          setError(null);
        } catch (caughtError) {
          // Отмена при выходе или размонтировании — не ошибка
          if (isAbortError(caughtError)) {
            return;
          }

          // Учётные данные больше не действуют — выход, цикл останавливается
          if (logoutIfUnauthorized(caughtError)) {
            return;
          }

          // Остальное (сеть, сервер, лимит частоты, инстанс запускается) — повтор с растущей паузой
          console.error(caughtError);
          setIsConnected(false);
          setError(getErrorMessageKey(caughtError));
          await wait(retryDelayMs, signal);
          retryDelayMs = getNextRetryDelay(retryDelayMs);
        }
      }
    }

    void pollNotifications(credentials);

    return () => {
      abortController.abort();
    };
  }, [credentials, logoutIfUnauthorized]);

  return {
    isConnected,
    error,
  };
}
