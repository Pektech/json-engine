import { useState, useEffect } from 'react';
import { KEYBOARD_SHORTCUT_GROUPS } from '@/lib/keyboard-shortcuts';

interface KeyboardShortcutsHelpProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function KeyboardShortcutsHelp({ isOpen = false, onClose }: KeyboardShortcutsHelpProps) {
  const [visible, setVisible] = useState(false);

  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClose]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
      <div className="relative bg-surface-container-high rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border border-surface-variant/30">
        <div className="flex justify-between items-center p-6 border-b border-surface-variant/30">
          <h2 className="text-xl font-bold text-on-surface uppercase tracking-widest">Keyboard Shortcuts</h2>
          <button 
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-surface-variant/20 transition-colors"
            aria-label="Close help"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-on-surface" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {KEYBOARD_SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="text-lg font-semibold text-on-surface mb-3">{group.title}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {group.shortcuts.map((shortcut) => (
                  <div
                    key={`${shortcut.label}-${shortcut.keys}`}
                    className="flex justify-between items-center py-2 px-3 rounded-lg bg-surface-container bg-opacity-60"
                  >
                    <span className="text-on-surface">{shortcut.label}</span>
                    <kbd className="px-2 py-1 bg-surface-variant text-on-surface-variant rounded text-sm font-mono">
                      {shortcut.keys}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
