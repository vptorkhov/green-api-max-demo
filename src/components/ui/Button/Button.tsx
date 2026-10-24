import type { ComponentProps } from 'react';

import { joinClassNames } from '@/utils/joinClassNames';

import { Spinner } from '../Spinner/Spinner';

import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type Props = ComponentProps<'button'> & {
  variant?: ButtonVariant;
  // Спиннер вместо текста и блокировка кнопки на время запроса (ProjectRules §12)
  isLoading?: boolean;
};

// Текстовая кнопка. По умолчанию type="button": отправка формы — только явным type="submit"
export function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  type = 'button',
  className,
  children,
  ...buttonProps
}: Props) {
  const isDisabled = Boolean(disabled) || isLoading;

  return (
    <button
      {...buttonProps}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={joinClassNames(
        styles.button,
        styles[variant],
        isLoading && styles.loading,
        className,
      )}
    >
      <span className={styles.content}>{children}</span>
      {isLoading && <Spinner className={styles.spinner} />}
    </button>
  );
}
