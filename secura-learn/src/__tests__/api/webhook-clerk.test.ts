import { vi, describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'

// ---------------------------------------------------------------------------
// vi.hoisted ensures mock functions are available inside vi.mock factories,
// since vi.mock calls are hoisted to the top of the file.
// ---------------------------------------------------------------------------
const {
  mockVerify,
  mockUserUpsert,
  mockUserUpdate,
  mockOrgUpsert,
  mockOrgFindUnique,
  mockHeadersGet,
} = vi.hoisted(() => {
  return {
    mockVerify: vi.fn(),
    mockUserUpsert: vi.fn(),
    mockUserUpdate: vi.fn(),
    mockOrgUpsert: vi.fn(),
    mockOrgFindUnique: vi.fn(),
    mockHeadersGet: vi.fn((key: string) => {
      const map: Record<string, string> = {
        'svix-id': 'test-svix-id',
        'svix-timestamp': '1234567890',
        'svix-signature': 'v1,test-signature',
      }
      return map[key] ?? null
    }),
  }
})

// ---------------------------------------------------------------------------
// Mock svix — Webhook class with a controllable verify method
// ---------------------------------------------------------------------------
vi.mock('svix', () => ({
  Webhook: class {
    verify(...args: unknown[]) {
      return mockVerify(...args)
    }
  },
}))

// ---------------------------------------------------------------------------
// Mock @/lib/prisma
// ---------------------------------------------------------------------------
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      upsert: mockUserUpsert,
      update: mockUserUpdate,
    },
    organization: {
      upsert: mockOrgUpsert,
      findUnique: mockOrgFindUnique,
    },
  },
}))

// ---------------------------------------------------------------------------
// Mock next/headers — return an object with .get() that returns svix header values
// ---------------------------------------------------------------------------
vi.mock('next/headers', () => ({
  headers: vi.fn(() => Promise.resolve({ get: mockHeadersGet })),
}))

// ---------------------------------------------------------------------------
// Import the handler AFTER all mocks are set up
// ---------------------------------------------------------------------------
import { POST } from '@/app/api/webhooks/clerk/route'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: string): Request {
  return {
    text: () => Promise.resolve(body),
  } as unknown as Request
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/webhooks/clerk', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CLERK_WEBHOOK_SECRET = 'test_secret'

    // Reset headers mock to return valid svix headers by default
    mockHeadersGet.mockImplementation((key: string) => {
      const map: Record<string, string> = {
        'svix-id': 'test-svix-id',
        'svix-timestamp': '1234567890',
        'svix-signature': 'v1,test-signature',
      }
      return map[key] ?? null
    })
  })

  // ---------------------------------------------------------------------------
  // Test 1: Valid Svix signature + user.created event → prisma.user.upsert called, 200
  // Validates: Requirements 12.1, 12.2
  // ---------------------------------------------------------------------------
  it('calls prisma.user.upsert with correct clerkUserId and email on user.created and returns 200', async () => {
    const userCreatedEvent = {
      type: 'user.created',
      data: {
        id: 'user_clerk_123',
        email_addresses: [{ email_address: 'test@example.com' }],
        first_name: 'Jane',
        last_name: 'Doe',
      },
    }

    mockVerify.mockReturnValue(userCreatedEvent)
    mockUserUpsert.mockResolvedValue({})

    const payload = JSON.stringify(userCreatedEvent)
    const req = makeRequest(payload)
    const response = await POST(req)

    expect(response.status).toBe(200)
    expect(mockVerify).toHaveBeenCalledWith(payload, {
      'svix-id': 'test-svix-id',
      'svix-timestamp': '1234567890',
      'svix-signature': 'v1,test-signature',
    })
    expect(mockUserUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clerkUserId: 'user_clerk_123' },
        update: expect.objectContaining({ 
          email: 'test@example.com',
          firstName: 'Jane',
          lastName: 'Doe'
        }),
        create: expect.objectContaining({
          clerkUserId: 'user_clerk_123',
          email: 'test@example.com',
          firstName: 'Jane',
          lastName: 'Doe'
        }),
      })
    )
  })

  // ---------------------------------------------------------------------------
  // Test 2: Invalid Svix signature → Webhook.verify throws → handler returns 400
  // Validates: Requirements 12.1
  // ---------------------------------------------------------------------------
  it('returns 400 when Webhook.verify throws (invalid signature)', async () => {
    mockVerify.mockImplementation(() => {
      throw new Error('Invalid signature')
    })

    const payload = JSON.stringify({ type: 'user.created', data: {} })
    const req = makeRequest(payload)
    const response = await POST(req)

    expect(response.status).toBe(400)
    expect(mockUserUpsert).not.toHaveBeenCalled()
  })

  // ---------------------------------------------------------------------------
  // Test 3: Valid organization.created event → prisma.organization.upsert called, 200
  // Validates: Requirements 12.3
  // ---------------------------------------------------------------------------
  it('calls prisma.organization.upsert with correct clerkOrgId on organization.created and returns 200', async () => {
    const orgCreatedEvent = {
      type: 'organization.created',
      data: {
        id: 'org_clerk_456',
        name: 'Acme Corp',
      },
    }

    mockVerify.mockReturnValue(orgCreatedEvent)
    mockOrgUpsert.mockResolvedValue({})

    const payload = JSON.stringify(orgCreatedEvent)
    const req = makeRequest(payload)
    const response = await POST(req)

    expect(response.status).toBe(200)
    expect(mockOrgUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clerkOrgId: 'org_clerk_456' },
        update: expect.objectContaining({ name: 'Acme Corp' }),
        create: expect.objectContaining({
          clerkOrgId: 'org_clerk_456',
          name: 'Acme Corp',
        }),
      })
    )
  })

  // ---------------------------------------------------------------------------
  // Test 4: Valid organizationMembership.created event → prisma.user.update called with correct role, 200
  // Validates: Requirements 12.4
  // ---------------------------------------------------------------------------
  it('calls prisma.user.update with correct role on organizationMembership.created and returns 200', async () => {
    const membershipCreatedEvent = {
      type: 'organizationMembership.created',
      data: {
        public_user_data: { user_id: 'user_clerk_789' },
        organization: { id: 'org_clerk_id' },
        role: 'org:admin',
      },
    }

    mockVerify.mockReturnValue(membershipCreatedEvent)
    mockOrgFindUnique.mockResolvedValue({
      id: 'org_prisma_id',
      clerkOrgId: 'org_clerk_id',
      name: 'Test Org',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    mockUserUpdate.mockResolvedValue({})

    const payload = JSON.stringify(membershipCreatedEvent)
    const req = makeRequest(payload)
    const response = await POST(req)

    expect(response.status).toBe(200)
    expect(mockOrgFindUnique).toHaveBeenCalledWith({
      where: { clerkOrgId: 'org_clerk_id' },
    })
    expect(mockUserUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { clerkUserId: 'user_clerk_789' },
        data: expect.objectContaining({
          organizationId: 'org_prisma_id',
          role: 'ADMIN',
        }),
      })
    )
  })

  // ---------------------------------------------------------------------------
  // Test 5: Prisma throws on user.created → handler returns 500
  // Validates: Requirements 12.2
  // ---------------------------------------------------------------------------
  it('returns 500 when Prisma throws on user.created', async () => {
    const userCreatedEvent = {
      type: 'user.created',
      data: {
        id: 'user_clerk_error',
        email_addresses: [{ email_address: 'error@example.com' }],
        first_name: 'Error',
        last_name: 'User',
      },
    }

    mockVerify.mockReturnValue(userCreatedEvent)
    mockUserUpsert.mockRejectedValue(new Error('Database connection failed'))

    const payload = JSON.stringify(userCreatedEvent)
    const req = makeRequest(payload)
    const response = await POST(req)

    expect(response.status).toBe(500)
  })
})

// ---------------------------------------------------------------------------
// Task 23.3 — Property 7: Webhook creates user record for any valid user.created event
// Feature: secura-learn-platform, Property 7: Webhook creates user record for any valid user.created event
// Validates: Requirements 12.2
// ---------------------------------------------------------------------------

describe('Property 7: Webhook creates user record for any valid user.created event', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.CLERK_WEBHOOK_SECRET = 'test_secret'

    mockHeadersGet.mockImplementation((key: string) => {
      const map: Record<string, string> = {
        'svix-id': 'test-svix-id',
        'svix-timestamp': '1234567890',
        'svix-signature': 'v1,test-signature',
      }
      return map[key] ?? null
    })
  })

  it('calls prisma.user.upsert with correct clerkUserId and email for any valid user.created payload', async () => {
    // Feature: secura-learn-platform, Property 7: Webhook creates user record for any valid user.created event
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.string({ minLength: 1, maxLength: 50 }),
          email: fc.emailAddress(),
          firstName: fc.string({ maxLength: 30 }),
          lastName: fc.string({ maxLength: 30 }),
        }),
        async ({ id, email, firstName, lastName }) => {
          vi.clearAllMocks()
          process.env.CLERK_WEBHOOK_SECRET = 'test_secret'
          mockHeadersGet.mockImplementation((key: string) => {
            const map: Record<string, string> = {
              'svix-id': 'test-svix-id',
              'svix-timestamp': '1234567890',
              'svix-signature': 'v1,test-signature',
            }
            return map[key] ?? null
          })

          const userCreatedEvent = {
            type: 'user.created',
            data: {
              id,
              email_addresses: [{ email_address: email }],
              first_name: firstName,
              last_name: lastName,
            },
          }

          mockVerify.mockReturnValue(userCreatedEvent)
          mockUserUpsert.mockResolvedValue({})

          const payload = JSON.stringify(userCreatedEvent)
          const req = makeRequest(payload)
          const response = await POST(req)

          expect(response.status).toBe(200)
          expect(mockUserUpsert).toHaveBeenCalledWith(
            expect.objectContaining({
              where: { clerkUserId: id },
              create: expect.objectContaining({
                clerkUserId: id,
                email,
                firstName: firstName || null,
                lastName: lastName || null,
              }),
            })
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})
