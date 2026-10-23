import { useCallback, useState } from 'react';

import type { StorageKey } from '@/constants/storageKeys';
import type { TypeGuard } from '@/types/greenApi.types';
import { readStorage, removeStorage, writeStorage } from '@/utils/storage';

// Состояние, синхронизированное с localStorage. Начальное значение читается один раз при монтировании;
// отсутствующее, повреждённое или неверное по форме значение заменяется на defaultValue.
// key должен быть постоянным: при его смене состояние не перечитывается.
// defaultValue — примитив или константа вне компонента, иначе removeValue меняется на каждом рендере.
export function useLocalStorageState<T>(key: StorageKey, guard: TypeGuard<T>, defaultValue: T) {
  const [value, setStateValue] = useState<T>(() => readStorage(key, guard) ?? defaultValue);

  // useCallback: хук используется в Context-провайдерах (учётные данные, тема) —
  // нужны стабильные ссылки для мемоизированного значения контекста (ProjectRules §13)
  const setValue = useCallback(
    (nextValue: T) => {
      writeStorage(key, nextValue);
      setStateValue(nextValue);
    },
    [key],
  );

  // Удаляет запись из хранилища (например, при выходе) и возвращает значение по умолчанию
  const removeValue = useCallback(() => {
    removeStorage(key);
    setStateValue(defaultValue);
  }, [key, defaultValue]);

  return {
    value,
    setValue,
    removeValue,
  };
}
