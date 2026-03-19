import fs from "node:fs";
import { expect, test } from "@playwright/test";
import {
  expectEditorWithControlsVisible,
  SAMPLE_IMAGE_PATH,
  seedEditorWithImage,
  waitForEditorReady,
} from "./helpers";

test.describe("Code snippet dialog", () => {
  test.beforeEach(async ({ page }) => {
    await seedEditorWithImage(page);
    await waitForEditorReady(page);
  });

  test("dragging an image closes the open dialog and the image upload works", async ({ page }) => {
    await page.getByRole("button", { name: "Code" }).click();
    await expect(page.locator('[data-component="CodeSnippet"]')).toBeVisible();

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

    await expect(page).toHaveURL(/\/image\/edit$/);
    await expectEditorWithControlsVisible(page);
  });

  test("?code is added to the URL when the dialog opens", async ({ page }) => {
    await expect(page).toHaveURL(/\/image\/edit$/);

    await page.getByRole("button", { name: "Code" }).click();
    await expect(page.locator('[data-component="CodeSnippet"]')).toBeVisible();

    await expect(page).toHaveURL(/\/image\/edit\?code$/);
  });

  test("?code is removed from the URL when the dialog closes", async ({ page }) => {
    await page.getByRole("button", { name: "Code" }).click();
    await expect(page.locator('[data-component="CodeSnippet"]')).toBeVisible();
    await expect(page).toHaveURL(/\/image\/edit\?code$/);

    await page.keyboard.press("Escape");
    await expect(page.locator('[data-component="CodeSnippet"]')).not.toBeVisible();

    await expect(page).toHaveURL(/\/image\/edit$/);
  });

  test("pressing Escape closes the open dialog", async ({ page }) => {
    await page.getByRole("button", { name: "Code" }).click();
    await expect(page.locator('[data-component="CodeSnippet"]')).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(page.locator('[data-component="CodeSnippet"]')).not.toBeVisible();
    await expect(page.getByRole("button", { name: "Code" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("refreshing with ?code in the URL opens the dialog", async ({ page }) => {
    await page.goto("/image/edit?code");
    await waitForEditorReady(page);

    await expect(page.locator('[data-component="CodeSnippet"]')).toBeVisible();
    await expect(page).toHaveURL(/\/image\/edit\?code$/);
  });
});
