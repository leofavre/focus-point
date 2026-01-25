import { useMemo } from "react";
import { ASPECT_RATIO_LIST, ASPECT_RATIO_PRECISION } from "./constants";
import { toPreciseAspectRatio } from "./helpers";

const margin = ASPECT_RATIO_PRECISION * 0.1;

export function useAspectRatioList(originalAspectRatioValue?: number) {
  return useMemo(() => {
    if (!originalAspectRatioValue) return ASPECT_RATIO_LIST;

    const original = {
      name: "original",
      value: originalAspectRatioValue,
      preciseValue: toPreciseAspectRatio(originalAspectRatioValue),
    };

    return [...ASPECT_RATIO_LIST, original]
      .sort((a, b) => a.preciseValue - b.preciseValue)
      .filter(
        ({ name, preciseValue }) =>
          (name === original.name && preciseValue === original.preciseValue) ||
          preciseValue < original.preciseValue - margin ||
          preciseValue > original.preciseValue + margin,
      );
  }, [originalAspectRatioValue]);
}
