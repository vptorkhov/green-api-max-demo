import { useEffect, useRef, useState } from 'react';

import { useAuthContext, useUnauthorizedLogout } from '@/features/auth';
import type { GreenApiCredentials } from '@/types/greenApi.types';

import { chatService } from '../services/chatService';
import type { NotificationSettingKey } from '../types/greenApiChat.types';
import { getDisabledNotificationSettings } from '../utils/getDisabledNotificationSettings';

// Проверка настроек инстанса при открытии экрана чата (п. 7.7): в новом инстансе уведомления
// выключены, и без предупреждения сообщения просто не приходили бы. Настройки применяются
// до 5 минут, поэтому повторная проверка — при следующем открытии экрана
export function useNotificationSettingsCheck() {
  const { credentials } = useAuthContext();
  const { logoutIfUnauthorized } = useUnauthorizedLogout();

  // Один запрос на экземпляр компонента. Запрос не отменяется: в StrictMode отменённый запрос
  // первого запуска эффекта всё равно доходит до сервера, а getSettings ограничен 1 запросом
  // в секунду — второй получил бы 429. Ответ после размонтирования React просто не применит
  const isCheckStartedRef = useRef(false);
  const [disabledSettings, setDisabledSettings] = useState<NotificationSettingKey[]>([]);

  useEffect(() => {
    if (credentials === null || isCheckStartedRef.current) {
      return;
    }

    isCheckStartedRef.current = true;

    async function checkSettings(authorizedCredentials: GreenApiCredentials) {
      try {
        const settings = await chatService.getSettings(authorizedCredentials);

        setDisabledSettings(getDisabledNotificationSettings(settings));
      } catch (caughtError) {
        // При unauthorized выполнен выход — ошибку не показываем
        if (logoutIfUnauthorized(caughtError)) {
          return;
        }

        // Проверка вспомогательная: сеть, сервер, недоступный инстанс покажет индикатор
        // соединения (п. 7.6) по ошибке опроса — второй блок с той же причиной не нужен
        console.error(caughtError);
      }
    }

    void checkSettings(credentials);
  }, [credentials, logoutIfUnauthorized]);

  return {
    disabledSettings,
  };
}
