# Coding Conventions

## Overview
Following "The Engineered Canvas" design philosophy with precision and intentionality.

---

## Code Style

### TypeScript
- **Strict mode:** Enabled
- **Explicit types:** Required for function parameters and returns
- **Interface naming:** PascalCase with descriptive names
- **No `any`:** Use `unknown` or proper types

```typescript
// Good
interface JsonNode {
  id: string;
  type: NodeType;
  value: unknown;
}

function parseJson(input: string): JsonNode[] | null {
  // Implementation
}

// Bad
function parseJson(input: any): any {
  // Implementation
}
```

### React Components
- **Function components:** Arrow functions preferred
- **Props interface:** Named `{ComponentName}Props`
- **Default exports:** For page components
- **Named exports:** For reusable components

```typescript
// Good
interface JsonNodeProps {
  node: JsonNode;
  onSelect: (id: string) => void;
}

export function JsonNode({ node, onSelect }: JsonNodeProps) {
  // Implementation
}

// Bad
export default function(props: any) {
  // Implementation
}
```

---

## Naming Conventions

### Variables & Functions
- **camelCase:** Variables, functions, hooks
- **PascalCase:** Components, types, interfaces, enums
- **UPPER_SNAKE_CASE:** Constants, environment variables

```typescript
const MAX_RETRY_COUNT = 3;

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

function validateDocument(doc: JsonDocument): ValidationResult {
  // Implementation
}

const useSchema = () => {
  // Implementation
};
```

### File Naming
- **Components:** PascalCase.tsx (`TopAppBar.tsx`)
- **Hooks:** camelCase.ts starting with `use` (`useSchema.ts`)
- **Utilities:** camelCase.ts (`jsonParser.ts`)
- **Types:** camelCase.ts with type suffix (`jsonNodeTypes.ts`)

---

## Design Token Usage

### Color Tokens (Required)
| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | #131313 | Main background |
| `surface-container-lowest` | #0e0e0e | Sidebar, editor bg |
| `surface-container-high` | #2a2a2a | Node cards |
| `primary` | #9fcaff | Links, accents |
| `primary-container` | #007acc | Primary buttons |
| `outline-variant` | #404751 | Borders (ghost) |
| `error` | #ffb4ab | Error states |

### Typography
- **UI Text:** Inter (400, 500, 600)
- **Labels:** Space Grotesk (300, 400, 500), ALL CAPS
- **Code:** JetBrains Mono

```typescript
// Tailwind classes
text-on-surface           // Primary text
text-on-surface-variant   // Secondary text
font-label                // Space Grotesk
uppercase tracking-widest // Label style
```

---

## Component Patterns

### The "No-Line" Rule
- NO 1px solid borders for layout
- Use background color shifts instead
- Ghost borders at 20% opacity when necessary

```typescript
// Good - tonal separation
<div className="bg-surface-container-low">
  <div className="bg-surface-container-high">
    {/* Content */}
  </div>
</div>

// Bad - explicit borders
<div className="border border-gray-600">
  {/* Content */}
</div>
```

### Glassmorphism
For floating elements (modals, palettes):
```typescript
<div className="bg-surface-variant/80 backdrop-blur-[20px]">
  {/* Content */}
</div>
```

---

## State Management

### Zustand Store Pattern
```typescript
interface EditorState {
  document: JsonDocument | null;
  selection: string | null;
  errors: ValidationError[];
  setDocument: (doc: JsonDocument) => void;
  selectNode: (id: string) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  document: null,
  selection: null,
  errors: [],
  setDocument: (doc) => set({ document: doc }),
  selectNode: (id) => set({ selection: id }),
}));
```

---

## Error Handling

### Validation Errors
```typescript
interface ValidationError {
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

// Display in UI with proper styling
<span className="text-error">{error.message}</span>
```

### Error Boundaries
- Wrap major sections with error boundaries
- Display user-friendly error messages
- Log errors for debugging

---

## Accessibility

### Required Practices
- Keyboard navigation support
- ARIA labels for interactive elements
- Focus indicators (subtle, matching design)
- Color contrast compliance

### ARIA Pattern
```typescript
<button
  aria-label="Save configuration"
  aria-pressed={isSaving}
  className="..."
>
  <span className="material-symbols-outlined">save</span>
</button>
```
