import { useCallback } from "react";
import toast from "react-hot-toast";
import { HowToUse } from "@/components/HowToUse/HowToUse";
import type { UploadErrorCode } from "@/components/ImageUploader/getUploadErrorMessage";
import { getUploadErrorMessage } from "@/components/ImageUploader/getUploadErrorMessage";
import { ImageUploaderButton } from "@/components/ImageUploader/ImageUploaderButton";
import { useAppContext } from "@/src/AppContext";
import type { Err } from "@/src/helpers/errorHandling";
import { LandingWrapper } from "./Landing.styled";

export function LandingPage() {
  const { handleImageUpload } = useAppContext();

  const handleImageUploadError = useCallback((error: Err<UploadErrorCode>) => {
    toast.error(getUploadErrorMessage(error));
  }, []);

  return (
    <LandingWrapper data-component="Landing">
      <ImageUploaderButton
        size="large"
        label="Choose image"
        onImageUpload={handleImageUpload}
        onImageUploadError={handleImageUploadError}
        icon="add"
      />
      <HowToUse />
    </LandingWrapper>
  );
}
