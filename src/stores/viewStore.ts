import { create } from 'zustand'

type ActiveView = 'editor' | 'canvas' | 'split' | 'settings'

interface ViewState {
  activeView: ActiveView
  setActiveView: (view: ActiveView) => void
}

export const useViewStore = create<ViewState>((set) => ({
  activeView: 'split', // Default to split view (both editor and canvas visible)
  setActiveView: (view) => set({ activeView: view }),
}))
