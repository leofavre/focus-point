import type { Dispatch, RefObject, SetStateAction } from "react";
import type { AppContextValue } from "./AppContext.types";
import type {
  CodeSnippetLanguage,
  ImageId,
  ImageState,
  ObjectPositionString,
  UIPersistenceMode,
} from "./types";

export type EditorContextValue = {
  pathname: string;
  persistenceMode: UIPersistenceMode;
  imageId: ImageId | undefined;
  image: ImageState | null;
  images: AppContextValue["images"];
  imageCount: number | undefined;
  aspectRatio: number | undefined;
  setAspectRatio: Dispatch<SetStateAction<number | undefined>>;
  showFocalPoint: boolean | undefined;
  setShowFocalPoint: Dispatch<SetStateAction<boolean | undefined>>;
  showImageOverflow: boolean | undefined;
  setShowImageOverflow: Dispatch<SetStateAction<boolean | undefined>>;
  showCodeSnippet: boolean;
  setShowCodeSnippet: Dispatch<SetStateAction<boolean>>;
  codeSnippetLanguage: CodeSnippetLanguage | undefined;
  setCodeSnippetLanguage: Dispatch<SetStateAction<CodeSnippetLanguage | undefined>>;
  currentObjectPosition: ObjectPositionString | undefined;
  imageNotFoundConfirmed: boolean;
  isLoading: boolean;
  isEditingSingleImage: boolean;
  handleImageUpload: AppContextValue["handleImageUpload"];
  handleImageError: () => void;
  handleObjectPositionChange: (objectPosition: ObjectPositionString) => void;
  uploaderButtonRef: RefObject<HTMLButtonElement | null>;
  focalPointImageRef: RefObject<HTMLDivElement | null>;
  aspectRatioSliderRef: RefObject<HTMLInputElement | null>;
};
