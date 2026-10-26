import type { ComponentProps, ReactNode } from 'react';

import { joinClassNames } from '@/utils/joinClassNames';

import styles from './IconButton.module.css';

type IconButtonVariant = 'primary' | 'ghost' | 'floating';
type IconButtonSize = 'small' | 'medium';

type Props = Omit<ComponentProps<'button'>, 'children' | 'aria-label'> & {
  // Обязательная подпись: у кнопки нет текста. Идёт в aria-label и во всплывающую подсказку
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  // small — 32px («+», отправка), medium — 40px (назад, выход), как button--xsmall / --small в MAX
  size?: IconButtonSize;
};

export function IconButton({
  label,
  icon,
  variant = 'ghost',
  size = 'medium',
  type = 'button',
  className,
  ...buttonProps
}: Props) {
  return (
    <button
      {...buttonProps}
      type={type}
      aria-label={label}
      title={label}
      className={joinClassNames(styles.button, styles[variant], styles[size], className)}
    >
      {icon}
    </button>
  );
}
