# Graph View Undo/Redo Feature

## TL;DR
Add undo/redo capability for graph operations (copy/paste, add node, delete node, etc.). Editor text changes already have undo via Monaco. Graph needs separate history tracking.

## Current State

### ✅ Editor Undo (Already Works)
- Monaco Editor tracks text change history
- Ctrl+Z / Ctrl+Shift+Z work natively
- Limited to text edits only

### ❌ Graph Undo (Missing)
- Copy/Paste → no undo
- Add Child → no undo
- Add Array Item → no undo
- Delete Node → no undo
- Rename Key → no undo

## Work Objectives

### Core Objective
Add undo/redo history tracking for graph operations that modify the JSON structure.

### Concrete Deliverables
- [ ] History stack in app-store (array of JSON states)
- [ ] Track operations: add, delete, modify, paste
- [ ] Ctrl+Z → undo last graph operation
- [ ] Ctrl+Shift+Z → redo
- [ ] Visual indicator (optional: "Undo available" hint)

### Definition of Done
- [ ] Undo works for: copy/paste, add child, add item, delete, rename
- [ ] Redo works (re-applies undone operation)
- [ ] History limit: 50 steps (configurable)
- [ ] No memory leaks
- [ ] Works alongside editor text undo (no conflicts)

## Scope Boundaries

### IN Scope
- Graph structure changes (node add/delete/edit)
- Keyboard shortcuts: Ctrl+Z (undo), Ctrl+Shift+Z (redo)
- History stored in app-store (memory only)
- Clear history on file open (new document = fresh start)

### OUT Scope (for now)
- Unlimited history (memory concerns)
- Persisted history (localStorage)
- Selective undo (undo specific operation from middle of stack)
- Visual undo button (keyboard-only for now)

## Technical Approach

### Option A: Full State Snapshots (Recommended)
Store complete JSON state after each operation.

**Pros**:
- Simple implementation
- No complex operation inversion logic
- Reliable — just restore previous state

**Cons**:
- Memory usage (50 snapshots × ~100KB each = ~5MB max)
- Acceptable for typical config files (<10KB each)

**Implementation**:
```typescript
// app-store.ts
interface AppState {
  history: string[]  // Array of JSON strings (max 50)
  historyIndex: number  // Current position in history
}

function pushState(jsonText: string) {
  history = history.slice(0, historyIndex + 1)
  history.push(jsonText)
  if (history.length > MAX_HISTORY) history.shift()
  historyIndex = history.length - 1
}

function undo() {
  if (historyIndex > 0) {
    historyIndex--
    setJsonText(history[historyIndex])
  }
}

function redo() {
  if (historyIndex < history.length - 1) {
    historyIndex++
    setJsonText(history[historyIndex])
  }
}
```

### Option B: Operation Log (Inverted Actions)
Store operations and their inverses.

**Pros**:
- Memory efficient (small operation objects)
- Can replay operations

**Cons**:
- Complex: need inverse for every operation
- Bug-prone: what if inverse logic is wrong?
- Harder to implement for paste (entire subtree)

**Implementation complexity**: 3-4× higher than snapshots

### Recommended: **Option A (State Snapshots)**
For typical OpenClaw configs (5-50KB), 50 snapshots = ~2.5MB max. Modern browsers handle this easily. Simpler code = fewer bugs.

## Execution Strategy

### Wave 1: History Infrastructure
- **T1**: Add `history` and `historyIndex` to app-store state
- **T2**: Add `pushState()`, `undo()`, `redo()` functions
- **T3**: Integrate with existing mutations (setJsonText calls pushState)
- **T4**: Add keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z) in useKeyboardShortcuts

### Wave 2: Integration & Testing
- **T5**: Hook into node operations (add, delete, paste, rename)
- **T6**: Clear history on file open
- **T7**: Add history limit (50 steps)
- **T8**: Manual QA (undo/redo all operations)

### Wave 3: Polish (Optional)
- **T9**: Visual indicator ("5 undos available")
- **T10**: Settings for history size
- **T11**: Undo/redo buttons in toolbar (optional)

## Memory Estimation

| Config Size | 50 Snapshots | 100 Snapshots |
|-------------|--------------|---------------|
| 10KB | 500KB | 1MB |
| 50KB | 2.5MB | 5MB |
| 100KB | 5MB | 10MB |

**Recommendation**: Default 50 steps, max 100. User can lower if memory-constrained.

## Keyboard Shortcut Conflicts

**Current shortcuts**:
- Ctrl+Z → (Monaco: editor undo)
- Ctrl+Shift+Z → (Monaco: editor redo)
- Ctrl+Y → (Monaco: redo alternative)

**Conflict Resolution**:
- When editor focused → Monaco handles undo (text changes)
- When canvas focused → Graph undo (structure changes)
- Use `useFocusContext` to determine which undo to trigger

Implementation:
```typescript
const { focusedArea } = useFocusContext()

useHotkeys('ctrl+z', (e) => {
  if (focusedArea === 'editor') {
    // Let Monaco handle it
    return
  }
  undoGraphOperation()
})
```

## Verification

### Manual Test Workflow
1. Add child node → Ctrl+Z → node disappears
2. Delete node → Ctrl+Z → node reappears
3. Paste subtree → Ctrl+Z → pasted nodes removed
4. Multiple undos → stack works correctly
5. Undo then redo → redo re-applies operation
6. File open → history cleared

### Edge Cases
- Undo after file open → no-op (empty history)
- Undo at start of history → no-op
- Redo at end of history → no-op
- New operation after undo → clears redo stack

## Open Questions

1. **History size**: 50 default? User-configurable?
2. **Visual indicator**: Show "5 undos available" somewhere?
3. **Toolbar button**: Add undo/redo icons next to Save/Format?
4. **Sync with editor**: Should graph undo also undo text changes? (Probably not — keep separate)

---

## Recommended Implementation Plan

**Start with Wave 1 only** (infrastructure + basic undo):
- 4 tasks, ~45 min
- Test with simple operations
- Get feedback before adding polish

**Wave 2** if Wave 1 works well:
- Hook into all node operations
- Clear history on file open

**Wave 3** (optional, based on user feedback):
- Visual indicators
- Toolbar buttons
- Settings

---

**Ready to start?** I'll begin with Wave 1: History infrastructure in app-store.
