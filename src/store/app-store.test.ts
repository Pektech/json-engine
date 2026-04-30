import { act } from '@testing-library/react'
import { useAppStore } from './app-store'
import type { CanvasNode } from '@/types/canvas'

const makeNode = (id: string, label = id, value?: string): CanvasNode => ({
  id,
  type: 'jsonNode',
  position: { x: 0, y: 0 },
  data: { type: 'string', label, value, depth: 0, path: id },
})

const resetStore = () => {
  useAppStore.setState({
    jsonText: '{}',
    parsedJson: {},
    nodes: [],
    edges: [],
    selectedPath: null,
    parseError: null,
    isDirty: false,
    expandedNodes: new Set(['root']),
    validationErrors: [],
    isValidating: false,
    searchQuery: '',
    filteredNodeIds: new Set(),
    currentFile: null,
    nodePositions: {},
    userOverrideSave: false,
    gatewayToken: null,
    currentFileHandle: null,
    history: ['{}'],
    historyIndex: 0,
  })
}

describe('useAppStore', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    localStorage.clear()
    resetStore()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
    resetStore()
  })

  it('sets valid JSON text, builds graph after debounce, and pushes history', () => {
    act(() => {
      useAppStore.getState().setJsonText('{"a":1}')
    })

    expect(useAppStore.getState()).toMatchObject({
      jsonText: '{"a":1}',
      parsedJson: { a: 1 },
      isDirty: true,
      validationErrors: [],
    })

    act(() => {
      jest.advanceTimersByTime(100)
    })

    expect(useAppStore.getState().parseError).toBeNull()
    expect(useAppStore.getState().nodes.map(node => node.id)).toContain('root.a')

    act(() => {
      jest.advanceTimersByTime(400)
    })

    expect(useAppStore.getState().history).toEqual(['{}', '{"a":1}'])
    expect(useAppStore.getState().historyIndex).toBe(1)
  })

  it('clears pending history push when JSON text changes before debounce', () => {
    act(() => {
      useAppStore.getState().setJsonText('{"a":1}')
      useAppStore.getState().setJsonText('{"a":2}')
      jest.advanceTimersByTime(500)
    })

    expect(useAppStore.getState().history).toEqual(['{}', '{"a":2}'])
  })

  it('keeps root visible when expanded node set is empty', () => {
    useAppStore.setState({ expandedNodes: new Set() })

    act(() => {
      useAppStore.getState().setJsonText('{"a":1}')
      jest.advanceTimersByTime(100)
    })

    expect(useAppStore.getState().edges).toEqual([])
    expect(useAppStore.getState().nodes.map(node => node.id)).toContain('root.a')
  })

  it('sets parse error and validation error for invalid JSON text', () => {
    act(() => {
      useAppStore.getState().setJsonText('{bad}')
      jest.advanceTimersByTime(100)
    })

    expect(useAppStore.getState().parsedJson).toBeNull()
    expect(useAppStore.getState().parseError).toEqual(expect.any(String))
    expect(useAppStore.getState().validationErrors[0]).toMatchObject({
      path: 'root',
      line: 1,
      column: 1,
      severity: 'error',
    })
  })

  it('uses fallback parse error message for non-Error thrown failures', () => {
    const parseSpy = jest.spyOn(JSON, 'parse')
    parseSpy.mockImplementationOnce(() => ({}))
    parseSpy.mockImplementationOnce(() => {
      throw 'bad'
    })

    act(() => {
      useAppStore.getState().setJsonText('ignored')
      jest.advanceTimersByTime(100)
    })

    expect(useAppStore.getState().parseError).toBe('Invalid JSON')
    expect(useAppStore.getState().validationErrors[0].message).toBe('Invalid JSON')

    parseSpy.mockRestore()
  })

  it('keeps only max history entries', () => {
    useAppStore.setState({
      history: Array.from({ length: 50 }, (_, i) => `${i}`),
      historyIndex: 49,
    })

    act(() => {
      useAppStore.getState().setJsonText('{"last":true}')
      jest.advanceTimersByTime(500)
    })

    expect(useAppStore.getState().history).toHaveLength(50)
    expect(useAppStore.getState().history.at(-1)).toBe('{"last":true}')
  })

  it('selects paths, expands/collapses nodes, and returns selected node', () => {
    useAppStore.setState({ nodes: [makeNode('root'), makeNode('root.a')] })

    useAppStore.getState().selectPath('root.a')
    expect(useAppStore.getState().getSelectedNode()?.id).toBe('root.a')

    useAppStore.getState().expandNode('root.a')
    expect(useAppStore.getState().expandedNodes.has('root.a')).toBe(true)

    useAppStore.getState().collapseNode('root')
    expect(useAppStore.getState().expandedNodes.has('root')).toBe(false)

    useAppStore.getState().selectPath('missing')
    expect(useAppStore.getState().getSelectedNode()).toBeUndefined()
  })

  it('updates node positions and saves them for current file', () => {
    useAppStore.setState({
      currentFile: 'file.json',
      nodes: [makeNode('root')],
      expandedNodes: new Set(['root']),
    })

    useAppStore.getState().updateNodePosition('root', { x: 10, y: 20 })

    expect(useAppStore.getState().nodes[0].position).toEqual({ x: 10, y: 20 })
    expect(useAppStore.getState().nodePositions.root).toEqual({ x: 10, y: 20 })

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(JSON.parse(localStorage.getItem('json-engine:file.json') as string).positions.root).toEqual({ x: 10, y: 20 })
  })

  it('leaves other node positions unchanged when updating one node', () => {
    useAppStore.setState({ nodes: [makeNode('root'), makeNode('root.a')] })

    useAppStore.getState().updateNodePosition('root.a', { x: 5, y: 6 })

    expect(useAppStore.getState().nodes.find(node => node.id === 'root')?.position).toEqual({ x: 0, y: 0 })
    expect(useAppStore.getState().nodes.find(node => node.id === 'root.a')?.position).toEqual({ x: 5, y: 6 })
  })

  it('validates JSON and tolerates validation service failures', () => {
    useAppStore.setState({ jsonText: '{"a":1}' })
    useAppStore.getState().validateJson()
    expect(useAppStore.getState().isValidating).toBe(false)

    const validateSpy = jest.spyOn(require('@/lib/validation').validationService, 'validateJsonString').mockImplementation(() => {
      throw new Error('validator failed')
    })
    useAppStore.getState().validateJson()
    expect(useAppStore.getState().isValidating).toBe(false)
    validateSpy.mockRestore()
  })

  it('updates validation errors directly', () => {
    const errors = [{ path: 'root', line: 1, column: 1, message: 'bad', severity: 'error' as const }]

    useAppStore.getState().updateValidationErrors(errors)

    expect(useAppStore.getState().validationErrors).toBe(errors)
  })

  it('filters nodes by search query and resets empty query', () => {
    useAppStore.setState({
      nodes: [makeNode('root.a', 'Name', 'Ada'), makeNode('root.b', 'Age', '37')],
    })

    useAppStore.getState().setSearchQuery('ada')
    expect(useAppStore.getState().filteredNodeIds).toEqual(new Set(['root.a']))
    expect(useAppStore.getState().getFilteredNodes().map(node => node.style?.opacity)).toEqual([1, 0.2])

    useAppStore.getState().setSearchQuery('age')
    expect(useAppStore.getState().filteredNodeIds).toEqual(new Set(['root.b']))

    useAppStore.getState().setSearchQuery('   ')
    expect(useAppStore.getState().getFilteredNodes()).toEqual(useAppStore.getState().nodes)
    expect(useAppStore.getState().filteredNodeIds.size).toBe(0)
  })

  it('checks save eligibility with and without override', () => {
    expect(useAppStore.getState().canSave()).toBe(true)

    useAppStore.setState({ validationErrors: [{ path: 'root', line: 1, column: 1, message: 'bad', severity: 'error' }] })
    expect(useAppStore.getState().canSave()).toBe(false)

    useAppStore.getState().setUserOverrideSave(true)
    expect(useAppStore.getState().canSave()).toBe(true)
  })

  it('loads a file and applies persisted node positions', async () => {
    localStorage.setItem('json-engine:file.json', JSON.stringify({
      version: '1.0',
      lastModified: 'now',
      positions: { root: { x: 1, y: 2 } },
      collapsed: {},
      view: { zoom: 1, position: { x: 0, y: 0 } },
    }))

    await act(async () => {
      await useAppStore.getState().loadFile('file.json', '{"a":1}')
    })

    expect(useAppStore.getState()).toMatchObject({
      currentFile: 'file.json',
      jsonText: '{"a":1}',
      isDirty: true,
      nodePositions: { root: { x: 1, y: 2 } },
    })
  })

  it('does not save positions without current file', () => {
    useAppStore.getState().savePositions()

    expect(localStorage.length).toBe(0)
  })

  it('sets and clears gateway token and file handle', () => {
    const handle = { name: 'file.json' } as FileSystemFileHandle

    useAppStore.getState().setGatewayToken('token')
    useAppStore.getState().setFileHandle(handle)
    expect(useAppStore.getState().gatewayToken).toBe('token')
    expect(useAppStore.getState().currentFileHandle).toBe(handle)

    useAppStore.getState().clearGatewayToken()
    useAppStore.getState().setFileHandle(null)
    expect(useAppStore.getState().gatewayToken).toBeNull()
    expect(useAppStore.getState().currentFileHandle).toBeNull()
  })

  it('undoes and redoes valid history entries', () => {
    useAppStore.setState({ history: ['{"a":1}', '{"a":2}'], historyIndex: 1 })

    useAppStore.getState().undo()
    expect(useAppStore.getState()).toMatchObject({
      historyIndex: 0,
      jsonText: '{"a":1}',
      parsedJson: { a: 1 },
      selectedPath: 'root',
      parseError: null,
    })

    useAppStore.getState().redo()
    expect(useAppStore.getState()).toMatchObject({
      historyIndex: 1,
      jsonText: '{"a":2}',
      parsedJson: { a: 2 },
      selectedPath: 'root',
      parseError: null,
    })
  })

  it('clears pending timers during undo and redo', () => {
    useAppStore.setState({
      history: ['{"a":1}', '{"a":2}', '{"a":3}'],
      historyIndex: 1,
      expandedNodes: new Set(),
    })
    act(() => {
      useAppStore.getState().setJsonText('{"pending":true}')
    })
    useAppStore.setState({
      history: ['{"a":1}', '{"a":2}', '{"a":3}'],
      historyIndex: 1,
      expandedNodes: new Set(),
    })

    useAppStore.getState().undo()
    expect(useAppStore.getState()).toMatchObject({ historyIndex: 0, jsonText: '{"a":1}' })
    expect(useAppStore.getState().edges).toEqual([])

    act(() => {
      useAppStore.getState().setJsonText('{"pending":false}')
    })
    useAppStore.setState({
      history: ['{"a":1}', '{"a":2}', '{"a":3}'],
      historyIndex: 1,
      expandedNodes: new Set(),
    })

    useAppStore.getState().redo()
    expect(useAppStore.getState()).toMatchObject({ historyIndex: 2, jsonText: '{"a":3}' })
    expect(useAppStore.getState().edges).toEqual([])
  })

  it('handles invalid JSON in undo and redo history entries', () => {
    useAppStore.setState({ history: ['{bad}', '{"a":2}', '{worse}'], historyIndex: 1 })

    useAppStore.getState().undo()
    expect(useAppStore.getState()).toMatchObject({
      historyIndex: 0,
      jsonText: '{bad}',
      parsedJson: null,
      parseError: 'Invalid JSON in history',
    })

    useAppStore.getState().redo()
    useAppStore.getState().redo()
    expect(useAppStore.getState()).toMatchObject({
      historyIndex: 2,
      jsonText: '{worse}',
      parsedJson: null,
      parseError: 'Invalid JSON in history',
    })
  })

  it('leaves history unchanged when undo or redo is unavailable', () => {
    useAppStore.setState({ history: ['{}'], historyIndex: 0 })

    useAppStore.getState().undo()
    expect(useAppStore.getState().historyIndex).toBe(0)

    useAppStore.getState().redo()
    expect(useAppStore.getState().historyIndex).toBe(0)
  })
})
