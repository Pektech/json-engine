# Phase 4: Polish & Release - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-22
**Phase:** 04-polish-release
**Areas discussed:** Performance Optimization, Keyboard Shortcuts, Security Audit, E2E Testing, Beta Release

---

## Performance Optimization

### Monaco Editor Loading

| Option | Description | Selected |
|--------|-------------|----------|
| Dynamic import with loading skeleton | Load Monaco on-demand when editor is first viewed, show skeleton UI during load | |
| Preload in background after initial render | Load critical app first, then preload Monaco in background. Faster perceived performance for file opening | ✓ |
| You decide | Choose the approach that best fits the codebase and user experience goals | |

**User's choice:** Preload in background after initial render
**Notes:** User wants Monaco preloaded in background while app shell renders immediately for better perceived performance.

---

### Code Splitting Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Split canvas from editor | Lazy load React Flow canvas component. File opens, then canvas renders when chunk loads | ✓ |
| Single bundle | Keep all in one bundle. Simpler, but larger initial load | |
| You decide | Use Next.js route-based or component-level splitting based on what makes sense | |

**User's choice:** Split canvas from editor (after asking "what would you recommend?")
**Notes:** Recommended and accepted: Split canvas from editor. Monaco preloads in background, canvas loads in parallel. Three-stage loading: Core app (~150KB) → Canvas (~100KB) → Monaco (~1MB preloaded). This achieves <300KB initial bundle target.

---

### Bundle Monitoring

| Option | Description | Selected |
|--------|-------------|----------|
| Built-in Next.js bundle analyzer | Add @next/bundle-analyzer to dev dependencies, generate reports during build to track bundle size | ✓ |
| Manual tracking only | Manual size tracking via build logs and periodic checks | |
| You decide | Standard approach for bundle analysis | |

**User's choice:** Built-in Next.js bundle analyzer (after asking "what would you recommend?")
**Notes:** Recommended and accepted: Built-in Next.js bundle analyzer. Integrates with build pipeline, shows visual breakdowns, can fail builds if budgets exceeded. Given strict <300KB requirement, need automated enforcement.

---

## Keyboard Shortcuts

### Implementation Approach

| Option | Description | Selected |
|--------|-------------|----------|
| react-hotkeys-hook library | Use a library like react-hotkeys-hook. Clean API, handles conflicts, cross-browser compatible | ✓ |
| Custom hook implementation | Implement custom keyboard handler in a hook. More control, no extra dependency | |
| You decide | Choose based on maintainability and scope needs | |

**User's choice:** react-hotkeys-hook library
**Notes:** Clean API, handles conflicts, cross-browser compatible. Fits well with existing React patterns.

---

### Shortcut Conflict Resolution

| Option | Description | Selected |
|--------|-------------|----------|
| Context-aware: editor focus = Monaco, canvas = app | Monaco uses Ctrl+F, Ctrl+H, etc. When editor is focused, let Monaco handle them. When canvas is focused, use app shortcuts | ✓ |
| Override Monaco completely | Always use app shortcuts, disable Monaco defaults. More consistent but loses Monaco features | |
| You decide | Use a hybrid approach based on user preference and usability | |

**User's choice:** Context-aware: editor focus = Monaco, canvas = app
**Notes:** Users expect VS Code shortcuts when editor is focused. Canvas gets app shortcuts (Ctrl+O, Ctrl+S, Ctrl+Shift+F).

---

## Security Audit

### Audit Tools

| Option | Description | Selected |
|--------|-------------|----------|
| Automated tools (npm audit + Semgrep + GitLeaks) | Use npm audit, Semgrep, and GitLeaks. Automated scanning for secrets and vulnerabilities | ✓ |
| Manual review only | Manual code review with security checklist. Simpler but less thorough | |
| You decide | Standard security audit approach | |

**User's choice:** Automated tools (npm audit + Semgrep + GitLeaks)
**Notes:** Automated scanning covers more ground, runs in CI, catches secrets and vulnerabilities systematically.

---

### Token Storage Implementation

| Option | Description | Selected |
|--------|-------------|----------|
| Memory-only in store | Token exists only in Zustand store, cleared on page reload. No localStorage, no sessionStorage | ✓ |
| Module-level variable | Keep token in closure/module-level variable. Survives React re-renders but cleared on reload | |
| You decide | Choose the most secure and practical approach | |

**User's choice:** Memory-only in store (after asking "what would you recommend?")
**Notes:** Recommended and accepted: Memory-only in Zustand store. App already uses Zustand, integrates with React lifecycle, follows existing patterns. Add security comment documenting decision.

---

## E2E Testing

### Testing Framework

| Option | Description | Selected |
|--------|-------------|----------|
| Playwright | Playwright is the modern standard. Handles File System Access API (with workarounds), has great VS Code extension, trace viewer | ✓ |
| Cypress | Cypress is popular but has limitations with modern APIs and component testing | |
| You decide | Choose the best tool for the tech stack and testing needs | |

**User's choice:** Playwright
**Notes:** Modern standard, better API handling, excellent developer experience with trace viewer.

---

### Test Coverage

| Option | Description | Selected |
|--------|-------------|----------|
| Critical paths only (4-6 tests) | Critical paths: Open file → Edit → Validate → Save. Plus error handling and keyboard shortcuts | |
| Full coverage (10-15 tests) | Comprehensive: All user flows including edge cases, error states, and performance benchmarks | ✓ |
| You decide | Choose appropriate coverage for release readiness | |

**User's choice:** Full coverage (10-15 tests)
**Notes:** Beta release needs comprehensive coverage. Include all user flows, edge cases, error states, keyboard shortcuts, canvas interactions, performance benchmarks (60fps, 2s render).

---

### File System Access API Testing

| Option | Description | Selected |
|--------|-------------|----------|
| Mock FS API | Mock the File System Access API in tests. Faster, more reliable, but doesn't test real browser behavior | |
| Real file operations with Playwright helpers | Use Playwright's experimental file picker handling with actual file operations. More realistic but complex | ✓ |
| You decide | Choose the approach that balances realism and reliability | |

**User's choice:** Real file operations with Playwright helpers
**Notes:** User noted: "lets go with one with a note that I'll also do a practical test once everything else is good" — supplement Playwright tests with manual verification for File System Access API.

---

## Beta Release

### Distribution Method

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub release with artifacts | Tag v1.0.0-beta.1, create GitHub release with changelog, include built artifacts | |
| npm beta package | npm publish as @beta. Easier for users to install, but requires npm account setup | |
| You decide | Choose the distribution method that fits the project | |

**User's choice:** Deferred
**Notes:** User: "lets decide on that once we have everything working" — Distribution method to be decided post-implementation.

---

### Documentation Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Full documentation (README + CONTRIBUTING + CHANGELOG) | README with setup, CONTRIBUTING guide, CHANGELOG tracking all versions | ✓ |
| README only | Just README with basic usage. Minimal but functional | |
| You decide | Choose documentation scope based on beta release needs | |

**User's choice:** Full documentation (README + CONTRIBUTING + CHANGELOG)
**Notes:** Professional beta release needs complete documentation. README: setup, features, usage. CONTRIBUTING: dev setup, PR process, coding standards. CHANGELOG: track all versions.

---

## the agent's Discretion

The following areas were deferred to the agent's discretion during implementation:

- Canvas 60fps optimization specifics (React Flow configuration)
- Exact Monaco preload timing and implementation details
- Specific Semgrep and GitLeaks configuration rules
- Playwright test organization and naming conventions
- README/CONTRIBUTING/CHANGELOG formatting and depth
- Any unmapped keyboard shortcuts based on user needs

---

## Deferred Ideas

Ideas mentioned during discussion that were noted for future phases:

- **Distribution method decision** — To be decided once implementation is complete
- **CI/CD pipeline automation** — Future enhancement for automated releases
- **Automated changelog generation** — Future enhancement from commits
- **Performance benchmarking dashboard** — Future monitoring enhancement

