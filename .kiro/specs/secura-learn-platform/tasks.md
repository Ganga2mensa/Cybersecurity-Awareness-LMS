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

---

## Phase 2 Tasks

### Overview

Phase 2 bridges Clerk identity with the Prisma database and adds user profile pages. Tasks build on the completed Phase 1 foundation. All Phase 1 tests must continue to pass throughout Phase 2 development.

---

- [x] 19. Install svix and configure webhook secret
  - Install the `svix` package: `npm install svix`
  - Add `CLERK_WEBHOOK_SECRET` to `.env.example` with a `"whsec_..."` placeholder and an inline comment: `# Webhook signing secret — obtain from Clerk Dashboard > Webhooks > your endpoint`
  - _Requirements: 12.1, 12.6_

- [x] 20. Implement Clerk webhook handler
  - [x] 20.1 Create `src/app/api/webhooks/clerk/route.ts`
    - Export a `POST` handler that reads the raw request body and the `svix-id`, `svix-timestamp`, and `svix-signature` headers
    - Verify the Svix signature using `new Webhook(CLERK_WEBHOOK_SECRET).verify(payload, headers)` — return 400 if verification fails
    - Handle `user.created`: upsert a `User` record in Prisma with `clerkId`, `email` (primary email address), and `name` (first + last name)
    - Handle `organization.created`: upsert an `Organization` record in Prisma with `clerkOrgId` and `name`
    - Handle `organizationMembership.created`: look up the `Organization` by `clerkOrgId`, then update the `User` record to set `organizationId` and `role` (`org:admin` → `ADMIN`, `org:learner` → `LEARNER`)
    - Return 200 on success, 400 on signature failure, 500 on DB error
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 20.2 Register webhook endpoint in Clerk Dashboard
    - Document the steps to register `https://{domain}/api/webhooks/clerk` in Clerk Dashboard under **Webhooks → Add Endpoint**
    - List required events: `user.created`, `organization.created`, `organizationMembership.created`
    - Note: for local development, use a tunnel (e.g., `ngrok http 3000`) to expose the local server
    - _Requirements: 12.1_

- [x] 21. Implement syncUserToDatabase Server Action
  - Update `src/actions/user.ts` with a real implementation (replacing the Phase 1 TODO placeholder)
  - Call `auth()` from `@clerk/nextjs/server` to get `userId`, `orgId`, and `orgRole`
  - Call `currentUser()` to get the user's email address and full name
  - Upsert the `Organization` record in Prisma if `orgId` is present (create with `clerkOrgId`, update is a no-op)
  - Upsert the `User` record in Prisma with `clerkId`, `email`, `name`, `role`, and `organizationId`
  - Also add `updateDisplayName(name: string)` Server Action that updates the `User.name` field for the current authenticated user
  - Call `syncUserToDatabase()` at the top of both `/admin/dashboard/page.tsx` and `/learner/dashboard/page.tsx`
  - _Requirements: 12.5_

- [x] 22. Build user profile pages
  - [x] 22.1 Create `src/app/(admin)/admin/profile/page.tsx`
    - Server Component — call `auth()` to get `userId`, then fetch the user from Prisma with `prisma.user.findUnique({ where: { clerkId: userId }, include: { organization: true } })`
    - Display: full name, email address, organization name, and a role badge (`ADMIN` or `LEARNER`)
    - Include `<EditNameForm currentName={user.name} />` (Client Component) that calls the `updateDisplayName` Server Action on submit
    - _Requirements: 13.1, 13.3, 13.4_

  - [x] 22.2 Create `src/app/(learner)/learner/profile/page.tsx`
    - Same structure as the admin profile page
    - _Requirements: 13.2, 13.3, 13.4_

  - [x] 22.3 Create `src/components/shared/EditNameForm.tsx`
    - Client Component (`"use client"`)
    - Accepts `currentName: string | null` prop
    - Renders a controlled text input pre-filled with `currentName` and a "Save" submit button
    - Uses `useTransition` to call `updateDisplayName(newName)` without blocking the UI
    - Shows a loading state while the transition is pending
    - _Requirements: 13.4_

  - [x] 22.4 Add "Profile" link to admin sidebar (`SidebarNav.tsx`)
    - Add `{ label: 'Profile', href: '/admin/profile' }` to the `navLinks` array
    - _Requirements: 13.5_

  - [x] 22.5 Add "Profile" link to learner top nav (`TopNav.tsx`)
    - Add `{ label: 'Profile', href: '/learner/profile' }` to the `navLinks` array
    - _Requirements: 13.6_

- [x] 23. Write Phase 2 tests
  - [x] 23.1 Write unit tests for webhook handler in `src/__tests__/api/webhook-clerk.test.ts`
    - Test: valid Svix signature + `user.created` event → `prisma.user.upsert` called with correct `clerkId` and `email`, handler returns 200 (mock Prisma and Svix `Webhook.verify`)
    - Test: invalid Svix signature → `Webhook.verify` throws → handler returns 400
    - Test: valid `organization.created` event → `prisma.organization.upsert` called with correct `clerkOrgId`, handler returns 200
    - Test: valid `organizationMembership.created` event → `prisma.user.update` called with correct `role`, handler returns 200
    - Test: Prisma throws on `user.created` → handler returns 500
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

  - [x] 23.2 Write unit tests for profile pages in `src/__tests__/pages/profile.test.tsx`
    - Test: admin profile page renders user name and email (mock `auth()` and `prisma.user.findUnique`)
    - Test: learner profile page renders user name and email
    - Test: `EditNameForm` renders the current name in the input field
    - _Requirements: 13.1, 13.2, 13.3_

  - [x] 23.3 Write property test for Property 7 — webhook creates user record
    - Tag: `// Feature: secura-learn-platform, Property 7: Webhook creates user record for any valid user.created event`
    - Use `fc.record({ id: fc.string({ minLength: 1 }), email: fc.emailAddress(), firstName: fc.string(), lastName: fc.string() })` to generate arbitrary user data
    - Mock Svix `Webhook.verify` to return a `user.created` event with the generated data; mock Prisma
    - Assert that `prisma.user.upsert` is called with `clerkId` equal to the generated `id` and `email` equal to the generated email
    - Run minimum 100 iterations
    - _Requirements: 12.2_

  - [x] 23.4 Write property test for Property 8 — profile page renders user data
    - Tag: `// Feature: secura-learn-platform, Property 8: Profile page renders user name and email for any valid user record`
    - Use `fc.record({ name: fc.string({ minLength: 1 }), email: fc.emailAddress() })` to generate arbitrary user data
    - Mock `prisma.user.findUnique` to return a user record with the generated `name` and `email`
    - Render the profile page and assert both the name and email appear in the rendered output
    - Run minimum 100 iterations
    - _Requirements: 13.3_

- [x] 24. Final Phase 2 checkpoint
  - Run `npm test` and confirm all tests pass (Phase 1 tests P1–P6 + Phase 2 tests P7–P8 + all unit tests)
  - Run `npm run build` and confirm it exits with code 0
  - Verify the webhook handler is reachable at `/api/webhooks/clerk` (returns 400 for a request with missing Svix headers, not 404)
  - Verify the admin profile page renders correctly at `/admin/profile` for an authenticated admin user
  - Verify the learner profile page renders correctly at `/learner/profile` for an authenticated learner user
  - Verify the "Profile" link appears in the admin sidebar and the learner top nav
  - _Requirements: 12.1–12.6, 13.1–13.6, 14.1–14.2_

---

## Phase 3 Tasks: Database Schema (Core Data Models)

### Overview

Phase 3 implements a complete, production-ready Prisma schema for the SecuraLearn Security Awareness LMS. The schema supports multi-tenancy using Clerk Organizations, proper relationships between all entities, performance indexes, and future Supabase Row Level Security (RLS) compatibility with TypeScript strict typing.

---

- [x] 25. Expand Prisma schema with core LMS models
  - [x] 25.1 Update existing models and add new enums
    - Update `Organization` model: add `slug` (unique), `logoUrl` (optional)
    - Update `User` model: add `MANAGER` to `Role` enum, split `name` into `firstName` and `lastName` (both optional), add `avatarUrl` (optional), rename `clerkId` to `clerkUserId`
    - Add `LessonType` enum with values: `VIDEO`, `TEXT`, `QUIZ`, `READING`, `SCORM`
    - Add `CampaignStatus` enum with values: `DRAFT`, `SCHEDULED`, `RUNNING`, `COMPLETED`, `PAUSED`
    - _Requirements: 15.1, 15.2, 17.1, 17.2, 17.3_

  - [x] 25.2 Add Course and Module models
    - Define `Course` model: `id` (cuid), `organizationId`, `title`, `description` (optional), `coverImageUrl` (optional), `isPublished` (boolean, default false), `createdById`, `createdAt`, `updatedAt`
    - Define `Module` model: `id` (cuid), `courseId`, `title`, `description` (optional), `order` (int), `createdAt`, `updatedAt`
    - Add proper relations: Course → Organization, Course → User (createdBy), Course → Module[], Module → Course
    - _Requirements: 15.3, 15.4, 16.2, 16.3_

  - [x] 25.3 Add Lesson and Quiz models
    - Define `Lesson` model: `id` (cuid), `moduleId`, `title`, `type` (LessonType enum), `content` (optional text), `videoUrl` (optional), `durationMinutes` (optional int), `order` (int), `createdAt`, `updatedAt`
    - Define `Quiz` model: `id` (cuid), `lessonId` (unique), `title`, `passingScore` (int, default 80), `createdAt`
    - Define `QuizQuestion` model: `id` (cuid), `quizId`, `questionText`, `options` (Json), `order` (int)
    - Add proper relations: Lesson → Module, Quiz → Lesson (one-to-one), QuizQuestion → Quiz
    - _Requirements: 15.5, 15.6, 15.7, 16.4, 16.5, 16.6_

  - [x] 25.4 Add Enrollment and Progress models
    - Define `Enrollment` model: `id` (cuid), `userId`, `courseId`, `enrolledAt`, `completedAt` (optional), `progressPercentage` (int, default 0)
    - Define `LessonProgress` model: `id` (cuid), `enrollmentId`, `lessonId`, `completed` (boolean, default false), `completedAt` (optional), `lastAccessedAt`
    - Add proper relations: Enrollment → User, Enrollment → Course, LessonProgress → Enrollment, LessonProgress → Lesson
    - _Requirements: 15.8, 15.9, 16.7, 16.8_

  - [x] 25.5 Add PhishingCampaign and PhishingAttempt models
    - Define `PhishingCampaign` model: `id` (cuid), `organizationId`, `title`, `description` (optional), `status` (CampaignStatus enum), `sentAt` (optional), `createdById`, `createdAt`
    - Define `PhishingAttempt` model: `id` (cuid), `campaignId`, `userId`, `emailTemplateId` (optional), `clicked` (boolean, default false), `clickedAt` (optional), `reported` (boolean, default false), `reportedAt` (optional), `opened` (boolean, default false)
    - Add proper relations: PhishingCampaign → Organization, PhishingCampaign → User (createdBy), PhishingAttempt → PhishingCampaign, PhishingAttempt → User
    - _Requirements: 15.10, 15.11, 16.9, 16.10_

- [x] 26. Add database constraints and indexes
  - [x] 26.1 Add cascade delete constraints
    - Set `onDelete: Cascade` for User → Organization, Module → Course, Lesson → Module, Quiz → Lesson, QuizQuestion → Quiz, LessonProgress → Enrollment, PhishingAttempt → PhishingCampaign
    - Set `onDelete: Restrict` for Course → User (createdBy), PhishingCampaign → User (createdBy) to prevent deleting users who created content
    - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5, 16.6, 16.7, 16.8, 16.9, 16.10_

  - [x] 26.2 Add performance indexes
    - Add `@@index([organizationId])` to all tenant-scoped models (User, Course, PhishingCampaign)
    - Add `@@index([userId])` to Enrollment and PhishingAttempt
    - Add `@@index([courseId])` to Module and Enrollment
    - Add `@@index([moduleId])` to Lesson
    - Add `@@index([lessonId])` to LessonProgress
    - Add `@@index([campaignId])` to PhishingAttempt
    - Add compound indexes: `@@index([userId, courseId])` on Enrollment, `@@index([enrollmentId, lessonId])` on LessonProgress
    - Add timestamp indexes: `@@index([createdAt])`, `@@index([enrolledAt])`, `@@index([completedAt])` where relevant
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

  - [x] 26.3 Add unique constraints and validation
    - Add `@@unique([userId, courseId])` to Enrollment to prevent duplicate enrollments
    - Add `@@unique([enrollmentId, lessonId])` to LessonProgress to prevent duplicate progress records
    - Add `@@unique([campaignId, userId])` to PhishingAttempt to prevent duplicate attempts per user per campaign
    - Ensure all `organizationId` fields are properly indexed for RLS compatibility
    - _Requirements: 19.1, 19.2, 19.3, 19.4_

- [x] 27. Generate and apply database migration
  - [x] 27.1 Create initial migration
    - Run `npx prisma migrate dev --name init` to generate the migration files
    - Verify migration files are created in `prisma/migrations/` directory
    - Ensure migration applies successfully to the development database
    - _Requirements: 20.1_

  - [x] 27.2 Generate Prisma client
    - Run `npx prisma generate` to create TypeScript types for all models
    - Verify generated types include all enums, models, and relations
    - Confirm no TypeScript errors in the generated client
    - _Requirements: 20.2_

- [x] 28. Create comprehensive seed script
  - [x] 28.1 Implement seed data creation
    - Replace the placeholder `prisma/seed.ts` with comprehensive seed data
    - Create 2 sample Organizations with realistic names and slugs
    - Create 4 sample Users: 2 Admins (one per org), 2 Learners (one per org)
    - Use realistic names, emails, and ensure proper organization assignments
    - _Requirements: 20.3, 20.4_

  - [x] 28.2 Create course content structure
    - Create 3 sample Courses: "Phishing Basics", "Password Security", "Social Engineering"
    - Each course should have 2-3 modules with descriptive titles
    - Each module should have 3-4 lessons of different types (VIDEO, TEXT, READING)
    - Add 1 quiz lesson per course with realistic quiz content
    - Ensure proper ordering (order field) for modules and lessons
    - _Requirements: 20.4_

  - [x] 28.3 Create quiz questions and answers
    - For each quiz, create 4 multiple-choice questions
    - Store questions in QuizQuestion model with proper JSON structure for options
    - Each option should have `text` and `isCorrect` boolean fields
    - Ensure at least one correct answer per question
    - _Requirements: 20.4_

  - [x] 28.4 Create enrollment and progress data
    - Create sample enrollments for learners in various courses
    - Add realistic progress records showing different completion states
    - Some lessons completed, some in progress, some not started
    - Include realistic timestamps for enrollment and completion dates
    - _Requirements: 20.4_

  - [x] 28.5 Create phishing campaign data
    - Create 2 sample PhishingCampaigns with different statuses (COMPLETED, RUNNING)
    - Create 5 PhishingAttempt records showing various user interactions
    - Include mix of clicked/not clicked, reported/not reported scenarios
    - Ensure realistic timestamps and proper user/campaign associations
    - _Requirements: 20.4_

- [ ] 29. Run seed and verify data
  - [ ] 29.1 Execute seed script
    - Add `ts-node` as dev dependency if not already present
    - Run `npx prisma db seed` to populate the database
    - Verify seed script completes without errors
    - _Requirements: 20.4_

  - [ ] 29.2 Verify data in Prisma Studio
    - Run `npx prisma studio` to open the database browser
    - Verify all tables contain the expected seed data
    - Check that relationships are properly established (foreign keys working)
    - Confirm data integrity and realistic content
    - _Requirements: 20.5_

- [ ] 30. Test database integration with Next.js
  - [ ] 30.1 Verify database connection
    - Run `npm run dev` and ensure the application starts without database errors
    - Verify Prisma client can connect and query the database
    - Test that existing dashboard pages still work with the expanded schema
    - _Requirements: 21.1, 21.2_

  - [ ] 30.2 Test CRUD operations
    - Create a simple test API route that performs basic CRUD operations on each model
    - Test creating, reading, updating, and deleting records
    - Verify referential integrity is maintained during operations
    - Ensure cascade deletes work correctly
    - _Requirements: 21.3, 21.4_

  - [ ] 30.3 Verify TypeScript integration
    - Confirm all Prisma-generated types are available in TypeScript
    - Test that model relationships provide proper type safety
    - Verify enum types are correctly typed and usable
    - Ensure no TypeScript errors in existing code after schema changes
    - _Requirements: 21.2_

- [ ] 31. Final Phase 3 checkpoint
  - Run `npm test` and confirm all existing tests still pass
  - Run `npm run build` and confirm it exits with code 0
  - Verify `npx prisma studio` shows all seeded data correctly
  - Confirm the application runs successfully with `npm run dev`
  - Verify all database models are properly typed and accessible
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Phase 3 focuses exclusively on database schema and data layer implementation
- All existing Phase 1 and Phase 2 functionality must continue to work
- The schema is designed for future Supabase RLS compatibility with `organizationId` on all tenant-scoped models
- Proper indexing ensures good performance as data volume grows
- Comprehensive seed data provides realistic test scenarios for development
- TypeScript strict typing ensures type safety across all database operations

---

## Phase 4 Tasks: Core LMS UI and Business Logic

### Overview

Phase 4 builds the full LMS experience on top of the Phase 3 schema. It covers five feature groups: Course Management (Admin), Learner Course Browsing & Enrollment, Lesson Viewer, Progress Tracking, and Phishing Campaign Management. All data operations are strictly scoped to the user's organization. Server Components handle data fetching; Server Actions handle all mutations; Client Components are used only where interactivity is required.

---

- [ ] 32. Create pure utility functions and their property-based tests
  - [ ] 32.1 Implement `calculateProgressPercentage` in `src/lib/progress.ts`
    - Export `calculateProgressPercentage(completedLessons: number, totalLessons: number): number`
    - Return `Math.floor((completedLessons / totalLessons) * 100)`, guard `totalLessons === 0` → return 0
    - _Requirements: 25.1, 25.7_

  - [ ]* 32.2 Write property tests for `calculateProgressPercentage`
    - **Property 9: Result is always in [0, 100] for any valid inputs**
    - **Property 10: Returns 0 when completedLessons is 0**
    - **Property 11: Returns 100 when completedLessons equals totalLessons**
    - **Validates: Requirements 25.1, 25.7**

  - [ ] 32.3 Implement `calculateQuizScore` and `isQuizPassing` in `src/lib/quiz.ts`
    - Export `calculateQuizScore(correctAnswers: number, totalQuestions: number): number`
    - Export `isQuizPassing(score: number, passingScore: number): boolean`
    - _Requirements: 24.5, 24.6_

  - [ ]* 32.4 Write property tests for quiz functions
    - **Property 12: `calculateQuizScore` result is always in [0, 100]**
    - **Property 13: `isQuizPassing` returns true iff score >= passingScore**
    - **Validates: Requirements 24.5, 24.6**

  - [ ] 32.5 Implement `calculateAttemptRate` in `src/lib/campaigns.ts`
    - Export `calculateAttemptRate(count: number, totalRecipients: number): number`
    - Return `Math.floor((count / totalRecipients) * 100)`, guard `totalRecipients === 0` → return 0
    - _Requirements: 26.6_

  - [ ]* 32.6 Write property tests for `calculateAttemptRate`
    - **Property 15: Result is always in [0, 100] for any valid inputs**
    - **Validates: Requirements 26.6**

  - [ ] 32.7 Implement `reorderItems` in `src/lib/reorder.ts`
    - Export `reorderItems<T extends { order: number }>(items: T[], fromIndex: number, toIndex: number): T[]`
    - Splice item from `fromIndex`, insert at `toIndex`, reassign `order` as 1-based index
    - _Requirements: 22.8_

  - [ ]* 32.8 Write property tests for `reorderItems`
    - **Property 14: Output length equals input length (no items lost or duplicated)**
    - **Property 14: fromIndex === toIndex produces identical order values**
    - **Property 14: Output order values form a contiguous sequence starting at 1**
    - **Validates: Requirements 22.8**

- [ ] 33. Checkpoint — Ensure all 95 existing tests still pass
  - Run `npm test --run` and confirm all existing tests pass before adding new code.
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 34. Implement Course Management Server Actions
  - [ ] 34.1 Create `src/actions/courses.ts` with course CRUD actions
    - Implement `createCourse(data)`: call `auth()`, derive `organizationId`, validate non-empty title, `prisma.course.create`, `revalidatePath('/admin/courses')`
    - Implement `updateCourse(courseId, data)`: verify course belongs to org, `prisma.course.update`
    - Implement `publishCourse(courseId)` and `unpublishCourse(courseId)`: set `isPublished` boolean
    - Implement `deleteCourse(courseId)`: verify ownership, `prisma.course.delete` (cascades)
    - _Requirements: 22.2, 22.3, 22.4, 22.5, 22.9, 22.10, 27.1, 27.2, 28.2, 28.4_

  - [ ] 34.2 Add module and lesson CRUD actions to `src/actions/courses.ts`
    - Implement `createModule(courseId, data)`, `updateModule(moduleId, data)`, `deleteModule(moduleId)`
    - Implement `createLesson(moduleId, data)`, `updateLesson(lessonId, data)`, `deleteLesson(lessonId)`
    - Each action verifies the parent course belongs to the admin's org before writing
    - _Requirements: 22.6, 22.7, 27.1, 27.2_

  - [ ] 34.3 Add reorder actions to `src/actions/courses.ts`
    - Implement `reorderModules(courseId, orderedModuleIds: string[])`: update `order` field on each module in a transaction
    - Implement `reorderLessons(moduleId, orderedLessonIds: string[])`: update `order` field on each lesson in a transaction
    - Use `prisma.$transaction` to apply all order updates atomically
    - _Requirements: 22.8, 27.1_

  - [ ]* 34.4 Write unit tests for course Server Actions
    - Test `createCourse` creates record with correct `organizationId`
    - Test `createCourse` rejects empty title
    - Test `deleteCourse` is rejected when course belongs to a different org
    - Test `publishCourse` / `unpublishCourse` toggle `isPublished`
    - _Requirements: 22.2, 22.4, 22.9, 22.10_

- [ ] 35. Build Admin Course Management UI
  - [ ] 35.1 Create `/admin/courses` page (Server Component)
    - Fetch `prisma.course.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } })`
    - Render a list of course cards showing title, published status, module count
    - Include "New Course" button linking to `/admin/courses/new`
    - _Requirements: 22.1, 22.9_

  - [ ] 35.2 Create `/admin/courses/new` page with `CourseForm` Client Component
    - Server Component shell renders `CourseForm` with empty initial values
    - `CourseForm` manages title, description, coverImageUrl fields
    - On submit, calls `createCourse` Server Action and redirects to the new course edit page
    - _Requirements: 22.2, 22.10, 28.1, 28.3_

  - [ ] 35.3 Create `/admin/courses/[courseId]` edit page (Server Component + Client Components)
    - Fetch course with modules and lessons (ordered by `order` field)
    - Render `CourseForm` pre-populated with existing values for editing
    - Render publish/unpublish toggle button calling `publishCourse` / `unpublishCourse`
    - Render delete button with confirmation dialog calling `deleteCourse`
    - _Requirements: 22.3, 22.4, 22.5, 28.3_

  - [ ] 35.4 Create `ModuleList` and `LessonList` Client Components with reordering
    - `ModuleList` renders modules in `order` sequence with drag-and-drop (or up/down buttons)
    - On reorder, calls `reorderModules` Server Action
    - Each module row has edit, delete, and "add lesson" controls
    - `LessonList` mirrors the same pattern for lessons within a module
    - _Requirements: 22.6, 22.7, 22.8, 28.3_

- [ ] 36. Implement Enrollment Server Actions
  - [ ] 36.1 Create `src/actions/enrollments.ts`
    - Implement `enrollInCourse(courseId)`: call `auth()`, derive userId and organizationId, verify course is published and belongs to org, `prisma.enrollment.create({ data: { userId, courseId, progressPercentage: 0 } })`, handle unique constraint violation gracefully
    - _Requirements: 23.4, 23.6, 23.7, 27.1, 27.2, 28.2, 28.4_

  - [ ] 36.2 Implement `completeLessonAndUpdateProgress` in `src/actions/enrollments.ts`
    - Verify enrollment belongs to the authenticated user
    - `prisma.lessonProgress.upsert` with `completed: true`, `completedAt: now()`
    - Count total lessons and completed lessons for the enrollment
    - Call `calculateProgressPercentage` and update `Enrollment.progressPercentage`
    - If `newProgress === 100`, set `Enrollment.completedAt = now()`
    - `revalidatePath` for the course and lesson pages
    - _Requirements: 25.1, 25.2, 24.7, 27.1_

  - [ ]* 36.3 Write unit tests for enrollment Server Actions
    - Test `enrollInCourse` creates enrollment with `progressPercentage = 0`
    - Test `enrollInCourse` returns error on duplicate without creating a second record
    - Test `completeLessonAndUpdateProgress` recalculates progress correctly
    - Test `completeLessonAndUpdateProgress` sets `completedAt` when progress reaches 100
    - _Requirements: 23.4, 23.6, 25.1, 25.2_

- [ ] 37. Build Learner Course Catalog and Detail Pages
  - [ ] 37.1 Create `/learner/courses` catalog page (Server Component)
    - Fetch published courses for the learner's org with enrollment status for the current user
    - Render `CourseCard` grid showing title, description excerpt, module count, lesson count, duration, and enrollment progress if enrolled
    - _Requirements: 23.1, 23.2, 23.7, 23.8, 30.2_

  - [ ] 37.2 Create `CourseCard` component
    - Display title, description excerpt (truncated to ~120 chars), module count, total lesson count, estimated duration
    - Show progress bar if learner is enrolled
    - _Requirements: 23.2, 25.3_

  - [ ] 37.3 Create `/learner/courses/[courseId]` detail page (Server Component)
    - Fetch course with modules and lessons, and the learner's enrollment if it exists
    - Render full description, module/lesson list, and enrollment status
    - Render "Enroll" button (calls `enrollInCourse`) if not enrolled
    - Render "Continue Learning" link to the first incomplete lesson if enrolled
    - _Requirements: 23.3, 23.5, 23.7, 25.4_

- [ ] 38. Build Lesson Viewer
  - [ ] 38.1 Create `/learner/courses/[courseId]/lessons/[lessonId]` page (Server Component)
    - Fetch lesson, verify learner is enrolled (redirect to course detail if not)
    - Fetch `LessonProgress` for this lesson to show completion state
    - Render type-specific viewer component based on `lesson.type`
    - Render previous/next lesson navigation links
    - _Requirements: 24.1, 24.8, 24.9, 24.10_

  - [ ] 38.2 Create `VideoPlayer` Client Component
    - Render `<iframe>` or `<video>` element using `lesson.videoUrl`
    - On video end event, call `completeLessonAndUpdateProgress` Server Action
    - Show "Mark as Complete" button as fallback for non-auto-detectable completion
    - _Requirements: 24.2, 24.7_

  - [ ] 38.3 Create `MarkdownRenderer` Client Component
    - Render `lesson.content` as sanitized HTML (use `dangerouslySetInnerHTML` with a sanitizer, or a Markdown library)
    - Render "Mark as Complete" button; on click, call `completeLessonAndUpdateProgress`
    - _Requirements: 24.3, 24.7_

  - [ ] 38.4 Create `QuizForm` Client Component
    - Fetch and render all `QuizQuestion` records with multiple-choice options from the `options` JSON field
    - Manage selected answers in local state
    - On submit, call `calculateQuizScore` and `isQuizPassing` client-side to display immediate result
    - Call `completeLessonAndUpdateProgress` Server Action after submission
    - Display score, pass/fail result, and passing threshold to the learner
    - _Requirements: 24.4, 24.5, 24.6, 24.7_

- [ ] 39. Checkpoint — Verify lesson viewer and progress tracking end-to-end
  - Run `npm test --run` and confirm all tests pass.
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 40. Build Progress Display on Learner Dashboard
  - [ ] 40.1 Update learner dashboard page to show enrolled courses with progress
    - Fetch `prisma.enrollment.findMany({ where: { userId }, include: { course: true } })`
    - Render each enrollment as a card with course title and a `<Progress>` bar (shadcn/ui) showing `progressPercentage`
    - _Requirements: 25.3, 30.1_

  - [ ]* 40.2 Write unit tests for learner dashboard progress display
    - Test that enrollments with various `progressPercentage` values render the correct progress bar value
    - _Requirements: 25.3_

- [ ] 41. Build Admin Course Stats Page
  - [ ] 41.1 Create `/admin/courses/[courseId]/stats` page (Server Component)
    - Fetch total enrollment count for the course
    - Fetch count of enrollments where `completedAt IS NOT NULL`
    - Calculate completion percentage using `calculateProgressPercentage(completions, total)`
    - Render stats cards: Total Enrollments, Completions, Completion Rate
    - _Requirements: 25.5, 25.6_

  - [ ]* 41.2 Write unit tests for stats page data fetching
    - Test that stats are scoped to the admin's organization
    - _Requirements: 25.5, 25.6_

- [ ] 42. Implement Phishing Campaign Server Actions
  - [ ] 42.1 Create `src/actions/campaigns.ts`
    - Implement `createCampaign(data)`: call `auth()`, derive `organizationId`, validate non-empty title, `prisma.phishingCampaign.create({ data: { ...data, status: 'DRAFT', organizationId, createdById } })`
    - _Requirements: 26.2, 26.8, 27.1, 28.2, 28.4_

  - [ ] 42.2 Implement `transitionCampaignStatus` in `src/actions/campaigns.ts`
    - Define `VALID_TRANSITIONS` map: `DRAFT → SCHEDULED`, `SCHEDULED → RUNNING`, `RUNNING → COMPLETED`
    - Fetch current campaign status, verify it belongs to the admin's org
    - Validate the requested `newStatus` is the valid next state; throw if not
    - `prisma.phishingCampaign.update({ data: { status: newStatus } })`
    - _Requirements: 26.3, 27.1, 27.2_

  - [ ]* 42.3 Write unit tests for campaign Server Actions
    - Test `createCampaign` creates record with status `DRAFT` and correct `organizationId`
    - Test `createCampaign` rejects empty title
    - Test `transitionCampaignStatus` allows `DRAFT → SCHEDULED`
    - Test `transitionCampaignStatus` rejects `DRAFT → RUNNING` (skipping a step)
    - Test `transitionCampaignStatus` rejects any transition from `COMPLETED`
    - _Requirements: 26.2, 26.3, 26.8_

- [ ] 43. Build Phishing Campaign Management UI
  - [ ] 43.1 Create `/admin/campaigns` page (Server Component)
    - Fetch `prisma.phishingCampaign.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } })`
    - Render campaign list with title, status badge, and creation date
    - Include "New Campaign" button linking to `/admin/campaigns/new`
    - _Requirements: 26.1, 26.7_

  - [ ] 43.2 Create `/admin/campaigns/new` page with `CampaignForm` Client Component
    - `CampaignForm` manages title and description fields
    - On submit, calls `createCampaign` Server Action and redirects to the campaign detail page
    - _Requirements: 26.2, 26.8, 28.3_

  - [ ] 43.3 Create `/admin/campaigns/[campaignId]` detail page (Server Component)
    - Fetch campaign with all `PhishingAttempt` records
    - Calculate opened rate, clicked rate, reported rate using `calculateAttemptRate`
    - Render campaign metadata, status badge, and stats cards
    - Render `CampaignStatusButton` Client Component for status transitions
    - _Requirements: 26.4, 26.5, 26.6, 26.7_

  - [ ] 43.4 Create `CampaignStatusButton` Client Component
    - Determine the next valid status from the current status
    - Render a button labeled with the next transition (e.g., "Schedule", "Start", "Complete")
    - On click, call `transitionCampaignStatus` Server Action
    - Disable button if no valid next transition exists (campaign is COMPLETED or PAUSED)
    - _Requirements: 26.3, 28.3_

- [ ] 44. Update Admin Sidebar Navigation
  - [ ] 44.1 Update `SidebarNav` to link to real Phase 4 routes
    - Replace placeholder "Courses" link with `/admin/courses`
    - Replace placeholder "Phishing Campaigns" link with `/admin/campaigns`
    - _Requirements: 22.1, 26.1_

- [ ] 45. Update Learner Navigation
  - [ ] 45.1 Update learner top nav to link to real Phase 4 routes
    - Replace placeholder "My Courses" link with `/learner/courses`
    - _Requirements: 23.1_

- [ ] 46. Checkpoint — Final Phase 4 verification
  - Run `npm test --run` and confirm all tests pass (existing 95 + new Phase 4 tests).
  - Run `npm run build` and confirm it exits with code 0.
  - Verify all Phase 4 pages render without TypeScript errors.
  - Confirm multi-tenant scoping: a learner cannot access courses from another organization.
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Phase 4 builds exclusively on the Phase 3 schema — no schema changes are required.
- All existing Phase 1, 2, and 3 functionality must continue to work.
- Pure functions in `src/lib/` are the primary targets for property-based tests.
- Server Actions must always derive `organizationId` from `auth()` — never trust client-supplied org IDs.
- Client Components are limited to: forms, drag-and-drop reordering, video player, quiz interaction, and status buttons.
- The `revalidatePath` call after each mutation ensures Server Components re-fetch fresh data.
- Tasks marked with `*` are optional and can be skipped for a faster MVP.

---

## Phase 5 Tasks

### Overview

Phase 5 adds User Management (Admin), Analytics Dashboard (Admin), Learner Progress Dashboard, and Badges. All pages are Server Components; mutations use Server Actions. The orange color theme is enforced throughout. No schema changes are required.

---

- [ ] 47. Implement analytics pure functions and property tests
  - [ ] 47.1 Create `src/lib/analytics.ts` with `calculateOrgCompletionRate` and `calculateAvgClickRate`
    - Export `calculateOrgCompletionRate(completedEnrollments: number, totalEnrollments: number): number`
    - Export `calculateAvgClickRate(totalClicked: number, totalAttempts: number): number`
    - Both guard against division by zero (return 0 when denominator is 0)
    - _Requirements: 32.7, 32.8_

  - [ ]* 47.2 Write property tests for analytics functions
    - **Property 16: `calculateOrgCompletionRate` result is always in [0, 100]**
    - **Property 17: `calculateAvgClickRate` result is always in [0, 100]**
    - **Validates: Requirements 32.7, 32.8**

- [ ] 48. Add `changeUserRole` Server Action
  - [ ] 48.1 Add `changeUserRole(targetUserId, newRole)` to `src/actions/user.ts`
    - Call `auth()`, derive `organizationId`
    - Fetch current user by `clerkUserId` to get their DB `id`
    - Fetch target user; verify `targetUser.organizationId === organizationId`
    - Prevent self-role-change: throw if `targetUser.id === currentDbUser.id`
    - `prisma.user.update({ where: { id: targetUserId }, data: { role: newRole } })`
    - `revalidatePath('/admin/users')`
    - _Requirements: 31.3, 31.6, 31.7, 31.8, 35.2, 35.7_

  - [ ]* 48.2 Write unit tests for `changeUserRole`
    - Test updates role for valid user in same org
    - Test rejects update for user in different org
    - Test rejects self-role-change
    - _Requirements: 31.3, 31.6, 31.7_

- [ ] 49. Build Admin User Management pages
  - [ ] 49.1 Create `src/components/users/RoleChangeForm.tsx` Client Component
    - Render a `<select>` dropdown with ADMIN, LEARNER, MANAGER options
    - On change, call `changeUserRole` Server Action with the selected role
    - Use `bg-orange-500 text-white` styling for the submit button
    - _Requirements: 31.3, 35.3_

  - [ ] 49.2 Create `/admin/users` page (Server Component)
    - Fetch `prisma.user.findMany({ where: { organizationId }, include: { _count: { select: { enrollments: true } } } })`
    - Render a table with columns: Name/Email, Role badge, Enrollment count, Actions
    - Each row links to `/admin/users/[userId]`
    - Include `RoleChangeForm` inline for each user row
    - _Requirements: 31.1, 31.2, 31.6_

  - [ ] 49.3 Create `/admin/users/[userId]` detail page (Server Component)
    - Fetch user by `id` verifying `organizationId` matches
    - Fetch enrollments with course data: `prisma.enrollment.findMany({ where: { userId }, include: { course: true } })`
    - Render user profile card (name, email, role badge)
    - Render enrollment list with course title, progress bar, enrolled date, completed date
    - _Requirements: 31.4, 31.5, 31.6_

- [ ] 50. Build Admin Analytics Dashboard
  - [ ] 50.1 Create `/admin/analytics` page (Server Component)
    - Fetch all stats in parallel using `Promise.all`:
      - `prisma.user.count({ where: { organizationId } })`
      - `prisma.course.count({ where: { organizationId } })`
      - Total enrollments and completed enrollments (scoped via `course.organizationId`)
      - Per-course enrollment and completion counts
      - Phishing: total campaigns, total attempts, total clicked
    - Calculate `completionRate` using `calculateOrgCompletionRate`
    - Calculate `avgClickRate` using `calculateAvgClickRate`
    - _Requirements: 32.1, 32.2, 32.3, 32.4, 32.6, 32.7, 32.8_

  - [ ] 50.2 Render analytics stat cards and tables
    - Render 4 summary stat cards (Total Users, Total Courses, Total Enrollments, Completion Rate) using shadcn/ui `Card`
    - Render per-course table: Course Title | Enrollments | Completions | Completion %
    - Render phishing summary card: Total Campaigns | Total Attempts | Avg Click Rate
    - Use orange accent colors throughout; no external chart library
    - _Requirements: 32.2, 32.3, 32.4, 32.5, 32.9_

- [ ] 51. Checkpoint — Ensure all tests pass after admin Phase 5 features
  - Run `npm test --run` and confirm all tests pass.
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 52. Build Learner Progress Dashboard
  - [ ] 52.1 Create `/learner/progress` page (Server Component)
    - Fetch `dbUser` by `clerkUserId`
    - Fetch enrollments with course and lessonProgress data
    - Render a card per enrollment showing: course title, progress bar (`progressPercentage`), enrolled date, completed date (if set)
    - Display "No enrollments yet" message when list is empty
    - _Requirements: 33.1, 33.2, 33.5, 33.6_

  - [ ] 52.2 Add quiz score display to progress cards
    - For each enrollment, query completed `LessonProgress` records for QUIZ-type lessons
    - Display quiz scores if available (derive from `LessonProgress.completed` — note: scores are not stored in DB, so display "Completed" for passed quizzes)
    - _Requirements: 33.3_

- [ ] 53. Build Learner Badges Page
  - [ ] 53.1 Create `/learner/badges` page (Server Component)
    - Fetch `dbUser` by `clerkUserId`
    - Fetch `prisma.enrollment.findMany({ where: { userId: dbUser.id, completedAt: { not: null } }, include: { course: true }, orderBy: { completedAt: 'desc' } })`
    - Render a badge card per completed enrollment showing: course name, completion date, orange badge icon
    - Display motivational message when no badges earned yet
    - _Requirements: 34.2, 34.3, 34.6, 34.7_

- [ ] 54. Update learner dashboard with badge count
  - [ ] 54.1 Update `/learner/dashboard` page to show badge count
    - Add query: `prisma.enrollment.count({ where: { userId: dbUser.id, completedAt: { not: null } } })`
    - Display badge count in a stat card on the dashboard (e.g., "🏅 X Badges Earned")
    - Link the badge count card to `/learner/badges`
    - _Requirements: 34.5_

- [ ] 55. Final checkpoint — Phase 5 complete verification
  - Run `npm test --run` and confirm all 124+ tests pass.
  - Run `npx tsc --noEmit` and confirm zero TypeScript errors.
  - Verify all Phase 5 pages render without errors.
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Phase 5 derives badges from existing `Enrollment.completedAt` — no new DB table needed.
- All analytics queries use `organizationId` scoping via relation filters (e.g., `course: { organizationId }`).
- The `RoleChangeForm` is the only new Client Component in Phase 5.
- Tasks marked with `*` are optional and can be skipped for a faster MVP.
- Quiz scores are not stored in the DB schema; the progress page shows "Completed" for passed quiz lessons.
