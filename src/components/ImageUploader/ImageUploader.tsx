import { Control, ImageUploaderForm } from "./ImageUploader.styled";
import type { ImageUploaderProps } from "./types";

export function ImageUploader({
  ref,
  onFormSubmit,
  onImageChange,
  ...rest
}: ImageUploaderProps) {
  return (
    <ImageUploaderForm onSubmit={onFormSubmit} noValidate {...rest}>
      <Control
        ref={ref}
        id="image-upload"
        type="file"
        accept="image/*"
        onChange={onImageChange}
        required
      />
    </ImageUploaderForm>
  );
}
