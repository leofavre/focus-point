import { toLogPosition } from "./helpers";
import type { AspectRatio } from "./types";

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
  "4:1": 4 / 1,
};

export const ASPECT_RATIO_LIST: AspectRatio[] = Object.entries(ASPECT_RATIO_MAP)
  .map(([name, value]) => ({
    name,
    value,
    position: toLogPosition(value, ASPECT_RATIO_MAP["9:16"], ASPECT_RATIO_MAP["4:1"]),
  }))
  .sort((a, b) => a.value - b.value);

export const POSITION_REPLACEMENT_THRESHOLD = 0.01;
export const POSITION_SNAP_THRESHOLD = POSITION_REPLACEMENT_THRESHOLD / 3;
