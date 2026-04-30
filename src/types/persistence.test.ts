import { DEFAULT_JSON_ENGINE_STATE } from './persistence'

describe('persistence types runtime defaults', () => {
  it('provides a complete default JSON engine state', () => {
    expect(DEFAULT_JSON_ENGINE_STATE).toMatchObject({
      version: '1.0',
      positions: {},
      collapsed: {},
      view: {
        zoom: 1,
        position: { x: 0, y: 0 },
      },
    })
    expect(Date.parse(DEFAULT_JSON_ENGINE_STATE.lastModified)).not.toBeNaN()
  })
})
