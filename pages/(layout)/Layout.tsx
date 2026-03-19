import type { PropsWithChildren } from "react";
import { useCallback } from "react";
import toast from "react-hot-toast";
import { FullScreenDropZone } from "@/components/ImageUploader/FullScreenDropZone";
import type { UploadErrorCode } from "@/components/ImageUploader/getUploadErrorMessage";
import { getUploadErrorMessage } from "@/components/ImageUploader/getUploadErrorMessage";
import { SiteTitle } from "@/components/SiteTitle/SiteTitle";
import { useAppContext } from "@/src/AppContext";
import type { Err } from "@/src/helpers/errorHandling";
import { HeaderLinks, LayoutGrid, LayoutHeader, PrivacyLink } from "./Layout.styled";

/**
 * @todo
 *
 * ### MELHORIZE™ UI.
 *
 * - Mobile: remove visible focus outline, at least for the image editor.
 * - Mobile: prevent long click on image.
 * - Remove the "original" text from the slider. Use the substituted aspect ratio if there is one.
 * - OK icon for toaster.
 * - Error icon for toaster.
 * - Swap icon for Image button.
 * - Bigger selector thumbnail, square rotated 45 degrees.
 * - Review Privacy page.
 * - Review Shortcuts page.
 * - Review not found states.
 * - Shared style for text-only pages.
 *
 * ### Multi-site set-up.
 *
 * - Text for devs.
 * - Text for designers.
 * - Cross-linking between sites.
 * - GDPR compliant analytics.
 * - Buy domains.
 * - Set up DNS.
 *
 * ### Advanced functionality
 *
 * - Explanatory video.
 * - Dark mode.
 * - Support videos.
 * - Support external image sources.
 * - Support breakpoints.
 * - Use the native API for page transitions.
 * - Multiple images with "file system".
 * - Maybe make a browser extension?
 * - Maybe make a native custom element?
 * - Maybe use AI to auto-detect the focal point?
 * - Flaky E2E tests are really bothering me.
 */
export default function Layout({ children }: PropsWithChildren) {
  const { handleImageUpload, onDragStart } = useAppContext();

  const handleImageUploadError = useCallback((error: Err<UploadErrorCode>) => {
    toast.error(getUploadErrorMessage(error));
  }, []);

  return (
    <>
      <FullScreenDropZone
        onImageUpload={handleImageUpload}
        onImageUploadError={handleImageUploadError}
        onDragStart={onDragStart}
      />
      <LayoutGrid id="main">
        <LayoutHeader>
          <SiteTitle />
          <HeaderLinks>
            <PrivacyLink href="/shortcuts">Shortcuts</PrivacyLink>
            <PrivacyLink href="/privacy">Privacy</PrivacyLink>
          </HeaderLinks>
        </LayoutHeader>
        {children}
      </LayoutGrid>
    </>
  );
}
