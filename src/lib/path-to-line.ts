interface LineLocation {
  line: number
  column: number
}

function getLinePosition(text: string, index: number): LineLocation {
  const lines = text.slice(0, index).split('\n')
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  }
}

function findLocationInText(jsonText: string, path: string): LineLocation {
  if (path === 'root') return { line: 1, column: 1 }
  
  const segments = path.split(/[.\[\]]/).filter(Boolean)
  
  // Skip "root" since it's not a real key in the JSON
  const keysToNavigate = segments[0] === 'root' ? segments.slice(1) : segments
  
  if (keysToNavigate.length === 0) {
    return { line: 1, column: 1 }
  }
  
  let searchStart = 0
  
  for (let i = 0; i < keysToNavigate.length - 1; i++) {
    const key = keysToNavigate[i]
    const isArrIndex = /^\d+$/.test(key)
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = isArrIndex 
      ? new RegExp(`\\[${escapedKey}\\]\\s*:`)
      : new RegExp(`"${escapedKey}"\\s*:`)
    
    const textToSearch = jsonText.slice(searchStart)
    const match = textToSearch.match(pattern)
    
    if (!match || match.index === undefined) break
    
    searchStart += match.index + match[0].length
  }
  
  const targetKey = keysToNavigate[keysToNavigate.length - 1]
  const isArrIndex = /^\d+$/.test(targetKey)
  const escapedKey = targetKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const pattern = isArrIndex 
    ? new RegExp(`\\[${escapedKey}\\]\\s*:`)
    : new RegExp(`"${escapedKey}"\\s*:`)
  
  const textToSearch = jsonText.slice(searchStart)
  const match = textToSearch.match(pattern)
  
  if (match && match.index !== undefined) {
    return getLinePosition(jsonText, searchStart + match.index)
  }
  
  const fallbackMatch = jsonText.match(pattern)
  if (fallbackMatch && fallbackMatch.index !== undefined) {
    return getLinePosition(jsonText, fallbackMatch.index)
  }
  
  return { line: 1, column: 1 }
}


export function parseJsonWithLocation(jsonText: string): { 
  data: any
  locations: Map<string, LineLocation>
} {
  const locations = new Map<string, LineLocation>()
  
  try {
    const data = JSON.parse(jsonText)
    
    const traverse = (obj: any, currentPath: string): void => {
      
      const location = findLocationInText(jsonText, currentPath)
      locations.set(currentPath, location)
      
      if (obj === null || typeof obj !== 'object') {
        return
      }
      
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          traverse(item, `${currentPath}[${index}]`)
        })
      } else {
        const entries = Object.entries(obj)
        entries.forEach(([key]) => {
          traverse(obj[key as keyof typeof obj], `${currentPath}.${key}`)
        })
      }
    }
    
    traverse(data, 'root')
    return { data, locations }
  } catch (e) {
    console.error('[parseJsonWithLocation] Parse error:', e)
    return { data: null, locations }
  }
}

export function pathToLine(jsonText: string, path: string): LineLocation | null {
  const { locations } = parseJsonWithLocation(jsonText)
  return locations.get(path) || null
}

export function lineToPath(jsonText: string, line: number): string | null {
  // Check if this line is just a closing brace with no actual key/value
  // (cursor on } or ] shouldn't trigger path selection)
  const lineContent = jsonText.split('\n')[line - 1] || ''
  if (lineContent.trim() === '' || /^[\s]*[\}\]]/.test(lineContent.trim())) {
    // Line has only closing brace(s) — no real path to select
    return null
  }
  
  const { locations } = parseJsonWithLocation(jsonText)
  
  let bestPath: string | null = null
  let bestScore = -1
  
  locations.forEach((location, path) => {
    // Only consider paths that are AT or BEFORE this line (not after)
    if (location.line > line) return
    
    // Score based on:
    // 1. How close the line is (closer = better)
    // 2. Path depth (deeper = more specific = better)
    const lineDiff = line - location.line
    const depth = path.split(/[.\[\]]/).filter(Boolean).length
    
    // Score: prioritize closeness, but give bonus for depth
    // A path that's 5 lines away but deeper might be better than root at 2 lines
    const score = 1000 - lineDiff * 10 + depth * 50
    
    if (score > bestScore) {
      bestScore = score
      bestPath = path
    }
  })
  
  return bestPath
}

/**
 * Find the full path to a node by its key label and approximate line number.
 * This is more accurate than line-based matching because it matches the actual key name.
 */
export function findPathByKeyLabel(jsonText: string, keyLabel: string, approximateLine: number): string | null {
  const { locations } = parseJsonWithLocation(jsonText)
  let bestMatch: { path: string; line: number; score: number } | null = null
  
  for (const [path, location] of Array.from(locations.entries())) {
    const pathParts = path.split(/[.\[\]]/).filter(Boolean)
    const lastPart = pathParts[pathParts.length - 1]
    const cleanLastPart = lastPart.replace(/^"|"$/g, '')
    const cleanKeyLabel = keyLabel.replace(/^"|"$/g, '')

    if (cleanLastPart === cleanKeyLabel) {
      const lineDiff = Math.abs(location.line - approximateLine)

      // Only consider keys AT or BEFORE the target line
      // And only match if the line is EXACT or very close (within 1 line)
      if (location.line <= approximateLine && (approximateLine - location.line) <= 1) {
        // Prefer exact line match
        const score = 1000 - (approximateLine - location.line) * 10 + pathParts.length * 50

        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { path, line: location.line, score }
        }
      }
    }
  }
  
  return bestMatch?.path || null
}
