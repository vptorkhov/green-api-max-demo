import { THEME_MODES } from '@/constants/theme';
import type { ThemeMode } from '@/types/theme.types';

// Базовые проверки для type guard'ов данных из сети и localStorage

// Обычный объект: не null и не массив
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

// NaN и Infinity числами не считаются
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

// Значение из localStorage: режим темы (п. 8.5)
export function isThemeMode(value: unknown): value is ThemeMode {
  return THEME_MODES.some((mode) => mode === value);
}
