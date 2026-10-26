import { AlertIcon } from '@/components/ui/icons/AlertIcon';
import { CheckIcon } from '@/components/ui/icons/CheckIcon';
import { ClockIcon } from '@/components/ui/icons/ClockIcon';

import type { MessageStatus } from '../types/chat.types';

// Иконки статуса исходящего — в пузыре и в строке списка чатов (п. 8.8).
// Record по всем статусам: забытый статус — ошибка TypeScript
export const MESSAGE_STATUS_ICONS: Record<MessageStatus, typeof CheckIcon> = {
  sending: ClockIcon,
  sent: CheckIcon,
  failed: AlertIcon,
};
