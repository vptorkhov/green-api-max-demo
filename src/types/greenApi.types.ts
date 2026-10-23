// Учётные данные инстанса GREEN-API (GreenApiNotes.md §1).
// Передаются в HTTP-клиент аргументом; idInstance — строка цифр, как в URL.
export type GreenApiCredentials = {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
};
