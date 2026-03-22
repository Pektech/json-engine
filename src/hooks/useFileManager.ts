'use client'

import { useState, useCallback } from 'react'
import { fileManager } from '@/lib/file-manager'
import type { OpenFileResult, RecentFile, FileManagerError, FileHandle } from '@/types/file-system'

interface UseFileManagerReturn {
  openFile: () => Promise<OpenFileResult | FileManagerError>
  saveFile: (handle: FileHandle, content: string) => Promise<true | FileManagerError>
  recentFiles: RecentFile[]
  openRecentFile: (file: RecentFile) => Promise<OpenFileResult | FileManagerError>
  clearRecentFiles: () => void
  isLoading: boolean
}

export function useFileManager(): UseFileManagerReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(fileManager.getRecentFiles())

  const openFile = useCallback(async (): Promise<OpenFileResult | FileManagerError> => {
    setIsLoading(true)
    try {
      const result = await fileManager.openFile()
      setRecentFiles(fileManager.getRecentFiles())
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveFile = useCallback(async (handle: FileHandle, content: string): Promise<true | FileManagerError> => {
    setIsLoading(true)
    try {
      return await fileManager.saveFile(handle, content)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const openRecentFile = useCallback(async (file: RecentFile): Promise<OpenFileResult | FileManagerError> => {
    setIsLoading(true)
    try {
      const result = await fileManager.openRecentFile(file)
      setRecentFiles(fileManager.getRecentFiles())
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearRecentFiles = useCallback(() => {
    fileManager.clearRecentFiles()
    setRecentFiles([])
  }, [])

  return {
    openFile,
    saveFile,
    recentFiles,
    openRecentFile,
    clearRecentFiles,
    isLoading
  }
}
