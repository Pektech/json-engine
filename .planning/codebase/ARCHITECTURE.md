# Architecture

## Design Philosophy
**"The Engineered Canvas"** - A high-density, technical environment treating configuration as craft, not chore.

---

## Application Pattern

### Architecture: Layered Component Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ TopAppBar   │  │  NodeCanvas │  │  CodeEditor     │  │
│  │ SideNavBar  │  │  (ReactFlow)│  │  (Monaco)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                    State Management                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ editorStore │  │ canvasStore │  │ settingsStore   │  │
│  │ (Zustand)   │  │ (Zustand)   │  │ (Zustand)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────┤
│                    Core Services                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ json-parser │  │ schema-validator│ │ gateway-client │  │
│  │ file-manager│  │ (AJV)       │  │ (OpenClaw API)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Key Components

### 1. Visual Node Canvas
- **Library:** React Flow
- **Purpose:** Interactive node graph visualization of JSON structure
- **Features:**
  - Zoom/pan (60fps target)
  - Node selection with sync to editor
  - Connection lines for parent-child relationships
  - Expand/collapse for nested objects/arrays
  - Minimap for large documents

### 2. Code Editor Panel
- **Library:** Monaco Editor (VS Code engine)
- **Purpose:** Direct JSON editing with syntax highlighting
- **Features:**
  - Real-time linting
  - Error squiggles
  - Path breadcrumbs
  - Format document
  - Search/replace

### 3. Sync Engine
- **Pattern:** Bidirectional sync between canvas and editor
- **Data Flow:**
  ```
  Editor Change → parseJSON() → validate() → updateNodeGraph() → Canvas Render
  Canvas Select → updateSelection() → Monaco scroll → Breadcrumb update
  ```

---

## Data Models

### JSON Node Graph
```typescript
interface JsonNode {
  id: string;              // "root.users.0.name"
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  key: string;             // Property name or array index
  value: any;              // Actual value
  path: string;            // JSON path "users[0].name"
  parentId: string | null; // Parent reference
  children: string[];      // Child node IDs
  position: { x: number; y: number };
  expanded: boolean;       // For objects/arrays
  errors: ValidationError[];
}
```

### Application State
```typescript
interface EditorState {
  document: JSONDocument;
  selection: JsonNode | null;
  errors: ValidationError[];
  schema: JSONSchema | null;
}

interface CanvasState {
  nodes: JsonNode[];
  viewport: { x: number; y: number; zoom: number };
  selectedNodeId: string | null;
}
```

---

## Entry Points

### Main Entry
- `src/app/page.tsx` - Main editor view with canvas + editor split

### API Routes (Planned)
- `src/app/api/schema/route.ts` - Schema fetching/serving
- `src/app/api/gateway/route.ts` - OpenClaw integration

---

## Layout Architecture

```
┌────────────────────────────────────────────────────────┐
│                    TopAppBar                           │
├────────┬───────────────────────────────────────────────┤
│        │                                               │
│ Side   │              Main Workspace                  │
│ Nav    │  ┌──────────────────┬─────────────────────┐  │
│ Bar    │  │                  │                     │  │
│        │  │  Node Canvas     │   Code Editor       │  │
│        │  │  (60% width)     │   (40% width)       │  │
│        │  │                  │                     │  │
│        │  │  - React Flow    │   - Monaco          │  │
│        │  │  - Zoom/Pan      │   - Syntax highlight│  │
│        │  │  - Node selection│   - Error display   │  │
│        │  └──────────────────┴─────────────────────┘  │
│        │                                               │
└────────┴───────────────────────────────────────────────┘
```

---

## State Management Pattern

### Zustand Stores
1. **editorStore** - Document content, selection, errors
2. **canvasStore** - Node positions, zoom level, viewport
3. **settingsStore** - User preferences, theme, auto-save

### Sync Strategy
- Canvas selection → editor scroll (immediate)
- Editor changes → canvas re-render (debounced)
- Schema validation → error badges on both views
