import type { Coordinates } from "../types";

/**
 * Maps `clientX` and `clientY` from a pointer/touch event into a `{ x, y }` coordinates object.
 *
 * @param clientX - The pointer’s X coordinate (e.g. from `MouseEvent` or `Touch`).
 * @param clientY - The pointer’s Y coordinate.
 * @returns Object with `x` and `y` matching the pointer position.
 */
export function getPointerCoordinatesFromEvent({
  clientX,
  clientY,
}: {
  clientX: number;
  clientY: number;
}): Coordinates {
  return { x: clientX, y: clientY };
}
