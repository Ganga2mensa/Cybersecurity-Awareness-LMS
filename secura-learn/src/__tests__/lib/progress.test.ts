import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { calculateProgressPercentage } from '@/lib/progress'

/**
 * Validates: Requirements 25.1, 25.7
 */
describe('calculateProgressPercentage', () => {
  // Unit tests
  it('returns 0 when totalLessons is 0', () => {
    expect(calculateProgressPercentage(0, 0)).toBe(0)
  })

  it('returns 0 when no lessons are completed', () => {
    expect(calculateProgressPercentage(0, 10)).toBe(0)
  })

  it('returns 100 when all lessons are completed', () => {
    expect(calculateProgressPercentage(5, 5)).toBe(100)
  })

  it('returns floored percentage for partial completion', () => {
    expect(calculateProgressPercentage(1, 3)).toBe(33)
    expect(calculateProgressPercentage(2, 3)).toBe(66)
  })

  // Property 9: Result is always in [0, 100] for any valid inputs
  // Validates: Requirements 25.1, 25.7
  it('P9: result is always in [0, 100] for any valid inputs', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 10000 }),
        fc.nat({ max: 10000 }),
        (completed, extra) => {
          const total = completed + extra
          const result = calculateProgressPercentage(completed, total)
          return result >= 0 && result <= 100 && Number.isInteger(result)
        }
      )
    )
  })

  // Property 10: Returns 0 when completedLessons is 0
  // Validates: Requirements 25.1
  it('P10: returns 0 when completedLessons is 0', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        (total) => {
          return calculateProgressPercentage(0, total) === 0
        }
      )
    )
  })

  // Property 11: Returns 100 when completedLessons equals totalLessons
  // Validates: Requirements 25.1, 25.2
  it('P11: returns 100 when completedLessons equals totalLessons', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10000 }),
        (total) => {
          return calculateProgressPercentage(total, total) === 100
        }
      )
    )
  })
})
