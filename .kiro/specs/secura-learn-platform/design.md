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

---

## Phase 2 Design

### Overview

Phase 2 bridges Clerk (identity) and Prisma (application data). The two integration points are:

1. **Clerk Webhooks** — Clerk emits events when users and organizations are created. A Next.js API route verifies the Svix signature and writes records to Prisma.
2. **syncUserToDatabase Server Action** — Called on every dashboard load as a fallback. If the webhook was missed (e.g., during local development without a tunnel), this action ensures the user record exists before any data-dependent feature runs.

Profile pages complete the loop by reading the synced Prisma records and displaying them to the user.

---

### Webhook Architecture

```
Clerk Dashboard
      │
      │  HTTP POST (signed with CLERK_WEBHOOK_SECRET)
      ▼
Svix Webhook Delivery
      │
      │  Forwards to registered endpoint
      ▼
/api/webhooks/clerk/route.ts   (Next.js API Route)
      │
      ├─ Verify Svix signature  ──── fail ──► 400 Bad Request
      │
      ├─ Parse event type
      │     ├─ user.created              ──► prisma.user.upsert(...)
      │     ├─ organization.created      ──► prisma.organization.upsert(...)
      │     └─ organizationMembership.created ──► link user ↔ org, set role
      │
      └─ 200 OK  (or 500 on DB error)
```

**Why Svix?** Clerk uses Svix as its webhook delivery infrastructure. The `svix` npm package provides the `Webhook` class with a `verify()` method that validates the `svix-id`, `svix-timestamp`, and `svix-signature` headers against the webhook secret. This prevents replay attacks and spoofed payloads.

---

### Webhook Handler Implementation

```typescript
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  // Read Svix headers
  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing Svix headers', { status: 400 })
  }

  // Verify signature
  const payload = await req.text()
  const wh = new Webhook(WEBHOOK_SECRET)
  let event: WebhookEvent

  try {
    event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  // Handle events
  try {
    switch (event.type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name } = event.data
        const email = email_addresses[0]?.email_address ?? ''
        const name = [first_name, last_name].filter(Boolean).join(' ') || null
        await prisma.user.upsert({
          where: { clerkId: id },
          update: { email, name },
          create: { clerkId: id, email, name, role: 'LEARNER', organizationId: '' },
        })
        break
      }
      case 'organization.created': {
        const { id, name } = event.data
        await prisma.organization.upsert({
          where: { clerkOrgId: id },
          update: { name },
          create: { clerkOrgId: id, name },
        })
        break
      }
      case 'organizationMembership.created': {
        const { public_user_data, organization, role } = event.data
        const clerkUserId = public_user_data.user_id
        const clerkOrgId = organization.id
        const prismaRole = role === 'org:admin' ? 'ADMIN' : 'LEARNER'
        const org = await prisma.organization.findUnique({ where: { clerkOrgId } })
        if (org) {
          await prisma.user.update({
            where: { clerkId: clerkUserId },
            data: { organizationId: org.id, role: prismaRole },
          })
        }
        break
      }
    }
    return new Response('OK', { status: 200 })
  } catch {
    return new Response('Database error', { status: 500 })
  }
}
```

---

### syncUserToDatabase Server Action

```typescript
// src/actions/user.ts
'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function syncUserToDatabase(): Promise<void> {
  const { userId, orgId, orgRole } = await auth()
  if (!userId) return

  const clerkUser = await currentUser()
  if (!clerkUser) return

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null
  const prismaRole = orgRole === 'org:admin' ? 'ADMIN' : 'LEARNER'

  // Upsert organization first (if user belongs to one)
  let organizationId = ''
  if (orgId) {
    const org = await prisma.organization.upsert({
      where: { clerkOrgId: orgId },
      update: {},
      create: { clerkOrgId: orgId, name: orgId }, // name updated by webhook
    })
    organizationId = org.id
  }

  // Upsert user
  await prisma.user.upsert({
    where: { clerkId: userId },
    update: { email, name, role: prismaRole, ...(organizationId ? { organizationId } : {}) },
    create: { clerkId: userId, email, name, role: prismaRole, organizationId },
  })
}
```

**Rationale:** The Server Action is called at the top of both dashboard pages (`await syncUserToDatabase()`). It is idempotent — repeated calls are safe. The webhook is the primary sync path; this action is the safety net.

---

### Profile Page Component Design

Both profile pages follow the same structure:

```
<ProfilePage>                    ← Server Component
  ├─ fetch user from Prisma by clerkId
  ├─ <ProfileCard>               ← displays name, email, org, role badge
  └─ <EditNameForm>              ← Client Component
       └─ calls updateDisplayName() Server Action on submit
```

#### Server Component (data fetching)

```typescript
// src/app/(admin)/admin/profile/page.tsx
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export default async function AdminProfilePage() {
  const { userId } = await auth()
  const user = await prisma.user.findUnique({
    where: { clerkId: userId! },
    include: { organization: true },
  })
  // render ProfileCard + EditNameForm with user data
}
```

#### Client Component (edit form)

```typescript
// Inline or extracted to src/components/shared/EditNameForm.tsx
'use client'

import { useTransition } from 'react'
import { updateDisplayName } from '@/actions/user'

export function EditNameForm({ currentName }: { currentName: string | null }) {
  const [isPending, startTransition] = useTransition()
  // form with input + submit button
  // calls startTransition(() => updateDisplayName(newName))
}
```

#### updateDisplayName Server Action

```typescript
// Added to src/actions/user.ts
export async function updateDisplayName(name: string): Promise<void> {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthenticated')
  await prisma.user.update({
    where: { clerkId: userId },
    data: { name },
  })
}
```

---

### Updated Folder Structure (Phase 2 additions)

```
secura-learn/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── webhooks/
│   │   │       └── clerk/
│   │   │           └── route.ts          # NEW — Clerk webhook handler
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── dashboard/
│   │   │       │   └── page.tsx          # UPDATED — calls syncUserToDatabase()
│   │   │       └── profile/
│   │   │           └── page.tsx          # NEW — admin profile page
│   │   └── (learner)/
│   │       └── learner/
│   │           ├── dashboard/
│   │           │   └── page.tsx          # UPDATED — calls syncUserToDatabase()
│   │           └── profile/
│   │               └── page.tsx          # NEW — learner profile page
│   ├── actions/
│   │   └── user.ts                       # UPDATED — real syncUserToDatabase + updateDisplayName
│   └── components/
│       └── shared/
│           ├── SidebarNav.tsx            # UPDATED — adds Profile link
│           ├── TopNav.tsx                # UPDATED — adds Profile link
│           └── EditNameForm.tsx          # NEW — Client Component for name editing
```

---

### Environment Variables (Phase 2 additions)

```bash
# ── Clerk Webhooks ─────────────────────────────────────────────────────────────
# Webhook signing secret — obtain from Clerk Dashboard > Webhooks > your endpoint
CLERK_WEBHOOK_SECRET="whsec_..."
```

---

### Registering the Webhook in Clerk Dashboard

1. Navigate to **Clerk Dashboard → Webhooks → Add Endpoint**.
2. Set the URL to `https://{your-domain}/api/webhooks/clerk`.
3. Select the following events: `user.created`, `organization.created`, `organizationMembership.created`.
4. Copy the **Signing Secret** and set it as `CLERK_WEBHOOK_SECRET` in `.env.local`.
5. For local development, use a tunnel (e.g., `ngrok http 3000`) to expose the local server.

---

### Phase 2 Correctness Properties

#### Property 7: Webhook creates user record for any valid `user.created` event

*For any* valid `user.created` webhook payload (arbitrary Clerk user ID, email, and name), the webhook handler SHALL upsert a `User` record in Prisma with the correct `clerkId` and `email` fields.

**Validates: Requirements 12.2**

#### Property 8: Profile page renders user name and email for any valid user record

*For any* `User` record with a non-empty `name` and `email`, rendering the profile page SHALL produce output that contains both the user's name and email address as visible text.

**Validates: Requirements 13.3**

---

### Phase 2 Testing Strategy

#### Webhook Handler Tests

The webhook handler is tested by mocking Svix's `Webhook.verify()` and the Prisma client:

- **Valid signature + `user.created`** → `prisma.user.upsert` called with correct args, returns 200.
- **Invalid signature** → `Webhook.verify()` throws → handler returns 400.
- **Valid `organization.created`** → `prisma.organization.upsert` called, returns 200.
- **Valid `organizationMembership.created`** → `prisma.user.update` called with correct role, returns 200.
- **DB error** → Prisma throws → handler returns 500.

#### Profile Page Tests

Profile pages are tested by mocking `auth()` and `prisma.user.findUnique`:

- **Admin profile** → renders user name, email, org name, and role badge.
- **Learner profile** → same assertions.
- **Edit form** → submitting a new name calls `updateDisplayName` Server Action.

#### Property Test Implementation Notes

**P7 — Webhook creates user record:**
```typescript
// Feature: secura-learn-platform, Property 7: Webhook creates user record for any valid user.created event
fc.assert(fc.asyncProperty(
  fc.record({
    id: fc.string({ minLength: 1 }),
    email: fc.emailAddress(),
    firstName: fc.string(),
    lastName: fc.string(),
  }),
  async (userData) => {
    // mock Svix verify to return a user.created event with userData
    // call the POST handler
    // assert prisma.user.upsert was called with clerkId: userData.id
  }
))
```

**P8 — Profile page renders user data:**
```typescript
// Feature: secura-learn-platform, Property 8: Profile page renders user name and email for any valid user record
fc.assert(fc.asyncProperty(
  fc.record({
    name: fc.string({ minLength: 1 }),
    email: fc.emailAddress(),
  }),
  async ({ name, email }) => {
    // mock prisma.user.findUnique to return { name, email, ... }
    // render the profile page
    // assert name and email appear in the output
  }
))
```


---

## Phase 3 Design

### Overview

Phase 3 implements the complete Prisma schema for all core LMS entities. The schema is documented in `prisma/schema.prisma` and covers: Organization, User (extended), Course, Module, Lesson, Quiz, QuizQuestion, Enrollment, LessonProgress, PhishingCampaign, and PhishingAttempt. All models include proper foreign key relationships, cascade delete rules, performance indexes, and unique constraints. A comprehensive seed script populates realistic development data. The design is covered in detail in the task descriptions for tasks 25–31.

---

## Phase 4 Design

### Overview

Phase 4 builds the core LMS UI and business logic on top of the Phase 3 schema. It introduces five feature groups:

1. **Course Management (Admin)** — CRUD for courses, modules, and lessons with reordering.
2. **Learner Course Browsing & Enrollment** — Catalog, course detail, and self-enrollment.
3. **Lesson Viewer** — Type-aware rendering for VIDEO, TEXT/READING, and QUIZ lessons.
4. **Progress Tracking** — Automatic progress recalculation and dashboard display.
5. **Phishing Campaign Management (Admin)** — Campaign CRUD and attempt statistics.

All features follow the established patterns: Server Components for data fetching, Server Actions for mutations, Client Components only where interactivity is required, and strict multi-tenant scoping via `organizationId`.

---

### Architecture

```
Browser
  │
  ▼
Edge Middleware (existing — no changes)
  │
  ├─ /admin/**  ──► Admin Route Group
  │     ├─ /admin/courses                    Server Component (list)
  │     ├─ /admin/courses/new                Server Component + Client Form
  │     ├─ /admin/courses/[courseId]         Server Component (edit)
  │     ├─ /admin/courses/[courseId]/modules Server Component (module editor)
  │     ├─ /admin/courses/[courseId]/stats   Server Component (completion stats)
  │     └─ /admin/campaigns                  Server Component (list + detail)
  │
  └─ /learner/**  ──► Learner Route Group
        ├─ /learner/courses                  Server Component (catalog)
        ├─ /learner/courses/[courseId]       Server Component (detail + enroll)
        └─ /learner/courses/[courseId]/lessons/[lessonId]
                                             Server Component + Client Components
                                             (video player, quiz form)
```

**Data flow for mutations:**

```
Client Component (form/button)
  │  calls Server Action
  ▼
src/actions/{domain}.ts
  ├─ auth() → derive userId + organizationId
  ├─ validate input
  ├─ prisma.{model}.{operation}({ where: { organizationId }, ... })
  └─ revalidatePath() → triggers Server Component re-render
```

---

### Pure Functions

Phase 4 introduces several pure calculation functions that are extracted into `src/lib/` for testability:

#### `calculateProgressPercentage(completedLessons: number, totalLessons: number): number`

```typescript
// src/lib/progress.ts
export function calculateProgressPercentage(
  completedLessons: number,
  totalLessons: number
): number {
  if (totalLessons === 0) return 0
  return Math.floor((completedLessons / totalLessons) * 100)
}
```

**Invariants:**
- Result is always an integer in [0, 100].
- `completedLessons = 0` → 0.
- `completedLessons = totalLessons` → 100.
- `totalLessons = 0` → 0 (guard against division by zero).

#### `calculateQuizScore(correctAnswers: number, totalQuestions: number): number`

```typescript
// src/lib/quiz.ts
export function calculateQuizScore(
  correctAnswers: number,
  totalQuestions: number
): number {
  if (totalQuestions === 0) return 0
  return Math.round((correctAnswers / totalQuestions) * 100)
}
```

**Invariants:**
- Result is always an integer in [0, 100].
- `correctAnswers = 0` → 0.
- `correctAnswers = totalQuestions` → 100.

#### `isQuizPassing(score: number, passingScore: number): boolean`

```typescript
// src/lib/quiz.ts
export function isQuizPassing(score: number, passingScore: number): boolean {
  return score >= passingScore
}
```

**Invariants:**
- `score >= passingScore` → true.
- `score < passingScore` → false.

#### `calculateAttemptRate(count: number, totalRecipients: number): number`

```typescript
// src/lib/campaigns.ts
export function calculateAttemptRate(
  count: number,
  totalRecipients: number
): number {
  if (totalRecipients === 0) return 0
  return Math.floor((count / totalRecipients) * 100)
}
```

**Invariants:**
- Result is always an integer in [0, 100].
- `totalRecipients = 0` → 0.

#### `reorderItems<T extends { order: number }>(items: T[], fromIndex: number, toIndex: number): T[]`

```typescript
// src/lib/reorder.ts
export function reorderItems<T extends { order: number }>(
  items: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  const result = [...items]
  const [moved] = result.splice(fromIndex, 1)
  result.splice(toIndex, 0, moved)
  return result.map((item, index) => ({ ...item, order: index + 1 }))
}
```

**Invariants:**
- Output length equals input length (no items lost or duplicated).
- `fromIndex === toIndex` → output is identical to input (order values unchanged).
- Output `order` values are a contiguous sequence starting at 1.

---

### Component Interfaces

#### Server Actions

```typescript
// src/actions/courses.ts
export async function createCourse(data: {
  title: string
  description?: string
  coverImageUrl?: string
}): Promise<{ courseId: string }>

export async function updateCourse(
  courseId: string,
  data: { title?: string; description?: string; coverImageUrl?: string }
): Promise<void>

export async function publishCourse(courseId: string): Promise<void>
export async function unpublishCourse(courseId: string): Promise<void>
export async function deleteCourse(courseId: string): Promise<void>

export async function createModule(
  courseId: string,
  data: { title: string; description?: string }
): Promise<{ moduleId: string }>

export async function updateModule(
  moduleId: string,
  data: { title?: string; description?: string }
): Promise<void>

export async function deleteModule(moduleId: string): Promise<void>

export async function reorderModules(
  courseId: string,
  orderedModuleIds: string[]
): Promise<void>

export async function createLesson(
  moduleId: string,
  data: {
    title: string
    type: LessonType
    content?: string
    videoUrl?: string
    durationMinutes?: number
  }
): Promise<{ lessonId: string }>

export async function updateLesson(
  lessonId: string,
  data: {
    title?: string
    content?: string
    videoUrl?: string
    durationMinutes?: number
  }
): Promise<void>

export async function deleteLesson(lessonId: string): Promise<void>

export async function reorderLessons(
  moduleId: string,
  orderedLessonIds: string[]
): Promise<void>
```

```typescript
// src/actions/enrollments.ts
export async function enrollInCourse(courseId: string): Promise<void>

export async function completeLessonAndUpdateProgress(
  enrollmentId: string,
  lessonId: string
): Promise<{ newProgressPercentage: number }>
```

```typescript
// src/actions/campaigns.ts
export async function createCampaign(data: {
  title: string
  description?: string
}): Promise<{ campaignId: string }>

export async function transitionCampaignStatus(
  campaignId: string,
  newStatus: CampaignStatus
): Promise<void>
```

#### Key Server Components

```typescript
// src/app/(admin)/admin/courses/page.tsx
// Fetches: prisma.course.findMany({ where: { organizationId } })
// Renders: CourseList with create button

// src/app/(admin)/admin/courses/[courseId]/page.tsx
// Fetches: course with modules and lessons
// Renders: CourseEditor (title/description form) + ModuleList

// src/app/(admin)/admin/courses/[courseId]/stats/page.tsx
// Fetches: enrollment count, completion count
// Renders: StatsCard components

// src/app/(learner)/learner/courses/page.tsx
// Fetches: published courses for org, with enrollment status for current user
// Renders: CourseCard grid

// src/app/(learner)/learner/courses/[courseId]/page.tsx
// Fetches: course detail + enrollment status
// Renders: CourseDetail + EnrollButton or ContinueLearningButton

// src/app/(learner)/learner/courses/[courseId]/lessons/[lessonId]/page.tsx
// Fetches: lesson + enrollment + lessonProgress
// Renders: LessonViewer (type-specific) + prev/next navigation
```

#### Key Client Components

```typescript
// src/components/courses/CourseForm.tsx
// 'use client' — manages form state for create/edit course

// src/components/courses/ModuleList.tsx
// 'use client' — drag-and-drop reordering, calls reorderModules action

// src/components/courses/LessonList.tsx
// 'use client' — drag-and-drop reordering, calls reorderLessons action

// src/components/lessons/VideoPlayer.tsx
// 'use client' — iframe/video element, fires completeLessonAndUpdateProgress on end

// src/components/lessons/QuizForm.tsx
// 'use client' — manages answer selection state, calculates score on submit,
//               calls completeLessonAndUpdateProgress

// src/components/lessons/MarkdownRenderer.tsx
// 'use client' — renders sanitized HTML/Markdown content

// src/components/campaigns/CampaignStatusButton.tsx
// 'use client' — renders next valid transition button, calls transitionCampaignStatus
```

---

### Folder Structure (Phase 4 additions)

```
secura-learn/
├── src/
│   ├── actions/
│   │   ├── courses.ts          # NEW — course/module/lesson CRUD + reorder
│   │   ├── enrollments.ts      # NEW — enroll + complete lesson + progress update
│   │   └── campaigns.ts        # NEW — campaign CRUD + status transitions
│   ├── lib/
│   │   ├── progress.ts         # NEW — calculateProgressPercentage (pure)
│   │   ├── quiz.ts             # NEW — calculateQuizScore, isQuizPassing (pure)
│   │   ├── campaigns.ts        # NEW — calculateAttemptRate (pure)
│   │   └── reorder.ts          # NEW — reorderItems (pure)
│   ├── app/
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── courses/
│   │   │       │   ├── page.tsx                    # NEW — course list
│   │   │       │   ├── new/
│   │   │       │   │   └── page.tsx                # NEW — create course
│   │   │       │   └── [courseId]/
│   │   │       │       ├── page.tsx                # NEW — edit course + modules
│   │   │       │       └── stats/
│   │   │       │           └── page.tsx            # NEW — completion stats
│   │   │       └── campaigns/
│   │   │           ├── page.tsx                    # NEW — campaign list
│   │   │           ├── new/
│   │   │           │   └── page.tsx                # NEW — create campaign
│   │   │           └── [campaignId]/
│   │   │               └── page.tsx                # NEW — campaign detail + stats
│   │   └── (learner)/
│   │       └── learner/
│   │           └── courses/
│   │               ├── page.tsx                    # NEW — course catalog
│   │               └── [courseId]/
│   │                   ├── page.tsx                # NEW — course detail + enroll
│   │                   └── lessons/
│   │                       └── [lessonId]/
│   │                           └── page.tsx        # NEW — lesson viewer
│   └── components/
│       ├── courses/
│       │   ├── CourseForm.tsx          # NEW — create/edit form (Client)
│       │   ├── CourseCard.tsx          # NEW — catalog card (Server)
│       │   ├── ModuleList.tsx          # NEW — reorderable module list (Client)
│       │   └── LessonList.tsx          # NEW — reorderable lesson list (Client)
│       ├── lessons/
│       │   ├── VideoPlayer.tsx         # NEW — video embed (Client)
│       │   ├── QuizForm.tsx            # NEW — interactive quiz (Client)
│       │   └── MarkdownRenderer.tsx    # NEW — HTML/MD renderer (Client)
│       └── campaigns/
│           ├── CampaignForm.tsx        # NEW — create form (Client)
│           └── CampaignStatusButton.tsx # NEW — status transition (Client)
```

---

### Data Flow: Complete Lesson and Update Progress

```
Learner clicks "Complete" / submits quiz
  │
  ▼
completeLessonAndUpdateProgress(enrollmentId, lessonId)   [Server Action]
  │
  ├─ auth() → verify organizationId ownership of enrollment
  │
  ├─ prisma.lessonProgress.upsert({
  │     where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
  │     update: { completed: true, completedAt: now() },
  │     create: { enrollmentId, lessonId, completed: true, completedAt: now() }
  │   })
  │
  ├─ Count total lessons in course (via enrollment → course → modules → lessons)
  │
  ├─ Count completed lessons for this enrollment
  │
  ├─ newProgress = calculateProgressPercentage(completed, total)
  │
  ├─ prisma.enrollment.update({
  │     where: { id: enrollmentId },
  │     data: {
  │       progressPercentage: newProgress,
  │       completedAt: newProgress === 100 ? now() : null
  │     }
  │   })
  │
  └─ revalidatePath('/learner/courses/[courseId]')
     return { newProgressPercentage: newProgress }
```

---

### Campaign Status State Machine

```
DRAFT ──────► SCHEDULED ──────► RUNNING ──────► COMPLETED
```

Only forward transitions are permitted. The `transitionCampaignStatus` Server Action validates the transition before writing:

```typescript
const VALID_TRANSITIONS: Record<CampaignStatus, CampaignStatus | null> = {
  DRAFT: 'SCHEDULED',
  SCHEDULED: 'RUNNING',
  RUNNING: 'COMPLETED',
  COMPLETED: null,
  PAUSED: null,
}
```

---

### Phase 4 Correctness Properties

#### Property 9: Progress percentage is always in [0, 100] for any valid lesson counts

*For any* non-negative integers `completedLessons` and `totalLessons` where `completedLessons ≤ totalLessons`, `calculateProgressPercentage(completedLessons, totalLessons)` SHALL return an integer in the range [0, 100].

**Validates: Requirements 25.1, 25.7**

#### Property 10: Progress percentage is 0 when no lessons are completed

*For any* positive integer `totalLessons`, `calculateProgressPercentage(0, totalLessons)` SHALL return 0.

**Validates: Requirements 25.1**

#### Property 11: Progress percentage is 100 when all lessons are completed

*For any* positive integer `totalLessons`, `calculateProgressPercentage(totalLessons, totalLessons)` SHALL return 100.

**Validates: Requirements 25.1, 25.2**

#### Property 12: Quiz score is always in [0, 100] for any valid answer counts

*For any* non-negative integers `correctAnswers` and `totalQuestions` where `correctAnswers ≤ totalQuestions`, `calculateQuizScore(correctAnswers, totalQuestions)` SHALL return an integer in the range [0, 100].

**Validates: Requirements 24.5**

#### Property 13: Quiz pass/fail is consistent with score and passingScore threshold

*For any* integers `score` in [0, 100] and `passingScore` in [0, 100], `isQuizPassing(score, passingScore)` SHALL return `true` if and only if `score >= passingScore`.

**Validates: Requirements 24.6**

#### Property 14: Reordering preserves all items with no duplicates

*For any* non-empty array of items and valid `fromIndex` and `toIndex` values, `reorderItems(items, fromIndex, toIndex)` SHALL return an array of the same length containing the same items (as a permutation), with `order` values forming a contiguous sequence starting at 1.

**Validates: Requirements 22.8**

#### Property 15: Attempt rate is always in [0, 100] for any valid counts

*For any* non-negative integers `count` and `totalRecipients` where `count ≤ totalRecipients`, `calculateAttemptRate(count, totalRecipients)` SHALL return an integer in the range [0, 100].

**Validates: Requirements 26.6**

---

### Phase 4 Testing Strategy

#### Property-Based Tests

| Property | Function | Generator |
|---|---|---|
| P9: Progress in [0,100] | `calculateProgressPercentage` | `fc.nat()` for both args, filter `completed ≤ total` |
| P10: Progress 0 when none complete | `calculateProgressPercentage` | `fc.nat({ min: 1 })` for total |
| P11: Progress 100 when all complete | `calculateProgressPercentage` | `fc.nat({ min: 1 })` for total |
| P12: Quiz score in [0,100] | `calculateQuizScore` | `fc.nat()` for both args, filter `correct ≤ total` |
| P13: Pass/fail consistent with threshold | `isQuizPassing` | `fc.integer({ min: 0, max: 100 })` for both |
| P14: Reorder preserves items | `reorderItems` | `fc.array(fc.record({...}))`, valid index pair |
| P15: Attempt rate in [0,100] | `calculateAttemptRate` | `fc.nat()` for both args, filter `count ≤ total` |

#### Unit Tests

- `createCourse` action: creates record with correct `organizationId`, rejects empty title.
- `publishCourse` / `unpublishCourse`: toggles `isPublished` correctly.
- `deleteCourse`: cascade-deletes modules and lessons.
- `enrollInCourse`: creates `Enrollment` with `progressPercentage = 0`.
- `enrollInCourse` duplicate: returns error without creating duplicate.
- `completeLessonAndUpdateProgress`: upserts `LessonProgress`, recalculates progress, sets `completedAt` when 100%.
- `transitionCampaignStatus`: allows valid transitions, rejects invalid ones.
- Course catalog page: only shows published courses from the learner's org.
- Lesson viewer: redirects unenrolled learner to course detail page.

#### Test File Organization (Phase 4 additions)

```
src/__tests__/
├── lib/
│   ├── progress.test.ts          # P9, P10, P11 + unit tests
│   ├── quiz.test.ts              # P12, P13 + unit tests
│   ├── campaigns.test.ts         # P15 + unit tests
│   └── reorder.test.ts           # P14 + unit tests
├── actions/
│   ├── courses.test.ts           # Server Action unit tests
│   ├── enrollments.test.ts       # Server Action unit tests
│   └── campaigns.test.ts         # Server Action unit tests
└── pages/
    ├── admin-courses.test.tsx     # Page rendering tests
    ├── learner-catalog.test.tsx   # Page rendering tests
    └── lesson-viewer.test.tsx     # Page rendering tests
```


---

## Phase 5 Design

### Overview

Phase 5 adds four feature groups on top of the existing Phase 4 foundation:

1. **User Management (Admin)** — List all org users, change roles, view individual user detail with enrollments.
2. **Analytics Dashboard (Admin)** — Org-wide stats: users, courses, enrollments, completion rate, per-course table, phishing summary.
3. **Learner Progress Dashboard** — Dedicated `/learner/progress` page with all enrollments, progress bars, quiz scores.
4. **Badges** — Derive badges from completed enrollments; `/learner/badges` page; badge count on learner dashboard.

All features follow the established patterns: Server Components for data fetching, Server Actions for mutations, Client Components only where interactivity is required, strict multi-tenant scoping via `organizationId`, and the orange color theme throughout.

---

### Architecture

```
Browser
  │
  ├─ /admin/users                    Server Component (user list)
  ├─ /admin/users/[userId]           Server Component (user detail)
  ├─ /admin/analytics                Server Component (org stats)
  ├─ /learner/progress               Server Component (progress dashboard)
  └─ /learner/badges                 Server Component (badges gallery)
```

---

### Pure Functions (Phase 5)

#### `calculateOrgCompletionRate(completedEnrollments: number, totalEnrollments: number): number`

```typescript
// src/lib/analytics.ts
export function calculateOrgCompletionRate(
  completedEnrollments: number,
  totalEnrollments: number
): number {
  if (totalEnrollments === 0) return 0
  return Math.floor((completedEnrollments / totalEnrollments) * 100)
}
```

**Invariants:**
- Result is always an integer in [0, 100].
- `totalEnrollments = 0` → 0 (guard against division by zero).
- `completedEnrollments = totalEnrollments` → 100.

#### `calculateAvgClickRate(totalClicked: number, totalAttempts: number): number`

```typescript
// src/lib/analytics.ts
export function calculateAvgClickRate(
  totalClicked: number,
  totalAttempts: number
): number {
  if (totalAttempts === 0) return 0
  return Math.floor((totalClicked / totalAttempts) * 100)
}
```

**Invariants:**
- Result is always an integer in [0, 100].
- `totalAttempts = 0` → 0.

---

### Server Actions (Phase 5)

#### `changeUserRole` in `src/actions/user.ts`

```typescript
export async function changeUserRole(
  targetUserId: string,
  newRole: Role
): Promise<void>
```

- Calls `auth()`, derives `organizationId`.
- Fetches the target user; verifies `user.organizationId === organizationId`.
- Prevents self-role-change: if `targetUserId === currentUser.id`, throws an error.
- `prisma.user.update({ where: { id: targetUserId }, data: { role: newRole } })`.
- `revalidatePath('/admin/users')`.

---

### Component Interfaces

#### Server Components

```typescript
// /admin/users — lists all users in org
// Fetches: prisma.user.findMany({ where: { organizationId }, include: { _count: { select: { enrollments: true } } } })
// Renders: UserTable with role change controls

// /admin/users/[userId] — user detail
// Fetches: user + enrollments with course data
// Renders: UserProfile + EnrollmentList

// /admin/analytics — org-wide stats
// Fetches: user count, course count, enrollment counts, phishing stats
// Renders: StatCards + CourseTable + PhishingStats

// /learner/progress — learner's enrolled courses
// Fetches: enrollments with course + lessonProgress + quiz scores
// Renders: ProgressCard per enrollment

// /learner/badges — earned badges
// Fetches: enrollments where completedAt IS NOT NULL
// Renders: BadgeCard per completed enrollment
```

#### Client Components

```typescript
// src/components/users/RoleChangeForm.tsx
// 'use client' — select dropdown for role, calls changeUserRole Server Action
```

---

### Folder Structure (Phase 5 additions)

```
secura-learn/
├── src/
│   ├── actions/
│   │   └── user.ts                    # UPDATED — add changeUserRole
│   ├── lib/
│   │   └── analytics.ts               # NEW — calculateOrgCompletionRate, calculateAvgClickRate
│   ├── app/
│   │   ├── (admin)/
│   │   │   └── admin/
│   │   │       ├── users/
│   │   │       │   ├── page.tsx                    # NEW — user list
│   │   │       │   └── [userId]/
│   │   │       │       └── page.tsx                # NEW — user detail
│   │   │       └── analytics/
│   │   │           └── page.tsx                    # NEW — analytics dashboard
│   │   └── (learner)/
│   │       └── learner/
│   │           ├── progress/
│   │           │   └── page.tsx                    # NEW — progress dashboard
│   │           └── badges/
│   │               └── page.tsx                    # NEW — badges gallery
│   └── components/
│       └── users/
│           └── RoleChangeForm.tsx                  # NEW — role change (Client)
```

---

### Data Queries

#### Analytics Page

```typescript
// All scoped to organizationId
const [userCount, courseCount, enrollmentStats, phishingStats] = await Promise.all([
  prisma.user.count({ where: { organizationId } }),
  prisma.course.count({ where: { organizationId } }),
  prisma.enrollment.aggregate({
    where: { course: { organizationId } },
    _count: { id: true },
  }),
  // completed enrollments
  prisma.enrollment.count({
    where: { course: { organizationId }, completedAt: { not: null } },
  }),
])

// Per-course stats
const courses = await prisma.course.findMany({
  where: { organizationId },
  include: {
    _count: { select: { enrollments: true } },
    enrollments: { where: { completedAt: { not: null } }, select: { id: true } },
  },
})

// Phishing stats
const campaigns = await prisma.phishingCampaign.findMany({
  where: { organizationId },
  include: { _count: { select: { attempts: true } } },
})
const totalAttempts = await prisma.phishingAttempt.count({
  where: { campaign: { organizationId } },
})
const totalClicked = await prisma.phishingAttempt.count({
  where: { campaign: { organizationId }, clicked: true },
})
```

#### Learner Progress Page

```typescript
const enrollments = await prisma.enrollment.findMany({
  where: { userId: dbUser.id },
  include: {
    course: { select: { id: true, title: true } },
    lessonProgress: {
      where: { completed: true },
      include: { lesson: { select: { id: true, title: true, type: true } } },
    },
  },
  orderBy: { enrolledAt: 'desc' },
})
```

#### Badges Page

```typescript
const completedEnrollments = await prisma.enrollment.findMany({
  where: { userId: dbUser.id, completedAt: { not: null } },
  include: { course: { select: { id: true, title: true } } },
  orderBy: { completedAt: 'desc' },
})
```

---

### Phase 5 Correctness Properties

#### Property 16: Org completion rate is always in [0, 100]

*For any* non-negative integers `completedEnrollments` and `totalEnrollments` where `completedEnrollments ≤ totalEnrollments`, `calculateOrgCompletionRate(completedEnrollments, totalEnrollments)` SHALL return an integer in the range [0, 100].

**Validates: Requirements 32.7**

#### Property 17: Avg click rate is always in [0, 100]

*For any* non-negative integers `totalClicked` and `totalAttempts` where `totalClicked ≤ totalAttempts`, `calculateAvgClickRate(totalClicked, totalAttempts)` SHALL return an integer in the range [0, 100].

**Validates: Requirements 32.8**

---

### Phase 5 Testing Strategy

#### Property-Based Tests

| Property | Function | Generator |
|---|---|---|
| P16: Org completion rate in [0,100] | `calculateOrgCompletionRate` | `fc.nat()` for both args, filter `completed ≤ total` |
| P17: Avg click rate in [0,100] | `calculateAvgClickRate` | `fc.nat()` for both args, filter `clicked ≤ total` |

#### Unit Tests

- `changeUserRole`: updates role for valid user in same org.
- `changeUserRole`: rejects update for user in different org.
- `changeUserRole`: rejects self-role-change.
- Analytics page: all counts are scoped to org.
- Badges page: only shows enrollments with `completedAt IS NOT NULL`.
