# JSON.engine

## What This Is

JSON.engine is a standalone visual JSON editor designed specifically for OpenClaw configuration management. It transforms JSON from a text file into an interactive, visual workspace where OpenClaw administrators can see config structure at a glance, edit with real-time validation, and deploy with confidence.

## Core Value

OpenClaw administrators can safely edit complex JSON configurations with immediate visual feedback and validation, reducing errors before they reach production.

## Current Status

**Phase 4 COMPLETE — All gaps closed, UAT 11/11 passing ✅**

- ✅ Phase 1: Foundation (2026-03-22)
- ✅ Phase 2: Core Features (2026-03-22)
- ✅ Phase 3: Validation & Search (2026-03-22)
- ✅ Phase 4: Polish & Release (2026-03-28)

**Verified Working:**
- Visual node canvas with zoom/pan
- Monaco Editor with bidirectional sync
- AJV schema validation with error display
- Canvas search + Monaco find widget
- Keyboard shortcuts (Ctrl+O, Ctrl+S, F1, etc.)
- Sidebar navigation (Editor/Canvas/Split/Settings views)
- Node selection with scroll/highlight
- File save with .json extension
- Node position persistence

**Ready for:** Beta release

## Requirements

### Validated

All core requirements validated via UAT (11/11 tests passing):

- ✅ R-CANV-01: Visual node canvas renders JSON as interactive graph
- ✅ R-EDIT-01: Monaco code editor with syntax highlighting
- ✅ R-SYNC-01: Bidirectional sync between canvas and editor
- ✅ R-VALD-01: JSON validation with error highlighting
- ✅ R-FILE-01: File open/save via File System Access API
- ✅ R-SRCH-01: Canvas search/filter functionality
- ✅ R-PERS-01: Node position persistence
- ✅ R-UIUX-01: Dark theme UI matching design system
- ✅ R-UIUX-02: Keyboard shortcuts with preventDefault
- ✅ R-NAV-01: Sidebar navigation with view switching
- ✅ R-SEL-01: Node selection with editor scroll

### Active

(None — all MVP requirements validated)

### Out of Scope

- Multi-file project workspaces — Phase 2
- Direct OpenClaw gateway config push — requires gateway API (not yet available)
- Git integration — Phase 4 (future)
- Real-time collaboration — v2+
- Mobile support — desktop-only
- Undo/redo history — local undo only in MVP
- Export as YAML/JS — JSON-only in MVP

## Context

**Design Philosophy:** "The Engineered Canvas" — a high-density, technical environment treating configuration as craft, not chore. Dark theme (#131313 background) with precision typography.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, React Flow (canvas), Monaco Editor (code), Zustand (state), AJV (validation)

**Key Challenge:** OpenClaw's gateway API endpoints for config management don't exist yet. MVP includes Track B (standalone mode) using bundled JSON Schema for offline validation.

**User:** OpenClaw Administrator — experienced developer managing deployments, understands JSON, needs tooling to reduce errors and improve efficiency.

## Constraints

- **Tech Stack:** Next.js 14, React 18, TypeScript — specified in architecture, non-negotiable
- **Bundle Size:** Initial <300KB, Monaco <1MB, total first load <2MB — performance budget (current: 5.79 MiB, optimization pending)
- **Timeline:** 12 weeks (4 sprints) — defined in SPEC.md
- **Dependencies:** Gateway API may not be available — use bundled schema fallback
- **Browser Support:** Modern browsers with ES2020+, File System Access API with fallback
- **Security:** Gateway token memory-only, never stored in localStorage

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Monaco Editor over CodeMirror | VS Code familiarity, superior JSON support | ✅ Validated — working |
| React Flow for canvas | Battle-tested, handles zoom/pan/connections | ✅ Validated — working |
| Zustand over Redux | Lightweight, sufficient for this scale | ✅ Validated — used for app-store + viewStore |
| MVP Track B (standalone) | Gateway API doesn't exist yet | ✅ Validated — working without gateway |
| .json-engine.json for positions | Simple, non-intrusive persistence | ✅ Validated — working |
| Capture-phase F1 listener | Only way to prevent browser help | ✅ Implemented in gap-06 |
| Conditional preventDefault | Preserve Monaco shortcuts when editor focused | ✅ Implemented in gap-04 |
| Default to 'split' view | Best first-time user experience | ✅ Implemented in gap-02 |

## Evolution

**When requirements change:**
- Validated requirements → Move to Validated section with version reference
- Invalidated requirements → Move to Out of Scope with reason
- New requirements → Add to Active (or v2 if deferred)
- Update "What This Is" if product evolves

**After each phase:**
1. Review Active requirements — any invalidated?
2. Update Key Decisions with outcomes
3. Check Core Value alignment
4. Update Context with new learnings

---
*Last updated: 2026-03-22 after project initialization*
