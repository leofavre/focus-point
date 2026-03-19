import type { PropsWithChildren, SetStateAction } from "react";
import { useCallback, useContext, useEffect, useEffectEvent, useRef, useState } from "react";
import toast from "react-hot-toast";
import { usePageContext } from "vike-react/usePageContext";
import { copyTextToClipboardWithToast } from "@/components/CodeSnippet/helpers/copyToClipboard";
import { getCodeSnippet } from "@/components/CodeSnippet/helpers/getCodeSnippet";
import { useDialogUrlSync } from "@/components/Dialog/useDialogUrlSync";
import { useAppContext } from "./AppContext";
import type { EditorContextValue } from "./EditorContext.types";
import { EditorContextInstance } from "./EditorContextInstance";
import { createImageStateFromRecord } from "./editor/helpers/createImageStateFromRecord";
import { createImageStateFromUrl } from "./editor/helpers/createImageStateFromUrl";
import { createKeyboardShortcutHandler } from "./editor/helpers/createKeyboardShortcutHandler";
import { usePersistedUIRecord } from "./editor/hooks/usePersistedUIRecord";
import { logError } from "./helpers/errorHandling";
import { getCreateImageStateErrorMessage } from "./helpers/getCreateImageStateErrorMessage";
import { shouldHideBodyOverflow } from "./helpers/shouldHideBodyOverflow";
import { useDebouncedEffect } from "./hooks/useDebouncedEffect";
import type {
  CodeSnippetLanguage,
  ImageId,
  ImageState,
  ObjectPositionString,
  UIPersistenceMode,
} from "./types";
import { hasUrl } from "./types";

const DEFAULT_SHOW_FOCAL_POINT = false;
const DEFAULT_SHOW_IMAGE_OVERFLOW = false;
const DEFAULT_CODE_SNIPPET_LANGUAGE: CodeSnippetLanguage = "html";
const DEFAULT_ASPECT_RATIO = 1;
const INTERACTION_DEBOUNCE_MS = 500;
const IMAGE_LOAD_DEBOUNCE_MS = 50;
const SINGLE_IMAGE_MODE_ID = "edit" as ImageId;
const PERSISTENCE_MODE: UIPersistenceMode = "singleImage";

export type { EditorContextValue };

export function EditorContextProvider({ children }: PropsWithChildren) {
  const { pathname, imageId, images, updateImage, handleImageUpload, registerDragStartHandler } =
    useAppContext();

  const uploaderButtonRef = useRef<HTMLButtonElement>(null);
  const focalPointImageRef = useRef<HTMLDivElement>(null);
  const aspectRatioSliderRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<ImageState | null>(null);

  const safeSetImage = useEffectEvent(
    (valueOrFn: ImageState | null | ((prev: ImageState | null) => ImageState | null)) => {
      setImage((prevValue) => {
        const nextValue = typeof valueOrFn === "function" ? valueOrFn(prevValue) : valueOrFn;

        if (prevValue != null && prevValue.url !== nextValue?.url) {
          if (prevValue.url.startsWith("blob:")) {
            URL.revokeObjectURL(prevValue.url);
          }
        }

        return nextValue;
      });
    },
  );

  const [aspectRatio, setAspectRatio] = usePersistedUIRecord(
    { id: "aspectRatio", value: DEFAULT_ASPECT_RATIO },
    { debounceTimeout: INTERACTION_DEBOUNCE_MS, onError: logError },
  );

  const [showFocalPoint, setShowFocalPoint] = usePersistedUIRecord(
    { id: "showFocalPoint", value: DEFAULT_SHOW_FOCAL_POINT },
    { onError: logError },
  );

  const [showImageOverflow, setShowImageOverflow] = usePersistedUIRecord(
    { id: "showImageOverflow", value: DEFAULT_SHOW_IMAGE_OVERFLOW },
    { onError: logError },
  );

  const [codeSnippetLanguage, setCodeSnippetLanguage] = usePersistedUIRecord(
    { id: "codeSnippetLanguage", value: DEFAULT_CODE_SNIPPET_LANGUAGE },
    { onError: logError },
  );

  const pageContext = usePageContext();
  const isImageRoute = /^\/image\/[^/]+$/.test(pathname);
  const [codeInUrl, setCodeInUrl] = useState(false);

  useEffect(() => {
    if (!isImageRoute) {
      setCodeInUrl(false);
      return;
    }
    const search = pageContext?.urlParsed?.search ?? {};
    setCodeInUrl("code" in search);
  }, [isImageRoute, pageContext?.urlParsed?.search]);

  const getCodeParamInUrl = useCallback(() => {
    return isImageRoute && codeInUrl;
  }, [isImageRoute, codeInUrl]);

  const setCodeParamInUrl = useCallback((present: boolean) => {
    if (typeof window === "undefined") return;
    const currentPathname = window.location.pathname;
    if (!/^\/image\/[^/]+$/.test(currentPathname)) return;
    const params = new URLSearchParams(window.location.search);
    if (present) params.set("code", "");
    else params.delete("code");

    const searchStr = Array.from(params.entries())
      .map(([k, v]) => (v === "" ? k : `${k}=${encodeURIComponent(v)}`))
      .join("&");

    const hash = window.location.hash;
    const newUrl = currentPathname + (searchStr ? `?${searchStr}` : "") + hash;
    window.history.replaceState(window.history.state, "", newUrl);
    setCodeInUrl(present);
  }, []);

  const { open: showCodeSnippet, onOpenChange: setShowCodeSnippetFromHook } = useDialogUrlSync({
    getParamInUrl: getCodeParamInUrl,
    setParamInUrl: setCodeParamInUrl,
  });

  const setShowCodeSnippet = useCallback(
    (valueOrUpdater: SetStateAction<boolean>) => {
      const next =
        typeof valueOrUpdater === "function" ? valueOrUpdater(showCodeSnippet) : valueOrUpdater;
      setShowCodeSnippetFromHook(next);
    },
    [showCodeSnippet, setShowCodeSnippetFromHook],
  );

  const [imageNotFoundConfirmed, setImageNotFoundConfirmed] = useState(false);

  const currentObjectPosition = image?.breakpoints?.[0]?.objectPosition;

  const stableImageRecordGetter = useEffectEvent((id: ImageId) => {
    return images?.find((img) => img.id === id);
  });

  const isEditingSingleImage =
    PERSISTENCE_MODE === "singleImage" && imageId === SINGLE_IMAGE_MODE_ID;

  const isOnImageRoute = pathname.startsWith("/image/");

  useEffect(() => {
    registerDragStartHandler(() => setShowCodeSnippetFromHook(false));
    return () => registerDragStartHandler(null);
  }, [registerDragStartHandler, setShowCodeSnippetFromHook]);

  const handleImageError = useCallback(() => {
    toast.error("Failed to load image");
    safeSetImage(null);
  }, []);

  const handleObjectPositionChange = useCallback((objectPosition: ObjectPositionString) => {
    safeSetImage((prev) => (prev != null ? { ...prev, breakpoints: [{ objectPosition }] } : null));
  }, []);

  useEffect(() => {
    return () => {
      safeSetImage(null);
    };
  }, []);

  useEffect(() => {
    const hideOverflow = shouldHideBodyOverflow(pathname);
    document.body.classList.toggle("no-overflow", hideOverflow);
    return () => document.body.classList.remove("no-overflow");
  }, [pathname]);

  useEffect(() => {
    const handleCopyCodeSnippet = () => {
      const imageName = image?.name;
      const objectPosition = currentObjectPosition ?? (image != null ? "50% 50%" : undefined);
      const language = codeSnippetLanguage ?? DEFAULT_CODE_SNIPPET_LANGUAGE;

      if (imageName == null || objectPosition == null) return;

      const snippet = getCodeSnippet({ language, src: imageName, objectPosition });
      copyTextToClipboardWithToast(snippet);
    };

    const handleKeyDown = createKeyboardShortcutHandler({
      e: () => {
        focalPointImageRef.current?.focus();
      },
      a: () => {
        setShowFocalPoint((prev) => !prev);
      },
      s: () => {
        setShowImageOverflow((prev) => !prev);
      },
      d: () => {
        aspectRatioSliderRef.current?.focus();
      },
      f: () => {
        setShowCodeSnippet(true);
      },
      g: () => {
        uploaderButtonRef.current?.click();
      },
      u: () => {
        uploaderButtonRef.current?.click();
      },
      i: () => {
        uploaderButtonRef.current?.click();
      },
      c: handleCopyCodeSnippet,
    });

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [
    image,
    currentObjectPosition,
    codeSnippetLanguage,
    setShowFocalPoint,
    setShowImageOverflow,
    setShowCodeSnippet,
  ]);

  useDebouncedEffect(
    () => {
      if (imageId == null || currentObjectPosition == null) return;

      updateImage(imageId, {
        breakpoints: [{ objectPosition: currentObjectPosition }],
      }).then((result) => {
        if (result.rejected != null) {
          logError(result.rejected);
          return;
        }
        if (result.accepted != null) {
          console.log("updated image", imageId, "with object position", currentObjectPosition);
        }
      });
    },
    { timeout: INTERACTION_DEBOUNCE_MS },
    [imageId, currentObjectPosition, updateImage],
  );

  useDebouncedEffect(
    () => {
      if (imageId == null || aspectRatio == null) return;

      updateImage(imageId, { lastKnownAspectRatio: aspectRatio }).then((result) => {
        if (result.rejected != null) {
          logError(result.rejected);
          return;
        }

        if (result.accepted != null) {
          console.log("updated image", imageId, "with lastKnownAspectRatio", aspectRatio);
        }
      });
    },
    { timeout: INTERACTION_DEBOUNCE_MS },
    [imageId, aspectRatio, updateImage],
  );

  const imageCount = images?.length;

  const singleImageCreatedAt =
    PERSISTENCE_MODE === "singleImage"
      ? images?.find((img) => img.id === SINGLE_IMAGE_MODE_ID)?.createdAt
      : null;

  useDebouncedEffect(
    () => {
      async function asyncSetImageState() {
        if (imageId == null) return;

        if (imageCount == null) {
          console.log("persistence layer is loading");
          safeSetImage(null);
          return;
        }

        if (imageCount === 0) {
          console.log("persistence layer is empty");
          safeSetImage(null);
          setImageNotFoundConfirmed(true);
          return;
        }

        const imageRecord = stableImageRecordGetter(imageId);

        if (imageRecord == null) {
          console.log("image not found in the persistence layer");
          safeSetImage(null);
          setImageNotFoundConfirmed(true);
          return;
        }

        const result = hasUrl(imageRecord)
          ? await createImageStateFromUrl({
              imageDraft: {
                name: imageRecord.name,
                type: imageRecord.type,
                createdAt: imageRecord.createdAt,
                breakpoints: imageRecord.breakpoints,
              },
              url: imageRecord.url,
            })
          : await createImageStateFromRecord(imageRecord);

        if (result.rejected != null) {
          safeSetImage(null);
          toast.error(getCreateImageStateErrorMessage(result.rejected.reason));
          return;
        }

        const nextImageState = result.accepted;

        safeSetImage(nextImageState);
        setAspectRatio(
          imageRecord.lastKnownAspectRatio ??
            nextImageState.naturalAspectRatio ??
            DEFAULT_ASPECT_RATIO,
        );
        console.log("loaded image from record", imageRecord);
      }

      asyncSetImageState();
    },
    { timeout: IMAGE_LOAD_DEBOUNCE_MS },
    [imageId, imageCount, singleImageCreatedAt, setAspectRatio],
  );

  const isLoading = isOnImageRoute && image == null && !imageNotFoundConfirmed;

  const value: EditorContextValue = {
    pathname,
    persistenceMode: PERSISTENCE_MODE,
    imageId,
    image,
    images,
    imageCount,
    aspectRatio,
    setAspectRatio,
    showFocalPoint,
    setShowFocalPoint,
    showImageOverflow,
    setShowImageOverflow,
    showCodeSnippet,
    setShowCodeSnippet,
    codeSnippetLanguage,
    setCodeSnippetLanguage,
    currentObjectPosition,
    imageNotFoundConfirmed,
    isLoading,
    isEditingSingleImage,
    handleImageUpload,
    handleImageError,
    handleObjectPositionChange,
    uploaderButtonRef,
    focalPointImageRef,
    aspectRatioSliderRef,
  };

  return <EditorContextInstance.Provider value={value}>{children}</EditorContextInstance.Provider>;
}

export function useEditorContext(): EditorContextValue {
  const context = useContext(EditorContextInstance);

  if (context == null) {
    throw new Error("useEditorContext must be used within EditorContextProvider");
  }

  return context;
}
