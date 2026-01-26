import type { ChangeEvent } from "react";
import { useCallback, useEffectEvent } from "react";
import { toAspectRatio, toPreciseAspectRatio } from "../helpers";
import type { AspectRatioControlProps } from "./types";

export function AspectRatioControl({
  ref,
  aspectRatio,
  aspectRatioList,
  onAspectRatioChange,
}: AspectRatioControlProps) {
  const stableOnAspectRatioChange = useEffectEvent((aspectRatio: number) => {
    onAspectRatioChange?.(aspectRatio);
  });

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const aspectRatio = toAspectRatio(parseInt(event.target.value, 10));
    stableOnAspectRatioChange(aspectRatio);
  }, []);

  return (
    <div className="aspect-ratio-control">
      <input
        ref={ref}
        className="control"
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
