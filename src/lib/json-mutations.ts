/**
 * Pure mutation functions for traversing and editing JSON structures at arbitrary paths.
 * All functions deep-clone the input before mutating — the original object is never changed.
 */

export type JsonValueType = 'string' | 'number' | 'boolean' | 'object' | 'array'

const DEFAULT_VALUES: Record<JsonValueType, unknown> = {
  string: '',
  number: 0,
  boolean: false,
  object: {},
  array: [],
}

function clone<T = unknown>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T
}

function parsePath(path: string): string[] {
  return path.split(/[.\[\]]/).filter(Boolean).filter(k => k !== 'root')
}

export function setValueAtPath(obj: unknown, path: string, value: unknown): unknown {
  const result = clone(obj)
  const keys = parsePath(path)

  if (keys.length === 0) {
    return value
  }

  let current = result as Record<string, unknown>
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (current[key] === undefined) {
      console.error('Path not found:', path, 'at key:', key, 'in', Object.keys(current))
      return obj
    }
    current = current[key] as Record<string, unknown>
  }

  const lastKey = keys[keys.length - 1]
  current[lastKey] = value

  return result
}

export function renameKeyAtPath(obj: unknown, fullPath: string, newKey: string): unknown {
  const result = clone(obj)
  const keys = parsePath(fullPath)

  if (keys.length === 0) {
    console.error('Cannot rename root')
    return obj
  }

  let parent = result as Record<string, unknown>
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (parent[key] === undefined) {
      console.error('Parent path not found:', keys.slice(0, i + 1).join('.'))
      return obj
    }
    parent = parent[key] as Record<string, unknown>
  }

  const oldKey = keys[keys.length - 1]

  if (Object.prototype.hasOwnProperty.call(parent, newKey)) {
    console.error('Key already exists:', newKey)
    return obj
  }

  const entries = Object.entries(parent)
  const newParent: Record<string, unknown> = {}

  entries.forEach(([key, val]) => {
    if (key === oldKey) {
      newParent[newKey] = val
    } else {
      newParent[key] = val
    }
  })

  if (keys.length === 1) {
    return newParent
  }

  return rebuildWithNewParent(result as Record<string, unknown>, keys.slice(0, -1), newParent)
}

export function rebuildWithNewParent(
  obj: Record<string, unknown>,
  pathKeys: string[],
  newParent: Record<string, unknown>,
): unknown {
  if (pathKeys.length === 0) {
    return newParent
  }

  const result = clone(obj)
  let current = result as Record<string, unknown>

  for (let i = 0; i < pathKeys.length - 1; i++) {
    const key = pathKeys[i]
    if (current[key] === undefined) {
      return obj
    }
    current = current[key] as Record<string, unknown>
  }

  const lastKey = pathKeys[pathKeys.length - 1]
  current[lastKey] = newParent

  return result
}

export function addChildAtPath(
  obj: unknown,
  path: string,
  keyName: string,
  type: JsonValueType = 'string',
): unknown {
  const result = clone(obj)
  const keys = parsePath(path)

  let current = result as Record<string, unknown>
  for (const key of keys) {
    if (current[key] === undefined) {
      console.error('Path not found:', path)
      return obj
    }
    current = current[key] as Record<string, unknown>
  }

  if (Object.prototype.hasOwnProperty.call(current, keyName)) {
    alert(`Key "${keyName}" already exists!`)
    return obj
  }

  current[keyName] = DEFAULT_VALUES[type]

  return result
}

export function addArrayItem(
  obj: unknown,
  path: string,
  type: JsonValueType = 'string',
): unknown {
  const result = clone(obj)
  const keys = parsePath(path)

  let current: unknown = result as Record<string, unknown> | unknown[]
  for (const key of keys) {
    if ((current as Record<string, unknown>)[key] === undefined) {
      console.error('Path not found:', path)
      return obj
    }
    current = (current as Record<string, unknown>)[key]
  }

  if (!Array.isArray(current)) {
    console.error('Not an array:', path)
    return obj
  }

  current.push(DEFAULT_VALUES[type])

  return result
}

export function deleteNodeAtPath(obj: unknown, path: string): unknown {
  const result = clone(obj)
  const keys = parsePath(path)

  if (keys.length === 0) {
    console.error('Cannot delete root')
    return obj
  }

  let parent = result as Record<string, unknown>
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    if (parent[key] === undefined) {
      console.error('Parent not found:', keys.slice(0, i + 1).join('.'))
      return obj
    }
    parent = parent[key] as Record<string, unknown>
  }

  const lastKey = keys[keys.length - 1]

  if (Array.isArray(parent)) {
    const index = parseInt(lastKey, 10)
    if (!isNaN(index)) {
      parent.splice(index, 1)
    }
  } else {
    delete (parent as Record<string, unknown>)[lastKey]
  }

  return result
}
