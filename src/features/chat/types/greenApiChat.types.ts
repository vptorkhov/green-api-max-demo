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

// chatId — только из checkAccount или уведомления; формат «номер@c.us» не используем:
// уведомления придут с числовым chatId, а на тарифе Developer это второй чат (GreenApiNotes.md §3)
export type SendMessageRequest = {
  chatId: string;
  message: string;
};

// {"idMessage":"1792758930622"}. HTTP 200 — сообщение принято в очередь, а не доставлено (GreenApiNotes.md §5)
export type SendMessageResponse = {
  idMessage: string;
};

// {"result":true,"reason":""}; result: false — уже удалено или receiptId неизвестен (GreenApiNotes.md §6)
export type DeleteNotificationResponse = {
  result: boolean;
};
