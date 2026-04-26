'use client'

import { Suspense, useMemo } from 'react'
import { useRef, useState, useCallback, useEffect } from 'react'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { ErrorPanel } from '@/components/panels/ErrorPanel'
import { SearchBar } from '@/components/canvas/SearchBar'
import { useAppStore } from '@/store/app-store'
import { useViewStore } from '@/store/viewStore'
import { CodeEditor, type CodeEditorHandle } from '@/components/editor/CodeEditor'
import { NodeCanvas } from '@/components/canvas/NodeCanvas'
import { CodeEditorLoader } from '@/components/editor/CodeEditorLoader'
import { NodeCanvasLoader } from '@/components/canvas/NodeCanvasLoader'
import { fileManager } from '@/lib/file-manager'

// Lazy wrappers for loading states
function CodeEditorLazy(props: React.ComponentProps<typeof CodeEditor>) {
  return (
    <Suspense fallback={<CodeEditorLoader />}>
      <CodeEditor {...props} />
    </Suspense>
  )
}

function NodeCanvasLazy(props: React.ComponentProps<typeof NodeCanvas>) {
  return (
    <Suspense fallback={<NodeCanvasLoader />}>
      <NodeCanvas {...props} />
    </Suspense>
  )
}

export function EditorWorkspace() {
  const editorRef = useRef<CodeEditorHandle | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [canvasWidth, setCanvasWidth] = useState(60)
  
  const { activeView } = useViewStore()
  
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

  const handleEditorSearch = useCallback(() => {
    editorRef.current?.find()
  }, [])

  const handleSaveFile = useCallback(async () => {
    const { jsonText, currentFileHandle, currentFile } = useAppStore.getState()
    try {
      if (currentFileHandle) {
        const handle = { handle: currentFileHandle, name: currentFile, path: currentFile }
        await fileManager.saveFile(handle as any, jsonText)
      } else {
        const file = new Blob([jsonText], { type: 'application/json' })
        const a = document.createElement('a')
        const url = URL.createObjectURL(file)
        a.href = url
        a.download = currentFile || 'data.json'
        a.click()
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to save file:', error)
    }
  }, [])

  const handleOpenFile = useCallback(async () => {
    try {
      const result = await fileManager.openFile();
      
      // Check if result is an error (has 'code' property)
      if ('code' in result) {
        if (result.code !== 'PERMISSION_DENIED') {
          console.error('Failed to open file:', result.message);
        }
        return;
      }
      
      // Successfully opened - load into editor using getState to avoid dependency issues
      const { loadFile: appLoadFile } = useAppStore.getState();
      await appLoadFile(result.handle.name, result.content);
      useAppStore.getState().setFileHandle(result.handle.handle || null);
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  }, []);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        const searchInput = document.querySelector<HTMLInputElement>('[data-workspace-search="true"]')
        searchInput?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const validationMarkers = parseError ? [{ message: parseError }] : []

  return (
    <div className="flex flex-1 ml-64 min-h-screen">
      <div 
        className="relative flex w-full h-full"
        onMouseMove={handleDrag}
      >
        {/* Canvas Panel - shown in 'canvas' or 'split' view */}
        {(activeView === 'canvas' || activeView === 'split') && (
          <div 
            className="h-full overflow-hidden relative transition-all duration-300 ease-in-out"
            style={{ width: activeView === 'canvas' ? '100%' : `${canvasWidth}%` }}
          >
            <div className="absolute top-4 left-4 right-4 z-10">
              <SearchBar
                query={searchQuery}
                onSearch={setSearchQuery}
                matchCount={filteredNodeIds.size}
                totalCount={nodes.length}
              />
            </div>
            <div className="w-full h-full bg-surface canvas-grid border-r border-outline-variant/10 pt-16" data-testid="node-canvas">
              {nodes.length > 0 ? (
                <NodeCanvasLazy
                  json={parsedJson}
                  selectedNodeId={selectedPath}
                  onNodeSelect={handleNodeSelect}
                  searchQuery={searchQuery}
                  filteredNodeIds={Array.from(filteredNodeIds)}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-zinc-500">
                  <div className="text-center">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="font-label text-sm tracking-widest uppercase">No JSON loaded</p>
                    <p className="text-xs mt-2 opacity-50">Select a file or paste JSON to begin</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Drag Handle - only in split view */}
        {activeView === 'split' && (
          <div
            className="w-1 cursor-col-resize bg-outline-variant/30 hover:bg-primary/50 transition-colors z-10"
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
          />
        )}

        {/* Editor Panel - shown in 'editor' or 'split' view */}
        {(activeView === 'editor' || activeView === 'split') && (
          <div 
            className="flex flex-col h-full bg-surface-container-lowest transition-all duration-300 ease-in-out"
            style={{ width: activeView === 'editor' ? '100%' : `${100 - canvasWidth}%` }}
          >
            <EditorToolbar
              onOpen={handleOpenFile}
              onSave={handleSaveFile}
              onFormat={handleFormat}
              onSearch={handleEditorSearch}
              errorCount={parseError ? 1 : 0}
              warningCount={validationMarkers.length}
    
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
              <Suspense fallback={<CodeEditorLoader />}>
                <CodeEditor
                  ref={editorRef}
                  value={jsonText}
                  onChange={setJsonText}
                  onValidate={() => {}}
                  selectedPath={selectedPath}
                  onCursorPositionChange={handleCursorPositionChange}
                />
              </Suspense>
            </div>
            
            <ErrorPanel />
          </div>
        )}

        {/* Settings Panel - removed until implemented */}
        {activeView === 'settings' && (
          <div className="flex flex-col h-full bg-surface-container-lowest w-full items-center justify-center p-8">
            <div className="text-center text-zinc-500">
              <p className="font-label text-sm tracking-widest uppercase">Settings</p>
              <p className="text-xs mt-2 opacity-50">Settings panel not yet implemented</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
