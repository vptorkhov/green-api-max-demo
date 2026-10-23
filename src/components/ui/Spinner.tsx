import { joinClassNames } from '@/utils/joinClassNames';

import styles from './Spinner.module.css';

type Props = {
  // Подпись для скринридера. Без неё спиннер декоративный (например, внутри кнопки с aria-busy)
  label?: string;
  className?: string;
};

// Индикатор загрузки. Цвет — currentColor, размер — CSS-переменная --spinner-size
export function Spinner({ label, className }: Props) {
  const hasLabel = label !== undefined;

  return (
    <span
      className={joinClassNames(styles.spinner, className)}
      role={hasLabel ? 'status' : undefined}
      aria-label={label}
      aria-hidden={!hasLabel}
    >
      <svg className={styles.svg} viewBox="0 0 24 24" fill="none" focusable="false">
        <circle
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray="42 100"
        />
      </svg>
    </span>
  );
}
