import {
  setValueAtPath,
  renameKeyAtPath,
  rebuildWithNewParent,
  addChildAtPath,
  addArrayItem,
  deleteNodeAtPath,
} from './json-mutations'

describe('json-mutations', () => {
  describe('setValueAtPath', () => {
    it('sets a top-level property value', () => {
      const obj = { a: 1, b: 'hello' }
      const result = setValueAtPath(obj, 'root.a', 42) as { a: number; b: string }
      expect(result.a).toBe(42)
      expect(result.b).toBe('hello')
    })

    it('sets a nested property value', () => {
      const obj = { user: { name: 'Alice' } }
      const result = setValueAtPath(obj, 'root.user.name', 'Bob') as { user: { name: string } }
      expect(result.user.name).toBe('Bob')
    })

    it('sets a value inside an array element', () => {
      const obj = { items: [{ title: 'first' }, { title: 'second' }] }
      const result = setValueAtPath(obj, 'root.items[0].title', 'updated') as { items: { title: string }[] }
      expect(result.items[0].title).toBe('updated')
      expect(result.items[1].title).toBe('second')
    })

    it('returns the new value for root path', () => {
      const result = setValueAtPath({ a: 1 }, 'root', 'replaced')
      expect(result).toBe('replaced')
    })

    it('does not mutate the original object', () => {
      const obj = { a: 1 }
      setValueAtPath(obj, 'root.a', 99)
      expect(obj.a).toBe(1)
    })
  })

  describe('renameKeyAtPath', () => {
    it('renames a top-level object key', () => {
      const obj = { name: 'Alice', age: 30 }
      const result = renameKeyAtPath(obj, 'root.name', 'fullName') as { fullName: string; age: number }
      expect(result.fullName).toBe('Alice')
      expect(result.age).toBe(30)
      expect((result as Record<string, unknown>).name).toBeUndefined()
    })

    it('renames a nested object key', () => {
      const obj = { user: { firstName: 'Alice' } }
      const result = renameKeyAtPath(obj, 'root.user.firstName', 'givenName') as { user: { givenName: string } }
      expect(result.user.givenName).toBe('Alice')
    })

    it('preserves property order after rename', () => {
      const obj = { b: 2, a: 1, c: 3 }
      const result = renameKeyAtPath(obj, 'root.a', 'z') as Record<string, number>
      expect(Object.keys(result)).toEqual(['b', 'z', 'c'])
    })

    it('returns original object when key already exists', () => {
      const obj = { a: 1, b: 2 }
      const result = renameKeyAtPath(obj, 'root.a', 'b')
      expect(result).toBe(obj)
    })
  })

  describe('addChildAtPath', () => {
    it('adds a string child to an object', () => {
      const obj = { user: { name: 'Alice' } }
      const result = addChildAtPath(obj, 'root.user', 'age', 'number') as { user: { name: string; age: number } }
      expect(result.user.age).toBe(0)
    })

    it('adds an object child', () => {
      const obj = { config: { debug: true } }
      const result = addChildAtPath(obj, 'root.config', 'database', 'object') as {
        config: { debug: boolean; database: Record<string, never> }
      }
      expect(result.config.database).toEqual({})
    })

    it('adds an array child', () => {
      const obj = { config: {} }
      const result = addChildAtPath(obj, 'root.config', 'tags', 'array') as {
        config: { tags: unknown[] }
      }
      expect(Array.isArray(result.config.tags)).toBe(true)
      expect(result.config.tags).toEqual([])
    })

    it('returns original object when key already exists', () => {
      const obj = { user: { name: 'Alice' } }
      const result = addChildAtPath(obj, 'root.user', 'name', 'string')
      expect(result).toBe(obj)
    })

    it('does not mutate the original object', () => {
      const obj = { user: {} }
      addChildAtPath(obj, 'root.user', 'age', 'number')
      expect((obj.user as Record<string, unknown>).age).toBeUndefined()
    })
  })

  describe('addArrayItem', () => {
    it('appends a default string to an array', () => {
      const obj = { tags: ['a', 'b'] }
      const result = addArrayItem(obj, 'root.tags', 'string') as { tags: string[] }
      expect(result.tags).toEqual(['a', 'b', ''])
    })

    it('appends a default number to an array', () => {
      const obj = { scores: [10, 20] }
      const result = addArrayItem(obj, 'root.scores', 'number') as { scores: number[] }
      expect(result.scores).toEqual([10, 20, 0])
    })

    it('appends a default object to an array', () => {
      const obj = { items: [{ id: 1 }] }
      const result = addArrayItem(obj, 'root.items', 'object') as { items: Record<string, unknown>[] }
      expect(result.items[1]).toEqual({})
    })

    it('returns original object when path is not an array', () => {
      const obj = { name: 'not an array' }
      const result = addArrayItem(obj, 'root.name', 'string')
      expect(result).toBe(obj)
    })
  })

  describe('deleteNodeAtPath', () => {
    it('deletes a top-level object key', () => {
      const obj = { a: 1, b: 2 }
      const result = deleteNodeAtPath(obj, 'root.a') as { b: number }
      expect(result).toEqual({ b: 2 })
    })

    it('deletes a nested object key', () => {
      const obj = { user: { name: 'Alice', age: 30 } }
      const result = deleteNodeAtPath(obj, 'root.user.age') as { user: { name: string } }
      expect(result.user).toEqual({ name: 'Alice' })
    })

    it('deletes an array element by index', () => {
      const obj = { items: ['a', 'b', 'c'] }
      const result = deleteNodeAtPath(obj, 'root.items[1]') as { items: string[] }
      expect(result.items).toEqual(['a', 'c'])
    })

    it('returns original object when attempting to delete root', () => {
      const obj = { a: 1 }
      const result = deleteNodeAtPath(obj, 'root')
      expect(result).toBe(obj)
    })

    it('does not mutate the original object', () => {
      const obj = { a: 1, b: 2 }
      deleteNodeAtPath(obj, 'root.a')
      expect(obj).toEqual({ a: 1, b: 2 })
    })
  })

  describe('rebuildWithNewParent', () => {
    it('replaces a nested node with a new object', () => {
      const obj = { user: { name: 'Alice' }, other: true }
      const result = rebuildWithNewParent(
        obj as Record<string, unknown>,
        ['user'],
        { givenName: 'Alice', familyName: 'Smith' },
      ) as { user: { givenName: string; familyName: string }; other: boolean }
      expect(result.user.givenName).toBe('Alice')
      expect(result.other).toBe(true)
    })

    it('returns newParent directly when pathKeys is empty', () => {
      const obj = { a: 1 }
      const newParent = { b: 2 }
      const result = rebuildWithNewParent(obj as Record<string, unknown>, [], newParent)
      expect(result).toBe(newParent)
    })
  })
})
