// Статусы инстанса MAX (GreenApiNotes.md §2, api-docs/account/GetStateInstance.md).
// Вход разрешён только при authorized; для остальных — своё сообщение (п. 4.3)
export type InstanceState =
  'authorized' | 'notAuthorized' | 'starting' | 'blocked' | 'suspended' | 'pendingPassword';

// Ответ getStateInstance: {"stateInstance":"authorized"}
export type GetStateInstanceResponse = {
  stateInstance: InstanceState;
};
