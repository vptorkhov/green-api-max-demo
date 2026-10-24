import { useContext } from 'react';

import { ChatContext } from '../components/ChatProvider/ChatContext';

// Доступ к чатам и сообщениям. Вне ChatProvider — ошибка, а не тихий null
export function useChatContext() {
  const context = useContext(ChatContext);

  if (context === null) {
    throw new Error('useChatContext must be used within ChatProvider');
  }

  return context;
}
