'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { NodeCanvas } from '@/components/canvas/NodeCanvas'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { ErrorPanel } from '@/components/panels/ErrorPanel'
import { SearchBar } from '@/components/canvas/SearchBar'
import { useAppStore } from '@/store/app-store'
import type { CodeEditorHandle } from '@/components/editor/CodeEditor'

export function EditorWorkspace() {
  const editorRef = useRef<CodeEditorHandle>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [canvasWidth, setCanvasWidth] = useState(60)
  
  const {
    jsonText,
    nodes,
    edges,
    selectedPath,
    parseError,
    searchQuery,
    filteredNodeIds,
    setJsonText,
    selectPath,
    setSearchQuery,
  } = useAppStore()

  const parsedJson = useAppStore(state => state.parsedJson)

  const handleNodeSelect = useCallback((id: string) => {
    selectPath(id)
  }, [selectPath])

  const handleFormat = useCallback(() => {
    editorRef.current?.format()
  }, [])

  const handleCursorPositionChange = useCallback((path: string | null) => {
    if (path) {
      selectPath(path)
    }
  }, [selectPath])

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleDragEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrag = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    const container = e.currentTarget as HTMLDivElement
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = (x / rect.width) * 100
    setCanvasWidth(Math.max(20, Math.min(80, percentage)))
  }, [isDragging])

  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false)
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [])

  const validationMarkers = parseError ? [{ message: parseError }] : []

  return (
    <div className="flex flex-1 ml-64 h-screen">
      <div 
        className="relative flex w-full h-full"
        onMouseMove={handleDrag}
      >
        <div 
          className="h-full overflow-hidden relative"
          style={{ width: `${canvasWidth}%` }}
        >
          <div className="absolute top-4 left-4 right-4 z-10">
            <SearchBar
              query={searchQuery}
              onSearch={setSearchQuery}
              matchCount={filteredNodeIds.size}
              totalCount={nodes.length}
            />
          </div>
          <div className="w-full h-full bg-surface canvas-grid border-r border-outline-variant/10 pt-16">
            {nodes.length > 0 ? (
              <NodeCanvas
                json={parsedJson}
                nodes={nodes}
                edges={edges}
                selectedNodeId={selectedPath}
                onNodeSelect={handleNodeSelect}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="font-label text-sm tracking-widest uppercase">No JSON loaded</p>
                  <p className="text-xs mt-2 opacity-50">Open a file or paste JSON to begin</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div
          className="w-1 cursor-col-resize bg-outline-variant/30 hover:bg-primary/50 transition-colors z-10"
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
        />

        <div 
          className="flex flex-col h-full bg-surface-container-lowest"
          style={{ width: `${100 - canvasWidth}%` }}
        >
          <EditorToolbar
            onFormat={handleFormat}
            onSearch={() => {}}
            errorCount={parseError ? 1 : 0}
            warningCount={validationMarkers.length}
            currentPath={selectedPath}
          />
          
          {parseError && (
            <div className="px-4 py-2 bg-error-container/20 border-b border-error/30">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error"></span>
                <span className="text-sm text-error font-mono">{parseError}</span>
              </div>
            </div>
          )}
          
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              ref={editorRef}
              value={jsonText}
              onChange={setJsonText}
              onValidate={() => {}}
              selectedPath={selectedPath}
              onCursorPositionChange={handleCursorPositionChange}
            />
          </div>
          
          <ErrorPanel />
        </div>
      </div>
    </div>
  )
}
