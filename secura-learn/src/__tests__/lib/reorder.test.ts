import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { reorderItems } from '@/lib/reorder'

/**
 * Validates: Requirements 22.8
 */
describe('reorderItems', () => {
  // Unit tests
  it('moves item from one position to another', () => {
    const items = [
      { id: 'a', order: 1 },
      { id: 'b', order: 2 },
      { id: 'c', order: 3 },
    ]
    const result = reorderItems(items, 0, 2)
    expect(result.map(i => i.id)).toEqual(['b', 'c', 'a'])
    expect(result.map(i => i.order)).toEqual([1, 2, 3])
  })

  it('is identity when fromIndex equals toIndex', () => {
    const items = [
      { id: 'a', order: 1 },
      { id: 'b', order: 2 },
      { id: 'c', order: 3 },
    ]
    const result = reorderItems(items, 1, 1)
    expect(result.map(i => i.id)).toEqual(['a', 'b', 'c'])
    expect(result.map(i => i.order)).toEqual([1, 2, 3])
  })

  it('reassigns order values starting from 1', () => {
    const items = [
      { id: 'a', order: 5 },
      { id: 'b', order: 10 },
      { id: 'c', order: 15 },
    ]
    const result = reorderItems(items, 2, 0)
    expect(result.map(i => i.order)).toEqual([1, 2, 3])
  })

  it('preserves other properties on items', () => {
    const items = [
      { id: 'a', order: 1, title: 'First' },
      { id: 'b', order: 2, title: 'Second' },
    ]
    const result = reorderItems(items, 0, 1)
    expect(result[0]).toMatchObject({ id: 'b', title: 'Second', order: 1 })
    expect(result[1]).toMatchObject({ id: 'a', title: 'First', order: 2 })
  })

  // Property 14: Output length equals input length (no items lost or duplicated)
  // Validates: Requirements 22.8
  it('P14: output length equals input length', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ id: fc.string(), order: fc.nat() }),
          { minLength: 1, maxLength: 20 }
        ),
        (items) => {
          const len = items.length
          const fromIndex = Math.floor(Math.random() * len)
          const toIndex = Math.floor(Math.random() * len)
          const result = reorderItems(items, fromIndex, toIndex)
          return result.length === items.length
        }
      )
    )
  })

  // Property 14: fromIndex === toIndex produces identical order values
  // Validates: Requirements 22.8
  it('P14: fromIndex === toIndex is identity (same order values)', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ id: fc.string(), order: fc.nat() }),
          { minLength: 1, maxLength: 20 }
        ),
        fc.nat({ max: 19 }),
        (rawItems, idx) => {
          // Normalize items to have contiguous order starting at 1
          const items = rawItems.map((item, i) => ({ ...item, order: i + 1 }))
          const safeIdx = idx % items.length
          const result = reorderItems(items, safeIdx, safeIdx)
          return result.every((item, i) => item.order === items[i].order)
        }
      )
    )
  })

  // Property 14: Output order values form a contiguous sequence starting at 1
  // Validates: Requirements 22.8
  it('P14: output order values form a contiguous sequence starting at 1', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ id: fc.string(), order: fc.nat() }),
          { minLength: 1, maxLength: 20 }
        ),
        fc.nat({ max: 19 }),
        fc.nat({ max: 19 }),
        (rawItems, fromRaw, toRaw) => {
          const items = rawItems.map((item, i) => ({ ...item, order: i + 1 }))
          const fromIndex = fromRaw % items.length
          const toIndex = toRaw % items.length
          const result = reorderItems(items, fromIndex, toIndex)
          const orders = result.map(i => i.order).sort((a, b) => a - b)
          return orders.every((val, idx) => val === idx + 1)
        }
      )
    )
  })
})
