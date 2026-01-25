import { ASPECT_RATIO_PRECISION } from "./constants";

/**
 * Converts an aspect ratio (width/height) to an integer “precise” value for storage or comparison.
 *
 * @param aspectRatio - The aspect ratio as a decimal (e.g. `16/9`).
 * @returns The aspect ratio scaled by `ASPECT_RATIO_PRECISION` and rounded to an integer.
 */
export function toPreciseAspectRatio(aspectRatio: number) {
  return Math.round(aspectRatio * ASPECT_RATIO_PRECISION);
}

/**
 * Converts a “precise” integer aspect ratio back to the decimal form (width/height).
 *
 * @param preciseAspectRatio - The scaled integer from `toPreciseAspectRatio`.
 * @returns The aspect ratio as a decimal.
 */
export function toAspectRatio(preciseAspectRatio: number) {
  return preciseAspectRatio / ASPECT_RATIO_PRECISION;
}
