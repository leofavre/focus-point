import type { RefObject, SyntheticEvent } from "react";
import type { StyleProps } from "../../types";

export type Coordinates = {
  x: number;
  y: number;
};

export type Dimensions = {
  width: number;
  height: number;
};

export type ImageObserved = {
  deltaWidthPx: number;
  deltaHeightPx: number;
  deltaWidthPercent: number;
  deltaHeightPercent: number;
  changedDimension: "width" | "height" | undefined;
};

export type ImageContainerProps = StyleProps & {
  ref: RefObject<HTMLImageElement | null>;
  aspectRatio?: number;
  naturalAspectRatio?: number;
  imageUrl: string;
  onImageLoad: (event: SyntheticEvent<HTMLImageElement>) => void;
  onImageError: (event: SyntheticEvent<HTMLImageElement>) => void;
};
