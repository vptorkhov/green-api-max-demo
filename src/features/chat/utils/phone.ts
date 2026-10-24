import type { PhoneValidationErrorKey } from '../types/chat.types';

// Номер телефона — только для поиска собеседника через checkAccount. chatId из номера
// не вычисляется: его возвращает checkAccount (GreenApiNotes.md §3, п. 5.5)

// checkAccount принимает только номера России и Беларуси (GreenApiNotes.md §4).
// Российский код зоны начинается с 3, 4, 8 или 9: так «8 029…» (белорусский номер в домашней записи)
// не превращается в несуществующий «+7 029…», а +7 6xx / 7xx (Казахстан) не тратят лимит checkAccount
const SUPPORTED_PHONE_PATTERNS = [/^7[3489]\d{9}$/, /^375\d{9}$/];

// Разделители, которые пользователи ставят при записи номера: пробелы, скобки, дефисы, точки, «+»
const PHONE_SEPARATORS_PATTERN = /[\s()\-.+]/g;
const RUSSIAN_TRUNK_PREFIX = '8';
const RUSSIAN_LOCAL_LENGTH = 11;

// «+7 (900) 123-45-67», «8 900 123 45 67» → «79001234567». Прочие символы (буквы) не удаляются —
// такой номер отклонит validatePhone
export function normalizePhone(input: string) {
  const phone = input.replace(PHONE_SEPARATORS_PATTERN, '');
  const hasTrunkPrefix =
    phone.length === RUSSIAN_LOCAL_LENGTH && phone.startsWith(RUSSIAN_TRUNK_PREFIX);

  return hasTrunkPrefix ? `7${phone.slice(RUSSIAN_TRUNK_PREFIX.length)}` : phone;
}

// Принимает нормализованный номер. null — номер подходит для checkAccount
export function validatePhone(phone: string): PhoneValidationErrorKey | null {
  if (phone === '') {
    return 'pages.chat.phoneValidation.required';
  }

  const isSupported = SUPPORTED_PHONE_PATTERNS.some((pattern) => pattern.test(phone));

  return isSupported ? null : 'pages.chat.phoneValidation.invalid';
}

// Группы цифр после кода страны: РФ — 900 123-45-67, РБ — 29 123-45-67
const RUSSIAN_PHONE_PATTERN = /^7(\d{3})(\d{3})(\d{2})(\d{2})$/;
const BELARUSIAN_PHONE_PATTERN = /^375(\d{2})(\d{3})(\d{2})(\d{2})$/;

// Номер для списка чатов и шапки: «79001234567» → «+7 900 123-45-67».
// Неизвестный формат показывается как есть с «+», без ошибки
export function formatPhone(phone: string) {
  const russianMatch = RUSSIAN_PHONE_PATTERN.exec(phone);

  if (russianMatch) {
    const [, code, first, second, third] = russianMatch;

    return `+7 ${code} ${first}-${second}-${third}`;
  }

  const belarusianMatch = BELARUSIAN_PHONE_PATTERN.exec(phone);

  if (belarusianMatch) {
    const [, code, first, second, third] = belarusianMatch;

    return `+375 ${code} ${first}-${second}-${third}`;
  }

  return `+${phone}`;
}
