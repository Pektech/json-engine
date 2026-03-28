'use client'

import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useViewStore } from '@/stores/viewStore';  
import { EditorWorkspace } from '../workspace/EditorWorkspace';

export function MainWorkspace() {
  useKeyboardShortcuts(); 
  const { activeView } = useViewStore();

  return (
    <main className="flex-1 ml-64 flex">
      {activeView === 'canvas' ? (
        <div className="w-full h-screen bg-surface relative overflow-hidden canvas-grid flex items-center justify-center">
          <div className="text-center text-zinc-500">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="font-label text-sm tracking-widest uppercase">Node Canvas</p>
            <p className="text-xs mt-2 opacity-50">Loading canvas...</p>
          </div>
        </div>
      ) : (
        <EditorWorkspace />
      )}
    </main>
  )
}
