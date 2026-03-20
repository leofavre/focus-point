import { useCallback, useEffect, useEffectEvent, useState } from "react";
import toast from "react-hot-toast";
import { CodeSnippet } from "@/components/CodeSnippet/CodeSnippet";
import { CodeSnippetHeader } from "@/components/CodeSnippetHeader/CodeSnippetHeader";
import { Dialog } from "@/components/Dialog/Dialog";
import { FocalPointEditor } from "@/components/FocalPointEditor/FocalPointEditor";
import type { UploadErrorCode } from "@/components/ImageUploader/getUploadErrorMessage";
import { getUploadErrorMessage } from "@/components/ImageUploader/getUploadErrorMessage";
import { ImageUploaderButton } from "@/components/ImageUploader/ImageUploaderButton";
import { LayoutCenter } from "@/pages/(layout)/Layout.styled";
import { useEditorContext } from "@/src/EditorContext";
import type { Err } from "@/src/helpers/errorHandling";
import type { ObjectPositionString } from "@/src/types";

const DEFAULT_OBJECT_POSITION: ObjectPositionString = "50% 50%";
const DEFAULT_CODE_SNIPPET_LANGUAGE = "html" as const;

export function EditPage() {
  const {
    image,
    aspectRatio,
    showFocalPoint,
    showImageOverflow,
    showCodeSnippet,
    setShowCodeSnippet,
    codeSnippetLanguage,
    setCodeSnippetLanguage,
    currentObjectPosition,
    handleImageUpload,
    handleImageError,
    handleObjectPositionChange,
    focalPointImageRef,
    isLoading,
    imageNotFoundConfirmed,
    isEditingSingleImage,
    imageCount,
  } = useEditorContext();

  const handleImageUploadError = useCallback((error: Err<UploadErrorCode>) => {
    toast.error(getUploadErrorMessage(error));
  }, []);

  if (image != null && aspectRatio != null) {
    return (
      <>
        <FocalPointEditor
          imageUrl={image.url}
          aspectRatio={aspectRatio}
          initialAspectRatio={image.naturalAspectRatio}
          objectPosition={currentObjectPosition ?? DEFAULT_OBJECT_POSITION}
          showFocalPoint={showFocalPoint ?? false}
          showImageOverflow={showImageOverflow ?? false}
          onObjectPositionChange={handleObjectPositionChange}
          onImageError={handleImageError}
          focalPointImageRef={focalPointImageRef}
        />
        <Dialog
          open={showCodeSnippet}
          onOpenChange={setShowCodeSnippet}
          aria-label="Code snippet"
          css={{ backgroundColor: "var(--color-background)" }}
        >
          <Dialog.Header>
            <CodeSnippetHeader
              codeSnippetLanguage={codeSnippetLanguage ?? DEFAULT_CODE_SNIPPET_LANGUAGE}
              setCodeSnippetLanguage={setCodeSnippetLanguage}
            />
          </Dialog.Header>
          <Dialog.Content>
            <CodeSnippet
              src={image.name}
              objectPosition={currentObjectPosition ?? DEFAULT_OBJECT_POSITION}
              language={codeSnippetLanguage ?? DEFAULT_CODE_SNIPPET_LANGUAGE}
              triggerAutoFocus={showCodeSnippet}
            />
          </Dialog.Content>
        </Dialog>
      </>
    );
  }

  if (isLoading) {
    return null;
  }

  if (imageNotFoundConfirmed) {
    return (
      <LayoutCenter>
        <ImageUploaderButton
          size="large"
          label="Choose image"
          onImageUpload={handleImageUpload}
          onImageUploadError={handleImageUploadError}
          icon="add"
        />
        <StaticMessage>
          {isEditingSingleImage ? "Start by choosing an image" : "Image not found"}
        </StaticMessage>
      </LayoutCenter>
    );
  }

  return (
    <LayoutCenter>
      <ImageUploaderButton
        size="large"
        label="Choose image"
        onImageUpload={handleImageUpload}
        onImageUploadError={handleImageUploadError}
        icon="add"
      />
    </LayoutCenter>
  );
}

function StaticMessage({ children }: { children: string }) {
  // The message never changes until the component is unmounted
  const [message] = useState(children);
  return <h3>{message}</h3>;
}
