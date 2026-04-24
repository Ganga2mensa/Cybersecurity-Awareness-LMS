import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/get-started',
  '/contact',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/org-selection(.*)',
  '/api/webhooks(.*)',
  '/api/track(.*)',
  '/unauthorized',
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isLearnerRoute = createRouteMatcher(['/learner(.*)'])
const isManagerRoute = createRouteMatcher(['/manager(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, orgRole } = await auth()

  // 1. Allow public routes unconditionally
  if (isPublicRoute(req)) {
    // Redirect authenticated users away from auth pages
    if (userId && (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up')) {
      if (orgRole === 'org:admin') return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      if (orgRole === 'org:manager') return NextResponse.redirect(new URL('/manager/dashboard', req.url))
      if (orgRole === 'org:learner') return NextResponse.redirect(new URL('/learner/dashboard', req.url))
      // Unknown role — let them stay on sign-in/sign-up to resolve org membership
      return NextResponse.next()
    }
    // Redirect authenticated users from landing page to their dashboard
    if (userId && req.nextUrl.pathname === '/') {
      if (orgRole === 'org:admin') return NextResponse.redirect(new URL('/admin/dashboard', req.url))
      if (orgRole === 'org:manager') return NextResponse.redirect(new URL('/manager/dashboard', req.url))
      if (orgRole === 'org:learner') return NextResponse.redirect(new URL('/learner/dashboard', req.url))
      // Authenticated but no recognised role — show landing page
      return NextResponse.next()
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

  if (isManagerRoute(req) && orgRole !== 'org:manager') {
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
