import clsx from "clsx";
import type { ChangeEvent } from "react";
import { useCallback, useEffectEvent } from "react";
import { ASPECT_RATIO } from "./constants";
import { toAspectRatio, toPreciseAspectRatio } from "./helpers";
import type { AspectRatioSliderProps } from "./types";

export function AspectRatioSlider({
  ref,
  aspectRatio,
  onAspectRatioChange,
  className,
  ...rest
}: AspectRatioSliderProps) {
  const preciseAspectRatio = toPreciseAspectRatio(aspectRatio ?? 0);

  const minPrecise = Math.min(
    preciseAspectRatio,
    ASPECT_RATIO.at(0)?.preciseValue ?? 0,
  );

  const maxPrecise = Math.max(
    preciseAspectRatio,
    ASPECT_RATIO.at(-1)?.preciseValue ?? 0,
  );

  const stableOnAspectRatioChange = useEffectEvent((aspectRatio: number) => {
    onAspectRatioChange?.(aspectRatio);
  });

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const aspectRatio = toAspectRatio(parseInt(event.target.value, 10));
    stableOnAspectRatioChange(aspectRatio);
  }, []);

  return (
    <div
      className={clsx("flex flex-col items-center gap-2 w-full", className)}
      {...rest}
    >
      <input
        ref={ref}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        type="range"
        step={1}
        min={minPrecise}
        max={maxPrecise}
        value={preciseAspectRatio}
        onChange={handleChange}
      />
    </div>
  );
}
