import clsx from "clsx";
import type { PointerEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { CURSOR_MAP, DEFAULT_OBJECT_POSITION } from "./constants";
import { coordinatesToCssObjectPosition } from "./helpers/coordinatesToCssObjectPosition";
import { cssObjectPositionToCoordinates } from "./helpers/cssObjectPositionToCoordinates";
import { detectProportionalImageHeight } from "./helpers/detectRelativeImageSize";
import { getPointerCoordinatesFromEvent } from "./helpers/getPointerPositionFromEvent";
import type { Coordinates, ImageContainerProps, ImageObserved } from "./types";

export function ImageContainer({
  ref,
  aspectRatio,
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
        const { width, height } = entry.contentRect;
        const { naturalWidth = 0, naturalHeight = 0 } = ref.current ?? {};

        if (width === 0 && height === 0 && naturalWidth === 0 && naturalHeight === 0) continue;

        const currentAspectRatio = width / height;
        const naturalAspectRatio = naturalWidth / naturalHeight;

        const movementAxis =
          Math.abs(naturalAspectRatio - currentAspectRatio) < 0.005
            ? undefined
            : naturalAspectRatio > currentAspectRatio
              ? "horizontal"
              : "vertical";

        let nextHeight = height;
        let nextWidth = width;

        if (movementAxis === "horizontal") {
          nextWidth = (height * naturalWidth) / naturalHeight;
        }

        if (movementAxis === "vertical") {
          nextHeight = (width * naturalHeight) / naturalWidth;
        }

        setImageObserved({
          deltaWidth: nextWidth - width,
          deltaHeight: nextHeight - height,
          movementAxis,
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
      pointerPositionStartRef.current = getPointerCoordinatesFromEvent({
        event,
      });
    },
    [objectPosition],
  );

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current || imageObserved == null) return;

      const pointerPosition = getPointerCoordinatesFromEvent({ event });

      const deltaX = pointerPosition.x - (pointerPositionStartRef.current?.x ?? 0);
      const deltaY = pointerPosition.y - (pointerPositionStartRef.current?.y ?? 0);
      const deltaXPercent = (deltaX / imageObserved.deltaWidth) * 100;
      const deltaYPercent = (deltaY / imageObserved.deltaHeight) * 100;
      const maybeDeltaXPercent = imageObserved.movementAxis === "horizontal" ? deltaXPercent : 0;
      const maybeDeltaYPercent = imageObserved.movementAxis === "vertical" ? deltaYPercent : 0;

      const prevObjectPosition = cssObjectPositionToCoordinates(objectPositionStartRef.current);

      const nextObjectPosition = coordinatesToCssObjectPosition({
        x: prevObjectPosition.x - maybeDeltaXPercent,
        y: prevObjectPosition.y - maybeDeltaYPercent,
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
    imageObserved?.movementAxis == null ? "crosshair" : CURSOR_MAP[imageObserved.movementAxis];

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
          alt="Uploaded"
        />
      </div>
    </div>
  );
}
