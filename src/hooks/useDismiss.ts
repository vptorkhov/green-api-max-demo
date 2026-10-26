import { type RefObject, useEffect, useRef } from 'react';

export type DismissReason = 'escape' | 'outsideClick';

type Options = {
  isOpen: boolean;
  // Нажатие внутри этого элемента (кнопка и панель) не закрывает
  containerRef: RefObject<HTMLElement | null>;
  onDismiss: (reason: DismissReason) => void;
};

// Закрытие выпадающей панели по Escape и нажатию снаружи (п. 8.4). Подписка — только пока панель
// открыта; последний обработчик хранится в ref, чтобы новая функция не переподписывала события
export function useDismiss({ isOpen, containerRef, onDismiss }: Options) {
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      const isInside = event.target instanceof Node && containerRef.current?.contains(event.target);

      if (!isInside) {
        onDismissRef.current('outsideClick');
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onDismissRef.current('escape');
      }
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, containerRef]);
}
