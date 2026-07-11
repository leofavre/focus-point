import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";

export type SiteTitleProps = {
  ref?: Ref<HTMLHeadingElement>;
  children?: ReactNode;
} & ComponentPropsWithoutRef<"h1">;
