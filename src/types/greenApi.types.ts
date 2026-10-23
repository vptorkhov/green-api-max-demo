// Учётные данные инстанса GREEN-API (GreenApiNotes.md §1).
// Передаются в HTTP-клиент аргументом; idInstance — строка цифр, как в URL.
export type GreenApiCredentials = {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
};

// Функция-проверка формы данных: сужает unknown (ответ сети, значение из localStorage) до T.
export type TypeGuard<T> = (value: unknown) => value is T;
