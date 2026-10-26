import { Icon, type IconProps } from './Icon';

// К последним сообщениям переписки
export function ArrowDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </Icon>
  );
}
