'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { JsonNode } from './JsonNode'
import { JsonEdge } from './JsonEdge'
import { jsonToGraph } from '@/lib/json-to-graph'
import { layoutGraph } from '@/lib/json-to-graph'
import { useFocusContext } from '@/hooks/useFocusContext'

interface NodeCanvasProps {
  json: any
  onNodeSelect?: (id: string) => void  
  selectedNodeId?: string | null
  searchQuery?: string
  filteredNodeIds?: string[]
}

const nodeTypes = {
  jsonNode: JsonNode,
}

const defaultEdgeOptions = {
  type: 'smoothstep',
  style: { stroke: '#404751', strokeWidth: 1.5 },
  animated: false,
}

function NodeCanvasContent({ json, onNodeSelect, selectedNodeId, searchQuery = '', filteredNodeIds = [] }: NodeCanvasProps) {
  const { setFocusedArea } = useFocusContext()
  const { fitView, setCenter, getZoom } = useReactFlow()
  const previousSelectedNodeId = useRef<string | null>(null)
  
  const graphData = useMemo(() => {
    return jsonToGraph(json)
  }, [json])
  
  const layoutedNodes = useMemo(() => {
    return layoutGraph(graphData.nodes, graphData.edges)
  }, [graphData])
  
  const hasSearch = searchQuery.length > 0
  
  const [existingNodes, setNodes] = useState<Node[]>([])
  const [existingEdges, setEdges] = useState<Edge[]>([])
  
  useEffect(() => {
    const filteredSet = new Set(filteredNodeIds)
    
    const flowNodes: any[] = layoutedNodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: { 
        ...node.data, 
        opacity: hasSearch ? (filteredSet.has(node.id) ? 1 : 0.2) : 1,
        isSelected: node.id === selectedNodeId,
      },
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
  }, [layoutedNodes, graphData.edges, selectedNodeId, hasSearch, filteredNodeIds])
  
  // Auto-center canvas on selected node when it changes (without changing zoom)
  useEffect(() => {
    
    if (!selectedNodeId) return
    if (selectedNodeId === previousSelectedNodeId.current) return
    
    // Wait for nodes to be ready
    const timer = setTimeout(() => {
      
      const node = existingNodes.find(n => n.id === selectedNodeId)
      
      if (!node) return
      
      // Get current zoom level
      const currentZoom = getZoom()
      
      // Calculate center position for the node
      const nodeCenterX = node.position.x + (node.width || 200) / 2
      const nodeCenterY = node.position.y + (node.height || 60) / 2
      
      // Center on node while maintaining current zoom
      setCenter(nodeCenterX, nodeCenterY, { 
        zoom: currentZoom,
        duration: 200
      })
      
      previousSelectedNodeId.current = selectedNodeId
    }, 100)
    
    return () => clearTimeout(timer)
  }, [selectedNodeId, existingNodes, setCenter, getZoom])
  
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
        defaultEdgeOptions={defaultEdgeOptions}
        attributionPosition="bottom-left"
      >
        <Controls />

        <Background color="#2a2a2a" gap={24} size={1} />
      </ReactFlow>
    </div>
  )
}

export function NodeCanvas(props: NodeCanvasProps) {
  return (
    <ReactFlowProvider>
      <NodeCanvasContent {...props} />
    </ReactFlowProvider>
  )
}

export default NodeCanvas
