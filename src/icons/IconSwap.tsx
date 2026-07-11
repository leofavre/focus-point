import type { SVGProps } from "react";

export const IconSwap = (props: SVGProps<SVGSVGElement>) => {
  return (
    /* biome-ignore lint/a11y/noSvgWithoutTitle: Decorative icon, hidden from screen readers */
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" fill="none" aria-hidden {...props}>
      <path d="M7.5 6H4V16H12" stroke="currentColor" strokeWidth={2} />
      <path d="M9 13L12 16L9 19" stroke="currentColor" strokeWidth={1.5} />
      <path d="M14.5 16L18 16L18 6L10 6" stroke="currentColor" strokeWidth={2} />
      <path d="M13 9L10 6L13 3" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
};
