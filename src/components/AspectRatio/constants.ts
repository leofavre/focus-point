import { toPreciseAspectRatio } from "./helpers";
import type { AspectRatio } from "./types";

export const ASPECT_RATIO_PRECISION = 100_000;

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

export const ASPECT_RATIO_LIST: AspectRatio[] = Object.entries(ASPECT_RATIO_MAP)
  .map(([name, value]) => ({
    name,
    value,
    preciseValue: toPreciseAspectRatio(value),
  }))
  .sort((a, b) => a.preciseValue - b.preciseValue);
