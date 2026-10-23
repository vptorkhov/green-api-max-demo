// Базовые проверки для type guard'ов данных из сети и localStorage

// Обычный объект: не null и не массив
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// NaN и Infinity числами не считаются
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
