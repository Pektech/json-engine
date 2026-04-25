import { useHotkeys } from 'react-hotkeys-hook';
import { useEffect } from 'react';
import { useFocusContext } from './useFocusContext';
import { useFileManager } from './useFileManager';
import { useAppStore } from '../store/app-store';

let helpPanelOpenCallback: ((isOpen: boolean) => void) | null = null;

export const setOnOpenHelp = (callback: (isOpen: boolean) => void) => {
  helpPanelOpenCallback = callback;
};

export function useKeyboardShortcuts() {
  const { focusedArea } = useFocusContext();
  const { openFile, saveFile } = useFileManager();
  const { currentFile, jsonText, setSearchQuery, loadFile } = useAppStore();

  // CRITICAL: Capture phase listener for F1 - intercepts BEFORE browser default action
  // Browser help opens on bubble phase, so we need capture: true to prevent it
  useEffect(() => {
    const handleF1 = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        e.stopPropagation();
        if (helpPanelOpenCallback) {
          helpPanelOpenCallback(true);
        }
      }
    };
    
    // capture: true intercepts BEFORE browser default action
    window.addEventListener('keydown', handleF1, { capture: true });
    return () => window.removeEventListener('keydown', handleF1, { capture: true });
  }, [helpPanelOpenCallback]);

  const handleOpenFile = async () => {
    try {
      const result = await openFile();
      
      // Check if result is an error (has 'code' property)
      if ('code' in result) {
        if (result.code !== 'PERMISSION_DENIED') {
          console.error('Failed to open file:', result.message);
        }
        return;
      }
      
      // Successfully opened - load into editor
      await loadFile(result.handle.name, result.content);
    } catch (error) {
      console.error('Failed to open file:', error);
    }
  };

  const handleSaveFile = async () => {
    if (currentFile) {
      try {
        const dummyHandle = { handle: null as any, name: currentFile, path: currentFile };
        await saveFile(dummyHandle as any, jsonText);
      } catch (error) {
        console.error('Failed to save file:', error);
      }
    }
  };

  useHotkeys('f1', (event) => {
    event.preventDefault();
    if (helpPanelOpenCallback) {
      helpPanelOpenCallback(true);
    }
  }, { preventDefault: true, enableOnFormTags: true });

  useHotkeys('ctrl+/', (event) => {
    event.preventDefault();
    if (helpPanelOpenCallback) {
      helpPanelOpenCallback(true);
    }
  }, { preventDefault: true, enableOnFormTags: true });

  useHotkeys('ctrl+o', (event) => {
    event.preventDefault();
    handleOpenFile();
  }, { preventDefault: true, enableOnFormTags: true });

  useHotkeys('ctrl+s', (event) => {
    event.preventDefault();
    handleSaveFile();
  }, { preventDefault: true, enableOnFormTags: true });

  useHotkeys('ctrl+shift+f', (event) => {
    event.preventDefault();
    
    // Focus and select the search input
    const searchInput = document.querySelector<HTMLInputElement>('[data-workspace-search="true"]');
    searchInput?.focus();
    searchInput?.select();
  }, { preventDefault: true, enableOnFormTags: true, enableOnContentEditable: true });

  useHotkeys('ctrl+f', (event) => {
    // Only trigger canvas search if NOT in editor
    if (focusedArea !== 'editor') {
      event.preventDefault();
      setSearchQuery('');
    }
    // If in editor, let Monaco handle Ctrl+F natively
  }, { enableOnFormTags: true, enableOnContentEditable: true });

  useHotkeys('ctrl+h', (event) => {
    // Only trigger if NOT in editor
    if (focusedArea !== 'editor') {
      event.preventDefault();
    }
    // If in editor, let Monaco handle Ctrl+H natively
  }, { enableOnFormTags: true, enableOnContentEditable: true });
}