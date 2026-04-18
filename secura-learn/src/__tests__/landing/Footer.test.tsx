import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Footer } from '@/components/landing/Footer'

describe('Footer', () => {
  it('renders "SecuraLearn" platform name (Req 8.5)', () => {
    render(<Footer />)
    // The brand name appears as a standalone span
    const brandName = screen.getByText('SecuraLearn')
    expect(brandName).toBeInTheDocument()
  })

  it('renders copyright text containing "SecuraLearn" (Req 8.5)', () => {
    render(<Footer />)
    const copyright = screen.getByText(/SecuraLearn\. All rights reserved\./i)
    expect(copyright).toBeInTheDocument()
  })
})
