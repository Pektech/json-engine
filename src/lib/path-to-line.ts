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
  let scopeStart = 0
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]
    const isArrIndex = /^\d+$/.test(segment)
    
    // Escape regex special chars in segment key name
    const escapedSegment = segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    
    // Pattern to find this key OR array index
    const keyPattern = isArrIndex
      ? new RegExp(`\\[${escapedSegment}\\]\\s*:`)
      : new RegExp(`"${escapedSegment}"\\s*:`)
    
    // Search within the current scope (from scopeStart onwards)
    const scopeText = jsonText.slice(scopeStart)
    const match = scopeText.match(keyPattern)
    
    if (!match || match.index === undefined) {
      // Fallback: search globally
      const globalMatch = jsonText.match(keyPattern)
      if (globalMatch && globalMatch.index !== undefined) {
        return getLinePosition(jsonText, globalMatch.index)
      }
      return { line: 1, column: 1 }
    }
    
    const absoluteIndex = scopeStart + match.index
    
    // If this is the LAST segment, return ITS position  
    if (i === segments.length - 1) {
      return getLinePosition(jsonText, absoluteIndex)
    }
    
    // Move past key+colon: next iteration searches within value
    scopeStart = absoluteIndex + match[0].length
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
    // Extract the key label from this path
    const pathParts = path.split(/[.\[\]]/).filter(Boolean)
    const lastPart = pathParts[pathParts.length - 1]

    // Check if this path's key matches our search (remove quotes if present)
    const cleanLastPart = lastPart.replace(/^"|"$/g, '')
    const cleanKeyLabel = keyLabel.replace(/^"|"$/g, '')


    if (cleanLastPart === cleanKeyLabel) {
      // Calculate how close this is to our target line
      const lineDiff = Math.abs(location.line - approximateLine)

      // Score: prefer closer lines
      const score = 1000 - lineDiff * 10


      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          path,
          line: location.line,
          score
        }
      }
    }
  }
  
  return bestMatch?.path || null
}
