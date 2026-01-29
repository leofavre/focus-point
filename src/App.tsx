import type { ChangeEvent, FormEvent } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppGrid, ToggleBar } from "./App.styled";
import { AspectRatioSlider } from "./components/AspectRatioSlider/AspectRatioSlider";
import { useAspectRatioList } from "./components/AspectRatioSlider/hooks";
import { CodeSnippet } from "./components/CodeSnippet/CodeSnippet";
import { DEFAULT_OBJECT_POSITION } from "./components/FocusPointEditor/constants";
import { FocusPointEditor } from "./components/FocusPointEditor/FocusPointEditor";
import { ImageUploader } from "./components/ImageUploader/ImageUploader";
import { ToggleButton } from "./components/ToggleButton/ToggleButton";
import { createKeyboardShortcutHandler } from "./helpers";
import { usePersistedUIState } from "./hooks";
import { CodeSnippetToggleIcon } from "./icons/CodeSnippetToggleIcon";
import { GhostImageToggleIcon } from "./icons/GhostImageToggleIcon";
import { PointMarkerToggleIcon } from "./icons/PointMarkerToggleIcon";

const DEFAULT_SHOW_POINT_MARKER = false;
const DEFAULT_SHOW_GHOST_IMAGE = false;
const DEFAULT_SHOW_CODE_SNIPPET = false;
const DEFAULT_ASPECT_RATIO = 1;

/**
 * @todo
 *
 * ### Basic functionality
 *
 * - Handle loading.
 * - Handle errors.
 * - Persist images and their states in IndexedDB.
 * - Reset aspectRatio when a new image is uploaded.
 * - Document functions, hooks and components.
 * - Drag image to upload.
 * - Make shure focus is visible, specially in AspectRatioSlider.
 * - Make shure to use CSS variable for values used in calculations, specially in AspectRatioSlider.
 * - CodeSnippet with copy button.
 * - Melhorize™ UI.
 *
 * ### Landing page
 * - Shows all uploaded images with masonry grid.
 * - Explains the project.
 * - Maybe an explainer Loom?
 *
 * ### Advanced functionality
 *
 * - Plan state (and reducers?)
 * - Handle multiple images (needs routing).
 * - Breakpoints with container queries.
 * - Undo/redo (needs state tracking).
 * - Maybe make a browser extension?.
 * - Maybe make a React component?.
 * - Maybe make a native custom element?.
 */
export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageRef = useRef<HTMLImageElement>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<number>();
  const [objectPosition, setObjectPosition] = useState(DEFAULT_OBJECT_POSITION);

  const [aspectRatio, setAspectRatio] = usePersistedUIState({
    id: "aspectRatio",
    defaultValue: DEFAULT_ASPECT_RATIO,
  });

  const [showPointMarker, setShowPointMarker] = usePersistedUIState({
    id: "showPointMarker",
    defaultValue: DEFAULT_SHOW_POINT_MARKER,
  });

  const [showGhostImage, setShowGhostImage] = usePersistedUIState({
    id: "showGhostImage",
    defaultValue: DEFAULT_SHOW_GHOST_IMAGE,
  });

  const [showCodeSnippet, setShowCodeSnippet] = usePersistedUIState({
    id: "showCodeSnippet",
    defaultValue: DEFAULT_SHOW_CODE_SNIPPET,
  });

  const aspectRatioList = useAspectRatioList(imageAspectRatio);

  // Convert file to base64
  const fileToBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFileChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (!file?.type.startsWith("image/")) return;

      try {
        // Convert file to base64
        const base64 = await fileToBase64(file);

        // Create image element to get natural dimensions
        const img = new Image();
        img.src = base64;
        await Promise.resolve();

        const naturalAspectRatio = img.naturalWidth / img.naturalHeight;

        // Update React state
        setImageFileName(file.name);
        setImageUrl(base64);
        setImageAspectRatio(naturalAspectRatio);
        setObjectPosition(DEFAULT_OBJECT_POSITION);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    },
    [fileToBase64],
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

  useEffect(() => {
    const handleKeyDown = createKeyboardShortcutHandler({
      u: () => {
        fileInputRef.current?.click();
      },
      a: () => {
        setShowPointMarker((prev) => !prev);
      },
      p: () => {
        setShowPointMarker((prev) => !prev);
      },
      s: () => {
        setShowGhostImage((prev) => !prev);
      },
      l: () => {
        setShowGhostImage((prev) => !prev);
      },
      d: () => {
        setShowCodeSnippet((prev) => !prev);
      },
      c: () => {
        setShowCodeSnippet((prev) => !prev);
      },
    });

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [setShowCodeSnippet, setShowPointMarker, setShowGhostImage]);

  return (
    <AppGrid>
      <ImageUploader
        ref={fileInputRef}
        onFormSubmit={handleFormSubmit}
        onImageChange={handleFileChange}
        data-component="ImageUploader"
      />
      <ToggleBar data-component="ToggleBar">
        {showPointMarker != null && (
          <ToggleButton
            toggled={showPointMarker}
            onToggle={() => setShowPointMarker((prev) => !prev)}
            titleOn="Hide pointer marker"
            titleOff="Show pointer marker"
            icon={<PointMarkerToggleIcon />}
          />
        )}
        {showGhostImage != null && (
          <ToggleButton
            toggled={showGhostImage}
            onToggle={() => setShowGhostImage((prev) => !prev)}
            titleOn="Hide ghost image"
            titleOff="Show ghost image"
            icon={<GhostImageToggleIcon />}
          />
        )}
        {showCodeSnippet != null && (
          <ToggleButton
            toggled={showCodeSnippet}
            onToggle={() => setShowCodeSnippet((prev) => !prev)}
            titleOn="Hide code snippet"
            titleOff="Show code snippet"
            icon={<CodeSnippetToggleIcon />}
          />
        )}
      </ToggleBar>
      {imageUrl && (
        <>
          {aspectRatio != null && imageAspectRatio != null && (
            <FocusPointEditor
              ref={imageRef}
              imageUrl={imageUrl}
              aspectRatio={aspectRatio}
              initialAspectRatio={imageAspectRatio}
              objectPosition={objectPosition}
              showPointMarker={showPointMarker ?? false}
              showGhostImage={showGhostImage ?? false}
              onObjectPositionChange={setObjectPosition}
              onImageError={handleImageError}
              data-component="FocusPointEditor"
            />
          )}
          <CodeSnippet
            src={imageFileName}
            objectPosition={objectPosition}
            data-component="CodeSnippet"
            css={{
              opacity: showCodeSnippet ? 1 : 0,
              transition: "opacity 0.15s ease",
              pointerEvents: showCodeSnippet ? "auto" : "none",
            }}
          />
          {aspectRatio != null && (
            <AspectRatioSlider
              aspectRatio={aspectRatio}
              aspectRatioList={aspectRatioList}
              onAspectRatioChange={setAspectRatio}
              data-component="AspectRatioSlider"
            />
          )}
        </>
      )}
    </AppGrid>
  );
}
