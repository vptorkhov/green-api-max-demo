// Пауза, которую прерывает отмена: выход, размонтирование или смена чата не ждут конца задержки.
// После отмены промис завершается успешно — вызывающий проверяет signal.aborted
export function wait(delayMs: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timeoutId = setTimeout(resolve, delayMs);

    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeoutId);
        resolve();
      },
      { once: true },
    );
  });
}
