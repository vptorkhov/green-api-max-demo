import { RECEIVE_REQUEST_TIMEOUT_MARGIN_MS } from '@/constants/greenApi';
import { greenApiClient } from '@/services/greenApiClient';
import type { GreenApiCredentials } from '@/types/greenApi.types';

import type {
  CheckAccountRequest,
  CheckAccountResponse,
  GetSettingsResponse,
  SendMessageRequest,
} from '../types/greenApiChat.types';
import type { ReceiveNotificationResponse } from '../types/notification.types';
import {
  isCheckAccountResponse,
  isDeleteNotificationResponse,
  isGetSettingsResponse,
  isSendMessageResponse,
} from '../utils/chatGuards';
import { isReceiveNotificationResponse } from '../utils/notificationGuards';

export const chatService = {
  // Номер → chatId (GreenApiNotes.md §4). Лимит тарифа Developer — 100 вызовов в месяц,
  // поэтому вызывается только при создании чата. phone — нормализованный и проверенный validatePhone
  checkAccount(
    credentials: GreenApiCredentials,
    phone: string,
    signal?: AbortSignal,
  ): Promise<CheckAccountResponse> {
    const body: CheckAccountRequest = { phoneNumber: Number(phone) };

    return greenApiClient.post(credentials, 'checkAccount', body, {
      guard: isCheckAccountResponse,
      signal,
    });
  },

  // Текст в чат по chatId. Возвращает idMessage: им подменяется временный id сообщения (п. 6.2).
  // Длину (MAX_MESSAGE_LENGTH) ограничивает поле ввода, пустой текст не отправляет хук (п. 6.3–6.4)
  async sendMessage(
    credentials: GreenApiCredentials,
    request: SendMessageRequest,
    signal?: AbortSignal,
  ): Promise<string> {
    const response = await greenApiClient.post(credentials, 'sendMessage', request, {
      guard: isSendMessageResponse,
      signal,
    });

    return response.idMessage;
  },

  // Следующее уведомление из очереди (long polling) или null — очередь пуста; пустое тело ответа
  // клиент тоже возвращает как null (GreenApiNotes.md §6). Уведомление остаётся в очереди,
  // пока его не удалят deleteNotification. Тело уведомления сужает маппинг (п. 7.3)
  receiveNotification(
    credentials: GreenApiCredentials,
    receiveTimeoutSeconds: number,
    signal?: AbortSignal,
  ): Promise<ReceiveNotificationResponse> {
    return greenApiClient.get(credentials, 'receiveNotification', {
      guard: isReceiveNotificationResponse,
      query: { receiveTimeout: receiveTimeoutSeconds },
      signal,
      timeoutMs: receiveTimeoutSeconds * 1000 + RECEIVE_REQUEST_TIMEOUT_MARGIN_MS,
    });
  },

  // Удаление уведомления из очереди. result: false (уже удалено или receiptId неизвестен) —
  // не ошибка: уведомления в очереди нет, цель достигнута (GreenApiNotes.md §6)
  async deleteNotification(
    credentials: GreenApiCredentials,
    receiptId: number,
    signal?: AbortSignal,
  ): Promise<void> {
    await greenApiClient.delete(credentials, 'deleteNotification', {
      guard: isDeleteNotificationResponse,
      pathParam: receiptId,
      signal,
    });
  },

  // Настройки инстанса: включены ли нужные уведомления (п. 7.7). Без месячного лимита,
  // частота — 1 запрос в секунду (GreenApiNotes.md §10), поэтому вызывается один раз на экран
  getSettings(
    credentials: GreenApiCredentials,
    signal?: AbortSignal,
  ): Promise<GetSettingsResponse> {
    return greenApiClient.get(credentials, 'getSettings', {
      guard: isGetSettingsResponse,
      signal,
    });
  },
};
