import { expect, test } from "@playwright/test";
import { test as testWithFixtures } from "./fixtures";
import { expectHomeVisible, seedEditorWithImage } from "./helpers";

test.describe("Home upload", () => {
  test("with IndexedDB: image upload redirects to /image/edit and shows editor", async ({
    page,
  }) => {
    await seedEditorWithImage(page);
  });

  testWithFixtures(
    "without IndexedDB: image upload redirects to /image/edit and shows editor",
    async ({ pageWithoutIndexedDB: page }) => {
      await seedEditorWithImage(page);
    },
  );

  test("with IndexedDB: user starts upload via button then cancels file dialog – UI responsive and button not pressed", async ({
    page,
  }) => {
    await page.goto("/");
    await expectHomeVisible(page);
    const uploadButton = page.getByRole("button", { name: "Choose image", exact: true });

    const fileChooserPromise = page.waitForEvent("filechooser");
    await uploadButton.click();
    await fileChooserPromise;
    await page.evaluate(() => window.dispatchEvent(new Event("focus")));

    await expect(page).toHaveURL("/");
    await expect(uploadButton).toBeVisible();
    await expect(uploadButton).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator('[data-component="FocalPointEditor"]')).not.toBeVisible();
  });

  testWithFixtures(
    "without IndexedDB: user starts upload via button then cancels file dialog – UI responsive and button not pressed",
    async ({ pageWithoutIndexedDB: page }) => {
      await page.goto("/");
      await expectHomeVisible(page);
      const uploadButton = page.getByRole("button", { name: "Choose image", exact: true });

      const fileChooserPromise = page.waitForEvent("filechooser");
      await uploadButton.click();
      await fileChooserPromise;
      await page.evaluate(() => window.dispatchEvent(new Event("focus")));

      await expect(page).toHaveURL("/");
      await expect(uploadButton).toBeVisible();
      await expect(uploadButton).toHaveAttribute("aria-pressed", "false");
      await expect(page.locator('[data-component="FocalPointEditor"]')).not.toBeVisible();
    },
  );
});
