import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { test as testWithFixtures } from "./fixtures";
import {
  expectEditorWithControlsVisible,
  expectHomeVisible,
  SAMPLE_IMAGE_PATH,
  seedEditorWithImage,
  waitForEditorReady,
} from "./helpers";

/**
 * Simulate a file drop. react-dropzone's onDrop runs only when the drop event targets
 * the root (the overlay). So we: 1) dispatch dragenter on document to show the overlay,
 * 2) wait for the overlay, 3) dispatch dragover and drop on the overlay with the file.
 */
async function dropImageFileOnPage(page: import("@playwright/test").Page) {
  const buffer = fs.readFileSync(SAMPLE_IMAGE_PATH);
  const base64 = buffer.toString("base64");

  await page.evaluate(
    async (payload: { b64: string; name: string; type: string }) => {
      const res = await fetch(`data:${payload.type};base64,${payload.b64}`);
      const blob = await res.blob();
      const file = new File([blob], payload.name, { type: payload.type });
      const dt = new DataTransfer();
      dt.items.add(file);
      const opts = { bubbles: true, cancelable: true, dataTransfer: dt };
      document.dispatchEvent(new DragEvent("dragenter", opts));
    },
    { b64: base64, name: "sample.png", type: "image/png" },
  );

  await page.locator('[data-component="FullScreenDropZone"]').waitFor({ state: "visible" });

  await page.evaluate(
    async (payload: { b64: string; name: string; type: string }) => {
      const overlay = document.querySelector('[data-component="FullScreenDropZone"]');
      if (!overlay) return;
      const res = await fetch(`data:${payload.type};base64,${payload.b64}`);
      const blob = await res.blob();
      const file = new File([blob], payload.name, { type: payload.type });
      const dt = new DataTransfer();
      dt.items.add(file);
      const opts = { bubbles: true, cancelable: true, dataTransfer: dt };
      overlay.dispatchEvent(new DragEvent("dragover", opts));
      overlay.dispatchEvent(new DragEvent("drop", opts));
    },
    { b64: base64, name: "sample.png", type: "image/png" },
  );
}

/**
 * Simulate drag over the page then "drop outside": dragenter, dragover, wait for overlay,
 * then dragleave and dragend (no drop). Waiting for overlay before dragleave ensures
 * react-dropzone has processed dragenter; dragleave/dragend then clear isDragGlobal and the overlay hides.
 */
async function dragImageThenDropOutside(page: import("@playwright/test").Page) {
  const buffer = fs.readFileSync(SAMPLE_IMAGE_PATH);
  const base64 = buffer.toString("base64");
  const evalOpts = { b64: base64, name: "sample.png", type: "image/png" };

  await page.evaluate(async (payload: { b64: string; name: string; type: string }) => {
    const res = await fetch(`data:${payload.type};base64,${payload.b64}`);
    const blob = await res.blob();
    const file = new File([blob], payload.name, { type: payload.type });
    const dt = new DataTransfer();
    dt.items.add(file);
    const opts = { bubbles: true, cancelable: true, dataTransfer: dt };
    document.dispatchEvent(new DragEvent("dragenter", opts));
    document.dispatchEvent(new DragEvent("dragover", opts));
  }, evalOpts);

  await page.locator('[data-component="FullScreenDropZone"]').waitFor({ state: "visible" });

  await page.evaluate(async (payload: { b64: string; name: string; type: string }) => {
    const res = await fetch(`data:${payload.type};base64,${payload.b64}`);
    const blob = await res.blob();
    const file = new File([blob], payload.name, { type: payload.type });
    const dt = new DataTransfer();
    dt.items.add(file);
    const opts = { bubbles: true, cancelable: true, dataTransfer: dt };
    document.dispatchEvent(new DragEvent("dragleave", opts));
    document.dispatchEvent(new DragEvent("dragend", opts));
  }, evalOpts);
}

/**
 * Simulate file drop when code snippet dialog is open. Dispatches dragenter to close the
 * dialog and show the overlay, asserts dialog closed and overlay visible, then completes the drop.
 * Plan: e2e/drag-drop-code-snippet.plan.md
 */
async function dropImageFileWithCodeSnippetOpen(page: import("@playwright/test").Page) {
  const buffer = fs.readFileSync(SAMPLE_IMAGE_PATH);
  const base64 = buffer.toString("base64");
  const evalOpts = { b64: base64, name: "sample.png", type: "image/png" };

  await page.evaluate(async (payload: { b64: string; name: string; type: string }) => {
    const res = await fetch(`data:${payload.type};base64,${payload.b64}`);
    const blob = await res.blob();
    const file = new File([blob], payload.name, { type: payload.type });
    const dt = new DataTransfer();
    dt.items.add(file);
    const opts = { bubbles: true, cancelable: true, dataTransfer: dt };
    document.dispatchEvent(new DragEvent("dragenter", opts));
    document.dispatchEvent(new DragEvent("dragover", opts));
  }, evalOpts);

  await expect(page.locator('[data-component="CodeSnippet"]')).not.toBeVisible();
  await page.locator('[data-component="FullScreenDropZone"]').waitFor({ state: "visible" });

  await page.evaluate(async (payload: { b64: string; name: string; type: string }) => {
    const overlay = document.querySelector('[data-component="FullScreenDropZone"]');
    if (!overlay) return;
    const res = await fetch(`data:${payload.type};base64,${payload.b64}`);
    const blob = await res.blob();
    const file = new File([blob], payload.name, { type: payload.type });
    const dt = new DataTransfer();
    dt.items.add(file);
    const opts = { bubbles: true, cancelable: true, dataTransfer: dt };
    overlay.dispatchEvent(new DragEvent("dragover", opts));
    overlay.dispatchEvent(new DragEvent("drop", opts));
  }, evalOpts);
}

test.describe("Drag-drop", () => {
  test("with IndexedDB: drop file on app then image uploaded and redirect to /image/edit", async ({
    page,
  }) => {
    await page.goto("/");
    await expectHomeVisible(page);

    await dropImageFileOnPage(page);

    await expect(page).toHaveURL(/\/image\/edit$/);
    await expectEditorWithControlsVisible(page);
  });

  testWithFixtures(
    "without IndexedDB: drop file on app then image uploaded and redirect to /image/edit",
    async ({ pageWithoutIndexedDB: page }) => {
      await page.goto("/");
      await expectHomeVisible(page);

      await dropImageFileOnPage(page);

      await expect(page).toHaveURL(/\/image\/edit$/);
      await expectEditorWithControlsVisible(page);
    },
  );

  test("with IndexedDB: file dragged but dropped outside browser then app stays responsive and no redirect", async ({
    page,
  }) => {
    await page.goto("/");
    await expectHomeVisible(page);

    await dragImageThenDropOutside(page);

    await expect(page).toHaveURL("/");
    const uploadButton = page.getByRole("button", { name: "Choose image", exact: true });
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).toBeEnabled();
    await expect(page.locator('[data-component="FullScreenDropZone"]:popover-open')).toHaveCount(0);
  });

  testWithFixtures(
    "without IndexedDB: file dragged but dropped outside browser then app stays responsive and no redirect",
    async ({ pageWithoutIndexedDB: page }) => {
      await page.goto("/");
      await expectHomeVisible(page);

      await dragImageThenDropOutside(page);

      await expect(page).toHaveURL("/");
      const uploadButton = page.getByRole("button", { name: "Choose image", exact: true });
      await expect(uploadButton).toBeVisible();
      await expect(uploadButton).toBeEnabled();
      await expect(page.locator('[data-component="FullScreenDropZone"]:popover-open')).toHaveCount(
        0,
      );
    },
  );

  test("drag during code snippet open: dialog closes first, then drop zone shows, drop works", async ({
    page,
  }) => {
    await seedEditorWithImage(page);
    await waitForEditorReady(page);

    await page.getByRole("button", { name: "Code" }).click();
    await expect(page.locator('[data-component="CodeSnippet"]')).toBeVisible();

    await dropImageFileWithCodeSnippetOpen(page);

    await expect(page).toHaveURL(/\/image\/edit$/);
    await expectEditorWithControlsVisible(page);
  });

  test("drop multiple images in single-image mode shows 'Please select only one image.' toast and no redirect", async ({
    page,
  }) => {
    await page.goto("/");
    await expectHomeVisible(page);

    const buffer = fs.readFileSync(SAMPLE_IMAGE_PATH);
    const base64 = buffer.toString("base64");
    const evalOpts = { b64: base64, name: "sample.png", type: "image/png" };

    await page.evaluate(async (payload: { b64: string; name: string; type: string }) => {
      const res = await fetch(`data:${payload.type};base64,${payload.b64}`);
      const blob = await res.blob();
      const file1 = new File([blob], payload.name, { type: payload.type });
      const file2 = new File([blob], "sample2.png", { type: payload.type });
      const dt = new DataTransfer();
      dt.items.add(file1);
      dt.items.add(file2);
      const opts = { bubbles: true, cancelable: true, dataTransfer: dt };
      document.dispatchEvent(new DragEvent("dragenter", opts));
    }, evalOpts);

    await page.locator('[data-component="FullScreenDropZone"]').waitFor({ state: "visible" });

    await page.evaluate(async (payload: { b64: string; name: string; type: string }) => {
      const overlay = document.querySelector('[data-component="FullScreenDropZone"]');
      if (!overlay) return;
      const res = await fetch(`data:${payload.type};base64,${payload.b64}`);
      const blob = await res.blob();
      const file1 = new File([blob], payload.name, { type: payload.type });
      const file2 = new File([blob], "sample2.png", { type: payload.type });
      const dt = new DataTransfer();
      dt.items.add(file1);
      dt.items.add(file2);
      const opts = { bubbles: true, cancelable: true, dataTransfer: dt };
      overlay.dispatchEvent(new DragEvent("dragover", opts));
      overlay.dispatchEvent(new DragEvent("drop", opts));
    }, evalOpts);

    await expect(page.getByText("Please select only one image.")).toBeVisible();
    await expect(page).toHaveURL("/");
  });
});
