export const APP_HOTKEYS = {
  browserHelp: 'f1',
  openHelp: 'ctrl+/',
  openFile: 'ctrl+o',
  saveFile: 'ctrl+s',
  canvasSearch: 'ctrl+shift+f',
  undo: 'ctrl+z',
  redo: 'ctrl+shift+z, ctrl+y',
  editorFind: 'ctrl+f',
  editorReplace: 'ctrl+h',
} as const

export interface KeyboardShortcut {
  label: string
  keys: string
}

export interface KeyboardShortcutGroup {
  title: string
  shortcuts: KeyboardShortcut[]
}

export const KEYBOARD_SHORTCUT_GROUPS: KeyboardShortcutGroup[] = [
  {
    title: 'Global Shortcuts',
    shortcuts: [
      { label: 'Open File', keys: 'Ctrl + O' },
      { label: 'Save File', keys: 'Ctrl + S' },
      { label: 'Canvas Search', keys: 'Ctrl + Shift + F' },
      { label: 'Open Help', keys: 'F1' },
      { label: 'Open Help', keys: 'Ctrl + /' },
    ],
  },
  {
    title: 'Editor Shortcuts (Monaco)',
    shortcuts: [
      { label: 'Find', keys: 'Ctrl + F' },
      { label: 'Replace', keys: 'Ctrl + H' },
      { label: 'Find Next', keys: 'F3' },
      { label: 'Format', keys: 'Shift + Alt + F' },
    ],
  },
  {
    title: 'Canvas Shortcuts',
    shortcuts: [
      { label: 'Zoom In', keys: 'Ctrl + +' },
      { label: 'Zoom Out', keys: 'Ctrl + -' },
      { label: 'Reset Zoom', keys: 'Ctrl + 0' },
      { label: 'Delete Node', keys: 'Delete' },
    ],
  },
]
