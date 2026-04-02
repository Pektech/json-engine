'use client'

import { useState, useRef, useEffect } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useAppStore } from '@/store/app-store'
import type { JsonNodeData } from '@/types/canvas'

export function JsonNode({ data, selected }: { data: JsonNodeData; selected: boolean }) {
  const jsonNodeData = data as unknown as JsonNodeData
  const { type, label, value, path } = jsonNodeData
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(value || ''))
  const inputRef = useRef<HTMLInputElement>(null)
  const validationErrors = useAppStore(state => state.validationErrors)
  
  const isSelected = data.isSelected ?? selected
  
  const nodeErrors = validationErrors.filter(error => 
    error.path === path || error.path.startsWith(path + '.') || error.path.startsWith(path + '[')
  )
  const hasErrors = nodeErrors.length > 0
  
  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])
  
  const handleDoubleClick = () => {
    // Only allow editing of primitive values (not objects/arrays)
    if (!isExpandable && value !== undefined) {
      setIsEditing(true)
      setEditValue(String(value))
    } else {
      setIsExpanded(!isExpanded)
    }
  }
  
  const saveEdit = () => {
    console.log('[JsonNode] saveEdit called for path:', path, 'value:', editValue)
    
    if (!path) {
      console.error('[JsonNode] No path to save')
      return
    }
    
    // Get current JSON and update function from store
    const { parsedJson, setJsonText } = useAppStore.getState()
    
    console.log('[JsonNode] Current parsedJson keys:', Object.keys(parsedJson || {}).length)
    
    // Parse the new value based on type
    let newValue: any = editValue
    if (type === 'number') {
      newValue = Number(editValue)
      if (isNaN(newValue)) {
        console.error('Invalid number:', editValue)
        setIsEditing(false)
        return
      }
    } else if (type === 'boolean') {
      newValue = editValue.toLowerCase() === 'true'
    }
    
    console.log('[JsonNode] Setting path:', path, 'to:', newValue, 'type:', type)
    
    // Update the JSON at the specified path
    const updatedJson = setValueAtPath(parsedJson, path, newValue)
    
    console.log('[JsonNode] Updated JSON, new string length:', JSON.stringify(updatedJson, null, 2).length)
    
    // Convert back to string and update editor
    setJsonText(JSON.stringify(updatedJson, null, 2))
    
    console.log('[JsonNode] Save complete')
    setIsEditing(false)
  }
  
  const cancelEdit = () => {
    setEditValue(String(value || ''))
    setIsEditing(false)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }
  
  const isExpandable = type === 'object' || type === 'array'
  
  return (
    <div
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
          isEditing ? (
            <input
              ref={inputRef}
              type={type === 'number' ? 'number' : 'text'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={handleKeyDown}
              className={`
                w-full px-1 py-0.5 text-xs font-mono rounded border-2
                bg-surface-container-lowest outline-none
                border-primary focus:border-accent
                ${type === 'string' ? 'text-accent' :
                  type === 'number' ? 'text-primary' :
                  type === 'boolean' ? 'text-tertiary' :
                  'text-zinc-400'}
              `}
              onClick={(e) => {
                e.stopPropagation()
                e.nativeEvent.stopImmediatePropagation()
              }}
              onDoubleClick={(e) => {
                e.stopPropagation()
                e.nativeEvent.stopImmediatePropagation()
              }}
            />
          ) : (
            <div 
              onDoubleClick={handleDoubleClick}
              className={`font-mono text-xs ${
                type === 'string' ? 'text-accent' :
                type === 'number' ? 'text-primary' :
                type === 'boolean' ? 'text-tertiary' :
                'text-zinc-400'
              }`}
              title="Double-click to edit"
            >
              {type === 'string' ? `"${String(value).slice(0, 40)}${String(value).length > 40 ? '...' : ''}"` : 
               String(value)}
            </div>
          )
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

// Helper function to set a value at a specific path in a JSON object
function setValueAtPath(obj: any, path: string, value: any): any {
  // Deep clone to avoid mutating the original
  const result = JSON.parse(JSON.stringify(obj))
  
  // Parse the path into keys (handles both dot notation and array indices)
  const keys = path.split(/[.\[\]]/).filter(Boolean)
  
  // Skip 'root' as it's just our label for the top-level object
  const actualKeys = keys.filter(k => k !== 'root')
  
  if (actualKeys.length === 0) {
    return value
  }
  
  console.log('[setValueAtPath] Setting', actualKeys.join('.'), 'to', value)
  
  // Navigate to the parent of the target
  let current = result
  for (let i = 0; i < actualKeys.length - 1; i++) {
    const key = actualKeys[i]
    if (current[key] === undefined) {
      console.error('Path not found:', path, 'at key:', key, 'in', Object.keys(current))
      return obj
    }
    current = current[key]
  }
  
  // Set the value at the target key
  const lastKey = actualKeys[actualKeys.length - 1]
  current[lastKey] = value
  
  console.log('[setValueAtPath] Success! New value:', current[lastKey])
  
  return result
}
