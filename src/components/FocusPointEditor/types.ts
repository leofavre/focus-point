import type { RefObject, SyntheticEvent } from "react";
import type { ObjectPositionString, StyleProps } from "../../types";

/**
 * Represents a point in 2D space.
 */
export type Coordinates = {
  x: number;
  y: number;
};

/**
 * Represents the dimensions of an image.
 */
export type Dimensions = {
  width: number;
  height: number;
};

/**
 * Describes the difference in width and height between two images, when one image
 * contains the other and they share at least one common dimension (width or height).
 */
export type ImageDimensionDelta = {
  /**
   * The width difference between two images (e.g., containing versus contained).
   */
  width: { px: number; percent: number };

  /**
   * The height difference between two images (e.g., containing versus contained).
   */
  height: { px: number; percent: number };

  /**
   * The dimension that changed between two images that share at least one common dimension.
   */
  changedDimension: "width" | "height" | undefined;
};

export type FocusPointEditorProps = StyleProps & {
  ref: RefObject<HTMLImageElement | null>;
  imageUrl: string;
  aspectRatio?: number;
  naturalAspectRatio?: number;
  objectPosition: ObjectPositionString;
  onObjectPositionChange: (objectPosition: ObjectPositionString) => void;
  onImageLoad: (event: SyntheticEvent<HTMLImageElement>) => void;
  onImageError: (event: SyntheticEvent<HTMLImageElement>) => void;
};
