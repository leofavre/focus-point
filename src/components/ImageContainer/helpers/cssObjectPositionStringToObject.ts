import type { Coordinates } from "../types";

export function cssObjectPositionStringToObject(string: string): Coordinates {
  const [x, y] = string.split(" ");

  return {
    x: Number(x.replace("%", "")),
    y: Number(y.replace("%", "")),
  };
}
