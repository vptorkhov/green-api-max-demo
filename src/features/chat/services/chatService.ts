import { greenApiClient } from '@/services/greenApiClient';
import type { GreenApiCredentials } from '@/types/greenApi.types';

import type { CheckAccountRequest, CheckAccountResponse } from '../types/greenApiChat.types';
import { isCheckAccountResponse } from '../utils/chatGuards';

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
};
