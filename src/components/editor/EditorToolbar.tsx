interface EditorToolbarProps {
  onFormat?: () => void
  onSearch?: () => void
  onOpen?: () => void
  errorCount?: number
  warningCount?: number
  currentPath?: string | null
}

export function EditorToolbar({
  onFormat,
  onSearch,
  onOpen,
  errorCount = 0,
  warningCount = 0,
  currentPath,
}: EditorToolbarProps) {
  const formatPath = (path: string | null): string => {
    if (!path) return ''
    return path.replace(/\./g, ' > ').replace(/\[(\d+)\]/g, '[$1]')
  }
  
  return (
    <div className="flex items-center justify-between px-4 py-2 h-12 bg-surface-container-low border-b border-outline-variant/10">
      <div className="flex items-center gap-2">
        <button
          onClick={onOpen}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors"
          aria-label="Open File (Ctrl+O)"
          title="Open File (Ctrl+O)"
        >
          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
          <span className="font-label text-xs uppercase tracking-wider text-zinc-300">Open</span>
        </button>
        <button
          onClick={onFormat}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors"
          aria-label="Format Document (Ctrl+Shift+I)"
          title="Format Document (Ctrl+Shift+I)"
        >
          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <span className="font-label text-xs uppercase tracking-wider text-zinc-300">Format</span>
        </button>
      </div>
      
      <div className="flex-1 px-4">
        {currentPath && (
          <div className="flex items-center gap-1 text-sm text-zinc-400 font-mono">
            <span className="text-zinc-500">root</span>
            {currentPath !== 'root' && (
              <>
                <span className="text-zinc-600">/</span>
                <span className="text-primary">{formatPath(currentPath.replace('root.', ''))}</span>
              </>
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        {(errorCount > 0 || warningCount > 0) && (
          <div className="flex items-center gap-3">
            {errorCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-error"></span>
                <span className="font-label text-xs uppercase tracking-wider text-error">{errorCount}</span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                <span className="font-label text-xs uppercase tracking-wider text-tertiary">{warningCount}</span>
              </div>
            )}
          </div>
        )}
        
        <button
          onClick={onSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-surface-container-high transition-colors"
          aria-label="Find in JSON (Ctrl+F)"
          title="Find in JSON Text (Ctrl+F)"
        >
          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="font-label text-xs uppercase tracking-wider text-zinc-300 hidden sm:inline">Find in JSON</span>
        </button>
      </div>
    </div>
  )
}
