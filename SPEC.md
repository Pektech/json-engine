# JSON.engine - Product Specification

**Version:** 1.0-draft  
**Created:** 2026-03-21  
**Status:** Draft for Review

---

## 1. Vision & Purpose

### The Problem
OpenClaw's `openclaw.json` configuration files are complex, deeply nested structures. Editing them manually is error-prone:
- Typos break the config silently
- Wrong types cause cryptic errors
- Missing required fields aren't discovered until runtime
- No visual feedback on structure changes
- Difficult to understand relationships between config nodes

### The Solution
**JSON.engine** is a standalone visual JSON editor designed specifically for OpenClaw configuration management. It transforms JSON from a text file into an interactive, visual workspace where users can:
- See the entire config structure at a glance
- Edit nodes with type validation
- Understand relationships through graph visualization
- Validate changes in real-time
- Deploy configs with confidence

### Design Philosophy
"The Engineered Canvas" - A high-density, technical environment where precision is paramount. The UI treats configuration as a craft, not a chore.

---

## 2. Core Features

### 2.1 Visual Node Canvas
**Description:** A zoomable/pannable canvas that renders JSON as interconnected nodes.

**Capabilities:**
- Render JSON objects as visual nodes with type badges (Object, Array, String, Number, Boolean, Null)
- Draw connection lines showing parent-child relationships
- Click nodes to select and edit
- Drag nodes to rearrange (visual only, doesn't affect JSON structure)
- Zoom in/out, pan, and "center view" controls
- Minimap for large documents
- **Search/filter nodes by key name (for large configs)**

**Interaction Model:**
- Click node → Select (shows in editor panel)
- Double-click → Expand/collapse children
- Right-click → Context menu (add child, delete, duplicate, copy path)
- Drag → Move node on canvas

**State Persistence:**
- Node positions auto-saved to `.json-engine.json` alongside edited file
- Format: `{ "fileHash": "abc123", "positions": { "nodeId": {x, y}, ... } }`
- Restored on file reopen
- Manual "Reset Layout" option available

### 2.2 Code Editor Panel
**Description:** A Monaco-powered code editor for direct JSON editing with instant sync to canvas.

**Capabilities:**
- Full syntax highlighting for JSON
- Real-time linting and error detection
- Path breadcrumbs showing current node location
- Collapse/expand regions
- Search/replace within document
- Format document command
- Copy as JSON, copy as JS object

**Sync Behavior:**
- Changes in code editor immediately update canvas
- Selecting a node in canvas scrolls to that line in editor
- Cursor position in editor highlights corresponding node on canvas

### 2.3 Schema-Driven Validation
**Description:** Real-time validation against OpenClaw's JSON schema.

**Capabilities:**
- Load OpenClaw schema from local or remote URL
- Highlight invalid nodes (red border, error tooltip)
- Show warnings for deprecated fields
- Suggest valid keys when adding to objects
- Type coercion hints (e.g., "Expected number, got string")

**Error Display:**
- Inline in code editor (squiggle underline)
- Badge on canvas node (red dot)
- Error panel listing all issues

### 2.4 Project & File Management
**Description:** Manage JSON files with recent file history.

**Capabilities:**
- Open `openclaw.json` from local file system
- Save back to same location
- Recent files list (last 10 opened files)
- Auto-save with configurable interval
- File history (local undo stack)
- Watch for external changes (file modified outside editor)
- Auto-backup before saves

**Phase 2 additions:**
- Create/open projects (folders containing JSON files)
- File tree in sidebar
- Multiple tabs for open files
- Git integration
- Export as JSON, YAML, or JS module

### 2.5 OpenClaw Integration
**Description:** Direct integration with OpenClaw gateway.

**Capabilities:**
- Load config directly from running OpenClaw instance
- Push config changes to OpenClaw (with confirmation)
- View current vs proposed config diff
- Trigger `openclaw doctor` validation
- Restart gateway from editor (with safety confirm)

---

## 3. User Stories

### Primary Persona: OpenClaw Administrator
An experienced developer who manages OpenClaw deployments. They understand JSON but want tooling to reduce errors and improve efficiency.

#### Story 1: Visual Navigation
> "As an admin, I want to see my entire config structure visually so I can quickly understand complex nested objects."

**Acceptance Criteria:**
- Canvas renders all nodes within 2 seconds for files up to 10KB
- Zoom/pan is smooth (60fps)
- Node connections are clearly visible
- Selected node is clearly highlighted

#### Story 2: Safe Editing
> "As an admin, I want to edit my config with confidence, knowing I'll be warned about errors before saving."

**Acceptance Criteria:**
- Invalid JSON shows immediate visual feedback
- Schema violations are highlighted within 500ms of edit
- Error messages explain what's wrong and how to fix
- Cannot save while errors exist (with override option)

#### Story 3: Quick Path Navigation
> "As an admin, I want to quickly navigate to deeply nested fields without scrolling through hundreds of lines."

**Acceptance Criteria:**
- Click node on canvas → editor scrolls to that section
- Breadcrumb trail shows current path
- "Jump to path" command palette action
- Search by key name across entire document

#### Story 4: Deploy Confidence
> "As an admin, I want to push config changes to my running OpenClaw instance without SSHing into the server."

**Acceptance Criteria:**
- Connect to OpenClaw gateway via API
- View diff of current vs proposed config
- One-click deploy with confirmation
- Rollback option within 30 seconds of deploy

---

## 4. Technical Architecture

### 4.1 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Framework | Next.js 14 (App Router) | React ecosystem, file-based routing, API routes for backend |
| UI Library | React 18 | Component model, hooks, ecosystem |
| Styling | Tailwind CSS + Design Tokens | Matches OpenClaw design system, rapid prototyping |
| Canvas | React Flow | Battle-tested node graph library, handles zoom/pan/connections |
| Code Editor | Monaco Editor | Same as VS Code, excellent JSON support, extensible |
| State | Zustand | Lightweight, handles canvas + editor sync |
| Validation | AJV + JSON Schema | Industry standard, OpenClaw uses it |
| File System | File System Access API + fallback | Native file access, with drag-drop fallback |

**Performance Budgets:**

| Metric | Target | Max |
|--------|--------|-----|
| Initial bundle (without Monaco) | < 300KB | 500KB |
| Monaco Editor (lazy loaded) | < 1MB | 1.5MB |
| Total first load | < 1.5MB | 2MB |
| Time to interactive | < 2s | 3s |
| Canvas render (10KB JSON) | < 1s | 2s |
| Zoom/pan FPS | 60fps | 30fps |

### 4.2 Application Structure

```
json_editor_openclaw/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Main editor view
│   │   └── api/                # Backend API routes
│   │       ├── schema/         # Fetch/serve JSON schemas
│   │       └── gateway/        # OpenClaw gateway integration
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopAppBar.tsx
│   │   │   ├── SideNavBar.tsx
│   │   │   └── MainWorkspace.tsx
│   │   ├── canvas/
│   │   │   ├── NodeCanvas.tsx
│   │   │   ├── JsonNode.tsx
│   │   │   ├── NodeConnector.tsx
│   │   │   └── CanvasControls.tsx
│   │   ├── editor/
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── EditorTabs.tsx
│   │   │   └── Breadcrumb.tsx
│   │   └── panels/
│   │       ├── ExplorerPanel.tsx
│   │       ├── ErrorPanel.tsx
│   │       └── DiffPanel.tsx
│   ├── stores/
│   │   ├── editorStore.ts      # Document state, selection
│   │   ├── canvasStore.ts      # Node positions, zoom
│   │   └── settingsStore.ts    # User preferences
│   ├── lib/
│   │   ├── json-parser.ts      # JSON → Node graph transform
│   │   ├── schema-validator.ts # AJV validation wrapper
│   │   ├── gateway-client.ts   # OpenClaw API client
│   │   └── file-manager.ts     # File system operations
│   ├── hooks/
│   │   ├── useJsonDocument.ts
│   │   ├── useSchema.ts
│   │   └── useCanvasSync.ts
│   └── types/
│       ├── json-node.ts
│       └── gateway.ts
├── public/
│   └── schemas/                # Bundled JSON schemas
├── package.json
└── tailwind.config.ts
```

### 4.3 Data Flow

**Sync Strategy:**
- Single source of truth: JSON string stored in `editorStore`
- Canvas is derived view: computed from JSON via `json-parser.ts`
- Selection state stored separately from document state
- Debounce canvas updates (100ms) to avoid thrashing during typing

```
User Edit → Monaco Editor → parseJSON()
                            ↓
                     Valid JSON? → Yes → updateNodeGraph() → Canvas Re-render (debounced)
                            ↓
                            No → showError() (inline + error panel)
                            
Canvas Node Select → updateSelection() → Monaco scroll to line
                                                 ↓
                                         Breadcrumb update
```

### 4.4 Node Graph Model

```typescript
interface JsonNode {
  id: string;              // Unique identifier (e.g., "root.users.0.name")
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  key: string;             // Key name (or index for arrays)
  value: any;              // The actual value (primitive or reference)
  path: string;            // JSON path (e.g., "users[0].name")
  parentId: string | null; // Reference to parent node
  children: string[];      // Child node IDs
  position: { x: number; y: number }; // Canvas position
  expanded: boolean;       // For objects/arrays
  errors: ValidationError[]; // Schema validation errors
}
```

---

## 5. Integration Points

### 5.1 OpenClaw Gateway API

**Endpoints to implement in OpenClaw:**
```
GET  /api/config/schema     → Returns openclaw.json schema
GET  /api/config/current    → Returns current running config
POST /api/config/validate   → Validates proposed config
POST /api/config/apply      → Applies new config (with restart)
GET  /api/config/diff       → Returns diff between current and proposed
```

**Authentication:**
- Gateway token is **NOT stored in browser storage** (security risk)
- Token kept in memory only (session scope)
- User prompted for token on each new session
- Alternative: Proxy through Next.js API routes (`/api/gateway/*`) to avoid exposing token to frontend
- For MVP Track B: No authentication required (standalone mode)

### 5.2 Local File System

**Capabilities:**
- Open `openclaw.json` from local file system
- Save back to same location
- Watch for external changes (file modified outside editor)
- Auto-backup before saves

### 5.3 Schema Sources

**Discovery:** OpenClaw does not publish a standalone `schema.json` file. The schema is defined in TypeScript using **TypeBox** and can be queried programmatically via the gateway API.

**Schema Access Methods:**

| Method | Endpoint/Source | Use Case |
|--------|----------------|----------|
| **Gateway API** | `config.schema.lookup` action | Online mode - query schema from running gateway |
| **Source Code** | `src/line/config-schema.ts` | Build time - generate JSON Schema for bundling |

**Gateway Schema Response:**
```json
{
  "path": "agents.defaults",
  "schema": { "type": "object", "additionalProperties": false },
  "hint": { 
    "label": "Agent Defaults", 
    "help": "Shared default settings inherited by agents...",
    "tags": ["advanced"]
  },
  "children": [
    { "key": "model", "path": "agents.defaults.model", "required": false }
  ]
}
```

**Benefits of Gateway-based Schema:**
- Schema automatically matches running OpenClaw version
- Includes human-readable hints (labels, help text)
- Live validation against exact schema the gateway uses
- No version drift between editor and gateway

**Hybrid Implementation:**
1. **Online:** Query `config.schema.lookup` from connected gateway
2. **Offline:** Bundle a generated JSON Schema (exported from TypeBox definitions at build time)

**Priority Order:**
1. Gateway API (when connected to OpenClaw)
2. Bundled schema (offline fallback, version-specific)
3. Custom URL (user-provided schema for custom setups)

---

## 6. MVP Scope (v1.0)

> **⚠️ Gateway Dependency Risk:** OpenClaw does not currently expose the documented API endpoints. MVP is split into two tracks to allow development without waiting for gateway implementation.

### MVP Track A: Full Schema Validation (requires gateway API)
*Target: Use when OpenClaw gateway endpoints are available*
- ✅ Visual node canvas with zoom/pan
- ✅ Code editor panel with syntax highlighting
- ✅ Basic JSON validation (syntax errors)
- ✅ Schema validation via gateway API (`config.schema.lookup`)
- ✅ Schema hints display (labels, help text from gateway)

### MVP Track B: Standalone JSON Editor (no gateway dependency)
*Target: Use when gateway API is unavailable*
- ✅ Visual node canvas with zoom/pan
- ✅ Code editor panel with syntax highlighting
- ✅ Basic JSON validation (syntax errors)
- ✅ Bundled JSON Schema validation (static OpenClaw schema)
- ⬜ Schema hints display (limited, from bundled schema)

### Both Tracks Include
- ✅ File open/save (single file)
- ✅ Light/dark theme (dark default)
- ✅ Node selection sync between canvas and editor
- ✅ Error highlighting on canvas and in editor
- ✅ Canvas search/filter for large configs
- ✅ Node position persistence (.json-engine.json)

### Excluded (Future Phases)
- ❌ Multi-file projects
- ❌ Direct OpenClaw gateway config push
- ❌ Git integration
- ❌ Custom schema loading
- ❌ Node drag-to-rearrange
- ❌ Undo/redo history
- ❌ Export as YAML/JS

---

## 7. Future Phases

### Phase 2: Multi-File Projects & Offline Schema
- Project workspace with file tree
- Tabs for multiple open files
- Cross-file references ($ref support)
- **Bundled offline schema:** Build script to export TypeBox schema as JSON Schema
- Schema version check: Compare bundled vs. gateway schema version

### Phase 3: OpenClaw Deep Integration
- Connect to running gateway
- Live config push
- Restart controls
- Log viewer

### Phase 4: Advanced Features
- Git integration (commit, branch, diff)
- Custom schema management
- Macros/templates for common patterns
- Collaboration (multi-user editing)

### Phase 5: Extensibility
- Plugin system for custom node types
- Custom validation rules
- Export pipelines (to other formats)

---

## 8. Design Tokens

Refer to `/json_design/DESIGN.md` for complete design system. Key tokens:

| Token | Value | Usage |
|-------|-------|-------|
| `surface` | #131313 | Main background |
| `surface-container-lowest` | #0e0e0e | Sidebar, editor background |
| `surface-container-high` | #2a2a2a | Node cards |
| `primary` | #9fcaff | Primary accent, links |
| `primary-container` | #007acc | Primary buttons |
| `outline-variant` | #404751 | Borders (use sparingly) |
| `error` | #ffb4ab | Error states |
| `tertiary` | #ffb784 | Warnings, type badges |

**Typography:**
- UI Text: Inter (400, 500, 600 weights)
- Labels/Code: Space Grotesk (300, 400, 500 weights)
- Monospace: JetBrains Mono (for inline code values)

---

## 9. Success Metrics

### Quantitative
- Config editing time reduced by 50% (measured via user testing)
- Configuration errors reduced by 80% (measured via support tickets)
- Adoption: 50% of OpenClaw users within 6 months of release
- Bundle size stays under budget (see 4.1)
- Canvas renders 10KB JSON in < 2 seconds

### Qualitative
- Users report "confidence" when editing configs
- Users prefer JSON.engine over VS Code for OpenClaw configs
- Users discover new config options through visual exploration

---

## 9a. Testing Requirements

### Coverage Goals by Release
| Component | Unit | Integration | E2E |
|-----------|------|-------------|-----|
| json-parser.ts | 90% | 80% | - |
| schema-validator.ts | 85% | 80% | - |
| file-manager.ts | 80% | 75% | - |
| NodeCanvas | 70% | 70% | 100% |
| CodeEditor | 70% | 70% | 100% |

### Critical Paths (E2E Required)
1. Open file → Display in canvas and editor
2. Edit JSON → Canvas updates within 500ms
3. Select node → Editor scrolls to position
4. Save file → File written correctly
5. Invalid JSON → Errors displayed

### Testing Stack
- **Unit:** Jest + React Testing Library
- **E2E:** Playwright
- **Visual:** Storybook (for component development)

---

## 10. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Monaco bundle size | Slow initial load | Lazy load editor panel, use lighter alternative if needed |
| Complex JSON breaks canvas | Performance issues | Virtual rendering for large documents, collapse-by-default |
| Schema drift | Validation becomes stale | Bundle schema with editor, allow custom schema URLs |
| File system access blocked | Users can't save files | Implement File System Access API with drag-drop fallback |
| Gateway API changes | Integration breaks | Version the API, maintain backward compatibility |

---

## 11. Timeline (Proposed)

### Sprint 1 (Week 1-3): Foundation
- Project setup (Next.js, Tailwind, design tokens)
- Basic layout (sidebar, canvas area, editor area)
- File open/save (single file)
- Unit tests: json-parser, file-manager (80%+ coverage)

### Sprint 2 (Week 4-6): Core Features
- Node canvas with React Flow
- JSON → Node graph transformation
- Code editor integration (Monaco)
- Selection sync between canvas and editor
- Component tests: NodeCanvas, CodeEditor

### Sprint 3 (Week 7-9): Validation & Search
- JSON syntax validation
- Schema loading and validation (AJV)
- Canvas search/filter functionality
- Node position persistence (.json-engine.json)
- Error display (canvas badges, editor squiggles)
- Error panel

### Sprint 4 (Week 10-12): Polish & Release
- Performance optimization (bundle splitting, lazy loading)
- Keyboard shortcuts
- Security audit (token handling)
- E2E tests: critical user paths
- Documentation
- Beta release

---

## Appendix A: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + O` | Open file |
| `Ctrl/Cmd + S` | Save file |
| `Ctrl/Cmd + Shift + S` | Save as |
| `Ctrl/Cmd + F` | Find in editor |
| `Ctrl/Cmd + P` | Command palette |
| `Ctrl/Cmd + B` | Toggle sidebar |
| `Ctrl/Cmd + +` | Zoom in canvas |
| `Ctrl/Cmd + -` | Zoom out canvas |
| `Ctrl/Cmd + 0` | Center canvas |
| `Escape` | Deselect node |
| `Delete/Backspace` | Delete selected node |
| `Ctrl/Cmd + Z` | Undo (Phase 2) |
| `Ctrl/Cmd + Shift + Z` | Redo (Phase 2) |

---

## Appendix B: Open Questions

1. **~~Offline schema support?~~ ✅ Resolved:** Use gateway API for online, bundle generated JSON Schema for offline (Phase 2).
2. **~~Mobile support?~~ ✅ Resolved:** Desktop-only for MVP. Mobile editing not a priority.
3. **Multiple gateways?** How to handle connections to multiple OpenClaw instances (dev/staging/prod)?
4. **~~Secrets handling?~~ ✅ Resolved:** Mask sensitive fields by default, add reveal toggle. Token stored in memory only.
5. **Version mismatch?** If bundled schema is older than running gateway, show warning or auto-update?
6. **Partial schema loading?** Load schema on-demand (per-node) vs. all-at-once for large configs?
7. **Canvas layout algorithm?** Auto-layout on first open, or require manual arrange?
8. **Collaboration scope?** Multiple users editing same file simultaneously - Phase 5 only or never?

---

*End of Specification*