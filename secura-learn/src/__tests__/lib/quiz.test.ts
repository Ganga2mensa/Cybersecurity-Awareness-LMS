import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { calculateQuizScore, isQuizPassing } from '@/lib/quiz'

/**
 * Validates: Requirements 24.5, 24.6
 */
describe('calculateQuizScore', () => {
  // Unit tests
  it('returns 0 when totalQuestions is 0', () => {
    expect(calculateQuizScore(0, 0)).toBe(0)
  })

  it('returns 0 when no answers are correct', () => {
    expect(calculateQuizScore(0, 10)).toBe(0)
  })

  it('returns 100 when all answers are correct', () => {
    expect(calculateQuizScore(5, 5)).toBe(100)
  })

  it('rounds to nearest integer', () => {
    // 1/3 * 100 = 33.33... → rounds to 33
    expect(calculateQuizScore(1, 3)).toBe(33)
    // 2/3 * 100 = 66.66... → rounds to 67
    expect(calculateQuizScore(2, 3)).toBe(67)
  })

  // Property 12: calculateQuizScore result is always in [0, 100]
  // Validates: Requirements 24.5
  it('P12: result is always in [0, 100] for any valid inputs', () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 10000 }),
        fc.nat({ max: 10000 }),
        (correct, extra) => {
          const total = correct + extra
          const result = calculateQuizScore(correct, total)
          return result >= 0 && result <= 100 && Number.isInteger(result)
        }
      )
    )
  })
})

describe('isQuizPassing', () => {
  // Unit tests
  it('returns true when score equals passingScore', () => {
    expect(isQuizPassing(80, 80)).toBe(true)
  })

  it('returns true when score exceeds passingScore', () => {
    expect(isQuizPassing(90, 80)).toBe(true)
  })

  it('returns false when score is below passingScore', () => {
    expect(isQuizPassing(70, 80)).toBe(false)
  })

  it('returns true when both are 0', () => {
    expect(isQuizPassing(0, 0)).toBe(true)
  })

  // Property 13: isQuizPassing returns true iff score >= passingScore
  // Validates: Requirements 24.6
  it('P13: returns true iff score >= passingScore', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }),
        fc.integer({ min: 0, max: 100 }),
        (score, passingScore) => {
          const result = isQuizPassing(score, passingScore)
          return result === (score >= passingScore)
        }
      )
    )
  })
})
