import { useTranslation } from 'react-i18next';

import { getDaySeparatorLabel } from '../../utils/formatDate';

import styles from './DateSeparator.module.css';

type Props = {
  // Время первого сообщения дня
  timestamp: number;
};

// Разделитель дней в переписке — капсула по центру, как .capsuleSeparator в MAX (п. 8.3)
export function DateSeparator({ timestamp }: Props) {
  const { t, i18n } = useTranslation();

  const label = getDaySeparatorLabel(timestamp, i18n.language);
  const text = label.type === 'date' ? label.text : t(`pages.chat.dateSeparator.${label.type}`);

  return (
    <div className={styles.separator}>
      <p className={styles.capsule}>{text}</p>
    </div>
  );
}
