import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TopNav } from '@/components/shared/TopNav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/learner/dashboard',
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('@clerk/nextjs', () => ({
  SignOutButton: ({ children }: any) => <>{children}</>,
}))

describe('Learner TopNav (Req 10.3)', () => {
  it('top nav contains a link for "My Courses" (Req 10.3)', () => {
    render(<TopNav />)
    expect(screen.getByRole('link', { name: 'My Courses' })).toBeInTheDocument()
  })

  it('top nav contains a link for "Badges" (Req 10.3)', () => {
    render(<TopNav />)
    expect(screen.getByRole('link', { name: 'Badges' })).toBeInTheDocument()
  })

  it('top nav contains a link for "Progress" (Req 10.3)', () => {
    render(<TopNav />)
    expect(screen.getByRole('link', { name: 'Progress' })).toBeInTheDocument()
  })
})
