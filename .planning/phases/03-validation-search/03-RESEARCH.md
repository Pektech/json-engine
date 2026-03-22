# Phase 3: Validation & Search — Research

**Researched:** 2026-03-22
**Status:** Ready for planning

## Summary

Phase 3 adds validation, error display, search functionality, and node position persistence to the JSON.engine editor. This research covers AJV integration, Monaco error markers, React Flow search/filter, and sidecar file persistence patterns.

---

## 1. AJV Schema Validation

### Recommended Library
- **ajv** (v8.12+) — Fast JSON Schema validator
- **ajv-errors** — Custom error messages

### Implementation Pattern
```typescript
import Ajv from 'ajv';
import addErrors from 'ajv-errors';

const ajv = new Ajv({ 
  allErrors: true,
  verbose: true,
  $data: true
});
addErrors(ajv);

// Pre-compile schema for performance
const validate = ajv.compile(openclawSchema);
```

### Performance Strategy
- Pre-compile schema once on app load
- Debounce validation at 100ms (well under 500ms requirement)
- Use Web Worker for large files if needed
- Cache validation results by content hash

### Error Format
```typescript
interface ValidationError {
  path: string;          // JSON path like "config.gateway.port"
  line: number;          // Line number in editor
  message: string;       // Human-readable error
  severity: 'error' | 'warning';
  schemaPath?: string;   // Path in schema for hints
}
```

---

## 2. Monaco Editor Error Integration

### Setting Error Markers
```typescript
import { editor } from 'monaco-editor';

const model = editor.getModel();
const markers = validationErrors.map(err => ({
  startLineNumber: err.line,
  startColumn: err.column || 1,
  endLineNumber: err.line,
  endColumn: err.columnEnd || 100,
  message: err.message,
  severity: monaco.MarkerSeverity.Error
}));

editor.setModelMarkers(model, 'json-engine', markers);
```

### Hover Provider for Schema Hints
```typescript
monaco.languages.registerHoverProvider('json', {
  provideHover: (model, position) => {
    const path = getPathAtPosition(model, position);
    const schemaInfo = getSchemaInfo(path);
    return {
      contents: [
        { value: `**${schemaInfo.title}**` },
        { value: schemaInfo.description }
      ]
    };
  }
});
```

---

## 3. React Flow Search & Filter

### Search Implementation
```typescript
// Filter nodes based on search query
const filteredNodes = useMemo(() => {
  if (!searchQuery) return nodes;
  const query = searchQuery.toLowerCase();
  return nodes.filter(node => 
    node.data.label.toLowerCase().includes(query) ||
    node.data.value?.toString().toLowerCase().includes(query)
  );
}, [nodes, searchQuery]);

// Dim non-matching nodes
const nodesWithVisibility = filteredNodes.map(node => ({
  ...node,
  style: {
    ...node.style,
    opacity: searchQuery && !filteredNodes.includes(node) ? 0.2 : 1
  }
}));
```

### Search UI Pattern
- Search input in TopAppBar or floating overlay
- Real-time filtering as user types
- Highlight matching text in nodes
- Show "X of Y matches" counter

---

## 4. Node Position Persistence

### Sidecar File Format (.json-engine.json)
```json
{
  "version": "1.0",
  "lastModified": "2026-03-22T10:30:00Z",
  "positions": {
    "$.config.gateway": { "x": 100, "y": 200 },
    "$.config.services[0]": { "x": 300, "y": 200 }
  },
  "collapsed": {
    "$.config.services": true
  },
  "view": {
    "zoom": 1.0,
    "position": { "x": 0, "y": 0 }
  }
}
```

### Storage Strategy
- Save to `<original-filename>.json-engine.json` alongside edited file
- Debounce saves at 500ms to prevent excessive writes
- Use File System Access API for persistence
- Gracefully handle missing sidecar (use auto-layout)

### Position Restoration
```typescript
const applySavedPositions = (nodes: Node[], positions: Record<string, XYPosition>) => {
  return nodes.map(node => {
    const saved = positions[node.data.jsonPath];
    return saved ? { ...node, position: saved } : node;
  });
};
```

---

## 5. Error Display Patterns

### Canvas Error Badges
```typescript
// In JsonNode component
{hasErrors && (
  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full animate-pulse">
    <span className="sr-only">Has errors</span>
  </div>
)}
```

### Error Panel Component
- Collapsible panel below editor or sidebar
- Group errors by severity
- Click error to jump to line in editor
- Show error count badge in toolbar

### Schema Hints on Hover
- Use React Flow's node tooltip
- Show description, type, constraints
- Link to full schema documentation

---

## 6. Save Blocking with Override

### Pattern
```typescript
const handleSave = async () => {
  if (validationErrors.length > 0 && !userOverride) {
    setShowConfirmDialog(true);
    return;
  }
  await performSave();
};
```

### UI Pattern
- Disable save button when errors exist
- Show warning icon with tooltip explaining why
- Confirm dialog with "Save anyway" option
- Remember override for current session

---

## 7. Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| AJV validate() mutates data | Always pass a copy: `validate(JSON.parse(JSON.stringify(data)))` |
| Monaco markers not clearing | Call `setModelMarkers(model, 'owner', [])` to clear |
| Node positions drift | Store positions by JSON path, not node ID (IDs change on re-parse) |
| Validation too slow | Debounce input, cache compiled schema, use Web Worker |
| Sidecar file conflicts | Include timestamp, merge on conflict with user prompt |
| Search performance | Use useMemo, limit to 100 results, debounce at 150ms |

---

## 8. Validation Architecture

### Architecture for Phase 3
- Validation runs on every editor change (debounced)
- Errors stored in Zustand store
- Components subscribe to relevant error slices
- Monaco markers updated from store
- Canvas badges use error data from store
- Error panel displays grouped errors

### Performance Targets
- Validation: < 500ms for 10KB JSON
- Search filter: < 50ms for 100 nodes
- Position save: Async, non-blocking
- Editor markers: < 100ms after validation

---

## 9. Recommended Plan Structure

Based on this research, Phase 3 should be organized into 4 plans:

1. **AJV Integration** — Core validation engine with schema loading
2. **Error Display** — Canvas badges, editor markers, error panel
3. **Canvas Search** — Search input, node filtering, highlight
4. **Node Persistence** — Position tracking, sidecar file, save/load

Each plan should include specific acceptance criteria around performance targets.
