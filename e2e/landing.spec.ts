import { expect, test } from "@playwright/test";
import { test as testWithFixtures } from "./fixtures";
import { expectHomeVisible } from "./helpers";

test.describe("Home page", () => {
  test("with IndexedDB: shows upload button and disabled controls when visiting /", async ({
    page,
  }) => {
    await page.goto("/");
    await expectHomeVisible(page);
    await expect(page.locator('[data-component="AspectRatioSlider"]')).toBeVisible();
    await expect(page.locator('[data-component="FocalPointButton"]')).toBeDisabled();
  });

  testWithFixtures(
    "without IndexedDB: shows upload button and disabled controls when visiting /",
    async ({ pageWithoutIndexedDB: page }) => {
      await page.goto("/");
      await expectHomeVisible(page);
      await expect(page.locator('[data-component="AspectRatioSlider"]')).toBeVisible();
      await expect(page.locator('[data-component="FocalPointButton"]')).toBeDisabled();
    },
  );
});
