export interface FileHandle {
  id: string
  name: string
  path?: string
  handle?: FileSystemFileHandle
}

export interface OpenFileResult {
  handle: FileHandle
  content: string
  size: number
  lastModified: number
}

export interface RecentFile {
  id: string
  name: string
  path?: string
  lastOpened: string
  handle?: FileSystemFileHandle
}

export interface FileManagerError {
  code: 'PERMISSION_DENIED' | 'FILE_NOT_FOUND' | 'INVALID_JSON' | 'NOT_SUPPORTED' | 'UNKNOWN'
  message: string
}
