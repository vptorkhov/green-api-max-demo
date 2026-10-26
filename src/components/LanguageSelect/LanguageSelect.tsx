import { useTranslation } from 'react-i18next';

import { SegmentedControl } from '@/components/ui/SegmentedControl/SegmentedControl';
import { useLanguage } from '@/hooks/useLanguage';
import { SUPPORTED_LANGUAGES } from '@/localization/languages';

type Props = {
  isLabelVisible?: boolean;
  className?: string;
};

// Выбор языка (п. 8.4) — на экране входа и в меню настроек экрана чата, поэтому в общем слое.
// Названия языков — каждое на своём языке («Русский», «English»), как принято в переключателях
export function LanguageSelect({ isLabelVisible = false, className }: Props) {
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  const options = SUPPORTED_LANGUAGES.map((value) => ({
    value,
    label: t(`components.languageSelect.languages.${value}`),
  }));

  return (
    <SegmentedControl
      className={className}
      label={t('components.languageSelect.label')}
      isLabelVisible={isLabelVisible}
      options={options}
      value={language}
      onChange={changeLanguage}
    />
  );
}
