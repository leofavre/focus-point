import clsx from "clsx";
import type { PointerEvent } from "react";
import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { clamp, toPercentage } from "../../helpers";
import { CURSOR_MAP } from "./constants";
import { cssObjectPositionObjectToString } from "./helpers/cssObjectPositionObjectToString";
import { cssObjectPositionStringToObject } from "./helpers/cssObjectPositionStringToObject";
import { detectProportionalImageHeight } from "./helpers/detectRelativeImageSize";
import { getPointerCoordinatesFromEvent } from "./helpers/getPointerCoordinatesFromEvent";
import { scaleDimensionsToContainRect } from "./helpers/scaleDimensionToContainRect";
import type { Coordinates, FocusPointEditorProps, ImageDimensionDelta } from "./types";

const DELTA_DIMENSION_THRESHOLD_PX = 1;

export function FocusPointEditor({
  ref,
  imageUrl,
  aspectRatio,
  naturalAspectRatio,
  objectPosition,
  onObjectPositionChange,
  onImageLoad,
  onImageError,
  className,
}: FocusPointEditorProps) {
  const [imageDimensionDelta, setImageDimensionDelta] = useState<ImageDimensionDelta | null>(null);

  const isDraggingRef = useRef(false);
  const objectPositionStartRef = useRef(objectPosition);
  const pointerCoordinatesStartRef = useRef<Coordinates | null>(null);

  useEffect(() => {
    if (ref.current == null || imageUrl == null) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const source = {
          width: ref.current?.naturalWidth ?? 1,
          height: ref.current?.naturalHeight ?? 1,
        };

        const rect = entry.contentRect;

        const { width, height } = scaleDimensionsToContainRect({ source, rect });

        const deltaWidthPx = width - rect.width;
        const deltaHeightPx = height - rect.height;
        const deltaWidthPercent = toPercentage(deltaWidthPx, width);
        const deltaHeightPercent = toPercentage(deltaHeightPx, height);

        const changedDimension =
          deltaWidthPx > DELTA_DIMENSION_THRESHOLD_PX
            ? "width"
            : deltaHeightPx > DELTA_DIMENSION_THRESHOLD_PX
              ? "height"
              : undefined;

        setImageDimensionDelta({
          width: { px: deltaWidthPx, percent: deltaWidthPercent },
          height: { px: deltaHeightPx, percent: deltaHeightPercent },
          changedDimension,
        });
      }
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [imageUrl, ref]);

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      isDraggingRef.current = true;

      const target = event.target as HTMLElement;
      target.setPointerCapture(event.pointerId);

      objectPositionStartRef.current = objectPosition;
      pointerCoordinatesStartRef.current = getPointerCoordinatesFromEvent(event);
    },
    [objectPosition],
  );

  const stableOnObjectPositionChange = useEffectEvent(onObjectPositionChange);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current || imageDimensionDelta == null) return;

      const { x: pointerCoordinateX, y: pointerCoordinateY } =
        getPointerCoordinatesFromEvent(event);

      const pointerDeltaXPx = pointerCoordinateX - (pointerCoordinatesStartRef.current?.x ?? 0);
      const pointerDeltaYPx = pointerCoordinateY - (pointerCoordinatesStartRef.current?.y ?? 0);

      const objectPositionDeltaX =
        imageDimensionDelta.changedDimension === "width"
          ? clamp(toPercentage(pointerDeltaXPx, imageDimensionDelta.width.px), -100, 100)
          : 0;

      const objectPositionDeltaY =
        imageDimensionDelta.changedDimension === "height"
          ? clamp(toPercentage(pointerDeltaYPx, imageDimensionDelta.height.px), -100, 100)
          : 0;

      const { x: prevObjectPositionX, y: prevObjectPositionY } = cssObjectPositionStringToObject(
        objectPositionStartRef.current,
      );

      const nextObjectPosition = cssObjectPositionObjectToString({
        x: prevObjectPositionX - objectPositionDeltaX,
        y: prevObjectPositionY - objectPositionDeltaY,
      });

      stableOnObjectPositionChange(nextObjectPosition);
    },
    [imageDimensionDelta],
  );

  const handlePointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;

    const target = event.target as HTMLElement;
    target.releasePointerCapture(event.pointerId);
  }, []);

  const cursor =
    imageDimensionDelta?.changedDimension == null
      ? "crosshair"
      : CURSOR_MAP[imageDimensionDelta.changedDimension];

  const { x: objectPositionX, y: objectPositionY } =
    cssObjectPositionStringToObject(objectPosition);

  return (
    <div
      className={clsx("touch-none select-none", className)}
      style={{
        aspectRatio: aspectRatio ?? "auto",
        height: `${detectProportionalImageHeight({ aspectRatio }) ?? 0}vmin`,
        cursor,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="isolate w-full h-full relative overflow-hidden pointer-events-none touch-none select-none z-1">
        <img
          ref={ref}
          src={imageUrl}
          className="w-full h-full object-cover touch-none select-none"
          style={{ objectPosition }}
          onLoad={onImageLoad}
          onError={onImageError}
          aria-label="Image uploaded by the user"
        />
        {/* focal point */}
        <svg
          aria-hidden="true"
          className="absolute top-0 left-0 w-full h-full pointer-events-none touch-none select-none z-2"
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 1000 ${1000 / (aspectRatio ?? 1)}`}
        >
          <line
            x1={`${objectPositionX}%`}
            y1="0"
            x2={`${objectPositionX}%`}
            y2="100%"
            stroke="black"
            strokeWidth="1"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
          <line
            x1="0"
            y1={`${objectPositionY}%`}
            x2="100%"
            y2={`${objectPositionY}%`}
            stroke="black"
            strokeWidth="1"
            strokeDasharray="4 4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>
      {/* ghost */}
      <div
        className={clsx(
          "absolute bg-cover bg-center bg-no-repeat opacity-50 top-0 left-0 z-0",
          imageDimensionDelta?.changedDimension === "width" ? "h-full" : "w-full",
        )}
        style={{
          aspectRatio: naturalAspectRatio ?? "auto",
          backgroundImage: `url(${imageUrl})`,
          transform: `translate(
            ${(objectPositionX ?? 0) * ((imageDimensionDelta?.width.percent ?? 0) / -100)}%,
            ${(objectPositionY ?? 0) * ((imageDimensionDelta?.height.percent ?? 0) / -100)}%
          )`,
          cursor,
        }}
      ></div>
    </div>
  );
}
