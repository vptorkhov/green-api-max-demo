// Время по правилам языка интерфейса: «13:46» (ru) / «1:46 PM» (en)
export function formatMessageTime(timestamp: number, language: string) {
  return new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' }).format(
    timestamp,
  );
}

function isSameDay(first: Date, second: Date) {
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

  if (isSameDay(date, today)) {
    return formatMessageTime(timestamp, language);
  }

  const isSameYear = date.getFullYear() === today.getFullYear();

  return new Intl.DateTimeFormat(language, {
    day: 'numeric',
    month: 'short',
    ...(isSameYear ? {} : { year: 'numeric' }),
  }).format(date);
}
