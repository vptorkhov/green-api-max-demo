import { Icon, type IconProps } from './Icon';

// Аватар собеседника без имени
export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.6 3.6-6 8-6s8 2.4 8 6" />
    </Icon>
  );
}
