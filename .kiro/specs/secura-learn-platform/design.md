# Design Document

## SecuraLearn Platform — Phase 1

---

## Overview

SecuraLearn Phase 1 establishes the complete project foundation for a multi-tenant Security Awareness Training Platform. The goal is a production-ready scaffold that subsequent phases can build on without structural rework.

The design centers on three pillars:

1. **Authentication & Multi-Tenancy** — Clerk handles all identity, session management, and organization isolation. No custom auth code is written.
2. **Data Layer** — Prisma ORM with PostgreSQL (Supabase) provides a type-safe, migration-driven database layer. Phase 1 defines the baseline schema; Phase 2+ extends it.
3. **Routing & Protection** — Next.js 15 App Router with Edge Middleware enforces role-based access before any page renders.

### Key Research Findings

- **Clerk `clerkMiddleware()`** (current API, replacing deprecated `authMiddleware`) uses `createRouteMatcher()` to define protected route groups and `auth.protect()` / `auth().has()` for role checks. Organization role keys follow the format `org:<role>` (e.g., `org:admin`, `org:member`). Custom roles like `org:learner` can be created in the Clerk Dashboard.
- **Prisma singleton** — In Next.js development, hot-reload creates new module instances on each reload. The standard pattern stores the `PrismaClient` on `globalThis` in non-production environments to prevent connection pool exhaustion.
- **Next.js 15 App Router** — Route groups (parenthesized folders) allow separate layouts per section without affecting URL paths. Server Components are the default; Client Components are opt-in via `"use client"`.
- **Clerk Organizations** — Each Organization maps to one tenant. `auth().orgId` and `auth().orgRole` are available in Server Components, Server Actions, and Middleware. Custom roles must be created in the Clerk Dashboard before they can be checked in code.

---

## Architecture

### High-Level Architecture

```mermaid
graph TD
    Browser["Browser / Client"]
    MW["Edge Middleware\n(src/middleware.ts)"]
    Public["Public Routes\n/ · /sign-in · /sign-up"]
    Admin["Admin Routes\n/admin/**"]
    Learn["Learn Routes\n/learn/**"]
    Clerk["Clerk\n(Auth + Orgs)"]
    Prisma["Prisma Client\n(src/lib/prisma.ts)"]
    DB["PostgreSQL\n(Supabase)"]

    Browser -->|"every request"| MW
    MW -->|"public"| Public
    MW -->|"authenticated + org:admin"| Admin
    MW -->|"authenticated + org:learner"| Learn
    MW <-->|"session validation"| Clerk
    Admin -->|"data queries"| Prisma
    Learn -->|"data queries"| Prisma
    Prisma --> DB
```

### Request Lifecycle

1. Every request hits `src/middleware.ts` at the Edge.
2. Middleware calls `clerkMiddleware()` which validates the session token with Clerk.
3. Based on authentication state and organization role, the middleware either allows the request, redirects to sign-in, or redirects to `/unauthorized`.
4. Allowed requests reach the App Router. Server Components fetch data directly (no API round-trip).
5. Server Actions handle mutations — they run exclusively on the server and are called from Client Components or forms.

### Rendering Strategy

| Route | Rendering | Rationale |
|---|---|---|
| `/` (landing) | Static (Server Component, no dynamic data) | Maximum performance, Lighthouse 90+ |
| `/sign-in`, `/sign-up` | Server Component shell + Clerk Client Component | Clerk components require client context |
| `/admin/dashboard` | Dynamic Server Component | Reads Clerk session + DB data per request |
| `/learn/dashboard` | Dynamic Server Component | Reads Clerk session + DB data per request |
| `/unauthorized` | Static Server Component | No auth data needed |
| `not-found` | Static Server Component | No auth data needed |

---

## Components and Interfaces

### Folder Structure

```
secura-learn/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/
│   │   │   │   └── [[...sign-in]]/
│   │   │   │       └── page.tsx
│   │   │   └── sign-up/
│   │   │       └── [[...sign-up]]/
│   │   │           └── page.tsx
│   │   ├── (admin)/
│   │   │   ├── layout.tsx          # Admin shell layout (sidebar)
│   │   │   └── admin/
│   │   │       └── dashboard/
│   │   │           └── page.tsx
│   │   ├── (learner)/
│   │   │   ├── layout.tsx          # Learner shell layout (top nav)
│   │   │   └── learn/
│   │   │       └── dashboard/
│   │   │           └── page.tsx
│   │   ├── unauthorized/
│   │   │   └── page.tsx            # Calls forbidden() → triggers forbidden.tsx
│   │   ├── forbidden.tsx           # Next.js 15 special file — renders with HTTP 403
│   │   ├── layout.tsx              # Root layout (ClerkProvider)
│   │   ├── page.tsx                # Landing page
│   │   └── not-found.tsx
│   ├── actions/
│   │   └── user.ts                 # Phase 1 placeholder Server Actions
│   ├── components/
│   │   ├── ui/                     # shadcn/ui primitives (auto-generated)
│   │   ├── landing/
│   │   │   ├── Navbar.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesSection.tsx
│   │   │   └── Footer.tsx
│   │   └── shared/
│   │       └── UserGreeting.tsx    # Reusable server component
│   ├── lib/
│   │   ├── prisma.ts               # Prisma singleton
│   │   └── utils.ts                # cn() helper (shadcn/ui)
│   ├── types/
│   │   └── index.ts                # Shared TypeScript types
│   └── middleware.ts
├── .env.example
├── components.json                 # shadcn/ui config
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

**Rationale for route groups:**
- `(auth)` — Groups sign-in/sign-up under a shared auth layout (centered card) without affecting URLs.
- `(admin)` — Provides the admin shell layout (sidebar navigation) to all `/admin/**` routes.
- `(learner)` — Provides the learner shell layout (top navigation) to all `/learn/**` routes.
- Route groups do not appear in the URL, so `/admin/dashboard` remains `/admin/dashboard`.

### Component Interfaces

#### Landing Page Components

```typescript
// src/components/landing/Navbar.tsx
// Server Component — no props needed, links are static
export function Navbar(): JSX.Element

// src/components/landing/HeroSection.tsx
// Server Component — static content
export function HeroSection(): JSX.Element

// src/components/landing/FeaturesSection.tsx
// Server Component — static content
interface Feature {
  icon: string;       // Lucide icon name
  title: string;
  description: string;
}
export function FeaturesSection(): JSX.Element

// src/components/landing/Footer.tsx
// Server Component — static content
export function Footer(): JSX.Element
```

#### Dashboard Components

```typescript
// src/components/shared/UserGreeting.tsx
// Server Component — reads Clerk session
interface UserGreetingProps {
  userName: string | null;
  orgName: string | null;
}
export function UserGreeting(props: UserGreetingProps): JSX.Element
```

#### Middleware Interface

```typescript
// src/middleware.ts
// Exported config matcher — runs on all routes except static assets
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
```

### Server Actions Interface

```typescript
// src/actions/user.ts
// Phase 1: placeholder — will sync Clerk user to DB on first sign-in
export async function syncUserToDatabase(): Promise<void>
```

---

## Data Models

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  LEARNER
}

model Organization {
  id         String   @id @default(cuid())
  clerkOrgId String   @unique
  name       String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  users      User[]
}

model User {
  id             String       @id @default(cuid())
  clerkId        String       @unique
  email          String       @unique
  name           String?
  role           Role
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
}
```

**Design decisions:**

- `clerkId` and `clerkOrgId` are the foreign keys linking Prisma records to Clerk's identity system. All auth state comes from Clerk; the DB stores application-level data only.
- `organizationId` on `User` references the Prisma `Organization.id` (not the Clerk org ID directly) to maintain referential integrity within the database.
- `Role` enum mirrors the Clerk custom roles (`org:admin` → `ADMIN`, `org:learner` → `LEARNER`) but is stored independently so the DB can be queried without a Clerk API call.
- `cuid()` is used over `uuid()` for shorter, URL-safe IDs.

### Prisma Client Singleton

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

**Rationale:** Next.js hot-reload in development re-evaluates modules on each change, which would create a new `PrismaClient` instance (and new connection pool) on every reload. Storing the instance on `globalThis` ensures only one client exists per process lifetime.

### Environment Variables

```bash
# .env.example

# ── Database ──────────────────────────────────────────────────────────────────
# Supabase PostgreSQL connection string (Transaction mode for serverless)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# ── Clerk Authentication ───────────────────────────────────────────────────────
# Publishable key (safe to expose to the browser)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
# Secret key (server-side only — never expose to the browser)
CLERK_SECRET_KEY="sk_test_..."

# Clerk redirect URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/admin/dashboard"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/admin/dashboard"

# ── Application ────────────────────────────────────────────────────────────────
# Canonical URL (used for absolute links and OG metadata)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ── Supabase (future Storage integration) ─────────────────────────────────────
SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_ANON_KEY="eyJ..."
```

**Note on `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`:** The default redirect points to `/admin/dashboard`. The middleware will intercept learners and redirect them to `/learn/dashboard` based on their org role. This avoids needing two separate after-sign-in URLs.

---

## Middleware Design

### Route Protection Logic

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/unauthorized',
])

const isAdminRoute = createRouteMatcher(['/admin(.*)'])
const isLearnerRoute = createRouteMatcher(['/learn(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId, orgRole } = await auth()

  // 1. Allow public routes unconditionally
  if (isPublicRoute(req)) {
    // Redirect authenticated users away from auth pages
    if (userId && (req.nextUrl.pathname === '/sign-in' || req.nextUrl.pathname === '/sign-up')) {
      const role = orgRole
      const dest = role === 'org:admin' ? '/admin/dashboard' : '/learn/dashboard'
      return NextResponse.redirect(new URL(dest, req.url))
    }
    // Redirect authenticated users from landing page to their dashboard
    if (userId && req.nextUrl.pathname === '/') {
      const dest = orgRole === 'org:admin' ? '/admin/dashboard' : '/learn/dashboard'
      return NextResponse.redirect(new URL(dest, req.url))
    }
    return NextResponse.next()
  }

  // 2. Require authentication for all non-public routes
  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  // 3. Require active organization membership
  if (!orgId) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
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
```

**Decision — custom `org:learner` role:** Clerk's default roles are `org:admin` and `org:member`. SecuraLearn uses a custom `org:learner` role (created in the Clerk Dashboard) to distinguish learners from generic members. This keeps role semantics explicit and avoids ambiguity as the platform grows.

**Decision — middleware redirect for `/`:** Rather than a separate redirect page, the middleware handles the `/` → dashboard redirect inline. This avoids a flash of the landing page for authenticated users.

---

## Landing Page Design

### Structure

```
<RootLayout>           ← ClerkProvider, global fonts, metadata
  <Navbar />           ← Logo + Sign In + Get Started
  <main>
    <HeroSection />    ← Headline + subheadline + CTA
    <FeaturesSection/> ← 3 feature cards
  </main>
  <Footer />           ← Brand + copyright
</RootLayout>
```

### Visual Design Decisions

- **Color palette:** Dark navy primary (`#0F172A`), electric blue accent (`#3B82F6`), white text on dark backgrounds. Conveys security and professionalism.
- **Typography:** Inter (system font stack fallback) — clean, readable, widely used in SaaS.
- **Hero:** Full-viewport-height section with a centered headline, subheadline, and two CTAs (primary: "Get Started" → `/sign-up`, secondary: "Sign In" → `/sign-in`).
- **Features section:** Three cards using shadcn/ui `Card` component with Lucide icons: `ShieldCheck` (Security Training), `Fish` (Phishing Simulations), `BarChart3` (Analytics & Reporting).
- **Responsive:** Tailwind responsive prefixes (`sm:`, `md:`, `lg:`) handle all breakpoints. No custom media queries.
- **Performance:** All components are Server Components with no client-side JavaScript. Images use `next/image` with explicit dimensions. This ensures Lighthouse 90+.

---

## Dashboard Designs

### Admin Dashboard (`/admin/dashboard`)

```
<AdminLayout>
  <Sidebar>
    ├── Logo / Brand
    ├── Nav: Dashboard (active)
    ├── Nav: Courses (placeholder)
    ├── Nav: Users (placeholder)
    ├── Nav: Phishing Campaigns (placeholder)
    └── Nav: Analytics (placeholder)
  </Sidebar>
  <main>
    <UserGreeting name={userName} org={orgName} />
    <p>Phase 2 content coming soon</p>
  </main>
</AdminLayout>
```

The sidebar uses shadcn/ui `Button` (variant="ghost") for nav items. Active state is determined by comparing `usePathname()` (Client Component wrapper) against the current route.

### Learner Dashboard (`/learn/dashboard`)

```
<LearnerLayout>
  <TopNav>
    ├── Logo / Brand
    ├── Nav: My Courses (placeholder)
    ├── Nav: Badges (placeholder)
    └── Nav: Progress (placeholder)
  </TopNav>
  <main>
    <UserGreeting name={userName} org={orgName} />
    <p>Phase 2 content coming soon</p>
  </main>
</LearnerLayout>
```

The learner layout uses a horizontal top navigation bar rather than a sidebar, reflecting the learner's simpler navigation needs.

---

## Error Pages Design

### Not Found (`src/app/not-found.tsx`)

- Static Server Component.
- Displays: "404 — Page Not Found", a brief message, and a `<Link href="/">Return to Home</Link>` button.
- Styled with Tailwind, centered on the page.

### Unauthorized (`src/app/forbidden.tsx`)

- Static Server Component.
- Returns HTTP 403 using Next.js 15.1+'s built-in `forbidden()` convention. When the middleware redirects to `/unauthorized`, it actually calls `forbidden()` from `next/navigation` in the target page, which causes Next.js to render `src/app/forbidden.tsx` with an HTTP 403 status code — the same pattern as `not-found.tsx` for 404s.
- The `forbidden.tsx` file renders: an explanation that the user lacks permission, a "Sign In" link to `/sign-in`, and a "Return to Home" link to `/`.
- **Implementation note:** The middleware redirects to `/unauthorized` as a URL. The `/unauthorized/page.tsx` calls `forbidden()` at the top of the component, which triggers the `forbidden.tsx` special file with HTTP 403. This is the idiomatic Next.js 15 approach for 403 responses.

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

The middleware logic and UI rendering functions in SecuraLearn Phase 1 are suitable for property-based testing. The middleware is a pure function of (request, auth state) → response, and the dashboard rendering is a pure function of (user data) → HTML. Both have large input spaces where varied inputs reveal edge cases.

### Property 1: Unauthenticated requests to protected routes are redirected to sign-in

*For any* URL path matching `/admin/**` or `/learn/**`, a request with no authenticated session SHALL be redirected to `/sign-in`, regardless of the specific sub-path.

**Validates: Requirements 3.2, 5.1**

### Property 2: Authenticated users without an active organization are redirected from protected routes

*For any* URL path matching `/admin/**` or `/learn/**`, a request from an authenticated user who has no active organization SHALL be redirected away from the protected route (to `/sign-in` or an org-selection page), regardless of the specific sub-path.

**Validates: Requirements 4.3**

### Property 3: Role mismatch on any protected route redirects to /unauthorized

*For any* URL path under `/admin/**` accessed by a user whose org role is not `org:admin`, the middleware SHALL redirect to `/unauthorized`. Symmetrically, *for any* URL path under `/learn/**` accessed by a user whose org role is not `org:learner`, the middleware SHALL redirect to `/unauthorized`. This holds regardless of the specific sub-path depth or structure.

**Validates: Requirements 4.5, 4.6, 5.2, 5.3, 5.7**

### Property 4: Public routes are accessible without authentication

*For any* request to a public route (`/`, `/sign-in`, `/sign-up`, `/api/webhooks/**`, `/unauthorized`) with no authenticated session, the middleware SHALL allow the request to proceed without redirecting to sign-in.

**Validates: Requirements 5.4**

### Property 5: Features section always renders at least three feature cards

*For any* rendering of the `FeaturesSection` component, the number of feature cards rendered SHALL be greater than or equal to 3.

**Validates: Requirements 8.4**

### Property 6: Dashboard renders with user name and organization name visible

*For any* combination of a non-null user name and non-null organization name, rendering the `UserGreeting` component SHALL produce output that contains both the user name and the organization name as visible text.

**Validates: Requirements 9.2, 10.2**

---

## Error Handling

### Authentication Errors

- **Unauthenticated access:** Middleware redirects to `/sign-in`. Clerk's sign-in page handles the return URL automatically via `redirect_url` query parameter.
- **Invalid session:** Clerk invalidates the session token; the next request will be treated as unauthenticated and redirected to `/sign-in`.
- **Clerk API errors:** Clerk's embedded components display built-in error messages. No custom error handling is needed for Phase 1.

### Authorization Errors

- **Wrong role:** Middleware redirects to `/unauthorized`. The page renders a 403 response using Next.js 15's `forbidden()` function from `next/navigation`, which renders `src/app/forbidden.tsx` with HTTP 403 status.
- **No active organization:** Middleware redirects to `/sign-in` where Clerk's organization selection flow handles org creation/joining.

### Database Errors

- **Connection failure:** Prisma throws a `PrismaClientInitializationError`. In Phase 1, this surfaces as a 500 error page (Next.js default error boundary). Phase 2 will add proper error boundaries.
- **Query errors:** Prisma throws typed errors (`PrismaClientKnownRequestError`). Server Actions should catch these and return structured error responses. Phase 1 Server Actions are placeholders; error handling will be implemented in Phase 2.

### Not Found

- Next.js automatically renders `src/app/not-found.tsx` for any route that doesn't match a page file, returning HTTP 404.

### Environment Variable Errors

- Missing Clerk keys: Clerk SDK throws at startup with a descriptive message.
- Missing `DATABASE_URL`: Prisma throws at client initialization.
- Both are caught at startup, not at runtime, making misconfiguration immediately visible.

---

## Testing Strategy

### Overview

Phase 1 uses a dual testing approach:
- **Unit/component tests** for specific examples, edge cases, and UI structure verification.
- **Property-based tests** for the middleware logic and rendering functions where input variation reveals correctness issues.

PBT is appropriate here because:
- The middleware is a pure function of (request path, auth state) → redirect decision.
- The dashboard rendering is a pure function of (user data) → rendered output.
- Both have large input spaces (arbitrary URL paths, arbitrary user names/org names).

### Property-Based Testing

**Library:** [fast-check](https://fast-check.dev/) (TypeScript-native, well-maintained, works with Vitest/Jest).

**Configuration:** Each property test runs a minimum of 100 iterations.

**Tag format:** `// Feature: secura-learn-platform, Property {N}: {property_text}`

**Property tests to implement:**

| Property | Test Description | Generator |
|---|---|---|
| P1: Unauthenticated redirect | For any `/admin/` or `/learn/` sub-path, unauthenticated request → redirect to `/sign-in` | `fc.string()` for sub-path, combined with `/admin/` or `/learn/` prefix |
| P2: No-org redirect | For any protected path, authenticated-but-no-org request → redirect | Same path generator, mock auth with userId but no orgId |
| P3: Role mismatch → /unauthorized | For any `/admin/**` path + learner role, or `/learn/**` path + admin role → redirect to `/unauthorized` | Path generator + role enum |
| P4: Public routes pass through | For any public route, unauthenticated request → no redirect | Fixed set of public route prefixes |
| P5: Features count ≥ 3 | FeaturesSection renders ≥ 3 cards | No generator needed — deterministic |
| P6: Dashboard shows user/org name | For any userName + orgName, UserGreeting renders both | `fc.string()` for name and org name |

### Unit Tests

**Framework:** Vitest (fast, TypeScript-native, compatible with Next.js 15).

**Unit tests to implement:**

- Middleware: authenticated admin → `/` redirects to `/admin/dashboard` (Req 5.5)
- Middleware: authenticated learner → `/` redirects to `/learn/dashboard` (Req 5.6)
- Middleware: authenticated user on `/sign-in` → redirects to dashboard (Req 3.3)
- Navbar: contains "Sign In" link with `href="/sign-in"` (Req 8.8)
- Navbar: contains "Get Started" button/link with `href="/sign-up"` (Req 8.9)
- HeroSection: contains headline, subheadline, and CTA (Req 8.3)
- Footer: contains platform name and copyright text (Req 8.5)
- Admin layout: contains all four nav links (Courses, Users, Phishing Campaigns, Analytics) (Req 9.3)
- Learner layout: contains all three nav links (My Courses, Badges, Progress) (Req 10.3)
- Not-found page: contains message and link to `/` (Req 11.1)
- Unauthorized page: contains explanation and links (Req 11.2)
- Unauthorized page: returns HTTP 403 status (Req 11.3)

### Integration Tests

- `npx prisma db push` applies schema without errors (Req 7.5) — run in CI against a test Supabase project.
- Lighthouse CI score ≥ 90 in production build (Req 8.7) — run with `@lhci/cli` in CI.

### Smoke Tests (CI checks)

- `tsconfig.json` has `strict: true` and `@/*` path alias (Req 1.1, 1.5)
- `tailwind.config.ts` exists (Req 1.2)
- `components.json` exists (Req 1.3)
- `schema.prisma` exists with `postgresql` provider (Req 1.4)
- `.env.example` contains all required variable names (Req 1.6, 2.1–2.5)
- `npx prisma generate` exits with code 0 (Req 7.4)
- `npm run build` exits with code 0 (Req 1.8)
- `prisma/seed.ts` exists (Req 7.6)
- Root `layout.tsx` contains `ClerkProvider` (Req 3.5)
- Admin and learner dashboard pages have no `"use client"` directive (Req 9.1, 10.1)

### Test File Organization

```
src/
├── __tests__/
│   ├── middleware.test.ts        # Unit + property tests for middleware
│   ├── landing/
│   │   ├── Navbar.test.tsx
│   │   ├── HeroSection.test.tsx
│   │   ├── FeaturesSection.test.tsx
│   │   └── Footer.test.tsx
│   ├── shared/
│   │   └── UserGreeting.test.tsx # Property test P6
│   └── pages/
│       ├── not-found.test.tsx
│       └── unauthorized.test.tsx
scripts/
└── smoke-tests.ts               # CI smoke checks for config files
```
