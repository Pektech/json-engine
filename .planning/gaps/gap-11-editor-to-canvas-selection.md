---
gap_id: gap-11
status: completed
priority: minor
phase: 04-polish-release
source: User request - bidirectional selection sync
created: 2026-03-28
completed: 2026-03-28
---

# Gap 11: Editor-to-Canvas Selection Sync

## Problem Statement

User requested: "Currently if I click on a node in the graph the corresponding section in the editor is highlighted which is great. Can it also work the other way? I click on a key in the editor and the corresponding node highlights on the graph."

**Current behavior:** Canvas → Editor selection works ✅
**Missing behavior:** Editor → Canvas selection ❌

## Root Cause Analysis

The infrastructure was already in place:
- `CodeEditor` had `onCursorPositionChange` callback
- `EditorWorkspace` wired it to `selectPath()` 
- `NodeCanvas` received `selectedNodeId` prop
- `JsonNode` had highlight styling for selected nodes

However, the editor only listened to `onDidChangeCursorPosition` which fires when the cursor moves (typing, arrow keys), but **not when clicking**. Users expect clicking to also trigger selection sync.

## Solution

Added `onMouseDown` event listener to the Monaco editor that triggers selection sync when the user clicks:

```typescript
// Also update selection when user clicks in the editor
editor.onMouseDown((e) => {
  const position = e.target.position
  if (position && onCursorPositionChange && value) {
    // Wait for cursor to actually move to the clicked position
    setTimeout(() => {
      const newPath = lineToPath(value, position.lineNumber)
      onCursorPositionChange(newPath)
    }, 0)
  }
})
```

The `setTimeout(0)` ensures the cursor has actually moved to the clicked position before we calculate the path.

## Files Modified

- `src/components/editor/CodeEditor.tsx` — Added `onMouseDown` listener

## How It Works

**Bidirectional Selection Flow:**

### Canvas → Editor (already working)
1. User clicks node on canvas
2. `onNodeClick` calls `onNodeSelect(nodeId)`
3. `handleNodeSelect` calls `selectPath(nodeId)`
4. App store updates `selectedPath`
5. CodeEditor receives `selectedPath` prop
6. Editor scrolls to line and applies highlight decoration

### Editor → Canvas (now working)
1. User clicks or moves cursor in editor
2. `onDidChangeCursorPosition` OR `onMouseDown` fires
3. `lineToPath()` converts line number to JSON path
4. `onCursorPositionChange(path)` calls `selectPath(path)`
5. App store updates `selectedPath`
6. NodeCanvas receives `selectedNodeId` prop
7. JsonNode applies highlight styling (`border-primary ring-2`)

## Verification Steps

1. **Test clicking in editor:**
   - Open a JSON file
   - Click on any key/value in the editor
   - Corresponding node on canvas should highlight with primary border + ring

2. **Test typing in editor:**
   - Place cursor anywhere in editor
   - Use arrow keys to navigate
   - Node highlight should follow cursor position

3. **Test canvas selection:**
   - Click a node on canvas
   - Editor should scroll to that location and highlight the line

4. **Test bidirectional sync:**
   - Click node on canvas → editor highlights
   - Click different location in editor → canvas highlight updates
   - Smooth back-and-forth navigation

## Decisions Made

1. **Used `setTimeout(0)` for click handling** — Ensures cursor position is updated before calculating path
2. **Kept both event listeners** — `onDidChangeCursorPosition` for keyboard navigation, `onMouseDown` for clicking
3. **No visual changes to highlight style** — Reused existing primary border + ring styling

## Related Features

- gap-05: Node selection sync (canvas → editor)
- gap-08: Node selection scroll/highlight

## Next Phase Readiness

Bidirectional selection sync is complete. Users can now:
- Navigate from canvas to editor (click node → editor scrolls)
- Navigate from editor to canvas (click/type → node highlights)

This provides seamless navigation between visual and code views.

---

*Gap: gap-11*
*Completed: 2026-03-28*
