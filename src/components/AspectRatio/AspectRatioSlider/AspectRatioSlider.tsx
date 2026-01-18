import clsx from "clsx";
import type { ChangeEvent } from "react";
import { useCallback, useEffectEvent } from "react";
import { toAspectRatio, toPreciseAspectRatio } from "../helpers";
import type { AspectRatioSliderProps } from "./types";

export function AspectRatioSlider({
  ref,
  aspectRatio,
  aspectRatioList,
  onAspectRatioChange,
  className,
  ...rest
}: AspectRatioSliderProps) {
  const preciseAspectRatio = toPreciseAspectRatio(aspectRatio);
  const preciseMinAspectRatio = aspectRatioList.at(0)?.preciseValue;
  const preciseMaxAspectRatio = aspectRatioList.at(-1)?.preciseValue;

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
        min={preciseMinAspectRatio}
        max={preciseMaxAspectRatio}
        value={preciseAspectRatio}
        onChange={handleChange}
      />
    </div>
  );
}
