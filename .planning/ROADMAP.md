# Roadmap: JSON.engine

## Overview

A 12-week journey to build a visual JSON editor for OpenClaw configuration management. Four phases take us from project setup through a polished, validated beta release. Each phase delivers a working increment: Foundation provides the shell, Core Features adds the canvas and editor, Validation adds schema checking and search, and Polish prepares for release with performance optimization and security hardening.

## Phases

- [ ] **Phase 1: Foundation** - Next.js project with Tailwind, basic layout, file operations
- [ ] **Phase 2: Core Features** - React Flow canvas, Monaco editor, bidirectional sync
- [ ] **Phase 3: Validation & Search** - AJV validation, canvas search, node persistence
- [ ] **Phase 4: Polish & Release** - Performance optimization, security audit, beta release

## Phase Details

### Phase 1: Foundation
**Goal:** Working Next.js app with Tailwind styling, basic layout, and file open/save
**Depends on:** Nothing (first phase)
**Requirements:** FILE-01, FILE-02, FILE-03, FILE-04, FILE-05, FILE-06, UIUX-01, UIUX-02, UIUX-03
**Success Criteria** (what must be TRUE):
  1. Next.js 14 app runs locally with `npm run dev`
  2. Tailwind CSS renders dark theme matching design tokens
  3. TopAppBar, SideNavBar, and MainWorkspace layout is visible
  4. User can open a JSON file via File System Access API
  5. User can save file back to same location
  6. Recent files list displays last 10 opened files
  7. Unit tests for json-parser and file-manager pass (80%+ coverage)
**Plans:** 3 plans

Plans:
- [ ] 01-01: Initialize Next.js project with TypeScript, Tailwind, and folder structure
- [ ] 01-02: Create layout components (TopAppBar, SideNavBar, MainWorkspace)
- [ ] 01-03: Implement file manager with File System Access API and tests

### Phase 2: Core Features
**Goal:** Visual node canvas and code editor with bidirectional sync
**Depends on:** Phase 1
**Requirements:** CANV-01, CANV-02, CANV-03, CANV-04, CANV-06, CANV-07, CANV-10, EDIT-01, EDIT-02, EDIT-03, EDIT-04, EDIT-06, EDIT-07, EDIT-08, EDIT-09, UIUX-05, UIUX-06
**Success Criteria** (what must be TRUE):
  1. JSON file opens and renders as node graph on canvas
  2. Node types display with correct badges (Object, Array, String, etc.)
  3. Parent-child connections are visible as lines
  4. Clicking node highlights it and scrolls editor to that line
  5. Monaco editor displays JSON with syntax highlighting
  6. Editing JSON updates canvas within 500ms
  7. Canvas supports zoom, pan, and center view
  8. Component tests for NodeCanvas and CodeEditor pass (70%+ coverage)
**Plans:** 4 plans | Status: ✅ Planned

Plans:
- [x] 02-01-PLAN.md: Integrate React Flow and create JSON to node graph transformation
- [x] 02-02-PLAN.md: Create JsonNode component with type badges and connections
- [x] 02-03-PLAN.md: Integrate Monaco Editor with JSON language mode
- [x] 02-04-PLAN.md: Implement bidirectional sync between canvas and editor

### Phase 3: Validation & Search
**Goal:** Schema validation, error display, canvas search, and node persistence
**Depends on:** Phase 2
**Requirements:** CANV-05, CANV-08, CANV-09, VALD-01, VALD-02, VALD-03, VALD-04, VALD-05, VALD-06, VALD-07, VALD-08, FILE-07
**Success Criteria** (what must be TRUE):
  1. Invalid JSON shows red badges on affected nodes
  2. Schema validation runs within 500ms and displays errors
  3. Error panel lists all validation issues with explanations
  4. Canvas search filters nodes by key name
  5. Node positions persist to .json-engine.json and restore on reopen
  6. Cannot save while errors exist (override available)
  7. Schema hints display when hovering over nodes
**Plans:** 4 plans

Plans:
- [ ] 03-01: Integrate AJV and create schema validator with error handling
- [ ] 03-02: Implement error display (canvas badges, editor squiggles, error panel)
- [ ] 03-03: Add canvas search/filter functionality
- [ ] 03-04: Implement node position persistence (.json-engine.json)

### Phase 4: Polish & Release
**Goal:** Performance optimization, security audit, keyboard shortcuts, and beta release
**Depends on:** Phase 3
**Requirements:** EDIT-05, UIUX-04
**Success Criteria** (what must be TRUE):
  1. Initial bundle size is under 300KB (Monaco lazy loaded)
  2. Canvas maintains 60fps during zoom/pan
  3. Keyboard shortcuts work (Ctrl+O, Ctrl+S, Ctrl+F, etc.)
  4. Security audit passes (token handling, no secrets in code)
  5. E2E tests pass for critical user paths
  6. Beta release is documented and installable
**Plans:** 3 plans

Plans:
- [ ] 04-01: Optimize bundle size and performance (lazy loading, code splitting)
- [ ] 04-02: Implement keyboard shortcuts and accessibility
- [ ] 04-03: Security audit and E2E testing

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/3 | Not started | - |
| 2. Core Features | 0/4 | Not started | - |
| 3. Validation & Search | 0/4 | Not started | - |
| 4. Polish & Release | 0/3 | Not started | - |
