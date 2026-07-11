# Not-found and image-not-found page states

## Application Overview

Focal Point Editor shows different messages depending on the URL (with an empty database). The app behaves the same whether IndexedDB is available or not:

- **Page not found**: Invalid or unknown path (e.g. `/bogus`) — shows "Page not found".
- **Image not found**: URL is the single-image editor path (`/edit`) but the database has no image — shows "Start by choosing an image" or "Image not found".

All tests assume the database is **empty** at the start of each test. Each scenario is run **twice**: once with IndexedDB available, once with IndexedDB disabled. Expectations are identical in both runs.

## Test Scenarios

### 1. Invalid URL (/bogus)

**Seed:** `e2e/seed.spec.ts`

#### 1.1. /bogus shows page not found

**File:** `e2e/not-found.spec.ts`

**Steps (same with or without IndexedDB):**
  1. Reset database (clear IndexedDB so it is empty) — for IDB-off tests no DB is used
  2. Visit '/bogus'
  3. Expect: "Page not found" (or equivalent) visible

### 2. Editor URL with no image (/edit)

#### 2.1. /edit with empty DB shows image not found

**File:** `e2e/not-found.spec.ts`

**Steps (same with or without IndexedDB):**
  1. Reset database (clear IndexedDB so it is empty) — for IDB-off tests no DB is used
  2. Visit '/edit'
  3. Expect: "Image not found" or "Start by choosing an image" (or equivalent) visible — not "Page not found"
