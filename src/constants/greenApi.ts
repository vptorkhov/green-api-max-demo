// Адрес API по умолчанию. У каждого инстанса свой apiUrl в личном кабинете,
// поэтому в форме входа значение только предзаполняется (GreenApiNotes.md §1).
export const DEFAULT_API_URL = 'https://api.green-api.com';

// Таймаут обычного запроса. Без него несуществующий idInstance отвечает 504
// только через ~60 с и подвешивает форму входа (GreenApiNotes.md §9).
// Для receiveNotification таймаут считается отдельно: receiveTimeout + запас (этап 7).
export const REQUEST_TIMEOUT_MS = 15_000;

// Личный кабинет GREEN-API: там idInstance, apiTokenInstance и apiUrl инстанса
export const GREEN_API_CONSOLE_URL = 'https://console.green-api.com';

// Максимальная длина текста sendMessage: длиннее — 400 Validation failed (GreenApiNotes.md §5)
export const MAX_MESSAGE_LENGTH = 4000;

// Long polling receiveNotification: сервер держит запрос до receiveTimeout секунд (допустимо 5–60),
// если уведомлений нет. Больше значение — реже пустые запросы; уведомление приходит сразу при появлении
export const RECEIVE_TIMEOUT_SECONDS = 20;

// Запас к receiveTimeout для таймаута самого запроса: пустая очередь отвечает на 1–2 с позже
// receiveTimeout (GreenApiNotes.md §6). Общий REQUEST_TIMEOUT_MS для long polling не подходит
export const RECEIVE_REQUEST_TIMEOUT_MARGIN_MS = 10_000;

// Повтор опроса после ошибки (сеть, сервер, лимит частоты, инстанс недоступен): пауза растёт
// экспоненциально — 1, 2, 4 … 30 с — и сбрасывается после первого успешного запроса (п. 7.4)
export const POLLING_RETRY_INITIAL_DELAY_MS = 1000;
export const POLLING_RETRY_DELAY_MULTIPLIER = 2;
export const POLLING_RETRY_MAX_DELAY_MS = 30_000;
