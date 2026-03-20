import { useEffect, useRef } from "react";
import type { Toast } from "react-hot-toast";
import { ToastBar, useToaster } from "react-hot-toast";
import { parseBooleanAttr } from "@/src/helpers/parseBooleanAttr";
import { BACKDROP_HIDE_DELAY_MS } from "@/src/hooks/useClosingTransition";
import { IconClose } from "@/src/icons/IconClose";
import { IconOk } from "@/src/icons/IconOk";
import { Wrapper } from "./Toaster.styled";

function ToastPopover({ toast, children, ...rest }: { toast: Toast; children: React.ReactNode }) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (popoverRef.current == null) return;
    popoverRef.current.showPopover();
  }, []);

  useEffect(() => {
    if (popoverRef.current == null) return;

    if (toast.visible) {
      if (hideTimeoutRef.current != null) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    } else {
      hideTimeoutRef.current = setTimeout(() => {
        hideTimeoutRef.current = null;
        popoverRef.current?.hidePopover();
      }, BACKDROP_HIDE_DELAY_MS);
    }

    return () => {
      if (hideTimeoutRef.current != null) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
    };
  }, [toast.visible]);

  return (
    <Wrapper ref={popoverRef} popover="manual" {...rest}>
      {children}
    </Wrapper>
  );
}

export function Toaster() {
  const { toasts } = useToaster({
    style: {
      borderRadius: 0,
      opacity: 1,
    },
    success: {
      icon: <IconOk />,
    },
    error: {
      icon: <IconClose />,
    },
    duration: 120_000,
  });

  const dismissedCount = toasts.filter((toast) => toast.dismissed).length;

  return toasts.map((toast, index, arr) => {
    const position = arr.length - index - dismissedCount - 1;

    return (
      <ToastPopover
        data-dismissed={parseBooleanAttr(toast.dismissed)}
        key={toast.id}
        toast={toast}
        css={{ "--position": position }}
      >
        <ToastBar toast={toast} />
      </ToastPopover>
    );
  });
}
