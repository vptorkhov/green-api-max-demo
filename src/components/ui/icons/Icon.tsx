import type { ComponentProps, ReactNode } from 'react';

import { joinClassNames } from '@/utils/joinClassNames';

import styles from './Icon.module.css';

export type IconProps = Omit<ComponentProps<'svg'>, 'children'>;

type Props = IconProps & {
  children: ReactNode;
};

// Основа иконок: контурные пути 24×24, цвет — currentColor, размер — CSS-переменная --icon-size.
// Иконки декоративные: подпись даёт кнопка (aria-label), поэтому aria-hidden.
export function Icon({ className, children, ...svgProps }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      {...svgProps}
      className={joinClassNames(styles.icon, className)}
    >
      {children}
    </svg>
  );
}
