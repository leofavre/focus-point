# Code Snippet Dialog E2E Tests

## Application Overview

Focal Point Editor is a single-page image editor that lets users upload an image, set a focal point, adjust aspect ratio, and generate CSS code snippets. The code snippet dialog opens via a 'Code' button or the 'f' keyboard shortcut, syncs its open state with the ?code URL parameter via history.replaceState, and can be closed with Escape. Dragging an image file onto the window while the dialog is open should first close the dialog, then show the drop zone and complete the upload. The app uses native <dialog> with showModal(), data-component selectors, and the editor page lives at /image/edit.

## Test Scenarios

### 1. Code snippet dialog

**Seed:** `e2e/seed.spec.ts`

#### 1.1. dragging an image closes the open dialog and the image upload works

**File:** `e2e/code-snippet-dialog.spec.ts`

**Steps:**
  1. Navigate to / and upload sample.png via the 'Choose image' button file chooser to seed the editor at /image/edit
    - expect: The editor with controls is visible at /image/edit
  2. Click the 'Code' button to open the code snippet dialog
    - expect: The element [data-component="CodeSnippet"] is visible
  3. Simulate a file drag by dispatching dragenter and dragover DragEvents with a File on document
    - expect: The code snippet dialog ([data-component="CodeSnippet"]) is no longer visible
    - expect: The drop zone overlay ([data-component="FullScreenDropZone"]) is visible
  4. Complete the file drop by dispatching dragover and drop DragEvents on the FullScreenDropZone overlay element
    - expect: The URL matches /image/edit
    - expect: The editor with all controls (FocalPointEditor, AspectRatioSlider, FocalPointButton, ImageOverflowButton, CodeSnippetButton, Image button) is visible

#### 1.2. ?code is added to the URL when the dialog opens

**File:** `e2e/code-snippet-dialog.spec.ts`

**Steps:**
  1. Navigate to / and upload sample.png via the 'Choose image' button file chooser to seed the editor at /image/edit
    - expect: The URL matches /image/edit (no ?code parameter)
  2. Click the 'Code' button to open the code snippet dialog
    - expect: The element [data-component="CodeSnippet"] is visible
    - expect: The URL now ends with /image/edit?code

#### 1.3. ?code is removed from the URL when the dialog closes

**File:** `e2e/code-snippet-dialog.spec.ts`

**Steps:**
  1. Navigate to / and upload sample.png via the 'Choose image' button file chooser to seed the editor at /image/edit
    - expect: The editor with controls is visible
  2. Click the 'Code' button to open the code snippet dialog
    - expect: The element [data-component="CodeSnippet"] is visible
    - expect: The URL ends with /image/edit?code
  3. Press the Escape key to close the dialog
    - expect: The element [data-component="CodeSnippet"] is no longer visible
    - expect: The URL matches /image/edit without ?code

#### 1.4. pressing Escape closes the open dialog

**File:** `e2e/code-snippet-dialog.spec.ts`

**Steps:**
  1. Navigate to / and upload sample.png via the 'Choose image' button file chooser to seed the editor at /image/edit
    - expect: The editor with controls is visible
  2. Click the 'Code' button to open the code snippet dialog
    - expect: The element [data-component="CodeSnippet"] is visible
  3. Press the Escape key
    - expect: The element [data-component="CodeSnippet"] is no longer visible
    - expect: The 'Code' button has aria-pressed="false"

#### 1.5. refreshing with ?code in the URL opens the dialog

**File:** `e2e/code-snippet-dialog.spec.ts`

**Steps:**
  1. Navigate to / and upload sample.png via the 'Choose image' button file chooser to seed the editor at /image/edit (this stores the image in IndexedDB)
    - expect: The editor with controls is visible
  2. Navigate directly to /image/edit?code to simulate a page refresh with ?code present
    - expect: The editor image loads successfully
    - expect: The code snippet dialog ([data-component="CodeSnippet"]) is visible
    - expect: The URL contains /image/edit?code
