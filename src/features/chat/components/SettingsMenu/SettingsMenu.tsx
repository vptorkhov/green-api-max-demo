import { useCallback, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LanguageSelect } from '@/components/LanguageSelect/LanguageSelect';
import { IconButton } from '@/components/ui/IconButton/IconButton';
import { SettingsIcon } from '@/components/ui/icons/SettingsIcon';
import { type DismissReason, useDismiss } from '@/hooks/useDismiss';

import styles from './SettingsMenu.module.css';

// «Настройки» в шапке боковой панели (решение разработчика в 8.4): в MAX язык и тема — в настройках,
// но панели-рейки у нас нет. Выпадающая панель в стиле меню MAX; тема добавится в 8.5
export function SettingsMenu() {
  const { t } = useTranslation();

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const [isOpen, setIsOpen] = useState(false);

  // Escape возвращает фокус на кнопку: иначе он остался бы на исчезнувшей панели
  const handleDismiss = useCallback((reason: DismissReason) => {
    setIsOpen(false);

    if (reason === 'escape') {
      buttonRef.current?.focus();
    }
  }, []);

  useDismiss({ isOpen, containerRef, onDismiss: handleDismiss });

  function handleToggleClick() {
    setIsOpen((currentIsOpen) => !currentIsOpen);
  }

  return (
    <div ref={containerRef} className={styles.menu}>
      <IconButton
        ref={buttonRef}
        label={t('pages.chat.settings.title')}
        icon={<SettingsIcon />}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleToggleClick}
      />
      {isOpen && (
        <div
          id={panelId}
          className={styles.panel}
          role="group"
          aria-label={t('pages.chat.settings.title')}
        >
          <LanguageSelect isLabelVisible />
        </div>
      )}
    </div>
  );
}
