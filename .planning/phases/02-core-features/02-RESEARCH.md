# Phase 2: Core Features — Research

**Phase:** 2 — Core Features  
**Goal:** Visual node canvas and code editor with bidirectional sync  
**Researched:** 2026-03-22  
**Status:** Ready for planning

---

## Executive Summary

Phase 2 requires integrating three core technologies: React Flow v12 for the visual canvas, Monaco Editor for code editing, and Zustand for state management. The key challenge is establishing bidirectional synchronization between the canvas (graph view) and the editor (JSON text), ensuring changes in either view propagate correctly within 500ms while maintaining performance.

---

## Technology Stack Decisions

### React Flow v12 — Canvas Engine

**Package:** `@xyflow/react` (NOT `reactflow` — package was renamed in v12)

**Key Changes from v11:**
- New package name: `@xyflow/react`
- SSR/SSG support — can define `width`, `height`, `handles` on nodes for server rendering
- Measured dimensions moved to `node.measured.width` and `node.measured.height`
- New hooks: `useHandleConnections`, `useNodesData`
- New functions: `updateNode`, `updateNodeData` with `replace` option
- Dark mode built-in via CSS variables

**API Patterns:**
```typescript
// Node structure
interface Node<T = any> {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: T;
  width?: number;      // Now used as inline style
  height?: number;     // Now used as inline style
  measured?: {         // Set by library after measurement
    width: number;
    height: number;
  };
}

// Edge structure
interface Edge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'smoothstep' | 'step' | 'straight';
}
```

**Critical Pattern — JSON to Graph:**
1. Traverse JSON recursively
2. Create a node for each value (object, array, primitive)
3. Create edges for parent-child relationships
4. Assign unique IDs based on JSON path (e.g., `root.users.0.name`)
5. Position nodes in tree layout (dagre, d3-hierarchy, or custom)

**Canvas Controls:**
- `useReactFlow()` hook provides: `fitView`, `zoomIn`, `zoomOut`, `setViewport`
- Built-in `<Controls />` component for zoom/pan buttons
- `<MiniMap />` component for document overview
- `<Background />` component with pattern styling

**Performance Considerations:**
- Use `useNodesData` and `useHandleConnections` for reactive flows
- Memoize node/edge arrays with `useMemo`
- Implement virtual scrolling for large documents (10,000+ nodes)

---

### Monaco Editor — Code Editor

**Package:** `@monaco-editor/react`

**Best Practices:**
```typescript
import Editor from '@monaco-editor/react';

<Editor
  height="100%"
  defaultLanguage="json"
  value={jsonText}
  onChange={(value) => setJsonText(value)}
  options={{
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    formatOnPaste: true,
    formatOnType: true,
  }}
/>
```

**JSON Schema Integration:**
```typescript
import { monaco } from '@monaco-editor/react';

// Before editor mount
monaco.init().then((monaco) => {
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [
      {
        uri: 'http://myschema/openclaw.json',
        fileMatch: ['*'],
        schema: openclawSchema,
      },
    ],
  });
});
```

**Sync Patterns:**
- Editor → Canvas: Debounce onChange (100ms), parse JSON, update nodes
- Canvas → Editor: Update cursor position, highlight node in JSON
- Scroll sync: Use `editor.revealLineInCenter(lineNumber)` when canvas node selected

---

### Zustand — State Management

**Pattern for Bidirectional Sync:**
```typescript
interface AppState {
  // Source of truth: JSON text
  jsonText: string;
  parsedJson: any;
  
  // Canvas state
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  
  // Editor state
  editorCursor: { line: number; column: number };
  
  // Actions
  setJsonText: (text: string) => void;
  selectNode: (id: string) => void;
  updateNodePosition: (id: string, position: { x: number; y: number }) => void;
}

const useAppStore = create<AppState>((set, get) => ({
  jsonText: '{}',
  parsedJson: {},
  nodes: [],
  edges: [],
  selectedNodeId: null,
  editorCursor: { line: 1, column: 1 },
  
  setJsonText: (text) => {
    set({ jsonText: text });
    // Parse and update nodes
    const parsed = JSON.parse(text);
    const { nodes, edges } = jsonToGraph(parsed);
    set({ parsedJson: parsed, nodes, edges });
  },
  
  selectNode: (id) => {
    set({ selectedNodeId: id });
    // Calculate line number from node path
    const line = getLineNumberFromPath(id);
    // Scroll editor to line
    get().scrollEditorToLine(line);
  },
  
  // ... other actions
}));
```

---

## JSON to Graph Transformation

### Algorithm

```typescript
interface JsonNode {
  id: string;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  label: string;
  value?: string;
  depth: number;
  path: string;
}

function jsonToGraph(json: any, path = 'root', depth = 0): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  const nodeId = path;
  const nodeType = getJsonType(json);
  
  nodes.push({
    id: nodeId,
    type: 'jsonNode',
    position: { x: 0, y: 0 }, // Layout will set positions
    data: {
      type: nodeType,
      label: getLabel(path, json),
      value: nodeType === 'primitive' ? String(json) : undefined,
      depth,
      path,
    },
  });
  
  if (Array.isArray(json)) {
    json.forEach((item, index) => {
      const childPath = `${path}[${index}]`;
      const child = jsonToGraph(item, childPath, depth + 1);
      nodes.push(...child.nodes);
      edges.push(...child.edges);
      edges.push({
        id: `e-${nodeId}-${childPath}`,
        source: nodeId,
        target: childPath,
      });
    });
  } else if (typeof json === 'object' && json !== null) {
    Object.entries(json).forEach(([key, value]) => {
      const childPath = `${path}.${key}`;
      const child = jsonToGraph(value, childPath, depth + 1);
      nodes.push(...child.nodes);
      edges.push(...child.edges);
      edges.push({
        id: `e-${nodeId}-${childPath}`,
        source: nodeId,
        target: childPath,
      });
    });
  }
  
  return { nodes, edges };
}
```

### Layout Algorithm

Options:
1. **dagre** — Automatic tree layout (most common)
2. **elkjs** — Eclipse Layout Kernel, more complex layouts
3. **d3-hierarchy** — Custom tree layout control
4. **Manual** — Custom layout for specific JSON patterns

**Recommended:** Use dagre for Phase 2:
```typescript
import Dagre from '@dagrejs/dagre';

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel({});
g.setGraph({ rankdir: 'TB', nodesep: 150, ranksep: 100 });

nodes.forEach((node) => {
  g.setNode(node.id, { width: 180, height: 60 });
});

edges.forEach((edge) => {
  g.setEdge(edge.source, edge.target);
});

Dagre.layout(g);

const layoutedNodes = nodes.map((node) => ({
  ...node,
  position: {
    x: g.node(node.id).x - 90,
    y: g.node(node.id).y - 30,
  },
}));
```

---

## Bidirectional Sync Architecture

### Data Flow

```
┌─────────────┐     setJsonText()     ┌──────────────┐
│  User edits │ ─────────────────────► │  Zustand     │
│  Monaco     │                        │  Store       │
└─────────────┘                        └──────────────┘
                                              │
                     ┌────────────────────────┼────────────────────────┐
                     │                        │                        │
                     ▼                        ▼                        ▼
              ┌──────────────┐        ┌──────────────┐         ┌──────────────┐
              │ Parse JSON   │        │ Update nodes │         │ Trigger      │
              │ Validate     │        │ Transform    │         │ re-render    │
              └──────────────┘        └──────────────┘         └──────────────┘
                     │                        │                        │
                     ▼                        ▼                        ▼
              ┌──────────────┐        ┌──────────────┐         ┌──────────────┐
              │ Update       │        │ React Flow   │         │ Canvas       │
              │ errors       │        │ re-renders   │         │ shows nodes  │
              └──────────────┘        └──────────────┘         └──────────────┘

┌─────────────┐     selectNode()      ┌──────────────┐
│  User clicks│ ─────────────────────► │  Zustand     │
│  node       │                        │  Store       │
└─────────────┘                        └──────────────┘
                                              │
                                              ▼
                                       ┌──────────────┐
                                       │ Monaco       │
                                       │ scrollToLine │
                                       └──────────────┘
```

### Sync Rules

1. **JSON Text is source of truth** — Always parse from text, never try to reverse-sync
2. **Debounced updates** — 100ms debounce on editor changes to prevent excessive re-renders
3. **Line number mapping** — Store line/column in node data for scroll-to-line feature
4. **Error handling** — Invalid JSON shows error state, canvas shows last valid state

---

## Validation Architecture

### Error Display Strategy

**Phase 2 (Basic):**
- Monaco shows JSON syntax errors (built-in)
- Error panel shows parse errors

**Phase 3 (Full):**
- AJV validation with OpenClaw schema
- Error badges on canvas nodes
- Inline squiggles in editor

**Error State in Store:**
```typescript
interface ValidationError {
  path: string;
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
}

interface AppState {
  parseError: string | null;
  validationErrors: ValidationError[];
}
```

---

## File Structure

```
src/
├── components/
│   ├── canvas/
│   │   ├── NodeCanvas.tsx        # React Flow wrapper
│   │   ├── JsonNode.tsx          # Custom node component
│   │   ├── JsonEdge.tsx          # Custom edge component
│   │   └── NodeTypeBadge.tsx     # Type badge component
│   ├── editor/
│   │   ├── CodeEditor.tsx        # Monaco wrapper
│   │   └── EditorToolbar.tsx     # Format button, etc.
│   └── layout/
│       └── (existing from Phase 1)
├── lib/
│   ├── json-to-graph.ts          # JSON → nodes/edges transformation
│   ├── graph-layout.ts           # Dagre layout integration
│   └── path-to-line.ts           # JSON path ↔ line number mapping
├── store/
│   └── app-store.ts              # Zustand store with sync logic
└── types/
    └── canvas.ts                 # Node/edge type definitions
```

---

## Testing Strategy

### Unit Tests
- `json-to-graph.test.ts` — Transformation logic
- `graph-layout.test.ts` — Layout algorithm
- `app-store.test.ts` — State management and sync

### Component Tests (React Testing Library)
- `NodeCanvas.test.tsx` — Rendering, interactions
- `JsonNode.test.tsx` — Node display, badges
- `CodeEditor.test.tsx` — Editor integration

### Coverage Target
- 70%+ for canvas and editor components
- Test bidirectional sync scenarios
- Test error handling paths

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| JSON parse → nodes | < 100ms | 10KB JSON file |
| Canvas render | < 2s | 10KB file |
| Editor → Canvas sync | < 500ms | Debounced 100ms + parse |
| Canvas zoom/pan | 60fps | Use React Flow's optimized rendering |
| Memory | < 100MB | For typical OpenClaw configs |

---

## Common Pitfalls

1. **React Flow v11 vs v12 imports** — Use `@xyflow/react`, not `reactflow`
2. **Node sizing** — In v12, `width`/`height` are style props, not measured values
3. **Zustand persistence** — Don't persist derived state (nodes), only source (jsonText)
4. **JSON parsing errors** — Always catch parse errors and show user-friendly messages
5. **Line number mapping** — JSON with comments or custom formatting needs careful line tracking
6. **Bidirectional infinite loops** — Editor change → parse → update nodes → editor update (break with debounce)

---

## Deferred to Phase 3

- AJV schema validation with OpenClaw schema
- Error badges on canvas nodes
- Canvas search/filter
- Node position persistence
- Schema hints on hover

---

## References

- React Flow v12 docs: https://reactflow.dev/
- Monaco React: https://github.com/suren-atoyan/monaco-react
- Zustand: https://github.com/pmndrs/zustand
- Dagre layout: https://github.com/dagrejs/dagre

---

*Research completed: 2026-03-22*
*Next: Create PLAN.md files for Phase 2*
