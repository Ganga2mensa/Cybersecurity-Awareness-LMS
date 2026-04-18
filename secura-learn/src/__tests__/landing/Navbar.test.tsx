import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Navbar } from '@/components/landing/Navbar'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('lucide-react', () => ({
  Menu: () => null,
}))

describe('Navbar', () => {
  it('renders a link with href="/sign-in" and text "Sign In" (Req 8.8)', () => {
    render(<Navbar />)
    const signInLink = screen.getByRole('link', { name: 'Sign In' })
    expect(signInLink).toBeInTheDocument()
    expect(signInLink).toHaveAttribute('href', '/sign-in')
  })

  it('renders a link with href="/sign-up" and text "Get Started" (Req 8.9)', () => {
    render(<Navbar />)
    const getStartedLink = screen.getByRole('link', { name: 'Get Started' })
    expect(getStartedLink).toBeInTheDocument()
    expect(getStartedLink).toHaveAttribute('href', '/sign-up')
  })
})
