import type { ReactNode } from 'react';

import styles from './VisuallyHidden.module.css';

type Props = {
  children: ReactNode;
};

// Текст только для скринридера: на экране его нет, в дереве доступности — есть.
// Нужен там, где aria-label не работает: у span без роли он запрещён (п. 8.7)
export function VisuallyHidden({ children }: Props) {
  return <span className={styles.visuallyHidden}>{children}</span>;
}
