import { useMemo } from "react";
import { toLogPosition } from "../helpers/toLogPosition";
import type { AspectRatio } from "../types";

type PartialAspectRatio = Omit<AspectRatio, "position">;

const ASPECT_RATIO_MAP: Record<string, number> = {
  "9:16": 9 / 16,
  "4:5": 4 / 5,
  "5:7": 5 / 7,
  "3:4": 3 / 4,
  "3:5": 3 / 5,
  "2:3": 2 / 3,
  "1:1": 1 / 1,
  "3:2": 3 / 2,
  "5:3": 5 / 3,
  "4:3": 4 / 3,
  "7:5": 7 / 5,
  "5:4": 5 / 4,
  "16:9": 16 / 9,
};

const ASPECT_RATIO_LIST: PartialAspectRatio[] = Object.entries(ASPECT_RATIO_MAP)
  .map(([key, value]) => ({
    key,
    displayName: key,
    value,
  }))
  .sort((a, b) => a.value - b.value);

const POSITION_REPLACEMENT_THRESHOLD = 1 / 50;

/**
 * Returns a sorted list of aspect ratio options for the slider.
 *
 * When `originalAspectRatioValue` is provided (e.g. the image’s natural aspect ratio),
 * an "original" entry is added and any preset within {@link POSITION_REPLACEMENT_THRESHOLD}
 * of that value is removed so the slider doesn’t show duplicate ticks.
 *
 * @returns Array of {@link AspectRatio} sorted by value (portrait to landscape)
 */
export function useAspectRatioList(originalAspectRatioValue?: number): AspectRatio[] {
  return useMemo(() => {
    const initialMinValue = ASPECT_RATIO_LIST[0].value;
    const initialMaxValue = ASPECT_RATIO_LIST[ASPECT_RATIO_LIST.length - 1].value;

    const originalDisplayName = ASPECT_RATIO_LIST.find(
      (as) => areAspectRatioValuesSimilar(as.value, originalAspectRatioValue) === false,
    )?.displayName;

    const original: PartialAspectRatio | undefined = originalAspectRatioValue
      ? { key: "original", displayName: originalDisplayName ?? "", value: originalAspectRatioValue }
      : undefined;

    const minValue = Math.min(
      initialMinValue,
      originalAspectRatioValue ?? Number.POSITIVE_INFINITY,
    );

    const maxValue = Math.max(
      initialMaxValue,
      originalAspectRatioValue ?? Number.NEGATIVE_INFINITY,
    );

    return [...ASPECT_RATIO_LIST, ...(original ? [original] : [])]
      .sort((a, b) => a.value - b.value)
      .map((partialAspectRatio) => ({
        ...partialAspectRatio,
        position: toLogPosition(partialAspectRatio.value, minValue, maxValue),
      }))
      .filter(({ key, value }) => {
        if (original == null) return true;

        return (
          (key === original.key && value === original.value) ||
          areAspectRatioValuesSimilar(value, original.value)
        );
      });
  }, [originalAspectRatioValue]);
}

function areAspectRatioValuesSimilar(aspectRatio1Value?: number, aspectRatio2Value?: number) {
  if (aspectRatio1Value == null) return undefined;
  if (aspectRatio2Value == null) return undefined;

  return (
    aspectRatio1Value < aspectRatio2Value - POSITION_REPLACEMENT_THRESHOLD ||
    aspectRatio1Value > aspectRatio2Value + POSITION_REPLACEMENT_THRESHOLD
  );
}
