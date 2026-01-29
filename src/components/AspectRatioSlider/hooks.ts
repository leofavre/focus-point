import { useMemo } from "react";
import { ASPECT_RATIO_LIST, POSITION_REPLACEMENT_THRESHOLD } from "./constants";
import { toLogPosition } from "./helpers";
import type { AspectRatio } from "./types";

export function useAspectRatioList(originalAspectRatioValue?: number) {
  return useMemo(() => {
    const minValue = ASPECT_RATIO_LIST.at(0)?.value;
    const maxValue = ASPECT_RATIO_LIST.at(-1)?.value;

    if (originalAspectRatioValue == null || minValue == null || maxValue == null) {
      return ASPECT_RATIO_LIST;
    }

    const original: AspectRatio = {
      name: "original",
      value: originalAspectRatioValue,
      position: toLogPosition(originalAspectRatioValue, minValue, maxValue),
    };

    return [...ASPECT_RATIO_LIST, original]
      .sort((a, b) => a.value - b.value)
      .filter(
        ({ name, value }) =>
          (name === original.name && value === original.value) ||
          value < original.value - POSITION_REPLACEMENT_THRESHOLD ||
          value > original.value + POSITION_REPLACEMENT_THRESHOLD,
      );
  }, [originalAspectRatioValue]);
}
