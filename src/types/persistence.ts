export interface JsonEngineState {
  version: string
  lastModified: string
  fileHash?: string
  positions: Record<string, { x: number; y: number }>
  collapsed: Record<string, boolean>
  view: {
    zoom: number
    position: { x: number; y: number }
  }
}

export const DEFAULT_JSON_ENGINE_STATE: JsonEngineState = {
  version: '1.0',
  lastModified: new Date().toISOString(),
  positions: {},
  collapsed: {},
  view: {
    zoom: 1,
    position: { x: 0, y: 0 },
  },
}
