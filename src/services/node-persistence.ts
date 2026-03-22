import type { JsonEngineState } from '@/types/persistence'

const SIDECAR_EXTENSION = '.json-engine.json'

export async function loadNodePositions(filePath: string): Promise<JsonEngineState | null> {
  try {
    if (typeof window === 'undefined') {
      return null
    }
    
    const stored = localStorage.getItem(`json-engine:${filePath}`)
    if (stored) {
      return JSON.parse(stored) as JsonEngineState
    }
    
    return null
  } catch {
    return null
  }
}

export async function saveNodePositions(
  filePath: string,
  data: JsonEngineState
): Promise<void> {
  try {
    const dataWithTimestamp = {
      ...data,
      lastModified: new Date().toISOString(),
    }
    
    if (typeof window === 'undefined') {
      return
    }
    
    localStorage.setItem(`json-engine:${filePath}`, JSON.stringify(dataWithTimestamp))
  } catch {
    console.error('Failed to save node positions')
  }
}

export function generateFileHash(content: string): string {
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}
