import type { UsePersistedImagesReturn } from "./editor/hooks/usePersistedImages";
import type { ImageDraftStateAndFile, ImageDraftStateAndUrl, ImageId, ImageRecord } from "./types";

export type AppContextValue = {
  pathname: string;
  imageId: ImageId | undefined;
  images: ImageRecord[] | undefined;
  addImage: UsePersistedImagesReturn["addImage"];
  updateImage: UsePersistedImagesReturn["updateImage"];
  handleImageUpload: (
    draftAndFileOrUrl: ImageDraftStateAndFile | ImageDraftStateAndUrl | undefined,
  ) => Promise<void>;
  registerDragStartHandler: (handler: (() => void) | null) => void;
  onDragStart: () => void;
};
