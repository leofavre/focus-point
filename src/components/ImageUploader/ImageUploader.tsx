import styled from "@emotion/styled";
import type { ImageUploaderProps } from "./types";

const ImageUploaderForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: start;
  gap: 0.5rem;
`;

const Control = styled.input`
  display: block;
  font-size: 0.875rem;
  color: #6b7280;

  &::file-selector-button {
    margin-right: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    border: 0;
    font-size: 0.875rem;
    font-weight: 600;
    background-color: #eff6ff;
    color: #1d4ed8;
    cursor: pointer;

    &:hover {
      background-color: #dbeafe;
    }
  }
`;

export function ImageUploader({ ref, onFormSubmit, onImageChange, ...rest }: ImageUploaderProps) {
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
