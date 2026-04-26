# Editor Copy/Paste Feature

## TL;DR
Monaco Editor already has basic Ctrl+C/V for text. We need to enhance it with JSON-aware copy/paste that validates on paste and optionally provides context menu options.

## Current State
- ✅ Monaco Editor has built-in text copy/paste (Ctrl+C, Ctrl+V)
- ⚠️ Validation may not re-run automatically after paste
- ❌ No "Copy JSON path" or "Paste as formatted" options
- ❌ No context menu integration

## Work Objectives

### Core Objective
Enhance Monaco Editor copy/paste with JSON validation integration and optional context menu enhancements.

### Concrete Deliverables
- [ ] Validation re-triggers after paste
- [ ] Optional: Right-click context menu with "Copy path to here", "Paste formatted"
- [ ] Optional: Syntax-aware copy (copy entire selected JSON subtree)

### Definition of Done
- [ ] Paste triggers validation within 500ms
- [ ] No console errors on paste
- [ ] Invalid JSON shows error state
- [ ] Valid JSON re-renders canvas

## Scope Boundaries

### IN Scope
- Paste validation integration
- Basic error feedback on invalid paste
- Keep Monaco's native copy/paste behavior

### OUT Scope (for now)
- Complex context menus (Monaco has built-in context menu)
- Cross-file copy/paste (browser handles via system clipboard)
- Drag-and-drop from external sources

## Execution Strategy

### Wave 1: Validation Integration

**T1: Add paste event listener to CodeEditor component**
- Listen for Monaco's `onDidChangeModelContent` or paste events
- Detect when content changes via paste (vs typing)
- Trigger validation after paste

**T2: Add debounced validation trigger**
- Re-use existing validation logic from app-store
- Debounce to avoid validating mid-paste
- Show errors via existing ErrorPanel

### Wave 2: Optional Enhancements (stretch goals)

**T3: Add "Copy node path" to context menu**
- Monaco supports custom context menu items
- Right-click in editor → "Copy JSON path"
- Useful for navigating between views

**T4: Add syntax-aware selection**
- Double-click to select entire value/object
- Triple-click to select entire subtree

### Verification
- [ ] Paste valid JSON → canvas updates, no errors
- [ ] Paste invalid JSON → error panel shows message
- [ ] Paste large JSON (1000+ lines) → debounce prevents lag
- [ ] Ctrl+V works as expected (native behavior preserved)

---

## Technical Notes

### Monaco Editor Events
```typescript
editor.onDidPaste((e) => {
  // Trigger validation
})

// OR listen to model changes
editor.getModel().onDidChangeContent((e) => {
  // Debounced validation
})
```

### Validation Flow
```
User pastes JSON
  ↓
CodeEditor detects paste
  ↓
Debounce 300ms (wait for paste to finish)
  ↓
Dispatch to app-store → validateJson()
  ↓
ErrorPanel shows errors OR canvas re-renders
```

### Existing Patterns to Follow
- `EditorWorkspace.tsx` — has `handleEditorSearch`, `handleEditorFormat`
- `CodeEditor.tsx` — Monaco integration point
- `app-store.ts` — `validateJson()` already exists

---

## Success Criteria

### Manual Test Workflow
1. Copy JSON object from external file
2. Paste into editor at cursor position
3. Validation re-runs automatically
4. Valid JSON → canvas shows new nodes
5. Invalid JSON → ErrorPanel shows parse error

### Verification Commands
```bash
npm run build    # Expected: success
npm test         # Expected: existing tests pass
```

---

## Commit Strategy

- **Wave 1**: `feat(editor): add validation trigger on paste`
- **Wave 2** (optional): `feat(editor): add context menu enhancements`

---

## Open Questions

1. Should paste be debounced (300ms) or immediate?
2. Add visual indicator when paste is detected?
3. Block paste of invalid JSON, or allow and show error? (Current: allow)

---

**Recommended Approach**: Start minimal (Wave 1 only). Monaco's native paste is robust — we just need validation integration. Add context menu items only if users request specific workflows.
