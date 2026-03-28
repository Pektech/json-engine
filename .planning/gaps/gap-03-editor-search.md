---
gap_id: gap-03
status: planned
priority: major
phase: 04-polish-release
source: 04-UAT.md Test 6
created: 2026-03-23
---

# Gap 03: Fix JSON Editor Search Box

## Problem Statement

Editor toolbar has search button but it doesn't search the JSON text content. User reported: "there are two search boxes. one on the node side which does work and one on the text side which does not".

## Root Cause Analysis

1. EditorToolbar has search UI but `onSearch` prop only triggers graph search
2. Monaco Editor's find widget not being activated
3. No distinction between "search graph nodes" vs "search editor text"

## Affected Files

- `src/components/editor/EditorToolbar.tsx` - Search button not connected to Monaco
- `src/components/editor/CodeEditor.tsx` - Needs method to trigger Monaco find widget

## Fix Tasks

### Task 1: Add Monaco Find Widget Trigger
**Priority:** major
**File:** `src/components/editor/CodeEditor.tsx`

1. Expose method to trigger Monaco find widget via ref:
```tsx
export interface CodeEditorRef {
  triggerFind: () => void;
  triggerReplace: () => void;
  // ... existing methods
}
```

2. Implement `triggerFind` using Monaco editor instance:
```tsx
triggerFind: () => {
  editor?.trigger('keyboard', 'actions.find', {});
}
```

### Task 2: Connect EditorToolbar to Monaco Search
**Priority:** major
**File:** `src/components/editor/EditorToolbar.tsx`

1. Accept `editorRef` prop or use context to access CodeEditor
2. Modify search handler to trigger Monaco find:
```tsx
const handleSearch = () => {
  if (searchMode === 'editor') {
    editorRef.current?.triggerFind();
  } else {
    onGraphSearch(searchQuery);
  }
};
```

3. Add search mode toggle or distinct buttons for:
   - Search in editor (Monaco find widget)
   - Search in graph (node filtering)

### Task 3: Distinguish Search Contexts
**Priority:** major
**UI Design:** Update EditorToolbar

1. Add clear labeling:
   - Editor search: "Find in JSON" or use 🔍 icon with "JSON" label
   - Graph search: "Filter nodes" or use 🔍 icon with "Nodes" label

2. Or use separate buttons:
   - `Ctrl+F` → Monaco find (when editor focused)
   - `Ctrl+Shift+F` → Graph search (global)

## Verification Steps

1. Click search in editor toolbar → Monaco find widget opens
2. Type in Monaco find widget → Text matches highlight in editor
3. Graph search (top search bar) → Nodes filter correctly
4. Both searches work independently

## Acceptance Criteria

- [ ] Editor search button triggers Monaco find widget
- [ ] Monaco find widget highlights matches in JSON text
- [ ] Graph search and editor search are clearly distinguishable
- [ ] Keyboard shortcuts: Ctrl+F for editor, Ctrl+Shift+F for graph
