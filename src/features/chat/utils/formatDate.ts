// Даты и время переписки (п. 8.3) — Intl.DateTimeFormat с языком интерфейса: компоненты передают
// i18n.language и перерисовываются при его смене, поэтому форматы меняются без перезагрузки

// Время по правилам языка интерфейса: «13:46» (ru) / «1:46 PM» (en)
export function formatMessageTime(timestamp: number, language: string) {
  return new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' }).format(
    timestamp,
  );
}

export function isSameDay(firstTimestamp: number, secondTimestamp: number) {
  const first = new Date(firstTimestamp);
  const second = new Date(secondTimestamp);

  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

// Время в списке чатов, как в MAX: сегодня — «13:46», раньше — «22 окт.», в прошлом году — с годом
export function formatChatListTime(timestamp: number, language: string, now = Date.now()) {
  const date = new Date(timestamp);
  const today = new Date(now);

  if (isSameDay(timestamp, now)) {
    return formatMessageTime(timestamp, language);
  }

  const isSameYear = date.getFullYear() === today.getFullYear();

  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
    ...(isSameYear ? {} : { year: 'numeric' }),
  }).format(date);
}

// Подпись разделителя дней в переписке: «Сегодня» и «Вчера» — из словаря, остальное —
// «22 октября» (ru) / «October 22» (en), в прошлом году — с годом
type DaySeparatorLabel = { type: 'today' } | { type: 'yesterday' } | { type: 'date'; text: string };

export function getDaySeparatorLabel(
  timestamp: number,
  language: string,
  now = Date.now(),
): DaySeparatorLabel {
  if (isSameDay(timestamp, now)) {
    return { type: 'today' };
  }

  // Вчера — по календарю, а не «24 часа назад»: setDate учитывает переход на летнее время
  const yesterday = new Date(now);

  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(timestamp, yesterday.getTime())) {
    return { type: 'yesterday' };
  }

  const isSameYear = new Date(timestamp).getFullYear() === new Date(now).getFullYear();
  const text = new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'long',
    ...(isSameYear ? {} : { year: 'numeric' }),
  }).format(timestamp);

  return { type: 'date', text };
}
