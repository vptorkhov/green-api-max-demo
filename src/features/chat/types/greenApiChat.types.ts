// Запросы и ответы методов GREEN-API домена chat (GreenApiNotes.md §4, api-docs/service/CheckAccount.md)

// Номер — число из 11 или 12 цифр (РФ или РБ): так по документации, хотя строку API тоже принимает
export type CheckAccountRequest = {
  phoneNumber: number;
};

// {"exist":true,"chatId":"10000000","fromCache":true}; без MAX — exist: false и пустой chatId
export type CheckAccountResponse = {
  exist: boolean;
  chatId: string;
  fromCache: boolean;
};
