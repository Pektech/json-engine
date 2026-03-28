---
gap_id: gap-08
status: closed
priority: major
phase: 04-polish-release
source: 04-UAT.md Test 9 follow-up
created: 2026-03-23
closed: 2026-03-23
---

# Gap 08: Fix Node Selection Scroll and Highlight Clearing

## Problem Statement

Two issues with node selection in CodeEditor:

1. **Editor doesn't scroll to selection** - When selected node's JSON is below visible screen, editor doesn't scroll to show it
2. **Highlight doesn't clear** - Previous node's highlight remains when selecting a new node, causing multiple lines to be highlighted

## Root Cause Analysis

1. **Missing decoration ID tracking** - `deltaDecorations([], ...)` passes empty array, so Monaco has no way to know which decorations to clear
2. **No editor focus before scroll** - Monaco's `revealLineInCenter` requires editor to have focus before scrolling will work
3. **State vs Ref** - Decoration IDs need to persist across renders without triggering re-renders, so useRef is required instead of useState

## Affected Files

- `src/components/editor/CodeEditor.tsx` - Line 30 (add ref), lines 137-161 (useEffect)

## Fix Applied

### Change 1: Add Decoration IDs Ref (Line 30)

```typescript
const decorationIdsRef = useRef<string[]>([])
```

### Change 2: Update useEffect (Lines 137-168)

```typescript
useEffect(() => {
  if (editorRef.current && selectedPath && value && monaco) {
    const location = pathToLine(value, selectedPath)
    if (location) {
      // Focus editor first to ensure scroll works
      editorRef.current.focus()
      editorRef.current.revealLineInCenter(location.line)
      editorRef.current.setPosition({
        lineNumber: location.line,
        column: location.column,
      })
      
      const decorations = [
        {
          range: new monaco.Range(location.line, 1, location.line, 1),
          options: {
            isWholeLine: true,
            className: 'selected-line-highlight',
            linesDecorationsClassName: 'selected-line-margin',
          },
        },
      ]
      
      // CRITICAL: Pass previous decoration IDs to clear them
      decorationIdsRef.current = editorRef.current.deltaDecorations(
        decorationIdsRef.current,  // Clear previous decorations
        decorations  // Apply new decoration
      )
    }
  }
}, [selectedPath, value, monaco])
```

## Key Changes

1. **Added `decorationIdsRef`** - Stores decoration IDs persistently across renders
2. **Added `editor.focus()`** - Ensures editor has focus before scrolling
3. **Pass `decorationIdsRef.current` to deltaDecorations** - Clears previous decorations before applying new ones
4. **Store returned IDs** - Updates ref with new decoration IDs for next cleanup cycle

## Monaco Editor API Pattern

The `deltaDecorations(oldDecorations, newDecorations)` method:
- First parameter: Array of decoration IDs to remove
- Second parameter: Array of new decoration objects to add
- Returns: Array of new decoration IDs

By passing previous IDs in first parameter, Monaco removes those decorations before adding new ones. This ensures only one line is highlighted at a time.

## Verification Steps

1. **Test scroll to off-screen selection**:
   - Load JSON with many lines
   - Scroll editor to top
   - Click node at bottom of JSON structure
   - ✓ Editor scrolls to show selected line

2. **Test highlight clearing**:
   - Click node A → Line A highlights
   - Click node B → Line A unhighlights, Line B highlights
   - ✓ Only one line highlighted at a time

3. **Test rapid selection**:
   - Click multiple nodes in quick succession
   - ✓ Only most recently clicked node remains highlighted

## Acceptance Criteria

- [x] Editor scrolls to reveal selected path when off-screen
- [x] Only one line is highlighted at a time
- [x] Previous highlight clears when new node selected
- [x] Editor receives focus before scroll operation
- [x] Decoration IDs persist across renders using useRef
- [x] No TypeScript compilation errors in modified file
- [x] Highlight CSS classes unchanged (selected-line-highlight, selected-line-margin)

## Related

- gap-05: Original node selection sync implementation
- Monaco Editor deltaDecorations API: https://microsoft.github.io/monaco-editor/docs.html#functions/editor.IStandaloneCodeEditor.deltaDecorations.html
