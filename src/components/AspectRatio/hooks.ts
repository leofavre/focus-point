import { useMemo } from "react";
import { ASPECT_RATIO } from "./constants";
import { toPreciseAspectRatio } from "./helpers";

export function useAspectRatioList(originalAspectRatioValue?: number) {
  return useMemo(() => {
    if (!originalAspectRatioValue) return ASPECT_RATIO;

    const originalAspectRatio = {
      name: "original",
      value: originalAspectRatioValue,
      preciseValue: toPreciseAspectRatio(originalAspectRatioValue),
    };

    return [...ASPECT_RATIO, originalAspectRatio]
      .sort((a, b) => a.preciseValue - b.preciseValue)
      .filter(
        (n) =>
          (n.name === originalAspectRatio.name &&
            n.preciseValue === originalAspectRatio.preciseValue) ||
          n.preciseValue < originalAspectRatio.preciseValue - 250 ||
          n.preciseValue > originalAspectRatio.preciseValue + 250,
      );
  }, [originalAspectRatioValue]);
}
