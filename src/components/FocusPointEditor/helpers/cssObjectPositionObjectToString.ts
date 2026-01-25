import { clamp, roundWithTwoDecimals } from "../../../helpers";
import type { ObjectPositionObject, ObjectPositionString } from "../../../types";

/**
 * Converts an `{ x, y }` object (e.g. 0–100) into a CSS `object-position` string (`"x% y%"`).
 * Values are clamped to 0–100 and rounded to two decimals.
 *
 * @param position - Object with `x` and `y` (typically percentages).
 * @returns A string like `"50% 50%"` usable as `object-position`.
 */
export function cssObjectPositionObjectToString({
  x,
  y,
}: ObjectPositionObject): ObjectPositionString {
  const clampedX = String(roundWithTwoDecimals(clamp(x, 0, 100))).replace(/(\.\d)$/, "$10");
  const clampedY = String(roundWithTwoDecimals(clamp(y, 0, 100))).replace(/(\.\d)$/, "$10");

  return `${clampedX}% ${clampedY}%`;
}
