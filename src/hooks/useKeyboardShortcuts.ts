import { useHotkeys } from 'react-hotkeys-hook';
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
  const { currentFile, jsonText, setSearchQuery } = useAppStore();

  const handleOpenFile = async () => {
    try {
      await openFile();
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
  });

  useHotkeys('ctrl+/', (event) => {
    event.preventDefault();
    if (helpPanelOpenCallback) {
      helpPanelOpenCallback(true);
    }
  });

  useHotkeys('ctrl+o', (event) => {
    event.preventDefault();
    handleOpenFile();
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+s', (event) => {
    event.preventDefault();
    handleSaveFile();
  }, { enableOnFormTags: true });

  useHotkeys('ctrl+shift+f', (event) => {
    event.preventDefault();
    if (focusedArea !== 'editor') {
      setSearchQuery('');
    }
  });

  useHotkeys('ctrl+f', (event) => {
    if (focusedArea === 'canvas' || focusedArea === 'global') {
      event.preventDefault();
      setSearchQuery('');
    }
  });

  useHotkeys('ctrl+h', (event) => {
    if (focusedArea === 'canvas' || focusedArea === 'global') {
      event.preventDefault();
      console.log('Replace functionality...');
    }
  });
}