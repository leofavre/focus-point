import toast from "react-hot-toast";
import { normalizeWhitespaceInQuotes } from "./normalizeWhitespaceInQuotes";

/**
 * Copies text to the clipboard with toast feedback. Normalizes whitespace in quotes
 * before copying. Shows success or error toast.
 *
 * @param text - Plain text to copy.
 * @returns Promise that resolves when done.
 */
export async function copyTextToClipboardWithToast(text: string): Promise<void> {
  const textToCopy = normalizeWhitespaceInQuotes(text);
  const success = await copyToClipboard(textToCopy);

  if (success) {
    toast.success("Code copied to clipboard.");
  } else {
    toast.error("Failed to copy to clipboard.");
  }
}

/**
 * Copies text to the clipboard. Tries the Clipboard API first (required for iOS Safari
 * to run in the same user gesture as the click). Falls back to execCommand when the
 * API is unavailable or fails (e.g. insecure context, modal dialogs on some browsers).
 * The fallback container is chosen implicitly: the open dialog that has focus, or
 * document.body if no dialog has focus.
 *
 * @param text - Plain text to copy.
 * @returns Promise that resolves to true if copy succeeded, false otherwise.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  const container = getFallbackContainer();

  if (typeof navigator.clipboard?.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return fallbackCopyToClipboard(text, container);
    }
  }
  return fallbackCopyToClipboard(text, container);
}

/**
 * Returns the element to use as container for the fallback copy (execCommand path).
 * If focus is inside an open dialog, uses that dialog so selection stays in its
 * focus scope; otherwise uses document.body.
 */
function getFallbackContainer(): HTMLElement {
  const dialog = document.activeElement?.closest?.("dialog[open]");
  if (dialog instanceof HTMLElement) {
    return dialog;
  }
  return document.body;
}

/**
 * Fallback when Clipboard API is unavailable (e.g. insecure context, old browsers).
 */
function fallbackCopyToClipboard(text: string, container: HTMLElement): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("aria-hidden", "true");
  textarea.setAttribute("readonly", "");
  Object.assign(textarea.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "2em",
    height: "2em",
    padding: "0",
    border: "none",
    outline: "none",
    boxShadow: "none",
    background: "transparent",
    opacity: "0",
    pointerEvents: "none",
  });
  container.appendChild(textarea);
  textarea.focus();
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  try {
    return document.execCommand("copy");
  } finally {
    container.removeChild(textarea);
  }
}
