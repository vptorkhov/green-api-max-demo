// Функция-проверка формы данных: сужает unknown (ответ сети, значение из localStorage) до T.
export type TypeGuard<T> = (value: unknown) => value is T;
