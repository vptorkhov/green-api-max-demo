import { useEffect, useRef } from 'react';

// Возвращает фокус, когда закрывается часть интерфейса, в которой он был (п. 8.7): панель
// «Найти по номеру», переписка на узком экране. Фокус исчезает вместе с элементом и оказывается
// на body — без этого пользователь клавиатуры начинал бы обход с начала страницы.
// Если фокус уже поставлен (autoFocus поля ввода открывшегося чата), он не трогается
export function useReturnFocusOnClose(
  isOpen: boolean,
  getTarget: () => HTMLElement | null | undefined,
) {
  const wasOpenRef = useRef(isOpen);

  useEffect(() => {
    const wasOpen = wasOpenRef.current;
    wasOpenRef.current = isOpen;

    const isFocusLost = document.activeElement === null || document.activeElement === document.body;

    if (wasOpen && !isOpen && isFocusLost) {
      getTarget()?.focus();
    }
  }, [isOpen, getTarget]);
}
