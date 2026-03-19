import type { CreateImageStateReason } from "../errorTypes";

/**
 * Maps CreateImageState failure reasons to user-facing messages.
 */
export function getCreateImageStateErrorMessage(reason: CreateImageStateReason): string {
  switch (reason) {
    case "InvalidUrl":
      return "Invalid URL";
    case "ImageLoadFailed":
    case "BlobCreateFailed":
      return "Failed to load image";
    default:
      return "Failed to load image";
  }
}
