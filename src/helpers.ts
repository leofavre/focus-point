/**
 * Clamps a numeric value between a minimum and maximum (inclusive).
 *
 * @param value - The value to clamp.
 * @param min - The lower bound.
 * @param max - The upper bound.
 * @returns The clamped value, or `min` / `max` if `value` is outside the range.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(value, min));
}

/**
 * Rounds a number to two decimal places, avoiding floating‑point drift using `Number.EPSILON`.
 *
 * @param value - The number to round.
 * @returns The rounded value.
 */
export function roundWithTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Computes `(a / b) * 100`. Returns `0` when `b` is `0` or less.
 *
 * @param a - The part (numerator).
 * @param b - The whole (denominator).
 * @returns The percentage, or `0` if `b <= 0`.
 */
export function toPercentage(a: number, b: number): number {
  return b > 0 ? (a / b) * 100 : 0;
}

/**
 * Creates a keyboard event handler that maps keys (case-insensitive) to callbacks.
 *
 * The handler checks if the pressed key (case-insensitive) matches any key in the mapping,
 * and if so, calls the corresponding callback. The handler prevents default behavior
 * when a matching key is found.
 *
 * @param keyMap - An object mapping key strings (case-insensitive) to callback functions.
 *   Multiple keys can map to the same callback.
 * @returns A keyboard event handler function.
 *
 * @example
 * ```ts
 * const handler = createKeyboardShortcutHandler({
 *   u: () => console.log("Upload triggered"),
 *   c: () => toggleCode(),
 *   d: () => toggleCode(), // Same action as 'c'
 * });
 *
 * // Use in JSX:
 * <div onKeyDown={handler} tabIndex={0}>
 *   ...
 * </div>
 * ```
 */
export function createKeyboardShortcutHandler(
  keyMap: Record<string, () => void>,
): (event: KeyboardEvent) => void {
  // Normalize keys to lowercase for case-insensitive matching
  const normalizedKeyMap = new Map<string, () => void>();

  for (const [key, callback] of Object.entries(keyMap)) {
    normalizedKeyMap.set(key.toLowerCase(), callback);
  }

  return (event: KeyboardEvent) => {
    const pressedKey = event.key.toLowerCase();
    const callback = normalizedKeyMap.get(pressedKey);

    if (callback) {
      event.preventDefault();
      callback();
    }
  };
}
