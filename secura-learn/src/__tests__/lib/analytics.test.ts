import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { calculateOrgCompletionRate, calculateAvgClickRate } from '@/lib/analytics'

/**
 * Validates: Requirements 32.7, 32.8
 */
describe('calculateOrgCompletionRate', () => {
  // Unit tests
  it('returns 0 when totalEnrollments is 0', () => {
    expect(calculateOrgCompletionRate(0, 0)).toBe(0)
  })

  it('returns 0 when no enrollments are completed', () => {
    expect(calculateOrgCompletionRate(0, 10)).toBe(0)
  })

  it('returns 100 when all enrollments are completed', () => {
    expect(calculateOrgCompletionRate(5, 5)).toBe(100)
  })

  it('returns floored percentage for partial completion', () => {
    expect(calculateOrgCompletionRate(1, 3)).toBe(33)
    expect(calculateOrgCompletionRate(2, 3)).toBe(66)
  })

  // Feature: secura-learn-platform, Property 16: calculateOrgCompletionRate result is always in [0, 100]
  // Validates: Requirements 32.7
  it('P16: result is always in [0, 100] for any valid inputs', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 10000 }),
        fc.nat({ max: 10000 }),
        (completed, extra) => {
          const total = completed + extra
          const result = calculateOrgCompletionRate(completed, total)
          return result >= 0 && result <= 100 && Number.isInteger(result)
        }
      )
    )
  })
})

describe('calculateAvgClickRate', () => {
  // Unit tests
  it('returns 0 when totalAttempts is 0', () => {
    expect(calculateAvgClickRate(0, 0)).toBe(0)
  })

  it('returns 0 when no clicks occurred', () => {
    expect(calculateAvgClickRate(0, 10)).toBe(0)
  })

  it('returns 100 when all attempts were clicked', () => {
    expect(calculateAvgClickRate(5, 5)).toBe(100)
  })

  it('returns floored percentage for partial clicks', () => {
    expect(calculateAvgClickRate(1, 3)).toBe(33)
    expect(calculateAvgClickRate(2, 3)).toBe(66)
  })

  // Feature: secura-learn-platform, Property 17: calculateAvgClickRate result is always in [0, 100]
  // Validates: Requirements 32.8
  it('P17: result is always in [0, 100] for any valid inputs', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 10000 }),
        fc.nat({ max: 10000 }),
        (clicked, extra) => {
          const total = clicked + extra
          const result = calculateAvgClickRate(clicked, total)
          return result >= 0 && result <= 100 && Number.isInteger(result)
        }
      )
    )
  })
})
