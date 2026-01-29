import type { ChangeEvent, KeyboardEvent } from "react";
import { useCallback, useEffectEvent, useMemo } from "react";
import { toAspectRatio, toLogPosition } from "../helpers";
import { Slider } from "./AspectRatioControl.styled";
import type { AspectRatioControlProps } from "./types";

const PRECISION = 100_000;

export function AspectRatioControl({
  ref,
  aspectRatio,
  aspectRatioList,
  onAspectRatioChange,
  ...rest
}: AspectRatioControlProps) {
  const minItem = aspectRatioList.at(0);
  const maxItem = aspectRatioList.at(-1);
  const minValue = minItem?.value ?? 0;
  const maxValue = maxItem?.value ?? 1;
  const minPosition = minItem?.position ?? 0;
  const maxPosition = maxItem?.position ?? 1;

  const initialPosition = useMemo(() => {
    return aspectRatioList.find((item) => item.name === "original")?.position;
  }, [aspectRatioList]);

  const currentPosition = useMemo(() => {
    return toLogPosition(aspectRatio, minValue, maxValue);
  }, [aspectRatio, minValue, maxValue]);

  const stableOnAspectRatioChange = useEffectEvent((aspectRatio: number) => {
    onAspectRatioChange?.(aspectRatio);
  });

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const positionFromEvent = parseFloat(event.target.value) / PRECISION;
      const nextAspectRatio = toAspectRatio(positionFromEvent, minValue, maxValue);
      stableOnAspectRatioChange(nextAspectRatio);
    },
    [minValue, maxValue],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const positionFromEvent =
        event.target instanceof HTMLInputElement ? event.target.value : undefined;

      if ((event.key !== "ArrowLeft" && event.key !== "ArrowRight") || positionFromEvent == null) {
        return;
      }

      const positionFromEventNumber = parseFloat(positionFromEvent) / PRECISION;

      const nextItem = aspectRatioList.find(({ position }) => position > positionFromEventNumber);

      const previousItem = aspectRatioList.findLast(
        ({ position }) => position < positionFromEventNumber,
      );

      if (event.key === "ArrowRight" && nextItem != null) {
        const nextAspectRatio = toAspectRatio(nextItem.position, minValue, maxValue);
        stableOnAspectRatioChange(nextAspectRatio);
      }

      if (event.key === "ArrowLeft" && previousItem != null) {
        const previousAspectRatio = toAspectRatio(previousItem.position, minValue, maxValue);
        stableOnAspectRatioChange(previousAspectRatio);
      }
    },
    [aspectRatioList, minValue, maxValue],
  );

  return (
    <Slider {...rest} css={{ "--initial-position": initialPosition }}>
      <input
        ref={ref}
        type="range"
        step={1}
        min={Math.round(minPosition * PRECISION)}
        max={Math.round(maxPosition * PRECISION)}
        value={Math.round(currentPosition * PRECISION)}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        list="aspect-ratio"
      />
      <datalist id="aspect-ratio">
        {aspectRatioList.map(({ position }) => (
          <option key={position} value={Math.round(position * PRECISION)} />
        ))}
      </datalist>
    </Slider>
  );
}
