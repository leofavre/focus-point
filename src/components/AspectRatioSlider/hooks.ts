import { useMemo } from "react";
import { ASPECT_RATIO_LIST } from "./constants";
import { toLogPosition, toPreciseAspectRatio } from "./helpers";
import type { AspectRatio } from "./types";

const THRESHOLD = 0.01;

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
      preciseValue: toPreciseAspectRatio(originalAspectRatioValue),
      position: toLogPosition(originalAspectRatioValue, minValue, maxValue),
    };

    return [...ASPECT_RATIO_LIST, original]
      .sort((a, b) => a.value - b.value)
      .filter(
        ({ name, value }) =>
          (name === original.name && value === original.value) ||
          value < original.value - THRESHOLD ||
          value > original.value + THRESHOLD,
      );
  }, [originalAspectRatioValue]);
}
