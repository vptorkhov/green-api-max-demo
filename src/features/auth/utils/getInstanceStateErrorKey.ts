import type { InstanceState, InstanceStateErrorKey } from '../types/auth.types';

// Текст отказа во входе по статусу инстанса (GreenApiNotes.md §2). Ключ строится из статуса:
// если для статуса нет текста в pages.auth.instanceState, это ошибка TypeScript
export function getInstanceStateErrorKey(
  state: Exclude<InstanceState, 'authorized'>,
): InstanceStateErrorKey {
  return `pages.auth.instanceState.${state}`;
}
