import { act, renderHook } from '@testing-library/react'

const fileManagerMock = {
  getRecentFiles: jest.fn(),
  openFile: jest.fn(),
  saveFile: jest.fn(),
  openRecentFile: jest.fn(),
  clearRecentFiles: jest.fn(),
}

jest.mock('@/lib/file-manager', () => ({
  fileManager: fileManagerMock,
}))

import { useFileManager } from './useFileManager'

describe('useFileManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    fileManagerMock.getRecentFiles.mockReturnValue([{ id: '1', name: 'initial.json', lastOpened: 'now' }])
  })

  it('initializes recent files from file manager', () => {
    const { result } = renderHook(() => useFileManager())

    expect(result.current.recentFiles).toEqual([{ id: '1', name: 'initial.json', lastOpened: 'now' }])
    expect(result.current.isLoading).toBe(false)
  })

  it('opens file, refreshes recent files, and resets loading', async () => {
    fileManagerMock.openFile.mockResolvedValue({ handle: { id: '2', name: 'open.json' }, content: '{}', size: 2, lastModified: 1 })
    fileManagerMock.getRecentFiles
      .mockReturnValueOnce([])
      .mockReturnValueOnce([{ id: '2', name: 'open.json', lastOpened: 'later' }])
    const { result } = renderHook(() => useFileManager())

    await act(async () => {
      await expect(result.current.openFile()).resolves.toMatchObject({ content: '{}' })
    })

    expect(result.current.recentFiles).toEqual([{ id: '2', name: 'open.json', lastOpened: 'later' }])
    expect(result.current.isLoading).toBe(false)
  })

  it('resets loading when open file rejects', async () => {
    fileManagerMock.openFile.mockRejectedValue(new Error('boom'))
    const { result } = renderHook(() => useFileManager())

    await act(async () => {
      await expect(result.current.openFile()).rejects.toThrow('boom')
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('saves file and resets loading', async () => {
    fileManagerMock.saveFile.mockResolvedValue(true)
    const { result } = renderHook(() => useFileManager())

    await act(async () => {
      await expect(result.current.saveFile({ id: '1', name: 'file.json' }, '{}')).resolves.toBe(true)
    })

    expect(fileManagerMock.saveFile).toHaveBeenCalledWith({ id: '1', name: 'file.json' }, '{}')
    expect(result.current.isLoading).toBe(false)
  })

  it('resets loading when save file rejects', async () => {
    fileManagerMock.saveFile.mockRejectedValue(new Error('save failed'))
    const { result } = renderHook(() => useFileManager())

    await act(async () => {
      await expect(result.current.saveFile({ id: '1', name: 'file.json' }, '{}')).rejects.toThrow('save failed')
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('opens recent file, refreshes recent files, and resets loading', async () => {
    const recent = { id: '1', name: 'recent.json', lastOpened: 'old' }
    fileManagerMock.openRecentFile.mockResolvedValue({ handle: { id: '1', name: 'recent.json' }, content: '{}', size: 2, lastModified: 1 })
    fileManagerMock.getRecentFiles
      .mockReturnValueOnce([recent])
      .mockReturnValueOnce([{ ...recent, lastOpened: 'new' }])
    const { result } = renderHook(() => useFileManager())

    await act(async () => {
      await expect(result.current.openRecentFile(recent)).resolves.toMatchObject({ content: '{}' })
    })

    expect(result.current.recentFiles[0].lastOpened).toBe('new')
    expect(result.current.isLoading).toBe(false)
  })

  it('resets loading when recent file open rejects', async () => {
    const recent = { id: '1', name: 'recent.json', lastOpened: 'old' }
    fileManagerMock.openRecentFile.mockRejectedValue(new Error('missing'))
    const { result } = renderHook(() => useFileManager())

    await act(async () => {
      await expect(result.current.openRecentFile(recent)).rejects.toThrow('missing')
    })

    expect(result.current.isLoading).toBe(false)
  })

  it('clears recent files locally and in manager', () => {
    const { result } = renderHook(() => useFileManager())

    act(() => {
      result.current.clearRecentFiles()
    })

    expect(fileManagerMock.clearRecentFiles).toHaveBeenCalled()
    expect(result.current.recentFiles).toEqual([])
  })
})
