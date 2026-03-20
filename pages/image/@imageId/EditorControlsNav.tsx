import { useCallback } from "react";
import toast from "react-hot-toast";
import { useHydrated } from "vike-react/useHydrated";
import { AspectRatioSlider } from "@/components/AspectRatioSlider/AspectRatioSlider";
import { Button } from "@/components/Button/Button";
import type { UploadErrorCode } from "@/components/ImageUploader/getUploadErrorMessage";
import { getUploadErrorMessage } from "@/components/ImageUploader/getUploadErrorMessage";
import { ImageUploaderButton } from "@/components/ImageUploader/ImageUploaderButton";
import { EditorControlsNav as EditorControlsNavStyled } from "@/pages/(layout)/Layout.styled";
import { useEditorContext } from "@/src/EditorContext";
import type { Err } from "@/src/helpers/errorHandling";
import { IconCode } from "@/src/icons/IconCode";
import { IconMask } from "@/src/icons/IconMask";
import { IconReference } from "@/src/icons/IconReference";

export function EditorControlsNav() {
  const {
    image,
    aspectRatio,
    setAspectRatio,
    showFocalPoint,
    setShowFocalPoint,
    showImageOverflow,
    setShowImageOverflow,
    showCodeSnippet,
    setShowCodeSnippet,
    handleImageUpload,
    uploaderButtonRef,
    aspectRatioSliderRef,
  } = useEditorContext();
  const isHydrated = useHydrated();

  const handleImageUploadError = useCallback((error: Err<UploadErrorCode>) => {
    toast.error(getUploadErrorMessage(error));
  }, []);

  const isUIStateButtonDisabled = !isHydrated || image == null;

  return (
    <EditorControlsNavStyled data-component="EditorControlsNav" aria-label="Editor controls">
      <Button
        type="button"
        data-component="FocalPointButton"
        toggleable
        toggled={showFocalPoint ?? false}
        onToggle={(toggled) => setShowFocalPoint(!toggled)}
        disabled={isUIStateButtonDisabled}
        grow
      >
        <IconReference />
        <Button.ButtonText>Focal point</Button.ButtonText>
      </Button>
      <Button
        type="button"
        data-component="ImageOverflowButton"
        toggleable
        toggled={showImageOverflow ?? false}
        onToggle={(toggled) => setShowImageOverflow(!toggled)}
        disabled={isUIStateButtonDisabled}
        grow
      >
        <IconMask />
        <Button.ButtonText>Overflow</Button.ButtonText>
      </Button>
      <AspectRatioSlider
        ref={aspectRatioSliderRef}
        aspectRatio={aspectRatio}
        defaultAspectRatio={image?.naturalAspectRatio}
        onAspectRatioChange={setAspectRatio}
        disabled={isUIStateButtonDisabled}
      />
      <Button
        type="button"
        data-component="CodeSnippetButton"
        toggleable
        toggled={showCodeSnippet ?? false}
        onToggle={(toggled) => setShowCodeSnippet(!toggled)}
        disabled={isUIStateButtonDisabled}
        grow
      >
        <IconCode />
        <Button.ButtonText>Code</Button.ButtonText>
      </Button>
      <ImageUploaderButton
        ref={uploaderButtonRef}
        label="Image"
        onImageUpload={handleImageUpload}
        onImageUploadError={handleImageUploadError}
        grow
        disabled={isUIStateButtonDisabled}
        icon="swap"
      />
    </EditorControlsNavStyled>
  );
}
