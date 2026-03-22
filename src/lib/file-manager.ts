import type { FileHandle, OpenFileResult, RecentFile, FileManagerError } '@/types/file-system'

const RECENT_FILES_KEY = 'json-engine-recent-files'
const MAX_RECENT_FILES = 10

function generateFileId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showOpenFilePicker' in window
}

export class FileManager {
  private recentFiles: RecentFile[] = []

  constructor() {
    this.loadRecentFiles()
  }

  private loadRecentFiles(): void {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(RECENT_FILES_KEY)
      if (stored) {
        this.recentFiles = JSON.parse(stored)
      }
    } catch {
      this.recentFiles = []
    }
  }

  private saveRecentFiles(): void {
    if (typeof window === 'undefined') return
    
    try {
      const filesWithoutHandles = this.recentFiles.map(({ handle, ...file }) => file)
      localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(filesWithoutHandles))
    } catch {
      // Ignore localStorage errors
    }
  }

  async openFile(): Promise<OpenFileResult | FileManagerError> {
    if (isFileSystemAccessSupported()) {
      return this.openFileWithAPI()
    }
    return this.openFileWithFallback()
  }

  private async openFileWithAPI(): Promise<OpenFileResult | FileManagerError> {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [{
          description: 'JSON files',
          accept: { 'application/json': ['.json'] }
        }],
        multiple: false
      })

      const file = await fileHandle.getFile()
      const content = await file.text()
      
      const handle: FileHandle = {
        id: generateFileId(),
        name: file.name,
        path: fileHandle.name,
        handle: fileHandle
      }

      const result: OpenFileResult = {
        handle,
        content,
        size: file.size,
        lastModified: file.lastModified
      }

      this.addToRecentFiles(handle)
      return result
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { code: 'PERMISSION_DENIED', message: 'User cancelled file selection' }
        }
      }
      return { code: 'UNKNOWN', message: 'Failed to open file' }
    }
  }

  private openFileWithFallback(): Promise<OpenFileResult | FileManagerError> {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json,application/json'
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) {
          resolve({ code: 'UNKNOWN', message: 'No file selected' })
          return
        }

        try {
          const content = await file.text()
          
          const handle: FileHandle = {
            id: generateFileId(),
            name: file.name,
            path: file.name
          }

          const result: OpenFileResult = {
            handle,
            content,
            size: file.size,
            lastModified: file.lastModified
          }

          this.addToRecentFiles(handle)
          resolve(result)
        } catch {
          resolve({ code: 'UNKNOWN', message: 'Failed to read file' })
        }
      }

      input.onabort = () => {
        resolve({ code: 'PERMISSION_DENIED', message: 'User cancelled file selection' })
      }

      input.click()
    })
  }

  async saveFile(handle: FileHandle, content: string): Promise<true | FileManagerError> {
    if (handle.handle && isFileSystemAccessSupported()) {
      return this.saveFileWithAPI(handle.handle, content)
    }
    return this.saveFileWithFallback(handle.name, content)
  }

  private async saveFileWithAPI(fileHandle: FileSystemFileHandle, content: string): Promise<true | FileManagerError> {
    try {
      const writable = await fileHandle.createWritable()
      await writable.write(content)
      await writable.close()
      return true
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          return { code: 'PERMISSION_DENIED', message: 'Permission denied to save file' }
        }
      }
      return { code: 'UNKNOWN', message: 'Failed to save file' }
    }
  }

  private saveFileWithFallback(filename: string, content: string): true | FileManagerError {
    try {
      const blob = new Blob([content], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      return true
    } catch {
      return { code: 'UNKNOWN', message: 'Failed to save file' }
    }
  }

  private addToRecentFiles(handle: FileHandle): void {
    const existingIndex = this.recentFiles.findIndex(f => f.name === handle.name)
    
    if (existingIndex >= 0) {
      this.recentFiles.splice(existingIndex, 1)
    }

    const recentFile: RecentFile = {
      id: handle.id,
      name: handle.name,
      path: handle.path,
      lastOpened: new Date().toISOString(),
      handle: handle.handle
    }

    this.recentFiles.unshift(recentFile)

    if (this.recentFiles.length > MAX_RECENT_FILES) {
      this.recentFiles = this.recentFiles.slice(0, MAX_RECENT_FILES)
    }

    this.saveRecentFiles()
  }

  getRecentFiles(): RecentFile[] {
    return [...this.recentFiles]
  }

  async openRecentFile(recentFile: RecentFile): Promise<OpenFileResult | FileManagerError> {
    if (recentFile.handle && isFileSystemAccessSupported()) {
      try {
        const file = await recentFile.handle.getFile()
        const content = await file.text()
        
        recentFile.lastOpened = new Date().toISOString()
        this.saveRecentFiles()

        return {
          handle: {
            id: recentFile.id,
            name: recentFile.name,
            path: recentFile.path,
            handle: recentFile.handle
          },
          content,
          size: file.size,
          lastModified: file.lastModified
        }
      } catch {
        // Fall through to remove from recent files
      }
    }

    // Remove from recent if file no longer accessible
    const index = this.recentFiles.findIndex(f => f.id === recentFile.id)
    if (index >= 0) {
      this.recentFiles.splice(index, 1)
      this.saveRecentFiles()
    }

    return { code: 'FILE_NOT_FOUND', message: 'File no longer accessible' }
  }

  clearRecentFiles(): void {
    this.recentFiles = []
    this.saveRecentFiles()
  }
}

export const fileManager = new FileManager()
