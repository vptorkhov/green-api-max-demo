import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// Число непрочитанных перед заголовком вкладки: «(3) Чат MAX через GREEN-API» (п. 8.8).
// Базовый заголовок при смене языка ставит i18n.ts; эффект зависит от t и выполняется после него.
// При выходе (размонтирование экрана чата) заголовок возвращается к базовому
export function useUnreadDocumentTitle(unreadCount: number) {
  const { t } = useTranslation();

  useEffect(() => {
    const appTitle = t('common.appTitle');

    document.title =
      unreadCount > 0
        ? t('common.appTitleWithUnread', { count: unreadCount, title: appTitle })
        : appTitle;

    return () => {
      document.title = appTitle;
    };
  }, [t, unreadCount]);
}
