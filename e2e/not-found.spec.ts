import { expect, test } from "@playwright/test";
import { test as testWithFixtures } from "./fixtures";

test.describe("Not-found and image-not-found", () => {
  test("with IndexedDB: /bogus shows page not found", async ({ page }) => {
    await page.goto("/bogus");
    await expect(page.getByText("Page not found")).toBeVisible();
  });

  testWithFixtures(
    "without IndexedDB: /bogus shows page not found",
    async ({ pageWithoutIndexedDB: page }) => {
      await page.goto("/bogus");
      await expect(page.getByText("Page not found")).toBeVisible();
    },
  );

  test("with IndexedDB: /image/edit with empty DB shows image not found", async ({ page }) => {
    await page.goto("/image/edit");
    await expect(page.getByText(/Start by choosing an image|Image not found/)).toBeVisible();
    await expect(page.getByText("Page not found")).not.toBeVisible();
  });

  testWithFixtures(
    "without IndexedDB: /image/edit with empty DB shows image not found",
    async ({ pageWithoutIndexedDB: page }) => {
      await page.goto("/image/edit");
      await expect(page.getByText(/Start by choosing an image|Image not found/)).toBeVisible();
      await expect(page.getByText("Page not found")).not.toBeVisible();
    },
  );
});
