import { vi, describe, it, expect, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'
import * as fc from 'fast-check'

// ---------------------------------------------------------------------------
// vi.hoisted ensures this runs before vi.mock hoisting, so capturedHandler
// is available inside the mock factory.
// ---------------------------------------------------------------------------
const { capturedHandlerRef } = vi.hoisted(() => {
  return { capturedHandlerRef: { current: null as ((auth: any, req: any) => Promise<NextResponse>) | null } }
})

vi.mock('@clerk/nextjs/server', () => ({
  clerkMiddleware: (handler: any) => {
    capturedHandlerRef.current = handler
    return vi.fn()
  },
  createRouteMatcher: (patterns: string[]) => {
    // Build regex matchers from Clerk route patterns.
    // Clerk patterns use (.*) for "any suffix".
    // Steps:
    //   1. Replace Clerk's (.*) token with a safe placeholder
    //   2. Escape all remaining regex special chars in the literal parts
    //   3. Restore the placeholder as .*
    const WILDCARD = '__WILDCARD__'
    const matchers = patterns.map((pattern) => {
      const withPlaceholder = pattern.replace(/\(\.\*\)/g, WILDCARD)
      // Escape regex special characters in the non-wildcard parts
      const escaped = withPlaceholder.replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      // Restore wildcards as .*
      const regexStr = escaped.replace(/__WILDCARD__/g, '.*')
      return new RegExp(`^${regexStr}$`)
    })
    return (req: NextRequest) => {
      const pathname = req.nextUrl.pathname
      return matchers.some((re) => re.test(pathname))
    }
  },
}))

// Import proxy AFTER mock setup so capturedHandlerRef.current is populated
import '@/proxy'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(path: string): NextRequest {
  return new NextRequest(new URL(path, 'http://localhost:3000'))
}

function makeAuth(
  overrides: Partial<{ userId: string | null; orgId: string | null; orgRole: string | null }> = {}
) {
  return async () => ({
    userId: null,
    orgId: null,
    orgRole: null,
    ...overrides,
  })
}

async function runMiddleware(
  path: string,
  authOverrides: Partial<{ userId: string | null; orgId: string | null; orgRole: string | null }> = {}
): Promise<NextResponse> {
  const handler = capturedHandlerRef.current
  if (!handler) throw new Error('capturedHandler not set — middleware import failed')
  const req = makeRequest(path)
  const auth = makeAuth(authOverrides)
  return handler(auth, req)
}

// ---------------------------------------------------------------------------
// Task 15.1 — Unit tests
// ---------------------------------------------------------------------------

describe('middleware — unit tests', () => {
  beforeEach(() => {
    expect(capturedHandlerRef.current).not.toBeNull()
  })

  // Req 5.5 — authenticated admin on `/` → redirects to /admin/dashboard
  it('redirects authenticated admin from / to /admin/dashboard', async () => {
    const response = await runMiddleware('/', {
      userId: 'user_admin',
      orgId: 'org_1',
      orgRole: 'org:admin',
    })
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/admin/dashboard')
  })

  // Req 5.6 — authenticated learner on `/` → redirects to /learner/dashboard
  it('redirects authenticated learner from / to /learner/dashboard', async () => {
    const response = await runMiddleware('/', {
      userId: 'user_learner',
      orgId: 'org_1',
      orgRole: 'org:learner',
    })
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/learner/dashboard')
  })

  // Req 3.3 — authenticated admin on /sign-in → redirects to /admin/dashboard
  it('redirects authenticated admin from /sign-in to /admin/dashboard', async () => {
    const response = await runMiddleware('/sign-in', {
      userId: 'user_admin',
      orgId: 'org_1',
      orgRole: 'org:admin',
    })
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/admin/dashboard')
  })

  // Req 3.3 — authenticated learner on /sign-in → redirects to /learner/dashboard
  it('redirects authenticated learner from /sign-in to /learner/dashboard', async () => {
    const response = await runMiddleware('/sign-in', {
      userId: 'user_learner',
      orgId: 'org_1',
      orgRole: 'org:learner',
    })
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/learner/dashboard')
  })

  // Req 3.3 — authenticated admin on /sign-up → redirects to role dashboard
  it('redirects authenticated admin from /sign-up to /admin/dashboard', async () => {
    const response = await runMiddleware('/sign-up', {
      userId: 'user_admin',
      orgId: 'org_1',
      orgRole: 'org:admin',
    })
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/admin/dashboard')
  })
})

// ---------------------------------------------------------------------------
// Task 15.2 — Property 1: Unauthenticated requests to protected routes are redirected to sign-in
// Feature: secura-learn-platform, Property 1: Unauthenticated requests to protected routes are redirected to sign-in
// Validates: Requirements 3.2, 5.1
// ---------------------------------------------------------------------------

describe('middleware — Property 1: unauthenticated redirect to sign-in', () => {
  it('redirects unauthenticated requests on /admin/* to /sign-in', async () => {
    // Feature: secura-learn-platform, Property 1: Unauthenticated requests to protected routes are redirected to sign-in
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 50 }).map((s) =>
          '/admin/' + s.replace(/[^a-zA-Z0-9\-_/]/g, 'x')
        ),
        async (path) => {
          const response = await runMiddleware(path, { userId: null, orgId: null, orgRole: null })
          const location = response.headers.get('location') ?? ''
          expect(response.status).toBe(307)
          expect(location).toContain('/sign-in')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('redirects unauthenticated requests on /learner/* to /sign-in', async () => {
    // Feature: secura-learn-platform, Property 1: Unauthenticated requests to protected routes are redirected to sign-in
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 50 }).map((s) =>
          '/learner/' + s.replace(/[^a-zA-Z0-9\-_/]/g, 'x')
        ),
        async (path) => {
          const response = await runMiddleware(path, { userId: null, orgId: null, orgRole: null })
          const location = response.headers.get('location') ?? ''
          expect(response.status).toBe(307)
          expect(location).toContain('/sign-in')
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ---------------------------------------------------------------------------
// Task 15.3 — Property 2: Authenticated users without an active organization are redirected from protected routes
// Feature: secura-learn-platform, Property 2: Authenticated users without an active organization are redirected from protected routes
// Validates: Requirements 4.3
// ---------------------------------------------------------------------------

describe('middleware — Property 2: authenticated user without org is redirected', () => {
  it('redirects authenticated user with no orgId away from /admin/* routes', async () => {
    // Feature: secura-learn-platform, Property 2: Authenticated users without an active organization are redirected from protected routes
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 50 }).map((s) =>
          '/admin/' + s.replace(/[^a-zA-Z0-9\-_/]/g, 'x')
        ),
        async (path) => {
          const response = await runMiddleware(path, {
            userId: 'user_123',
            orgId: null,
            orgRole: null,
          })
          // Should redirect away from the protected route
          expect(response.status).toBe(307)
          expect(response.headers.get('location')).not.toContain('/admin/')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('redirects authenticated user with no orgId away from /learner/* routes', async () => {
    // Feature: secura-learn-platform, Property 2: Authenticated users without an active organization are redirected from protected routes
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 50 }).map((s) =>
          '/learner/' + s.replace(/[^a-zA-Z0-9\-_/]/g, 'x')
        ),
        async (path) => {
          const response = await runMiddleware(path, {
            userId: 'user_123',
            orgId: null,
            orgRole: null,
          })
          expect(response.status).toBe(307)
          expect(response.headers.get('location')).not.toContain('/learner/')
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ---------------------------------------------------------------------------
// Task 15.4 — Property 3: Role mismatch on any protected route redirects to /unauthorized
// Feature: secura-learn-platform, Property 3: Role mismatch on any protected route redirects to /unauthorized
// Validates: Requirements 4.5, 4.6, 5.2, 5.3, 5.7
// ---------------------------------------------------------------------------

describe('middleware — Property 3: role mismatch redirects to /unauthorized', () => {
  it('redirects learner role on /admin/* to /unauthorized', async () => {
    // Feature: secura-learn-platform, Property 3: Role mismatch on any protected route redirects to /unauthorized
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 50 }).map((s) =>
          '/admin/' + s.replace(/[^a-zA-Z0-9\-_/]/g, 'x')
        ),
        async (path) => {
          const response = await runMiddleware(path, {
            userId: 'user_learner',
            orgId: 'org_1',
            orgRole: 'org:learner',
          })
          const location = response.headers.get('location') ?? ''
          expect(response.status).toBe(307)
          expect(location).toContain('/unauthorized')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('redirects admin role on /learner/* to /unauthorized', async () => {
    // Feature: secura-learn-platform, Property 3: Role mismatch on any protected route redirects to /unauthorized
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 0, maxLength: 50 }).map((s) =>
          '/learner/' + s.replace(/[^a-zA-Z0-9\-_/]/g, 'x')
        ),
        async (path) => {
          const response = await runMiddleware(path, {
            userId: 'user_admin',
            orgId: 'org_1',
            orgRole: 'org:admin',
          })
          const location = response.headers.get('location') ?? ''
          expect(response.status).toBe(307)
          expect(location).toContain('/unauthorized')
        }
      ),
      { numRuns: 100 }
    )
  })
})

// ---------------------------------------------------------------------------
// Task 15.5 — Property 4: Public routes are accessible without authentication
// Feature: secura-learn-platform, Property 4: Public routes are accessible without authentication
// Validates: Requirements 5.4
// ---------------------------------------------------------------------------

describe('middleware — Property 4: public routes pass through without authentication', () => {
  it('allows unauthenticated access to all public routes without redirecting', async () => {
    // Feature: secura-learn-platform, Property 4: Public routes are accessible without authentication
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          '/',
          '/sign-in',
          '/sign-up',
          '/api/webhooks/test',
          '/unauthorized'
        ),
        async (path) => {
          const response = await runMiddleware(path, { userId: null, orgId: null, orgRole: null })
          // Public routes should NOT redirect — NextResponse.next() returns status 200
          expect(response.status).not.toBe(307)
          expect(response.headers.get('location')).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })
})
