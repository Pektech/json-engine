import { renderHook } from '@testing-library/react'

const hotkeys: Record<string, (event: any) => void> = {}
const focusContext = { focusedArea: 'canvas' }
const fileManager = { openFile: jest.fn(), saveFile: jest.fn() }
const appStoreState = {
  currentFile: 'file.json',
  currentFileHandle: null,
  jsonText: '{}',
  setSearchQuery: jest.fn(),
  loadFile: jest.fn(),
  setFileHandle: jest.fn(),
  undo: jest.fn(),
  redo: jest.fn(),
}

jest.mock('react-hotkeys-hook', () => ({
  useHotkeys: jest.fn((keys: string, callback: (event: any) => void) => {
    hotkeys[keys] = callback
  }),
}))

jest.mock('./useFocusContext', () => ({
  useFocusContext: () => focusContext,
}))

jest.mock('./useFileManager', () => ({
  useFileManager: () => fileManager,
}))

jest.mock('../store/app-store', () => ({
  useAppStore: Object.assign(
    jest.fn(() => ({
      currentFile: appStoreState.currentFile,
      jsonText: appStoreState.jsonText,
      setSearchQuery: appStoreState.setSearchQuery,
      loadFile: appStoreState.loadFile,
    })),
    { getState: jest.fn(() => appStoreState) },
  ),
}))

import { setOnOpenHelp, useKeyboardShortcuts } from './useKeyboardShortcuts'

const event = () => ({
  preventDefault: jest.fn(),
  stopPropagation: jest.fn(),
  key: '',
})

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    Object.keys(hotkeys).forEach(key => delete hotkeys[key])
    jest.clearAllMocks()
    focusContext.focusedArea = 'canvas'
    appStoreState.currentFile = 'file.json'
    appStoreState.currentFileHandle = null
    appStoreState.jsonText = '{}'
    setOnOpenHelp(jest.fn())
  })

  it('opens help from F1 capture listener and registered hotkeys', () => {
    const onOpen = jest.fn()
    setOnOpenHelp(onOpen)
    renderHook(() => useKeyboardShortcuts())

    const f1 = new KeyboardEvent('keydown', { key: 'F1', bubbles: true, cancelable: true })
    window.dispatchEvent(f1)
    expect(onOpen).toHaveBeenCalledWith(true)

    const hotkeyEvent = event()
    hotkeys.f1(hotkeyEvent)
    hotkeys['ctrl+/'](hotkeyEvent)
    expect(hotkeyEvent.preventDefault).toHaveBeenCalled()
    expect(onOpen).toHaveBeenCalledTimes(3)
  })

  it('ignores non-F1 keys in capture listener and handles absent help callback', () => {
    setOnOpenHelp(null as any)
    renderHook(() => useKeyboardShortcuts())

    expect(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A' }))).not.toThrow()
    expect(() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'F1' }))).not.toThrow()
  })

  it('opens a selected file and stores file handle', async () => {
    fileManager.openFile.mockResolvedValue({
      handle: { name: 'opened.json', handle: { name: 'opened.json' } },
      content: '{"a":1}',
      size: 7,
      lastModified: 1,
    })
    renderHook(() => useKeyboardShortcuts())

    hotkeys['ctrl+o'](event())
    await Promise.resolve()

    expect(appStoreState.loadFile).toHaveBeenCalledWith('opened.json', '{"a":1}')
    await Promise.resolve()
    expect(appStoreState.setFileHandle).toHaveBeenCalledWith({ name: 'opened.json' })
  })

  it('stores null file handle when opened file has no native handle', async () => {
    fileManager.openFile.mockResolvedValue({
      handle: { name: 'opened.json' },
      content: '{}',
      size: 2,
      lastModified: 1,
    })
    renderHook(() => useKeyboardShortcuts())

    hotkeys['ctrl+o'](event())
    await Promise.resolve()
    await Promise.resolve()

    expect(appStoreState.setFileHandle).toHaveBeenCalledWith(null)
  })

  it('logs non-permission open errors and ignores permission denials', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    renderHook(() => useKeyboardShortcuts())

    fileManager.openFile.mockResolvedValueOnce({ code: 'UNKNOWN', message: 'bad' })
    hotkeys['ctrl+o'](event())
    await Promise.resolve()
    expect(errorSpy).toHaveBeenCalledWith('Failed to open file:', 'bad')

    fileManager.openFile.mockResolvedValueOnce({ code: 'PERMISSION_DENIED', message: 'cancel' })
    hotkeys['ctrl+o'](event())
    await Promise.resolve()
    expect(errorSpy).toHaveBeenCalledTimes(1)
  })

  it('logs thrown open failures', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    fileManager.openFile.mockRejectedValue(new Error('open failed'))
    renderHook(() => useKeyboardShortcuts())

    hotkeys['ctrl+o'](event())
    await Promise.resolve()

    expect(errorSpy).toHaveBeenCalledWith('Failed to open file:', expect.any(Error))
  })

  it('saves current file and logs save failures', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    fileManager.saveFile.mockResolvedValue(true)
    renderHook(() => useKeyboardShortcuts())

    hotkeys['ctrl+s'](event())
    await Promise.resolve()
    expect(fileManager.saveFile).toHaveBeenCalledWith({ handle: null, name: 'file.json', path: 'file.json' }, '{}')

    fileManager.saveFile.mockRejectedValue(new Error('save failed'))
    hotkeys['ctrl+s'](event())
    await Promise.resolve()
    expect(errorSpy).toHaveBeenCalledWith('Failed to save file:', expect.any(Error))
  })

  it('does not save when no current file exists', async () => {
    appStoreState.currentFile = null as any
    renderHook(() => useKeyboardShortcuts())

    hotkeys['ctrl+s'](event())
    await Promise.resolve()

    expect(fileManager.saveFile).not.toHaveBeenCalled()
  })

  it('focuses and selects workspace search input', () => {
    document.body.innerHTML = '<input data-workspace-search="true" />'
    const input = document.querySelector('input') as HTMLInputElement
    const focusSpy = jest.spyOn(input, 'focus')
    const selectSpy = jest.spyOn(input, 'select')
    renderHook(() => useKeyboardShortcuts())

    hotkeys['ctrl+shift+f'](event())

    expect(focusSpy).toHaveBeenCalled()
    expect(selectSpy).toHaveBeenCalled()
  })

  it('does nothing when workspace search input is absent', () => {
    document.body.innerHTML = ''
    renderHook(() => useKeyboardShortcuts())

    expect(() => hotkeys['ctrl+shift+f'](event())).not.toThrow()
  })

  it('handles undo, redo, search, and replace shortcuts outside editor focus', () => {
    renderHook(() => useKeyboardShortcuts())
    const undoEvent = event()
    const redoEvent = event()
    const searchEvent = event()
    const replaceEvent = event()

    hotkeys['ctrl+z'](undoEvent)
    hotkeys['ctrl+shift+z, ctrl+y'](redoEvent)
    hotkeys['ctrl+f'](searchEvent)
    hotkeys['ctrl+h'](replaceEvent)

    expect(appStoreState.undo).toHaveBeenCalled()
    expect(appStoreState.redo).toHaveBeenCalled()
    expect(appStoreState.setSearchQuery).toHaveBeenCalledWith('')
    expect(undoEvent.preventDefault).toHaveBeenCalled()
    expect(redoEvent.preventDefault).toHaveBeenCalled()
    expect(searchEvent.preventDefault).toHaveBeenCalled()
    expect(replaceEvent.preventDefault).toHaveBeenCalled()
  })

  it('lets editor handle undo, redo, search, and replace when editor focused', () => {
    focusContext.focusedArea = 'editor'
    renderHook(() => useKeyboardShortcuts())
    const undoEvent = event()
    const redoEvent = event()
    const searchEvent = event()
    const replaceEvent = event()

    hotkeys['ctrl+z'](undoEvent)
    hotkeys['ctrl+shift+z, ctrl+y'](redoEvent)
    hotkeys['ctrl+f'](searchEvent)
    hotkeys['ctrl+h'](replaceEvent)

    expect(appStoreState.undo).not.toHaveBeenCalled()
    expect(appStoreState.redo).not.toHaveBeenCalled()
    expect(appStoreState.setSearchQuery).not.toHaveBeenCalled()
    expect(undoEvent.preventDefault).not.toHaveBeenCalled()
    expect(redoEvent.preventDefault).not.toHaveBeenCalled()
    expect(searchEvent.preventDefault).not.toHaveBeenCalled()
    expect(replaceEvent.preventDefault).not.toHaveBeenCalled()
  })
})
