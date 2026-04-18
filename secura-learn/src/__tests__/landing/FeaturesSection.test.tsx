import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import * as fc from 'fast-check'
import { FeaturesSection } from '@/components/landing/FeaturesSection'

vi.mock('lucide-react', () => ({
  ShieldCheck: () => null,
  Fish: () => null,
  BarChart3: () => null,
}))

describe('FeaturesSection', () => {
  it('renders "Security Training" feature card', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Security Training')).toBeInTheDocument()
  })

  it('renders "Phishing Simulations" feature card', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Phishing Simulations')).toBeInTheDocument()
  })

  it('renders "Analytics & Reporting" feature card', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Analytics & Reporting')).toBeInTheDocument()
  })

  // Feature: secura-learn-platform, Property 5: Features section always renders at least three feature cards
  it('Property 5: features section always renders at least three feature cards (Req 8.4)', () => {
    // **Validates: Requirements 8.4**
    fc.assert(
      fc.property(fc.constant(null), () => {
        const { container, unmount } = render(<FeaturesSection />)
        const cards = container.querySelectorAll('[data-slot="card"]')
        expect(cards.length).toBeGreaterThanOrEqual(3)
        unmount()
      }),
      { numRuns: 1 }
    )
  })
})
