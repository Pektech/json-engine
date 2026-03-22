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

export function parseJsonWithLocation(jsonText: string): { 
  data: any
  locations: Map<string, LineLocation>
} {
  const locations = new Map<string, LineLocation>()
  let pathStack: (string | number)[] = ['root']
  
  try {
    const data = JSON.parse(jsonText)
    
    function traverse(obj: any, currentPath: string, currentLine: number = 1): void {
      if (obj === null || typeof obj !== 'object') {
        locations.set(currentPath, { line: currentLine, column: 1 })
        return
      }
      
      locations.set(currentPath, { line: currentLine, column: 1 })
      
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          traverse(item, `${currentPath}[${index}]`, currentLine + index + 1)
        })
      } else {
        Object.entries(obj).forEach(([key, value], index) => {
          const childPath = `${currentPath}.${key}`
          const lineOffset = index + 1
          traverse(value, childPath, currentLine + lineOffset)
        })
      }
    }
    
    traverse(data, 'root')
    return { data, locations }
  } catch {
    return { data: null, locations }
  }
}

export function pathToLine(jsonText: string, path: string): LineLocation | null {
  const { locations } = parseJsonWithLocation(jsonText)
  return locations.get(path) || null
}

export function lineToPath(jsonText: string, line: number): string | null {
  const { locations } = parseJsonWithLocation(jsonText)
  
  let closestPath: string | null = null
  let closestLineDiff = Infinity
  
  locations.forEach((location, path) => {
    const lineDiff = Math.abs(location.line - line)
    if (lineDiff < closestLineDiff) {
      closestLineDiff = lineDiff
      closestPath = path
    }
  })
  
  return closestPath
}
