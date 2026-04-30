/**
 * Pure mutation functions for traversing and editing JSON structures at arbitrary paths.
 * All functions deep-clone the input before mutating — the original object is never changed.
 */

import { getValueAtJsonPath, parseJsonPath } from '@/lib/json-path'

export type JsonValueType = 'string' | 'number' | 'boolean' | 'object' | 'array'
type JsonContainer = Record<string, unknown> | unknown[]

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

function getContainerAtPath(root: unknown, path: string): unknown | null {
  let current = root

  for (const key of parseJsonPath(path)) {
    if (current === null || current === undefined) return null
    if ((current as Record<string, unknown>)[key] === undefined) return null
    current = (current as Record<string, unknown>)[key]
  }

  return current
}

function getParentAtPath(root: unknown, keys: string[]): JsonContainer | null {
  let parent = root

  for (const key of keys.slice(0, -1)) {
    if (parent === null || parent === undefined) return null
    if ((parent as Record<string, unknown>)[key] === undefined) return null
    parent = (parent as Record<string, unknown>)[key]
  }

  return parent as JsonContainer
}

export function setValueAtPath(obj: unknown, path: string, value: unknown): unknown {
  const result = clone(obj)
  const keys = parseJsonPath(path)

  if (keys.length === 0) {
    return value
  }

  const current = getParentAtPath(result, keys)
  if (!current) {
    console.error('Path not found:', path)
    return obj
  }

  const lastKey = keys[keys.length - 1]
  const currentRecord = current as Record<string, unknown>
  currentRecord[lastKey] = value

  return result
}

export function renameKeyAtPath(obj: unknown, fullPath: string, newKey: string): unknown {
  const result = clone(obj)
  const keys = parseJsonPath(fullPath)

  if (keys.length === 0) {
    console.error('Cannot rename root')
    return obj
  }

  const parent = getParentAtPath(result, keys) as Record<string, unknown> | null
  if (!parent) {
    console.error('Parent path not found:', keys.slice(0, -1).join('.'))
    return obj
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
  const current = getParentAtPath(result, pathKeys)
  if (!current) {
    return obj
  }

  const lastKey = pathKeys[pathKeys.length - 1]
  const currentRecord = current as Record<string, unknown>
  currentRecord[lastKey] = newParent

  return result
}

export function addChildAtPath(
  obj: unknown,
  path: string,
  keyName: string,
  type: JsonValueType = 'string',
): unknown {
  const result = clone(obj)
  const current = getContainerAtPath(result, path) as Record<string, unknown> | null
  if (current === null) {
    console.error('Path not found:', path)
    return obj
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
  const current = getContainerAtPath(result, path)
  if (current === null) {
    console.error('Path not found:', path)
    return obj
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
  const keys = parseJsonPath(path)

  if (keys.length === 0) {
    console.error('Cannot delete root')
    return obj
  }

  const parent = getParentAtPath(result, keys)
  if (!parent) {
    console.error('Parent not found:', keys.slice(0, -1).join('.'))
    return obj
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

export function getValueAtPath(obj: unknown, path: string): unknown {
  return getValueAtJsonPath(obj, path)
}

export function insertNodeAtPath(
  obj: unknown,
  parentPath: string,
  key: string,
  value: unknown
): unknown {
  if (parentPath === 'root') {
    // Adding to root level
    if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
      return { ...(obj as Record<string, unknown>), [key]: value }
    }
    return obj
  }
  
  // Navigate to parent
  const parent = getValueAtPath(obj, parentPath)
  
  if (Array.isArray(parent)) {
    const result = clone(obj)
    const arr = getContainerAtPath(result, parentPath) as unknown[]
    arr.push(value)
    return result
  }
  
  if (parent && typeof parent === 'object' && !Array.isArray(parent)) {
    const result = clone(obj)
    const targetObj = getContainerAtPath(result, parentPath) as Record<string, unknown>
    targetObj[key] = value
    return result
  }
  
  return obj
}
