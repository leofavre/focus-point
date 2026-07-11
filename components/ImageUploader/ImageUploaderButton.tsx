import { useEffectEvent, useRef, useState } from "react";
import { useMergeRefs } from "react-merge-refs";
import { useHydrated } from "vike-react/useHydrated";
import { Button } from "@/components/Button/Button";
import { useUploadBackdrop } from "@/components/UploadBackdrop/UploadBackdropContext";
import { IconAdd } from "@/src/icons/IconAdd";
import { IconSwap } from "@/src/icons/IconSwap";
import type { ImageDraftStateAndFile, ImageDraftStateAndUrl } from "@/src/types";
import { useImageDropzone } from "./hooks/useImageDropzone";
import { InvisibleControl, InvisibleForm, InvisibleLabel } from "./ImageUploader.styled";
import type { ImageUploaderButtonProps } from "./types";

export function ImageUploaderButton({
  ref,
  label,
  size = "small",
  onImageUpload,
  onImagesUpload,
  onImageUploadError,
  onImagesUploadError,
  grow,
  disabled,
  icon,
  ...rest
}: ImageUploaderButtonProps) {
  const isHydrated = useHydrated();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const mergedRefs = useMergeRefs([ref, buttonRef]);
  const { showFilePicker, scheduleHide, getUploadHandler } = useUploadBackdrop();

  const uploadHandler = getUploadHandler();

  const [isOpened, setIsOpened] = useState(false);

  const scheduleBackdropHide = useEffectEvent(() => {
    setIsOpened(false);
    scheduleHide();
  });

  const wrappedOnImageUpload = useEffectEvent(
    (draftAndFileOrUrl: ImageDraftStateAndFile | ImageDraftStateAndUrl) => {
      void Promise.resolve(uploadHandler?.(draftAndFileOrUrl)).finally(scheduleBackdropHide);
    },
  );

  const wrappedOnImagesUpload = useEffectEvent(
    (draftsAndFilesOrUrls: (ImageDraftStateAndFile | ImageDraftStateAndUrl)[]) => {
      if (uploadHandler) {
        void Promise.all(
          draftsAndFilesOrUrls.map((d) => Promise.resolve(uploadHandler(d))),
        ).finally(scheduleBackdropHide);
      } else {
        scheduleBackdropHide();
      }
    },
  );

  const wrappedOnImageUploadError = useEffectEvent(
    (error: Parameters<NonNullable<typeof onImageUploadError>>[0]) => {
      onImageUploadError?.(error);
      scheduleBackdropHide();
    },
  );

  const wrappedOnImagesUploadError = useEffectEvent(
    (errors: Parameters<NonNullable<typeof onImagesUploadError>>[0]) => {
      onImagesUploadError?.(errors);
      scheduleBackdropHide();
    },
  );

  const { getInputProps, open } = useImageDropzone({
    onImageUpload: onImageUpload != null ? wrappedOnImageUpload : undefined,
    onImagesUpload: onImagesUpload != null ? wrappedOnImagesUpload : undefined,
    onImageUploadError: onImageUploadError != null ? wrappedOnImageUploadError : undefined,
    onImagesUploadError: onImagesUploadError != null ? wrappedOnImagesUploadError : undefined,
    noClick: true,
    noDrag: true,
    multiple: onImagesUpload != null,
    onFileDialogCancel: scheduleBackdropHide,
    onDropAccepted: () => setIsOpened(false),
  });

  const handleButtonClick = () => {
    setIsOpened(true);
    showFilePicker(<InvisibleControl {...getInputProps()} tabIndex={-1} aria-hidden />, open);
  };

  return (
    <InvisibleForm data-component="ImageUploaderButton" {...rest}>
      <InvisibleLabel>
        <Button
          ref={mergedRefs}
          type="button"
          aria-label={label}
          toggleable
          toggled={isOpened}
          onClick={handleButtonClick}
          scale={size === "large" ? 2 : 1}
          grow={grow}
          disabled={!isHydrated || disabled}
        >
          {icon === "add" ? <IconAdd /> : <IconSwap />}
          <Button.ButtonText>{label}</Button.ButtonText>
        </Button>
      </InvisibleLabel>
    </InvisibleForm>
  );
}
