# Testing

## Overview
Testing strategy for JSON.engine - currently in pre-implementation phase.

---

## Testing Framework (Planned)

| Type | Tool | Purpose |
|------|------|---------|
| Unit | Jest + React Testing Library | Component and utility testing |
| Integration | Jest | Store and hook testing |
| E2E | Playwright | Full user workflows |
| Visual | Storybook | Component isolation and documentation |

---

## Planned Test Structure

```
src/
├── components/
│   ├── canvas/
│   │   ├── NodeCanvas.tsx
│   │   ├── NodeCanvas.test.tsx      # Component tests
│   │   └── __mocks__/
│   │       └── reactflow.ts
│   └── editor/
│       ├── CodeEditor.tsx
│       └── CodeEditor.test.tsx
├── lib/
│   ├── json-parser.ts
│   ├── json-parser.test.ts          # Unit tests
│   └── schema-validator.test.ts
├── stores/
│   ├── editorStore.ts
│   └── editorStore.test.ts          # Store tests
└── e2e/
    ├── open-file.spec.ts            # E2E tests
    ├── edit-json.spec.ts
    └── validate-schema.spec.ts
```

---

## Test Coverage Goals

### Phase 1 (MVP)
| Category | Target | Priority |
|----------|--------|----------|
| JSON Parser | 90% | High |
| Schema Validator | 85% | High |
| File Manager | 80% | High |
| Components | 70% | Medium |
| E2E Critical Paths | 100% | High |

### Critical Paths (E2E)
1. Open file → Display in canvas and editor
2. Edit JSON → Validation errors displayed
3. Select node → Editor scrolls to position
4. Save file → File written correctly
5. Connect to gateway → Schema loaded

---

## Mocking Strategy

### External Dependencies
```typescript
// Monaco Editor mock
jest.mock('@monaco-editor/react', () => ({
  Editor: jest.fn(() => <div data-testid="monaco-editor" />),
}));

// React Flow mock
jest.mock('reactflow', () => ({
  ReactFlow: jest.fn(({ children }) => <div>{children}</div>),
  Background: jest.fn(() => null),
  Controls: jest.fn(() => null),
}));

// File System Access API mock
const mockFileHandle = {
  getFile: jest.fn(),
  createWritable: jest.fn(),
};
```

---

## Testing Patterns

### Component Test Example
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { JsonNode } from './JsonNode';

describe('JsonNode', () => {
  const mockNode = {
    id: 'root.users.0.name',
    type: 'string',
    key: 'name',
    value: 'John',
  };

  it('renders node with correct label', () => {
    render(<JsonNode node={mockNode} onSelect={jest.fn()} />);
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('"John"')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn();
    render(<JsonNode node={mockNode} onSelect={onSelect} />);
    fireEvent.click(screen.getByTestId('json-node'));
    expect(onSelect).toHaveBeenCalledWith('root.users.0.name');
  });
});
```

### Store Test Example
```typescript
import { act } from '@testing-library/react';
import { useEditorStore } from './editorStore';

describe('editorStore', () => {
  it('sets document and clears errors', () => {
    const { setDocument } = useEditorStore.getState();
    
    act(() => {
      setDocument({ content: '{"test": true}', path: '/test.json' });
    });
    
    expect(useEditorStore.getState().document).toEqual({
      content: '{"test": true}',
      path: '/test.json',
    });
    expect(useEditorStore.getState().errors).toEqual([]);
  });
});
```

---

## CI/CD Integration (Planned)

### GitHub Actions Workflow
```yaml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:e2e
      - run: npm run test:coverage
```

---

## Current State

**Status:** Pre-implementation
- No tests exist yet
- Testing infrastructure to be set up in Sprint 1
- Jest and React Testing Library will be added with `npm install`
- Playwright for E2E to be configured in Sprint 4

---

## Testing Checklist (For Implementation)

### Unit Tests
- [ ] JSON parser transforms correctly
- [ ] Schema validator identifies errors
- [ ] File manager handles read/write
- [ ] Gateway client formats requests

### Component Tests
- [ ] NodeCanvas renders nodes
- [ ] CodeEditor syncs with store
- [ ] TopAppBar triggers actions
- [ ] SideNavBar switches panels

### E2E Tests
- [ ] User can open a JSON file
- [ ] User can edit and see canvas update
- [ ] Validation errors appear correctly
- [ ] File saves successfully
