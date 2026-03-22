# Phase 4: Polish & Release - Context

**Gathered:** 2026-03-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Performance optimization, keyboard shortcuts, security audit, E2E testing, and beta release preparation. This phase polishes the existing features and prepares the application for beta distribution — no new capabilities, only refinement of what's already built.

</domain>

<decisions>
## Implementation Decisions

### Performance Optimization

#### Monaco Editor Loading
- **D-01:** Preload Monaco Editor in background after initial render (not on-demand)
- **D-02:** Show app shell immediately, Monaco loads while user can already see UI

#### Code Splitting Strategy
- **D-03:** Split canvas (React Flow) from editor bundle — parallel loading with Monaco
- **D-04:** Three-stage loading: Core app (~150KB) → Canvas (~100KB) → Monaco (~1MB preloaded)
- **D-05:** This achieves the <300KB initial bundle target

#### Bundle Monitoring
- **D-06:** Use @next/bundle-analyzer for automated bundle size tracking
- **D-07:** Build should fail if initial bundle exceeds 300KB budget
- **D-08:** Generate reports during build for ongoing monitoring

### Keyboard Shortcuts

#### Implementation Approach
- **D-09:** Use react-hotkeys-hook library for shortcut handling
- **D-10:** Library provides clean API, conflict handling, and cross-browser compatibility

#### Conflict Resolution
- **D-11:** Context-aware shortcut routing: editor focus = Monaco shortcuts, canvas focus = app shortcuts
- **D-12:** Monaco retains Ctrl+F (find), Ctrl+H (replace) — users expect VS Code behavior
- **D-13:** App shortcuts active when canvas or global UI is focused

#### Required Shortcuts
- **D-14:** Ctrl+O — Open file
- **D-15:** Ctrl+S — Save file
- **D-16:** Ctrl+Shift+F — Find in canvas (custom implementation)
- **D-17:** Any unmapped shortcuts = agent discretion based on common patterns

### Security Audit

#### Audit Tools
- **D-18:** Automated security scanning with: npm audit, Semgrep, GitLeaks
- **D-19:** Run as part of CI pipeline
- **D-20:** Manual security checklist as secondary verification

#### Token Handling
- **D-21:** Gateway token stored memory-only in Zustand store
- **D-22:** Token cleared on page reload (no localStorage, no sessionStorage)
- **D-23:** Add explicit security comment in code documenting this decision

#### Audit Scope
- **D-24:** Verify no hardcoded secrets in source code
- **D-25:** Verify File System Access API security boundaries
- **D-26:** Verify no sensitive data in build artifacts

### E2E Testing

#### Testing Framework
- **D-27:** Use Playwright for E2E testing
- **D-28:** Playwright handles modern APIs, has trace viewer, VS Code extension

#### Test Coverage
- **D-29:** Full coverage: 10-15 tests covering all user flows
- **D-30:** Include: Open file → Edit → Validate → Save (critical path)
- **D-31:** Include: Edge cases, error states, keyboard shortcuts, canvas interactions
- **D-32:** Include: Performance benchmarks (60fps, 2s render)

#### File System Access Testing
- **D-33:** Use real file operations with Playwright helpers
- **D-34:** Supplement with manual verification for File System Access API

### Beta Release

#### Documentation
- **D-35:** Full documentation required: README + CONTRIBUTING + CHANGELOG
- **D-36:** README: Setup instructions, features, usage
- **D-37:** CONTRIBUTING: Development setup, PR process, coding standards
- **D-38:** CHANGELOG: Track all versions with changes

#### Distribution
- **D-39:** Distribution method (GitHub release vs npm) to be decided once everything is working
- **D-40:** Tag format: v1.0.0-beta.1 (semantic versioning)

#### Development Configuration
- **D-41:** Default dev server port: **3030** (avoid 3000 conflicts with other projects)
- **D-42:** Configure in package.json scripts and next.config.js

### the agent's Discretion

- Canvas 60fps optimization specifics (React Flow configuration)
- Exact Monaco preload timing and implementation details
- Specific Semgrep and GitLeaks configuration rules
- Playwright test organization and naming conventions
- README/CONTRIBUTING/CHANGELOG formatting and depth
- Any unmapped keyboard shortcuts based on user needs

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — Phase 4 requirements: EDIT-05, UIUX-04
- `.planning/ROADMAP.md` — Phase 4 scope and success criteria

### Project Context
- `.planning/PROJECT.md` — Core value, constraints, security requirements
- `.planning/STATE.md` — Current project state, prior decisions

### Codebase Conventions
- `.planning/codebase/CONVENTIONS.md` — TypeScript, React, design token patterns
- `.planning/codebase/STACK.md` — Technology stack, dependencies

### Prior Phase Context
- `.planning/phases/01-foundation/01-CONTEXT.md` — Foundation decisions (if exists)
- `.planning/phases/02-core-features/02-CONTEXT.md` — Core feature decisions (if exists)
- `.planning/phases/03-validation-search/03-CONTEXT.md` — Validation decisions (if exists)

### Security
- `.planning/PROJECT.md` § Constraints — "Gateway token memory-only, never stored in localStorage"

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Zustand store** (`src/lib/` or similar): Already used for state — add token storage there
- **Monaco integration**: Already in place — needs lazy loading wrapper
- **React Flow canvas**: Already integrated — needs code split boundary
- **Keyboard handling**: May exist in components — replace with react-hotkeys-hook

### Established Patterns
- **Component structure**: Components in `src/components/` organized by domain (canvas/, editor/, layout/, panels/)
- **State management**: Zustand with typed stores
- **Styling**: Tailwind CSS with custom design tokens
- **No-line rule**: Background color shifts instead of borders
- **Error handling**: ValidationError interface, error boundaries

### Integration Points
- **Monaco loading**: Wrap existing Monaco component with dynamic import
- **Canvas splitting**: Add React.lazy() or next/dynamic boundary around canvas components
- **Shortcuts**: Integrate at app level (layout/workspace), pass handlers to child components
- **Security audit**: Add to build pipeline in next.config.js or separate script
- **E2E tests**: Create `e2e/` or `tests/e2e/` directory

### Performance Considerations
- Current `next.config.js` is minimal — needs bundle analyzer config
- No current code splitting in place
- Monaco likely loaded synchronously currently
- React Flow canvas may be bundled with app shell currently

</code_context>

<specifics>
## Specific Ideas

- Loading stages: Core app → Canvas → Monaco (parallel loading after initial render)
- Bundle budget enforcement: Fail build if >300KB initial
- Context-aware shortcuts: Editor focus = Monaco behavior, Canvas focus = app shortcuts
- Security: Memory-only token storage with explicit code comments
- E2E: Manual verification as backup for File System Access API

</specifics>

<deferred>
## Deferred Ideas

### Distribution Method
- GitHub release vs npm package — decision pending completion of implementation
- Will decide once "everything is working"

### Future Enhancements (out of scope)
- CI/CD pipeline automation for releases
- Automated changelog generation from commits
- Performance benchmarking dashboard

</deferred>

---

*Phase: 04-polish-release*
*Context gathered: 2026-03-22*
