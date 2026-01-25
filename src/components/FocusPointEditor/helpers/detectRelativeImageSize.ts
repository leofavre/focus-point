import { IMAGE_AREA_RATIO } from "../constants";

/**
 * Computes the image height as a percentage of the viewport height so that the image area
 * equals `viewportHeight² * IMAGE_AREA_RATIO`, given the image’s aspect ratio.
 * Uses `document.documentElement.clientHeight` as the viewport height.
 *
 * @param aspectRatio - Optional width/height of the image. If omitted, returns `undefined`.
 * @returns The height as a percentage of the viewport, or `undefined` if `aspectRatio` is missing.
 */
export function detectProportionalImageHeight({ aspectRatio }: { aspectRatio?: number }) {
  if (aspectRatio == null) return;

  const containerHeight = window.document.documentElement.clientHeight;
  const containerArea = containerHeight ** 2;
  const imageArea = containerArea * IMAGE_AREA_RATIO;
  const height = Math.sqrt(imageArea / aspectRatio);

  return (height / containerHeight) * 100;
}
