import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import NotFound from '@/app/not-found'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

describe('not-found page', () => {
  it('renders "404 — Page Not Found" heading (Req 11.1)', () => {
    render(<NotFound />)
    expect(screen.getByRole('heading', { name: '404 — Page Not Found' })).toBeInTheDocument()
  })

  it('renders a link to "/" with text "Return to Home" (Req 11.1)', () => {
    render(<NotFound />)
    const link = screen.getByRole('link', { name: 'Return to Home' })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/')
  })
})
