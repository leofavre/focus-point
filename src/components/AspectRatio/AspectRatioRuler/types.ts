import type { RefObject } from "react";
import type { StyleProps } from "../../../types";
import type { AspectRatio } from "../types";

export type AspectRatioRulerProps = StyleProps & {
  ref?: RefObject<HTMLUListElement | null>;
  aspectRatioList: AspectRatio[];
};
