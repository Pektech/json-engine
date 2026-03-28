---
gap_id: gap-01
status: planned
priority: blocker
phase: 04-polish-release
source: 04-UAT.md Test 8
created: 2026-03-23
---

# Gap 01: Fix Keyboard Shortcuts React Hooks Crash

## Problem Statement

Keyboard shortcuts help panel crashes with "Rendered more hooks than during the previous render" error at `KeyboardShortcutsHelp.tsx:26`. Additionally, browser defaults are not prevented (F1 opens Google support, Ctrl+S triggers browser save).

## Root Cause Analysis

1. **Hooks Order Violation**: `useEffect` on line 26 is called after conditional early return, violating React hooks rules
2. **Missing preventDefault**: `react-hotkeys-hook` not configured to prevent browser defaults for F1 and Ctrl+S

## Affected Files

- `src/components/layout/KeyboardShortcutsHelp.tsx:26` - useEffect after conditional return
- `src/hooks/useKeyboardShortcuts.ts` - Missing preventDefault options

## Fix Tasks

### Task 1: Fix Hooks Order in KeyboardShortcutsHelp.tsx
**Priority:** blocker
**File:** `src/components/layout/KeyboardShortcutsHelp.tsx`

1. Move ALL hooks (`useState`, `useEffect`) to the top of component function
2. Move conditional returns AFTER all hook declarations
3. Ensure consistent hook count on every render path

**Before (broken):**
```tsx
export function KeyboardShortcutsHelp() {
  if (!isOpen) return null;  // ❌ Conditional before hooks
  
  useEffect(() => {  // ❌ Hook after conditional
    // ...
  }, []);
  // ...
}
```

**After (fixed):**
```tsx
export function KeyboardShortcutsHelp() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {  // ✅ Hook at top
    setMounted(true);
  }, []);
  
  if (!isOpen) return null;  // ✅ Conditional after hooks
  // ...
}
```

### Task 2: Add preventDefault to Global Hotkeys
**Priority:** blocker  
**File:** `src/hooks/useKeyboardShortcuts.ts`

1. Add `preventDefault: true` to all hotkey configurations:
   - F1 (show help)
   - Ctrl+S (save)
   - Ctrl+O (open)
   - Ctrl+Shift+F (search)

2. Use `useHotkeys` option: `{ preventDefault: true, enableOnFormTags: true }`

3. For Ctrl+S specifically, also call `event.preventDefault()` in handler

**Example:**
```tsx
useHotkeys('ctrl+s', (e) => {
  e.preventDefault();  // Prevent browser save
  handleSave();
}, { preventDefault: true, enableOnFormTags: true });
```

## Verification Steps

1. Click info icon in header - help panel opens without crash
2. Press F1 - help panel opens, browser help does NOT open
3. Press Ctrl+S - app save triggers, browser save dialog does NOT appear
4. Check React DevTools - no hooks order warnings

## Acceptance Criteria

- [ ] KeyboardShortcutsHelp.tsx renders without React hooks error
- [ ] F1 opens app help panel, not browser help
- [ ] Ctrl+S triggers app save, not browser save dialog
- [ ] All hotkeys have preventDefault configured
