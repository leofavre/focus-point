import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";
import { seedEditorWithImage } from "./helpers";

async function runTabOrderSteps(page: Page) {
  const focalPoint = page.getByRole("button", { name: "Focal point" });
  const overflow = page.getByRole("button", { name: "Overflow" });
  const aspectRatioSlider = page.getByRole("slider");
  const code = page.getByRole("button", { name: "Code" });
  const upload = page.getByRole("button", { name: "Image", exact: true });

  await focalPoint.focus();
  await expect(focalPoint).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(overflow).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(aspectRatioSlider).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(code).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(upload).toBeFocused();
}

async function runShiftTabOrderSteps(page: Page) {
  const focalPoint = page.getByRole("button", { name: "Focal point" });
  const overflow = page.getByRole("button", { name: "Overflow" });
  const aspectRatioSlider = page.getByRole("slider");
  const code = page.getByRole("button", { name: "Code" });
  const upload = page.getByRole("button", { name: "Image", exact: true });

  await upload.focus();
  await expect(upload).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(code).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(aspectRatioSlider).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(overflow).toBeFocused();

  await page.keyboard.press("Shift+Tab");
  await expect(focalPoint).toBeFocused();
}

async function runArrowLeftRightSteps(page: Page, rtl: boolean) {
  const aspectRatioSlider = page.getByRole("slider");
  await aspectRatioSlider.focus();
  await expect(aspectRatioSlider).toBeFocused();

  const sliderMin = await aspectRatioSlider.getAttribute("min");
  const sliderMax = await aspectRatioSlider.getAttribute("max");
  const getSliderValue = () => aspectRatioSlider.inputValue();

  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("ArrowLeft", { delay: 10 });
  }

  const valueAfterGoingLeft = await getSliderValue();
  expect(valueAfterGoingLeft).toBe(rtl ? sliderMax : sliderMin);

  await page.keyboard.press("ArrowRight", { delay: 10 });
  const valueAfterRight = await getSliderValue();
  expect(valueAfterRight).not.toBe(valueAfterGoingLeft);
}

async function runArrowRightThenLeftSteps(page: Page, rtl: boolean) {
  const aspectRatioSlider = page.getByRole("slider");
  await aspectRatioSlider.focus();
  await expect(aspectRatioSlider).toBeFocused();

  const sliderMin = await aspectRatioSlider.getAttribute("min");
  const sliderMax = await aspectRatioSlider.getAttribute("max");
  const getSliderValue = () => aspectRatioSlider.inputValue();

  for (let i = 0; i < 20; i++) {
    await page.keyboard.press("ArrowRight", { delay: 10 });
  }

  const valueAfterGoingRight = await getSliderValue();
  expect(valueAfterGoingRight).toBe(rtl ? sliderMin : sliderMax);

  await page.keyboard.press("ArrowLeft", { delay: 10 });
  const valueAfterLeft = await getSliderValue();
  expect(valueAfterLeft).not.toBe(valueAfterGoingRight);
}

/**
 * E2E tests for bottom bar keyboard navigation.
 * Plan: specs/bottom-bar-keyboard.plan.md
 *
 * When the bottom bar is visible (after uploading an image), Tab key must move
 * focus between the controls in visual order: Focal point → Overflow → Aspect
 * ratio slider → Code → Image. When the slider is focused, Arrow Left/Right
 * move between aspect ratios.
 *
 * LTR and RTL tests share the same steps; RTL tests use the pageRTL fixture
 * (document body has dir="rtl" on every load).
 */
test.describe("Bottom bar keyboard navigation", () => {
  test.beforeEach(async ({ page }) => {
    await seedEditorWithImage(page);
  });

  test("bottom bar is visible when editor is shown", async ({ page }) => {
    const grid = page.locator("main");
    await expect(grid).toBeVisible();
    await expect(grid.locator('[data-component="FocalPointButton"]')).toBeVisible();
    await expect(grid.locator('[data-component="AspectRatioSlider"]')).toBeVisible();
    await expect(grid.getByRole("button", { name: "Image", exact: true })).toBeVisible();
  });

  test("Tab moves focus through bottom bar controls in visual order", async ({ page }) => {
    await runTabOrderSteps(page);
  });

  test("Tab moves focus through bottom bar controls in visual order (RTL)", async ({ pageRTL }) => {
    await seedEditorWithImage(pageRTL);
    await runTabOrderSteps(pageRTL);
  });

  test("Shift+Tab moves focus backward through bottom bar controls", async ({ page }) => {
    await runShiftTabOrderSteps(page);
  });

  test("Shift+Tab moves focus backward through bottom bar controls (RTL)", async ({ pageRTL }) => {
    await seedEditorWithImage(pageRTL);
    await runShiftTabOrderSteps(pageRTL);
  });

  test("when slider is focused, Arrow Left/Right navigate between aspect ratios", async ({
    page,
  }) => {
    await runArrowLeftRightSteps(page, false);
  });

  test("when slider is focused, Arrow Left/Right navigate between aspect ratios (RTL)", async ({
    pageRTL,
  }) => {
    await seedEditorWithImage(pageRTL);
    await runArrowLeftRightSteps(pageRTL, true);
  });

  test("when slider is focused, Arrow Right to right end then Arrow Left navigates back", async ({
    page,
  }) => {
    await runArrowRightThenLeftSteps(page, false);
  });

  test("when slider is focused, Arrow Right to right end then Arrow Left navigates back (RTL)", async ({
    pageRTL,
  }) => {
    await seedEditorWithImage(pageRTL);
    await runArrowRightThenLeftSteps(pageRTL, true);
  });
});
