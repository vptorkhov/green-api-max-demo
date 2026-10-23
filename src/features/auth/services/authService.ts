import { greenApiClient } from '@/services/greenApiClient';
import type { GreenApiCredentials } from '@/types/greenApi.types';

import type { InstanceState } from '../types/auth.types';
import { isGetStateInstanceResponse } from '../utils/authGuards';

export const authService = {
  // Проверка учётных данных при входе: неверные данные дают GreenApiError (unauthorized / network),
  // верные — статус инстанса. Решение о допуске принимает хук входа (п. 4.3)
  async getInstanceState(
    credentials: GreenApiCredentials,
    signal?: AbortSignal,
  ): Promise<InstanceState> {
    const response = await greenApiClient.get(credentials, 'getStateInstance', {
      guard: isGetStateInstanceResponse,
      signal,
    });

    return response.stateInstance;
  },
};
