import type { Ref } from "react";
import { createContext } from "react";
import type { ImageDraftStateAndFile, ImageDraftStateAndUrl } from "@/src/types";

/** Root props passed from FullScreenDropZone (e.g. from react-dropzone getRootProps()). */
export type UploadBackdropRootProps = Record<string, unknown> & {
  ref?: Ref<HTMLDivElement | null>;
};

export type UploadBackdropContextValue = {
  showDropZone: (rootProps: UploadBackdropRootProps, children: React.ReactNode) => void;
  /** Shows the backdrop with the file input. Callback is invoked after the popover is visible and the input is mounted (use it to call open()). */
  showFilePicker: (children: React.ReactNode, onShown?: () => void) => void;
  scheduleHide: () => void;
  cancelScheduledHide: () => void;
  hidePopoverRef: React.RefObject<HTMLDivElement | null>;
  /** Current upload handler from AppContext. Use this when wiring dropzone/filepicker so uploads always use the latest handler (avoids stale closures when backdrop content is rendered in provider). */
  getUploadHandler: () =>
    | ((draft: ImageDraftStateAndFile | ImageDraftStateAndUrl) => Promise<void>)
    | undefined;
};

const UploadBackdropContextInstance = createContext<UploadBackdropContextValue | null>(null);

export { UploadBackdropContextInstance };
