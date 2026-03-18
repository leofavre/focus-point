# Bottom bar keyboard navigation

> **Memo:** Always use Playwright dedicated models (Planner, Generator, Healer) when planning, adding, and reviewing e2e / integration tests.

## Application Overview

After the user uploads an image, the editor shows a bottom bar with five controls: Focal point, Overflow, Aspect ratio slider, Code, and Image. Tab key must move focus between them in visual order. When the aspect ratio slider is focused, Arrow Left and Arrow Right must move between common aspect ratios (from left end to right end and back).

Tab-key-triggered focus order (and Shift+Tab backward order) must also work correctly when the user's writing direction is RTL. Tests use `dir="rtl"` on the `body` element to simulate RTL.

## Test Scenarios

### 1. Bottom bar keyboard navigation

**Seed:** `e2e/seed.spec.ts`

#### 1.1. bottom bar is visible when editor is shown

**File:** `e2e/bottom-bar-keyboard.spec.ts`

**Steps:**
  1. Go to / and upload sample image via Image button
    - expect: Redirect to /edit
    - expect: Editor and controls visible
  2. Assert main and bottom bar controls are visible
    - expect: Layout grid (main) is visible
    - expect: FocalPointButton, AspectRatioSlider, Image button visible in bar

#### 1.2. Tab moves focus through bottom bar controls in visual order

**File:** `e2e/bottom-bar-keyboard.spec.ts`

**Steps:**
  1. Go to / and upload sample image
    - expect: Editor with bottom bar visible
  2. Focus Focal point button
    - expect: Focal point button is focused
  3. Press Tab four times
    - expect: Focus moves to Overflow, then Aspect ratio slider, then Code, then Image

#### 1.3. Shift+Tab moves focus backward through bottom bar controls

**File:** `e2e/bottom-bar-keyboard.spec.ts`

**Steps:**
  1. Go to / and upload sample image
    - expect: Editor with bottom bar visible
  2. Focus Image button
    - expect: Image button is focused
  3. Press Shift+Tab four times
    - expect: Focus moves to Code, then Aspect ratio slider, then Overflow, then Focal point

#### 1.4. Tab moves focus through bottom bar controls in visual order (RTL: dir="rtl" on body)

Same as 1.2, but with the document in RTL: set `dir="rtl"` on the `body` element before asserting. Tab-key-triggered focus order must still work correctly when the user's writing direction is RTL (focus moves through the same sequence of controls).

**File:** `e2e/bottom-bar-keyboard.spec.ts`

**Steps:**
  1. Go to / and upload sample image
    - expect: Editor with bottom bar visible
  2. Set `body` element attribute `dir="rtl"`
    - expect: Page in RTL
  3. Focus Focal point button
    - expect: Focal point button is focused
  4. Press Tab four times
    - expect: Focus moves to Overflow, then Aspect ratio slider, then Code, then Image

#### 1.5. Shift+Tab moves focus backward through bottom bar controls (RTL: dir="rtl" on body)

Same as 1.3, but with the document in RTL: set `dir="rtl"` on the `body` element before asserting. Shift+Tab focus order must still work correctly in RTL.

**File:** `e2e/bottom-bar-keyboard.spec.ts`

**Steps:**
  1. Go to / and upload sample image
    - expect: Editor with bottom bar visible
  2. Set `body` element attribute `dir="rtl"`
    - expect: Page in RTL
  3. Focus Image button
    - expect: Image button is focused
  4. Press Shift+Tab four times
    - expect: Focus moves to Code, then Aspect ratio slider, then Overflow, then Focal point

#### 1.6. when slider is focused, Arrow Left/Right navigate between aspect ratios

**File:** `e2e/bottom-bar-keyboard.spec.ts`

**Steps:**
  1. Go to / and upload sample image
    - expect: Editor with bottom bar visible
  2. Focus the aspect ratio slider
    - expect: Slider is focused
  3. Press ArrowLeft repeatedly until slider value stops changing (reach left end)
    - expect: Slider value equals input min (lowest aspect ratio, e.g. 9:16)
  4. Press ArrowRight once
    - expect: Slider value changes (next aspect ratio)
  5. Press ArrowLeft once
    - expect: Slider value changes (previous aspect ratio)

Assert using the range input’s `min` and `max` attributes only (no need to assert aspect ratio names).

#### 1.7. when slider is focused, Arrow Right to right end then Arrow Left navigates back

**File:** `e2e/bottom-bar-keyboard.spec.ts`

**Steps:**
  1. Go to / and upload sample image
    - expect: Editor with bottom bar visible
  2. Focus the aspect ratio slider
    - expect: Slider is focused
  3. Press ArrowRight repeatedly until slider value stops changing (reach right end)
    - expect: Slider value equals input max
  4. Press ArrowLeft once
    - expect: Slider value changes (previous aspect ratio)

Assert using the range input’s `min` and `max` attributes only.

#### 1.8. when slider is focused, Arrow Left/Right in RTL (dir="rtl" on body)

Same arrow-key navigation, but with `dir="rtl"` on `body`. In RTL the logic is reversed:
- All the way to the **left** (ArrowLeft to end) → **highest** aspect ratio (input value = max).
- All the way to the **right** (ArrowRight to end) → **lowest** aspect ratio (input value = min).

**File:** `e2e/bottom-bar-keyboard.spec.ts`

**Steps:**
  1. Go to / and upload sample image
    - expect: Editor with bottom bar visible
  2. Set `body` element attribute `dir="rtl"`
  3. Focus the aspect ratio slider
  4. Press ArrowLeft repeatedly until value stops changing
    - expect: Slider value equals input max
  5. Press ArrowRight repeatedly until value stops changing
    - expect: Slider value equals input min

#### 1.9. when slider is focused, Arrow Right then Arrow Left in RTL (dir="rtl" on body)

With RTL, ArrowRight to end reaches the visual “right” (lowest value); ArrowLeft once moves to previous (higher). Assert using input min/max as above.
