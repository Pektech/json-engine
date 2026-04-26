# Developer Guide

This guide is for developers contributing to JSON.engine. It covers setup, architecture, debugging, and how to add features.

## Setup

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers (for E2E tests)
npx playwright install
```

### First-Run Checklist

1. **Verify Node.js version**: `node --version` (should be 20+)
2. **Install dependencies**: `npm install`
3. **Start dev server**: `npm run dev`
4. **Open app**: http://localhost:3030

The dev server runs on port 3030 by default.

## File Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── page.tsx      # Main application page
│   ├── layout.tsx    # Root layout with providers
│   └── globals.css   # Global styles + Tailwind
├── components/       # React components (grouped by type)
│   ├── canvas/       # React Flow graph components
│   │   ├── NodeCanvas.tsx      # Main graph canvas
│   │   ├── JsonNode.tsx        # Node renderer
│   │   ├── JsonEdge.tsx        # Edge renderer
│   │   ├── SearchBar.tsx       # Canvas search
│   │   ├── ContextMenu.tsx     # Right-click menu
│   │   └── NodeCanvasLoader.tsx # Lazy loader
│   ├── editor/       # Monaco editor components
│   │   ├── CodeEditor.tsx      # Monaco wrapper
│   │   ├── CodeEditorLoader.tsx # Lazy loader
│   │   └── EditorToolbar.tsx   # Editor controls
│   ├── layout/       # App shell components
│   │   ├── TopAppBar.tsx       # Header bar
│   │   ├── SideNavBar.tsx      # Left navigation
│   │   └── KeyboardShortcutsHelp.tsx # Help modal
│   ├── panels/       # Side panels
│   │   └── ErrorPanel.tsx      # Validation errors
│   └── workspace/    # Layout containers
│       └── EditorWorkspace.tsx # Main split view
├── store/            # Zustand state management
│   ├── app-store.ts  # Main application state
│   └── viewStore.ts  # View-specific state
├── lib/              # Pure utility functions
│   ├── json-to-graph.ts   # JSON to React Flow graph
│   ├── json-mutations.ts  # JSON edit operations
│   ├── path-to-line.ts    # Path to line number mapping
│   ├── graph-layout.ts    # Dagre layout utilities
│   ├── validation.ts      # Schema validation
│   └── file-manager.ts    # File System Access API
├── hooks/            # Custom React hooks
│   ├── useKeyboardShortcuts.ts  # Global shortcuts
│   ├── useFocusContext.tsx      # Focus tracking
│   └── useFileManager.ts        # File operations
├── types/            # TypeScript definitions
│   ├── canvas.ts     # Graph/node types
│   ├── validation.ts # Validation types
│   ├── persistence.ts # State persistence types
│   └── file-system.ts # File operation types
└── services/         # Business logic services
    └── node-persistence.ts # Node position storage

e2e/                  # Playwright E2E tests
├── specs/            # Test specifications
│   ├── 01-smoke.spec.ts
│   ├── 02-file-operations.spec.ts
│   └── ... (numbered by test order)
└── pages/            # Page Object Models
    └── AppPage.ts
```

## Debugging

### Port Conflicts

If port 3030 is already in use:

```bash
# Find and kill process on port 3030
fuser -k 3030/tcp

# Then restart the dev server
npm run dev
```

### TypeScript Errors

Run the TypeScript compiler directly to see exact errors:

```bash
npx tsc --noEmit
```

### React Flow Issues

- Ensure `@xyflow/react` v12+ is installed: `npm list @xyflow/react`
- Check that nodes have unique IDs
- Verify `width` and `height` are set on all nodes for layout

### Monaco Editor Not Loading

- Check that the lazy-loaded chunk loaded (look for `components-editor-CodeEditor.js` in Network tab)
- Monaco is lazy-loaded to reduce initial bundle size
- Check browser console for chunk loading errors

### General Debugging Tips

- Use React DevTools browser extension for component state inspection
- Zustand store state can be viewed in React DevTools under "Components"
- Enable Redux DevTools for Zustand (already configured in app-store.ts)

## Testing

### Unit Tests (Jest)

```bash
# Run all unit tests (76 passing)
npm test

# Run in watch mode
npm run test:watch
```

Unit tests cover:
- JSON graph conversion (`json-to-graph.test.ts`)
- Path utilities (`path-to-line.test.ts`)
- Mutations (`json-mutations.test.ts`)
- File manager (`file-manager.test.ts`)

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Debug a specific test
npm run test:e2e:debug
```

### Adding New E2E Tests

Create test files in `e2e/specs/` following the numbering convention:

```
NN-description.spec.ts
```

Example: `10-new-feature.spec.ts`

Use the existing Page Object Model pattern:

```typescript
import { test, expect } from '@playwright/test';
import { AppPage } from '../pages/AppPage';

test.describe('New Feature', () => {
  test('does something', async ({ page }) => {
    const app = new AppPage(page);
    await app.goto();
    // Your test here
  });
});
```

## Adding Features

### Adding a New Node Type

1. **Update type definition** in `src/types/canvas.ts`:

```typescript
export type JsonNodeType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'newtype'
```

2. **Update type detection** in `src/lib/json-to-graph.ts`:

```typescript
export function getJsonType(value: any): JsonNodeType {
  // ... existing checks
  if (isNewType(value)) return 'newtype'
  return 'null'
}
```

3. **Update node rendering** in `src/components/canvas/JsonNode.tsx` if needed

### Adding New Store State

1. **Add to AppState interface** in `src/store/app-store.ts`:

```typescript
interface AppState {
  // ... existing state
  myNewField: string
}
```

2. **Add to initial state**:

```typescript
export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // ... existing initial state
  myNewField: '',
```

3. **Add action function**:

```typescript
interface AppActions {
  // ... existing actions
  setMyNewField: (value: string) => void
}
```

4. **Implement the action**:

```typescript
setMyNewField: (value: string) => {
  set({ myNewField: value })
}
```

### Adding a New Page/View

For Next.js App Router, add to `src/app/page.tsx` or create a new page:

```typescript
// src/app/new-page/page.tsx
export default function NewPage() {
  return <div>New Page Content</div>
}
```

### Adding Keyboard Shortcuts

Edit `src/hooks/useKeyboardShortcuts.ts`:

```typescript
useHotkeys('ctrl+shift+x', (event) => {
  event.preventDefault();
  // Your action here
  useAppStore.getState().someAction();
}, { preventDefault: true, enableOnFormTags: true });
```

The hook uses `react-hotkeys-hook`. Options:
- `preventDefault`: Prevent browser default action
- `enableOnFormTags`: Trigger even when input/textarea is focused
- `enableOnContentEditable`: Trigger on contentEditable elements

## Key Dependencies

| Package | Purpose |
|---------|---------|
| `@xyflow/react` | React Flow graph canvas |
| `@monaco-editor/react` | Monaco code editor |
| `zustand` | State management |
| `@dagrejs/dagre` | Graph layout algorithm |
| `react-hotkeys-hook` | Keyboard shortcuts |
| `ajv` | JSON schema validation |

## Code Patterns

### Using the Store

```typescript
import { useAppStore } from '@/store/app-store'

// In component:
const { jsonText, setJsonText } = useAppStore()

// Outside component (actions):
useAppStore.getState().setJsonText('{}')
```

### File Operations

```typescript
import { useFileManager } from '@/hooks/useFileManager'

const { openFile, saveFile } = useFileManager()

// Open file
const result = await openFile()
if (!('code' in result)) {
  // Success - result.handle, result.content
}

// Save file
await saveFile(handle, content)
```

### JSON Graph Operations

```typescript
import { jsonToGraph, layoutGraph } from '@/lib/json-to-graph'

const graph = jsonToGraph(jsonObject)
const layoutedNodes = layoutGraph(graph.nodes, graph.edges)
```

## Security Notes

- Gateway tokens are stored **memory-only** in Zustand (never localStorage)
- Tokens clear on page reload (memory reset)
- No hardcoded secrets in source code
- Security audits run in CI: `npm run security:check`
