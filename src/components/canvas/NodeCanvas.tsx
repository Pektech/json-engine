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
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { JsonNode } from './JsonNode'
import { JsonEdge } from './JsonEdge'
import { jsonToGraph } from '@/lib/json-to-graph'
import { layoutGraph } from '@/lib/graph-layout'
import type { CanvasNode, CanvasEdge } from '@/types/canvas'

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
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null)
  
  const graphData = useMemo(() => {
    return jsonToGraph(json)
  }, [json])
  
  const layoutedNodes = useMemo(() => {
    return layoutGraph(graphData.nodes, graphData.edges)
  }, [graphData])
  
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  
  useEffect(() => {
    const flowNodes: Node[] = layoutedNodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node.data,
      width: node.width,
      height: node.height,
      selected: node.id === selectedNodeId,
    }))
    
    const flowEdges: Edge[] = graphData.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: edge.type || 'smoothstep',
    }))
    
    setNodes(flowNodes)
    setEdges(flowEdges)
  }, [layoutedNodes, graphData.edges, selectedNodeId, setNodes, setEdges])
  
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (onNodeSelect) {
        onNodeSelect(node.id)
      }
    },
    [onNodeSelect]
  )
  
  const onInit = useCallback((instance: ReactFlowInstance) => {
    setReactFlowInstance(instance)
    instance.fitView({ padding: 0.2 })
  }, [])
  
  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onInit={onInit}
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
