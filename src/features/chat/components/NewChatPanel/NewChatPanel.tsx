import { type ChangeEvent, type FormEvent, type KeyboardEvent, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button/Button';
import { ErrorMessage } from '@/components/ui/ErrorMessage/ErrorMessage';
import { IconButton } from '@/components/ui/IconButton/IconButton';
import { ArrowLeftIcon } from '@/components/ui/icons/ArrowLeftIcon';
import { TextField } from '@/components/ui/TextField/TextField';

import { useCreateChat } from '../../hooks/useCreateChat';

import styles from './NewChatPanel.module.css';

type Props = {
  onClose: () => void;
};

// Панель «Найти по номеру» поверх списка чатов. Хранит только значение поля,
// проверку номера и checkAccount делает useCreateChat
export function NewChatPanel({ onClose }: Props) {
  const { isLoading, phoneError, error, createChatByPhone } = useCreateChat({ onSuccess: onClose });
  const { t } = useTranslation();
  const titleId = useId();

  const [phone, setPhone] = useState('');

  const phoneErrorMessage = phoneError ? t(phoneError) : null;
  const errorMessage = error ? t(error) : null;
  const hasErrorMessage = errorMessage !== null;

  function handlePhoneChange(event: ChangeEvent<HTMLInputElement>) {
    setPhone(event.target.value);
  }

  // Escape закрывает панель, как кнопка «Назад»
  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      onClose();
    }
  }

  // Отправка по Enter — нативно через <form>; браузерную проверку заменяет validatePhone
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void createChatByPhone(phone);
  }

  return (
    <section className={styles.panel} aria-labelledby={titleId} onKeyDown={handleKeyDown}>
      <header className={styles.header}>
        <IconButton label={t('common.actions.back')} icon={<ArrowLeftIcon />} onClick={onClose} />
        <h2 id={titleId} className={styles.title}>
          {t('pages.chat.newChatForm.title')}
        </h2>
      </header>
      <form className={styles.form} noValidate onSubmit={handleSubmit}>
        {/* disabled у fieldset блокирует поле и кнопку на время запроса */}
        <fieldset className={styles.fields} disabled={isLoading}>
          <TextField
            label={t('pages.chat.newChatForm.phone')}
            name="phone"
            type="tel"
            value={phone}
            placeholder={t('pages.chat.newChatForm.phonePlaceholder')}
            error={phoneErrorMessage}
            hint={t('pages.chat.newChatForm.phoneHint')}
            autoComplete="tel"
            autoFocus
            onChange={handlePhoneChange}
          />
          {hasErrorMessage && <ErrorMessage message={errorMessage} />}
          <Button type="submit" className={styles.submit} isLoading={isLoading}>
            {t('pages.chat.newChatForm.submit')}
          </Button>
        </fieldset>
      </form>
    </section>
  );
}
