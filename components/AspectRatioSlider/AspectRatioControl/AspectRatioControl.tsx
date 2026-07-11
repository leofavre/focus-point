import type { ChangeEvent, KeyboardEvent } from "react";
import { useCallback, useEffectEvent, useMemo } from "react";
import { useHydrated } from "vike-react/useHydrated";
import { toAspectRatio } from "../helpers/toAspectRatio";
import { toLogPosition } from "../helpers/toLogPosition";
import { Slider } from "./AspectRatioControl.styled";
import type { AspectRatioControlProps } from "./types";

const POSITION_SNAP_THRESHOLD = 1 / 300;
const PRECISION = 100_000;

/**
 * A purposefully out of range value, used to prevent React from
 * complaining that the input is changing from uncontrolled to controlled.
 */
const OUT_OF_RANGE_VALUE = 100_000;

export function AspectRatioControl({
  ref,
  aspectRatio,
  aspectRatioList,
  onAspectRatioChange,
  disabled,
  ...rest
}: AspectRatioControlProps) {
  const minItem = aspectRatioList.at(0);
  const maxItem = aspectRatioList.at(-1);
  const minValue = minItem?.value ?? 0;
  const maxValue = maxItem?.value ?? 1;
  const minPosition = minItem?.position ?? 0;
  const maxPosition = maxItem?.position ?? 1;
  const isHydrated = useHydrated();
  const initialPosition = useMemo(() => {
    return aspectRatioList.find((item) => item.key === "original")?.position;
  }, [aspectRatioList]);

  const currentPosition = useMemo(() => {
    if (aspectRatio == null) return initialPosition;
    return toLogPosition(aspectRatio, minValue, maxValue);
  }, [aspectRatio, minValue, maxValue, initialPosition]);

  const ariaValuetext = useMemo(() => {
    if (aspectRatio == null) return undefined;

    const closest = aspectRatioList.reduce((prev, curr) =>
      Math.abs(curr.value - aspectRatio) < Math.abs(prev.value - aspectRatio) ? curr : prev,
    );

    return closest.key;
  }, [aspectRatio, aspectRatioList]);

  const stableOnAspectRatioChange = useEffectEvent((aspectRatio: number) => {
    onAspectRatioChange?.(aspectRatio);
  });

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const positionFromEvent = event.currentTarget.value;
      const positionFromEventNumber = parseFloat(positionFromEvent) / PRECISION;
      const nextAspectRatio = toAspectRatio(positionFromEventNumber, minValue, maxValue);

      stableOnAspectRatioChange(nextAspectRatio);
    },
    [minValue, maxValue],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      const positionFromEvent = event.currentTarget.value;

      if (positionFromEvent == null) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

      const positionFromEventNumber = parseFloat(positionFromEvent) / PRECISION;

      const nextItem = aspectRatioList.find(
        ({ position }) => position > positionFromEventNumber + POSITION_SNAP_THRESHOLD,
      );

      const previousItem = aspectRatioList.findLast(
        ({ position }) => position < positionFromEventNumber - POSITION_SNAP_THRESHOLD,
      );

      const nextArrowKey = event.currentTarget.matches(":dir(rtl)") ? "ArrowLeft" : "ArrowRight";
      const prevArrowKey = event.currentTarget.matches(":dir(rtl)") ? "ArrowRight" : "ArrowLeft";

      if (event.key === nextArrowKey && nextItem != null) {
        const nextAspectRatio = toAspectRatio(nextItem.position, minValue, maxValue);
        stableOnAspectRatioChange(nextAspectRatio);
      }

      if (event.key === prevArrowKey && previousItem != null) {
        const prevAspectRatio = toAspectRatio(previousItem.position, minValue, maxValue);
        stableOnAspectRatioChange(prevAspectRatio);
      }
    },
    [aspectRatioList, minValue, maxValue],
  );

  return (
    <Slider
      data-component="AspectRatioControl"
      css={{
        "--thumb-initial-position": initialPosition ?? 1,
        "--thumb-visibility":
          initialPosition != null && currentPosition != null ? "visible" : "hidden",
      }}
      {...rest}
    >
      <input
        ref={ref}
        type="range"
        step={1}
        min={Math.round(minPosition * PRECISION)}
        max={Math.round(maxPosition * PRECISION)}
        value={
          currentPosition != null && Number.isNaN(currentPosition) === false
            ? Math.round(currentPosition * PRECISION)
            : OUT_OF_RANGE_VALUE
        }
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        list="aspect-ratio"
        aria-label="Aspect ratio"
        aria-valuetext={ariaValuetext}
        disabled={!isHydrated || disabled}
      />
      <datalist id="aspect-ratio">
        {aspectRatioList.map(({ position }) => (
          <option key={position} value={Math.round(position * PRECISION)} />
        ))}
      </datalist>
    </Slider>
  );
}
