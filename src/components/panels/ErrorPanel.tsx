'use client'

import { useAppStore } from '@/store/app-store'

export function ErrorPanel() {
  const { validationErrors, selectPath } = useAppStore()
  
  if (validationErrors.length === 0) {
    return null
  }
  
  const errors = validationErrors.filter(e => e.severity === 'error')
  const warnings = validationErrors.filter(e => e.severity === 'warning')
  
  const handleErrorClick = (path: string) => {
    selectPath(path)
  }
  
  return (
    <div className="bg-surface-container-low border-t border-outline-variant/10 h-48 overflow-auto">
      <div className="flex items-center justify-between px-4 py-2 bg-surface-container-high border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <h3 className="font-label text-xs uppercase tracking-widest text-zinc-300">
            Validation Issues
          </h3>
          {errors.length > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-error"></span>
              <span className="text-error font-medium">{errors.length} Errors</span>
            </span>
          )}
          {warnings.length > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-tertiary"></span>
              <span className="text-tertiary font-medium">{warnings.length} Warnings</span>
            </span>
          )}
        </div>
      </div>
      
      <div className="divide-y divide-outline-variant/5">
        {validationErrors.map((error, index) => (
          <div
            key={index}
            onClick={() => handleErrorClick(error.path)}
            className="px-4 py-2 hover:bg-surface-container-high cursor-pointer transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                error.severity === 'error' ? 'bg-error' : 'bg-tertiary'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono text-zinc-400 mb-0.5">
                  Line {error.line}: {error.path}
                </div>
                <div className={`text-sm ${
                  error.severity === 'error' ? 'text-error' : 'text-tertiary'
                }`}>
                  {error.message}
                </div>
                {error.schemaPath && (
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Schema: {error.schemaPath}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
