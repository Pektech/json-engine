import { create } from 'zustand'
import { jsonToGraph, layoutGraph } from '@/lib/json-to-graph'
import type { CanvasNode, CanvasEdge } from '@/types/canvas'

interface AppState {
  jsonText: string
  parsedJson: any | null
  nodes: CanvasNode[]
  edges: CanvasEdge[]
  selectedPath: string | null
  parseError: string | null
  isDirty: boolean
  expandedNodes: Set<string>
}

interface AppActions {
  setJsonText: (text: string) => void
  selectPath: (path: string | null) => void
  updateNodePosition: (id: string, position: { x: number; y: number }) => void
  expandNode: (id: string) => void
  collapseNode: (id: string) => void
  getSelectedNode: () => CanvasNode | undefined
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  jsonText: '{}',
  parsedJson: {},
  nodes: [],
  edges: [],
  selectedPath: null,
  parseError: null,
  isDirty: false,
  expandedNodes: new Set(['root']),

  setJsonText: (text: string) => {
    set({ jsonText: text, isDirty: true })

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
      } catch (error) {
        set({ 
          parseError: error instanceof Error ? error.message : 'Invalid JSON',
        })
      }
    }, 100)
  },

  selectPath: (path: string | null) => {
    set({ selectedPath: path })
  },

  updateNodePosition: (id: string, position: { x: number; y: number }) => {
    const { nodes } = get()
    const updatedNodes = nodes.map(node =>
      node.id === id ? { ...node, position } : node
    )
    set({ nodes: updatedNodes })
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
}))
