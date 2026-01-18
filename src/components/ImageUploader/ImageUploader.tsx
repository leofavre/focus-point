import type { ImageUploaderProps } from "./types";

export function ImageUploader({ ref, onFormSubmit, onImageChange, ...rest }: ImageUploaderProps) {
  return (
    <div {...rest}>
      <form onSubmit={onFormSubmit} noValidate>
        <div>
          <label htmlFor="image-upload" className="block mb-2 text-sm font-medium">
            Upload Image
          </label>
          <input
            ref={ref}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={onImageChange}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Only image files are allowed (e.g., PNG, JPEG, GIF, WebP)
          </p>
        </div>
      </form>
    </div>
  );
}
