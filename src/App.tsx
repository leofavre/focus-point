import type { ChangeEvent, FormEvent, SyntheticEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AspectRatioRuler } from "./AspectRatio/AspectRatioRuler/AspectRatioRuler";
import { AspectRatioSlider } from "./AspectRatio/AspectRatioSlider/AspectRatioSlider";
import { useAspectRatioList } from "./AspectRatio/hooks";
import { CodeSnippet } from "./CodeSnippet/CodeSnippet";
import { DEFAULT_OBJECT_POSITION } from "./FocusPointEditor/constants";
import { FocusPointEditor } from "./FocusPointEditor/FocusPointEditor";
import { ImageUploader } from "./ImageUploader/ImageUploader";

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
  const [imageFileName, setImageFileName] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number>();
  const [naturalAspectRatio, setNaturalAspectRatio] = useState<number>();
  const [objectPosition, setObjectPosition] = useState(DEFAULT_OBJECT_POSITION);

  const aspectRatioList = useAspectRatioList(naturalAspectRatio);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file?.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setImageFileName(file.name);
      setImageUrl(url);
    }
  }, []);

  const handleImageLoad = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const naturalAspectRatio = img.naturalWidth / img.naturalHeight;

    setNaturalAspectRatio(naturalAspectRatio);
    setAspectRatio(naturalAspectRatio);
  }, []);

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
      <FocusPointEditor
        ref={imageRef}
        className="fixed top-[calc(50%-2.5rem)] left-1/2 -translate-x-1/2 -translate-y-1/2"
        imageUrl={imageUrl}
        aspectRatio={aspectRatio}
        naturalAspectRatio={naturalAspectRatio}
        objectPosition={objectPosition}
        onObjectPositionChange={setObjectPosition}
        onImageLoad={handleImageLoad}
        onImageError={handleImageError}
      />
      {aspectRatio && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-6xl px-4">
          <AspectRatioSlider
            aspectRatio={aspectRatio}
            aspectRatioList={aspectRatioList}
            onAspectRatioChange={setAspectRatio}
          />
          <AspectRatioRuler aspectRatioList={aspectRatioList} className="mx-2" />
        </div>
      )}
      <CodeSnippet
        className="relative z-5 w-2xl"
        src={imageFileName}
        objectPosition={objectPosition}
      />
    </>
  );
}
