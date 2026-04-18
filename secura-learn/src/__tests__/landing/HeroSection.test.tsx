import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { HeroSection } from '@/components/landing/HeroSection'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('HeroSection', () => {
  it('renders a headline (h1 element)', () => {
    render(<HeroSection />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })

  it('renders a subheadline/description text', () => {
    render(<HeroSection />)
    // The subheadline paragraph contains "SecuraLearn"
    const description = screen.getByText(/SecuraLearn empowers/i)
    expect(description).toBeInTheDocument()
  })

  it('renders a CTA link to /sign-up (Req 8.3)', () => {
    render(<HeroSection />)
    const links = screen.getAllByRole('link')
    const signUpLink = links.find((link) => link.getAttribute('href') === '/sign-up')
    expect(signUpLink).toBeDefined()
    expect(signUpLink).toBeInTheDocument()
  })
})
