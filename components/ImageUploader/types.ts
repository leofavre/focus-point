import type { ComponentPropsWithoutRef, Ref } from "react";
import type { Err } from "@/src/helpers/errorHandling";
import type { ImageDraftStateAndFile, ImageDraftStateAndUrl } from "@/src/types";
import type { UploadErrorCode } from "./getUploadErrorMessage";

export type SingleImageUploaderProps = {
  onImagesUpload?: never;
  onImagesUploadError?: never;
  onImageUpload: (draftAndFileOrUrl: ImageDraftStateAndFile | ImageDraftStateAndUrl) => void;
  onImageUploadError?: (error: Err<UploadErrorCode>) => void;
};

export type MultipleImagesUploaderProps = {
  onImageUpload?: never;
  onImageUploadError?: never;
  onImagesUpload: (
    draftsAndFilesOrUrls: (ImageDraftStateAndFile | ImageDraftStateAndUrl)[],
  ) => void;
  onImagesUploadError?: (errors: Err<UploadErrorCode>[]) => void;
};

export type ImageUploaderProps = SingleImageUploaderProps | MultipleImagesUploaderProps;

export type ImageUploaderButtonProps = ImageUploaderProps & {
  ref?: Ref<HTMLButtonElement>;
  size?: "small" | "large";
  label: string;
  grow?: boolean;
  disabled?: boolean;
  icon: "add" | "swap";
};

export type FullScreenDropZoneProps = Pick<
  ImageUploaderProps,
  "onImageUpload" | "onImagesUpload" | "onImageUploadError" | "onImagesUploadError"
> & {
  /** Called when a global drag starts. Use to e.g. close modals that would block drop events. */
  onDragStart?: () => void;
} & ComponentPropsWithoutRef<"div">;
