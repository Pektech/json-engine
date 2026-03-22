# JSON.engine

## What This Is

JSON.engine is a standalone visual JSON editor designed specifically for OpenClaw configuration management. It transforms JSON from a text file into an interactive, visual workspace where OpenClaw administrators can see config structure at a glance, edit with real-time validation, and deploy with confidence.

## Core Value

OpenClaw administrators can safely edit complex JSON configurations with immediate visual feedback and validation, reducing errors before they reach production.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Visual node canvas renders JSON as interactive graph
- [ ] Monaco code editor with syntax highlighting and error detection
- [ ] Bidirectional sync between canvas selection and editor position
- [ ] JSON schema validation with error highlighting
- [ ] File open/save via File System Access API
- [ ] Canvas search/filter for navigating large configs
- [ ] Node position persistence across sessions
- [ ] Dark theme UI matching OpenClaw design system

### Out of Scope

- Multi-file project workspaces — MVP focuses on single file editing, file tree deferred to Phase 2
- Direct OpenClaw gateway config push — requires gateway API endpoints that don't exist yet
- Git integration — version control deferred to Phase 4
- Real-time collaboration — complex feature for v2+
- Mobile support — desktop-first for technical admin use case
- Undo/redo history — local undo only in MVP, full history in Phase 2
- Export as YAML/JS — JSON-only in MVP

## Context

**Design Philosophy:** "The Engineered Canvas" — a high-density, technical environment treating configuration as craft, not chore. Dark theme (#131313 background) with precision typography.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, React Flow (canvas), Monaco Editor (code), Zustand (state), AJV (validation)

**Key Challenge:** OpenClaw's gateway API endpoints for config management don't exist yet. MVP includes Track B (standalone mode) using bundled JSON Schema for offline validation.

**User:** OpenClaw Administrator — experienced developer managing deployments, understands JSON, needs tooling to reduce errors and improve efficiency.

## Constraints

- **Tech Stack:** Next.js 14, React 18, TypeScript — specified in architecture, non-negotiable
- **Bundle Size:** Initial <300KB, Monaco <1MB, total first load <2MB — performance budget
- **Timeline:** 12 weeks (4 sprints) — defined in SPEC.md
- **Dependencies:** Gateway API may not be available — use bundled schema fallback
- **Browser Support:** Modern browsers with ES2020+, File System Access API with fallback
- **Security:** Gateway token memory-only, never stored in localStorage

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Monaco Editor over CodeMirror | VS Code familiarity, superior JSON support | — Pending |
| React Flow for canvas | Battle-tested, handles zoom/pan/connections | — Pending |
| Zustand over Redux | Lightweight, sufficient for this scale | — Pending |
| MVP Track B (standalone) | Gateway API doesn't exist yet | — Pending |
| .json-engine.json for positions | Simple, non-intrusive persistence | — Pending |

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
