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
  const stableOnAspectRatioChange = useEffectEvent((aspectRatio: number) => {
    onAspectRatioChange?.(aspectRatio);
  });

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const aspectRatio = toAspectRatio(parseInt(event.target.value, 10));
    stableOnAspectRatioChange(aspectRatio);
  }, []);

  return (
    <div className={clsx("flex flex-col items-center gap-2 w-full", className)} {...rest}>
      <input
        ref={ref}
        className="w-full bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        type="range"
        step={1}
        min={aspectRatioList.at(0)?.preciseValue}
        max={aspectRatioList.at(-1)?.preciseValue}
        value={toPreciseAspectRatio(aspectRatio)}
        onChange={handleChange}
        list="aspect-ratio"
      />
      <datalist id="aspect-ratio">
        {aspectRatioList.map(({ preciseValue }) => (
          <option key={preciseValue} value={preciseValue} />
        ))}
      </datalist>
    </div>
  );
}
