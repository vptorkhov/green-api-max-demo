// Временный id исходящего сообщения до ответа sendMessage (п. 6.2). Префикс отличает его от idMessage
// GREEN-API (строка цифр): на этапе 7 копия failed с временным id сопоставляется с уведомлением
// об исходящем (п. 7.5), а подтверждённое сообщение со статусом failed — нет
const TEMPORARY_MESSAGE_ID_PREFIX = 'local-';

// crypto.randomUUID доступен только в безопасном контексте: https или localhost
export function createTemporaryMessageId() {
  return `${TEMPORARY_MESSAGE_ID_PREFIX}${crypto.randomUUID()}`;
}

export function isTemporaryMessageId(id: string) {
  return id.startsWith(TEMPORARY_MESSAGE_ID_PREFIX);
}
