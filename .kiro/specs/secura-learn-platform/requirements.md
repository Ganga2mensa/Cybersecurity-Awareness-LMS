# Requirements Document

## Introduction

SecuraLearn is a full-stack Security Awareness Training Platform (Phase 1) built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Clerk (authentication + multi-tenancy), and Prisma ORM with PostgreSQL (Supabase). Phase 1 establishes the project foundation: scaffolding, authentication, multi-tenant organization support, protected routing, and a public landing page. Subsequent phases will add courses, phishing simulations, analytics, and learner features.

The platform serves two primary user roles:
- **Admin**: Belongs to an organization; manages users, courses, and campaigns.
- **Learner**: Belongs to an organization; takes courses, receives phishing simulations, tracks progress.

---

## Glossary

- **Platform**: The SecuraLearn application as a whole.
- **Admin**: An authenticated user with administrative privileges within an Organization.
- **Learner**: An authenticated user enrolled in training within an Organization.
- **Organization**: A tenant unit (company or team) managed via Clerk Organizations.
- **Middleware**: Next.js Edge Middleware responsible for route protection and redirection.
- **Landing_Page**: The public-facing marketing/entry page at the root route (`/`).
- **Auth_Flow**: The Clerk-powered sign-in and sign-up experience.
- **Dashboard**: The post-login home screen, differentiated by role (Admin or Learner).
- **Env_File**: The `.env.example` file listing all required environment variables.
- **Prisma_Client**: The generated Prisma ORM client used for all database interactions.
- **Server_Action**: A Next.js Server Action function that runs exclusively on the server.
- **Server_Component**: A Next.js React Server Component that renders on the server.

---

## Requirements

### Requirement 1: Project Scaffolding and Toolchain Setup

**User Story:** As a developer, I want a properly initialized Next.js 15 project with all required dependencies configured, so that the team can begin building features on a consistent, reproducible foundation.

#### Acceptance Criteria

1. THE Platform SHALL be initialized as a Next.js 15 project using the App Router with TypeScript in strict mode.
2. THE Platform SHALL include Tailwind CSS configured with a `tailwind.config.ts` file and a global CSS entry point.
3. THE Platform SHALL include shadcn/ui initialized with Radix UI primitives and a `components.json` configuration file.
4. THE Platform SHALL include Prisma ORM configured with a `schema.prisma` file targeting a PostgreSQL provider.
5. THE Platform SHALL include a `tsconfig.json` with `strict: true` and path aliases (`@/*` mapped to `./src/*`).
6. THE Platform SHALL include an `.env.example` file listing every required environment variable with descriptive placeholder values and inline comments.
7. WHEN a developer runs `npm install`, THE Platform SHALL install all declared dependencies without errors.
8. WHEN a developer runs `npm run dev`, THE Platform SHALL start the development server without TypeScript or build errors.

---

### Requirement 2: Environment Variable Management

**User Story:** As a developer, I want a documented `.env.example` file, so that any team member can configure a local environment without guessing required secrets.

#### Acceptance Criteria

1. THE Env_File SHALL include a `DATABASE_URL` variable with a placeholder Supabase PostgreSQL connection string.
2. THE Env_File SHALL include `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` variables for Clerk authentication.
3. THE Env_File SHALL include `NEXT_PUBLIC_CLERK_SIGN_IN_URL`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL`, `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL`, and `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` variables for Clerk redirect configuration.
4. THE Env_File SHALL include a `NEXT_PUBLIC_APP_URL` variable for the canonical application URL.
5. THE Env_File SHALL include a `SUPABASE_URL` and `SUPABASE_ANON_KEY` variable for future Supabase Storage integration.
6. WHEN a developer copies `.env.example` to `.env.local`, THE Platform SHALL recognize all variables without additional configuration.

---

### Requirement 3: Clerk Authentication Integration

**User Story:** As a user, I want to sign up and sign in securely, so that my identity is verified before I access any protected content.

#### Acceptance Criteria

1. THE Platform SHALL integrate Clerk as the sole authentication provider using `@clerk/nextjs`.
2. WHEN an unauthenticated user navigates to a protected route, THE Middleware SHALL redirect the user to the sign-in page.
3. WHEN an authenticated user navigates to the sign-in or sign-up page, THE Middleware SHALL redirect the user to the appropriate dashboard.
4. THE Auth_Flow SHALL use Clerk's hosted or embedded components (`<SignIn />`, `<SignUp />`) rendered at `/sign-in` and `/sign-up` routes respectively.
5. THE Platform SHALL wrap the root layout with `<ClerkProvider>` so that authentication state is available to all Server and Client Components.
6. IF Clerk returns an authentication error, THEN THE Auth_Flow SHALL display a descriptive error message to the user.

---

### Requirement 4: Multi-Tenant Organization Support

**User Story:** As an organization administrator, I want my company to be isolated from other companies on the platform, so that our training data and users remain private.

#### Acceptance Criteria

1. THE Platform SHALL use Clerk Organizations as the multi-tenancy mechanism, where each Organization maps to one tenant.
2. WHEN a new user signs up, THE Auth_Flow SHALL prompt the user to create or join an Organization before accessing the Dashboard.
3. THE Middleware SHALL enforce that authenticated users belong to an active Organization before granting access to admin or learner routes.
4. THE Platform SHALL expose the active Organization ID via Clerk's `auth()` helper in Server Components and Server Actions for all data-scoping operations.
5. WHERE an Organization has the Admin role configured, THE Platform SHALL grant access to admin-only routes under `/admin`.
6. WHERE an Organization has the Learner role configured, THE Platform SHALL grant access to learner-only routes under `/learn`.

---

### Requirement 5: Protected Route Structure

**User Story:** As a platform operator, I want routes to be protected by role and authentication state, so that users can only access content appropriate to their role.

#### Acceptance Criteria

1. THE Middleware SHALL protect all routes under `/admin/**` and `/learn/**` from unauthenticated access.
2. THE Middleware SHALL protect all routes under `/admin/**` from users who do not hold the Admin role within their Organization.
3. THE Middleware SHALL protect all routes under `/learn/**` from users who do not hold the Learner role within their Organization.
4. THE Platform SHALL define public routes (`/`, `/sign-in`, `/sign-up`, `/api/webhooks/**`) that THE Middleware SHALL allow without authentication.
5. WHEN an authenticated user with the Admin role navigates to `/`, THE Middleware SHALL redirect the user to `/admin/dashboard`.
6. WHEN an authenticated user with the Learner role navigates to `/`, THE Middleware SHALL redirect the user to `/learn/dashboard`.
7. IF a user attempts to access a route outside their role, THEN THE Middleware SHALL redirect the user to a `/unauthorized` page.

---

### Requirement 6: Folder Structure and Code Organization

**User Story:** As a developer, I want a clear, scalable folder structure, so that features can be added in Phase 2 and beyond without restructuring the project.

#### Acceptance Criteria

1. THE Platform SHALL organize all application source code under a `src/` directory.
2. THE Platform SHALL place Next.js App Router pages and layouts under `src/app/`.
3. THE Platform SHALL separate admin routes under `src/app/(admin)/` and learner routes under `src/app/(learner)/` using route groups.
4. THE Platform SHALL place reusable UI components under `src/components/ui/` (shadcn/ui primitives) and `src/components/` (shared custom components).
5. THE Platform SHALL place Prisma schema and client initialization under `prisma/` and `src/lib/prisma.ts` respectively.
6. THE Platform SHALL place Server Actions under `src/actions/` organized by domain (e.g., `src/actions/user.ts`).
7. THE Platform SHALL place utility functions under `src/lib/` and type definitions under `src/types/`.
8. THE Platform SHALL place the Next.js Middleware at `src/middleware.ts`.

---

### Requirement 7: Prisma ORM and Database Schema (Phase 1 Baseline)

**User Story:** As a developer, I want a Prisma schema with baseline models, so that the database is ready for Phase 2 feature development.

#### Acceptance Criteria

1. THE Prisma_Client SHALL be configured with a singleton pattern in `src/lib/prisma.ts` to prevent connection pool exhaustion in development.
2. THE Platform SHALL define a `User` model in `schema.prisma` with fields: `id` (cuid), `clerkId` (unique string), `email` (unique string), `name` (optional string), `role` (enum: ADMIN, LEARNER), `organizationId` (string), `createdAt`, `updatedAt`.
3. THE Platform SHALL define an `Organization` model in `schema.prisma` with fields: `id` (cuid), `clerkOrgId` (unique string), `name` (string), `createdAt`, `updatedAt`.
4. WHEN a developer runs `npx prisma generate`, THE Prisma_Client SHALL be generated without errors.
5. WHEN a developer runs `npx prisma db push`, THE Platform SHALL apply the schema to the configured PostgreSQL database without errors.
6. THE Platform SHALL include a `prisma/seed.ts` file with a no-op seed function as a placeholder for Phase 2 seed data.

---

### Requirement 8: Public Landing Page

**User Story:** As a visitor, I want to see a professional landing page when I navigate to the platform, so that I understand what SecuraLearn offers and can navigate to sign in or sign up.

#### Acceptance Criteria

1. THE Landing_Page SHALL be rendered as a Server_Component at the `/` route.
2. THE Landing_Page SHALL include a navigation bar with the SecuraLearn logo/brand name, a "Sign In" link, and a "Get Started" call-to-action button.
3. THE Landing_Page SHALL include a hero section with a headline, a supporting subheadline describing the platform's value proposition, and a primary call-to-action button linking to `/sign-up`.
4. THE Landing_Page SHALL include a features section highlighting at least three key platform capabilities (e.g., interactive courses, phishing simulations, analytics).
5. THE Landing_Page SHALL include a footer with the platform name and copyright notice.
6. THE Landing_Page SHALL be fully responsive across mobile (≥ 320px), tablet (≥ 768px), and desktop (≥ 1280px) viewport widths.
7. THE Landing_Page SHALL achieve a Lighthouse performance score of 90 or above when measured in production mode.
8. WHEN a visitor clicks "Sign In", THE Landing_Page SHALL navigate the visitor to `/sign-in`.
9. WHEN a visitor clicks "Get Started" or the hero CTA, THE Landing_Page SHALL navigate the visitor to `/sign-up`.

---

### Requirement 9: Admin Dashboard Placeholder

**User Story:** As an admin, I want to see a dashboard after signing in, so that I know I have successfully authenticated and can navigate to platform features in future phases.

#### Acceptance Criteria

1. THE Dashboard SHALL be rendered as a Server_Component at `/admin/dashboard`.
2. THE Dashboard SHALL display the authenticated admin's name and Organization name retrieved via Clerk's `auth()` and `currentUser()` helpers.
3. THE Dashboard SHALL include a sidebar navigation placeholder with links for future sections: Courses, Users, Phishing Campaigns, and Analytics.
4. THE Dashboard SHALL be accessible only to authenticated users with the Admin role, enforced by THE Middleware.

---

### Requirement 10: Learner Dashboard Placeholder

**User Story:** As a learner, I want to see a dashboard after signing in, so that I know I have successfully authenticated and can see my training overview in future phases.

#### Acceptance Criteria

1. THE Dashboard SHALL be rendered as a Server_Component at `/learn/dashboard`.
2. THE Dashboard SHALL display the authenticated learner's name and Organization name retrieved via Clerk's `auth()` and `currentUser()` helpers.
3. THE Dashboard SHALL include a navigation placeholder with links for future sections: My Courses, Badges, and Progress.
4. THE Dashboard SHALL be accessible only to authenticated users with the Learner role, enforced by THE Middleware.

---

### Requirement 11: Unauthorized and Not-Found Pages

**User Story:** As a user, I want clear feedback when I navigate to a page I cannot access or that does not exist, so that I understand what happened and can take corrective action.

#### Acceptance Criteria

1. THE Platform SHALL render a custom 404 page at `src/app/not-found.tsx` with a message and a link back to the Landing_Page.
2. THE Platform SHALL render an `/unauthorized` page explaining that the user lacks permission, with a link to sign in or return to the Landing_Page.
3. IF THE Middleware redirects a user to `/unauthorized`, THEN THE Platform SHALL return an HTTP 403 status code for that page.
