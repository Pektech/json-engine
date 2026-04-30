export function parseJsonPath(path: string): string[] {
  return path.split(/[.\[\]]/).filter(Boolean).filter(part => part !== 'root')
}

export function getJsonPathLabel(path: string): string {
  const parts = parseJsonPath(path)
  const lastPart = parts[parts.length - 1] || 'root'

  return /^\d+$/.test(lastPart) ? `[${lastPart}]` : lastPart
}

export function getValueAtJsonPath(obj: unknown, path: string): unknown {
  if (!path || path === 'root') return obj

  let current = obj as Record<string, unknown>
  for (const key of parseJsonPath(path)) {
    if (current === undefined || current === null) return undefined
    current = current[key] as Record<string, unknown>
  }

  return current
}
