import type { GreenApiCredentials } from '@/types/greenApi.types';
import { isRecord, isString } from '@/utils/typeGuards';

import type { GetStateInstanceResponse, InstanceState } from '../types/auth.types';

// Record по всем значениям InstanceState: забытый статус — ошибка TypeScript
const KNOWN_INSTANCE_STATES: Record<InstanceState, true> = {
  authorized: true,
  notAuthorized: true,
  starting: true,
  blocked: true,
  suspended: true,
  pendingPassword: true,
};

// Неизвестный статус не пропускается: клиент вернёт invalidResponse
export function isInstanceState(value: unknown): value is InstanceState {
  return isString(value) && Object.hasOwn(KNOWN_INSTANCE_STATES, value);
}

export function isGetStateInstanceResponse(value: unknown): value is GetStateInstanceResponse {
  return isRecord(value) && isInstanceState(value.stateInstance);
}

// Учётные данные из localStorage: проверяется только форма. Значения были проверены при входе,
// а подменённый вручную apiUrl не пропустит HTTP-клиент (только абсолютный http(s)-адрес)
export function isGreenApiCredentials(value: unknown): value is GreenApiCredentials {
  return (
    isRecord(value) &&
    isString(value.apiUrl) &&
    isString(value.idInstance) &&
    isString(value.apiTokenInstance)
  );
}
