import type { ObjectPositionObject, ObjectPositionString } from "../../../types";

export function cssObjectPositionStringToObject(
  string: ObjectPositionString,
): ObjectPositionObject {
  const [x, y] = string.split(" ");

  return {
    x: Number(x.replace("%", "")),
    y: Number(y.replace("%", "")),
  };
}
