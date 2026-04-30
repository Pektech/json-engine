/**
 * @jest-environment jsdom
 */

import { FileManager } from './file-manager'
import type { FileHandle } from '@/types/file-system'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock Blob and URL for jsdom
class MockBlob {
  constructor(private parts: any[], private options?: { type?: string }) {}
}
Object.defineProperty(window, 'Blob', { value: MockBlob, writable: true })

Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'blob:test'),
    revokeObjectURL: jest.fn()
  },
  writable: true
})

// Mock File System Access API
const mockFileHandle = {
  getFile: jest.fn(),
  createWritable: jest.fn()
}

const mockWritable = {
  write: jest.fn(),
  close: jest.fn()
}

describe('FileManager', () => {
  let fileManager: FileManager
  let originalCreateElement: typeof document.createElement

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => undefined)
    originalCreateElement = document.createElement.bind(document)
    fileManager = new FileManager()
  })

  afterEach(() => {
    document.createElement = originalCreateElement
    // @ts-ignore
    delete window.showOpenFilePicker
  })

  describe('getRecentFiles', () => {
    it('returns empty array initially', () => {
      const files = fileManager.getRecentFiles()
      expect(files).toEqual([])
    })

    it('returns recent files from localStorage', () => {
      const mockFiles = [
        { id: '1', name: 'test.json', lastOpened: '2024-01-01' }
      ]
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFiles))
      
      const fileManagerWithData = new FileManager()
      const files = fileManagerWithData.getRecentFiles()
      
      expect(files).toHaveLength(1)
      expect(files[0].name).toBe('test.json')
    })

    it('falls back to empty recent files when localStorage contains invalid JSON', () => {
      localStorageMock.getItem.mockReturnValue('{bad')
      expect(new FileManager().getRecentFiles()).toEqual([])
    })

    it('does not read recent files when window is unavailable', () => {
      const windowSpy = jest.spyOn(globalThis, 'window', 'get').mockReturnValue(undefined as any)

      expect(new FileManager().getRecentFiles()).toEqual([])

      windowSpy.mockRestore()
    })
  })

  describe('clearRecentFiles', () => {
    it('clears all recent files', () => {
      fileManager.clearRecentFiles()
      expect(fileManager.getRecentFiles()).toEqual([])
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'json-engine-recent-files',
        '[]'
      )
    })
  })

  describe('File System Access API support', () => {
    beforeEach(() => {
      // @ts-ignore
      window.showOpenFilePicker = jest.fn()
    })

    it('detects File System Access API support', () => {
      expect(typeof (window as any).showOpenFilePicker).toBe('function')
    })
  })

  describe('openFile', () => {
    it('opens a file with the File System Access API and adds it to recent files', async () => {
      const file = {
        name: 'api.json',
        size: 7,
        lastModified: 123,
        text: jest.fn().mockResolvedValue('{"a":1}'),
      }
      const fileHandle = { name: 'api.json', getFile: jest.fn().mockResolvedValue(file) }
      ;(window as any).showOpenFilePicker = jest.fn().mockResolvedValue([fileHandle])

      const result = await fileManager.openFile()

      expect('code' in result).toBe(false)
      if (!('code' in result)) {
        expect(result.content).toBe('{"a":1}')
        expect(result.handle.name).toBe('api.json')
        expect(result.handle.handle).toBe(fileHandle)
      }
      expect(fileManager.getRecentFiles()[0].name).toBe('api.json')
    })

    it('returns permission error when API open is cancelled', async () => {
      const error = new Error('cancelled')
      error.name = 'AbortError'
      ;(window as any).showOpenFilePicker = jest.fn().mockRejectedValue(error)

      await expect(fileManager.openFile()).resolves.toEqual({
        code: 'PERMISSION_DENIED',
        message: 'User cancelled file selection',
      })
    })

    it('returns unknown error when API open fails unexpectedly', async () => {
      ;(window as any).showOpenFilePicker = jest.fn().mockRejectedValue(new Error('boom'))

      await expect(fileManager.openFile()).resolves.toEqual({
        code: 'UNKNOWN',
        message: 'Failed to open file',
      })
    })

    it('opens a file with fallback input', async () => {
      let createdInput: HTMLInputElement | null = null
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const element = originalCreateElement(tagName)
        if (tagName === 'input') {
          createdInput = element as HTMLInputElement
          jest.spyOn(element, 'click').mockImplementation(() => {
            Object.defineProperty(element, 'files', {
              value: [{
                name: 'fallback.json',
                size: 2,
                lastModified: 456,
                text: jest.fn().mockResolvedValue('{}'),
              }],
              configurable: true,
            })
            setTimeout(() => createdInput?.onchange?.({ target: element } as any), 0)
          })
        }
        return element
      })

      await expect(fileManager.openFile()).resolves.toMatchObject({
        content: '{}',
        size: 2,
        lastModified: 456,
      })
      expect(fileManager.getRecentFiles()[0].name).toBe('fallback.json')
    })

    it('returns unknown when fallback input has no selected file', async () => {
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const element = originalCreateElement(tagName)
        if (tagName === 'input') {
          jest.spyOn(element, 'click').mockImplementation(() => {
            Object.defineProperty(element, 'files', { value: [], configurable: true })
            setTimeout(() => (element as HTMLInputElement).onchange?.({ target: element } as any), 0)
          })
        }
        return element
      })

      await expect(fileManager.openFile()).resolves.toEqual({ code: 'UNKNOWN', message: 'No file selected' })
    })

    it('returns unknown when fallback input files are absent', async () => {
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const element = originalCreateElement(tagName)
        if (tagName === 'input') {
          jest.spyOn(element, 'click').mockImplementation(() => {
            setTimeout(() => (element as HTMLInputElement).onchange?.({ target: {} } as any), 0)
          })
        }
        return element
      })

      await expect(fileManager.openFile()).resolves.toEqual({ code: 'UNKNOWN', message: 'No file selected' })
    })

    it('returns unknown when fallback file read fails', async () => {
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const element = originalCreateElement(tagName)
        if (tagName === 'input') {
          jest.spyOn(element, 'click').mockImplementation(() => {
            Object.defineProperty(element, 'files', {
              value: [{ name: 'bad.json', text: jest.fn().mockRejectedValue(new Error('bad')) }],
              configurable: true,
            })
            setTimeout(() => (element as HTMLInputElement).onchange?.({ target: element } as any), 0)
          })
        }
        return element
      })

      await expect(fileManager.openFile()).resolves.toEqual({ code: 'UNKNOWN', message: 'Failed to read file' })
    })

    it('returns permission error when fallback input aborts', async () => {
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const element = originalCreateElement(tagName)
        if (tagName === 'input') {
          jest.spyOn(element, 'click').mockImplementation(() => {
            setTimeout(() => (element as HTMLInputElement).onabort?.({} as any), 0)
          })
        }
        return element
      })

      await expect(fileManager.openFile()).resolves.toEqual({
        code: 'PERMISSION_DENIED',
        message: 'User cancelled file selection',
      })
    })
  })

  describe('saveFile', () => {
    it('saves through fallback when no native handle is present', async () => {
      const fallbackSpy = jest.spyOn(fileManager as any, 'saveFileWithFallback').mockReturnValue(true)

      await expect(fileManager.saveFile({ id: '1', name: 'fallback.json' }, '{}')).resolves.toBe(true)
      expect(fallbackSpy).toHaveBeenCalledWith('fallback.json', '{}')
    })

    it('saves through the File System Access API when a handle is present', async () => {
      ;(window as any).showOpenFilePicker = jest.fn()
      mockFileHandle.createWritable.mockResolvedValue(mockWritable)
      mockWritable.write.mockResolvedValue(undefined)
      mockWritable.close.mockResolvedValue(undefined)

      await expect(fileManager.saveFile({ id: '1', name: 'api.json', handle: mockFileHandle as any }, '{}')).resolves.toBe(true)
      expect(mockWritable.write).toHaveBeenCalledWith('{}')
      expect(mockWritable.close).toHaveBeenCalled()
    })

    it('returns permission error when API save is denied', async () => {
      const error = new Error('denied')
      error.name = 'NotAllowedError'
      ;(window as any).showOpenFilePicker = jest.fn()
      mockFileHandle.createWritable.mockRejectedValue(error)

      await expect(fileManager.saveFile({ id: '1', name: 'api.json', handle: mockFileHandle as any }, '{}')).resolves.toEqual({
        code: 'PERMISSION_DENIED',
        message: 'Permission denied to save file',
      })
    })

    it('returns unknown error when API save fails unexpectedly', async () => {
      ;(window as any).showOpenFilePicker = jest.fn()
      mockFileHandle.createWritable.mockRejectedValue(new Error('boom'))

      await expect(fileManager.saveFile({ id: '1', name: 'api.json', handle: mockFileHandle as any }, '{}')).resolves.toEqual({
        code: 'UNKNOWN',
        message: 'Failed to save file',
      })
    })
  })

  describe('saveFileWithFallback', () => {
    it('creates download link for saving', () => {
      const createElementSpy = jest.spyOn(document, 'createElement')
      const appendChildSpy = jest.spyOn(document.body, 'appendChild')
      const removeChildSpy = jest.spyOn(document.body, 'removeChild')
      
      const handle: FileHandle = {
        id: '1',
        name: 'test.json'
      }

      // Test via the fileManager class
      const result = (fileManager as any).saveFileWithFallback('test.json', '{"test": true}')
      
      expect(result).toBe(true)
      expect(createElementSpy).toHaveBeenCalledWith('a')
      
      createElementSpy.mockRestore()
      appendChildSpy.mockRestore()
      removeChildSpy.mockRestore()
    })

    it('adds json extension when missing', () => {
      let anchor: HTMLAnchorElement | null = null
      jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        const element = originalCreateElement(tagName)
        if (tagName === 'a') {
          anchor = element as HTMLAnchorElement
          jest.spyOn(element, 'click').mockImplementation(() => undefined)
        }
        return element
      })

      expect((fileManager as any).saveFileWithFallback('data', '{}')).toBe(true)
      expect(anchor?.download).toBe('data.json')
    })

    it('returns unknown error when fallback save throws', () => {
      jest.spyOn(document.body, 'appendChild').mockImplementation(() => {
        throw new Error('blocked')
      })

      expect((fileManager as any).saveFileWithFallback('data.json', '{}')).toEqual({
        code: 'UNKNOWN',
        message: 'Failed to save file',
      })
    })
  })

  describe('recent files', () => {
    it('deduplicates by name and keeps only the newest ten', async () => {
      for (let i = 0; i < 12; i++) {
        ;(fileManager as any).addToRecentFiles({ id: `${i}`, name: `file-${i}.json`, path: `file-${i}.json` })
      }
      ;(fileManager as any).addToRecentFiles({ id: 'new', name: 'file-5.json', path: 'file-5.json' })

      const recent = fileManager.getRecentFiles()
      expect(recent).toHaveLength(10)
      expect(recent[0]).toMatchObject({ id: 'new', name: 'file-5.json' })
      expect(recent.filter(file => file.name === 'file-5.json')).toHaveLength(1)
      expect(JSON.parse(localStorageMock.setItem.mock.calls.at(-1)?.[1])).toHaveLength(10)
    })

    it('ignores localStorage write failures', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('quota')
      })

      expect(() => (fileManager as any).addToRecentFiles({ id: '1', name: 'x.json' })).not.toThrow()
    })

    it('does not write recent files when window is unavailable', () => {
      const windowSpy = jest.spyOn(globalThis, 'window', 'get').mockReturnValue(undefined as any)

      expect(() => fileManager.clearRecentFiles()).not.toThrow()

      windowSpy.mockRestore()
    })
  })

  describe('openRecentFile', () => {
    it('opens a recent file with a live handle and updates lastOpened', async () => {
      ;(window as any).showOpenFilePicker = jest.fn()
      const file = { size: 2, lastModified: 999, text: jest.fn().mockResolvedValue('{}') }
      const recent = {
        id: '1',
        name: 'recent.json',
        path: 'recent.json',
        lastOpened: 'old',
        handle: { getFile: jest.fn().mockResolvedValue(file) } as any,
      }

      const result = await fileManager.openRecentFile(recent)

      expect('code' in result).toBe(false)
      if (!('code' in result)) {
        expect(result.content).toBe('{}')
        expect(result.handle.handle).toBe(recent.handle)
      }
      expect(recent.lastOpened).not.toBe('old')
      expect(localStorageMock.setItem).toHaveBeenCalled()
    })

    it('removes inaccessible recent file', async () => {
      const recent = { id: '1', name: 'missing.json', lastOpened: 'old' }
      ;(fileManager as any).recentFiles = [recent]

      await expect(fileManager.openRecentFile(recent)).resolves.toEqual({
        code: 'FILE_NOT_FOUND',
        message: 'File no longer accessible',
      })
      expect(fileManager.getRecentFiles()).toEqual([])
    })

    it('keeps list unchanged when inaccessible recent file is absent', async () => {
      const existing = { id: '1', name: 'existing.json', lastOpened: 'old' }
      ;(fileManager as any).recentFiles = [existing]

      await expect(fileManager.openRecentFile({ id: '2', name: 'missing.json', lastOpened: 'old' })).resolves.toEqual({
        code: 'FILE_NOT_FOUND',
        message: 'File no longer accessible',
      })
      expect(fileManager.getRecentFiles()).toEqual([existing])
    })
  })
})
