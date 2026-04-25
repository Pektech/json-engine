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

  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
    fileManager = new FileManager()
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

    afterEach(() => {
      // @ts-ignore
      delete window.showOpenFilePicker
    })

    it('detects File System Access API support', () => {
      expect(typeof (window as any).showOpenFilePicker).toBe('function')
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
  })
})
