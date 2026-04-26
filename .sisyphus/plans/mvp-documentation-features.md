# MVP Documentation + Feature Improvements

## TL;DR

> **Quick Summary**: Close remaining MVP gaps — update documentation (README, CHANGELOG, LICENSE, architecture & developer guides) and add critical feature improvements (copy-to-clipboard, E2E tests for undo, canvas, keyboard).
> 
> **Deliverables**:
> - LICENSE file added
> - CHANGELOG.md updated with all recent fixes
> - README.md updated with features, shortcuts, screenshots
> - ARCHITECTURE.md created with project structure and data flow
> - DEVELOPER.md created with setup and debugging guide
> - Copy-to-clipboard button in EditorToolbar
> - 3 new E2E test files (undo/redo, canvas interactions, keyboard shortcuts)
> 
> **Estimated Effort**: Medium (9 tasks across 5 waves)
> **Parallel Execution**: YES — 5 waves with parallel tasks per wave
> **Critical Path**: T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9 → F1-F3

---

## Context

### Original Request
User requested comprehensive MVP assessment and fix of remaining gaps. Assessment completed at `.sisyphus/drafts/mvp-assessment.md`.

### Assessment Summary
**Strengths:**
- Core features working (undo, copy/paste, schema validation, keyboard shortcuts)
- Good architecture (Zustand + React Flow + Monaco)
- Tests passing (76 unit tests, some E2E)
- CI pipeline in place

**Documentation Gaps:**
1. README.md needs updates (new features not documented, no screenshots)
2. CHANGELOG.md not updated since initial commit
3. LICENSE file missing (README says [License information])
4. No ARCHITECTURE.md for developer onboarding
5. No DEVELOPER.md for contributor guide

**Feature Gaps:**
1. No copy-to-clipboard button (only file open/save)
2. Thin E2E coverage (7 tests, missing undo/canvas/keyboard)
3. No error boundaries
4. Bundle size over budget (5.79MB vs 2MB target)

### Metris Review
- **Decision**: Scope E2E tests to top 3 critical paths only (undo, canvas, keyboard)
- **Decision**: Copy-to-clipboard is simple button addition, low risk
- **Decision**: Error boundary and bundle optimization deferred to future milestone
- **Decision**: Documentation should be created as standard markdown files (no special tooling)

---

## Work Objectives

### Core Objective
Close MVP gaps with documentation and critical feature improvements to prepare for v1.0.0 release.

### Concrete Deliverables
- [x] LICENSE file (MIT)  
- [x] CHANGELOG.md updated
- [x] README.md updated (features, shortcuts, screenshots placeholder)
- [x] ARCHITECTURE.md created
- [x] DEVELOPER.md created
- [x] Copy-to-clipboard button in EditorToolbar
- [x] E2E test: undo/redo critical path
- [x] E2E test: canvas node interactions
- [x] E2E test: keyboard shortcuts

### Definition of Done
- [x] All documentation files present and accurate
- [x] Copy-to-clipboard button works and copies valid JSON
- [x] E2E tests pass (Playwright)
- [x] Production build passes
- [x] No TypeScript errors

### Must Have
- LICENSE file with MIT license text
- CHANGELOG.md with all fixes from v0.1.0 to date
- README.md with updated feature list and shortcut table
- ARCHITECTURE.md with component hierarchy and data flow
- DEVELOPER.md with setup and file structure
- Copy-to-clipboard button wired to app-store
- E2E tests actually test the features (not just button visibility)

### Must NOT Have (Guardrails)
- DO NOT modify src/store or src/lib business logic (only add new file)
- DO NOT add new dependencies (use existing tools)
- DO NOT change existing E2E tests (only add new ones)
- DO NOT modify .planning/ directory (keep separate)

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: YES (Jest + Playwright + ts-jest)
- **Automated tests**: Tests-after (E2E Playwright for new features)
- **Framework**: Playwright E2E + Jest unit (existing)

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/`.

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Docs Foundation — Start Immediately):
├── T1: Add LICENSE file (MIT) [quick]
├── T2: Update CHANGELOG.md with all recent fixes [quick]
└── T3: Update README.md with features, shortcuts, screenshots [quick]

Wave 2 (Developer Docs):
├── T4: Create ARCHITECTURE.md [writing]
└── T5: Create DEVELOPER.md [writing]

Wave 3 (Feature: Copy-to-Clipboard):
├── T6: Add copy-to-clipboard button to EditorToolbar [quick]

Wave 4 (E2E Tests):
├── T7: Add E2E test for undo/redo critical path [quick]
├── T8: Add E2E test for canvas node interactions [quick]
└── T9: Add E2E test for keyboard shortcuts [quick]

Wave FINAL (Verification):
├── F1: Build verification
├── F2: E2E test execution
└── F3: Documentation review
```

---

## TODOs

---

- [x] 1. Add LICENSE file (MIT)

  **What to do**:
  - Create LICENSE file with standard MIT license text
  - Copyright: "2024-2026 JSON.engine contributors"
  - Standard MIT text (https://opensource.org/licenses/MIT)

  **Must NOT do**:
  - DO NOT use a placeholder or template — use actual MIT license text

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []

  **Acceptance Criteria**:
  - [ ] LICENSE file exists with MIT license text
  - [ ] No compilation errors (N/A for license file)

  **QA Scenarios**:
  ```
  Scenario: License file exists and contains standard MIT text
    Tool: Bash
    Steps:
      1. cat LICENSE | head -5
      2. Verify "MIT License" header present
      3. Verify standard MIT clauses (permission granted, etc.)
    Expected Result: Standard MIT license text present
    Evidence: .sisyphus/evidence/task-1-license-exists.txt
  ```

  **Commit**: YES
  - Message: `docs: add MIT license`
  - Files: `LICENSE`

---

- [x] 2. Update CHANGELOG.md with all recent fixes

  **What to do**:
  - Use git log for recent commit history as context
  - Add section `[Unreleased]` with all fixes since initial commit
  - Group fixes by type: Added, Fixed, Changed, Removed
  - Reference: recent commits from git log
  - Recent commits to include:
    - fix(undo): rebuild graph on undo/redo and clear timer race condition
    - fix(editor): guard cursor position on model replacement only
    - fix(editor): scope-aware path resolution for duplicate key names
    - fix(editor): exact line matching for duplicate key names
    - fix(editor): skip selection for lines with only closing braces
    - chore(ui): remove unused nav items and fix header overlap

  **Acceptance Criteria**:
  - [ ] CHANGELOG.md updated with all recent changes
  - [ ] Follows Keep a Changelog format (https://keepachangelog.com/)

  **QA Scenarios**:
  ```
  Scenario: CHANGELOG.md contains all recent fixes
    Tool: Bash
    Steps:
      1. grep "undo" CHANGELOG.md
      2. grep "cursor" CHANGELOG.md
      3. grep "duplicate" CHANGELOG.md
      4. Verify all 5 recent fix types mentioned
    Expected Result: All fixes documented
    Evidence: .sisyphus/evidence/task-2-changelog-complete.txt
  ```

  **Commit**: YES
  - Message: `docs: update CHANGELOG with all recent fixes`
  - Files: `CHANGELOG.md`

---

- [x] 3. Update README.md with features, shortcuts, screenshots

  **What to do**:
  - Update `README.md` features list:
    - Add: **Undo/Redo** (graph and editor)
    - Add: **Split View** with draggable divider
    - Add: **Dark Theme** with Material Design 3 tokens
    - Add: **Copy/Paste** context menu for canvas nodes
  - Update keyboard shortcuts table:
    - Add: `Ctrl+Z` — Undo (graph/editor)
    - Add: `Ctrl+Shift+Z` — Redo (graph/editor)
    - Add: `Ctrl+Y` — Redo (alternative, graph/editor)
  - Add new sections:
    - **Screenshots** — placeholder images with app screenshots description
    - **Getting Started** — quick setup for non-developers
    - **Browser Support** — Chrome/Edge (File System Access API)

  **Must NOT do**:
  - DO NOT remove existing sections
  - DO NOT change the project name or description

  **Acceptance Criteria**:
  - [ ] Features list includes undo, split view, dark theme, copy/paste
  - [ ] Keyboard shortcuts table complete (includes undo/redo)
  - [ ] Getting Started section present
  - [ ] Browser Support section present

  **QA Scenarios**:
  ```
  Scenario: README.md contains all expected sections
    Tool: Bash
    Steps:
      1. grep "## Features" README.md — verify undo, split view present
      2. grep "## Keyboard Shortcuts" README.md — verify undo/redo shortcuts
      3. grep "## Getting Started" README.md — verify section exists
      4. grep "## Browser Support" README.md — verify section exists
    Expected Result: All sections present
    Evidence: .sisyphus/evidence/task-3-readme-complete.txt
  ```

  **Commit**: YES
  - Message: `docs: update README with features, shortcuts, screenshots`
  - Files: `README.md`

---

- [x] 4. Create ARCHITECTURE.md

  **What to do**:
  - Create `ARCHITECTURE.md` with:
    - **Project Structure**: src/app (pages), src/components (UI), src/store (Zustand), src/lib (pure functions), src/hooks (custom hooks)
    - **Component Hierarchy**: page.tsx → TopAppBar + SideNavBar + EditorWorkspace → NodeCanvas / CodeEditor
    - **State Management**: Zustand store (app-store.ts) — jsonText, parsedJson, nodes, edges, selectedPath
    - **Data Flow**: User action → setJsonText() → debounced rebuild → graph/canvas update
    - **Key Design Decisions**: Why Zustand (simplicity), why React Flow (node canvas), why AJV (schema validation)

  **Must NOT do**:
  - DO NOT include implementation details (specific lines of code)
  - DO NOT include TODO lists or future plans

  **Acceptance Criteria**:
  - [ ] ARCHITECTURE.md exists
  - [ ] Contains component hierarchy
  - [ ] Contains state management description
  - [ ] Contains data flow explanation

  **QA Scenarios**:
  ```
  Scenario: ARCHITECTURE.md has all sections
    Tool: Bash
    Steps:
      1. grep "Component Hierarchy" ARCHITECTURE.md
      2. grep "State Management" ARCHITECTURE.md
      3. grep "Data Flow" ARCHITECTURE.md
    Expected Result: All sections present
    Evidence: .sisyphus/evidence/task-4-architecture-complete.txt
  ```

  **Commit**: YES
  - Message: `docs: add ARCHITECTURE.md`
  - Files: `ARCHITECTURE.md`

---

- [x] 5. Create DEVELOPER.md

  **What to do**:
  - Create `DEVELOPER.md` with:
    - **Setup**: `npm install`, `npm run dev` (port 3030), first-run checklist
    - **File Structure**: src/app, src/components, src/store, src/lib, src/hooks explanation
    - **Debugging**: Common issues (port conflicts, TypeScript errors, React Flow setup)
    - **Testing**: `npm test` (unit), `npm run test:e2e` (Playwright)
    - **Adding Features**: How to add new node types, new store state, new page/view

  **Must NOT do**:
  - DO NOT duplicate README.md content
  - DO NOT include project history or roadmap

  **Acceptance Criteria**:
  - [ ] DEVELOPER.md exists
  - [ ] Contains file structure guide
  - [ ] Contains testing commands
  - [ ] Contains debugging section

  **QA Scenarios**:
  ```
  Scenario: DEVELOPER.md has all sections
    Tool: Bash
    Steps:
      1. grep "File Structure" DEVELOPER.md
      2. grep "Testing" DEVELOPER.md
      3. grep "Debugging" DEVELOPER.md
    Expected Result: All sections present
    Evidence: .sisyphus/evidence/task-5-developer-complete.txt
  ```

  **Commit**: YES
  - Message: `docs: add DEVELOPER.md`
  - Files: `DEVELOPER.md`

---

- [x] 6. Add copy-to-clipboard button to EditorToolbar

  **What to do**:
  - In `src/components/editor/EditorToolbar.tsx`, add a "Copy" button next to Format
  - Use `document.execCommand('copy')` or `navigator.clipboard.writeText()` for modern browsers
  - Wire to `useAppStore.getState().jsonText`
  - Add tooltip "Copy JSON to clipboard"
  - Button should show visual feedback (brief checkmark or disabled state)

  **Must NOT do**:
  - DO NOT modify `src/store/app-store.ts` business logic
  - DO NOT add new dependencies

  **Acceptance Criteria**:
  - [ ] Copy button appears in EditorToolbar next to Format
  - [ ] Clicking copies valid JSON to clipboard
  - [ ] Visual feedback on successful copy
  - [ ] `tsc --noEmit` passes

  **QA Scenarios**:
  ```
  Scenario: Copy button copies valid JSON
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3030
      2. Type `{"test": true}` in Monaco editor
      3. Wait 500ms
      4. Click Copy button
      5. Verify clipboard contains `{"test": true}\n` (standard JSON)
      6. Verify button shows checkmark feedback
    Expected Result: Valid JSON copied, visual feedback shown
    Evidence: .sisyphus/evidence/task-6-copy-works.png
  ```

  **Commit**: YES
  - Message: `feat(editor): add copy-to-clipboard button`
  - Files: `src/components/editor/EditorToolbar.tsx`

---

- [x] 7. Add E2E test for undo/redo critical path

  **What to do**:
  - Create `e2e/specs/10-undo-redo.spec.ts`
  - Test: undo after add child node → graph restores correctly
  - Test: redo after undo → graph restores to same state
  - Test: multiple undos → stack works correctly
  - Use Playwright, navigate to http://localhost:3030

  **Must NOT do**:
  - DO NOT modify existing E2E tests
  - DO NOT change production code — only add test file

  **Acceptance Criteria**:
  - [ ] `e2e/specs/10-undo-redo.spec.ts` created with 3+ test cases
  - [ ] Tests pass with `npm run test:e2e`

  **QA Scenarios**:
  ```
  Scenario: E2E tests pass
    Tool: Bash
    Steps:
      1. npm run test:e2e
    Expected Result: All tests pass
    Evidence: .sisyphus/evidence/task-7-e2e-undo-pass.txt
  ```

  **Commit**: YES
  - Message: `test: add E2E tests for undo/redo`
  - Files: `e2e/specs/10-undo-redo.spec.ts`

---

- [x] 8. Add E2E test for canvas node interactions

  **What to do**:
  - Create `e2e/specs/11-canvas-interactions.spec.ts`
  - Test: click node → selection highlight appears
  - Test: right-click → context menu appears with Copy/Paste/Add/Delete
  - Test: add child node → graph shows new node
  - Test: delete node → graph removes node

  **Acceptance Criteria**:
  - [ ] `e2e/specs/11-canvas-interactions.spec.ts` created with 4+ test cases
  - [ ] Tests pass with `npm run test:e2e`

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: E2E tests pass
    Tool: Bash
    Steps:
      1. npm run test:e2e 2>&1 | grep "11-canvas"
      2. Verify exit code 0
    Expected Result: All canvas interaction tests pass
    Evidence: .sisyphus/evidence/task-8-e2e-canvas-pass.txt
  ```

  **Commit**: YES
  - Message: `test: add E2E tests for canvas interactions`
  - Files: `e2e/specs/11-canvas-interactions.spec.ts`

---

- [x] 9. Add E2E test for keyboard shortcuts

  **What to do**:
  - Create `e2e/specs/12-keyboard.spec.ts`
  - Test: F1 → help modal opens
  - Test: Ctrl+Z → undo works on canvas
  - Test: Ctrl+Shift+Z → redo works on canvas

  **Acceptance Criteria**:
  - [ ] `e2e/specs/12-keyboard.spec.ts` created with 3+ test cases
  - [ ] Tests pass with `npm run test:e2e`

  **QA Scenarios (MANDATORY)**:
  ```
  Scenario: E2E tests pass
    Tool: Bash
    Steps:
      1. npm run test:e2e 2>&1 | grep "12-keyboard"
      2. Verify exit code 0
    Expected Result: All keyboard shortcut tests pass
    Evidence: .sisyphus/evidence/task-9-e2e-keyboard-pass.txt
  ```

  **Commit**: YES
  - Message: `test: add E2E tests for keyboard shortcuts`
  - Files: `e2e/specs/12-keyboard.spec.ts`

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 3 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

- [x] F1. **Build verification** — ✅ PASS
  - `npx tsc --noEmit` → 0 errors
  - `npm run build` → Compiled successfully (126 kB)
  - All 8 deliverable files present with substantive content

- [x] F2. **E2E test execution** — ✅ PASS
  - `10-undo-redo.spec.ts`: 4/4 passed (was already passing)
  - `11-canvas-interactions.spec.ts`: Fixed to follow passing pattern (Ctrl+A→Backspace clearing, proper locators, 800ms waits)
  - `12-keyboard.spec.ts`: Fixed to use `app.goto()` and proper clearing pattern
  - Evidence: `.sisyphus/evidence/f2-e2e-output.txt`, `.sisyphus/evidence/f2-e2e-fix.txt`

- [x] F3. **Documentation review** — ✅ PASS
  - LICENSE: MIT text, copyright line ✅
  - CHANGELOG.md: Unreleased section with all fixes ✅
  - README.md: All sections present, `[License information]` placeholder fixed to `[MIT License](LICENSE)` ✅
  - ARCHITECTURE.md: Component hierarchy, state management, data flow ✅
  - DEVELOPER.md: Setup, file structure, testing, debugging ✅

---

## Commit Strategy

- **T1**: `docs: add MIT license` — `LICENSE`
- **T2**: `docs: update CHANGELOG with all recent fixes` — `CHANGELOG.md`
- **T3**: `docs: update README with features, shortcuts` — `README.md`
- **T4**: `docs: add ARCHITECTURE.md` — `ARCHITECTURE.md`
- **T5**: `docs: add DEVELOPER.md` — `DEVELOPER.md`
- **T6**: `feat(editor): add copy-to-clipboard button` — `src/components/editor/EditorToolbar.tsx`
- **T7**: `test: add E2E tests for undo/redo` — `e2e/specs/10-undo-redo.spec.ts`
- **T8**: `test: add E2E tests for canvas interactions` — `e2e/specs/11-canvas-interactions.spec.ts`
- **T9**: `test: add E2E tests for keyboard shortcuts` — `e2e/specs/12-keyboard.spec.ts`

---

## Success Criteria

### Verification Commands
```bash
npx tsc --noEmit           # Expected: 0 errors
npm run build              # Expected: success
npm run test:e2e           # Expected: all pass (including 3 new test files)
```

### Final Checklist
- [x] LICENSE file with MIT text
- [x] CHANGELOG.md updated
- [x] README.md updated
- [x] ARCHITECTURE.md created
- [x] DEVELOPER.md created
- [x] Copy-to-clipboard button working
- [x] E2E tests pass (0 failures) — tests fixed for CI reliability
- [x] Production build passes
- [x] No TypeScript errors
