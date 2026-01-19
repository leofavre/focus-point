import clsx from "clsx";
import type { PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { clamp, toPercentage } from "../../helpers";
import { CURSOR_MAP, DEFAULT_OBJECT_POSITION } from "./constants";
import { cssObjectPositionObjectToString } from "./helpers/cssObjectPositionObjectToString";
import { cssObjectPositionStringToObject } from "./helpers/cssObjectPositionStringToObject";
import { detectProportionalImageHeight } from "./helpers/detectRelativeImageSize";
import { getPointerCoordinatesFromEvent } from "./helpers/getPointerPositionFromEvent";
import { scaleDimensionsToContainRect } from "./helpers/scaleDimensionToContainRect";
import type { Coordinates, ImageContainerProps, ImageObserved } from "./types";

const DELTA_DIMENSION_THRESHOLD_PX = 1;

export function ImageContainer({
  ref,
  aspectRatio,
  naturalAspectRatio,
  imageUrl,
  onImageLoad,
  onImageError,
  className,
  ...rest
}: ImageContainerProps) {
  const [objectPosition, setObjectPosition] = useState<string>(DEFAULT_OBJECT_POSITION);
  const [imageObserved, setImageObserved] = useState<ImageObserved | null>(null);

  const isDraggingRef = useRef<boolean>(false);
  const objectPositionStartRef = useRef<string>(DEFAULT_OBJECT_POSITION);
  const pointerPositionStartRef = useRef<Coordinates | null>(null);

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

        setImageObserved({
          deltaWidthPx,
          deltaHeightPx,
          deltaWidthPercent,
          deltaHeightPercent,
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
      pointerPositionStartRef.current = getPointerCoordinatesFromEvent(event);
    },
    [objectPosition],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current || imageObserved == null) return;

      const { x: pointerPositionX, y: pointerPositionY } = getPointerCoordinatesFromEvent(event);

      const deltaXPx = pointerPositionX - (pointerPositionStartRef.current?.x ?? 0);
      const deltaYPx = pointerPositionY - (pointerPositionStartRef.current?.y ?? 0);

      const deltaX =
        imageObserved.changedDimension === "width"
          ? clamp(toPercentage(deltaXPx, imageObserved.deltaWidthPx), -100, 100)
          : 0;

      const deltaY =
        imageObserved.changedDimension === "height"
          ? clamp(toPercentage(deltaYPx, imageObserved.deltaHeightPx), -100, 100)
          : 0;

      const { x: prevObjectPositionX, y: prevObjectPositionY } = cssObjectPositionStringToObject(
        objectPositionStartRef.current,
      );

      const nextObjectPosition = cssObjectPositionObjectToString({
        x: prevObjectPositionX - deltaX,
        y: prevObjectPositionY - deltaY,
      });

      setObjectPosition(nextObjectPosition);
    },
    [imageObserved],
  );

  const handlePointerUp = useCallback((event: PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;

    const target = event.target as HTMLElement;
    target.releasePointerCapture(event.pointerId);
  }, []);

  const cursor =
    imageObserved?.changedDimension == null
      ? "crosshair"
      : CURSOR_MAP[imageObserved.changedDimension];

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
      {...rest}
    >
      <div className="w-full h-full relative overflow-hidden border border-gray-300 pointer-events-none touch-none select-none">
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
          className="absolute top-0 left-0 w-full h-full pointer-events-none touch-none select-none"
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
          "absolute bg-amber-500 opacity-50",
          imageObserved?.changedDimension === "width" ? "h-full" : "w-full",
        )}
        style={{
          aspectRatio: naturalAspectRatio ?? "auto",
          top: `0%`,
          left: `0%`,
          transform: `translate(calc(${objectPositionX}% * (${imageObserved?.deltaWidthPercent ?? 0} / -100)), calc(${objectPositionY}% * (${imageObserved?.deltaHeightPercent ?? 0} / -100)))`,
          cursor,
        }}
      ></div>
    </div>
  );
}
