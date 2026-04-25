'use client'

import { useViewStore } from '@/store/viewStore'

interface NavItemProps {
  icon: React.ReactNode
  label: string
  view: 'editor' | 'canvas' | 'split' | 'settings'
  active?: boolean
  onClick?: () => void
}

function NavItem({ icon, label, view, active, onClick }: NavItemProps) {
  const { setActiveView } = useViewStore()
  
  const handleClick = () => {
    setActiveView(view)
    onClick?.()
  }
  
  return (
    <div 
      onClick={handleClick}
      className={`
        px-4 py-3 flex items-center gap-3 cursor-pointer transition-colors
        ${active 
          ? 'bg-surface-container-high text-primary border-l-2 border-primary' 
          : 'text-zinc-500 hover:bg-zinc-800/30'
        }
      `}
    >
      <span className="w-5 h-5">{icon}</span>
      <span className="font-label uppercase text-[10px] tracking-widest">{label}</span>
    </div>
  )
}

export function SideNavBar() {
  const { activeView } = useViewStore()

  return (
    <aside className="flex flex-col h-screen fixed left-0 top-0 pt-12 z-40 bg-surface-container-lowest w-64">
      <div className="px-6 py-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-6 h-6 bg-primary-container rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            </svg>
          </div>
          <span className="font-label font-bold text-xs tracking-tight text-white">
            JSON_EDITOR_V1
          </span>
        </div>
        <span className="font-label uppercase text-[10px] tracking-widest text-zinc-500">
          main/root.json
        </span>
      </div>
      
      <nav className="flex-1 space-y-1 px-2">
        <NavItem 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>}
          label="Editor"
          view="editor"
          active={activeView === 'editor'}
        />
        <NavItem 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>}
          label="Canvas"
          view="canvas"
          active={activeView === 'canvas'}
        />
        <NavItem 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>}
          label="Split View"
          view="split"
          active={activeView === 'split'}
        />
        <NavItem 
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>}
          label="Settings"
          view="settings"
          active={activeView === 'settings'}
        />
      </nav>
      
      <div className="p-4">
        <button className="w-full bg-gradient-to-br from-primary-container to-primary py-2 rounded text-on-primary-container font-label uppercase text-[10px] tracking-[0.2em] font-bold shadow-lg shadow-primary-container/20 hover:shadow-primary-container/40 transition-shadow">
          New Node
        </button>
      </div>
      
      <div className="p-4 border-t border-outline-variant/10 space-y-2">
        <div className="flex items-center gap-3 text-zinc-500 px-2 py-1 hover:text-zinc-200 transition-colors cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="font-label uppercase text-[10px] tracking-widest">Documentation</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-500 px-2 py-1 hover:text-zinc-200 transition-colors cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="font-label uppercase text-[10px] tracking-widest">Support</span>
        </div>
      </div>
    </aside>
  )
}
