import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Footer } from '@/components/landing/Footer'

describe('Footer', () => {
  it('renders "SecuraLearn" platform name (Req 8.5)', () => {
    const { container } = render(<Footer />)
    // Brand is split: "Secura" + "Learn" in nested spans — check the span's full textContent
    const brand = container.querySelector('span.text-foreground')
    expect(brand?.textContent).toContain('SecuraLearn')
  })

  it('renders copyright text containing "SecuraLearn" (Req 8.5)', () => {
    render(<Footer />)
    const copyright = screen.getByText(/SecuraLearn\. All rights reserved\./i)
    expect(copyright).toBeInTheDocument()
  })
})
