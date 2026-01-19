export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(value, min));
}

export function roundWithTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function toPercentage(a: number, b: number): number {
  return b > 0 ? (a / b) * 100 : 0;
}
