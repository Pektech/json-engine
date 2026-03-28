# Gap #06: F1 Browser Help Interception

## Problem
F1 is a browser-reserved key that opens browser help by default. The existing `useHotkeys` listener in `useKeyboardShortcuts.ts` fires during the **bubble phase**, which occurs AFTER the browser's default F1 action has already triggered. This means browser help opens instead of the app's help panel.

## Root Cause
Event propagation phases:
1. **Capture phase**: Top-down (window → target)
2. **Target phase**: Event reaches target element
3. **Bubble phase**: Bottom-up (target → window)

Browser default actions typically execute between capture and bubble phases. The `react-hotkeys-hook` library registers listeners in the bubble phase, which is too late to prevent browser help.

## Solution
Added a **capture phase** keydown listener that intercepts F1 BEFORE the browser can act:

```typescript
useEffect(() => {
  const handleF1 = (e: KeyboardEvent) => {
    if (e.key === 'F1') {
      e.preventDefault();     // Prevent browser default (help)
      e.stopPropagation();    // Prevent other listeners
      if (helpPanelOpenCallback) {
        helpPanelOpenCallback(true);
      }
    }
  };
  
  // CRITICAL: capture: true intercepts BEFORE browser default action
  window.addEventListener('keydown', handleF1, { capture: true });
  return () => window.removeEventListener('keydown', handleF1, { capture: true });
}, [helpPanelOpenCallback]);
```

## Implementation Details

**File Modified**: `src/hooks/useKeyboardShortcuts.ts`

**Changes Made**:
1. Added `useEffect` import from React
2. Added capture phase listener at the top of `useKeyboardShortcuts()` function
3. Kept existing `useHotkeys('f1', ...)` as fallback (defensive coding)

**Key Technical Points**:
- `{ capture: true }` option registers listener for capture phase
- `e.preventDefault()` must be called in capture phase to prevent browser default
- `e.stopPropagation()` prevents duplicate handling by bubble phase listeners
- Cleanup properly removes listener on unmount
- Both `addEventListener` and `removeEventListener` must use same options object

## Testing

**Manual Verification**:
1. Open app in browser
2. Press F1 key
3. Expected: App help panel opens
4. Expected: Browser help does NOT open

**Fallback Behavior**:
The existing `useHotkeys` handler remains as a backup. In practice, the capture listener will always fire first and stop propagation, so the fallback won't trigger - but it provides defense-in-depth.

## Related Files
- `src/hooks/useKeyboardShortcuts.ts` - F1 handler implementation
- `src/components/layout/KeyboardShortcutsHelp.tsx` - Help panel component
- `src/hooks/useKeyboardShortcuts.ts#L8-10` - `setOnOpenHelp` callback registration

## References
- MDN: [Event capturing and bubbling](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events)
- MDN: [addEventListener capture option](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#capture)
- W3C: [UI Events Specification - Activation triggers](https://www.w3.org/TR/uievents/#activation)
