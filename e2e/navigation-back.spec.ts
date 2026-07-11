import { expect, test } from "@playwright/test";
import { test as testWithFixtures } from "./fixtures";
import { expectHomeVisible, seedEditorWithImage } from "./helpers";

test.describe("Navigation and back button", () => {
  test("with IndexedDB: upload redirects to /image/edit, back returns to / with home visible", async ({
    page,
  }) => {
    await seedEditorWithImage(page);

    await page.goBack();

    await expect(page).toHaveURL("/");
    await expectHomeVisible(page);
  });

  testWithFixtures(
    "without IndexedDB: upload redirects to /image/edit, back returns to / with home visible",
    async ({ pageWithoutIndexedDB: page }) => {
      await page.goto("about:blank");
      await page.goto("/");
      await seedEditorWithImage(page);

      await page.goBack();

      await expect(page).toHaveURL("/");
      await expectHomeVisible(page);
    },
  );
});
