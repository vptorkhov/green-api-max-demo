import { createContext } from 'react';

import type { ChatContextValue } from '../types/chat.types';

// Отдельный файл: файл компонента экспортирует только компоненты (ProjectRules §2).
// null — вне провайдера: useChatContext в этом случае бросает ошибку
export const ChatContext = createContext<ChatContextValue | null>(null);
