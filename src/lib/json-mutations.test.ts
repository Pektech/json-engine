import {
  setValueAtPath,
  renameKeyAtPath,
  rebuildWithNewParent,
  addChildAtPath,
  addArrayItem,
  deleteNodeAtPath,
  getValueAtPath,
  insertNodeAtPath,
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

    it('returns original object when a nested path is missing', () => {
      const obj = { a: 1 }
      const result = setValueAtPath(obj, 'root.missing.value', 2)
      expect(result).toBe(obj)
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

    it('returns original object when renaming root', () => {
      const obj = { a: 1 }
      expect(renameKeyAtPath(obj, 'root', 'newRoot')).toBe(obj)
    })

    it('returns original object when parent path is missing', () => {
      const obj = { a: 1 }
      expect(renameKeyAtPath(obj, 'root.missing.key', 'renamed')).toBe(obj)
    })
  })

  describe('addChildAtPath', () => {
    it('adds a string child to an object', () => {
      const obj = { user: { name: 'Alice' } }
      const result = addChildAtPath(obj, 'root.user', 'nickname') as { user: { name: string; nickname: string } }
      expect(result.user.nickname).toBe('')
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

    it('returns original object when parent path is missing', () => {
      const obj = { user: {} }
      expect(addChildAtPath(obj, 'root.missing', 'age', 'number')).toBe(obj)
    })

    it('uses default boolean value', () => {
      const obj = { user: {} }
      const result = addChildAtPath(obj, 'root.user', 'active', 'boolean') as { user: { active: boolean } }
      expect(result.user.active).toBe(false)
    })
  })

  describe('addArrayItem', () => {
    it('appends a default string to an array', () => {
      const obj = { tags: ['a', 'b'] }
      const result = addArrayItem(obj, 'root.tags') as { tags: string[] }
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

    it('returns original object when array path is missing', () => {
      const obj = { tags: [] }
      expect(addArrayItem(obj, 'root.missing', 'string')).toBe(obj)
    })

    it('appends default boolean and array items', () => {
      const obj = { flags: [], groups: [] }
      expect((addArrayItem(obj, 'root.flags', 'boolean') as { flags: boolean[] }).flags).toEqual([false])
      expect((addArrayItem(obj, 'root.groups', 'array') as { groups: unknown[][] }).groups).toEqual([[]])
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

    it('returns original object when parent path is missing', () => {
      const obj = { a: 1 }
      expect(deleteNodeAtPath(obj, 'root.missing.child')).toBe(obj)
    })

    it('ignores non-numeric array delete key', () => {
      const obj = { items: ['a'] }
      const result = deleteNodeAtPath(obj, 'root.items.foo') as { items: string[] }
      expect(result.items).toEqual(['a'])
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

    it('replaces a deeply nested node with a new object', () => {
      const obj = { a: { b: { c: 1 } } }
      const result = rebuildWithNewParent(obj as Record<string, unknown>, ['a', 'b'], { d: 2 }) as {
        a: { b: { d: number } }
      }

      expect(result.a.b).toEqual({ d: 2 })
    })

    it('returns newParent directly when pathKeys is empty', () => {
      const obj = { a: 1 }
      const newParent = { b: 2 }
      const result = rebuildWithNewParent(obj as Record<string, unknown>, [], newParent)
      expect(result).toBe(newParent)
    })

    it('returns original object when rebuild path is missing', () => {
      const obj = { a: { b: 1 } }
      const result = rebuildWithNewParent(obj as Record<string, unknown>, ['missing', 'b'], { c: 2 })
      expect(result).toBe(obj)
    })
  })

  describe('getValueAtPath', () => {
    it('returns root object for empty and root paths', () => {
      const obj = { a: 1 }
      expect(getValueAtPath(obj, '')).toBe(obj)
      expect(getValueAtPath(obj, 'root')).toBe(obj)
    })

    it('returns nested values and undefined through nullish parents', () => {
      const obj = { a: { b: [null, { c: 3 }] } }
      expect(getValueAtPath(obj, 'root.a.b[1].c')).toBe(3)
      expect(getValueAtPath(obj, 'root.a.b[0].c')).toBeUndefined()
      expect(getValueAtPath(obj, 'root.a.missing')).toBeUndefined()
    })
  })

  describe('insertNodeAtPath', () => {
    it('adds keyed value to root object', () => {
      expect(insertNodeAtPath({ a: 1 }, 'root', 'b', 2)).toEqual({ a: 1, b: 2 })
    })

    it('does not add root child to non-object root', () => {
      expect(insertNodeAtPath([], 'root', 'b', 2)).toEqual([])
    })

    it('pushes value into array parent', () => {
      const result = insertNodeAtPath({ items: [1] }, 'root.items', 'ignored', 2) as { items: number[] }
      expect(result.items).toEqual([1, 2])
    })

    it('pushes value into nested array parent', () => {
      const result = insertNodeAtPath({ data: { items: [1] } }, 'root.data.items', 'ignored', 2) as {
        data: { items: number[] }
      }
      expect(result.data.items).toEqual([1, 2])
    })

    it('adds keyed value into object parent', () => {
      const result = insertNodeAtPath({ user: { name: 'Ada' } }, 'root.user', 'age', 37) as {
        user: { name: string; age: number }
      }
      expect(result.user).toEqual({ name: 'Ada', age: 37 })
    })

    it('adds keyed value into nested object parent', () => {
      const result = insertNodeAtPath({ data: { user: { name: 'Ada' } } }, 'root.data.user', 'age', 37) as {
        data: { user: { name: string; age: number } }
      }
      expect(result.data.user).toEqual({ name: 'Ada', age: 37 })
    })

    it('returns original object when parent is not insertable', () => {
      const obj = { user: 'Ada' }
      expect(insertNodeAtPath(obj, 'root.user', 'age', 37)).toBe(obj)
    })
  })
})
