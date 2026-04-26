# Fix: Editor Selection Jumping Issue

## Problem
When selecting text in Monaco Editor, the selection "jumps around" or gets interrupted. This happens because `onDidChangeCursorPosition` fires during selection, potentially interfering with Monaco's native selection behavior.

## Root Cause
**Line 161** in `CodeEditor.tsx`:
```typescript
editor.onDidChangeCursorPosition(updateSelectionFromCursor)
```

This fires on EVERY cursor movement, including:
- Typing
- Arrow key navigation
- **Text selection (mouse drag)**
- **Shift+arrow key selection**

The `updateSelectionFromCursor` callback dispatches to the store, which might trigger re-renders that interrupt the selection flow.

## Solution Options

### Option A: Debounce cursor position updates (Recommended)
Add debounce to `updateSelectionFromCursor` so it doesn't fire on every micro-movement:

```typescript
const debouncedUpdateSelection = useCallback(
  debounce(() => {
    updateSelectionFromCursor()
  }, 100), // 100ms delay
  [updateSelectionFromCursor]
)

editor.onDidChangeCursorPosition(debouncedUpdateSelection)
```

**Pros**: Simple, minimal change
**Cons**: Path updates have slight delay (acceptable for editor view)

### Option B: Only update on selection end, not during drag
Listen for `onMouseUp` or `onKeyUp` instead of continuous cursor changes:

```typescript
editor.onMouseUp(() => {
  setTimeout(updateSelectionFromCursor, 50)
})

editor.onKeyUp(() => {
  setTimeout(updateSelectionFromCursor, 50)
})
```

**Pros**: No updates during selection
**Cons**: Path doesn't update while navigating with arrow keys

### Option C: Check if user is actively selecting
Only update if there's no active selection:

```typescript
const selection = editor.getSelection()
if (selection && selection.isEmpty()) {
  // Only update if no text is selected
  updateSelectionFromCursor()
}
```

**Pros**: Updates work during normal navigation
**Cons**: Doesn't update path when text IS selected (might be acceptable)

## Recommended Approach

**Option A (debounce)** is the safest — maintains existing behavior while preventing rapid-fire updates during selection drags. The 100ms delay is imperceptible for path updates.

## Implementation Steps

1. Add `import { debounce } from 'lodash.debounce'` OR create simple debounce utility
2. Wrap `updateSelectionFromCursor` in debounce
3. Update dependency array
4. Test selection behavior

## Verification

After fix:
1. ✅ Can select text with mouse drag (no jumping)
2. ✅ Can select with Shift+arrow keys
3. ✅ Path still updates after navigation (arrow keys, clicks)
4. ✅ Canvas selection sync still works
5. ✅ No console errors

---

**Test workflow:**
1. Open editor
2. Click and drag to select multi-line text
3. Selection should stay stable (no jumping)
4. Release mouse → path updates
5. Press arrow keys → navigation works, path updates after 100ms
