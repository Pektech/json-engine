'use client'

import { useState, useEffect } from 'react'
import { TopAppBar } from '@/components/layout/TopAppBar'
import { useAppStore } from '@/store/app-store'
import { SideNavBar } from '@/components/layout/SideNavBar'
import { EditorWorkspace } from '@/components/workspace/EditorWorkspace'
import { useKeyboardShortcuts, setOnOpenHelp } from '@/hooks/useKeyboardShortcuts'

export default function Home() {
  const [showHelp, setShowHelp] = useState(false)
  const { selectedPath } = useAppStore()
  useKeyboardShortcuts()

  useEffect(() => {
    setOnOpenHelp((isOpen: boolean) => setShowHelp(isOpen))
  }, [])

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopAppBar showHelp={showHelp} setShowHelp={setShowHelp} currentPath={selectedPath} />
      <div className="flex flex-1 overflow-hidden">
        <SideNavBar />
        <EditorWorkspace />
      </div>
    </div>
  )
}
