import type { ImageLoadFailedReason } from "../../errorTypes";
import type { Result } from "../../helpers/errorHandling";
import { resultFromPromise } from "../../helpers/errorHandling";

/**
 * Loads an image from a URL and returns its natural aspect ratio (width / height).
 *
 * Uses the browser's Image API to load the image asynchronously. Useful for
 * determining the intrinsic dimensions of an image before displaying it,
 * e.g. when creating blob URLs from File objects.
 *
 * @returns A promise that resolves with a Result: accepted aspect ratio or rejected with ImageLoadFailed.
 */
export function getNaturalAspectRatioFromImageSrc(
  url: string,
): Promise<Result<number, ImageLoadFailedReason>> {
  const raw = new Promise<number>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth / img.naturalHeight);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
  return resultFromPromise(raw, "ImageLoadFailed");
}
