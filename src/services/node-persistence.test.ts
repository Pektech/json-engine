import { generateFileHash, loadNodePositions, saveNodePositions } from './node-persistence'
import type { JsonEngineState } from '@/types/persistence'

const state: JsonEngineState = {
  version: '1.0',
  lastModified: 'old',
  positions: { root: { x: 1, y: 2 } },
  collapsed: { root: false },
  view: { zoom: 1, position: { x: 0, y: 0 } },
}

describe('node-persistence', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.restoreAllMocks()
  })

  it('loads persisted node positions from localStorage', async () => {
    localStorage.setItem('json-engine:file.json', JSON.stringify(state))

    await expect(loadNodePositions('file.json')).resolves.toEqual(state)
  })

  it('returns null when no persisted state exists or stored JSON is invalid', async () => {
    await expect(loadNodePositions('missing.json')).resolves.toBeNull()

    localStorage.setItem('json-engine:bad.json', '{bad')
    await expect(loadNodePositions('bad.json')).resolves.toBeNull()
  })

  it('returns null when window is unavailable', async () => {
    const windowSpy = jest.spyOn(globalThis, 'window', 'get').mockReturnValue(undefined as any)

    await expect(loadNodePositions('file.json')).resolves.toBeNull()

    windowSpy.mockRestore()
  })

  it('saves node positions with a fresh timestamp', async () => {
    await saveNodePositions('file.json', state)

    const stored = JSON.parse(localStorage.getItem('json-engine:file.json') as string)
    expect(stored).toMatchObject({ ...state, lastModified: expect.any(String) })
    expect(stored.lastModified).not.toBe('old')
  })

  it('does not save when window is unavailable', async () => {
    const windowSpy = jest.spyOn(globalThis, 'window', 'get').mockReturnValue(undefined as any)

    await saveNodePositions('file.json', state)

    expect(localStorage.getItem('json-engine:file.json')).toBeNull()
    windowSpy.mockRestore()
  })

  it('logs and swallows localStorage save failures', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })

    await expect(saveNodePositions('file.json', state)).resolves.toBeUndefined()
    expect(errorSpy).toHaveBeenCalledWith('Failed to save node positions')
  })

  it('generates stable base36 hashes', () => {
    expect(generateFileHash('')).toBe('0')
    expect(generateFileHash('abc')).toBe(generateFileHash('abc'))
    expect(generateFileHash('abc')).not.toBe(generateFileHash('abd'))
  })
})
