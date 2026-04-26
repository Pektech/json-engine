# JSON.engine Architecture

This document describes the architecture of JSON.engine, a visual JSON editor built for OpenClaw configuration management. It covers the project structure, component hierarchy, state management, data flow, and key design decisions.

---

## Project Structure

The codebase follows a standard Next.js 14 application structure with clear separation of concerns:

```
src/
├── app/                    # Next.js pages and routing
│   ├── page.tsx           # Main entry point (root page)
│   ├── layout.tsx         # Root layout with providers
│   └── globals.css        # Global styles and Tailwind imports
├── components/            # React UI components
│   ├── layout/           # Shell components (TopAppBar, SideNavBar)
│   ├── workspace/        # EditorWorkspace container
│   ├── editor/           # CodeEditor, EditorToolbar
│   ├── canvas/           # NodeCanvas, SearchBar
│   └── ui/               # Shared UI primitives
├── store/                # Zustand state management
│   ├── app-store.ts      # Main application state
│   └── viewStore.ts      # View mode state
├── lib/                  # Pure utility functions
│   ├── json-to-graph.ts  # JSON to graph conversion
│   ├── graph-layout.ts   # Dagre-based graph layout
│   ├── path-to-line.ts   # Path to line number mapping
│   ├── json-mutations.ts # JSON manipulation helpers
│   ├── validation.ts     # AJV validation service
│   └── file-manager.ts   # File System Access API wrapper
├── hooks/                # Custom React hooks
│   ├── useKeyboardShortcuts.ts  # Global keyboard handlers
│   └── useFileManager.ts        # File operations hook
├── types/                # TypeScript type definitions
│   ├── canvas.ts         # Canvas node and edge types
│   ├── validation.ts     # Validation error types
│   ├── persistence.ts    # State persistence types
│   └── file-system.ts    # File system types
└── services/             # External service integrations
    └── node-persistence.ts  # Node position persistence
```

---

## Component Hierarchy

The UI follows a hierarchical component structure:

```
page.tsx (Root)
├── TopAppBar                    # App header with actions
├── SideNavBar                   # Left sidebar navigation
└── EditorWorkspace              # Main content area
    ├── NodeCanvas               # React Flow graph visualization
    │   ├── ReactFlow            # React Flow canvas
    │   ├── Background           # Grid background
    │   ├── Controls             # Zoom/pan controls
    │   └── Custom Node Types    # Value nodes, object nodes
    └── Editor Panel
        ├── EditorToolbar        # Format, save, open buttons
        ├── SearchBar            # Canvas search
        └── CodeEditor           # Monaco Editor instance
            ├── Monaco Instance  # VS Code editor core
            └── Error Markers    # Validation indicators
```

### Key Components

**TopAppBar**: Displays the current file path, help button, and app branding. Communicates with the store to display `selectedPath`.

**SideNavBar**: Navigation sidebar with view mode toggles (canvas, editor, split view). Uses `useViewStore` for state.

**EditorWorkspace**: The main container that manages the split view layout. Handles the draggable divider between canvas and editor panels.

**NodeCanvas**: Wraps React Flow for the visual graph. Receives JSON data from the store and renders it as interactive nodes.

**CodeEditor**: Wraps Monaco Editor. Synchronizes with the store's `jsonText` and reports cursor position changes.

---

## State Management

JSON.engine uses **Zustand** for state management, with a single store in `src/store/app-store.ts`.

### Store Structure

```typescript
interface AppState {
  // Core data
  jsonText: string           // Raw JSON text from editor
  parsedJson: any | null     // Parsed JSON object
  nodes: CanvasNode[]        // React Flow nodes
  edges: CanvasEdge[]        // React Flow edges

  // Selection and UI
  selectedPath: string | null   // Currently selected node path
  expandedNodes: Set<string>    // Expanded/collapsed node state
  searchQuery: string           // Canvas search term
  filteredNodeIds: Set<string>  // Search result nodes

  // Validation
  validationErrors: ValidationError[]  // AJV validation results
  isValidating: boolean

  // File operations
  currentFile: string | null
  currentFileHandle: FileSystemFileHandle | null
  isDirty: boolean

  // Undo/Redo
  history: string[]         // Stack of JSON states
  historyIndex: number      // Current position in history

  // Security
  gatewayToken: string | null  // Memory-only token storage
}
```

### Undo/Redo System

The history system maintains a stack of JSON text states:

- **Debounce Strategy**: Changes are pushed to history 500ms after the user stops typing, preventing excessive history entries
- **Maximum History**: 50 states to prevent memory bloat
- **Branch Pruning**: When the user makes changes after undoing, future history is discarded (standard behavior)

---

## Data Flow

The application follows a unidirectional data flow pattern:

### Editor to Canvas Flow

```
User types in Monaco
        ↓
Monaco onChange event
        ↓
setJsonText(text) in store
        ↓
Parse JSON (may fail → parseError)
        ↓
Debounce 100ms
        ↓
jsonToGraph(parsedJson)
        ↓
layoutGraph(nodes, edges)  // Dagre layout
        ↓
Filter visible nodes (respect expandedNodes)
        ↓
Store updates: nodes, edges, parsedJson
        ↓
NodeCanvas re-renders with new React Flow nodes
```

### Canvas to Editor Flow

```
User clicks node in canvas
        ↓
handleNodeSelect(path)
        ↓
selectPath(path) in store
        ↓
EditorWorkspace detects selectedPath change
        ↓
CodeEditor scrolls to line (via path-to-line.ts)
        ↓
Editor highlights the corresponding JSON segment
```

### Graph Mutation Flow

```
User adds/deletes node via canvas context menu
        ↓
json-mutations.ts modifies parsedJson
        ↓
setJsonText(JSON.stringify(modifiedJson))
        ↓
Same flow as "Editor to Canvas" rebuilds graph
```

### Validation Flow

```
setJsonText triggers
        ↓
validateJson() called
        ↓
AJV validates against schema
        ↓
validationErrors stored in state
        ↓
ErrorPanel displays errors
        ↓
CodeEditor shows inline markers
```

---

## Key Design Decisions

### Why Zustand Instead of Redux

Zustand was chosen over Redux for several reasons:

- **Minimal Boilerplate**: No actions, reducers, or action creators required. The entire store fits in one file.
- **TypeScript Native**: Full type inference without additional setup.
- **Small Bundle**: ~1KB vs Redux's larger footprint.
- **Sufficient for Scale**: The application state is complex enough to warrant a store, but not so complex that Redux patterns add value.

### Why React Flow

React Flow provides:

- **Declarative API**: Nodes and edges are simple data structures, making state synchronization straightforward.
- **Built-in Interactions**: Pan, zoom, selection, and dragging work out of the box.
- **Custom Node Types**: Easy to create specialized nodes for different JSON value types.
- **Performance**: Handles hundreds of nodes efficiently.

### Why Monaco Editor

Monaco Editor (the VS Code editor) was chosen because:

- **Feature Parity**: JSON syntax highlighting, error markers, and folding work identically to VS Code.
- **Familiarity**: Users already know the interface from VS Code.
- **Performance**: Handles large JSON files with minimal lag.
- **Path Mapping**: Built-in APIs allow mapping cursor positions to JSON paths.

### Why AJV for Validation

AJV provides:

- **JSON Schema Standard**: Full support for JSON Schema Draft 7+.
- **Performance**: Schema compilation makes validation fast after initial load.
- **Error Quality**: Detailed error messages with paths and line numbers.
- **Format Support**: Built-in validation for dates, emails, URIs, etc.

### Split View Pattern

The draggable split view in EditorWorkspace allows users to:

- Focus on code (editor-only mode)
- Focus on visualization (canvas-only mode)
- Work with both simultaneously (split mode)

The divider uses percentage-based widths with a 20%/80% constraint to prevent either panel from becoming unusable.

### Security: Memory-Only Token Storage

The `gatewayToken` is stored only in Zustand state and never persisted to localStorage or sessionStorage. This prevents XSS attacks from stealing tokens via stored data. The tradeoff is that tokens are lost on page refresh, requiring re-authentication.

### Debounced Graph Rebuilds

JSON text changes trigger graph rebuilds after a 100ms debounce. This prevents:

- Excessive layout calculations while typing
- UI freezing on large JSON files
- Premature error display while the user is still typing

The history system uses a separate 500ms debounce to group rapid changes into single undo steps.

---

## File Dependencies

Key dependencies between modules:

- **app-store.ts** imports from: `json-to-graph.ts`, `validation.ts`, `node-persistence.ts`, `types/*`
- **EditorWorkspace.tsx** imports from: `app-store.ts`, `viewStore.ts`, `file-manager.ts`, components
- **json-to-graph.ts** imports from: `types/canvas.ts`
- **path-to-line.ts** has no dependencies (pure utility)
- **useKeyboardShortcuts.ts** imports from: `app-store.ts`

---

## Technology Stack Summary

| Concern | Technology | Rationale |
|---------|-----------|-----------|
| Framework | Next.js 14 | Static export, fast refresh, production-ready |
| State | Zustand | Minimal API, TypeScript native |
| Canvas | React Flow | Purpose-built for node graphs |
| Editor | Monaco Editor | VS Code quality, path mapping |
| Validation | AJV | JSON Schema standard, fast |
| Layout | Dagre | Automatic graph layout algorithms |
| Styling | Tailwind CSS | Utility-first, design tokens |
| Testing | Jest + Playwright | Unit and E2E coverage |

---

## Adding New Features

When extending the application:

1. **New state fields**: Add to `AppState` interface in `app-store.ts`
2. **New actions**: Add to `AppActions` interface and implement in store creator
3. **New node types**: Add to `CanvasNode` type, create React component, register in `NodeCanvas`
4. **New file operations**: Extend `file-manager.ts` with File System Access API methods
5. **New keyboard shortcuts**: Add to `useKeyboardShortcuts.ts`

Always maintain the unidirectional data flow: user action → store update → component re-render.
