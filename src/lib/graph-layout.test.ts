import { fitViewBounds, layoutGraph } from './graph-layout'
import type { CanvasEdge, CanvasNode } from '@/types/canvas'

const node = (id: string, x = 0, y = 0, width?: number, height?: number): CanvasNode => ({
  id,
  type: 'jsonNode',
  position: { x, y },
  width,
  height,
  data: { type: 'object', label: id, depth: 0, path: id },
})

describe('graph-layout', () => {
  describe('layoutGraph', () => {
    it('lays out connected nodes using explicit dimensions', () => {
      const nodes = [node('root', 0, 0, 200, 80), node('root.a', 0, 0, 120, 40)]
      const edges: CanvasEdge[] = [{ id: 'e1', source: 'root', target: 'root.a' }]

      const result = layoutGraph(nodes, edges)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({ id: 'root', data: nodes[0].data })
      expect(result.every(n => Number.isFinite(n.position.x) && Number.isFinite(n.position.y))).toBe(true)
      expect(result.map(n => n.position)).not.toEqual(nodes.map(n => n.position))
    })

    it('uses default dimensions when node dimensions are absent', () => {
      const result = layoutGraph([node('root')], [])

      expect(Number.isFinite(result[0].position.x)).toBe(true)
      expect(Number.isFinite(result[0].position.y)).toBe(true)
    })
  })

  describe('fitViewBounds', () => {
    it('returns default viewport for empty node list', () => {
      expect(fitViewBounds([])).toEqual({ x: 0, y: 0, zoom: 1 })
    })

    it('calculates center and bounded zoom for positioned nodes', () => {
      const result = fitViewBounds([
        node('a', 10, 20, 100, 50),
        node('b', 210, 120, 200, 100),
      ])

      expect(result.x).toBe(210)
      expect(result.y).toBe(120)
      expect(result.zoom).toBeGreaterThanOrEqual(0.1)
      expect(result.zoom).toBeLessThanOrEqual(1)
    })

    it('clamps very large layouts to minimum zoom', () => {
      const result = fitViewBounds([
        node('a', 0, 0, 10_000, 10_000),
        node('b', 20_000, 20_000, 10_000, 10_000),
      ])

      expect(result.zoom).toBe(0.1)
    })

    it('uses fallback dimensions when dimensions are missing', () => {
      const result = fitViewBounds([node('a', 0, 0)])

      expect(result).toEqual({ x: 90, y: 30, zoom: 1 })
    })

    it('falls back to unit zoom when calculated width is not positive', () => {
      const result = fitViewBounds([node('a', 0, 0, -250, 60)])

      expect(result).toEqual({ x: -125, y: 30, zoom: 1 })
    })

    it('falls back to unit zoom when calculated height is not positive', () => {
      const result = fitViewBounds([node('a', 0, 0, 180, -250)])

      expect(result).toEqual({ x: 90, y: -125, zoom: 1 })
    })
  })
})
