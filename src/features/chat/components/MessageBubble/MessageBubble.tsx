import { useTranslation } from 'react-i18next';

import { joinClassNames } from '@/utils/joinClassNames';

import type { Message } from '../../types/chat.types';
import { formatMessageTime } from '../../utils/formatTime';

import styles from './MessageBubble.module.css';

type Props = {
  message: Message;
};

// Пузырь сообщения: входящие слева, исходящие справа, время внутри справа снизу.
// Статус исходящего (часы / галочка / ошибка) добавляется на этапе 6
export function MessageBubble({ message }: Props) {
  const { i18n } = useTranslation();

  const isOutgoing = message.direction === 'outgoing';
  const time = formatMessageTime(message.timestamp, i18n.language);

  return (
    <div className={joinClassNames(styles.row, isOutgoing && styles.rowOutgoing)}>
      <div
        className={joinClassNames(styles.bubble, isOutgoing ? styles.outgoing : styles.incoming)}
      >
        <p className={styles.text}>
          {message.text}
          <time className={styles.time} dateTime={new Date(message.timestamp).toISOString()}>
            {time}
          </time>
        </p>
      </div>
    </div>
  );
}
