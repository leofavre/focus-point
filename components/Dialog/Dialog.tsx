import type { ComponentPropsWithoutRef } from "react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { mergeRefs } from "react-merge-refs";
import { useClosingTransition } from "@/src/hooks/useClosingTransition";
import { IconClose } from "@/src/icons/IconClose";
import { DialogButton, DialogContent, DialogHeader, DialogWrapper } from "./Dialog.styled";
import type { DialogProps } from "./types";

export { useDialogUrlSync } from "./useDialogUrlSync";

export function Dialog({ ref, open, defaultOpen, onOpenChange, children, ...rest }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mergedRefs = mergeRefs([dialogRef, ref]);

  const [isOpen, setIsOpen] = useState(open ?? defaultOpen ?? false);

  const stableOnOpenChange = useEffectEvent((open: boolean) => {
    onOpenChange?.(open);
  });

  const stableCloseDialog = useEffectEvent(() => {
    dialogRef.current?.close();
  });

  const { isClosing, requestClose, cancelClose } = useClosingTransition({
    onClose: stableCloseDialog,
  });

  useEffect(() => {
    const targetOpen = open ?? false;
    if (targetOpen) {
      cancelClose();
      setIsOpen(true);
      stableOnOpenChange(true);
    } else if (isOpen) {
      requestClose();
    } else {
      setIsOpen(false);
      stableOnOpenChange(false);
    }
  }, [open, isOpen, requestClose, cancelClose]);

  useEffect(() => {
    if (dialogRef.current == null) return;

    if (isOpen) {
      dialogRef.current.showModal();
    }
  }, [isOpen]);

  useEffect(() => {
    if (dialogRef.current == null) return;

    const onClose = () => {
      setIsOpen(false);
      stableOnOpenChange(false);
    };

    dialogRef.current.addEventListener("close", onClose);

    return () => {
      dialogRef.current?.removeEventListener("close", onClose);
    };
  }, []);

  return (
    <DialogWrapper ref={mergedRefs} data-closing={isClosing || undefined} {...rest}>
      {children}
      <DialogButton type="button" onClick={requestClose} aria-label="Close">
        <IconClose />
      </DialogButton>
    </DialogWrapper>
  );
}

Dialog.Content = DialogContent;
Dialog.Header = DialogHeader;

export type DialogComponent = typeof Dialog & {
  Content: typeof DialogContent;
  Header: typeof DialogHeader;
};

export type DialogContentProps = ComponentPropsWithoutRef<typeof DialogContent>;
export type DialogHeaderProps = ComponentPropsWithoutRef<typeof DialogHeader>;
