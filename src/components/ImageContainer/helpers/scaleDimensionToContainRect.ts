import type { Dimensions } from "../types";

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
