// Адрес API по умолчанию. У каждого инстанса свой apiUrl в личном кабинете,
// поэтому в форме входа значение только предзаполняется (GreenApiNotes.md §1).
export const DEFAULT_API_URL = 'https://api.green-api.com';

// Таймаут обычного запроса. Без него несуществующий idInstance отвечает 504
// только через ~60 с и подвешивает форму входа (GreenApiNotes.md §9).
// Для receiveNotification таймаут считается отдельно: receiveTimeout + запас (этап 7).
export const REQUEST_TIMEOUT_MS = 15_000;
