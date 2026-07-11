import type { PointerEvent } from "react";
import { useCallback, useEffectEvent, useRef } from "react";
import { clamp } from "../helpers/clamp";
import { cssObjectPositionObjectToString } from "../helpers/cssObjectPositionObjectToString";
import { Badge, Cross, Wrapper } from "./FocalPoint.styled";
import type { FocalPointProps } from "./types";

function formatPositionValue(value: number): string {
  const normalized = Number.isInteger(value) ? `${value}%` : `${value.toFixed(2)}%`;
  return normalized.padEnd(6, " ");
}

function formatPositionBadge(x: number, y: number): string {
  return `${formatPositionValue(x)} ${formatPositionValue(y)}`;
}

export function FocalPoint({
  onObjectPositionChange,
  objectPositionX,
  objectPositionY,
  ...rest
}: FocalPointProps) {
  const isDraggingRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const crossRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    isDraggingRef.current = true;
    activePointerIdRef.current = event.pointerId;

    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const stableOnObjectPositionChange = useEffectEvent(onObjectPositionChange);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || crossRef.current == null) return;
    if (event.pointerId !== activePointerIdRef.current) return;

    event.preventDefault();
    event.stopPropagation();

    const parent = crossRef.current.parentElement;
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
    if (event.pointerId !== activePointerIdRef.current) return;
    isDraggingRef.current = false;
    activePointerIdRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  const handlePointerCancel = useCallback((event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerIdRef.current) return;
    isDraggingRef.current = false;
    activePointerIdRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, []);

  return (
    <Wrapper
      ref={crossRef}
      data-component="FocalPoint"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      {...rest}
    >
      <Cross />
      <Badge data-component="FocalPointBadge" aria-hidden>
        {formatPositionBadge(objectPositionX, objectPositionY)}
      </Badge>
    </Wrapper>
  );
}
