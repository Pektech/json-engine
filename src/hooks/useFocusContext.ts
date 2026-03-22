import { createContext, useContext, useState, ReactNode } from 'react';

interface FocusContextType {
  focusedArea: 'editor' | 'canvas' | 'global';
  setFocusedArea: (area: 'editor' | 'canvas' | 'global') => void;
  isEditorFocused: () => boolean;
  isCanvasFocused: () => boolean;
}

const FocusContext = createContext<FocusContextType | null>(null);

export function FocusProvider({ children }: { children: ReactNode }) {
  const [focusedArea, setFocusedArea] = useState<'editor' | 'canvas' | 'global'>('global');

  const isEditorFocused = (): boolean => focusedArea === 'editor';
  const isCanvasFocused = (): boolean => focusedArea === 'canvas';

  return (
    <FocusContext.Provider value={{ focusedArea, setFocusedArea, isEditorFocused, isCanvasFocused }}>
      {children}
    </FocusContext.Provider>
  );
}

export function useFocusContext() {
  const context = useContext(FocusContext);
  if (!context) throw new Error('useFocusContext must be used within FocusProvider');
  return context;
}