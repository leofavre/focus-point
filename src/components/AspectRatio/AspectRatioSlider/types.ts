import type { RefObject } from "react";
import type { StyleProps } from "../../../types";
import type { AspectRatio } from "../types";

export type AspectRatioSliderProps = StyleProps & {
  ref?: RefObject<HTMLInputElement | null>;
  aspectRatio: number;
  aspectRatioList: AspectRatio[];
  onAspectRatioChange?: (aspectRatio: number) => void;
};
