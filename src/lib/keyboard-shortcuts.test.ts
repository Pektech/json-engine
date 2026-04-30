import { APP_HOTKEYS, KEYBOARD_SHORTCUT_GROUPS } from './keyboard-shortcuts'

describe('keyboard shortcut registry', () => {
  it('keeps displayed global shortcuts aligned with registered app hotkeys', () => {
    expect(KEYBOARD_SHORTCUT_GROUPS[0].shortcuts.map((shortcut) => shortcut.keys)).toEqual([
      'Ctrl + O',
      'Ctrl + S',
      'Ctrl + Shift + F',
      'F1',
      'Ctrl + /',
    ])

    expect(APP_HOTKEYS).toMatchObject({
      browserHelp: 'f1',
      openHelp: 'ctrl+/',
      openFile: 'ctrl+o',
      saveFile: 'ctrl+s',
      canvasSearch: 'ctrl+shift+f',
    })
  })
})
