import { ChatPanel } from '../ChatPanel/ChatPanel';
import { ChatProvider } from '../ChatProvider/ChatProvider';
import { ChatSidebar } from '../ChatSidebar/ChatSidebar';

import styles from './ChatScreen.module.css';

// Экран чата: две колонки, как в web.max.ru. Провайдер — внутри экрана: экран загружается лениво
// (п. 4.6), и хранилище чатов не попадает в основной бандл
export function ChatScreen() {
  return (
    <ChatProvider>
      <main className={styles.screen}>
        <ChatSidebar />
        <ChatPanel />
      </main>
    </ChatProvider>
  );
}
