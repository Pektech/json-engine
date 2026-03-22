# Research for JSON Editor - Phase 3: Validation & Search Implementation

## 1. Executive Summary

This research document synthesizes findings for implementing the Validation & Search features required in Phase 3 for the JSON.editor application. The core requirements encompass AJV schema validation integration with Monaco Editor, React Flow node search capabilities, node position persistence mechanisms, and performance-optimized validation (sub-500ms response time).

The implementation strategy leverages existing technologies in the stack (AJV, Monaco Editor, React Flow) with minimal new dependencies. Key architectural patterns include centralized state management via Zustand, debounced validation computation, and integrated error visualization components.

## 2. AJV (Another JSON Schema Validator) Integration Patterns for React/Next.js

### Recommended Libraries and Versions

- **Primary**: `ajv@^8.17.1` (already installed in the project)
- **Validation plugins**: `ajv-formats@^3.0.1` (for date, email, etc.)
- **Async compilation support**: `ajv-async@^1.0.0` (for complex validations)

### Implementation Patterns

#### State-Based Validator Integration

AJV should be initialized once in the store and maintained as part of application state:

```typescript
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

interface SchemaState {
  ajv: Ajv
  currentSchema: any | null
  compiledSchemaValidate: ((data: any) => boolean) | null
  schemaErrors: ValidationIssue[]
}

// In app store
const initializeValidator = (schema: any) => {
  const ajv = new Ajv({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  
  return { ajv, compiledSchemaValidate: validate, currentSchema: schema }
}

const validateJson = (jsonData: any) => {
  if (!compiledSchemaValidate) return []
  const isValid = compiledSchemaValidate(jsonData)
  
  return isValid 
    ? [] 
    : compiledSchemaValidate.errors?.map(error => processAjvError(error)) || []
}
```

#### Schema Loading Strategy

The application should follow the hierarchy defined in the specification:

1. **Gateway API** (online mode): Request schema from connected OpenClaw gateway
2. **Bundled schema** (offline fallback): Load static JSON Schema from `/public/schemas/openclaw.json`
3. **Custom URL** (advanced): Allow user to specify custom schema endpoint

### Potential Pitfalls and Avoidance Strategies

- **Memory Leaks**: Store and dispose AJV instances properly to avoid accumulating validators over time.
- **Performance degradation**: Pre-compile validators when schemas update rather than validating raw at each edit.
- **Bundle size impact**: Load AJV asynchronously to keep initial bundle small.

## 3. Monaco Editor Error Marker and Validation Integration

### Current State Analysis

From `CodeEditor.tsx`, Monaco is configured for general syntax validation but lacks schema-based validation. The editor already implements path/line conversion utilities (`path-to-line.ts`) and exposes validation callback interface.

### Implementation Patterns

#### Marker Management Service

Create a dedicated service to translate AJV errors to Monaco markers:

```typescript
// Monaco requires importing directly from monaco-editor package
import type { editor } from 'monaco-editor'
import { pathToLine } from '@/lib/path-to-line'

interface ValidationIssue {
  path: string
  message: string
  severity: 'error' | 'warning'
  code?: string
  suggestedValue?: any
}

const mapValidatorToMarkers = (
  jsonValue: string,
  errors: ValidationIssue[]
): editor.IMarkerData[] => {
  return errors.map(error => {
    const lineLocation = pathToLine(jsonValue, error.path)
    
    return {
      severity: error.severity === 'error' 
        ? monaco.MarkerSeverity.Error 
        : monaco.MarkerSeverity.Warning,
      message: enhanceErrorMessage(error.message, error.suggestedValue),
      startLineNumber: lineLocation?.line || 0,
      startColumn: lineLocation?.column || 1,
      endLineNumber: lineLocation?.line || 0,
      endColumn: Infinity, // Until end of line
      code: error.code || 'schema-validation'
    }
  })
}
```

#### Performance Optimization Approach

- Apply validation result debouncing (200-300ms delay post-edit)
- Batch errors to prevent marker thrashing
- Clear old markers before setting new ones
- Cache mapping results between JSON parsing and actual markers

### Potential Pitfalls

- **Syntax errors breaking schema validation**: Prioritize syntax validation before schema validation
- **Excessive marker updates**: Accumulate errors and update markers in discrete batches

## 4. React Flow Node Search/Filter Implementation Strategies

### Implementation Pattern: Overlay-based Filtering

Based on React Flow best practices, implement search as a state layer over existing nodes rather than modifying graph structure:

```typescript
// In NodeCanvas.tsx
const [filteredNodes, setFilteredNodes] = useState<Node[]>([])
const [searchTerm, setSearchTerm] = useState('')
const [highlightedNodeId, setHighlightedNode] = useState<string | null>(null)

useEffect(() => {
  if (!searchTerm.trim()) {
    setFilteredNodes(nodes)
    return
  }
  
  const searchTermLower = searchTerm.toLowerCase()
  const matchedNodeIds = new Set(
    nodes
      .filter(node => 
        node.data.label.toLowerCase().includes(searchTermLower) ||
        node.data.path.toLowerCase().includes(searchTermLower)
      )
      .map(node => node.id)
  )
  
  // Show matched nodes + parents (for context)
  const nodesWithPathContext = nodes.map(node => {
    const isMatched = matchedNodeIds.has(node.id)
    const isParentInPath = edges.some(edge => 
      matchedNodeIds.has(edge.target) &&
      calculatePathAncestors(node.id).includes(edge.target)
    )
    
    return {
      ...node,
      hidden: !(isMatched || isParentInPath),
      opacity: isMatched ? 1 : 0.4
    }
  })
  
  setFilteredNodes(nodesWithPathContext)
}, [searchTerm, nodes, edges])
```

### UI Implementation Layer

Create a dedicated floating search bar overlay that doesn't interfere with canvas interactions:

```tsx
const SearchOverlay = () => (
  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-96">
    <div className="relative flex items-center">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search nodes by key name..."
        className="w-full px-4 py-2 pl-10 bg-surface-container-high border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        onKeyDown={handleKeyDown}
      />
      <SearchIcon className="absolute left-3 text-on-surface-variant" />
      <kbd className="text-xs ml-2 text-on-surface-variant">Ctrl+K</kbd>
      
      {searchCount > 0 && (
        <span className="absolute right-2 text-xs text-on-surface-variant">
          {currentIndex + 1}/{searchCount}
        </span>
      )}
    </div>
  </div>
)
```

### Potential Pitfalls 

- **Performance degradation**: Use virtualization for search results when dealing with 200+ nodes
- **User confusion**: Preserve parent relationship visibility to maintain contextual meaning of matches

## 5. Node Position Persistence Pattern

### Implementation Architecture

Following the specification requiring persistence to `.json-engine.json` alongside edited files:

```typescript
// file-manager.ts needs enhancement for sidecar persistence
interface SidecarConfig {
  fileHash: string
  positions: Record<string, { x: number; y: number }>
  timestamps: Record<string, number>
  layoutAlgo: string // 'dagre', 'grid', 'custom'
}

export const saveNodePositions = async (
  fileName: string, 
  positions: Record<string, { x: number; y: number }> = {}
) => {
  const hash = await computeFileHash(fileName)
  const config: SidecarConfig = {
    fileHash: hash,
    positions: positions,
    timestamps: getTimestamps(positions),
    layoutAlgo: 'dagre' // default
  }
  
  const sidecarName = `${fileName}.engine.json`
  await fileSystem.writeFile(sidecarName, JSON.stringify(config, null, 2))
}

export const loadNodePositions = async (
  fileName: string
): Promise<Record<string, { x: number; y: number }> | null> => {
  const sidecarName = `${fileName}.engine.json`
  try {
    const content = await fileSystem.readFile(sidecarName)
    const config: SidecarConfig = JSON.parse(content)
    
    // Validate that file hasn't changed significantly
    const currentHash = await computeFileHash(fileName)
    if (config.fileHash !== currentHash) {
      console.warn("File hash mismatch, not restoring positions")
      return null
    }
    
    return config.positions
  } catch {
    return null // No sidecar exists, use default positions
  }
}
```

### Integration with Existing Code

Update `app-store.ts` to include position persistence state and operations:

```typescript
interface PositionPersistenceState {
  savedPositions: Record<string, { x: number; y: number }> | null
  shouldOverrideLayout: boolean
  loadNodePositions: (fileName: string) => Promise<void>
  saveNodePositions: (fileName: string) => Promise<void>
}

// Extend existing store with this functionality
saveNodePositions: (filePath: string) => {
  const { nodes, selectedFile } = get()
  const positions = nodes.reduce((acc, node) => {
    acc[node.id] = node.position
    return acc
  }, {} as Record<string, { x: number; y: number }>)
  
  saveNodePositions(filePath, positions)
}
```

### Potential Pitfalls

- **Concurrent access conflicts**: Implement optimistic locking or merge strategies when multiple edits occur
- **Position corruption**: Validate position integrity when loading (ensure x/y are reasonable numbers)

## 6. Comprehensive Error Visualization System

### Multi-Modal Error Display Architecture

Implementing error visualization across canvas badges, editor inline markers, and error panel:

```typescript
// Centralized error type definition
interface ValidationError {
  id: string // UUID for tracking
  path: string // JSON path (e.g., "users[0].name")
  message: string
  severity: 'error' | 'warning' | 'info'
  source: 'syntax' | 'schema'
  suggestion?: string
  relatedPaths?: string[]
  line?: number
  column?: number
}

// In app-store.ts
interface ValidationState {
  errors: ValidationError[]
  groupedErrors: Record<'syntax' | 'schema', ValidationError[]>
  activeErrorId: string | null
  focusedLine: number | null
}
```

#### Canvas Error Rendering (Enhanced JsonNode)

Modify `JsonNode.tsx` to show error indicators:

```tsx
export function JsonNode({ data, selected }: NodeProps<JsonNodeData>) {
  // Get errors for this node path
  const nodeErrors = useSelector(errors => 
    errors.filter(err => err.path === data.path)
  )
  
  const hasError = nodeErrors.some(err => err.severity === 'error')
  const hasWarning = nodeErrors.some(err => err.severity === 'warning')
  
  return (
    <div className="relative">
      {/* Position the error badge in top-right corner */}
      {hasError && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full border border-surface"></div>
      )}
      {hasWarning && !hasError && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-tertiary rounded-full border border-surface"></div>
      )}
      
      {/* Original node content... */}
    </div>
  )
}
```

#### Error Panel Component

Create an `ErrorPanel.tsx` in the panels directory:

```tsx
interface ErrorPanelProps {
  errors: ValidationError[]
  onSelectError: (error: ValidationError) => void
  onClearError?: (errorId: string) => void
}

export function ErrorPanel({ errors, onSelectError }: ErrorPanelProps) {
  return (
    <div className="bg-surface-container-lowest p-4 flex flex-col h-full">
      <h3 className="font-semibold mb-4 text-on-surface">Validation Issues</h3>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        {errors.map(error => (
          <div 
            key={error.id}
            className={`
              p-3 rounded cursor-pointer transition-colors hover:bg-surface-container
              ${error.severity === 'error' ? 'border-l-4 border-error' : 
                error.severity === 'warning' ? 'border-l-4 border-tertiary' : 
                'border-l-4 border-outline-variant'}
            `}
            onClick={() => onSelectError(error)}
          >
            <div className="font-medium text-sm">{error.message}</div>
            <div className="text-xs text-on-surface-variant mt-1">{error.path}</div>
            
            {error.suggestion && (
              <div className="text-xs text-primary mt-1">Suggestion: {error.suggestion}</div>
            )}
          </div>
        ))}
        
        {errors.length === 0 && (
          <div className="text-center text-sm text-on-surface-variant py-8">
            No validation issues found
          </div>
        )}
      </div>
    </div>
  )
}
```

### Performance Optimization Considerations

- **Debounced rendering**: Consolidate error updates and render changes in batches
- **Virtual scrolling**: For 50+ errors, implement virtualization in ErrorPanel
- **Error deduplication**: Aggregate similar errors to prevent overwhelming user

## 7. Performance Optimization for Validation Sub-500ms

### Architecture for Responsiveness

The 500ms requirement necessitates a sophisticated approach to validation timing:

```typescript
interface ValidationStats {
  lastValidationTimeMs: number
  validationQueueLength: number
  validationThroughput: number // validations per second
  throttlingApplied: boolean
}

class ValidationThrottler {
  private debouncer: NodeJS.Timeout | null = null
  private readonly validationThresholdMs = 100
  private readonly validationMaxTimeoutMs = 500
  
  constructor(private onValidationError: (errors: ValidationError[]) => void) {}
  
  validate = async (jsonData: any, schema: any, jsonValue: string) => {
    // If validation takes longer than ~400ms, we may timeout
    // So prioritize critical validation paths
    const startTime = Date.now()
    
    try {
      const errors = await Promise.race([
        performValidation(jsonData, schema),
        new Promise<ValidationError[]>((_resolve, reject) => {
          setTimeout(() => reject(new Error('Validation timeout')), this.validationMaxTimeoutMs - 100)
        })
      ])
      
      const validationTime = Date.now() - startTime
      
      // Log performance metrics
      console.info(`Validation completed in ${validationTime}ms`)
      return errors
    } catch(error) {
      if (error.message === 'Validation timeout') {
        // Return immediate critical syntax errors as partial validation
        return extractCriticalSyntaxErrors(jsonValue)
      }
      throw error
    }
  }
  
  scheduleValidation = (immediate = false) => {
    if (this.debouncer) clearTimeout(this.debouncer)
    
    const delay = immediate ? 0 : this.validationThresholdMs
    this.debouncer = setTimeout(() => {
      // Actual validation here
    }, delay)
  }
}
```

### Optimized Validation Approaches

1. **Schema pre-compilation**: Compile schemas once on schema change, reuse for multiple validations
2. **Incremental validation**: If only small changes occurred, validate only changed paths
3. **Lazy error formatting**: Post-process validation results only when UI displays
4. **Worker thread isolation**: Consider moving heavy validation to Web Worker to avoid UI blocking

## 8. Schema Hint Display Implementation

### Integration with OpenClaw Schema Format (From SPEC.md)

OpenClaw's schema format includes rich metadata. Implement parsing for enhanced UX:

```typescript
interface OpenClawSchema {
  path: string
  schema: any
  hint?: {
    label?: string
    help?: string  
    tags?: string[]
    category?: string
    advanced?: boolean
  }
  children?: OpenClawSchema[]
}

// Convert OpenClaw schema to AJV-compatible format
const convertOpenClawSchema = (openClawSchema: OpenClawSchema): { ajvFormat: any, hints: Map<string, OpenClawHint> } => {
  const hints = new Map<string, OpenClawHint>()
  const ajvFormat = processSchemaWithHints(openClawSchema, hints)
  
  return { ajvFormat, hints }
}
```

#### Node Tooltip Enhancement

Enhance `JsonNode.tsx` to include schema hints:

```tsx
import { Tooltip } from '@radix-ui/react-tooltip'

return (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <div className="flex flex-col">
          <div className="truncate">
            {hint?.label || label}
          </div>
          <NodeTypeBadge type={type} />
        </div>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <div className="max-w-xs p-2 bg-surface-container-high rounded text-sm">
          {hint?.help && <p>{hint.help}</p>}
          {hint?.tags?.length > 0 && (
            <div className="mt-1 flex gap-1">
              {hint.tags.map(tag => (
                <span key={tag} className="text-xs px-1.5 py-0.5 bg-tertiary/20 text-tertiary rounded">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
)
```

## 9. Recommended Implementation Sequence

### Phase 1: Core Validation Infrastructure (Days 1-2)
1. Add schema validation methods to `app-store.ts`
2. Update `CodeEditor.tsx` to consume and display validation errors as Monaco markers
3. Test performance with sample OpenClaw configurations

### Phase 2: Canvas Error Visualization (Day 3)
1. Enhance `JsonNode.tsx` with error/warning badges
2. Update store to track positional errors linked to canvas nodes
3. Validate visual clarity without overwhelming interface

### Phase 3: Error Panel Implementation (Day 4)
1. Create `ErrorPanel.tsx` component
2. Implement error selection flow (click error -> highlight related node)
3. Integrate with search functionality for "next error" navigation

### Phase 4: Schema Hints and Performance (Day 5)
1. Implement schema metadata consumption and display
2. Refine validation perfomance to consistently stay under 500ms
3. Add save prevention when validation errors exist

## 10. Conclusion

The research indicates that implementation of Phase 3 validation & search features is feasible within the current technology stack with careful attention to performance requirements. The critical path involves:

1. Robust state management for validation errors across editor, canvas, and error display
2. Performance-optimized validation scheduling to maintain responsiveness
3. Consistent error display paradigms across all interface surfaces
4. Proper schema integration with OpenClaw's specialized format

The existing architecture using Zustand, AJV, and React Flow provides a solid foundation for implementing these features while maintaining the clean separation of concerns already established in the codebase.

