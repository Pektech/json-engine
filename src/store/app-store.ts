import { create } from 'zustand'
import { jsonToGraph, layoutGraph } from '@/lib/json-to-graph'
import { validationService } from '@/lib/validation'
import type { CanvasNode, CanvasEdge } from '@/types/canvas'
import type { ValidationError } from '@/types/validation'
import type { JsonEngineState } from '@/types/persistence'
import { loadNodePositions, saveNodePositions } from '@/services/node-persistence'

interface AppState {
  jsonText: string
  parsedJson: any | null
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  selectedPath: string | null
  parseError: string | null
  isDirty: boolean
  expandedNodes: Set<string>
  validationErrors: ValidationError[]
  isValidating: boolean
  searchQuery: string
  filteredNodeIds: Set<string>
  currentFile: string | null
  nodePositions: Record<string, { x: number; y: number }>
  userOverrideSave: boolean
  gatewayToken: string | null
  currentFileHandle: FileSystemFileHandle | null
  history: string[]
  historyIndex: number
}

interface AppActions {
  setJsonText: (text: string) => void
  selectPath: (path: string | null) => void
  updateNodePosition: (id: string, position: { x: number; y: number }) => void
  expandNode: (id: string) => void
  collapseNode: (id: string) => void
  getSelectedNode: () => CanvasNode | undefined
  validateJson: () => void
  updateValidationErrors: (errors: ValidationError[]) => void
  setSearchQuery: (query: string) => void
  getFilteredNodes: () => CanvasNode[]
  canSave: () => boolean
  setUserOverrideSave: (override: boolean) => void
  loadFile: (filePath: string, content: string) => Promise<void>
  savePositions: () => void
  setGatewayToken: (token: string | null) => void
  clearGatewayToken: () => void
  undo: () => void
  redo: () => void
  setFileHandle: (handle: FileSystemFileHandle | null) => void
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const MAX_HISTORY = 50
const HISTORY_DEBOUNCE_MS = 500  // 500ms after typing stops = 1 undo step
let pendingHistoryPush: ReturnType<typeof setTimeout> | null = null

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  jsonText: '{}',
  parsedJson: {},
  nodes: [],
  edges: [],
  selectedPath: null,
  parseError: null,
  isDirty: false,
  expandedNodes: new Set(['root']),
  validationErrors: [],
  isValidating: false,
  searchQuery: '',
  filteredNodeIds: new Set(),
  currentFile: null,
  nodePositions: {},
    userOverrideSave: false,
    gatewayToken: null,
    currentFileHandle: null,
    history: ['{}'],  // Start with initial state
    historyIndex: 0,

  setJsonText: (text: string) => {
    set({ jsonText: text, isDirty: true, validationErrors: [] })

    // Clear existing debounce timer
    if (pendingHistoryPush) clearTimeout(pendingHistoryPush)
    
    // Save to history after user stops typing (500ms debounce)
    pendingHistoryPush = setTimeout(() => {
      const state = get()
      set((s) => {
        const newHistory = s.history.slice(0, s.historyIndex + 1)
        newHistory.push(text)
        if (newHistory.length > MAX_HISTORY) newHistory.shift()
        return { history: newHistory, historyIndex: newHistory.length - 1 }
      })
      pendingHistoryPush = null
    }, HISTORY_DEBOUNCE_MS)

    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(() => {
      try {
        const parsed = JSON.parse(text)
        const graph = jsonToGraph(parsed)
        const layoutedNodes = layoutGraph(graph.nodes, graph.edges)
        
        const { expandedNodes } = get()
        const visibleNodes = layoutedNodes.filter(node => {
          const parentPath = node.id.split(/\.|\[/)[0]
          return expandedNodes.has(parentPath) || node.id === 'root'
        })

        const visibleNodeIds = new Set(visibleNodes.map(n => n.id))
        const visibleEdges = graph.edges.filter(edge => 
          visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
        )

        set({ 
          parsedJson: parsed, 
          nodes: layoutedNodes, 
          edges: visibleEdges, 
          parseError: null,
        })
        
        get().validateJson()
      } catch (error) {
        set({ 
          parseError: error instanceof Error ? error.message : 'Invalid JSON',
          validationErrors: [{
            path: 'root',
            line: 1,
            column: 1,
            message: error instanceof Error ? error.message : 'Invalid JSON',
            severity: 'error',
          }],
        })
      }
    }, 100)
  },

  selectPath: (path: string | null) => {
    set({ selectedPath: path })
  },

  updateNodePosition: (id: string, position: { x: number; y: number }) => {
    const { nodes, nodePositions } = get()
    const updatedNodes = nodes.map(node =>
      node.id === id ? { ...node, position } : node
    )
    
    const updatedPositions = { ...nodePositions, [id]: position }
    set({ nodes: updatedNodes, nodePositions: updatedPositions })
    
    setTimeout(() => {
      get().savePositions()
    }, 500)
  },

  expandNode: (id: string) => {
    const { expandedNodes } = get()
    const newExpanded = new Set(expandedNodes)
    newExpanded.add(id)
    set({ expandedNodes: newExpanded })
  },

  collapseNode: (id: string) => {
    const { expandedNodes } = get()
    const newExpanded = new Set(expandedNodes)
    newExpanded.delete(id)
    set({ expandedNodes: newExpanded })
  },

  getSelectedNode: () => {
    const { nodes, selectedPath } = get()
    return nodes.find(node => node.id === selectedPath)
  },

  validateJson: () => {
    const { jsonText } = get()
    set({ isValidating: true })
    
    try {
      const errors = validationService.validateJsonString(jsonText)
      set({ validationErrors: errors, isValidating: false })
    } catch {
      set({ isValidating: false })
    }
  },

  updateValidationErrors: (errors: ValidationError[]) => {
    set({ validationErrors: errors })
  },

  setSearchQuery: (query: string) => {
    const { nodes } = get()
    
    if (!query.trim()) {
      set({ searchQuery: '', filteredNodeIds: new Set() })
      return
    }
    
    const lowerQuery = query.toLowerCase()
    const filteredIds = new Set(
      nodes
        .filter(node => 
          node.data.label.toLowerCase().includes(lowerQuery) ||
          (node.data.value && node.data.value.toLowerCase().includes(lowerQuery))
        )
        .map(node => node.id)
    )
    
    set({ searchQuery: query, filteredNodeIds: filteredIds })
  },

  getFilteredNodes: () => {
    const { nodes, searchQuery, filteredNodeIds } = get()
    
    if (!searchQuery) {
      return nodes
    }
    
    return nodes.map(node => ({
      ...node,
      style: {
        ...node.style,
        opacity: filteredNodeIds.has(node.id) ? 1 : 0.2,
      },
    }))
  },

  canSave: () => {
    const { validationErrors, userOverrideSave } = get()
    return validationErrors.length === 0 || userOverrideSave
  },

  setUserOverrideSave: (override: boolean) => {
    set({ userOverrideSave: override })
  },

  loadFile: async (filePath: string, content: string) => {
    set({
      currentFile: filePath,
      history: [content],
      historyIndex: 0,
      jsonText: content,
      isDirty: false
    })

    validationService.loadSchema({})

    const persisted = await loadNodePositions(filePath)
    if (persisted) {
      set({ nodePositions: persisted.positions })
    }

    get().setJsonText(content)
  },

  savePositions: () => {
    const { currentFile, nodePositions, expandedNodes } = get()
    
    if (!currentFile) return
    
    const state: JsonEngineState = {
      version: '1.0',
      lastModified: new Date().toISOString(),
      positions: nodePositions,
      collapsed: Object.fromEntries(
        Array.from(expandedNodes).map(id => [id, false])
      ),
      view: { zoom: 1, position: { x: 0, y: 0 } },
    }
    
    saveNodePositions(currentFile, state)
  },

  // SECURITY DECISION: Token is stored memory-only in Zustand store.
  // It is intentionally NOT persisted to localStorage or sessionStorage
  // to prevent XSS attacks from accessing stored tokens.
  // Token is cleared on page reload (memory reset).
  // See: .planning/PROJECT.md § Constraints
  setGatewayToken: (token: string | null) => set({ gatewayToken: token }),
  clearGatewayToken: () => set({ gatewayToken: null }),
  setFileHandle: (handle: FileSystemFileHandle | null) => set({ currentFileHandle: handle }),
  
  undo: () => {
    set((state) => {
      if (state.historyIndex > 0) {
        if (pendingHistoryPush) clearTimeout(pendingHistoryPush)
        return {
          historyIndex: state.historyIndex - 1,
          jsonText: state.history[state.historyIndex - 1],
          isDirty: true,
          validationErrors: []
        }
      }
      return {}
    })
  },
  redo: () => {
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        if (pendingHistoryPush) clearTimeout(pendingHistoryPush)
        return {
          historyIndex: state.historyIndex + 1,
          jsonText: state.history[state.historyIndex + 1],
          isDirty: true,
          validationErrors: []
        }
      }
      return {}
    })
  },
}))
