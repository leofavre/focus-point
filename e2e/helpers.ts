import path from "node:path";
import type { BrowserContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";

const INDEXED_DB_DISABLE_SCRIPT = () => {
  try {
    Object.defineProperty(window, "indexedDB", {
      get: () => undefined,
      configurable: true,
      enumerable: true,
    });
  } catch {
    // ignore if not configurable
  }
};

export const SAMPLE_IMAGE_PATH = path.join(process.cwd(), "e2e", "fixtures", "sample.png");

/**
 * Disables IndexedDB for the given page by defining `window.indexedDB` as undefined.
 * Must be called before any navigation (e.g. before `page.goto()`).
 */
export function disableIndexedDB(page: Page): Promise<void> {
  return page.addInitScript(INDEXED_DB_DISABLE_SCRIPT);
}

/**
 * Disables IndexedDB for the given context (applies to all pages created from it).
 * Use when creating a context for "IndexedDB unavailable" scenarios.
 */
export function disableIndexedDBOnContext(context: BrowserContext): Promise<void> {
  return context.addInitScript(INDEXED_DB_DISABLE_SCRIPT);
}

const CLIPBOARD_WRITE_DISABLE_SCRIPT = () => {
  try {
    const original = navigator.clipboard;
    if (!original) return;
    Object.defineProperty(navigator, "clipboard", {
      value: {
        readText: () => original.readText(),
        writeText: () => Promise.reject(new Error("clipboard.writeText disabled for test")),
        read: original.read?.bind(original),
        write: original.write?.bind(original),
      },
      configurable: true,
      enumerable: true,
      writable: true,
    });
  } catch {
    // ignore if not configurable
  }
};

/**
 * Makes navigator.clipboard.writeText reject so the app uses the copy fallback (execCommand).
 * readText is left working so the test can still verify clipboard content.
 * Must be applied before any navigation (e.g. via context.addInitScript when creating the context).
 */
export function disableClipboardWriteOnContext(context: BrowserContext): Promise<void> {
  return context.addInitScript(CLIPBOARD_WRITE_DISABLE_SCRIPT);
}

/**
 * Asserts that the editor view and all controls are visible (FocalPointEditor,
 * AspectRatioSlider, Focal point / Overflow / Code toggles, Image button).
 */
export async function expectEditorWithControlsVisible(page: Page) {
  const focalPointEditor = page.locator('[data-component="FocalPointEditor"]');
  const aspectRatioSlider = page.locator('[data-component="AspectRatioSlider"]');
  const focalPointButton = page.locator('[data-component="FocalPointButton"]');
  const imageOverflowButton = page.locator('[data-component="ImageOverflowButton"]');
  const codeSnippetButton = page.locator('[data-component="CodeSnippetButton"]');
  const uploadButton = page.getByRole("button", { name: "Image", exact: true });

  await expect(aspectRatioSlider).toBeEnabled();

  return Promise.all([
    expect(focalPointEditor).toBeVisible(),
    expect(aspectRatioSlider).toBeVisible(),
    expect(focalPointButton).toBeVisible(),
    expect(imageOverflowButton).toBeVisible(),
    expect(codeSnippetButton).toBeVisible(),
    expect(uploadButton).toBeVisible(),
  ]);
}

/**
 * Asserts that the home page is visible: the big "Choose image" button is shown
 * and no image editor is rendered.
 */
export async function expectHomeVisible(page: Page) {
  const chooseImageButton = page.getByRole("button", { name: "Choose image", exact: true });
  await expect(chooseImageButton).toBeVisible();
  await expect(page.locator('[data-component="FocalPointEditor"]')).not.toBeVisible();
}

/**
 * Options for dragging the image inside the focal point editor.
 * Values are ratios of the editor size (0–1). Default: from center (0.5, 0.5) to top-left quarter (0.25, 0.25).
 */
export type DragImageInEditorOptions = {
  from?: { x: number; y: number };
  to?: { x: number; y: number };
  steps?: number;
};

/**
 * Drags the image inside the focal point editor to move the focal point (object-position).
 * Use after the editor is visible on /image/edit. Simulates pointer move → down → move → up.
 */
export async function dragImageInFocalPointEditor(
  page: Page,
  options: DragImageInEditorOptions = {},
): Promise<void> {
  const { from = { x: 0.5, y: 0.5 }, to = { x: 0.25, y: 0.25 }, steps = 5 } = options;
  const focalPointEditor = page.locator('[data-component="FocalPointEditor"]');
  const editorBox = await focalPointEditor.boundingBox();
  if (editorBox == null) return;
  const fromX = editorBox.x + editorBox.width * from.x;
  const fromY = editorBox.y + editorBox.height * from.y;
  const toX = editorBox.x + editorBox.width * to.x;
  const toY = editorBox.y + editorBox.height * to.y;
  await page.mouse.move(fromX, fromY);
  await page.mouse.down();
  await page.mouse.move(toX, toY, { steps });
  await page.mouse.up();
}

/**
 * Returns the object-position value from the visible code snippet (e.g. "50% 50%").
 * Code snippet panel must already be open.
 */
export async function getCodeSnippetObjectPosition(page: Page): Promise<string | null> {
  const codeBlock = page.locator('[data-component="CodeSnippet"] pre').first();
  await expect(codeBlock).toBeVisible();
  const text = await codeBlock.textContent();
  const match = text?.match(/object-position:\s*([^;]+)/);
  return match?.[1]?.trim() ?? null;
}

/**
 * Closes the code snippet dialog so that the editor and bottom bar are clickable again.
 * The dialog is modal, so the Code button cannot be clicked while it is open. Use Escape
 * (standard for native <dialog>) to close.
 */
export async function closeCodeSnippetDialog(page: Page): Promise<void> {
  await page.keyboard.press("Escape");
  await expect(page.locator('[data-component="CodeSnippet"]')).not.toBeVisible();
}

/**
 * Drags the focal point (cross) inside the editor to a new position.
 * Focal point must be visible. Uses the focal point element's center as drag start.
 */
export async function dragFocalPointInEditor(
  page: Page,
  options: { to: { x: number; y: number }; steps?: number } = { to: { x: 0.25, y: 0.25 } },
): Promise<void> {
  const { to, steps = 5 } = options;
  const focalPoint = page.locator('[data-component="FocalPoint"]');
  await expect(focalPoint).toBeVisible();
  const focalBox = await focalPoint.boundingBox();
  const editor = page.locator('[data-component="FocalPointEditor"]');
  const editorBox = await editor.boundingBox();
  if (focalBox == null || editorBox == null) return;
  const fromX = focalBox.x + focalBox.width / 2;
  const fromY = focalBox.y + focalBox.height / 2;
  const toX = editorBox.x + editorBox.width * to.x;
  const toY = editorBox.y + editorBox.height * to.y;
  await page.mouse.move(fromX, fromY);
  await page.mouse.down();
  await page.mouse.move(toX, toY, { steps });
  await page.mouse.up();
}

/**
 * Seeds the editor: lands on /, uploads sample image, waits for /image/edit and editor visible.
 */
export async function seedEditorWithImage(page: Page): Promise<void> {
  await page.goto("/");
  await expectHomeVisible(page);

  const [fileChooser] = await Promise.all([
    page.waitForEvent("filechooser"),
    page.getByRole("button", { name: "Choose image", exact: true }).click(),
  ]);

  await fileChooser.setFiles(SAMPLE_IMAGE_PATH);
  await page.locator('[data-component="FocalPointEditor"]').click();
  await expectEditorWithControlsVisible(page);
}

/**
 * Waits for the editor and image to be ready (image loaded, layout settled).
 * Call after seedEditorWithImage when the test will change aspect ratio or drag the image.
 */
export async function waitForEditorReady(page: Page): Promise<void> {
  const editor = page.locator('[data-component="FocalPointEditor"]');
  await expect(editor).toBeVisible();
  const img = editor.locator("img");
  await expect(img).toBeVisible();
  await img.evaluate((el: HTMLImageElement) => {
    return el.complete && el.naturalWidth > 0
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
        el.addEventListener("load", () => resolve(), { once: true });
      });
  });
}

/**
 * Changes the aspect ratio by moving the slider with the keyboard.
 * Positive steps = ArrowRight, negative = ArrowLeft. Use after waitForEditorReady
 * so the image has loaded and the slider has a stable value (e.g. "original").
 */
export async function changeAspectRatioSliderSteps(page: Page, steps: number): Promise<void> {
  const slider = page.getByRole("slider");
  await slider.focus();
  await expect(slider).toBeFocused();
  const key = steps >= 0 ? "ArrowRight" : "ArrowLeft";
  const count = Math.abs(steps);
  for (let i = 0; i < count; i++) {
    await page.keyboard.press(key, { delay: 10 });
  }
}
