import { UserIcon } from '@/components/ui/icons/UserIcon';
import { joinClassNames } from '@/utils/joinClassNames';

import styles from './ChatAvatar.module.css';

type ChatAvatarSize = 'list' | 'header';

type Props = {
  name?: string;
  // list — 56px (список чатов), header — 40px (шапка переписки), как в MAX
  size: ChatAvatarSize;
};

// Фото собеседников нет — первая буква имени или иконка. Декоративный: имя рядом в тексте
export function ChatAvatar({ name, size }: Props) {
  const initial = name?.trim().charAt(0).toUpperCase() ?? '';
  const hasInitial = initial !== '';

  return (
    <span className={joinClassNames(styles.avatar, styles[size])} aria-hidden>
      {hasInitial ? initial : <UserIcon />}
    </span>
  );
}
