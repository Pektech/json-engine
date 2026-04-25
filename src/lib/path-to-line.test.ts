/**
 * @jest-environment jsdom
 */

import { parseJsonWithLocation, pathToLine, lineToPath, findPathByKeyLabel } from './path-to-line'

describe('path-to-line', () => {
  describe('parseJsonWithLocation', () => {
    it('returns parsed data and locations for valid JSON', () => {
      const jsonText = '{"a": 1}'
      const result = parseJsonWithLocation(jsonText)
      
      expect(result.data).toEqual({ a: 1 })
      expect(result.locations).toBeInstanceOf(Map)
      expect(result.locations.size).toBeGreaterThan(0)
    })

    it('returns locations map with root path', () => {
      const jsonText = '{"a": 1}'
      const result = parseJsonWithLocation(jsonText)
      
      expect(result.locations.has('root')).toBe(true)
      expect(result.locations.get('root')).toEqual({ line: 1, column: 1 })
    })

    it('returns locations map with nested paths', () => {
      const jsonText = '{"a": {"b": 1}}'
      const result = parseJsonWithLocation(jsonText)
      
      expect(result.locations.has('root')).toBe(true)
      expect(result.locations.has('root.a')).toBe(true)
      expect(result.locations.has('root.a.b')).toBe(true)
    })

    it('returns empty data and locations for invalid JSON', () => {
      const jsonText = '{invalid}'
      const result = parseJsonWithLocation(jsonText)
      
      expect(result.data).toBeNull()
      expect(result.locations).toBeInstanceOf(Map)
    })

    it('handles arrays with index paths', () => {
      const jsonText = '{"arr": [1, 2]}'
      const result = parseJsonWithLocation(jsonText)
      
      expect(result.locations.has('root.arr[0]')).toBe(true)
      expect(result.locations.has('root.arr[1]')).toBe(true)
    })
  })

  describe('pathToLine', () => {
    it('returns location for root path', () => {
      const jsonText = '{"a": 1}'
      const result = pathToLine(jsonText, 'root')
      
      expect(result).toEqual({ line: 1, column: 1 })
    })

    it('returns location for root path on multi-line JSON', () => {
      const jsonText = '{\n  "a": 1\n}'
      const result = pathToLine(jsonText, 'root')
      
      expect(result).toEqual({ line: 1, column: 1 })
    })

    it('returns location for nested path', () => {
      const jsonText = '{\n  "a": 1\n}'
      const result = pathToLine(jsonText, 'root.a')
      
      expect(result).not.toBeNull()
      expect(result?.line).toBe(2)
    })

    it('returns null for non-existent path', () => {
      const jsonText = '{"a": 1}'
      const result = pathToLine(jsonText, 'root.nonexistent')
      
      expect(result).toBeNull()
    })

    it('returns location for array index path', () => {
      const jsonText = '{"arr": [1, 2]}'
      const result = pathToLine(jsonText, 'root.arr[0]')
      
      expect(result).not.toBeNull()
      expect(result?.line).toBeGreaterThan(0)
    })
  })

  describe('lineToPath', () => {
    it('returns root path for line 1', () => {
      const jsonText = '{\n  "a": 1\n}'
      const result = lineToPath(jsonText, 1)
      
      expect(result).toBe('root')
    })

    it('returns path containing property for line with property', () => {
      const jsonText = '{\n  "a": 1\n}'
      const result = lineToPath(jsonText, 2)
      
      expect(result).not.toBeNull()
      expect(result).toContain('a')
    })

    it('returns deepest matching path for line', () => {
      const jsonText = '{\n  "a": {\n    "b": 1\n  }\n}'
      const result = lineToPath(jsonText, 3)
      
      expect(result).not.toBeNull()
    })

    it('returns null for empty JSON', () => {
      const jsonText = ''
      const result = lineToPath(jsonText, 1)
      
      expect(result).toBeNull()
    })

    it('prefers deeper paths when scoring', () => {
      const jsonText = '{"a": {"b": 1}}'
      const result = lineToPath(jsonText, 1)
      
      expect(result).toBeTruthy()
    })
  })

  describe('findPathByKeyLabel', () => {
    it('finds path for simple key label', () => {
      const jsonText = '{\n  "a": 1\n}'
      const result = findPathByKeyLabel(jsonText, 'a', 2)
      
      expect(result).toBe('root.a')
    })

    it('finds path for second key on same line', () => {
      const jsonText = '{\n  "a": 1,\n  "b": 2\n}'
      const result = findPathByKeyLabel(jsonText, 'b', 3)
      
      expect(result).toBe('root.b')
    })

    it('returns null for non-existent key', () => {
      const jsonText = '{"a": 1}'
      const result = findPathByKeyLabel(jsonText, 'nonexistent', 1)
      
      expect(result).toBeNull()
    })

    it('finds deeply nested key', () => {
      const jsonText = '{\n  "user": {\n    "name": "test"\n  }\n}'
      const result = findPathByKeyLabel(jsonText, 'name', 3)
      
      expect(result).toBe('root.user.name')
    })

    it('handles keys with approximate line matching', () => {
      const jsonText = '{\n  "x": 1,\n  "y": 2,\n  "z": 3\n}'
      const result = findPathByKeyLabel(jsonText, 'y', 3)
      
      expect(result).toBe('root.y')
    })
  })
})
