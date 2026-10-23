import { Icon, type IconProps } from './Icon';

// Отправка сообщения: стрелка вверх, как в MAX
export function SendIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </Icon>
  );
}
