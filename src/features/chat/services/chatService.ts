import { greenApiClient } from '@/services/greenApiClient';
import type { GreenApiCredentials } from '@/types/greenApi.types';

import type {
  CheckAccountRequest,
  CheckAccountResponse,
  SendMessageRequest,
} from '../types/greenApiChat.types';
import { isCheckAccountResponse, isSendMessageResponse } from '../utils/chatGuards';

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
};
