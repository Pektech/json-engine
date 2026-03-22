export type JsonNodeType = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'

export interface JsonNodeData {
  type: JsonNodeType
  label: string
  value?: string
  depth: number
  path: string
}

export interface CanvasNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: JsonNodeData
  width?: number
  height?: number
}

export interface CanvasEdge {
  id: string
  source: string
  target: string
  type?: string
}

export interface GraphData {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}
