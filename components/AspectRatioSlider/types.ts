import type { Ref } from "react";

export type AspectRatio = {
  key: string;
  displayName: string;
  value: number;
  position: number;
};

export type AspectRatioSliderProps = {
  ref?: Ref<HTMLInputElement>;
  aspectRatio?: number;
  defaultAspectRatio?: number;
  onAspectRatioChange?: (aspectRatio: number) => void;
  disabled?: boolean;
};
