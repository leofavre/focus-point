import type { RefObject } from "react";
import type { ObjectPositionString, StyleProps } from "../../types";

export type CodeSnippetProps = StyleProps & {
  ref?: RefObject<HTMLPreElement>;
  src: string;
  objectPosition: ObjectPositionString;
};
