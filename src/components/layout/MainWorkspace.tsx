'use client'

import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export function MainWorkspace() {
  useKeyboardShortcuts(); // Activate all registered keyboard shortcuts

  return (
    <main className="flex-1 ml-64 flex flex-col relative">
      <div className="flex h-full">
        <div className="w-3/5 bg-surface relative overflow-hidden canvas-grid border-r border-outline-variant/10 flex items-center justify-center">
          <div className="text-center text-zinc-500">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="font-label text-sm tracking-widest uppercase">Node Canvas</p>
            <p className="text-xs mt-2 opacity-50">Open a JSON file to visualize</p>
          </div>
        </div>
        <div className="w-2/5 bg-surface-container-lowest flex flex-col">
          <div className="flex bg-surface-container-lowest border-b border-outline-variant/5">
            <div className="px-4 py-2 bg-surface flex items-center gap-2 border-t-2 border-primary">
              <span className="text-xs text-amber-500">JS</span>
              <span className="font-label text-[11px] tracking-wider text-on-surface">root.json</span>
              <button className="text-[10px] text-zinc-600 hover:text-white transition-colors">×</button>
            </div>
            <div className="px-4 py-2 hover:bg-surface-container-low flex items-center gap-2 transition-colors cursor-pointer border-t-2 border-transparent">
              <span className="text-xs text-primary">{}</span>
              <span className="font-label text-[11px] tracking-wider text-zinc-500">schema.json</span>
            </div>
          </div>
          <div className="flex-1 flex font-mono text-sm leading-relaxed p-4 overflow-y-auto items-center justify-center">
            <div className="text-center text-zinc-500">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <p className="font-label text-xs tracking-widest uppercase">Code Editor</p>
              <p className="text-xs mt-2 opacity-50">Monaco Editor will be integrated here</p>
            </div>
          </div>
          <div className="h-8 bg-surface-container-low border-t border-outline-variant/10 flex items-center justify-between px-4">
            <div className="flex gap-4">
              <span className="font-label text-[9px] text-zinc-500 uppercase tracking-widest">UTF-8</span>
              <span className="font-label text-[9px] text-zinc-500 uppercase tracking-widest">JSON</span>
            </div>
            <div className="flex gap-4">
              <span className="font-label text-[9px] text-zinc-500 uppercase tracking-widest">Ln 1, Col 1</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="font-label text-[9px] text-emerald-500 uppercase tracking-widest">Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
