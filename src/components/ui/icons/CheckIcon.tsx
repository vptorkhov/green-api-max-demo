import { Icon, type IconProps } from './Icon';

// Статус сообщения «отправлено»
export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12.5 9.5 17 19 7" />
    </Icon>
  );
}
