'use client'

import { useState, useRef, useEffect } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useAppStore } from '@/store/app-store'
import type { JsonNodeData } from '@/types/canvas'
import { ContextMenu, type ContextMenuItem } from './ContextMenu'
import { getValueAtPath, insertNodeAtPath, setValueAtPath, renameKeyAtPath, addChildAtPath, addArrayItem, deleteNodeAtPath } from '@/lib/json-mutations'

export function JsonNode({ data, selected }: { data: JsonNodeData; selected: boolean }) {
  const jsonNodeData = data as unknown as JsonNodeData
  const { type, label, value, path } = jsonNodeData
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingKey, setIsEditingKey] = useState(false)
  const [editValue, setEditValue] = useState(String(value || ''))
  const [hasClipboard, setHasClipboard] = useState(false)
  const [editKeyValue, setEditKeyValue] = useState(label)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const keyInputRef = useRef<HTMLInputElement>(null)
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

  // Clipboard state listener
  useEffect(() => {
    const checkClipboard = () => {
      setHasClipboard(!!sessionStorage.getItem('json-engine-clipboard'))
    }
    checkClipboard()
    
    window.addEventListener('clipboard-changed', checkClipboard)
    return () => window.removeEventListener('clipboard-changed', checkClipboard)
  }, [])
  
  // Listen for auto-edit events (when new items are added)
  useEffect(() => {
    const handleAutoEdit = (event: Event) => {
      const customEvent = event as CustomEvent<{ path: string }>
      const nodeIsExpandable = type === 'object' || type === 'array'
      
      if (customEvent.detail.path === path && !nodeIsExpandable && value !== undefined) {
        setIsEditing(true)
        setEditValue(String(value))
      }
    }
    
    window.addEventListener('json-node-auto-edit', handleAutoEdit)
    return () => window.removeEventListener('json-node-auto-edit', handleAutoEdit)
  }, [path, type, value])
  
  useEffect(() => {
    if (isEditingKey && keyInputRef.current) {
      keyInputRef.current.focus()
      keyInputRef.current.select()
    }
  }, [isEditingKey])
  
  const startKeyEdit = () => {
    // Can't edit root node's name
    if (path === 'root' || !path) return
    setIsEditingKey(true)
    setEditKeyValue(label)
  }
  
  const saveKeyEdit = () => {
    if (!path || !editKeyValue.trim()) {
      cancelKeyEdit()
      return
    }
    
    const { parsedJson, setJsonText } = useAppStore.getState()
    
    // Rename the key in the JSON
    const updatedJson = renameKeyAtPath(parsedJson, path, editKeyValue.trim())
    
    
    setJsonText(JSON.stringify(updatedJson, null, 2))
    setIsEditingKey(false)
  }
  
  const cancelKeyEdit = () => {
    setEditKeyValue(label)
    setIsEditingKey(false)
  }
  
  const handleKeyKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveKeyEdit()
    } else if (e.key === 'Escape') {
      cancelKeyEdit()
    }
  }
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }
  
  const handleAddChild = (childType: 'string' | 'number' | 'boolean' | 'object' | 'array' = 'string') => {
    if (!path) return
    
    const keyName = prompt('Enter key name for new child:')
    if (!keyName || !keyName.trim()) return
    
    const { parsedJson, setJsonText, selectPath } = useAppStore.getState()
    const updatedJson = addChildAtPath(parsedJson, path, keyName.trim(), childType)
    setJsonText(JSON.stringify(updatedJson, null, 2))
    
    // Auto-select the new child
    const newPath = path === 'root' ? keyName.trim() : `${path}.${keyName.trim()}`
    setTimeout(() => selectPath(newPath), 100)
  }
  
  const handleAddArrayItem = (itemType: 'string' | 'number' | 'boolean' | 'object' | 'array' = 'string') => {
    if (!path) return
    
    const { parsedJson, setJsonText, selectPath } = useAppStore.getState()
    const updatedJson = addArrayItem(parsedJson, path, itemType)
    setJsonText(JSON.stringify(updatedJson, null, 2))
    
    // Get the new item's path
    const keys = path.split(/[.\[\]]/).filter(Boolean).filter(k => k !== 'root')
    let current: any = updatedJson
    for (const key of keys) {
      if (current[key] === undefined) return
      current = current[key]
    }
    
    if (Array.isArray(current) && current.length > 0) {
      const newIndex = current.length - 1
      const newPath = `${path}[${newIndex}]`
      
      // Select and mark for auto-edit
      setTimeout(() => {
        selectPath(newPath)
        // Store a flag that this node should auto-open edit mode
        window.dispatchEvent(new CustomEvent('json-node-auto-edit', { detail: { path: newPath } }))
      }, 150)
    }
  }
  
  const handleDeleteNode = () => {
    if (!path || path === 'root') return
    
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return
    
    const { parsedJson, setJsonText, selectPath } = useAppStore.getState()
    
    // Compute parent path: "root.users.0.name" → "root.users.0"
    const lastDot = path.lastIndexOf('.')
    const lastBracket = path.lastIndexOf('[')
    const splitIndex = Math.max(lastDot, lastBracket)
    const parentPath = splitIndex > 0 ? path.substring(0, splitIndex) : null
    
    const updatedJson = deleteNodeAtPath(parsedJson, path)
    setJsonText(JSON.stringify(updatedJson, null, 2))
    
    // Select parent after deletion (defer to let canvas re-render)
    if (parentPath) {
      setTimeout(() => selectPath(parentPath), 100)
    }
  }

  const handleCopy = () => {
    const { parsedJson } = useAppStore.getState()
    const value = getValueAtPath(parsedJson, path)
    const clipboardData = { path, value, type, timestamp: Date.now() }
    sessionStorage.setItem('json-engine-clipboard', JSON.stringify(clipboardData))
    window.dispatchEvent(new CustomEvent('clipboard-changed'))
  }

  const handlePaste = () => {
    const clipboardStr = sessionStorage.getItem('json-engine-clipboard')
    if (!clipboardStr) return
    
    const { parsedJson, setJsonText, selectPath } = useAppStore.getState()
    try {
      const clipboardData = JSON.parse(clipboardStr)
      const keyName = 'pasted_' + Date.now()
      const updatedJson = insertNodeAtPath(parsedJson, path, keyName, clipboardData.value)
      setJsonText(JSON.stringify(updatedJson, null, 2))
      selectPath(`${path}.${keyName}`)
    } catch (e) {
      console.error('Paste failed:', e)
    }
  }
  
  const getMenuItems = (): ContextMenuItem[] => {
    const items: ContextMenuItem[] = []
    
    if (type === 'object') {
      items.push({ 
        label: 'Add Child',
        submenu: [
          { label: 'String', onClick: () => handleAddChild('string') },
          { label: 'Number', onClick: () => handleAddChild('number') },
          { label: 'Boolean', onClick: () => handleAddChild('boolean') },
          { label: 'Object', onClick: () => handleAddChild('object') },
          { label: 'Array', onClick: () => handleAddChild('array') },
        ]
      })
    }
    
    if (type === 'array') {
      items.push({ 
        label: 'Add Item',
        submenu: [
          { label: 'String', onClick: () => handleAddArrayItem('string') },
          { label: 'Number', onClick: () => handleAddArrayItem('number') },
          { label: 'Boolean', onClick: () => handleAddArrayItem('boolean') },
          { label: 'Object', onClick: () => handleAddArrayItem('object') },
          { label: 'Array', onClick: () => handleAddArrayItem('array') },
        ]
      })
    }
    
    if (path !== 'root') {
      items.push({ 
        label: 'Delete', 
        onClick: handleDeleteNode,
        disabled: path === 'root'
      })
    }
    
    return items
  }
  
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
    
    if (!path) {
      console.error('[JsonNode] No path to save')
      return
    }
    
    // Get current JSON and update function from store
    const { parsedJson, setJsonText } = useAppStore.getState()
    
    
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
    
    
    // Update the JSON at the specified path
    const updatedJson = setValueAtPath(parsedJson, path, newValue)
    
    
    // Convert back to string and update editor
    setJsonText(JSON.stringify(updatedJson, null, 2))
    
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
    <>
      <div
        onContextMenu={handleContextMenu}
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
          {isEditingKey ? (
            <input
              ref={keyInputRef}
              type="text"
              value={editKeyValue}
              onChange={(e) => setEditKeyValue(e.target.value)}
              onBlur={saveKeyEdit}
              onKeyDown={handleKeyKeyDown}
              className="
                w-32 px-1 py-0.5 text-sm font-mono rounded border-2
                bg-surface-container-lowest outline-none
                border-primary focus:border-accent text-secondary
              "
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span 
              className="font-mono text-sm text-secondary font-medium truncate" 
              title={label}
              onDoubleClick={(e) => {
                e.stopPropagation()
                startKeyEdit()
              }}
            >
              {label}
            </span>
          )}
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
              type="text"
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
    
    {contextMenu && (
      <ContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        items={getMenuItems()}
        onClose={() => setContextMenu(null)}
      />
    )}
  </>
  )
}

export default JsonNode
