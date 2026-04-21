import '@testing-library/jest-dom/vitest'
import { beforeAll, afterAll } from 'vitest'

// Suppress the next-themes "script tag inside React component" warning.
// next-themes injects a <script> for FOUC prevention — this is intentional
// and harmless in tests.
const originalError = console.error
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Encountered a script tag while rendering React component')
    ) {
      return
    }
    originalError(...args)
  }
})

afterAll(() => {
  console.error = originalError
})
