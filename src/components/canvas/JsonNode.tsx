'use client'

import { useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useAppStore } from '@/store/app-store'
import type { JsonNodeData } from '@/types/canvas'

export function JsonNode({ data, selected }: { data: JsonNodeData; selected: boolean }) {
  const jsonNodeData = data as unknown as JsonNodeData
  const { type, label, value, path } = jsonNodeData
  const [isExpanded, setIsExpanded] = useState(true)
  const validationErrors = useAppStore(state => state.validationErrors)
  
  const isSelected = data.isSelected ?? selected
  
  const nodeErrors = validationErrors.filter(error => 
    error.path === path || error.path.startsWith(path + '.') || error.path.startsWith(path + '[')
  )
  const hasErrors = nodeErrors.length > 0
  
  const handleDoubleClick = () => {
    setIsExpanded(!isExpanded)
  }
  
  const isExpandable = type === 'object' || type === 'array'
  
  return (
    <div
      onDoubleClick={handleDoubleClick}
      style={{ opacity: (data as any).opacity ?? 1 }}
      className={`
        min-w-[200px] max-w-[320px] rounded-lg border shadow-sm cursor-pointer
        transition-all duration-150 relative
        ${isSelected 
          ? 'border-primary ring-2 ring-primary/50 bg-surface-container-high' 
          : 'border-outline-variant/30 bg-surface-container'
        }
        ${hasErrors ? 'border-error/50' : ''}
        hover:border-primary/30
      `}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-2 !h-2 !bg-outline-variant !border-0" 
      />
      
      {hasErrors && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-error rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-10">
          {nodeErrors.length}
        </div>
      )}
      
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-mono text-sm text-secondary font-medium truncate" title={label}>
            {label}
          </span>
          {isExpandable && (
            <span className="text-[10px] text-zinc-500">
              {isExpanded ? '◢' : '◣'}
            </span>
          )}
        </div>
        
        {value !== undefined && value !== null ? (
          <div className={`font-mono text-xs ${
            type === 'string' ? 'text-accent' :
            type === 'number' ? 'text-primary' :
            type === 'boolean' ? 'text-tertiary' :
            'text-zinc-400'
          }`}>
            {type === 'string' ? `"${String(value).slice(0, 40)}${String(value).length > 40 ? '...' : ''}"` : 
             String(value)}
          </div>
        ) : isExpandable ? (
          <div className="text-[10px] text-zinc-500 italic">
            {type === 'object' ? '{ }' : '[ ]'}
          </div>
        ) : null}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-2 !h-2 !bg-outline-variant !border-0" 
      />
    </div>
  )
}
