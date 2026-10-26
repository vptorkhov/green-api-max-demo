import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import type { Message } from '../types/chat.types';

// Допуск «внизу»: дробные пиксели при масштабе и пара пикселей недокрутки не считаются чтением истории
const BOTTOM_THRESHOLD_PX = 32;

function getDistanceToBottom(element: HTMLElement) {
  return element.scrollHeight - element.scrollTop - element.clientHeight;
}

// Плавно, если пользователь не просил уменьшить анимацию
function getScrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
}

// Сводка о переписке для сравнения с прошлым рендером: что именно изменилось
type MessagesSnapshot = {
  count: number;
  lastId: string | null;
};

// Прокрутка переписки (п. 8.2). Список монтируется заново для каждого чата (key в ChatPanel),
// поэтому «открытие чата» — это монтирование:
// * при открытии — сразу в конец;
// * одно новое сообщение в конце: своё отправленное (sending) — всегда вниз, остальные — вниз,
//   только если пользователь был внизу; иначе появляется кнопка «вниз»;
// * пачка сообщений (история, п. 7.10) или изменение размера области (растёт поле ввода) —
//   мгновенно удерживается конец, если пользователь был внизу
export function useAutoScroll(messages: Message[]) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Был ли пользователь внизу до изменения — читается в эффектах, поэтому ref, а не состояние
  const isAtBottomRef = useRef(true);
  // Прошлая позиция: «ушёл читать историю» — только прокрутка вверх (см. handleScroll)
  const lastScrollTopRef = useRef(0);
  const snapshotRef = useRef<MessagesSnapshot | null>(null);
  // Для кнопки «вниз»
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior) => {
    const scrollElement = scrollRef.current;

    if (scrollElement === null) {
      return;
    }

    isAtBottomRef.current = true;
    scrollElement.scrollTo({ top: scrollElement.scrollHeight, behavior });
  }, []);

  // Позиция пользователя и удержание конца при изменении размера области
  useEffect(() => {
    const scrollElement = scrollRef.current;

    if (scrollElement === null) {
      return;
    }

    const element = scrollElement;

    // «Не внизу» — только когда позиция ушла вверх, то есть прокрутил пользователь. Остальные
    // события scroll (плавная прокрутка к концу, подкрутка при росте поля ввода) приходят с
    // опозданием на кадр, когда конец мог уже снова отодвинуться, — по расстоянию их не отличить
    function handleScroll() {
      const { scrollTop } = element;
      const isScrolledUp = scrollTop < lastScrollTopRef.current;

      lastScrollTopRef.current = scrollTop;

      if (getDistanceToBottom(element) <= BOTTOM_THRESHOLD_PX) {
        isAtBottomRef.current = true;
        setIsAtBottom(true);
      } else if (isScrolledUp) {
        isAtBottomRef.current = false;
        setIsAtBottom(false);
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      if (isAtBottomRef.current) {
        element.scrollTop = element.scrollHeight;
      }
    });

    lastScrollTopRef.current = element.scrollTop;
    element.addEventListener('scroll', handleScroll, { passive: true });
    resizeObserver.observe(element);

    return () => {
      element.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
    };
  }, []);

  // До отрисовки кадра: пользователь не видит переписку в старой позиции
  useLayoutEffect(() => {
    const previous = snapshotRef.current;
    const lastMessage = messages.at(-1);
    const snapshot: MessagesSnapshot = { count: messages.length, lastId: lastMessage?.id ?? null };

    snapshotRef.current = snapshot;

    // Открытие чата
    if (previous === null) {
      scrollToBottom('auto');

      return;
    }

    const addedCount = snapshot.count - previous.count;
    const isLastChanged = snapshot.lastId !== previous.lastId;

    // Смена статуса, подмена id и т. п. — прокрутка не нужна
    if (addedCount <= 0 && !isLastChanged) {
      return;
    }

    const isNewMessage = addedCount === 1 && isLastChanged;
    const isOwnSentMessage =
      isNewMessage && lastMessage?.direction === 'outgoing' && lastMessage.status === 'sending';

    if (isOwnSentMessage || (isNewMessage && isAtBottomRef.current)) {
      scrollToBottom(getScrollBehavior());
    } else if (isAtBottomRef.current) {
      scrollToBottom('auto');
    }
  }, [messages, scrollToBottom]);

  // Кнопка «вниз»: прячется сразу, не дожидаясь конца плавной прокрутки
  function handleScrollToBottomClick() {
    setIsAtBottom(true);
    scrollToBottom(getScrollBehavior());
  }

  return {
    scrollRef,
    isAtBottom,
    scrollToBottom: handleScrollToBottomClick,
  };
}
