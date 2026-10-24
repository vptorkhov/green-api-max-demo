import { useEffect, useRef, useState } from 'react';

import { useAuthContext, useUnauthorizedLogout } from '@/features/auth';
import { isAbortError } from '@/services/greenApiError';
import { type ErrorMessageKey, getErrorMessageKey } from '@/utils/getErrorMessageKey';

import { chatService } from '../services/chatService';
import type { PhoneFieldErrorKey } from '../types/chat.types';
import { normalizePhone, validatePhone } from '../utils/phone';
import { useChatContext } from './useChatContext';

type Options = {
  // Вызывается, когда чат создан или найден и открыт: форма создания закрывается
  onSuccess: () => void;
};

// Создание чата по номеру: нормализация → проверка → уже известный номер открывается без запроса →
// checkAccount → chatCreated с полученным chatId (п. 5.5)
export function useCreateChat({ onSuccess }: Options) {
  const { credentials } = useAuthContext();
  const { chats, createChat, selectChat } = useChatContext();
  const { logoutIfUnauthorized } = useUnauthorizedLogout();

  const isLoadingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [phoneError, setPhoneError] = useState<PhoneFieldErrorKey | null>(null);
  const [error, setError] = useState<ErrorMessageKey | null>(null);

  async function createChatByPhone(phoneInput: string) {
    // Без учётных данных экран чата не показывается (ChatProvider), проверка — для типа
    if (isLoadingRef.current || credentials === null) {
      return;
    }

    const phone = normalizePhone(phoneInput);
    const validationError = validatePhone(phone);

    setError(null);
    setPhoneError(validationError);

    // Некорректный номер — запрос не отправляется
    if (validationError !== null) {
      return;
    }

    // Чат с этим номером уже есть — открывается без запроса: checkAccount ограничен 100 вызовами в месяц
    const existingChat = Object.values(chats).find((chat) => chat.phone === phone);

    if (existingChat !== undefined) {
      selectChat(existingChat.chatId);
      onSuccess();

      return;
    }

    const abortController = new AbortController();

    abortControllerRef.current = abortController;
    isLoadingRef.current = true;
    setIsLoading(true);

    try {
      const account = await chatService.checkAccount(credentials, phone, abortController.signal);

      if (!account.exist) {
        setPhoneError('pages.chat.newChatForm.noAccount');

        return;
      }

      // Чат с этим chatId уже есть (собеседник написал первым) — reducer откроет его и допишет номер
      createChat({ chatId: account.chatId, phone });
      onSuccess();
    } catch (caughtError) {
      // Отмена при закрытии формы — не ошибка; при unauthorized выполнен выход — ошибку не показываем
      if (isAbortError(caughtError) || logoutIfUnauthorized(caughtError)) {
        return;
      }

      console.error(caughtError);
      setError(getErrorMessageKey(caughtError));
    } finally {
      abortControllerRef.current = null;
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }

  // Закрытие формы во время запроса отменяет его
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  return {
    isLoading,
    phoneError,
    error,
    createChatByPhone,
  };
}
