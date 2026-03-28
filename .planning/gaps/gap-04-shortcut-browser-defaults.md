---
gap_id: gap-04
status: planned
priority: major
phase: 04-polish-release
source: 04-UAT.md Test 8a
created: 2026-03-23
---

# Gap 04: Prevent Browser Defaults for Keyboard Shortcuts

## Problem Statement

Keyboard shortcuts trigger browser actions instead of app actions:
- F1 opens browser help (Google support page)
- Ctrl+S triggers browser save (downloads HTML file)
- Ctrl+Shift+F does nothing (should focus canvas search)

## Root Cause Analysis

1. `react-hotkeys-hook` not configured with `preventDefault: true`
2. Ctrl+Shift+F handler only clears search but doesn't focus the search input
3. Browser key handlers not suppressed for these specific shortcuts

## Affected Files

- `src/hooks/useKeyboardShortcuts.ts` - Missing preventDefault and focus handling

## Fix Tasks

### Task 1: Add preventDefault to All Global Hotkeys
**Priority:** major
**File:** `src/hooks/useKeyboardShortcuts.ts`

1. Update all `useHotkeys` calls with options:
```tsx
useHotkeys('f1', handleShowHelp, { 
  preventDefault: true,
  enableOnFormTags: true,
  enableOnContentEditable: true 
});

useHotkeys('ctrl+s', handleSave, { 
  preventDefault: true,
  enableOnFormTags: true 
});

useHotkeys('ctrl+o', handleOpen, { 
  preventDefault: true,
  enableOnFormTags: true 
});
```

2. Add explicit `event.preventDefault()` in handlers as backup:
```tsx
const handleSave = useCallback((e: KeyboardEvent) => {
  e.preventDefault();
  // ... save logic
}, [/* deps */]);
```

### Task 2: Fix Ctrl+Shift+F to Focus Search
**Priority:** major
**File:** `src/hooks/useKeyboardShortcuts.ts`

1. Update Ctrl+Shift+F handler:
```tsx
useHotkeys('ctrl+shift+f', (e) => {
  e.preventDefault();
  
  // Focus the search input
  searchInputRef.current?.focus();
  searchInputRef.current?.select();
  
  // Switch to canvas view if not already visible
  setActiveView('split'); // or 'canvas'
}, { preventDefault: true });
```

2. Ensure `searchInputRef` is accessible from the hook (via context or prop)

### Task 3: Verify Monaco Shortcuts Still Work
**Priority:** major
**File:** `src/hooks/useKeyboardShortcuts.ts`

1. Ensure editor-focused shortcuts don't trigger when Monaco has focus:
```tsx
useHotkeys('ctrl+f', () => {
  // Only trigger if NOT in editor
  if (focusedArea !== 'editor') {
    // Trigger canvas search
  }
  // If in editor, let Monaco handle Ctrl+F
}, { 
  preventDefault: focusedArea !== 'editor',
  enabled: focusedArea !== 'editor' 
});
```

## Verification Steps

1. Press F1 → App help panel opens, browser help does NOT open
2. Press Ctrl+S → App save triggers, browser save dialog does NOT appear
3. Press Ctrl+O → App file dialog opens
4. Press Ctrl+Shift+F → Search input focused and selected
5. Focus editor, press Ctrl+F → Monaco find widget opens (not app search)

## Acceptance Criteria

- [ ] F1 opens app help, not browser help
- [ ] Ctrl+S triggers app save, not browser save
- [ ] Ctrl+O triggers app open dialog
- [ ] Ctrl+Shift+F focuses and selects search input
- [ ] Monaco native shortcuts (Ctrl+F) work when editor focused
