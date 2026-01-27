import styled from "@emotion/styled";
import type { PointerEvent } from "react";
import { useCallback, useEffectEvent, useRef } from "react";
import { clamp } from "../../../helpers";
import { cssObjectPositionObjectToString } from "../helpers/cssObjectPositionObjectToString";
import type { PointMarkerProps } from "./types";

const PointerMarkerWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 2rem;
  height: 2rem;
  margin: -1rem 0 0 -1rem;
  pointer-events: auto;
  touch-action: none;
  user-select: none;
  transition: opacity 0.25s ease;
  z-index: 2;
  cursor: grab;

  svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 2rem;
    height: 2rem;
    pointer-events: none;
  }

  svg:nth-of-type(1) {
    transform: translate(-0.0625rem, -0.0625rem);
    opacity: 0.65;
    color: #fff;
  }

  svg:nth-of-type(2) {
    color: #111827;
  }
`;

export function PointMarker({ onObjectPositionChange, ...rest }: PointMarkerProps) {
  const isDraggingRef = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    isDraggingRef.current = true;

    const target = event.target as HTMLElement;
    target.setPointerCapture(event.pointerId);
  }, []);

  const stableOnObjectPositionChange = useEffectEvent(onObjectPositionChange);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || wrapperRef.current == null) return;

    event.preventDefault();
    event.stopPropagation();

    const parent = wrapperRef.current.parentElement;
    if (parent == null) return;

    const parentRect = parent.getBoundingClientRect();
    const x = event.clientX - parentRect.left;
    const y = event.clientY - parentRect.top;

    const xPercent = clamp((x / parentRect.width) * 100, 0, 100);
    const yPercent = clamp((y / parentRect.height) * 100, 0, 100);

    const objectPosition = cssObjectPositionObjectToString({
      x: xPercent,
      y: yPercent,
    });

    stableOnObjectPositionChange(objectPosition);
  }, []);

  const handlePointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    const target = event.target as HTMLElement;
    target.releasePointerCapture(event.pointerId);
  }, []);

  const handlePointerCancel = useCallback((event: PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    const target = event.target as HTMLElement;
    target.releasePointerCapture(event.pointerId);
  }, []);

  return (
    <PointerMarkerWrapper
      ref={wrapperRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      {...rest}
    >
      <PointMarkerIcon />
      <PointMarkerIcon />
    </PointerMarkerWrapper>
  );
}

function PointMarkerIcon() {
  return (
    /** biome-ignore lint/a11y/noSvgWithoutTitle: Image hidden from screen readers */
    <svg viewBox="0 0 100 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="currentColor">
        <circle
          cx="50"
          cy="50"
          r="38"
          stroke-width="6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <line x1="50" y1="6" x2="50" y2="26" stroke-width="6" stroke-linecap="round" />
        <line x1="50" y1="74" x2="50" y2="94" stroke-width="6" stroke-linecap="round" />
        <line x1="6" y1="50" x2="26" y2="50" stroke-width="6" stroke-linecap="round" />
        <line x1="74" y1="50" x2="94" y2="50" stroke-width="6" stroke-linecap="round" />
      </g>
    </svg>
  );
}
