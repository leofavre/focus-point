import type { PropsWithChildren } from "react";
import { useCallback, useContext, useRef } from "react";
import toast from "react-hot-toast";
import { navigate as vikeNavigate } from "vike/client/router";
import { usePageContext } from "vike-react/usePageContext";
import type { AppContextValue } from "./AppContext.types";
import { AppContextInstance } from "./AppContextInstance";
import { createImageStateFromDraftAndFile } from "./editor/helpers/createImageStateFromDraftAndFile";
import { createImageStateFromUrl } from "./editor/helpers/createImageStateFromUrl";
import { usePersistedImages } from "./editor/hooks/usePersistedImages";
import { logError } from "./helpers/errorHandling";
import { getCreateImageStateErrorMessage } from "./helpers/getCreateImageStateErrorMessage";
import type { ImageDraftStateAndFile, ImageDraftStateAndUrl, ImageId } from "./types";
import { isImageDraftStateAndUrl } from "./types";

const IMAGE_ROUTE_PREFIX = "/image/";
const SINGLE_IMAGE_MODE_ID = "edit" as ImageId;
const PERSISTENCE_MODE = "singleImage" as const;

/**
 * Derives imageId from the current pathname. Only "/image/:imageId" yields an id; "/" or other paths yield undefined.
 */
function getImageIdFromPathname(pathname: string): ImageId | undefined {
  if (!pathname.startsWith(IMAGE_ROUTE_PREFIX) || pathname.length <= IMAGE_ROUTE_PREFIX.length) {
    return undefined;
  }
  const segment = pathname.slice(IMAGE_ROUTE_PREFIX.length).trim();
  return segment === "" ? undefined : (segment as ImageId);
}

export type { AppContextValue };

export function AppContextProvider({ children }: PropsWithChildren) {
  const pageContext = usePageContext();
  const pathname = pageContext?.urlPathname ?? "";
  const imageId = getImageIdFromPathname(pathname);
  const dragStartHandlerRef = useRef<(() => void) | null>(null);

  const navigate = useCallback((url: string) => {
    vikeNavigate(url);
  }, []);

  const { images, addImage, updateImage } = usePersistedImages({
    onRefreshImagesError: logError,
  });

  const registerDragStartHandler = useCallback((handler: (() => void) | null) => {
    dragStartHandlerRef.current = handler;
  }, []);

  const onDragStart = useCallback(() => {
    dragStartHandlerRef.current?.();
  }, []);

  const handleImageUpload = useCallback(
    async (draftAndFileOrUrl: ImageDraftStateAndFile | ImageDraftStateAndUrl | undefined) => {
      if (draftAndFileOrUrl == null) return;

      const imageStateResult = isImageDraftStateAndUrl(draftAndFileOrUrl)
        ? await createImageStateFromUrl(draftAndFileOrUrl)
        : await createImageStateFromDraftAndFile(draftAndFileOrUrl);

      if (imageStateResult.rejected != null) {
        toast.error(getCreateImageStateErrorMessage(imageStateResult.rejected.reason));
        return;
      }

      const addResult = await addImage(draftAndFileOrUrl, {
        id: PERSISTENCE_MODE === "singleImage" ? SINGLE_IMAGE_MODE_ID : undefined,
      });

      if (addResult.rejected != null) {
        logError(addResult.rejected);
      }

      const nextImageId = addResult.accepted;
      // Use current URL so navigation decision is correct after client-side navigation (e.g. on image edit page, usePageContext in layout can be stale).
      const currentPathname = typeof window !== "undefined" ? window.location.pathname : pathname;
      const currentImageId = getImageIdFromPathname(currentPathname);
      const shouldNavigate = nextImageId != null && currentImageId !== nextImageId;

      if (shouldNavigate) {
        await navigate(`/image/${nextImageId}`);
      }
    },
    [addImage, navigate, pathname],
  );

  const value: AppContextValue = {
    pathname,
    imageId,
    images,
    addImage,
    updateImage,
    handleImageUpload,
    registerDragStartHandler,
    onDragStart,
  };

  return <AppContextInstance.Provider value={value}>{children}</AppContextInstance.Provider>;
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContextInstance);

  if (context == null) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }

  return context;
}
