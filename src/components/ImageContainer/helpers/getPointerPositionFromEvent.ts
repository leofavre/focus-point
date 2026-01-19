import type { Coordinates } from "../types";

export function getPointerCoordinatesFromEvent({
  clientX,
  clientY,
}: {
  clientX: number;
  clientY: number;
}): Coordinates {
  return { x: clientX, y: clientY };
}
