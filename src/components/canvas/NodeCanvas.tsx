'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { JsonNode } from './JsonNode'
import { JsonEdge } from './JsonEdge'
import { jsonToGraph } from '@/lib/json-to-graph'
import { layoutGraph } from '@/lib/graph-layout'
import { useFocusContext } from '@/hooks/useFocusContext'

const nodeTypes = {
  jsonNode: JsonNode,
}

const edgeTypes = {
  smoothstep: JsonEdge,
}

interface NodeCanvasProps {
  json: any
  onNodeSelect?: (id: string) => void  
  selectedNodeId?: string | null
}

export function NodeCanvas({ json, onNodeSelect, selectedNodeId }: NodeCanvasProps) {
  const { setFocusedArea } = useFocusContext()
  
  const graphData = useMemo(() => {
    return jsonToGraph(json)
  }, [json])
  
  const layoutedNodes = useMemo(() => {
    return layoutGraph(graphData.nodes, graphData.edges)
  }, [graphData])
  
  const [existingNodes, setNodes] = useState<Node[]>([])
  const [existingEdges, setEdges] = useState<Edge[]>([])
  
  useEffect(() => {
    const flowNodes: any[] = layoutedNodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
      width: node.width,
      height: node.height,
      selected: node.id === selectedNodeId,
    }))
    
    const flowEdges: any[] = graphData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'smoothstep',
    }))
    
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [layoutedNodes, graphData.edges, selectedNodeId])
  
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: any) => {
      if (onNodeSelect) {
        onNodeSelect(node.id)
      }
    },
    [onNodeSelect]
  )
  
  // Handle canvas focus when user interacts with the pane
  const onPaneClick = useCallback(() => {
    setFocusedArea('canvas');
  }, [setFocusedArea])
  
  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={existingNodes}
        edges={existingEdges}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
        />
        <Background color="#2a2a2a" gap={24} size={1} />
      </ReactFlow>
    </div>
  )
}