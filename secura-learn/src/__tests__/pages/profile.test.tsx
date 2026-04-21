import { render, screen, act, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'

// ---------------------------------------------------------------------------
// vi.hoisted ensures mock functions are available inside vi.mock factories
// ---------------------------------------------------------------------------
const { mockAuth, mockFindUnique } = vi.hoisted(() => {
  return {
    mockAuth: vi.fn(),
    mockFindUnique: vi.fn(),
  }
})

// ---------------------------------------------------------------------------
// Mock @clerk/nextjs/server
// ---------------------------------------------------------------------------
vi.mock('@clerk/nextjs/server', () => ({
  auth: mockAuth,
}))

// ---------------------------------------------------------------------------
// Mock @/lib/prisma
// ---------------------------------------------------------------------------
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: mockFindUnique,
    },
  },
}))

// ---------------------------------------------------------------------------
// Mock next/navigation
// ---------------------------------------------------------------------------
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Mock next/link
// ---------------------------------------------------------------------------
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

// ---------------------------------------------------------------------------
// Mock @/actions/user
// ---------------------------------------------------------------------------
vi.mock('@/actions/user', () => ({
  updateDisplayName: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Shared mock user data
// ---------------------------------------------------------------------------
const mockUser = {
  id: 'prisma_user_1',
  clerkUserId: 'user_123',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane@example.com',
  role: 'ADMIN' as const,
  organizationId: 'org_1',
  organization: { id: 'org_1', clerkOrgId: 'clerk_org_1', name: 'Acme Corp' },
  createdAt: new Date(),
  updatedAt: new Date(),
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Admin profile page (Req 13.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ userId: 'user_123' })
    mockFindUnique.mockResolvedValue(mockUser)
  })

  it('renders user name and email (Req 13.1)', async () => {
    const { default: AdminProfilePage } = await import(
      '@/app/(admin)/admin/profile/page'
    )

    const jsx = await AdminProfilePage()
    await act(async () => {
      render(jsx)
    })

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })
})

describe('Learner profile page (Req 13.2)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.mockResolvedValue({ userId: 'user_123' })
    mockFindUnique.mockResolvedValue({ ...mockUser, role: 'LEARNER' as const })
  })

  it('renders user name and email (Req 13.2)', async () => {
    const { default: LearnerProfilePage } = await import(
      '@/app/(learner)/learner/profile/page'
    )

    const jsx = await LearnerProfilePage()
    await act(async () => {
      render(jsx)
    })

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('jane@example.com')).toBeInTheDocument()
  })
})

describe('EditNameForm (Req 13.3)', () => {
  it('renders the current name in the input fields', async () => {
    const { EditNameForm } = await import('@/components/shared/EditNameForm')

    render(<EditNameForm currentFirstName="Jane" currentLastName="Doe" />)

    const firstNameInput = screen.getByRole('textbox', { name: /first name/i })
    const lastNameInput = screen.getByRole('textbox', { name: /last name/i })
    expect(firstNameInput).toBeInTheDocument()
    expect(firstNameInput).toHaveValue('Jane')
    expect(lastNameInput).toBeInTheDocument()
    expect(lastNameInput).toHaveValue('Doe')
  })
})

// ---------------------------------------------------------------------------
// Task 23.4 — Property 8: Profile page renders user name and email for any valid user record
// Feature: secura-learn-platform, Property 8: Profile page renders user name and email for any valid user record
// Validates: Requirements 13.3
// ---------------------------------------------------------------------------

describe('Property 8: Profile page renders user name and email for any valid user record', () => {
  it('renders name and email for any non-empty name and valid email (admin profile)', async () => {
    // Feature: secura-learn-platform, Property 8: Profile page renders user name and email for any valid user record
    const { default: AdminProfilePage } = await import(
      '@/app/(admin)/admin/profile/page'
    )

    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Generate names that are non-empty after trimming so Testing Library
          // can locate them (it normalizes whitespace when matching text).
          firstName: fc.string({ minLength: 1, maxLength: 30 })
            .map(s => s.trim())
            .filter(s => s.length > 0),
          lastName: fc.string({ minLength: 1, maxLength: 30 })
            .map(s => s.trim())
            .filter(s => s.length > 0),
          email: fc.emailAddress(),
        }),
        async ({ firstName, lastName, email }) => {
          vi.clearAllMocks()
          mockAuth.mockResolvedValue({ userId: 'user_123' })
          mockFindUnique.mockResolvedValue({
            ...mockUser,
            firstName,
            lastName,
            email,
          })

          const jsx = await AdminProfilePage()
          await act(async () => render(jsx))

          const fullName = `${firstName} ${lastName}`
          expect(screen.getAllByText(fullName).length).toBeGreaterThan(0)
          expect(screen.getAllByText(email).length).toBeGreaterThan(0)

          cleanup()
        }
      ),
      { numRuns: 100 }
    )
  })
})
