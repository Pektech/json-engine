# Requirements: JSON.engine

**Defined:** 2026-03-22
**Core Value:** OpenClaw administrators can safely edit complex JSON configurations with immediate visual feedback and validation, reducing errors before they reach production.

## v1 Requirements

### Canvas

- [ ] **CANV-01**: Canvas renders JSON objects as visual nodes with type badges (Object, Array, String, Number, Boolean, Null)
- [ ] **CANV-02**: Canvas displays connection lines showing parent-child relationships
- [ ] **CANV-03**: User can click nodes to select them (syncs to editor)
- [ ] **CANV-04**: User can double-click nodes to expand/collapse children
- [ ] **CANV-05**: User can drag nodes to rearrange (visual only, persists to .json-engine.json)
- [ ] **CANV-06**: Canvas supports zoom in/out, pan, and center view controls
- [ ] **CANV-07**: Canvas displays minimap for large documents
- [ ] **CANV-08**: User can search/filter nodes by key name
- [ ] **CANV-09**: Invalid nodes display error badges (red dot)
- [ ] **CANV-10**: Selected node is clearly highlighted

### Editor

- [ ] **EDIT-01**: Monaco editor displays JSON with syntax highlighting
- [ ] **EDIT-02**: Editor shows real-time linting and error detection
- [ ] **EDIT-03**: Editor displays path breadcrumbs showing current node location
- [ ] **EDIT-04**: Editor supports collapse/expand regions
- [ ] **EDIT-05**: Editor supports search/replace within document
- [ ] **EDIT-06**: Editor has Format Document command
- [ ] **EDIT-07**: Changes in editor immediately update canvas (debounced 100ms)
- [ ] **EDIT-08**: Selecting node in canvas scrolls editor to that line
- [ ] **EDIT-09**: Cursor position in editor highlights corresponding node on canvas

### Validation

- [ ] **VALD-01**: JSON syntax errors show immediate visual feedback
- [ ] **VALD-02**: Schema validation via AJV with OpenClaw schema
- [ ] **VALD-03**: Schema validation completes within 500ms of edit
- [ ] **VALD-04**: Errors display inline in editor (squiggle underline)
- [ ] **VALD-05**: Errors display in error panel listing all issues
- [ ] **VALD-06**: Error messages explain what's wrong and how to fix
- [ ] **VALD-07**: Schema hints display (labels, help text) when available
- [ ] **VALD-08**: Cannot save while errors exist (with override option)

### File Management

- [ ] **FILE-01**: User can open openclaw.json from local file system
- [ ] **FILE-02**: User can save back to same location
- [ ] **FILE-03**: Recent files list (last 10 opened files)
- [ ] **FILE-04**: Auto-save with configurable interval (default 30s)
- [ ] **FILE-05**: Watch for external changes (file modified outside editor)
- [ ] **FILE-06**: Auto-backup before saves
- [ ] **FILE-07**: Node positions persist to .json-engine.json alongside edited file

### UI/UX

- [ ] **UIUX-01**: Dark theme by default (light theme optional)
- [ ] **UIUX-02**: TopAppBar with project name and navigation
- [ ] **UIUX-03**: SideNavBar with file explorer and tools
- [x] **UIUX-04**: Keyboard shortcuts for common actions (Ctrl+O, Ctrl+S, etc.)
- [ ] **UIUX-05**: Canvas renders within 2 seconds for 10KB JSON files
- [ ] **UIUX-06**: Canvas zoom/pan maintains 60fps

## v2 Requirements

### Multi-File Projects

- **PROJ-01**: Project workspace with file tree
- **PROJ-02**: Tabs for multiple open files
- **PROJ-03**: Cross-file references ($ref support)

### Offline Schema

- **SCHM-01**: Bundled JSON Schema for offline validation
- **SCHM-02**: Schema version check comparing bundled vs gateway

### Undo/Redo

- **UNDO-01**: Full undo/redo history with keyboard shortcuts
- **UNDO-02**: History preserved across sessions

### Gateway Integration

- **GATE-01**: Connect to running OpenClaw gateway
- **GATE-02**: Load config directly from gateway
- **GATE-03**: Push config changes to gateway (with confirmation)
- **GATE-04**: View diff of current vs proposed config
- **GATE-05**: Trigger openclaw doctor validation

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile app | Desktop-first for technical admin use case |
| Real-time collaboration | Complex feature for v2+ |
| Video tutorials | Documentation sufficient for v1 |
| OAuth login | Not applicable (local tool) |
| Plugin system | Extensibility deferred to Phase 5 |
| AI-powered suggestions | Future enhancement, not core value |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CANV-01 | Phase 2 | Pending |
| CANV-02 | Phase 2 | Pending |
| CANV-03 | Phase 2 | Pending |
| CANV-04 | Phase 2 | Pending |
| CANV-05 | Phase 3 | Pending |
| CANV-06 | Phase 2 | Pending |
| CANV-07 | Phase 2 | Pending |
| CANV-08 | Phase 3 | Pending |
| CANV-09 | Phase 3 | Pending |
| CANV-10 | Phase 2 | Pending |
| EDIT-01 | Phase 2 | Pending |
| EDIT-02 | Phase 2 | Pending |
| EDIT-03 | Phase 2 | Pending |
| EDIT-04 | Phase 2 | Pending |
| EDIT-05 | Phase 4 | Pending |
| EDIT-06 | Phase 2 | Pending |
| EDIT-07 | Phase 2 | Pending |
| EDIT-08 | Phase 2 | Pending |
| EDIT-09 | Phase 2 | Pending |
| VALD-01 | Phase 3 | Pending |
| VALD-02 | Phase 3 | Pending |
| VALD-03 | Phase 3 | Pending |
| VALD-04 | Phase 3 | Pending |
| VALD-05 | Phase 3 | Pending |
| VALD-06 | Phase 3 | Pending |
| VALD-07 | Phase 3 | Pending |
| VALD-08 | Phase 3 | Pending |
| FILE-01 | Phase 1 | Pending |
| FILE-02 | Phase 1 | Pending |
| FILE-03 | Phase 1 | Pending |
| FILE-04 | Phase 1 | Pending |
| FILE-05 | Phase 1 | Pending |
| FILE-06 | Phase 1 | Pending |
| FILE-07 | Phase 3 | Pending |
| UIUX-01 | Phase 1 | Pending |
| UIUX-02 | Phase 1 | Pending |
| UIUX-03 | Phase 1 | Pending |
| UIUX-04 | Phase 4 | Complete |
| UIUX-05 | Phase 2 | Pending |
| UIUX-06 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-22 after initial definition*
