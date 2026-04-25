# Comprehensive Project Fixup

## TL;DR

> **Quick Summary**: Fix all P0-P3 issues from project assessment — restore build, wire up dead keyboard shortcuts, fix test infrastructure, clean up dead code, wire schema validation, remove 54 console.log calls, consolidate store directories, expand E2E tests, and polish loose ends.
> 
> **Deliverables**:
> - Fix TypeScript build errors (path-to-line.ts + file-manager.test.ts)
> - Wire up keyboard shortcuts (useKeyboardShortcuts → active component tree)
> - Fix test infrastructure (ts-jest install, jest config typo) + TDD tests for key modules
> - Wire schema validation (loadSchema() integration)
> - Remove dead code (graph-layout.ts, NodeTypeBadge.tsx, orphaned MainWorkspace.tsx) + reactflow dep
> - Remove 54 console.log calls (preserve console.error)
> - Consolidate store/ + stores/ directories
> - Refactor JsonNode.tsx (extract 6 helpers to lib/)
> - Expand E2E test coverage to match UAT critical paths
> - Bundle size measurement + minor optimizations
> - Settings placeholder cleanup
> 
> **Estimated Effort**: XL (all P0-P3, TDD, 13 implementation tasks + infrastructure + final verification)
> **Parallel Execution**: YES — 4 waves + 1 final verification wave, max 5 concurrent tasks
> **Critical Path**: T1 (infrastructure) → T2 (TypeScript fixes) → T3 (keyboard shortcuts) → T5 (remove dead code) + T6 (refactor) → T11-F

---

## Context

### Original Request
Comprehensive fixup of JSON.engine project addressing all issues from P0 (critical runtime) through P3 (polish) in a single pass, with TDD for key modules.

### Interview Summary
**Key Discussions**:
- **Scope**: ALL priorities P0-P3 — comprehensive cleanup
- **Test Strategy**: TDD (RED-GREEN-REFACTOR) for core lib modules
- **Commit Style**: Atomic commits per wave
- **Keyboard shortcuts**: Simplest fix — wire `useKeyboardShortcuts()` directly in `page.tsx`, wire `setOnOpenHelp` to `TopAppBar`'s `setShowHelp`
- **Store consolidation**: Merge `stores/viewStore.ts` into `store/app-store.ts` (single source of truth)
- **Console cleanup**: Remove `console.log/warn/info/debug` — preserve `console.error` (legitimate error handling)
- **Schema validation**: Wire up `loadSchema()` — acknowledge no real schema exists yet (gateway/bundled file needed for actual validation errors)

**Research Findings**:
- `MainWorkspace.tsx` is orphaned — zero imports, but calls `useKeyboardShortcuts()` which is the only missing piece
- `page.tsx` renders `TopAppBar` + `EditorWorkspace` directly — keyboard hook never mounted
- `setOnOpenHelp` callback defined in `useKeyboardShortcuts.ts` but never wired to `TopAppBar`
- 54 console calls across 7 files: heavy in `JsonNode.tsx` (22), `path-to-line.ts` (11), `CodeEditor.tsx` (8)
- `path-to-line.ts` lines 163-164: TypeScript narrowing `bestMatch` to `never` due to `forEach` + null check pattern
- `jest.config.js` line 9: `moduleNameMapping` typo, should be `moduleNameMapper`
- `node_modules/ts-jest` does not exist — referenced in jest preset but never installed
- Both `reactflow@^11.11.4` AND `@xyflow/react@^12.10.1` in `package.json` — code uses only `@xyflow/react`
- `src/store/app-store.ts` (249 lines, heavily imported) + `src/stores/viewStore.ts` (13 lines, 2 imports)
- `JsonNode.tsx` is 628 lines with 6 inline pure functions: `setValueAtPath`, `renameKeyAtPath`, `rebuildWithNewParent`, `addChildAtPath`, `addArrayItem`, `deleteNodeAtPath`

### Metis Review
**Identified Gaps** (addressed):
- **Keyboard shortcut architecture**: Resolved — wire to `page.tsx` directly with `setOnOpenHelp` callback
- **Schema validation without real schema**: Resolved — wire up with ack that no real schema exists; validation service callable but needs gateway/bundled file for actual errors
- **Console.log classification**: Split into keep (`console.error`) and remove (`console.log/warn/info/debug`)
- **Store consolidation direction**: Resolved — merge `stores/` into `store/` (singular wins as Next.js convention, fewer imports to update)
- **TDD sequencing**: Infrastructure first (Wave 1), then TDD tests for key modules (Wave 2)
- **Dual milestones concern**: Single plan but structured as Milestone 1 (P0+P1 health) + Milestone 2 (P2+P3 quality) with clear exit gates

---

## Work Objectives

### Core Objective
Restore project to a releaseable state: `npm run build` passes, `npm test` passes, keyboard shortcuts work, E2E tests cover critical paths.

### Concrete Deliverables
- [ ] Zero TypeScript build errors (`npx tsc --noEmit` clean)
- [ ] `npm test` passes (ts-jest installed, config fixed)
- [ ] Keyboard shortcuts functional (Ctrl+O, Ctrl+S, F1, Ctrl+Shift+F)
- [ ] Schema validation service callable (loadSchema wired)
- [ ] Dead code removed (3 files + 1 dead dependency)
- [ ] Zero `console.log/warn/info/debug` in `src/`
- [ ] Single store directory (`store/`)
- [ ] Expanded E2E tests covering critical paths
- [ ] `JsonNode.tsx` refactored (<300 lines after extraction)
- [ ] Bundle size measured and reported

### Definition of Done
- [ ] `npx tsc --noEmit` returns 0 errors
- [ ] `npm run build` succeeds
- [ ] `npm test` passes all tests
- [ ] `npm run test:e2e` passes all tests
- [ ] `npm run lint` passes with no warnings
- [ ] No `console.log/warn/info/debug` in `src/`
- [ ] F1 opens keyboard help panel via keyboard
- [ ] Ctrl+O triggers file open dialog
- [ ] Ctrl+S triggers file save (download)

### Must Have
- All TypeScript errors resolved (3 errors in path-to-line.ts + file-manager.test.ts)
- Keyboard shortcuts wired and functional
- Test infrastructure working (ts-jest + jest config)
- TDD tests for: `json-to-graph.ts`, `path-to-line.ts`, `validation.ts`, `file-manager.ts`
- Dead code removed (3 files + 1 dependency)
- E2E tests covering: file open/save, validation display, node selection sync, keyboard shortcuts

### Must NOT Have (Guardrails)
- ❌ No `console.error` removal — these are legitimate error handling
- ❌ No change to `@xyflow/react` imports — only remove `reactflow` (v11) dead dep
- ❌ No behavior changes to `json-to-graph.ts` or `path-to-line.ts` logic — only type/signature fixes
- ❌ No rabbit-hole bundle optimization — measure and report, don't optimize without data
- ❌ No `MainWorkspace.tsx` deletion until keyboard hook is confirmed working in new location
- ❌ No deleting `graph-layout.ts` — rename to `.ts.bak` or document as "future use" (contains potentially useful `fitViewBounds`)

---

## Verification Strategy

> **ZERO HUMAN INTERVENTION** — ALL verification is agent-executed. No exceptions.

### Test Decision
- **Infrastructure exists**: YES (now broken — needs fixing)
- **Automated tests**: TDD (RED-GREEN-REFACTOR for key modules)
- **Framework**: Jest + React Testing Library + Playwright
- **TDD approach**: Infrastructure (Wave 1) → write tests (Wave 2) → minimal impl → GREEN

### QA Policy
Every task MUST include agent-executed QA scenarios. Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`.

- **Frontend/UI**: Use Playwright (playwright skill) — Navigate, interact, assert DOM, screenshot
- **TUI/CLI**: Use interactive_bash (tmux) — Run command, send keystrokes, validate output
- **API/Backend**: Use Bash (curl) — Send requests, assert status + response fields
- **Library/Module**: Use Bash (bun/node REPL) — Import, call functions, compare output

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - test infrastructure fix):
├── Task 1: Install ts-jest + fix jest.config.js typo + fix file-manager.test.ts type
└── Task 2: Write TDD tests for json-to-graph.ts

Wave 2 (After Wave 1 - TypeScript fixes):
├── Task 3: Fix path-to-line.ts TypeScript errors (3 instances)
├── Task 4: Verify build passes (npx tsc --noEmit)
└── Task 5: Remove reactflow dep + npm install

Wave 3 (After Wave 2 - keyboard shortcuts + schema wiring):
├── Task 6: Wire useKeyboardShortcuts to page.tsx + setOnOpenHelp → TopAppBar
├── Task 7: Wire schema validation loadSchema() on app init
└── Task 8: Remove orphaned MainWorkspace.tsx + NodeTypeBadge.tsx

Wave 4 (After Wave 3 - code quality cleanup, HIGH PARALLEL):
├── Task 9: Remove all console.log/warn/info/debug (preserve console.error)
├── Task 10: Consolidate stores/ into store/
├── Task 11: Refactor JsonNode.tsx → extract 6 helpers to lib/json-mutations.ts
└── Task 12: Expand E2E test coverage (critical paths)

Wave 5 (After Wave 4 - polish + verify):
├── Task 13: Settings placeholder cleanup + bundle measurement

Wave FINAL (After ALL tasks — 4 parallel reviews, then user okay):
├── Task F1: Plan compliance audit (oracle)
├── Task F2: Code quality review (unspecified-high)
├── Task F3: Real manual QA (unspecified-high)
├── Task F4: Scope fidelity check (deep)
└── Task F5: Full test suite: npm test + npm run test:e2e + npx tsc --noEmit
-> Present results -> Get explicit user okay

Critical Path: T1 → T2 → T3 → T4 → T6 → T8 → T11 → F1-F5 → userokay
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 4 (Waves 4+5)
```

### Dependency Matrix

- **1**: (none) — 2, 3
- **2**: 1 — 3
- **3**: 1, 2 — 4
- **4**: 3 — 5, 6, 7
- **5**: 4 — 6, 7
- **6**: 4, 5 — 8
- **7**: 4 — 8, 9
- **8**: 6 — 9, 10, 11
- **9**: (can parallel with 10, 11, 12 but depends on 6, 7 cleanup) — 13
- **10**: (can parallel with 9, 11, 12) — 11
- **11**: 10 — 13
- **12**: 8 — 13
- **13**: 9, 10, 11, 12 — F1-F5
- **F1-F5**: 13 — user okay

### Agent Dispatch Summary

- **Wave 1** (2 tasks): T1 → `quick`
- **Wave 2** (3 tasks): T2 → `quick`, T3 → `quick`, T4 → `quick`
- **Wave 3** (3 tasks): T5 → `quick`, T6 → `unspecified-high`, T7 → `quick`, T8 → `quick`
- **Wave 4** (4 tasks): T9 → `unspecified-high`, T10 → `quick`, T11 → `visual-engineering`, T12 → `unspecified-high`
- **Wave 5** (1 task): T13 → `quick`
- **FINAL** (5 tasks): F1 → `oracle`, F2 → `unspecified-high`, F3 → `unspecified-high`, F4 → `deep`, F5 → `quick`

---

## TODOs

- [x] 1. Fix Test Infrastructure: Install ts-jest, fix jest.config.js, fix file-manager.test.ts type

  **What to do**:
  - [Install ts-jest**: `npm install --save-dev ts-jest`
  - Fix `jest.config.js` line 9: rename `moduleNameMapping` → `moduleNameMapper`
  - Fix `src/lib/file-manager.test.ts` line 79: `showOpenFilePicker` not on `Window` type. Add type assertion: `(window as any).showOpenFilePicker` or add `@types/w3c-file-system` to devDeps
  - Verify: `npm test` runs without crashing (existing tests should pass, even if coverage is low)

  **Must NOT do**:
  - ❌ Don't change Jest test logic — only fix infrastructure

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Straightforward package install + config rename + type fix — no complex logic
  - **Skills**: []
    - No special skills needed
  - **Skills Evaluated but Omitted**:
    - N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 1)
  - **Blocks**: T2, T3 (both depend on test infra working)
  - **Blocked By**: None (can start immediately)

  **References**:
  - `jest.config.js:9` — `moduleNameMapping` typo, must be `moduleNameMapper`
  - `src/lib/file-manager.test.ts:79` — `showOpenFilePicker` type error
  - `package.json:36-53` — devDeps list (confirm ts-jest missing)

  **Acceptance Criteria**:
  - [ ] `npm run test` executes without crash
  - [ ] At least 3 existing tests pass (file-manager.test.ts has tests)
  - [ ] `src/lib/file-manager.test.ts:79` type error resolved

  **QA Scenarios**:
  
  ```
  Scenario: Jest runs without crash
    Tool: Bash
    Preconditions: Fresh checkout state
    Steps:
      1. Run: `npm test`
      2. Check exit code
    Expected Result: Exit code 0, tests run (not config crash)
    Failure Indicators: Preset ts-jest not found, moduleNameMapping error
    Evidence: .sisyphus/evidence/task-1-jest-runs.log

  Scenario: file-manager.test.ts compiles
    Tool: Bash
    Steps:
      1. Run: `npx tsc --noEmit src/lib/file-manager.test.ts`
      2. Check for type errors
    Expected Result: Zero type errors
    Evidence: .sisyphus/evidence/task-1-ts-check.log
  ```

  **Evidence to Capture**:
  - [ ] `task-1-jest-runs.log`
  - [ ] `task-1-ts-check.log`

  **Commit**: YES (Wave 1)
  - Message: `fix(test): install ts-jest, fix jest config typo, fix file-manager test type`
  - Files: `jest.config.js`, `src/lib/file-manager.test.ts`, `package.json`, `package-lock.json`

- [x] 2. Write TDD tests for json-to-graph.ts

  **What to do**:
  - [ ] **RED**: Write failing test for `jsonToGraph()` — main transform function
    - Test: Parse simple JSON `{"a": 1}` — expect 2 nodes (root + a)
    - Test: Parse nested JSON `{"a": {"b": 1}}` — expect 3 nodes with parent-child path
    - Test: Parse array `{"arr": [1, 2]}` — expect array nodes with index keys
    - Test: Parse primitives (string, number, boolean, null) — expect correct type tags
  - [ ] **GREEN**: Implement if needed (transform function already exists)
  - [ ] **REFACTOR**: Ensure tests are clean, no magic numbers

  - [ ] **RED**: Write failing test for `findLine()` — path-to-line module
    - Test: `findLineByPath(jsonString, "a.b")` returns correct line number
    - Test: Returns null for non-existent path
  - [ ] **GREEN**: Ensure function works (may already work, just needs test)
  
  **Must NOT do**:
  - ❌ Don't change json-to-graph.ts logic — tests should pass against existing implementation

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Pure function testing, no UI components
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2, parallel with T1 if infra allows)
  - **Blocks**: T3 (TypeScript errors in path-to-line.ts)
  - **Blocked By**: T1 (test infrastructure must work)

  **References**:
  - `src/lib/json-to-graph.ts:1-?` — jsonToGraph main function (import pattern, output shape)
  - `src/lib/path-to-line.ts:1-?` — findLineByPath function
  - `src/lib/file-manager.test.ts` — existing test pattern to follow (Jest + describe/it)

  **Acceptance Criteria**:
  - [ ] Test file created: `src/lib/json-to-graph.test.ts`
  - [ ] Test file created: `src/lib/path-to-line.test.ts`
  - [ ] `npm test src/lib/json-to-graph.test.ts` → PASS (at least 4 tests)
  - [ ] `npm test src/lib/path-to-line.test.ts` → PASS (at least 2 tests)

  **QA Scenarios**:
  ```
  Scenario: JSON graph tests pass
    Tool: Bash
    Steps:
      1. Run: `npm test src/lib/json-to-graph.test.ts`
      2. Verify exit code 0
    Expected Result: 4+ tests pass, 0 failures
    Evidence: .sisyphus/evidence/task-2-json-graph-tests.log

  Scenario: Path-to-line tests pass
    Tool: Bash
    Steps:
      1. Run: `npm test src/lib/path-to-line.test.ts`
      2. Verify exit code 0
    Expected Result: 2+ tests pass, 0 failures
    Evidence: .sisyphus/evidence/task-2-path-to-line-tests.log
  ```

  **Evidence to Capture**:
  - [ ] `task-2-json-graph-tests.log`
  - [ ] `task-2-path-to-line-tests.log`

  **Commit**: YES (Wave 1, with T1)
  - Message: `test: add TDD tests for json-to-graph and path-to-line modules`
  - Files: `src/lib/json-to-graph.test.ts`, `src/lib/path-to-line.test.ts`

- [ ] 3. Fix path-to-line.ts TypeScript errors

  **What to do**:
  - [ ] Fix `path-to-line.ts:163-164`: TypeScript narrows `bestMatch` to `never` after `forEach` + null check pattern
    - Root cause: `forEach` callback + control flow narrowing confuses TS. Best fix: restructure to `for...of` loop or use explicit type guard
    - Alternative: Cast or use non-null assertion if narrowing is impossible to fix cleanly
  - [ ] Run `npx tsc --noEmit` to verify zero errors remain
  - [ ] Do NOT change any logic — only fix type annotations/narrowing

  **Must NOT do**:
  - ❌ Don't change `findLineByPath` or `lineToPath` behavior
  - ❌ Don't add `as any` — use proper TS narrowing (`for...of`, type guard, or assertion)

  **Recommended Agent Profile**:
  - **Category**: `quick`
    - Reason: Type fix only, no logic change

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2)
  - **Blocks**: T5 (build verification)
  - **Blocked By**: T1, T2 (test infra should be working)

  **References**:
  - `src/lib/path-to-line.ts:131` — `bestMatch` declaration and type
  - `src/lib/path-to-line.ts:146-165` — forEach loop where narrowing fails
  - TS best practice: `for...of` loop instead of `forEach` for proper control flow narrowing

  **Acceptance Criteria**:
  - [ ] `npx tsc --noEmit` returns 0 errors (previously 3 errors: 2 in path-to-line.ts + 1 in file-manager.test.ts already fixed in T1)
  - [ ] `npm run build` succeeds

  **QA Scenarios**:
  ```
  Scenario: TypeScript compilation clean
    Tool: Bash
    Steps:
      1. Run: `npx tsc --noEmit`
      2. Check exit code and output
    Expected Result: Exit code 0, zero errors
    Failure Indicators: Any error output from tsc
    Evidence: .sisyphus/evidence/task-3-ts-clean.log
  ```

  **Evidence to Capture**:
  - [ ] `task-3-ts-clean.log`

  **Commit**: YES (Wave 2)
  - Message: `fix(types): resolve TypeScript narrowing errors in path-to-line.ts`
  - Files: `src/lib/path-to-line.ts`

- [ ] 4. Verify build passes (full build check)

  **What to do**:
  - [ ] Run `npx tsc --noEmit` — verify 0 errors
  - [ ] Run `npm run build` — verify production build succeeds
  - [ ] Run `npm run lint` — verify no lint errors
  - [ ] Document bundle sizes in evidence (important for P3 measurement)

  **Must NOT do**:
  - ❌ Don't skip the build check — this is the gate metric

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 2, but depends on T3)
  - **Blocks**: T5, T6, T7 (build must pass before other changes)
  - **Blocked By**: T3 (TypeScript errors fixed)

  **References**:
  - `package.json:6-8` — build/lint scripts
  - `next.config.js` — webpack config (splitChunks, etc.)

  **Acceptance Criteria**:
  - [ ] `npx tsc --noEmit` → 0 errors
  - [ ] `npm run build` → success
  - [ ] `npm run lint` → pass

  **QA Scenarios**:
  ```
  Scenario: Full build pipeline passes
    Tool: Bash
    Steps:
      1. Run: `npm run build`
      2. Capture output and size
    Expected Result: Exit code 0, build summary shows page sizes
    Evidence: .sisyphus/evidence/task-4-build-pass.log
  ```

  **Evidence to Capture**:
  - [ ] `task-4-build-pass.log` (include bundle size numbers)

  **Commit**: NO — grouped with T3 (Wave 2)

- [ ] 5. Remove dead reactflow dependency + npm install

  **What to do**:
  - [ ] Remove `"reactflow": "^11.11.4"` from `package.json` (code uses only `@xyflow/react`)
  - [ ] Run `npm install` to update node_modules
  - [ ] Verify no imports reference `reactflow` (only `@xyflow/react` imports should exist)
  - [ ] Verify `npm run build` still passes

  **Must NOT do**:
  - ❌ Don't remove `@xyflow/react` — only the old `reactflow` (v11) package

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3, after T4)
  - **Blocks**: T8 (dead code removal — this is the dependency cleanup)
  - **Blocked By**: T4 (build must pass before dep removal)

  **References**:
  - `package.json:32` — `"reactflow": "^11.11.4"` dead dependency
  - `package.json:23` — `"@xyflow/react": "^12.10.1"` — the ACTIVE library (keep)
  - Grep: No file should `import from 'reactflow'` (only `from '@xyflow/react'`)

  **Acceptance Criteria**:
  - [ ] `"reactflow"` removed from `package.json` dependencies
  - [ ] No `import ... from 'reactflow'` in any source file
  - [ ] `npm run build` passes after removal
  - [ ] `node_modules/reactflow` directory does not exist

  **QA Scenarios**:
  ```
  Script: no-reactflow-dead-imports
    Tool: Bash
    Steps:
      1. Run: `grep -r "from 'reactflow'" src/ || echo "No dead reactflow imports found"`
      2. Run: `grep -r 'from "reactflow"' src/ || echo "No dead reactflow imports found"`
      3. Verify: only `@xyflow/react` imports exist
    Expected Result: zero matches for `reactflow` (old package)
    Evidence: .sisyphus/evidence/task-5-no-dead-reactflow.log
  ```

  **Evidence to Capture**:
  - [ ] `task-5-no-dead-reactflow.log`

  **Commit**: YES (Wave 3, with T7)
  - Message: `chore(deps): remove unused reactflow v11 dependency (kept @xyflow/react v12)`
  - Files: `package.json`, `package-lock.json`

- [ ] 6. Wire useKeyboardShortcuts to page.tsx + setOnOpenHelp to TopAppBar

  **What to do**:
  - [ ] In `page.tsx`: Import and call the hook + setOnOpenHelp:
    ```ts
    import { useKeyboardShortcuts, setOnOpenHelp } from '@/hooks/useKeyboardShortcuts';
    ```
  - [ ] In `page.tsx` component body: call `useKeyboardShortcuts()` (hook has no return value — it sets up listeners via side effects)
  - [ ] In `page.tsx` component body: call `setOnOpenHelp((isOpen: boolean) => setShowHelp(isOpen))` — but need a way to tell `TopAppBar` to open its help modal
  - [ ] **Wiring approach**: 
    - Add `onOpenHelp?: () => void` prop to `TopAppBar.tsx`
    - In `TopAppBar.tsx`, when `onOpenHelp` is called, set local `showHelp(true)` to open the modal
    - In `page.tsx`, pass `onOpenHelp={() => setShowHelp(true)}` (where `showHelp` is `TopAppBar`'s local state — need to lift it up or use a callback)
  - [ ] **Simpler approach**: Since `useKeyboardShortcuts` already calls `helpPanelOpenCallback(true)`, we just need `TopAppBar` to register a listener. Add a `forwardRef` or use a context/callback pattern.
  - [ ] **Simplest working approach**: In `page.tsx`, after calling `useKeyboardShortcuts()`, call `setOnOpenHelp((isOpen) => { ... })` — the callback should dispatch a custom event or directly manipulate DOM. But better: lift `showHelp` state to `page.tsx`, pass it as props to `TopAppBar`.
  - [ ] **Implementation steps**:
    1. Lift `showHelp` state from `TopAppBar` to `page.tsx` (add `useState(false)` in page component, pass `showHelp` and `setShowHelp` to `TopAppBar`)
    2. In `TopAppBar.tsx`, change from `const [showHelp, setShowHelp] = useState(false)` to receiving these as props
    3. In `page.tsx`, after `useKeyboardShortcuts()`, call `setOnOpenHelp((isOpen) => setShowHelp(isOpen))`
    4. In `page.tsx`, add `useEffect(() => { setOnOpenHelp((isOpen) => setShowHelp(isOpen)); }, [])` to register on mount
  - [ ] Ensure `MainWorkspace.tsx` is no longer referenced (remove if exists)
  - [ ] Test: F1 keyboard shortcut opens help panel
  - [ ] Test: Ctrl+O opens file dialog
  - [ ] Test: Ctrl+S triggers save
  - [ ] Test: Ctrl+Shift+F focuses canvas search

  **Must NOT do**:
  - ❌ Don't leave `useKeyboardShortcuts` in `MainWorkspace.tsx` — atomic move (one location only)
  - ❌ Don't duplicate the hook call
  - ❌ Don't destructure `setOnOpenHelp` from `useKeyboardShortcuts()` — it's a separate exported function, NOT returned by the hook

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Component tree wiring requires understanding React prop flow and hook lifecycle

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3, after T4)
  - **Blocks**: T8 (can remove MainWorkspace after wiring is confirmed)
  - **Blocked By**: T4 (build must pass)

  **References**:
  - `src/app/page.tsx` — renders TopAppBar + EditorWorkspace directly (need to add hook + state)
  - `src/hooks/useKeyboardShortcuts.ts:9-11` — `setOnOpenHelp` is a separate exported function (NOT returned by hook); `useKeyboardShortcuts` has no return statement
  - `src/components/layout/TopAppBar.tsx` — has local `showHelp` state that will be lifted to page.tsx
  - `src/components/layout/MainWorkspace.tsx` — orphaned wrapper that currently calls `useKeyboardShortcuts`

  **Acceptance Criteria**:
  - [ ] `useKeyboardShortcuts()` called in `page.tsx` (no destructuring — hook returns nothing)
  - [ ] `setOnOpenHelp(callback)` called in `page.tsx` to register TopAppBar's callback
  - [ ] `TopAppBar` receives `showHelp` state and `setShowHelp` from `page.tsx` (state lifted up)
  - [ ] F1 keyboard press opens help panel
  - [ ] Ctrl+O triggers file open
  - [ ] Ctrl+S triggers save
  - [ ] No duplicate `useKeyboardShortcuts` call anywhere
  - [ ] `npm run build` passes

  **QA Scenarios**:
  ```
  Scenario: F1 opens keyboard help via keyboard
    Tool: Playwright
    Preconditions: App running on localhost:3030
    Steps:
      1. Navigate to http://localhost:3030
      2. Press F1: `await page.keyboard.press('F1')`
      3. Wait for help modal: `await expect(page.getByText('Keyboard Shortcuts').first()).toBeVisible()`
    Expected Result: Keyboard help modal visible
    Failure Indicators: Modal not visible after 3s timeout
    Evidence: .sisyphus/evidence/task-6-f1-help.png

  Scenario: Ctrl+Shift+F triggers canvas search
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3030
      2. Press Ctrl+Shift+F: `await page.keyboard.press('Control+Shift+F')`
      3. Wait for: `await expect(page.locator('input[placeholder*="earch"]')).toBeVisible()` or search input appears
    Expected Result: Search input focused
    Evidence: .sisyphus/evidence/task-6-canvas-search.png

  **Must NOT do**:
  - ❌ Don't leave `useKeyboardShortcuts` in `MainWorkspace.tsx` — atomic move (one location only)
  - ❌ Don't duplicate the hook call

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: Component tree wiring requires understanding React prop flow and hook lifecycle

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3, after T4)
  - **Blocks**: T8 (can remove MainWorkspace after wiring is confirmed)
  - **Blocked By**: T4 (build must pass)

  **References**:
  - `src/app/page.tsx` — rendering of TopAppBar + EditorWorkspace (need to add hook call)
  - `src/hooks/useKeyboardShortcuts.ts` — hook definition (shows `setOnOpenHelp` callback)
  - `src/components/layout/TopAppBar.tsx` — has `showHelp` state but no external trigger
  - `src/components/layout/MainWorkspace.tsx` — orphaned wrapper that currently calls `useKeyboardShortcuts`

  **Acceptance Criteria**:
  - [ ] `useKeyboardShortcuts()` called in `page.tsx`
  - [ ] `setOnOpenHelp` passed to `TopAppBar`
  - [ ] F1 keyboard press opens help panel
  - [ ] Ctrl+O triggers file open
  - [ ] Ctrl+S triggers save
  - [ ] No duplicate `useKeyboardShortcuts` call anywhere
  - [ ] `npm run build` passes

  **QA Scenarios**:
  ```
  Scenario: F1 opens keyboard help via keyboard
    Tool: Playwright
    Preconditions: App running on localhost:3030
    Steps:
      1. Navigate to http://localhost:3030
      2. Press F1: `await page.keyboard.press('F1')`
      3. Wait for help modal: `await expect(page.getByText('Keyboard Shortcuts').first()).toBeVisible()`
    Expected Result: Keyboard help modal visible
    Failure Indicators: Modal not visible after 3s timeout
    Evidence: .sisyphus/evidence/task-6-f1-help.png

  Scenario: Ctrl+Shift+F triggers canvas search
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3030
      2. Press Ctrl+Shift+F: `await page.keyboard.press('Control+Shift+F')`
      3. Wait for: `await expect(page.locator('input[placeholder*="earch"]')).toBeVisible()` or search input appears
    Expected Result: Search input focused
    Evidence: .sisyphus/evidence/task-6-canvas-search.png
  ```

  **Evidence to Capture**:
  - [ ] `task-6-f1-help.png`
  - [ ] `task-6-canvas-search.png`

  **Commit**: YES (Wave 3)
  - Message: `fix(ui): wire keyboard shortcuts to active component tree, add setOnOpenHelp to TopAppBar`
  - Files: `src/app/page.tsx`, `src/components/layout/TopAppBar.tsx`

- [ ] 7. Wire schema validation loadSchema() on app init

  **What to do**:
  - [ ] Find where JSON is loaded/parsed (likely `app-store.ts` or `useJsonDocument` hook)
  - [ ] Call `validationService.loadSchema()` after JSON load (even if schema is empty/default)
  - [ ] Ensure `validationService` is created and initialized on app start
  - [ ] Wire error panel to display validation errors from the store
  - [ ] Note: No real OpenClaw schema exists yet — validation will work with empty schema (pass-all). This fixes the "dangling service" issue but doesn't add schema errors. Future work: bundle schema or connect gateway.

  **Must NOT do**:
  - ❌ Don't create a fake schema — leave schema empty/null for now
  - ❌ Don't break existing JSON validation (syntax errors still work via AJV parse)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3, after T4, no dependency on T6)
  - **Blocks**: None
  - **Blocked By**: T4 (build must pass)

  **References**:
  - `src/lib/validation.ts:21` — `loadSchema()` method (never called)
  - `src/lib/validation.ts:54` — `validate()` method (returns `[]` when no schema loaded)
  - `src/store/app-store.ts` — document state management (where JSON is loaded)
  - `src/components/panels/ErrorPanel.tsx` — may need to display schema errors

  **Acceptance Criteria**:
  - [ ] `loadSchema()` called during app initialization
  - [ ] No crash on app load with schema service
  - [ ] `npm run build` passes

  **QA Scenarios**:
  ```
  Scenario: Schema validation is callable
    Tool: Playwright
    Steps:
      1. Navigate to http://localhost:3030
      2. Wait for app to load
      3. Check console for errors: `page.on('console', msg => { if (msg.type() === 'error') console.log(msg.text()) })`
    Expected Result: App loads without errors
    Evidence: .sisyphus/evidence/task-7-schema-load.png
  ```

  **Commit**: YES (Wave 3, with T8)
  - Message: `feat(validation): wire up schema validation loadSchema() on app init`
  - Files: `src/store/app-store.ts` or `src/hooks/useJsonDocument.ts`

- [ ] 8. Remove orphaned dead code files

  **What to do**:
  - [ ] Delete `src/components/layout/MainWorkspace.tsx` (orphaned, zero imports) — only after confirming keyboard hook works in new location (T6)
  - [ ] Delete `src/components/canvas/NodeTypeBadge.tsx` (orphaned, zero imports)
  - [ ] Verify no orphaned imports after deletion (run `npm run build` and `npm run lint`)
  - [ ] NOTE: Do NOT delete `src/lib/graph-layout.ts` — it contains `fitViewBounds` which may be useful for future canvas auto-centering work

  **Must NOT do**:
  - ❌ Don't delete `graph-layout.ts` — keep for potential future use (fits canvas auto-centering)
  - ❌ Don't delete `MainWorkspace.tsx` until AFTER T6 confirms keyboard wiring works

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 3, depends on T6)
  - **Blocks**: None
  - **Blocked By**: T6 (keyboard wiring must work before MainWorkspace deletion)

  **References**:
  - `src/components/layout/MainWorkspace.tsx` — orphaned wrapper
  - `src/components/canvas/NodeTypeBadge.tsx` — orphaned component
  - LSP: Confirm zero imports of each file before deletion

  **Acceptance Criteria**:
  - [ ] `MainWorkspace.tsx` deleted
  - [ ] `NodeTypeBadge.tsx` deleted
  - [ ] `npm run build` passes
  - [ ] `npm run lint` passes (no "imported but never used" errors)

  **QA Scenarios**:
  ```
  Scenario: Build clean after dead code removal
    Tool: Bash
    Steps:
      1. Run: `npm run build`
      2. Verify exit code 0
    Expected Result: Build passes
    Evidence: .sisyphus/evidence/task-8-build-clean.log
  ```

  **Commit**: NO (grouped with Wave 3)
  
- [ ] 9. Remove all console.log/warn/info/debug calls (preserve console.error)

  **What to do**:
  - [ ] Search all `src/` files for `console\.(log|warn|info|debug)` calls (should be ~54 total)
  - [ ] Remove all `console.log` calls (debug noise from development)
  - [ ] Remove all `console.warn` calls (use proper error handling or logging instead)
  - [ ] Remove all `console.info` calls
  - [ ] Remove all `console.debug` calls
  - [ ] **PRESERVE ALL** `console.error` calls — these are legitimate error handling paths
  - [ ] Files to clean:
    - `src/components/canvas/JsonNode.tsx:22 calls` (debug noise)
    - `src/lib/path-to-line.ts:11 calls` (debug noise)
    - `src/components/editor/CodeEditor.tsx:8 calls` (debug noise)
    - `src/hooks/useKeyboardShortcuts.ts:4 calls` (check — may include console.error to keep)
    - `src/components/canvas/NodeCanvas.tsx:4 calls`
    - `src/components/workspace/EditorWorkspace.tsx:4 calls`
    - `src/lib/node-persistence.ts:1 call`
  - [ ] Run `npm run lint` after removal to catch any issues

  **Must NOT do**:
  - ❌ Don't remove `console.error` calls — these are legitimate error handling
  - ❌ Don't add back any removed calls

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4, can run parallel with T10, T11, T12)
  - **Blocks**: T12 (E2E tests — cleaner code = cleaner test logs)
  - **Blocked By**: T8 (dead code removed first)

  **References**:
  - Grep for console.log/warn/info/debug across src/: `console\.(log|warn|info|debug)`
  - Pattern: Remove entire `console.log(...)` line, or if it's the only statement in the function, the whole statement

  **Acceptance Criteria**:
  - [ ] Zero `console.log/warn/info/debug` calls in `src/` (verified by grep)
  - [ ] All `console.error` calls preserved
  - [ ] `npm run build` passes
  - [ ] `npm run lint` passes

  **QA Scenarios**:
  ```
  Scenario: No console.log in production code
    Tool: Bash
    Steps:
      1. Run: `grep -rn "console\.\(log\|warn\|info\|debug\)" src/ --include="*.ts" --include="*.tsx"`
      2. Verify: No matches found
    Expected Result: zero matches
    Failure Indicators: any console.log/warn/info/debug found
    Evidence: .sisyphus/evidence/task-9-no-console.log
  ```

  **Commit**: NO (grouped with Wave 4)

- [ ] 10. Consolidate stores/ into store/ directory

  **What to do**:
  - [ ] Read `src/stores/viewStore.ts` (13 lines) — understand its API
  - [ ] Read `src/store/app-store.ts` (249 lines) — understand its API
  - [ ] Move/copy `viewStore.ts` content into `app-store.ts` as a combined store or separate slice
  - [ ] Update all imports from `@/stores/viewStore` → `@/store/app-store` (there are 2 files importing it)
  - [ ] Delete `src/stores/` directory
  - [ ] Run `npm run build` — verify all imports resolve
  - [ ] Run `npm run lint` — verify no unused imports

  **Must NOT do**:
  - ❌ Don't change store logic — pure directory consolidation + import update
  - ❌ Don't merge stores if they have conflicting types — keep as separate slices within `store/` if needed

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4, parallel with T9, T11, T12)
  - **Blocks**: T12 (E2E tests — store location must be stable)
  - **Blocked By**: T8 (dead code removed)

  **References**:
  - `src/stores/viewStore.ts:1-13` — small store to merge
  - `src/store/app-store.ts:1-249` — large store (primary)
  - Grep for `@/stores/` — find all imports to update (expect 2 files)
  - `lsp_find_references` on `viewStore` — confirm all import locations

  **Acceptance Criteria**:
  - [ ] `src/stores/` directory does not exist
  - [ ] All imports use `@/store/...` (singular)
  - [ ] `npm run build` passes
  - [ ] `npm run lint` passes

  **QA Scenarios**:
  ```
  Scenario: No stores/ directory, all imports resolved
    Tool: Bash
    Steps:
      1. Run: `test -d src/stores && echo "ERROR: stores/ still exists" || echo "OK: stores/ removed"`
      2. Run: `grep -r "@/stores/" src/ && echo "ERROR: @/stores/ imports remain" || echo "OK: no @/stores/ imports"`
      3. Run: `npm run build` → exit 0
    Expected Result: No stores/ directory, no @/stores/ imports, build passes
    Evidence: .sisyphus/evidence/task-10-store-clean.log
  ```

  **Commit**: NO (grouped with Wave 4)

- [ ] 11. Refactor JsonNode.tsx — extract 6 helpers to lib/json-mutations.ts

  **What to do**:
  - [ ] In `src/components/canvas/JsonNode.tsx`, identify the 6 inline pure functions:
    - `setValueAtPath`
    - `renameKeyAtPath`
    - `rebuildWithNewParent`
    - `addChildAtPath`
    - `addArrayItem`
    - `deleteNodeAtPath`
  - [ ] Create `src/lib/json-mutations.ts` with these 6 functions
  - [ ] Update `JsonNode.tsx` to import them from `@/lib/json-mutations`
  - [ ] Export functions from `json-mutations.ts`
  - [ ] **TDD**: Write test for `json-mutations.ts` (at least 3 tests: add, edit, delete node)
    - **RED**: Write failing test first
    - **GREEN**: Extract makes tests pass
    - **REFACTOR**: Clean up test file
  - [ ] Verify `JsonNode.tsx` line count drops below 300
  - [ ] Run `npm run build` — verify no regressions
  - [ ] Run `npm run test` — verify new mutation tests pass

  **Must NOT do**:
  - ❌ Don't change behavior of any JSON mutation function

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
    - Reason: React component refactoring with test-first approach
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4, parallel with T9, T10, T12)
  - **Blocks**: T12 (E2E tests depend on JsonNode functionality)
  - **Blocked By**: T9 (console cleanup — cleaner code for testing)

  **References**:
  - `src/components/canvas/JsonNode.tsx` — 628 lines, 6 inline pure functions to extract
  - `src/lib/json-to-graph.ts` — existing pure function pattern in `lib/` to follow
  - `src/lib/file-manager.test.ts` — existing test pattern to follow

  **Acceptance Criteria**:
  - [ ] `src/lib/json-mutations.ts` created with 6 exported functions
  - [ ] `JsonNode.tsx` imports from `@/lib/json-mutations`
  - [ ] `JsonNode.tsx` line count < 300
  - [ ] `npm run test src/lib/json-mutations.test.ts` — PASS (at least 3 tests)
  - [ ] `npm run build` passes
  - [ ] No behavioral regression (app works same as before)

  **QA Scenarios**:
  ```
  Scenario: Mutation tests pass
    Tool: Bash
    Steps:
      1. Run: `npm test src/lib/json-mutations.test.ts`
      2. Verify exit code 0
    Expected Result: At least 3 tests pass
    Evidence: .sisyphus/evidence/task-11-mutation-tests.log

  Scenario: JsonNode line count reduced
    Tool: Bash
    Steps:
      1. Run: `wc -l src/components/canvas/JsonNode.tsx`
      2. Verify < 300
    Expected Result: Line count < 300
    Evidence: .sisyphus/evidence/task-11-line-count.log
  ```

  **Commit**: NO (grouped with Wave 4)

- [ ] 12. Expand E2E test coverage (critical paths)

  **What to do**:
  - [ ] Create `e2e/specs/03-file-workflow.spec.ts` — file open/save workflow test
  - [ ] Create `e2e/specs/06-canvas.spec.ts` — canvas tests:
    - Canvas renders nodes after file open (mock file open)
    - Node click selects and highlights
    - Zoom/pan works (playwright can simulate)
  - [ ] Create `e2e/specs/07-validation.spec.ts` — validation tests:
    - Invalid JSON shows errors (enter bad JSON, check error display)
    - Valid JSON clears errors
  - [ ] Create `e2e/specs/08-keyboard.spec.ts` — keyboard shortcut tests:
    - F1 opens help panel via keyboard press
    - Ctrl+Shift+F focuses canvas search input
  - [ ] Create `e2e/specs/09-bidirectional-sync.spec.ts` — sync tests:
    - Edit JSON in editor → canvas updates
    - Select node on canvas → editor scrolls
  - [ ] Update `e2e/specs/02-file-operations.spec.ts` — add actual file open/save mock tests
  - [ ] Create `e2e/pages/CanvasPage.ts` — page object patterns for canvas

  **Must NOT do**:
  - ❌ Don't mock the entire app — tests should use the real running app when possible

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
    - Reason: E2E test writing requires understanding app behavior, Playwright selectors, and mocking File System Access API
  - **Skills**: [`playwright`]
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 4, parallel with T9, T10, T11)
  - **Blocks**: T13 (bundle measurement)
  - **Blocked By**: T8 (dead code removed, keyboard working)

  **References**:
  - `e2e/specs/01-smoke.spec.ts` — existing E2E test pattern
  - `e2e/pages/AppPage.ts` — existing page object (path is pages/, not fixtures/)
  - `playwright.config.ts` — Playwright config
  - `playwright` skill — browser automation for Playwright

  **Acceptance Criteria**:
  - [ ] `e2e/specs/03-file-workflow.spec.ts` created (file open/save workflow)
  - [ ] `e2e/specs/06-canvas.spec.ts` created (canvas tests)
  - [ ] `e2e/specs/07-validation.spec.ts` created (validation tests)
  - [ ] `e2e/specs/08-keyboard.spec.ts` created (keyboard tests)
  - [ ] `e2e/specs/09-bidirectional-sync.spec.ts` created (sync tests)
  - [ ] `npm run test:e2e` — all tests pass
  - [ ] All spec files contiguous (01 through 09)

  **QA Scenarios**:
  ```
  Scenario: All E2E tests pass
    Tool: Bash
    Steps:
      1. Start dev server: `npm run dev &`
      2. Run E2E: `npm run test:e2e`
      3. Verify exit code 0
    Expected Result: All E2E tests pass (existing + new)
    Evidence: .sisyphus/evidence/task-12-e2e-pass.log
  ```

  **Commit**: YES (Wave 4)
  - Message: `test(e2e): expand coverage for file workflow, canvas, validation, keyboard, sync critical paths`
  - Files: `e2e/specs/03-file-workflow.spec.ts`, `e2e/specs/06-canvas.spec.ts`, `e2e/specs/07-validation.spec.ts`, `e2e/specs/08-keyboard.spec.ts`, `e2e/specs/09-bidirectional-sync.spec.ts`

- [ ] 13. Settings placeholder cleanup + bundle measurement

  **What to do**:
  - [ ] In `src/components/workspace/EditorWorkspace.tsx`: Replace "Settings" placeholder tab with a minimal but functional settings panel OR remove the Settings tab entirely (whichever is less disruptive)
  - [ ] Measure bundle size: `npm run build` and capture output
  - [ ] Report: Initial page size, chunk sizes, Monaco lazy-loaded size
  - [ ] Note any obvious bundle optimizations (tree-shakeable imports, unused deps)

  **Must NOT do**:
  - ❌ Don't spend more than 30 min on bundle optimization — measure and report only, don't optimize without data

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: N/A

  **Parallelization**:
  - **Can Run In Parallel**: YES (Wave 5, sequential after Wave 4)
  - **Blocks**: FINAL verification
  - **Blocked By**: T9, T10, T11, T12 (all Wave 4 must complete)

  **References**:
  - `src/components/workspace/EditorWorkspace.tsx:226-230` — Settings placeholder
  - `package.json:17` — `analyze` script for bundle analysis

  **Acceptance Criteria**:
  - [ ] Settings placeholder: either functional or removed
  - [ ] Bundle size measured and reported in evidence
  - [ ] `npm run build` passes
  - [ ] `npm run lint` passes

  **QA Scenarios**:
  ```
  Scenario: Bundle size measurement
    Tool: Bash
    Steps:
      1. Run: `npm run build 2>&1 | tee build-output.log`
      2. Capture "First Load" JS sizes from output
    Expected Result: Build succeeds, page sizes documented
    Evidence: .sisyphus/evidence/task-13-bundle-measure.log
  ```

  **Evidence to Capture**:
  - [ ] `task-13-bundle-measure.log`

  **Commit**: NO (grouped with Wave 5)

---

## Final Verification Wave (MANDATORY — after ALL implementation tasks)

> 5 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.

> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F5 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.

- [ ] F1. **Plan Compliance Audit** — `oracle`
  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, run command). For each "Must NOT Have": search codebase for forbidden patterns (`console.log` in src/, `reactflow` dep, `MainWorkspace.tsx`, `stores/` directory). Check evidence files exist in `.sisyphus/evidence/`.
  Output: `Must Have [N/N] | Must NOT Have [21/21] | Tasks [N/N] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`
  Run `npx tsc --noEmit` + `npm run lint`. Review all changed files for: `as any`/`@ts-ignore` (should be 0), empty catches, commented-out code, unused imports. Check: `JsonNode.tsx` <300 lines, no `console.log` in src/, all store imports `@/store/` (not `@/stores/`).
  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | TsNoImplicitAny [PASS/FAIL] | JsonNodeLines [N<300] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)
  Start from clean state. Execute EVERY QA scenario from EVERY task. Test cross-task integration (keyboard shortcuts + canvas, validation + editor, node CRUD after refactoring). Test edge cases: empty JSON, large JSON, invalid JSON. Save to `.sisyphus/evidence/final-qa/`.
  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT:`

- [ ] F4. **Scope Fidelity Check** — `deep`
  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination. Flag unaccounted changes.
  Output: `Tasks [N/N compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT:`

- [ ] F5. **Full Test Suite Execution** — `quick`
  Run full test pipeline in sequence:
  1. `npm test` — all unit tests pass
  2. `npm run test:e2e` — all E2E tests pass
  3. `npx tsc --noEmit` — zero type errors
  4. `npm run build` — production build succeeds
  Output: `Unit [N/N pass] | E2E [N/N pass] | TS Errors [0] | Build [SUCCESS] | VERDICT:`

  Output: `Unit [N/N pass] | E2E [N/N pass] | TS Errors [0] | Build [SUCCESS] | VERDICT:`

-> Present F1-F5 results to user and get explicit "okay" before marking complete.
**Do NOT auto-proceed after verification. Wait for user's explicit approval.**

---

## Commit Strategy

- **Wave 1 (T1-T2)**: `fix(test): install ts-jest, fix jest config typo, fix file-manager test type`
  - Files: `jest.config.js`, `package.json`, `package-lock.json`
- **Wave 2 (T3-T4)**: `fix(types): resolve TypeScript narrowing errors in path-to-line.ts`
  - Files: `src/lib/path-to-line.ts`, `src/lib/file-manager.test.ts`
- **Wave 2 (T2)**: `test: add TDD tests for json-to-graph and path-to-line modules`
  - Files: `src/lib/json-to-graph.test.ts`, `src/lib/path-to-line.test.ts`
- **Wave 3 (T5)**: `chore(deps): remove unused reactflow v11 dependency (kept @xyflow/react v12)`
  - Files: `package.json`, `package-lock.json`
- **Wave 3 (T6)**: `fix(ui): wire keyboard shortcuts to active component tree, add setOnOpenHelp to TopAppBar`
  - Files: `src/app/page.tsx`, `src/components/layout/TopAppBar.tsx`, `src/components/layout/MainWorkspace.tsx` (delete)
- **Wave 3 (T7)**: `feat(validation): wire up schema validation loadSchema() on app init`
  - Files: `src/store/app-store.ts` or `src/hooks/useJsonDocument.ts`
- **Wave 3 (T8)**: `chore: remove orphaned MainWorkspace.tsx, NodeTypeBadge.tsx`
  - Files: Deleted `MainWorkspace.tsx`, `NodeTypeBadge.tsx`
- **Wave 4 (T9)**: `chore: remove console.log/warn/info/debug calls (kept console.error)`
  - Files: `src/components/canvas/JsonNode.tsx`, `src/lib/path-to-line.ts`, `src/components/editor/CodeEditor.tsx`, `src/hooks/useKeyboardShortcuts.ts`, `src/components/canvas/NodeCanvas.tsx`, `src/components/workspace/EditorWorkspace.tsx`, `src/lib/node-persistence.ts`
- **Wave 4 (T10)**: `refactor(store): merge stores/ into store/ directory`
  - Files: Merged `stores/viewStore.ts` into `store/app-store.ts`, updated imports
- **Wave 4 (T11)**: `refactor: extract JSON mutation helpers from JsonNode.tsx to lib/json-mutations.ts`
  - Files: `src/lib/json-mutations.ts` (new), `src/lib/json-mutations.test.ts` (new), `src/components/canvas/JsonNode.tsx`, `src/lib/json-to-graph.ts`
- **Wave 4 (T12)**: `test(e2e): expand coverage for canvas, validation, keyboard, sync critical paths`
  - Files: `e2e/03-*.spec.ts`, `e2e/06-canvas.spec.ts`, `e2e/07-validation.spec.ts`, `e2e/08-keyboard.spec.ts`, `e2e/09-bidirectional-sync.spec.ts`
- **Wave 5 (T13)**: `chore: settings placeholder cleanup + bundle measurement`
  - Files: `src/components/workspace/EditorWorkspace.tsx`

---

## Success Criteria

### Verification Commands
```bash
npx tsc --noEmit              # Expected: exit code 0, 0 errors
npm run build                 # Expected: exit code 0, success
npm run lint                  # Expected: exit code 0, pass
npm test                      # Expected: exit code 0, 0 failures
npm run test:e2e              # Expected: exit code 0, all pass
grep -rn "console\.\(log\|warn\|info\|debug\)" src/  # Expected: no matches
ls src/stores/                # Expected: directory doesn't exist
test -f src/components/layout/MainWorkspace.tsx  # Expected: file doesn't exist
wc -l src/components/canvas/JsonNode.tsx    # Expected: < 300 lines
```

### Final Checklist
- [ ] Zero TypeScript build errors
- [ ] Zero Jest test failures
- [ ] Zero E2E test failures
- [ ] Zero `console.log/warn/info/debug` in `src/`
- [ ] No `reactflow` v11 dependency in package.json
- [ ] `MainWorkspace.tsx` deleted
- [ ] `NodeTypeBadge.tsx` deleted
- [ ] `stores/` merged into `store/`
- [ ] `JsonNode.tsx` refactored (< 300 lines)
- [ ] `json-mutations.ts` with 6 extracted pure functions + tests
- [ ] E2E tests cover critical paths (canvas, validation, keyboard, sync)
- [ ] Bundle size measured and reported
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes

