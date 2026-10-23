import { Icon, type IconProps } from './Icon';

// Ошибка: статус «не отправлено» и блок ErrorMessage
export function AlertIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V13M12 16.5h.01" />
    </Icon>
  );
}
