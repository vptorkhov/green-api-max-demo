import { useCallback, useRef, useState } from 'react';

import { useAuthContext, useUnauthorizedLogout } from '@/features/auth';
import type { GreenApiCredentials } from '@/types/greenApi.types';
import { type ErrorMessageKey, getErrorMessageKey } from '@/utils/getErrorMessageKey';

import { chatService } from '../services/chatService';
import type { MessageRef, OutgoingMessage } from '../types/chat.types';
import { createTemporaryMessageId } from '../utils/messageId';
import { useChatContext } from './useChatContext';

// Отправка с оптимистичным добавлением (п. 6.2): сообщение сразу в переписке со статусом sending,
// ответ sendMessage подменяет временный id на idMessage, ошибка — статус failed и повтор.
// Запрос при размонтировании не отменяется: сообщение уже показано, его судьба должна дойти
// до хранилища. Если провайдер размонтирован (выход), сохранённое sending при следующей загрузке
// станет failed (п. 6.2)
export function useSendMessage() {
  const { credentials } = useAuthContext();
  const { addMessage, changeMessageStatus, confirmMessage } = useChatContext();
  const { logoutIfUnauthorized } = useUnauthorizedLogout();

  const isSendingRef = useRef(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<ErrorMessageKey | null>(null);
  // К какому сообщению относится error: причину показывает только его пузырь (п. 6.5).
  // У остальных failed (более ранних или после перезагрузки) причина уже неизвестна
  const [failedMessage, setFailedMessage] = useState<MessageRef | null>(null);

  // Общая часть отправки и повтора: сообщение уже в переписке со статусом sending.
  // useCallback — зависимость retryMessage
  const deliverMessage = useCallback(
    async (
      authorizedCredentials: GreenApiCredentials,
      chatId: string,
      messageId: string,
      text: string,
    ) => {
      isSendingRef.current = true;
      setIsSending(true);
      setError(null);
      setFailedMessage(null);

      try {
        const idMessage = await chatService.sendMessage(authorizedCredentials, {
          chatId,
          message: text,
        });

        confirmMessage(chatId, messageId, idMessage);
      } catch (caughtError) {
        // Сообщение не ушло — failed. При unauthorized выход размонтирует провайдер в том же рендере,
        // до сохранения: в localStorage останется sending, и failed выставит загрузка после входа (п. 6.2)
        changeMessageStatus(chatId, messageId, 'failed');

        // При unauthorized выполнен выход — ошибку не показываем
        if (logoutIfUnauthorized(caughtError)) {
          return;
        }

        console.error(caughtError);
        setError(getErrorMessageKey(caughtError));
        setFailedMessage({ chatId, messageId });
      } finally {
        isSendingRef.current = false;
        setIsSending(false);
      }
    },
    [confirmMessage, changeMessageStatus, logoutIfUnauthorized],
  );

  // Текст обрезается по краям, переносы внутри сохраняются; пустой не отправляется (п. 6.4)
  async function sendMessage(chatId: string, text: string) {
    const message = text.trim();

    // Без учётных данных экран чата не показывается (ChatProvider), проверка — для типа
    if (isSendingRef.current || credentials === null || message === '') {
      return;
    }

    const temporaryId = createTemporaryMessageId();

    addMessage({
      id: temporaryId,
      chatId,
      text: message,
      direction: 'outgoing',
      status: 'sending',
      timestamp: Date.now(),
    });
    await deliverMessage(credentials, chatId, temporaryId, message);
  }

  // Повтор failed: тот же текст и место в переписке. Сообщение передаёт его пузырь — он
  // перерисовывается при каждом изменении сообщения, поэтому статус актуален. chatId берётся
  // из сообщения: idMessage уникален только в пределах чата (этап 7).
  // useCallback — функция идёт в props мемоизированного MessageBubble (п. 8.9)
  const retryMessage = useCallback(
    async (message: OutgoingMessage) => {
      if (isSendingRef.current || credentials === null || message.status !== 'failed') {
        return;
      }

      changeMessageStatus(message.chatId, message.id, 'sending');
      await deliverMessage(credentials, message.chatId, message.id, message.text);
    },
    [credentials, changeMessageStatus, deliverMessage],
  );

  return {
    isSending,
    error,
    failedMessage,
    sendMessage,
    retryMessage,
  };
}
