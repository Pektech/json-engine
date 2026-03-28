---
gap_id: gap-05
status: planned
priority: major
phase: 04-polish-release
source: 04-UAT.md Test 9
created: 2026-03-23
---

# Gap 05: Fix Node Selection and Editor Sync

## Problem Statement

Clicking graph nodes does not:
1. Highlight the selected node visually
2. Reveal corresponding JSON location in editor
3. Scroll editor to show selected path

User reported: "clicked node does not highlight, json editor does not reveals/focuses the corresponding location, editor does not scroll to show the selected path".

## Root Cause Analysis

1. **No visual highlight**: Graph nodes receive `selectedNodeId` prop but don't apply selected styling
2. **Editor not scrolling**: CodeEditor has `selectedPath` effect but may not be triggering scroll
3. **Path-to-line mapping**: `pathToLine` function may not be wired correctly between components

## Affected Files

- `src/components/canvas/NodeCanvas.tsx` - selectedNodeId passed but not used for styling
- `src/components/graph/JsonNode.tsx` - Missing selected state styling
- `src/components/editor/CodeEditor.tsx` - selectedPath effect not scrolling properly

## Fix Tasks

### Task 1: Wire Selected State to Node Styling
**Priority:** major
**File:** `src/components/graph/JsonNode.tsx`

1. Accept `isSelected` prop:
```tsx
interface JsonNodeProps {
  data: NodeData;
  isSelected: boolean;
  // ... other props
}
```

2. Apply selected styling when `isSelected` is true:
```tsx
<div className={cn(
  "node-card",
  isSelected && "ring-2 ring-primary border-primary"
)}>
```

3. Update NodeCanvas to pass selected state:
```tsx
<JsonNode 
  data={node.data} 
  isSelected={node.id === selectedNodeId}
/>
```

### Task 2: Fix CodeEditor Scroll to Selected Path
**Priority:** major
**File:** `src/components/editor/CodeEditor.tsx`

1. Ensure `useEffect` for `selectedPath` has correct dependencies:
```tsx
useEffect(() => {
  if (!editorRef.current || !selectedPath || !value) return;
  
  const line = pathToLine(value, selectedPath);
  if (line) {
    editorRef.current.revealLineInCenter(line);
    editorRef.current.setPosition({ lineNumber: line, column: 1 });
  }
}, [selectedPath, value]); // Ensure value is dependency
```

2. Add highlight decoration for selected line:
```tsx
// Add line highlight decoration
const decorations = editorRef.current.deltaDecorations([], [
  {
    range: new monaco.Range(line, 1, line, 1),
    options: {
      isWholeLine: true,
      className: 'selected-line-highlight',
      linesDecorationsClassName: 'selected-line-margin'
    }
  }
]);
```

### Task 3: Verify Path-to-Line Mapping
**Priority:** major
**Files:** `src/utils/pathToLine.ts` (or create)

1. Ensure `pathToLine` function works correctly:
```tsx
export function pathToLine(json: string, path: string): number | null {
  // Parse path like "$.config.nodes[0].name"
  // Find corresponding line in JSON string
  // Return 1-based line number
}
```

2. Handle edge cases:
   - Root path "$"
   - Array indices
   - Nested objects
   - Invalid paths

3. Add unit tests for pathToLine

### Task 4: Bidirectional Selection (Optional Enhancement)
**Priority:** medium

1. When clicking in editor, highlight corresponding node:
   - Track cursor position
   - Map line to path (reverse of pathToLine)
   - Call `selectNode` with that path

## Verification Steps

1. Click a graph node → Node gets primary border highlight
2. Editor scrolls to show corresponding JSON location
3. Corresponding line is highlighted in editor
4. Click another node → Previous node unhighlights, new node highlights
5. Selection syncs bidirectionally (optional)

## Acceptance Criteria

- [ ] Clicked graph node shows visual highlight (border/ring)
- [ ] Editor scrolls to reveal selected node's JSON location
- [ ] Selected line is highlighted in editor
- [ ] Only one node can be selected at a time
- [ ] Path-to-line mapping works for all node types (objects, arrays, primitives)
