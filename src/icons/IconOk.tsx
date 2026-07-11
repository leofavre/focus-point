import type { SVGProps } from "react";

export const IconOk = (props: SVGProps<SVGSVGElement>) => {
  return (
    /* biome-ignore lint/a11y/noSvgWithoutTitle: Decorative icon, hidden from screen readers */
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22" fill="none" aria-hidden {...props}>
      <path d="M4 9L8.5 15.5L20 8" stroke="currentColor" strokeWidth={2} />
    </svg>
  );
};
