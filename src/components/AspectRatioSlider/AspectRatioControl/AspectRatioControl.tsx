import styled from "@emotion/styled";
import type { ChangeEvent } from "react";
import { useCallback, useEffectEvent, useMemo } from "react";
import { toAspectRatio, toAspectRatioMoo, toLogPosition, toPreciseAspectRatio } from "../helpers";
import type { AspectRatioControlProps } from "./types";

const Slider = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;

  input {
    width: 100%;
    height: 1.375rem;
    background: transparent;
    border-radius: 0;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;
    cursor: pointer;
    outline: none;

    /* Track styling - WebKit (Chrome, Safari, Edge) */
    &::-webkit-slider-runnable-track {
      width: 100%;
      height: 0.125rem;
      background: linear-gradient(
        to right,
        transparent 0%,
        transparent 0.46875rem,
        #94a3b8 0.46875rem,
        #94a3b8 calc(0.5rem + (100% - 1rem) * var(--original-position)),
        #3b82f6 calc(0.5rem + (100% - 1rem) * var(--original-position)),
        #3b82f6 calc(100% - 0.46875rem),
        transparent calc(100% - 0.46875rem),
        transparent 100%
      );
      border-radius: 0.0625rem;
    }

    /* Track styling - Firefox */
    &::-moz-range-track {
      width: 100%;
      height: 0.125rem;
      background: linear-gradient(
        to right,
        transparent 0%,
        transparent 0.46875rem,
        #94a3b8 0.46875rem,
        #94a3b8 calc(0.5rem + (100% - 1rem) * var(--original-position)),
        #3b82f6 calc(0.5rem + (100% - 1rem) * var(--original-position)),
        #3b82f6 calc(100% - 0.46875rem),
        transparent calc(100% - 0.46875rem),
        transparent 100%
      );
      border-radius: 0.0625rem;
      border: none;
    }

    /* Thumb styling - WebKit (Chrome, Safari, Edge) */
    &::-webkit-slider-thumb {
      appearance: none;
      -webkit-appearance: none;
      width: 1rem;
      height: 1rem;
      background: rgba(255, 255, 255, 0.5);
      border: 0.125rem solid #3b82f6;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.2);
      margin-top: -0.4375rem;
    }

    /* Thumb styling - Firefox */
    &::-moz-range-thumb {
      width: 1rem;
      height: 1rem;
      background: rgba(255, 255, 255, 0.5);
      border: 0.125rem solid #3b82f6;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.2);
      -moz-appearance: none;
    }

    /* Thumb styling - iOS Safari */
    &::-webkit-slider-thumb:active {
      background: rgba(255, 255, 255, 0.5);
    }

    /* Thumb styling - Firefox active state */
    &::-moz-range-thumb:active {
      background: rgba(255, 255, 255, 0.5);
    }

    /* Focus styles */
    &:focus {
      outline: none;
    }

    &:focus::-webkit-slider-thumb {
      box-shadow: 0 0 0 0.1875rem rgba(59, 130, 246, 0.2);
    }

    &:focus::-moz-range-thumb {
      box-shadow: 0 0 0 0.1875rem rgba(59, 130, 246, 0.2);
    }
  }
`;

export function AspectRatioControl({
  ref,
  aspectRatio,
  aspectRatioList,
  onAspectRatioChange,
  ...rest
}: AspectRatioControlProps) {
  const minItem = aspectRatioList.at(0);
  const maxItem = aspectRatioList.at(-1);
  const currentPreciseAspectRatio = toPreciseAspectRatio(aspectRatio ?? 1);

  const stableOnAspectRatioChange = useEffectEvent((aspectRatio: number) => {
    onAspectRatioChange?.(aspectRatio);
  });

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const preciseAspectRatio = parseInt(event.target.value, 10);
    const aspectRatio = toAspectRatio(preciseAspectRatio);

    stableOnAspectRatioChange(aspectRatio);
  }, []);

  const originalPosition = useMemo(() => {
    const min = minItem?.preciseValue ?? 1;
    const max = maxItem?.preciseValue ?? 1;
    const original = aspectRatioList.find((item) => item.name === "original");

    if (!original) return 0;

    return ((original.preciseValue - min) / (max - min)) * 100;
  }, [aspectRatioList, minItem, maxItem]);

  const nextOriginalPosition = useMemo(() => {
    return aspectRatioList.find((item) => item.name === "original")?.position;
  }, [aspectRatioList]);

  const nextSelectedPosition = useMemo(() => {
    return toLogPosition(aspectRatio ?? 1, minItem?.value ?? 1, maxItem?.value ?? 1);
  }, [aspectRatio, minItem, maxItem]);

  const nextSelectedAspectRatio = toAspectRatioMoo(
    nextSelectedPosition,
    minItem?.value ?? 1,
    maxItem?.value ?? 1,
  );

  console.log({
    originalPosition,
    min: minItem?.preciseValue,
    max: maxItem?.preciseValue,
    currentPreciseAspectRatio,
    nextOriginalPosition,
    nextMinPosition: minItem?.position,
    nextMaxPosition: maxItem?.position,
    nextSelectedPosition,
    nextSelectedAspectRatio,
  });

  return (
    <Slider {...rest} css={{ "--original-position": originalPosition / 100 }}>
      <input
        ref={ref}
        type="range"
        step={1}
        min={minItem?.preciseValue}
        max={maxItem?.preciseValue}
        value={currentPreciseAspectRatio}
        onChange={handleChange}
        list="aspect-ratio"
      />
      <datalist id="aspect-ratio">
        {aspectRatioList.map(({ preciseValue }) => (
          <option key={preciseValue} value={preciseValue} />
        ))}
      </datalist>
    </Slider>
  );
}
