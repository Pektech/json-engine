import type { JsonNodeType, CanvasNode, CanvasEdge, GraphData } from '@/types/canvas'
import { getJsonPathLabel } from '@/lib/json-path'

export function getJsonType(value: any): JsonNodeType {
  if (value === null) return 'null'
  if (typeof value === 'object' && Array.isArray(value)) return 'array'
  if (typeof value === 'object') return 'object'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'number') return 'number'
  if (typeof value === 'boolean') return 'boolean'
  return 'null'
}

export function getLabel(path: string): string {
  return getJsonPathLabel(path)
}

export function jsonToGraph(json: any, path = 'root', depth = 0): GraphData {
  const nodes: CanvasNode[] = []
  const edges: CanvasEdge[] = []
  
  const type = getJsonType(json)
  const label = getLabel(path)
  
  const node: CanvasNode = {
    id: path,
    type: 'jsonNode',
    position: { x: 0, y: 0 },
    data: {
      type,
      label,
      value: type === 'object' || type === 'array' ? undefined : String(json),
      depth,
      path,
    },
    width: 180,
    height: 60,
  }
  
  nodes.push(node)
  
  if (type === 'object' && json !== null) {
    Object.entries(json).forEach(([key, value]) => {
      const childPath = `${path}.${key}`
      const childGraph = jsonToGraph(value, childPath, depth + 1)
      nodes.push(...childGraph.nodes)
      edges.push(...childGraph.edges)
      edges.push({
        id: `${path}-${childPath}`,
        source: path,
        target: childPath,
      })
    })
  } else if (type === 'array' && Array.isArray(json)) {
    json.forEach((item, index) => {
      const childPath = `${path}[${index}]`
      const childGraph = jsonToGraph(item, childPath, depth + 1)
      nodes.push(...childGraph.nodes)
      edges.push(...childGraph.edges)
      edges.push({
        id: `${path}-${childPath}`,
        source: path,
        target: childPath,
      })
    })
  }
  
  return { nodes, edges }
}

export function countNodes(json: any): number {
  const graph = jsonToGraph(json)
  return graph.nodes.length
}
