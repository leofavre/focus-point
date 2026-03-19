import type { KeyboardEvent, PointerEvent, SyntheticEvent } from "react";
import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { ClippedImage } from "./ClippedImage/ClippedImage";
import { FocalPoint } from "./FocalPoint/FocalPoint";
import { FocalPointEditorWrapper } from "./FocalPointEditorWrapper/FocalPointEditorWrapper";
import { clamp } from "./helpers/clamp";
import { cssObjectPositionObjectToString } from "./helpers/cssObjectPositionObjectToString";
import { cssObjectPositionStringToObject } from "./helpers/cssObjectPositionStringToObject";
import { getImageDimensionDelta } from "./helpers/getImageDimensionDelta";
import { getPointerCoordinatesFromEvent } from "./helpers/getPointerCoordinatesFromEvent";
import { toPercentage } from "./helpers/toPercentage";
import { ImageOverflow } from "./ImageOverflow/ImageOverflow";
import type { Coordinates, FocalPointEditorProps, ImageDimensionDelta } from "./types";

const CURSOR_MAP = {
  width: "col-resize",
  height: "row-resize",
} as const;

export function FocalPointEditor({
  imageUrl,
  aspectRatio,
  initialAspectRatio,
  objectPosition,
  showFocalPoint,
  showImageOverflow,
  onObjectPositionChange,
  onImageLoad,
  onImageError,
  focalPointImageRef,
  ...rest
}: FocalPointEditorProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const activePointerIdRef = useRef<number | null>(null);
  const objectPositionStartRef = useRef(objectPosition);
  const pointerCoordinatesStartRef = useRef<Coordinates>(null);

  const [imageDimensionDelta, setImageDimensionDelta] = useState<ImageDimensionDelta | null>(null);

  const updateImageDimensionDelta = useEffectEvent(() => {
    if (imageRef.current == null) return;
    const imageDimensionDelta = getImageDimensionDelta(imageRef.current);
    if (imageDimensionDelta == null) return;
    setImageDimensionDelta(imageDimensionDelta);
  });

  useEffect(() => {
    if (imageRef.current == null || imageUrl == null) return;

    const resizeObserver = new ResizeObserver(updateImageDimensionDelta);
    resizeObserver.observe(imageRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [imageUrl]);

  /**
   * Fixes a bug where the image and the focal point icon are not draggable
   * on mobile devices because the page-scroll event is triggered instead.
   *
   * Using the native `{ passive: false }` option guarantees that the page-scroll
   * event can be prevented. If we the React event handler, `{ passive: true}` is
   * the default and cannot be changed.
   */
  useEffect(() => {
    const el = contentRef.current;
    if (el == null) return;

    const onPointerDown = (e: globalThis.PointerEvent) => {
      e.preventDefault();
    };

    const onPointerMove = (e: globalThis.PointerEvent) => {
      if (isDraggingRef.current) e.preventDefault();
    };

    el.addEventListener("pointerdown", onPointerDown, { passive: false });
    el.addEventListener("pointermove", onPointerMove, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  const handleImageLoad = useEffectEvent((event: SyntheticEvent<HTMLImageElement>) => {
    onImageLoad?.(event);
    updateImageDimensionDelta();
  });

  const handleImageError = useEffectEvent((event: SyntheticEvent<HTMLImageElement>) => {
    onImageError?.(event);
  });

  const handlePointerDown = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (isDraggingRef.current) return;

      event.preventDefault();
      isDraggingRef.current = true;
      activePointerIdRef.current = event.pointerId;

      event.currentTarget.setPointerCapture(event.pointerId);

      objectPositionStartRef.current = objectPosition;
      pointerCoordinatesStartRef.current = getPointerCoordinatesFromEvent(event);
    },
    [objectPosition],
  );

  const stableOnObjectPositionChange = useEffectEvent(onObjectPositionChange);

  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current || imageDimensionDelta == null) return;
      if (event.pointerId !== activePointerIdRef.current) return;

      event.preventDefault();

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

  const STEP = 1;
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const step = event.shiftKey ? STEP * 5 : STEP;
      const { x, y } = cssObjectPositionStringToObject(objectPosition);

      let nextX = x;
      let nextY = y;

      switch (event.key) {
        case "ArrowLeft":
          nextX = clamp(x + step, 0, 100);
          break;
        case "ArrowRight":
          nextX = clamp(x - step, 0, 100);
          break;
        case "ArrowUp":
          nextY = clamp(y + step, 0, 100);
          break;
        case "ArrowDown":
          nextY = clamp(y - step, 0, 100);
          break;
        default:
          return;
      }

      event.preventDefault();
      stableOnObjectPositionChange(cssObjectPositionObjectToString({ x: nextX, y: nextY }));
    },
    [objectPosition],
  );

  const cursor =
    imageDimensionDelta?.changedDimension == null
      ? "crosshair"
      : CURSOR_MAP[imageDimensionDelta.changedDimension];

  const { x: objectPositionX, y: objectPositionY } =
    cssObjectPositionStringToObject(objectPosition);

  return (
    <FocalPointEditorWrapper
      data-component="FocalPointEditor"
      aspectRatio={aspectRatio}
      cursor={cursor}
      contentRef={contentRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      {...rest}
    >
      <ImageOverflow
        css={{
          ...(imageDimensionDelta?.changedDimension === "width"
            ? { height: "100%" }
            : { width: "100%" }),
          transform: `translate(
            ${(objectPositionX ?? 0) * ((imageDimensionDelta?.width.percent ?? 0) / -100)}%,
            ${(objectPositionY ?? 0) * ((imageDimensionDelta?.height.percent ?? 0) / -100)}%
          )`,
          aspectRatio: initialAspectRatio,
          backgroundImage: `url(${imageUrl})`,
          opacity: showImageOverflow ? 0.25 : 0,
          pointerEvents: showImageOverflow ? "auto" : "none",
          cursor,
        }}
        aria-hidden={!showImageOverflow}
      />
      <ClippedImage
        ref={imageRef}
        focusableImageRef={focalPointImageRef}
        imageUrl={imageUrl}
        objectPosition={objectPosition}
        onImageLoad={handleImageLoad}
        onImageError={handleImageError}
        onKeyDown={handleKeyDown}
      />
      <FocalPoint
        css={{
          opacity: showFocalPoint ? 1 : 0,
          left: `${objectPositionX}%`,
          top: `${objectPositionY}%`,
          pointerEvents: showFocalPoint ? "auto" : "none",
        }}
        aria-hidden={!showFocalPoint}
        objectPositionX={objectPositionX ?? 0}
        objectPositionY={objectPositionY ?? 0}
        onObjectPositionChange={stableOnObjectPositionChange}
      />
    </FocalPointEditorWrapper>
  );
}
