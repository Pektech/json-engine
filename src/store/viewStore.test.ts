import { useViewStore } from './viewStore'

describe('useViewStore', () => {
  afterEach(() => {
    useViewStore.setState({ activeView: 'split' })
  })

  it('defaults to split view and updates active view', () => {
    expect(useViewStore.getState().activeView).toBe('split')

    useViewStore.getState().setActiveView('canvas')

    expect(useViewStore.getState().activeView).toBe('canvas')
  })
})
