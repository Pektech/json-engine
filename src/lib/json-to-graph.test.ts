/**
 * @jest-environment jsdom
 */

import { getJsonType, getLabel, jsonToGraph, layoutGraph, countNodes } from './json-to-graph'
import type { GraphData } from '@/types/canvas'

describe('json-to-graph', () => {
  describe('getJsonType', () => {
    it('returns null for null value', () => {
      expect(getJsonType(null)).toBe('null')
    })

    it('returns object for empty object', () => {
      expect(getJsonType({})).toBe('object')
    })

    it('returns array for empty array', () => {
      expect(getJsonType([])).toBe('array')
    })

    it('returns array for non-empty array', () => {
      expect(getJsonType([1, 2, 3])).toBe('array')
    })

    it('returns string for string value', () => {
      expect(getJsonType('hello')).toBe('string')
    })

    it('returns number for number value', () => {
      expect(getJsonType(42)).toBe('number')
    })

    it('returns number for float value', () => {
      expect(getJsonType(3.14)).toBe('number')
    })

    it('returns boolean for boolean value', () => {
      expect(getJsonType(true)).toBe('boolean')
      expect(getJsonType(false)).toBe('boolean')
    })

    it('returns null type for unsupported values', () => {
      expect(getJsonType(undefined)).toBe('null')
      expect(getJsonType(Symbol('x'))).toBe('null')
    })
  })

  describe('getLabel', () => {
    it('returns root for root path', () => {
      expect(getLabel('root')).toBe('root')
    })

    it('returns root for empty path', () => {
      expect(getLabel('')).toBe('root')
    })

    it('returns property name for nested object path', () => {
      expect(getLabel('root.users')).toBe('users')
    })

    it('returns bracket notation for array index', () => {
      expect(getLabel('root.users[0]')).toBe('[0]')
    })

    it('returns last part for deeply nested path', () => {
      expect(getLabel('root.a.b.c')).toBe('c')
    })

    it('returns bracket notation for nested array index', () => {
      expect(getLabel('root.items[3]')).toBe('[3]')
    })

    it('handles path with multiple array indices', () => {
      expect(getLabel('root.users[0].items[5]')).toBe('[5]')
    })
  })

  describe('jsonToGraph', () => {
    it('returns graph with single node for empty object', () => {
      const result = jsonToGraph({})
      expect(result.nodes).toHaveLength(1)
      expect(result.edges).toHaveLength(0)
      expect(result.nodes[0].id).toBe('root')
      expect(result.nodes[0].data.type).toBe('object')
    })

    it('returns graph with 2 nodes and 1 edge for simple object', () => {
      const result = jsonToGraph({ a: 1 })
      expect(result.nodes).toHaveLength(2)
      expect(result.edges).toHaveLength(1)
      
      const rootNode = result.nodes.find(n => n.id === 'root')
      const aNode = result.nodes.find(n => n.id === 'root.a')
      
      expect(rootNode).toBeDefined()
      expect(aNode).toBeDefined()
      expect(aNode?.data.type).toBe('number')
      expect(aNode?.data.label).toBe('a')
      
      expect(result.edges[0].source).toBe('root')
      expect(result.edges[0].target).toBe('root.a')
    })

    it('returns graph with 3 nodes and 2 edges for nested object', () => {
      const result = jsonToGraph({ a: { b: 1 } })
      expect(result.nodes).toHaveLength(3)
      expect(result.edges).toHaveLength(2)
      
      const rootNode = result.nodes.find(n => n.id === 'root')
      const aNode = result.nodes.find(n => n.id === 'root.a')
      const bNode = result.nodes.find(n => n.id === 'root.a.b')
      
      expect(rootNode).toBeDefined()
      expect(aNode).toBeDefined()
      expect(bNode).toBeDefined()
      expect(aNode?.data.type).toBe('object')
      expect(bNode?.data.type).toBe('number')
    })

    it('returns graph with 4 nodes and 3 edges for array', () => {
      const result = jsonToGraph({ arr: [1, 2] })
      expect(result.nodes).toHaveLength(4)
      expect(result.edges).toHaveLength(3)
      
      const rootNode = result.nodes.find(n => n.id === 'root')
      const arrNode = result.nodes.find(n => n.id === 'root.arr')
      const item0Node = result.nodes.find(n => n.id === 'root.arr[0]')
      const item1Node = result.nodes.find(n => n.id === 'root.arr[1]')
      
      expect(rootNode).toBeDefined()
      expect(arrNode).toBeDefined()
      expect(item0Node).toBeDefined()
      expect(item1Node).toBeDefined()
      expect(arrNode?.data.type).toBe('array')
      expect(item0Node?.data.label).toBe('[0]')
      expect(item1Node?.data.label).toBe('[1]')
    })

    it('sets correct type tags for primitives', () => {
      const result = jsonToGraph({
        str: 'hello',
        num: 42,
        bool: true,
        none: null
      })
      
      const strNode = result.nodes.find(n => n.id === 'root.str')
      const numNode = result.nodes.find(n => n.id === 'root.num')
      const boolNode = result.nodes.find(n => n.id === 'root.bool')
      const nullNode = result.nodes.find(n => n.id === 'root.none')
      
      expect(strNode?.data.type).toBe('string')
      expect(numNode?.data.type).toBe('number')
      expect(boolNode?.data.type).toBe('boolean')
      expect(nullNode?.data.type).toBe('null')
    })

    it('stores string value in node data for primitives', () => {
      const result = jsonToGraph({ name: 'test', count: 5 })
      
      const nameNode = result.nodes.find(n => n.id === 'root.name')
      const countNode = result.nodes.find(n => n.id === 'root.count')
      
      expect(nameNode?.data.value).toBe('test')
      expect(countNode?.data.value).toBe('5')
    })

    it('stores depth in node data', () => {
      const result = jsonToGraph({ a: { b: 1 } })
      
      const rootNode = result.nodes.find(n => n.id === 'root')
      const aNode = result.nodes.find(n => n.id === 'root.a')
      const bNode = result.nodes.find(n => n.id === 'root.a.b')
      
      expect(rootNode?.data.depth).toBe(0)
      expect(aNode?.data.depth).toBe(1)
      expect(bNode?.data.depth).toBe(2)
    })

    it('stores path in node data', () => {
      const result = jsonToGraph({ a: { b: 1 } })
      
      const aNode = result.nodes.find(n => n.id === 'root.a')
      const bNode = result.nodes.find(n => n.id === 'root.a.b')
      
      expect(aNode?.data.path).toBe('root.a')
      expect(bNode?.data.path).toBe('root.a.b')
    })
  })

  describe('countNodes', () => {
    it('returns 1 for empty object', () => {
      expect(countNodes({})).toBe(1)
    })

    it('returns 3 for object with two properties', () => {
      expect(countNodes({ a: 1, b: 2 })).toBe(3)
    })

    it('returns correct count for nested objects', () => {
      expect(countNodes({ a: { b: 1 } })).toBe(3)
    })

    it('returns correct count for arrays', () => {
      expect(countNodes({ arr: [1, 2, 3] })).toBe(5)
    })
  })

  describe('layoutGraph', () => {
    it('positions nodes using graph edges without mutating data fields', () => {
      const graph = jsonToGraph({ a: 1, b: { c: true } })
      const layouted = layoutGraph(graph.nodes, graph.edges)

      expect(layouted).toHaveLength(graph.nodes.length)
      expect(layouted[0].data).toEqual(graph.nodes[0].data)
      expect(layouted.every(node => Number.isFinite(node.position.x))).toBe(true)
      expect(layouted.every(node => Number.isFinite(node.position.y))).toBe(true)
    })
  })
})
