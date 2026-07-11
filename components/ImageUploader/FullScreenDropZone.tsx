import { useEffect, useEffectEvent } from "react";
import { useHydrated } from "vike-react/useHydrated";
import { useUploadBackdrop } from "@/components/UploadBackdrop/UploadBackdropContext";
import { useImageDropzone } from "./hooks/useImageDropzone";
import type { FullScreenDropZoneProps } from "./types";

export function FullScreenDropZone({
  onImageUpload: _onImageUpload,
  onImagesUpload,
  onImageUploadError,
  onImagesUploadError,
  onDragStart,
}: FullScreenDropZoneProps) {
  const isHydrated = useHydrated();
  const { showDropZone, scheduleHide, cancelScheduledHide, getUploadHandler } = useUploadBackdrop();

  const uploadHandler = getUploadHandler();

  const { getRootProps, getInputProps, isDragGlobal } = useImageDropzone({
    onImageUpload: (draft) => {
      uploadHandler?.(draft);
    },
    onImagesUpload: (drafts) => {
      if (uploadHandler) {
        drafts.forEach(uploadHandler);
      }
    },
    onImageUploadError,
    onImagesUploadError,
    noClick: true,
    noDrag: false,
    multiple: onImagesUpload != null,
  });

  const stableShowDropZoneWithContent = useEffectEvent(() => {
    const { ref, ...rootProps } = getRootProps();
    showDropZone(
      { ...rootProps, ref },
      <>
        <input {...getInputProps()} aria-hidden disabled={!isHydrated} />
        <p>Drop an image here</p>
      </>,
    );
  });

  useEffect(() => {
    if (isDragGlobal) {
      cancelScheduledHide();
      onDragStart?.();
      stableShowDropZoneWithContent();
    } else {
      scheduleHide();
    }
  }, [isDragGlobal, onDragStart, scheduleHide, cancelScheduledHide]);

  return null;
}
