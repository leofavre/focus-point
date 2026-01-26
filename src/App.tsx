import { css } from "@emotion/react";
import type { ChangeEvent, FormEvent, SyntheticEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AspectRatioSlider } from "./components/AspectRatioSlider/AspectRatioSlider";
import { useAspectRatioList } from "./components/AspectRatioSlider/hooks";
import { CodeSnippet } from "./components/CodeSnippet/CodeSnippet";
import { DEFAULT_OBJECT_POSITION } from "./components/FocusPointEditor/constants";
import { FocusPointEditor } from "./components/FocusPointEditor/FocusPointEditor";
import { ImageUploader } from "./components/ImageUploader/ImageUploader";

function PointMarkerToggleIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative icon, button has title
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
      <line
        x1="12"
        y1="4"
        x2="12"
        y2="8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="16"
        x2="12"
        y2="20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="4"
        y1="12"
        x2="8"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="16"
        y1="12"
        x2="20"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GhostImageToggleIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: Decorative icon, button has title
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <rect
        x="4"
        y="6"
        width="10"
        height="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        rx="1"
      />
      <rect
        x="10"
        y="6"
        width="10"
        height="12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        rx="1"
        opacity="0.6"
      />
    </svg>
  );
}

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
      {!imageUrl ? (
        <ImageUploader onFormSubmit={handleFormSubmit} onImageChange={handleFileChange} />
      ) : (
        <>
          <div className="editor-toggles">
            <button
              type="button"
              className={`editor-toggle ${showPointMarker ? "is-on" : ""}`}
              title={showPointMarker ? "Hide pointer marker" : "Show pointer marker"}
              aria-pressed={showPointMarker}
              onClick={() => setShowPointMarker((prev) => !prev)}
            >
              <PointMarkerToggleIcon />
            </button>
            <button
              type="button"
              className={`editor-toggle ${showGhostImage ? "is-on" : ""}`}
              title={showGhostImage ? "Hide ghost image" : "Show ghost image"}
              aria-pressed={showGhostImage}
              onClick={() => setShowGhostImage((prev) => !prev)}
            >
              <GhostImageToggleIcon />
            </button>
          </div>
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
          />
          {/** @todo Move inline CSS into a styled component */}
          <CodeSnippet
            src={imageFileName}
            objectPosition={objectPosition}
            css={css`
              margin: auto;
              max-width: 550px;
              z-index: 2;
            `}
          />
          {aspectRatio && (
            <AspectRatioSlider
              aspectRatio={aspectRatio}
              aspectRatioList={aspectRatioList}
              onAspectRatioChange={setAspectRatio}
            />
          )}
        </>
      )}
    </>
  );
}
