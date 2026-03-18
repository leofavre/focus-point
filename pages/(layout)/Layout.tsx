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
 * - Review Privacy page.
 * - Review Shortcuts page.
 * - Review Landing page.
 * - Shared style for text-only pages.
 * - Flaky E2E tests are really bothering me.
 *
 * ### Multi-site set-up.
 *
 * - Explanatory video.
 * - OK icon.
 * - Text for devs.
 * - Text for designers.
 * - Cross-linking between sites.
 * - GDPR compliant analytics.
 * - Buy domains.
 * - Set up DNS.
 *
 * ### Advanced functionality
 *
 * - Dark mode.
 * - Support videos.
 * - Use the native API for page transitions.
 * - Support external image sources.
 * - Multiple images with "file system".
 * - Maybe make a browser extension?
 * - Maybe make a native custom element?
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
