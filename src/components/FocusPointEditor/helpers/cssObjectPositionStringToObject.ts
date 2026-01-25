import type { ObjectPositionObject, ObjectPositionString } from "../../../types";

/**
 * Parses a CSS `object-position` string (`"x% y%"`) into an `{ x, y }` object.
 * Expects two space-separated percentage values (e.g. `"50% 50%"`).
 *
 * @param string - The `object-position` string to parse.
 * @returns Object with numeric `x` and `y` (percent values, "%" stripped).
 */
export function cssObjectPositionStringToObject(
  string: ObjectPositionString,
): ObjectPositionObject {
  const [x, y] = string.split(" ");

  return {
    x: Number(x.replace("%", "")),
    y: Number(y.replace("%", "")),
  };
}
