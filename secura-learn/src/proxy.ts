import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/org-selection(.*)',
  '/api/webhooks(.*)',
  '/unauthorized',
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isLearnerRoute = createRouteMatcher(['/learner(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, orgRole } = await auth()

  // 1. Allow public routes unconditionally
  if (isPublicRoute(req)) {
    // Redirect authenticated users away from auth pages
    if (userId && (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up')) {
      const role = orgRole
      const dest = role === 'org:admin' ? '/admin/dashboard' : '/learner/dashboard'
      return NextResponse.redirect(new URL(dest, req.url))
    }
    // Redirect authenticated users from landing page to their dashboard
    if (userId && req.nextUrl.pathname === '/') {
      const dest = orgRole === 'org:admin' ? '/admin/dashboard' : '/learner/dashboard'
      return NextResponse.redirect(new URL(dest, req.url))
    }
    return NextResponse.next()
  }

  // 2. Require authentication for all non-public routes
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  // 3. Require active organization membership
  // Redirect to org-selection if authenticated but no active org
  if (!orgId) {
    return NextResponse.redirect(new URL('/org-selection', req.url))
  }

  // 4. Role-based route protection
  if (isAdminRoute(req) && orgRole !== 'org:admin') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  if (isLearnerRoute(req) && orgRole !== 'org:learner') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
