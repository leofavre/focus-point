import styled from "@emotion/styled";
import type { ChangeEvent } from "react";
import { useCallback, useEffectEvent } from "react";
import { toAspectRatio, toPreciseAspectRatio } from "../helpers";
import type { AspectRatioControlProps } from "./types";

const Slider = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;

  input {
    width: 100%;
    background-color: #e5e7eb;
    border-radius: 0.5rem;
    appearance: none;
    cursor: pointer;
    accent-color: #2563eb;
  }
`;

export function AspectRatioControl({
  ref,
  aspectRatio,
  aspectRatioList,
  onAspectRatioChange,
  ...rest
}: AspectRatioControlProps) {
  const stableOnAspectRatioChange = useEffectEvent((aspectRatio: number) => {
    onAspectRatioChange?.(aspectRatio);
  });

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const aspectRatio = toAspectRatio(parseInt(event.target.value, 10));
    stableOnAspectRatioChange(aspectRatio);
  }, []);

  return (
    <Slider {...rest}>
      <input
        ref={ref}
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
    </Slider>
  );
}
