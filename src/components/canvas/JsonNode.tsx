'use client'

import { useState } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { NodeTypeBadge } from './NodeTypeBadge'
import { useAppStore } from '@/store/app-store'
import type { JsonNodeData } from '@/types/canvas'

export function JsonNode({ data, selected }: NodeProps<JsonNodeData>) {
  const { type, label, value, path } = data
  const [isExpanded, setIsExpanded] = useState(true)
  const validationErrors = useAppStore(state => state.validationErrors)
  
  const nodeErrors = validationErrors.filter(error => 
    error.path === path || error.path.startsWith(path + '.') || error.path.startsWith(path + '[')
  )
  const hasErrors = nodeErrors.length > 0
  
  const handleDoubleClick = () => {
    setIsExpanded(!isExpanded)
    console.log('Node double-clicked:', data.path, 'Expanded:', !isExpanded)
  }
  
  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={`
        w-[180px] bg-surface-container-high border-2 rounded-lg shadow-md p-3 cursor-pointer
        transition-all duration-200 relative
        ${selected ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-surface' : 'border-outline-variant'}
        ${hasErrors ? 'border-error' : ''}
      `}
    >
      <Handle type="target" position={Position.Top} className="!bg-outline !w-2 !h-2" />
      
      {hasErrors && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm">
          {nodeErrors.length}
        </div>
      )}
      
      <div className="flex flex-col gap-2">
        <div className="font-semibold text-sm text-on-surface truncate" title={label}>
          {label}
        </div>
        
        <div className="flex items-center justify-between">
          <NodeTypeBadge type={type} size="sm" />
          
          {(type === 'object' || type === 'array') && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
        </div>
        
        {value !== undefined && value !== null && (
          <div className="text-xs text-tertiary font-mono truncate" title={String(value)}>
            {String(value).slice(0, 30)}{String(value).length > 30 ? '...' : ''}
          </div>
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} className="!bg-outline !w-2 !h-2" />
    </div>
  )
}
