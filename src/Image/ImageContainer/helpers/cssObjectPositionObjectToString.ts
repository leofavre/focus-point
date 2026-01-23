import { clamp, roundWithTwoDecimals } from "../../../helpers";
import type { ObjectPositionObject, ObjectPositionString } from "../../../types";

export function cssObjectPositionObjectToString({
  x,
  y,
}: ObjectPositionObject): ObjectPositionString {
  const clampedX = roundWithTwoDecimals(clamp(x, 0, 100));
  const clampedY = roundWithTwoDecimals(clamp(y, 0, 100));

  return `${clampedX}% ${clampedY}%`;
}
