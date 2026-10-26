import {
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import { IconButton } from '@/components/ui/IconButton/IconButton';
import { SendIcon } from '@/components/ui/icons/SendIcon';
import { MAX_MESSAGE_LENGTH } from '@/constants/greenApi';

import styles from './MessageComposer.module.css';

type Props = {
  isSending: boolean;
  onSend: (text: string) => void;
};

// Поле ввода сообщения, как в MAX: плавающая панель под перепиской. Хранит только текст:
// обрезку и отправку делает useSendMessage. Черновики по чатам не храним — при смене чата
// ChatPanel пересоздаёт компонент (key), поле очищается и получает фокус
export function MessageComposer({ isSending, onSend }: Props) {
  const { t } = useTranslation();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState('');

  const hasText = text.trim() !== '';
  // Пока сообщение отправляется, набирать следующее можно, отправить — нет (п. 6.3)
  const isSendDisabled = !hasText || isSending;

  function submitText() {
    if (isSendDisabled) {
      return;
    }

    onSend(text);
    setText('');
    textareaRef.current?.focus();
  }

  function handleTextChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setText(event.target.value);
  }

  // Enter — отправка, Shift+Enter — перенос строки. Enter, подтверждающий ввод через IME, не отправляет
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    submitText();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitText();
  }

  // Высота по содержимому: сброс и замер scrollHeight. Предел — max-height в стилях, дальше прокрутка.
  // useLayoutEffect — до отрисовки, чтобы поле не мигало при переносе строки
  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className={styles.container}>
      <form className={styles.composer} onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          name="message"
          rows={1}
          value={text}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder={t('pages.chat.composer.placeholder')}
          aria-label={t('pages.chat.composer.placeholder')}
          autoFocus
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
        />
        <div className={styles.actions}>
          <IconButton
            type="submit"
            label={t('pages.chat.composer.send')}
            icon={<SendIcon />}
            variant="primary"
            size="small"
            disabled={isSendDisabled}
          />
        </div>
      </form>
    </div>
  );
}
