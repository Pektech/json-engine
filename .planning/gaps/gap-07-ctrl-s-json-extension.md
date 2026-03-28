---
gap_id: gap-07
status: completed
priority: major
phase: 04-polish-release
source: 04-UAT.md File Save Issue
created: 2026-03-23
---

# Gap 07: Fix Ctrl+S to Save Files with .json Extension

## Problem Statement

Files saved via Ctrl+S do not have `.json` extension, causing browsers and operating systems to misidentify the file as HTML instead of JSON. This breaks the expected file handling workflow and confuses users.

## Root Cause Analysis

The `saveFileWithFallback` method in `file-manager.ts` uses the filename as-is without ensuring it has a `.json` extension. When the File System Access API is not available, the fallback method creates a download link with the original filename, which may lack the `.json` extension.

**Affected Code:**
- File: `src/lib/file-manager.ts`
- Method: `saveFileWithFallback` (lines 158-173)
- Trigger: `Ctrl+S` keyboard shortcut → `useKeyboardShortcuts.ts` → `saveFile` → `saveFileWithFallback`

## Solution

Ensure `saveFileWithFallback` always appends `.json` extension if the filename doesn't already end with it.

### Implementation

**File:** `src/lib/file-manager.ts`

```typescript
private saveFileWithFallback(filename: string, content: string): true | FileManagerError {
  try {
    // ENSURE .json EXTENSION - prevents browser/OS misidentifying as HTML
    const finalFilename = filename.endsWith('.json') ? filename : `${filename}.json`
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = finalFilename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    return true
  } catch {
    return { code: 'UNKNOWN', message: 'Failed to save file' }
  }
}
```

**Key Changes:**
1. Added validation: `filename.endsWith('.json')`
2. Conditional append: `${filename}.json` if extension missing
3. Use `finalFilename` for the download attribute

## Verification Steps

1. Open JSON.engine application
2. Press `Ctrl+O` to open any JSON file (with or without `.json` extension in filename)
3. Make a small edit to the content
4. Press `Ctrl+S` to save
5. Verify the downloaded file has `.json` extension:
   - Check browser download bar/folder
   - Verify file icon shows JSON (not HTML)
   - Open file in text editor to confirm JSON content
   - Check file properties/mime type

## Acceptance Criteria

- [x] `saveFileWithFallback` ensures `.json` extension on all saved files
- [x] Files saved via Ctrl+S have `.json` extension
- [x] Files that already have `.json` extension are not modified (no double extension)
- [x] TypeScript compiles without new errors
- [x] Existing save functionality preserved for File System Access API path

## Technical Notes

- The fix only affects the fallback path (when File System Access API is unavailable)
- File System Access API path (`saveFileWithAPI`) preserves the original file handle and doesn't need modification
- Blob content and MIME type remain unchanged (`application/json`)
- The fix is defensive - it handles both cases (with and without extension) gracefully

## Related Files

- `src/lib/file-manager.ts` - Modified `saveFileWithFallback` method
- `src/hooks/useKeyboardShortcuts.ts` - Ctrl+S handler (no changes needed)
- `src/store/app-store.ts` - Stores `currentFile` state (no changes needed)

## Success Metrics

- 100% of saved files have `.json` extension
- No regression in existing save functionality
- Browser correctly identifies downloaded files as JSON
