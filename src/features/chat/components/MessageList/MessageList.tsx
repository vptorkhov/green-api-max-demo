import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import type { Message } from '../../types/chat.types';
import { MessageBubble } from '../MessageBubble/MessageBubble';

import styles from './MessageList.module.css';

type Props = {
  chatId: string;
  messages: Message[];
};

// Переписка открытого чата. «Умная» прокрутка (не уводить вниз, если читают историю) — этап 8
export function MessageList({ chatId, messages }: Props) {
  const { t } = useTranslation();

  const scrollRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  // При открытии чата и новом сообщении — к последнему сообщению
  useEffect(() => {
    const scrollElement = scrollRef.current;

    if (scrollElement) {
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [chatId, messages.length]);

  return (
    <div ref={scrollRef} className={styles.scroll}>
      <div className={styles.column}>
        {hasMessages ? (
          messages.map((message) => <MessageBubble key={message.id} message={message} />)
        ) : (
          <p className={styles.empty}>{t('pages.chat.noMessages')}</p>
        )}
      </div>
    </div>
  );
}
