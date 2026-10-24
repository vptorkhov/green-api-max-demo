import { joinClassNames } from '@/utils/joinClassNames';

import { AlertIcon } from '../icons/AlertIcon';

import styles from './ErrorMessage.module.css';

type Props = {
  // Уже переведённый текст: компонент не знает про ключи локализации
  message: string;
  className?: string;
};

// Блок ошибки запроса (вход, создание чата, отправка). role="alert" — скринридер озвучит сразу
export function ErrorMessage({ message, className }: Props) {
  return (
    <div className={joinClassNames(styles.errorMessage, className)} role="alert">
      <AlertIcon className={styles.icon} />
      <p className={styles.text}>{message}</p>
    </div>
  );
}
