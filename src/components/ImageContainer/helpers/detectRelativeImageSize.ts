import { IMAGE_AREA_RATIO } from "../constants";

export function detectProportionalImageHeight({ aspectRatio }: { aspectRatio?: number }) {
  if (aspectRatio == null) return;

  const containerHeight = window.document.documentElement.clientHeight;
  const containerArea = containerHeight ** 2;
  const imageArea = containerArea * IMAGE_AREA_RATIO;
  const height = Math.sqrt(imageArea / aspectRatio);

  return (height / containerHeight) * 100;
}
