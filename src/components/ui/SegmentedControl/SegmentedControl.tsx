import { useId } from 'react';

import { joinClassNames } from '@/utils/joinClassNames';

import styles from './SegmentedControl.module.css';

type Option<Value extends string> = {
  value: Value;
  // Уже переведённый текст: компонент не знает про i18next
  label: string;
};

type Props<Value extends string> = {
  // Подпись группы: видимая или только для скринридера
  label: string;
  isLabelVisible?: boolean;
  options: readonly Option<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  className?: string;
};

// Выбор одного варианта из нескольких — язык (п. 8.4), тема (п. 8.5). Нативные radio:
// стрелки переключают вариант, Tab переходит к группе целиком
export function SegmentedControl<Value extends string>({
  label,
  isLabelVisible = false,
  options,
  value,
  onChange,
  className,
}: Props<Value>) {
  const name = useId();
  const labelId = useId();

  return (
    <div className={joinClassNames(styles.control, className)}>
      {isLabelVisible && (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      )}
      <div
        role="radiogroup"
        className={styles.segments}
        aria-labelledby={isLabelVisible ? labelId : undefined}
        aria-label={isLabelVisible ? undefined : label}
      >
        {options.map((option) => (
          <label key={option.value} className={styles.segment}>
            <input
              type="radio"
              className={styles.input}
              name={name}
              value={option.value}
              checked={option.value === value}
              onChange={() => {
                onChange(option.value);
              }}
            />
            <span className={styles.text}>{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
