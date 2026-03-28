---
gap_id: gap-12
status: completed
priority: minor
phase: 04-polish-release
source: User request - auto-center canvas on selected node
created: 2026-03-28
completed: 2026-03-28
---

# Gap 12: Auto-Center Canvas on Selected Node

## Problem Statement

User requested: "Is it possible for the graph screen to auto-centre on the selected node, rather than me having to pan around to find it?"

**Current behavior:** When clicking in the editor, the corresponding node highlights but might be off-screen, requiring manual panning to find it.

**Desired behavior:** Canvas automatically pans to center the selected node with smooth animation.

## Solution

Added `useEffect` hook in `NodeCanvas` that watches for changes to `selectedNodeId` and calls React Flow's `fitView()` method to center the viewport on the selected node:

```typescript
// Auto-center canvas on selected node when it changes
useEffect(() => {
  if (selectedNodeId && selectedNodeId !== previousSelectedNodeId.current) {
    // Give React Flow time to update the nodes before fitting view
    setTimeout(() => {
      fitView({ 
        nodes: [{ id: selectedNodeId }],
        padding: 0.2,
        duration: 200
      })
    }, 50)
    previousSelectedNodeId.current = selectedNodeId
  }
}, [selectedNodeId, fitView])
```

### Key Implementation Details

1. **`useReactFlow()` hook** — Provides access to `fitView()` method for programmatic viewport control
2. **`previousSelectedNodeId` ref** — Prevents re-centering when the same node is already selected (avoids jarring movement while editing)
3. **`setTimeout(50ms)`** — Gives React Flow time to apply the selection styling before animating the viewport
4. **`padding: 0.2`** — Adds 20% padding around the node for better visibility
5. **`duration: 200`** — Smooth 200ms animation instead of instant jump

## Files Modified

- `src/components/canvas/NodeCanvas.tsx` — Added auto-center logic

## How It Works

**Selection Flow with Auto-Center:**

1. User clicks in editor or on canvas node
2. `selectPath(nodeId)` updates app store
3. `selectedNodeId` prop changes in NodeCanvas
4. `useEffect` detects change (different from previous)
5. After 50ms delay, `fitView()` centers viewport on node
6. Smooth 200ms animation brings node into view
7. Node is centered with 20% padding for context

## User Experience Improvements

**Before:**
- Click in editor → Node highlights (but might be off-screen)
- User must manually pan to find the highlighted node
- Disorienting when working with large JSON files

**After:**
- Click in editor → Canvas smoothly pans to center the node
- Node is always visible and centered
- Seamless navigation between editor and canvas

## Edge Cases Handled

1. **Same node selected** — Doesn't re-center if already selected (prevents jarring movement during editing)
2. **Rapid selection changes** — Each change triggers new center animation
3. **Node not found** — `fitView()` gracefully handles missing nodes
4. **Initial load** — Only centers on user-initiated selection, not on first render

## Verification Steps

1. **Test editor-to-canvas:**
   - Open a large JSON file
   - Click on a deeply nested key in editor
   - Canvas should smoothly pan to center that node

2. **Test canvas-to-editor:**
   - Click a node on canvas
   - Editor scrolls to line
   - Canvas keeps node centered

3. **Test rapid selection:**
   - Click multiple locations in editor quickly
   - Canvas should smoothly follow each selection

4. **Test editing:**
   - Select a node
   - Start typing in editor
   - Canvas should NOT re-center while editing (only on new selection)

## Decisions Made

1. **200ms animation duration** — Long enough to be smooth, short enough to feel responsive
2. **20% padding** — Provides context without showing too much empty space
3. **50ms delay before centering** — Ensures node is rendered before viewport adjustment
4. **Track previous selection** — Avoids re-centering on same node (prevents distraction during editing)

## Related Features

- gap-11: Editor-to-canvas selection sync
- gap-05: Node selection sync (canvas → editor)
- gap-08: Node selection scroll/highlight

## Next Phase Readiness

Auto-center is complete. Users now have seamless bidirectional navigation:
- Click in editor → Canvas centers on node + highlights
- Click on canvas → Editor scrolls to line + highlights

No more manual panning to find selected nodes!

---

*Gap: gap-12*
*Completed: 2026-03-28*
