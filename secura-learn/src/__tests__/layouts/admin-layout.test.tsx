import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { SidebarNav } from '@/components/shared/SidebarNav'

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/dashboard',
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

describe('Admin SidebarNav (Req 9.3)', () => {
  it('sidebar contains a link for "Courses" (Req 9.3)', () => {
    render(<SidebarNav />)
    expect(screen.getByRole('link', { name: 'Courses' })).toBeInTheDocument()
  })

  it('sidebar contains a link for "Users" (Req 9.3)', () => {
    render(<SidebarNav />)
    expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument()
  })

  it('sidebar contains a link for "Phishing Campaigns" (Req 9.3)', () => {
    render(<SidebarNav />)
    expect(screen.getByRole('link', { name: 'Phishing Campaigns' })).toBeInTheDocument()
  })

  it('sidebar contains a link for "Analytics" (Req 9.3)', () => {
    render(<SidebarNav />)
    expect(screen.getByRole('link', { name: 'Analytics' })).toBeInTheDocument()
  })
})
