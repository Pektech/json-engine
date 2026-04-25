# Graph View Copy/Paste Feature

## TL;DR
Add right-click "Copy" / "Paste" to canvas nodes. Copy stores entire node subtree to sessionStorage. Paste inserts as child of target node. User handles naming conflicts manually.

## Work Objectives

### Core Objective
Enable copying node structures (with all children) on the canvas and pasting them elsewhere via right-click context menu.

### Concrete Deliverables
- [ ] "Copy" menu item in node context menu
- [ ] "Paste" menu item (shows when clipboard has data)
- [ ] `getValueAtPath()` helper in `src/lib/json-mutations.ts`
- [ ] `addChildNode()` or similar for inserting arbitrary objects
- [ ] Clipboard state broadcast via CustomEvent

### Definition of Done
- [ ] Copy stores node + full subtree to sessionStorage
- [ ] Paste inserts copied structure as child of target node
- [ ] Context menu shows/hides Paste based on clipboard state
- [ ] After paste, validation runs (existing system)
- [ ] `npm run build` passes

### Must Have
- Copy works on any node type (object, array, primitive)
- Paste shows "Paste" only when clipboard has data
- Pasted node is auto-selected after paste

### Must NOT Have
- NO auto-rename of pasted nodes (user handles conflicts)
- NO system clipboard API (use sessionStorage for simplicity)
- NO keyboard shortcuts in this phase (right-click only)

---

## Execution Strategy

### Waves

```
Wave 1 (Helpers first):
├── T1: Add getValueAtPath() to json-mutations.ts
└── T2: Add insertNodeAtPath() or use existing addChildAtPath

Wave 2 (JsonNode context menu):
├── T3: Add clipboard state listener hook
├── T4: Add handleCopy() function
├── T5: Add handlePaste() function
└── T6: Integrate Copy/Paste menu items

Wave 3 (Verify + QA):
├── F1: Verify build passes
└── F2: Manual QA (copy subtree, paste as child, verify structure)
```

### Dependency Matrix
- **1-2**: (none) — 3-6
- **3-5**: 1-2 — 6
- **6**: 3-5 — F1-F2
- **F1-F2**: 6 — user okay

---

## TODOs

- [ ] 1. Add `getValueAtPath()` to `src/lib/json-mutations.ts`

  **What to do**:
  - Add helper that traverses parsed JSON by path string
  - Signature: `getValueAtPath(obj: any, path: string): any`
  - Handle both dot notation (`root.users`) and brackets (`root.arr[0]`)
  - Return undefined if path doesn't exist

  **Acceptance Criteria**:
  - [ ] `getValueAtPath({a: {b: 1}}, "a.b")` → returns `1`
  - [ ] `getValueAtPath({arr: [10, 20]}, "arr[0]")` → returns `10`

  **Recommended Agent**: `quick`

- [ ] 2. Add `insertNodeAtPath()` to `src/lib/json-mutations.ts`

  **What to do**:
  - Add helper that inserts an entire object as a new child
  - Signature: `insertNodeAtPath(obj: any, parentPath: string, key: string, value: any): any`
  - Like `addChildAtPath` but accepts arbitrary object value (not just primitives)

  **Acceptance Criteria**:
  - [ ] Can insert nested object structure
  - [ ] Works with arrays (pushes to array)

  **Recommended Agent**: `quick`

- [ ] 3. Add clipboard state listener to JsonNode.tsx

  **What to do**:
  - Add `const [hasClipboard, setHasClipboard] = useState(false)`
  - Add useEffect that:
    - Checks sessionStorage on mount
    - Listens for 'clipboard-changed' custom event
    - Updates state

  **Acceptance Criteria**:
  - [ ] Component updates when clipboard changes
  - [ ] "Paste" menu shows/hides based on state

  **Recommended Agent**: `visual-engineering`

- [ ] 4. Add handleCopy() function to JsonNode.tsx

  **What to do**:
  - Get parsed JSON from store
  - Call `getValueAtPath(parsedJson, path)` to get node's value
  - Store `{ path, value, type, timestamp }` to sessionStorage as `json-engine-clipboard`
  - Dispatch `new CustomEvent('clipboard-changed')`

  **Acceptance Criteria**:
  - [ ] Data stored in sessionStorage after right-click → Copy
  - [ ] Event dispatched so other instances update

  **Recommended Agent**: `visual-engineering`

- [ ] 5. Add handlePaste() function to JsonNode.tsx

  **What to do**:
  - Read from sessionStorage
  - Parse clipboard data
  - Call `insertNodeAtPath()` with target path (current node) + clipboard data
  - Update store via `setJsonText()`
  - Auto-select pasted node via `selectPath()`

  **Acceptance Criteria**:
  - [ ] Pasted node appears as child of target
  - [ ] Target node is expanded after paste
  - [ ] Pasted node gets selected

  **Recommended Agent**: `visual-engineering`

- [ ] 6. Add Copy/Paste to context menu in getMenuItems()

  **What to do**:
  - Add "Copy" item (with keyboard hint `Ctrl+C` visually)
  - Add "Paste" item (conditionally rendered via `hasClipboard` state)
  - Style to match existing menu items
  - Separate with divider line

  **Acceptance Criteria**:
  - [ ] "Copy" visible on all nodes
  - [ ] "Paste" only visible when hasClipboard is true
  - [ ] Both have click handlers

  **Recommended Agent**: `visual-engineering`

---

## Final Verification Wave

- [ ] F1. Build verification
  - [ ] `npm run build` succeeds

- [ ] F2. Manual QA
  - [ ] Copy object node with children
  - [ ] Navigate to different node
  - [ ] Paste — verify structure appears as child
  - [ ] Copy primitive → paste → verify value correct
  - [ ] Copy array → paste into array node → verify pushed correctly

---

## Success Criteria

### Manual Test Workflow
```
1. Right-click "plugins" node → Copy
2. Right-click "defaults" node → Paste
3. Verify: "plugins" subtree appears under "defaults.plugins"
4. No crash on duplicate keys (validation warns, user fixes)
```

### Verification Commands
```bash
npm run build    # Expected: success
npm test         # Expected: existing tests still pass
```

---

## Commit Strategy

- **Wave 1**: `feat(lib): add getValueAtPath and insertNodeAtPath helpers`
- **Wave 2**: `feat(graph): add copy/paste context menu to canvas nodes`
- **Wave 3**: (verification only — no commits)
