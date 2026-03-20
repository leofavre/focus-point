import toast from "react-hot-toast";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { copyTextToClipboardWithToast, copyToClipboard } from "./copyToClipboard";

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const normalizeWhitespaceInQuotesMock = vi.fn((t: string) => t);
vi.mock("./normalizeWhitespaceInQuotes", () => ({
  normalizeWhitespaceInQuotes: (t: string) => normalizeWhitespaceInQuotesMock(t),
}));

describe("copyTextToClipboardWithToast", () => {
  const originalClipboard = navigator.clipboard;

  beforeEach(() => {
    normalizeWhitespaceInQuotesMock.mockImplementation((t) => t);
  });

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  it("calls toast.success when copy succeeds", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    await copyTextToClipboardWithToast("text");

    expect(toast.success).toHaveBeenCalledWith("Code copied to clipboard.");
    expect(toast.error).not.toHaveBeenCalled();
  });

  it("calls toast.error when copy fails", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    document.execCommand = vi.fn().mockReturnValue(false);

    await copyTextToClipboardWithToast("text");

    expect(toast.error).toHaveBeenCalledWith("Failed to copy to clipboard.");
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("passes normalized text to copyToClipboard", async () => {
    normalizeWhitespaceInQuotesMock.mockImplementation((t) => `normalized:${t}`);
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    await copyTextToClipboardWithToast("  raw  text  ");

    expect(writeText).toHaveBeenCalledWith("normalized:  raw  text  ");
  });
});

describe("copyToClipboard", () => {
  const originalClipboard = navigator.clipboard;
  const originalExecCommand = document.execCommand;

  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
    document.execCommand = originalExecCommand;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.focus();
    }
  });

  it("returns true and calls writeText when Clipboard API is available and succeeds", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    const result = await copyToClipboard("hello world");

    expect(result).toBe(true);
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith("hello world");
  });

  it("returns false when Clipboard API is available but writeText rejects", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("clipboard denied"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    const execCommand = vi.fn().mockReturnValue(false);
    document.execCommand = execCommand;

    const result = await copyToClipboard("text");

    expect(result).toBe(false);
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("returns true when Clipboard API rejects and fallback execCommand succeeds", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    const result = await copyToClipboard("fallback text");

    expect(result).toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("uses fallback when navigator.clipboard is undefined", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    const result = await copyToClipboard("no clipboard");

    expect(result).toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("uses fallback when navigator.clipboard has no writeText", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: {},
      writable: true,
      configurable: true,
    });
    const execCommand = vi.fn().mockReturnValue(true);
    document.execCommand = execCommand;

    const result = await copyToClipboard("text");

    expect(result).toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  it("appends fallback textarea to document.body when focus is not in a dialog", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    document.execCommand = vi.fn().mockReturnValue(true);

    const appendChildSpy = vi.spyOn(document.body, "appendChild");

    await copyToClipboard("body container");

    expect(appendChildSpy).toHaveBeenCalled();
    const textarea = appendChildSpy.mock.calls[0][0] as HTMLTextAreaElement;
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea.value).toBe("body container");
    expect(textarea.getAttribute("aria-hidden")).toBe("true");
    expect(textarea.getAttribute("readonly")).toBe("");

    appendChildSpy.mockRestore();
  });

  it("appends fallback textarea to open dialog when focus is inside it", async () => {
    const dialog = document.createElement("dialog");
    dialog.setAttribute("open", "");
    const button = document.createElement("button");
    dialog.appendChild(button);
    document.body.appendChild(dialog);

    Object.defineProperty(document, "activeElement", {
      value: button,
      writable: true,
      configurable: true,
    });

    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });
    document.execCommand = vi.fn().mockReturnValue(true);

    const appendChildSpy = vi.spyOn(dialog, "appendChild");

    await copyToClipboard("dialog container");

    expect(appendChildSpy).toHaveBeenCalled();
    const textarea = appendChildSpy.mock.calls[0][0] as HTMLTextAreaElement;
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea.value).toBe("dialog container");

    appendChildSpy.mockRestore();
  });

  it("copies the exact text passed in", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    await copyToClipboard("  multi\nline\ttext  ");

    expect(writeText).toHaveBeenCalledWith("  multi\nline\ttext  ");
  });
});
