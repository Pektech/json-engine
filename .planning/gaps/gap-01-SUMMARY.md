---
gap_id: gap-01
status: resolved
priority: blocker
phase: 04-polish-release
tags: [react, hooks, keyboard-shortcuts, preventDefault]

files_modified:
  - src/components/layout/KeyboardShortcutsHelp.tsx
  - src/hooks/useKeyboardShortcuts.ts

key-fixes:
  - "Task 1: Moved all hooks (useState, useEffect) before conditional return in KeyboardShortcutsHelp.tsx"
  - "Task 2: Added preventDefault: true option to all global hotkeys (F1, Ctrl+/, Ctrl+O, Ctrl+S, Ctrl+Shift+F)"

verification:
  - "Click info icon in header - help panel opens without React hooks error"
  - "Press F1 - help panel opens, browser help does NOT open"
  - "Press Ctrl+S - app save triggers, browser save dialog does NOT appear"
  - "Check React DevTools - no hooks order warnings"

# Metrics
duration: 8min
completed: 2026-03-23
---

# Gap 01: Keyboard Shortcuts Hooks Crash - Summary

**Fixed React hooks order violation in KeyboardShortcutsHelp component and added preventDefault to all global keyboard shortcuts**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-23T22:20:00Z
- **Completed:** 2026-03-23T22:28:00Z
- **Tasks:** 4
- **Files modified:** 2

## Accomplishments
- Fixed React hooks rules violation that caused "Rendered more hooks than during previous render" crash
- Added `preventDefault: true` to all global hotkeys to prevent browser default actions
- Verified hooks are now declared before any conditional returns
- All global shortcuts (F1, Ctrl+S, Ctrl+O, Ctrl+Shift+F) now properly prevent browser defaults

## Files Modified

### `src/components/layout/KeyboardShortcutsHelp.tsx`
**Change:** Moved `handleClose` function and second `useEffect` hook BEFORE the conditional `if (!visible) return null;` return statement.

**Before (broken):**
```tsx
export function KeyboardShortcutsHelp({ isOpen = false, onClose }: KeyboardShortcutsHelpProps) {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  if (!visible) {
    return null;  // ❌ Conditional return BEFORE hooks
  }

  const handleClose = () => { ... };

  useEffect(() => {  // ❌ Hook after conditional - violates React rules
    const handleKeyDown = (e: KeyboardEvent) => { ... };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  // ...
}
```

**After (fixed):**
```tsx
export function KeyboardShortcutsHelp({ isOpen = false, onClose }: KeyboardShortcutsHelpProps) {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  const handleClose = () => { ... };

  useEffect(() => {  // ✅ Hook now before conditional
    const handleKeyDown = (e: KeyboardEvent) => { ... };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!visible) {  // ✅ Conditional after all hooks
    return null;
  }
  // ...
}
```

### `src/hooks/useKeyboardShortcuts.ts`
**Change:** Added `{ preventDefault: true, enableOnFormTags: true }` options to all global hotkeys (F1, Ctrl+/, Ctrl+O, Ctrl+S, Ctrl+Shift+F).

**Hotkeys updated:**
- `f1` - Show help panel
- `ctrl+/` - Show help panel  
- `ctrl+o` - Open file
- `ctrl+s` - Save file (already had explicit `e.preventDefault()` in handler)
- `ctrl+shift+f` - Canvas search

**Note:** Ctrl+F and Ctrl+H intentionally left without `preventDefault: true` option because they should only prevent default when canvas/global is focused, allowing Monaco editor to handle them when editor is focused.

## Decisions Made
- Kept explicit `event.preventDefault()` calls in handlers as backup (defense in depth)
- Did NOT add `preventDefault: true` to Ctrl+F and Ctrl+H to preserve Monaco editor functionality when editor is focused
- Maintained existing hotkey logic for conditional prevention based on focused area

## Deviations from Plan
None - plan executed exactly as written.

## Issues Encountered
- Pre-existing TypeScript error in `src/lib/file-manager.ts:1` (unrelated to this fix)
- Pre-existing type error in `src/components/editor/CodeEditor.tsx:96` (unrelated to this fix)
- LSP TypeScript server not installed in environment (used manual file verification instead)

## Verification Steps

To verify this fix works:

1. **Test help panel opens without crash:**
   - Click the info icon in the header
   - Help panel should appear without React error
   - No "Rendered more hooks" error in console

2. **Test F1 prevents browser help:**
   - Press F1 key
   - App help panel opens
   - Browser's built-in help does NOT open

3. **Test Ctrl+S prevents browser save:**
   - Press Ctrl+S
   - App save functionality triggers
   - Browser save dialog does NOT appear

4. **Test other shortcuts:**
   - Ctrl+O - Opens file dialog, doesn't trigger browser open
   - Ctrl+Shift+F - Focuses search, doesn't trigger browser find

## Next Phase Readiness
Gap-01 is complete. Ready to proceed with:
- gap-02: Sidebar navigation
- gap-03: Editor search
- gap-04: Shortcut browser defaults (remaining shortcuts)
- gap-05: Node selection sync

---
*Gap: gap-01*
*Completed: 2026-03-23*
