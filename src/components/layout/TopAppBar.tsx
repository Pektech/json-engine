'use client'

import { useState } from 'react'
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp'

export function TopAppBar() {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <>
      <header className="flex justify-between items-center px-6 w-full z-50 bg-surface h-12">
        <div className="flex items-center gap-8">
          <span className="font-label font-bold text-white tracking-tighter text-xl">
            JSON.engine
          </span>
          <nav className="flex gap-6 items-center h-full">
            <a 
              href="#" 
              className="font-body text-sm tracking-tight text-white border-b-2 border-primary pb-1"
            >
              Projects
            </a>
            <a 
              href="#" 
              className="font-body text-sm tracking-tight text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Deploy
            </a>
            <a 
              href="#" 
              className="font-body text-sm tracking-tight text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              History
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button 
              className="p-2 hover:bg-zinc-800/50 transition-all scale-95 active:scale-90 duration-100 text-zinc-400"
              onClick={() => setShowHelp(true)}
              aria-label="Keyboard shortcuts help (F1)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-zinc-800/50 transition-all scale-95 active:scale-90 duration-100 text-zinc-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>
            <button className="p-2 hover:bg-zinc-800/50 transition-all scale-95 active:scale-90 duration-100 text-zinc-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            <button className="p-2 hover:bg-zinc-800/50 transition-all scale-95 active:scale-90 duration-100 text-zinc-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
          <div className="w-7 h-7 rounded-full border border-outline-variant/30 bg-surface-container-high flex items-center justify-center text-xs text-on-surface-variant">
            U
          </div>
        </div>
      </header>
      <KeyboardShortcutsHelp isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </>
  )
}
