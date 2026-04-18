import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Forbidden from '@/app/forbidden'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/navigation', () => ({
  forbidden: vi.fn(),
}))

describe('forbidden page (Req 11.2)', () => {
  it('renders an explanation of missing permissions (Req 11.2)', () => {
    render(<Forbidden />)
    expect(screen.getByText(/permission/i)).toBeInTheDocument()
  })

  it('renders a link to "/sign-in" (Req 11.2)', () => {
    render(<Forbidden />)
    const signInLink = screen.getByRole('link', { name: /sign in/i })
    expect(signInLink).toBeInTheDocument()
    expect(signInLink).toHaveAttribute('href', '/sign-in')
  })

  it('renders a link to "/" (Req 11.2)', () => {
    render(<Forbidden />)
    const homeLink = screen.getByRole('link', { name: /return to home/i })
    expect(homeLink).toBeInTheDocument()
    expect(homeLink).toHaveAttribute('href', '/')
  })
})

describe('unauthorized page (Req 11.3)', () => {
  it('calls forbidden() when UnauthorizedPage is rendered (Req 11.3)', async () => {
    const { forbidden } = await import('next/navigation')
    const mockForbidden = vi.mocked(forbidden)
    mockForbidden.mockClear()

    const { default: UnauthorizedPage } = await import('@/app/unauthorized/page')
    // UnauthorizedPage returns void (calls forbidden() immediately) — call it as a function
    UnauthorizedPage()
    expect(mockForbidden).toHaveBeenCalledTimes(1)
  })
})
