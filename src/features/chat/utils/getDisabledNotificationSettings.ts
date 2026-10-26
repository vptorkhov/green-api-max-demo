import type { GetSettingsResponse, NotificationSettingKey } from '../types/greenApiChat.types';

// Порядок — порядок в предупреждении: первыми входящие, без них задание не работает
export const NOTIFICATION_SETTING_KEYS: readonly NotificationSettingKey[] = [
  'incomingWebhook',
  'outgoingAPIMessageWebhook',
  'outgoingMessageWebhook',
  'outgoingWebhook',
  'stateWebhook',
];

// Выключенные уведомления. Включённым считается только "yes": неизвестное значение — тоже повод
// проверить настройки в личном кабинете
export function getDisabledNotificationSettings(settings: GetSettingsResponse) {
  return NOTIFICATION_SETTING_KEYS.filter((key) => settings[key] !== 'yes');
}
