import type { ChangeEvent, FormEvent, SyntheticEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AspectRatioSlider } from "./components/AspectRatioSlider/AspectRatioSlider";
import { useAspectRatioList } from "./components/AspectRatioSlider/hooks";
import { CodeSnippet } from "./components/CodeSnippet/CodeSnippet";
import { DEFAULT_OBJECT_POSITION } from "./components/FocusPointEditor/constants";
import { FocusPointEditor } from "./components/FocusPointEditor/FocusPointEditor";
import { ImageUploader } from "./components/ImageUploader/ImageUploader";
import { ToggleButton } from "./components/ToggleButton/ToggleButton";
import { CodeSnippetToggleIcon } from "./icons/CodeSnippetToggleIcon";
import { GhostImageToggleIcon } from "./icons/GhostImageToggleIcon";
import { PointMarkerToggleIcon } from "./icons/PointMarkerToggleIcon";

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
  const [showPointMarker, setShowPointMarker] = useState(true);
  const [showGhostImage, setShowGhostImage] = useState(true);
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);

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

  return (
    <>
      <ImageUploader
        onFormSubmit={handleFormSubmit}
        onImageChange={handleFileChange}
        css={{ gridRow: "1", gridColumn: "2", marginRight: "auto" }}
      />
      <div
        css={[
          /** @todo Move inline static CSS into App > Moo */
          { gridRow: "1", gridColumn: "2", marginLeft: "auto" },
          /** @todo Move inline static CSS into Moo */
          { display: "flex", gap: "0.25rem" },
        ]}
      >
        <ToggleButton
          toggled={showPointMarker}
          onToggle={() => setShowPointMarker((prev) => !prev)}
          titleOn="Hide pointer marker"
          titleOff="Show pointer marker"
          icon={<PointMarkerToggleIcon />}
        />
        <ToggleButton
          toggled={showGhostImage}
          onToggle={() => setShowGhostImage((prev) => !prev)}
          titleOn="Hide ghost image"
          titleOff="Show ghost image"
          icon={<GhostImageToggleIcon />}
        />
        <ToggleButton
          toggled={showCodeSnippet}
          onToggle={() => setShowCodeSnippet((prev) => !prev)}
          titleOn="Hide code snippet"
          titleOff="Show code snippet"
          icon={<CodeSnippetToggleIcon />}
        />
      </div>
      {imageUrl && (
        <>
          <FocusPointEditor
            ref={imageRef}
            imageUrl={imageUrl}
            aspectRatio={aspectRatio}
            naturalAspectRatio={naturalAspectRatio}
            objectPosition={objectPosition}
            showPointMarker={showPointMarker}
            showGhostImage={showGhostImage}
            onObjectPositionChange={setObjectPosition}
            onImageLoad={handleImageLoad}
            onImageError={handleImageError}
            /** @todo Move inline static CSS into App > FocusPointEditor */
            css={{
              gridRow: "2",
              gridColumn: "2",
              zIndex: 0,
            }}
          />
          <CodeSnippet
            src={imageFileName}
            objectPosition={objectPosition}
            css={{
              /** @todo Move inline static CSS into App > CodeSnippet */
              gridRow: "2",
              gridColumn: "1 / 4",
              margin: "auto 0 auto auto",
              maxWidth: 650,
              zIndex: 2,
              /** @todo Keep this style here */
              opacity: showCodeSnippet ? 1 : 0,
              transition: "opacity 0.15s ease",
              pointerEvents: showCodeSnippet ? "auto" : "none",
            }}
          />
          <AspectRatioSlider
            aspectRatio={aspectRatio}
            aspectRatioList={aspectRatioList}
            onAspectRatioChange={setAspectRatio}
            /** @todo Move inline static CSS into App > AspectRatioSlider */
            css={{
              gridRow: "3",
              gridColumn: "2",
              marginLeft: "auto",
              marginRight: "auto",
              maxWidth: 1200,
              zIndex: 1,
            }}
          />
        </>
      )}
    </>
  );
}
