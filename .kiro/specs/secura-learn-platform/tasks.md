# Implementation Plan: SecuraLearn Platform — Phase 1

## Overview

This plan scaffolds the complete Phase 1 foundation for SecuraLearn: project setup, Clerk authentication, Prisma schema, Next.js middleware, public landing page, role-based dashboards, error pages, and a full test suite. Each task builds on the previous one. No task leaves orphaned code — every component is wired into a layout or page by the end of its group.

All code is TypeScript (strict mode). Testing uses Vitest + fast-check.

---

## Tasks

- [x] 1. Initialize Next.js 15 project and configure toolchain
  - Run `npx create-next-app@latest` with App Router, TypeScript strict mode, Tailwind CSS, and `src/` directory layout
  - Verify `tsconfig.json` has `"strict": true` and `"@/*": ["./src/*"]` path alias
  - Verify `tailwind.config.ts` exists and references `./src/**/*.{ts,tsx}` in `content`
  - Add `next.config.ts` with no experimental flags for Phase 1
  - Install Clerk, Prisma, shadcn/ui, Lucide React, and fast-check dependencies:
    - `@clerk/nextjs`, `@prisma/client`, `prisma` (dev), `lucide-react`
    - `vitest`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `fast-check` (all dev)
  - Run `npx shadcn@latest init` to generate `components.json` and `src/components/ui/` primitives (Button, Card)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.7_

- [x] 2. Create `.env.example` and configure environment variables
  - Create `.env.example` with all required variables, placeholder values, and inline comments as specified in the design
  - Include: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL`, `NEXT_PUBLIC_APP_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`
  - Set `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/admin/dashboard"` and `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/admin/dashboard"` (middleware handles learner redirect)
  - Add `.env.local` to `.gitignore` (keep `.env.example` tracked)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 3. Set up Prisma schema and database client
  - [x] 3.1 Write `prisma/schema.prisma` with `Organization` and `User` models
    - Configure `datasource db` with `provider = "postgresql"` and `url = env("DATABASE_URL")`
    - Define `Role` enum with `ADMIN` and `LEARNER` values
    - Define `Organization` model: `id` (cuid), `clerkOrgId` (unique), `name`, `createdAt`, `updatedAt`, `users User[]`
    - Define `User` model: `id` (cuid), `clerkId` (unique), `email` (unique), `name` (optional), `role Role`, `organizationId`, `organization Organization` relation, `createdAt`, `updatedAt`
    - _Requirements: 7.2, 7.3_

  - [x] 3.2 Create Prisma singleton client at `src/lib/prisma.ts`
    - Implement the `globalThis` singleton pattern to prevent connection pool exhaustion in development hot-reload
    - Export `prisma` as a named export
    - _Requirements: 7.1_

  - [x] 3.3 Create `prisma/seed.ts` placeholder
    - Write a no-op async `main()` function with a `console.log('Seed placeholder — Phase 2 will populate data')`
    - Add `"prisma": { "seed": "ts-node prisma/seed.ts" }` to `package.json`
    - _Requirements: 7.6_

  - [x] 3.4 Run `npx prisma generate` and verify it exits with code 0
    - Confirm generated client types are available under `node_modules/.prisma/client`
    - _Requirements: 7.4_

- [x] 4. Configure folder structure and root layout with ClerkProvider
  - [x] 4.1 Create the full `src/app/` route group directory structure
    - Create `src/app/(auth)/sign-in/[[...sign-in]]/` and `src/app/(auth)/sign-up/[[...sign-up]]/`
    - Create `src/app/(admin)/admin/dashboard/`
    - Create `src/app/(learner)/learn/dashboard/`
    - Create `src/app/unauthorized/`
    - Create `src/actions/`, `src/types/`, `src/components/landing/`, `src/components/shared/`
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [x] 4.2 Write `src/app/layout.tsx` (root layout) wrapping the app with `<ClerkProvider>`
    - Import and apply Inter font via `next/font/google`
    - Set `<html lang="en">` and global Tailwind CSS import
    - Wrap `{children}` with `<ClerkProvider>`
    - _Requirements: 3.1, 3.5_

  - [x] 4.3 Create `src/lib/utils.ts` with the `cn()` helper (clsx + tailwind-merge)
    - Install `clsx` and `tailwind-merge` if not already added by shadcn/ui init
    - Export `cn` as a named export
    - _Requirements: 6.7_

  - [x] 4.4 Create `src/types/index.ts` with shared TypeScript types
    - Export `UserRole` type (`'ADMIN' | 'LEARNER'`)
    - Export `UserGreetingProps` interface (`userName: string | null`, `orgName: string | null`)
    - _Requirements: 6.7_

  - [x] 4.5 Create `src/actions/user.ts` placeholder Server Action
    - Write `export async function syncUserToDatabase(): Promise<void>` with a `// TODO: Phase 2` comment
    - _Requirements: 6.6_

- [x] 5. Implement Next.js Edge Middleware for route protection
  - Write `src/middleware.ts` using `clerkMiddleware()` and `createRouteMatcher()` from `@clerk/nextjs/server`
  - Define `isPublicRoute` matcher: `/`, `/sign-in(.*)`, `/sign-up(.*)`, `/api/webhooks(.*)`, `/unauthorized`
  - Define `isAdminRoute` matcher: `/admin(.*)`
  - Define `isLearnerRoute` matcher: `/learn(.*)`
  - Implement the five-step guard logic from the design:
    1. Allow public routes; redirect authenticated users on `/` or auth pages to their role dashboard
    2. Redirect unauthenticated users to `/sign-in`
    3. Redirect users without an active `orgId` to `/sign-in`
    4. Redirect non-admin users on `/admin/**` to `/unauthorized`
    5. Redirect non-learner users on `/learn/**` to `/unauthorized`
  - Export `config.matcher` excluding `_next/static`, `_next/image`, `favicon.ico`, and static asset extensions
  - _Requirements: 3.2, 3.3, 4.3, 4.5, 4.6, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 6. Checkpoint — verify middleware compiles
  - Ensure `npm run build` (or `npx tsc --noEmit`) exits with code 0 after middleware is written
  - Confirm no TypeScript errors in `src/middleware.ts` or `src/lib/prisma.ts`

- [x] 7. Implement Clerk authentication pages
  - [x] 7.1 Write `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
    - Render Clerk's `<SignIn />` component centered on the page using Tailwind flex utilities
    - Mark as a Server Component (no `"use client"` directive needed — `<SignIn />` handles its own client context)
    - _Requirements: 3.4_

  - [x] 7.2 Write `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
    - Render Clerk's `<SignUp />` component centered on the page using Tailwind flex utilities
    - _Requirements: 3.4_

- [x] 8. Build the public landing page
  - [x] 8.1 Implement `src/components/landing/Navbar.tsx`
    - Server Component with SecuraLearn logo/brand name (text or SVG), a "Sign In" `<Link href="/sign-in">`, and a "Get Started" `<Link href="/sign-up">` styled as a primary button using shadcn/ui `Button`
    - Responsive: hamburger menu hidden on desktop, visible on mobile (use Tailwind `md:hidden`)
    - _Requirements: 8.2, 8.8, 8.9_

  - [x] 8.2 Implement `src/components/landing/HeroSection.tsx`
    - Server Component with a full-viewport-height section (`min-h-screen`)
    - Dark navy background (`bg-[#0F172A]`), centered headline, subheadline, and two CTA buttons: "Get Started" → `/sign-up` (primary), "Sign In" → `/sign-in` (secondary/outline)
    - _Requirements: 8.3, 8.9_

  - [x] 8.3 Implement `src/components/landing/FeaturesSection.tsx`
    - Server Component rendering exactly three feature cards using shadcn/ui `Card`
    - Features: `ShieldCheck` / "Security Training", `Fish` / "Phishing Simulations", `BarChart3` / "Analytics & Reporting" — all from `lucide-react`
    - Responsive grid: 1 column on mobile, 3 columns on desktop (`grid-cols-1 md:grid-cols-3`)
    - _Requirements: 8.4_

  - [x] 8.4 Implement `src/components/landing/Footer.tsx`
    - Server Component with platform name "SecuraLearn" and copyright notice (`© {new Date().getFullYear()} SecuraLearn`)
    - _Requirements: 8.5_

  - [x] 8.5 Wire landing components into `src/app/page.tsx`
    - Import and render `<Navbar />`, `<HeroSection />`, `<FeaturesSection />`, and `<Footer />` in order
    - Page is a Server Component — no `"use client"` directive
    - _Requirements: 8.1, 8.6_

- [x] 9. Build the shared `UserGreeting` component
  - Write `src/components/shared/UserGreeting.tsx` as a Server Component
  - Accept `UserGreetingProps` (`userName: string | null`, `orgName: string | null`)
  - Render: "Welcome back, {userName}" and "Organization: {orgName}" (or graceful fallback text when null)
  - _Requirements: 9.2, 10.2_

- [x] 10. Build the Admin dashboard layout and page
  - [x] 10.1 Write `src/app/(admin)/layout.tsx` — Admin shell layout with sidebar
    - Server Component wrapping `{children}` in a two-column flex layout: fixed sidebar + main content area
    - Sidebar contains: SecuraLearn brand, and nav links for Dashboard, Courses, Users, Phishing Campaigns, Analytics using shadcn/ui `Button` (variant="ghost")
    - Active state detection requires a `"use client"` wrapper component (`SidebarNav`) that uses `usePathname()` — keep the layout itself a Server Component and extract only the nav into a Client Component
    - _Requirements: 9.3_

  - [x] 10.2 Write `src/app/(admin)/admin/dashboard/page.tsx`
    - Server Component — no `"use client"` directive
    - Call `auth()` from `@clerk/nextjs/server` to get `userId` and `orgId`
    - Call `currentUser()` to get the user's name
    - Fetch org name via Clerk's `clerkClient().organizations.getOrganization({ organizationId: orgId })`
    - Render `<UserGreeting userName={...} orgName={...} />` and a "Phase 2 content coming soon" placeholder paragraph
    - _Requirements: 9.1, 9.2, 9.4_

- [x] 11. Build the Learner dashboard layout and page
  - [x] 11.1 Write `src/app/(learner)/layout.tsx` — Learner shell layout with top navigation
    - Server Component wrapping `{children}` with a top nav bar above a `<main>` content area
    - Top nav contains: SecuraLearn brand, and nav links for My Courses, Badges, Progress
    - Extract nav link active-state logic into a `"use client"` `TopNav` component using `usePathname()`
    - _Requirements: 10.3_

  - [x] 11.2 Write `src/app/(learner)/learn/dashboard/page.tsx`
    - Server Component — no `"use client"` directive
    - Same data-fetching pattern as admin dashboard (auth, currentUser, org name)
    - Render `<UserGreeting userName={...} orgName={...} />` and a "Phase 2 content coming soon" placeholder paragraph
    - _Requirements: 10.1, 10.2, 10.4_

- [x] 12. Implement error pages
  - [x] 12.1 Write `src/app/not-found.tsx`
    - Static Server Component
    - Display "404 — Page Not Found", a brief message, and a `<Link href="/">Return to Home</Link>` button styled with shadcn/ui `Button`
    - _Requirements: 11.1_

  - [x] 12.2 Write `src/app/unauthorized/page.tsx`
    - Import and call `forbidden()` from `next/navigation` at the top of the component body
    - This triggers Next.js to render `forbidden.tsx` with HTTP 403 — the page itself renders nothing
    - _Requirements: 11.2, 11.3_

  - [x] 12.3 Write `src/app/forbidden.tsx`
    - Static Server Component rendered by Next.js when `forbidden()` is called
    - Display: explanation that the user lacks permission, a `<Link href="/sign-in">Sign In</Link>` link, and a `<Link href="/">Return to Home</Link>` link
    - _Requirements: 11.2, 11.3_

- [x] 13. Checkpoint — full build verification
  - Run `npx tsc --noEmit` and confirm zero TypeScript errors
  - Run `npm run build` and confirm it exits with code 0
  - Confirm no page has an unintended `"use client"` directive (admin/learner dashboard pages must be Server Components)

- [x] 14. Set up Vitest and testing infrastructure
  - Create `vitest.config.ts` at the project root with:
    - `environment: 'jsdom'`
    - `globals: true`
    - `setupFiles: ['./src/__tests__/setup.ts']`
    - Path alias `@` mapped to `./src`
    - React plugin from `@vitejs/plugin-react`
  - Create `src/__tests__/setup.ts` importing `@testing-library/jest-dom/vitest`
  - Add `"test": "vitest --run"` script to `package.json`
  - Create the test directory structure:
    - `src/__tests__/middleware.test.ts`
    - `src/__tests__/landing/` (Navbar, HeroSection, FeaturesSection, Footer)
    - `src/__tests__/shared/UserGreeting.test.tsx`
    - `src/__tests__/pages/not-found.test.tsx`
    - `src/__tests__/pages/unauthorized.test.tsx`
  - _Requirements: 1.7_

- [x] 15. Write middleware unit and property-based tests
  - [x] 15.1 Write unit tests in `src/__tests__/middleware.test.ts`
    - Test: authenticated admin on `/` → redirects to `/admin/dashboard` (Req 5.5)
    - Test: authenticated learner on `/` → redirects to `/learn/dashboard` (Req 5.6)
    - Test: authenticated user on `/sign-in` → redirects to role dashboard (Req 3.3)
    - Mock `clerkMiddleware` and `createRouteMatcher` using `vi.mock('@clerk/nextjs/server')`
    - _Requirements: 3.3, 5.5, 5.6_

  - [x] 15.2 Write property test for Property 1 — unauthenticated redirect to sign-in
    - **Property 1: Unauthenticated requests to protected routes are redirected to sign-in**
    - Use `fc.string()` to generate arbitrary sub-paths; prefix with `/admin/` or `/learn/` using `fc.oneof`
    - Assert that for any such path with no `userId`, the middleware response redirects to `/sign-in`
    - Run minimum 100 iterations
    - Tag: `// Feature: secura-learn-platform, Property 1: Unauthenticated requests to protected routes are redirected to sign-in`
    - **Validates: Requirements 3.2, 5.1**

  - [x] 15.3 Write property test for Property 2 — authenticated user without org is redirected
    - **Property 2: Authenticated users without an active organization are redirected from protected routes**
    - Use `fc.string()` for sub-paths under `/admin/` and `/learn/`; mock auth with `userId` set but `orgId` as `null`
    - Assert that the middleware redirects away from the protected route
    - Tag: `// Feature: secura-learn-platform, Property 2: Authenticated users without an active organization are redirected from protected routes`
    - **Validates: Requirements 4.3**

  - [x] 15.4 Write property test for Property 3 — role mismatch redirects to /unauthorized
    - **Property 3: Role mismatch on any protected route redirects to /unauthorized**
    - Use `fc.string()` for sub-paths; test `/admin/**` with `orgRole = 'org:learner'` and `/learn/**` with `orgRole = 'org:admin'`
    - Assert that the middleware redirects to `/unauthorized` in both cases
    - Tag: `// Feature: secura-learn-platform, Property 3: Role mismatch on any protected route redirects to /unauthorized`
    - **Validates: Requirements 4.5, 4.6, 5.2, 5.3, 5.7**

  - [x] 15.5 Write property test for Property 4 — public routes pass through without authentication
    - **Property 4: Public routes are accessible without authentication**
    - Use `fc.constantFrom('/', '/sign-in', '/sign-up', '/api/webhooks/test', '/unauthorized')` as the route generator
    - Assert that for any public route with no `userId`, the middleware calls `NextResponse.next()` (no redirect)
    - Tag: `// Feature: secura-learn-platform, Property 4: Public routes are accessible without authentication`
    - **Validates: Requirements 5.4**

- [x] 16. Write landing page component tests
  - [x] 16.1 Write unit tests for `Navbar` in `src/__tests__/landing/Navbar.test.tsx`
    - Test: renders a link with `href="/sign-in"` and text "Sign In" (Req 8.8)
    - Test: renders a link/button with `href="/sign-up"` and text "Get Started" (Req 8.9)
    - _Requirements: 8.8, 8.9_

  - [x] 16.2 Write unit tests for `HeroSection` in `src/__tests__/landing/HeroSection.test.tsx`
    - Test: renders a headline, subheadline, and a CTA linking to `/sign-up` (Req 8.3)
    - _Requirements: 8.3_

  - [x] 16.3 Write unit tests for `FeaturesSection` in `src/__tests__/landing/FeaturesSection.test.tsx`
    - [x] 16.3a Write property test for Property 5 — features section renders ≥ 3 cards
      - **Property 5: Features section always renders at least three feature cards**
      - Render `<FeaturesSection />` and assert the number of card elements is ≥ 3
      - This is a deterministic property (no generator needed) — run as a single-iteration fast-check property for consistency with the PBT suite
      - Tag: `// Feature: secura-learn-platform, Property 5: Features section always renders at least three feature cards`
      - **Validates: Requirements 8.4**
    - _Requirements: 8.4_

  - [x] 16.4 Write unit tests for `Footer` in `src/__tests__/landing/Footer.test.tsx`
    - Test: renders "SecuraLearn" platform name and copyright text (Req 8.5)
    - _Requirements: 8.5_

- [x] 17. Write shared component and page tests
  - [x] 17.1 Write unit and property tests for `UserGreeting` in `src/__tests__/shared/UserGreeting.test.tsx`
    - [x] 17.1a Write property test for Property 6 — dashboard renders user name and org name
      - **Property 6: Dashboard renders with user name and organization name visible**
      - Use `fc.string({ minLength: 1 })` for both `userName` and `orgName`
      - Render `<UserGreeting userName={userName} orgName={orgName} />` and assert both strings appear in the output
      - Tag: `// Feature: secura-learn-platform, Property 6: Dashboard renders with user name and organization name visible`
      - **Validates: Requirements 9.2, 10.2**
    - _Requirements: 9.2, 10.2_

  - [x] 17.2 Write unit tests for `not-found` page in `src/__tests__/pages/not-found.test.tsx`
    - Test: renders a 404 message and a link to `/` (Req 11.1)
    - _Requirements: 11.1_

  - [x] 17.3 Write unit tests for `unauthorized` page in `src/__tests__/pages/unauthorized.test.tsx`
    - Test: renders an explanation of missing permissions and links to `/sign-in` and `/` (Req 11.2)
    - Test: `forbidden()` is called, resulting in HTTP 403 behavior (Req 11.3)
    - _Requirements: 11.2, 11.3_

  - [x] 17.4 Write unit tests for Admin layout in `src/__tests__/layouts/admin-layout.test.tsx`
    - Test: sidebar contains nav links for Courses, Users, Phishing Campaigns, and Analytics (Req 9.3)
    - _Requirements: 9.3_

  - [x] 17.5 Write unit tests for Learner layout in `src/__tests__/layouts/learner-layout.test.tsx`
    - Test: top nav contains links for My Courses, Badges, and Progress (Req 10.3)
    - _Requirements: 10.3_

- [x] 18. Final checkpoint — run full test suite and build
  - Run `npm test` (Vitest) and confirm all tests pass
  - Run `npm run build` and confirm it exits with code 0
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests (P1–P6) are tied directly to the Correctness Properties in the design document
- Checkpoints (tasks 6, 13, 18) validate incremental progress before moving to the next group
- The middleware (task 5) must be complete before auth pages and dashboards are built, as it defines the routing contract
- Admin and learner dashboard pages (tasks 10.2, 11.2) must remain Server Components — no `"use client"` directive
- The `forbidden()` pattern (task 12.2–12.3) is the idiomatic Next.js 15 approach for HTTP 403 responses
