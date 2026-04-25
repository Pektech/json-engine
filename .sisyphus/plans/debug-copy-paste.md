# Debug Graph Copy/Paste Feature

## Problem
Copy/Paste context menu items are NOT appearing when right-clicking nodes on the canvas.

## What Was Implemented
- `getValueAtPath()` and `insertNodeAtPath()` helpers added to `src/lib/json-mutations.ts` ✅
- `hasClipboard` state added to JsonNode component ✅
- Clipboard listener useEffect added ✅
- handleCopy() and handlePaste() functions added ✅
- Copy/Paste menu items added to getMenuItems() ✅
- Build passes without errors ✅

## Suspected Issues

1. **Clipboard listener not firing**: The `sessionStorage` check might not be working
2. **Menu items not rendering**: getMenuItems() might not be called, or menu structure wrong
3. **React state not updating**: hasClipboard might not trigger re-render
4. **Context menu library issue**: The context menu rendering might be separate from React state

## Debug Plan for Atlas

### Investigation Steps
1. Open browser DevTools Console
2. Right-click a node on canvas
3. Check if any errors logged
4. Check React DevTools for JsonNode component state
5. Inspect the rendered context menu DOM structure
6. Check if sessionStorage has data after clicking Copy
7. Verify getMenuItems() is actually being called

### Fix Strategy

**If menu items not rendering:**
- Check the context menu implementation - might need to force re-render
- Ensure menu items are properly structured for the menu library
- Check if icon JSX is causing issues (try removing icons first)

**If clipboard state not updating:**
- Add logging to clipboard-changed event dispatcher
- Check if sessionStorage is accessible
- Try using a simpler state trigger

**If context menu using external library:**
- Check library docs for how to update menu items dynamically
- Might need to close/reopen menu to show updated items

## Verification
After fix:
1. Refresh page
2. Right-click any node → "Copy" visible with icon
3. Click Copy
4. Right-click different node → "Paste" visible with icon
5. Click Paste → subtree appears as child
6. No console errors
