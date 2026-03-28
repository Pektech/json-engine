---
gap_id: gap-10
status: completed
priority: major
phase: 04-polish-release
source: User report - Ctrl+O opens file dialog but doesn't load into editor
created: 2026-03-28
completed: 2026-03-28
---

# Gap 10: Fix Ctrl+O File Open Loading

## Problem Statement

When user presses Ctrl+O to open a file:
1. File picker dialog opens correctly ✅
2. User selects a JSON file ✅
3. File opens as a **separate webpage** instead of loading into the editor ❌

The file manager was reading the file correctly, but the content was never being passed to the app store to populate the editor.

## Root Cause Analysis

In `src/hooks/useKeyboardShortcuts.ts`, the `handleOpenFile()` function was calling `openFile()` but **not doing anything with the result**:

```typescript
// BEFORE (broken)
const handleOpenFile = async () => {
  try {
    await openFile();  // ❌ Result ignored, content never loaded
  } catch (error) {
    console.error('Failed to open file:', error);
  }
};
```

The `openFile()` method returns `OpenFileResult | FileManagerError` with:
- `handle`: File handle with metadata
- `content`: The actual file content (string)
- `size`: File size
- `lastModified`: Last modified timestamp

But this result was never passed to `loadFile()` in the app store.

## Solution

### 1. Fixed `useKeyboardShortcuts.ts`

Updated `handleOpenFile()` to:
1. Capture the result from `openFile()`
2. Check if it's an error (has 'code' property)
3. If successful, call `loadFile()` from app store with the file name and content

```typescript
// AFTER (fixed)
const handleOpenFile = async () => {
  try {
    const result = await openFile();
    
    // Check if result is an error (has 'code' property)
    if ('code' in result) {
      if (result.code !== 'PERMISSION_DENIED') {
        console.error('Failed to open file:', result.message);
      }
      return;
    }
    
    // Successfully opened - load into editor
    const { loadFile } = useAppStore.getState();
    await loadFile(result.handle.name, result.content);
  } catch (error) {
    console.error('Failed to open file:', error);
  }
};
```

### 2. Added Open Button to EditorToolbar

Added visual "Open" button to the editor toolbar for users who prefer clicking over keyboard shortcuts:

**`src/components/editor/EditorToolbar.tsx`:**
- Added `onOpen?: () => void` prop to interface
- Added Open button with folder icon as first button in toolbar
- Button calls `onOpen()` when clicked

**`src/components/workspace/EditorWorkspace.tsx`:**
- Added `handleOpenFile()` callback that dispatches Ctrl+O keyboard event
- Wired `onOpen={handleOpenFile}` to EditorToolbar

This provides both keyboard (Ctrl+O) and mouse (click Open button) access to file opening.

## Files Modified

- `src/hooks/useKeyboardShortcuts.ts` — Fixed `handleOpenFile()` to load file content
- `src/components/editor/EditorToolbar.tsx` — Added Open button
- `src/components/workspace/EditorWorkspace.tsx` — Added `handleOpenFile()` handler

## Verification Steps

1. **Test Ctrl+O keyboard shortcut:**
   - Press Ctrl+O
   - File picker dialog opens
   - Select a JSON file
   - File content loads into editor
   - Canvas renders node graph

2. **Test Open button:**
   - Click "Open" button in editor toolbar
   - File picker dialog opens
   - Select a JSON file
   - File content loads into editor

3. **Verify error handling:**
   - Cancel file picker
   - No error shown (silent cancel is correct behavior)
   - Try opening invalid file type
   - Appropriate error message shown

## Decisions Made

1. **Dispatch keyboard event for button click** — Instead of duplicating logic, the Open button triggers the same Ctrl+O event, ensuring consistent behavior
2. **Silent cancel on file picker abort** — Don't show error when user cancels file selection (expected behavior)
3. **Check for 'code' property** — TypeScript type guard to distinguish between success result and error result

## Deviations from Plan

None — straightforward bug fix.

## Related Gaps

- gap-01: Keyboard shortcuts foundation (this builds on that work)
- gap-07: Ctrl+S .json extension fix (complementary file operation fix)

## Next Phase Readiness

File open now works correctly via both:
- Keyboard shortcut (Ctrl+O)
- Toolbar button (Open)

Ready for UAT verification.

---

*Gap: gap-10*
*Completed: 2026-03-28*
