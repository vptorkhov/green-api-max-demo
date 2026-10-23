import { type ComponentProps, type ReactNode, useId } from 'react';

import { joinClassNames } from '@/utils/joinClassNames';

import styles from './TextField.module.css';

type Props = ComponentProps<'input'> & {
  label: string;
  // Текст ошибки поля. Пока он есть, подсказка скрыта
  error?: string | null;
  hint?: string;
  // Элемент справа внутри поля (например, кнопка «показать токен»)
  endAdornment?: ReactNode;
};

// Поле ввода с подписью. className применяется к обёртке, остальные props — к <input>
export function TextField({
  label,
  error,
  hint,
  endAdornment,
  id,
  className,
  ...inputProps
}: Props) {
  const generatedId = useId();

  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const hasError = Boolean(error);
  const hasHint = !hasError && Boolean(hint);
  const describedById = hasError ? errorId : hasHint ? hintId : undefined;
  const hasEndAdornment = endAdornment !== undefined;

  return (
    <div className={joinClassNames(styles.field, className)}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <div className={styles.control}>
        <input
          {...inputProps}
          id={inputId}
          className={joinClassNames(
            styles.input,
            hasError && styles.inputInvalid,
            hasEndAdornment && styles.inputWithAdornment,
          )}
          aria-invalid={hasError}
          aria-describedby={describedById}
        />
        {hasEndAdornment && <div className={styles.endAdornment}>{endAdornment}</div>}
      </div>
      {hasError && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
      {hasHint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}
