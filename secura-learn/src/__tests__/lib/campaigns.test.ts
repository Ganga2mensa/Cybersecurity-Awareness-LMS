import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { calculateAttemptRate } from '@/lib/campaigns'

/**
 * Validates: Requirements 26.6
 */
describe('calculateAttemptRate', () => {
  // Unit tests
  it('returns 0 when totalRecipients is 0', () => {
    expect(calculateAttemptRate(0, 0)).toBe(0)
  })

  it('returns 0 when count is 0', () => {
    expect(calculateAttemptRate(0, 100)).toBe(0)
  })

  it('returns 100 when count equals totalRecipients', () => {
    expect(calculateAttemptRate(50, 50)).toBe(100)
  })

  it('returns floored percentage', () => {
    expect(calculateAttemptRate(1, 3)).toBe(33)
    expect(calculateAttemptRate(2, 3)).toBe(66)
  })

  // Property 15: Result is always in [0, 100] for any valid inputs
  // Validates: Requirements 26.6
  it('P15: result is always in [0, 100] for any valid inputs', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 10000 }),
        fc.nat({ max: 10000 }),
        (count, extra) => {
          const total = count + extra
          const result = calculateAttemptRate(count, total)
          return result >= 0 && result <= 100 && Number.isInteger(result)
        }
      )
    )
  })
})
