import type { ChangeEvent, FormEvent, SyntheticEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AspectRatioRuler } from "./components/AspectRatio/AspectRatioRuler/AspectRatioRuler";
import { AspectRatioSlider } from "./components/AspectRatio/AspectRatioSlider/AspectRatioSlider";
import { useAspectRatioList } from "./components/AspectRatio/hooks";
import { ImageContainer } from "./components/ImageContainer/ImageContainer";
import { ImageUploader } from "./components/ImageUploader/ImageUploader";

/**
 * @todo
 *
 * ### Basic functionality
 *
 * - Persist image locally (needs IndexedDB)
 * - Allow user to upload another image
 * - Allow user to see and copy the generated code snippet
 * - Refine UI/UX
 *   - Slider ruler
 *   - Drag image to upload
 *   - Mark commonly used aspect ratios on slider
 *   - Mark original aspect ratio on slider
 *   - Implement arrow/tab keyboard interactions
 *
 * ### Advanced functionality
 *
 * - Handle multiple images (needs routing)
 * - Breakpoints with container queries
 * - Undo/redo (needs state tracking)
 * - Maybe make a browser extension?
 * - Maybe make a React component?
 */
export default function App() {
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>();
  const [naturalAspectRatio, setNaturalAspectRatio] = useState<number>();

  const aspectRatioList = useAspectRatioList(naturalAspectRatio);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (file?.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setImageUrl(url);
      }
    },
    [],
  );

  const handleImageLoad = useCallback(
    (event: SyntheticEvent<HTMLImageElement>) => {
      const img = event.currentTarget;
      const naturalAspectRatio = img.naturalWidth / img.naturalHeight;

      setNaturalAspectRatio(naturalAspectRatio);
      setAspectRatio(naturalAspectRatio);
    },
    [],
  );

  const handleImageError = useCallback(() => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
      setImageUrl(null);
    }
  }, [imageUrl]);

  const handleFormSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  }, []);

  return !imageUrl ? (
    <ImageUploader
      className="flex items-center justify-center"
      onFormSubmit={handleFormSubmit}
      onImageChange={handleFileChange}
    />
  ) : (
    <>
      <ImageContainer
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        ref={imageRef}
        aspectRatio={aspectRatio}
        imageUrl={imageUrl}
        onImageLoad={handleImageLoad}
        onImageError={handleImageError}
      />
      {aspectRatio && (
        <div className="fixed bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4">
          <AspectRatioSlider
            aspectRatio={aspectRatio}
            aspectRatioList={aspectRatioList}
            onAspectRatioChange={setAspectRatio}
          />
          <AspectRatioRuler
            aspectRatioList={aspectRatioList}
            className="mx-[7px]"
          />
        </div>
      )}
    </>
  );
}
