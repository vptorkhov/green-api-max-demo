import type { Chat } from '../types/chat.types';
import { formatPhone } from './phone';

// Имя из уведомления, иначе номер. null — нет ни того, ни другого: подпись даёт компонент через t()
export function getChatTitle({ name, phone }: Pick<Chat, 'name' | 'phone'>) {
  if (name !== undefined && name !== '') {
    return name;
  }

  return phone === undefined ? null : formatPhone(phone);
}
