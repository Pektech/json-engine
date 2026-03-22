# Directory Structure

## Current State
Pre-implementation project with design specifications and prototype.

```
json_editor_openclaw/
├── SPEC.md                    # Product specification (476 lines)
├── json_design/
│   ├── DESIGN.md             # Design system spec (89 lines)
│   ├── code.html             # HTML prototype (320 lines)
│   └── screen.png            # Design reference screenshot
├── json_design.zip           # Design assets archive
└── .planning/
    └── codebase/             # This documentation
```

---

## Planned Structure (Next.js 14 App Router)

```
json_editor_openclaw/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx               # Root layout with providers
│   │   ├── page.tsx                 # Main editor page
│   │   ├── globals.css              # Global styles + Tailwind
│   │   └── api/                     # Backend API routes
│   │       ├── schema/
│   │       │   └── route.ts         # Schema fetch/serve
│   │       └── gateway/
│   │           └── route.ts         # OpenClaw proxy
│   │
│   ├── components/                   # React components
│   │   ├── layout/                  # Layout components
│   │   │   ├── TopAppBar.tsx
│   │   │   ├── SideNavBar.tsx
│   │   │   └── MainWorkspace.tsx
│   │   │
│   │   ├── canvas/                  # Canvas/node components
│   │   │   ├── NodeCanvas.tsx
│   │   │   ├── JsonNode.tsx
│   │   │   ├── NodeConnector.tsx
│   │   │   └── CanvasControls.tsx
│   │   │
│   │   ├── editor/                  # Code editor components
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── EditorTabs.tsx
│   │   │   └── Breadcrumb.tsx
│   │   │
│   │   └── panels/                  # Sidebar panels
│   │       ├── ExplorerPanel.tsx
│   │       ├── ErrorPanel.tsx
│   │       └── DiffPanel.tsx
│   │
│   ├── stores/                       # Zustand state stores
│   │   ├── editorStore.ts
│   │   ├── canvasStore.ts
│   │   └── settingsStore.ts
│   │
│   ├── lib/                          # Core utilities
│   │   ├── json-parser.ts           # JSON → Node graph
│   │   ├── schema-validator.ts      # AJV validation
│   │   ├── gateway-client.ts        # OpenClaw API client
│   │   └── file-manager.ts          # File system operations
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useJsonDocument.ts
│   │   ├── useSchema.ts
│   │   └── useCanvasSync.ts
│   │
│   └── types/                        # TypeScript types
│       ├── json-node.ts
│       └── gateway.ts
│
├── public/                           # Static assets
│   └── schemas/                      # Bundled JSON schemas
│
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind + design tokens
├── tsconfig.json                     # TypeScript config
└── package.json                      # Dependencies
```

---

## Key Locations

### Configuration Files
| File | Purpose |
|------|---------|
| `tailwind.config.ts` | Design tokens, colors, typography |
| `next.config.js` | App settings, API routes |
| `tsconfig.json` | TypeScript compiler options |

### Core Business Logic
| File | Responsibility |
|------|----------------|
| `src/lib/json-parser.ts` | Transform JSON to node graph |
| `src/lib/schema-validator.ts` | Validate against JSON Schema |
| `src/lib/gateway-client.ts` | OpenClaw API integration |
| `src/lib/file-manager.ts` | File system operations |

### Component Categories
| Directory | Contents |
|-----------|----------|
| `components/layout/` | App shell components |
| `components/canvas/` | React Flow nodes and canvas |
| `components/editor/` | Monaco editor wrapper |
| `components/panels/` | Sidebar panels |

---

## Naming Conventions

### Files
- Components: PascalCase (`TopAppBar.tsx`)
- Utilities: camelCase (`json-parser.ts`)
- Types: camelCase (`json-node.ts`)
- Styles: kebab-case with extension (`globals.css`)

### Directories
- All lowercase, kebab-case for multi-word (`json-parser/`)

---

## Design System Files

| File | Purpose |
|------|---------|
| `json_design/DESIGN.md` | Complete design system spec |
| `json_design/code.html` | Interactive HTML prototype |
| `json_design/screen.png` | Visual reference |

---

## Build Output

```
.next/
├── static/                 # Static assets
├── server/                 # Server bundles
├── (pages)/               # Page routes
└── chunks/                # Code-split chunks
```
