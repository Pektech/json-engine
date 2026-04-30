import dagre from '@dagrejs/dagre'
import type { CanvasNode, CanvasEdge } from '@/types/canvas'

export function layoutGraph(nodes: CanvasNode[], edges: CanvasEdge[]): CanvasNode[] {
  const graph = new dagre.graphlib.Graph()
  graph.setGraph({ 
    rankdir: 'LR',
    nodesep: 80,
    ranksep: 100,
    edgesep: 40,
  })
  graph.setDefaultEdgeLabel(() => ({}))

  nodes.forEach(node => {
    graph.setNode(node.id, { width: 220, height: 70 })
  })

  edges.forEach(edge => {
    graph.setEdge(edge.source, edge.target)
  })

  dagre.layout(graph)

  return nodes.map(node => {
    const positioned = graph.node(node.id)
    return {
      ...node,
      position: { x: positioned.x - 110, y: positioned.y - 35 },
    }
  })
}

export function fitViewBounds(nodes: CanvasNode[]): { x: number; y: number; zoom: number } {
  if (nodes.length === 0) {
    return { x: 0, y: 0, zoom: 1 }
  }
  
  const xs = nodes.map((n) => n.position.x)
  const ys = nodes.map((n) => n.position.y)
  const widths = nodes.map((n) => n.width || 180)
  const heights = nodes.map((n) => n.height || 60)
  
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs.map((x, i) => x + widths[i]))
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys.map((y, i) => y + heights[i]))
  
  const width = maxX - minX
  const height = maxY - minY
  const centerX = minX + width / 2
  const centerY = minY + height / 2
  
  const padding = 100
  const availableWidth = width + padding * 2
  const availableHeight = height + padding * 2
  
  const zoom = Math.min(
    availableWidth > 0 ? 800 / availableWidth : 1,
    availableHeight > 0 ? 600 / availableHeight : 1,
    1
  )
  
  return {
    x: centerX,
    y: centerY,
    zoom: Math.max(0.1, Math.min(zoom, 1)),
  }
}
