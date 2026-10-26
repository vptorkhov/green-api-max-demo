import { useTranslation } from 'react-i18next';

import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl';
import { THEME_MODES } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

type Props = {
  isLabelVisible?: boolean;
  className?: string;
};

// Выбор темы (п. 8.5) — там же, где выбор языка: экран входа и меню настроек экрана чата
export function ThemeSelect({ isLabelVisible = false, className }: Props) {
  const { mode, setMode } = useTheme();
  const { t } = useTranslation();

  const options = THEME_MODES.map((value) => ({
    value,
    label: t(`components.themeSelect.modes.${value}`),
  }));

  return (
    <SegmentedControl
      className={className}
      label={t('components.themeSelect.label')}
      isLabelVisible={isLabelVisible}
      options={options}
      value={mode}
      onChange={setMode}
    />
  );
}
