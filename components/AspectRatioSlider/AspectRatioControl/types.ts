import type { Ref } from "react";
import type { AspectRatio } from "../types";

export type AspectRatioControlProps = {
  ref?: Ref<HTMLInputElement>;
  aspectRatio?: number;
  aspectRatioList: AspectRatio[];
  onAspectRatioChange?: (aspectRatio: number) => void;
  disabled?: boolean;
};
