import type { Dimensions } from "../types";

/**
 * Scales `source` dimensions so that the result is just big enough to fully contain `rect`,
 * The output matches either `rect.width` or `rect.height` with the other dimension computed
 * to keep the source aspect ratio.
 *
 * @param source - The original width and height to scale.
 * @param rect - The target width and height.
 * @returns Scaled `{ width, height }` that contains`rect` with same aspect ratio as `source`.
 */
export function scaleDimensionsToContainRect({
  source,
  rect,
}: {
  source: Dimensions;
  rect: Dimensions;
}) {
  const sourceAspectRatio = source.width / source.height;
  const rectAspectRatio = rect.width / rect.height;

  let nextWidth = rect.width;
  let nextHeight = rect.height;

  if (sourceAspectRatio > rectAspectRatio) {
    nextWidth = source.height > 0 ? (rect.height * source.width) / source.height : 0;
  } else {
    nextHeight = source.width > 0 ? (rect.width * source.height) / source.width : 0;
  }

  return {
    width: nextWidth,
    height: nextHeight,
  };
}
