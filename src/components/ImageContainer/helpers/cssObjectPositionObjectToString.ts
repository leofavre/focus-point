import { clamp, roundWithTwoDecimals } from "../../../helpers";
import type { Coordinates } from "../types";

export function cssObjectPositionObjectToString({ x, y }: Coordinates): string {
  const clampedX = roundWithTwoDecimals(clamp(x, 0, 100));
  const clampedY = roundWithTwoDecimals(clamp(y, 0, 100));

  return `${clampedX}% ${clampedY}%`;
}
