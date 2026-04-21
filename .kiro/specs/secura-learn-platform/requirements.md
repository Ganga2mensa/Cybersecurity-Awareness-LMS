# Requirements Document

## Introduction

SecuraLearn is a full-stack Security Awareness Training Platform built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Clerk (authentication + multi-tenancy), and Prisma ORM with PostgreSQL (Supabase). Phase 1 establishes the project foundation: scaffolding, authentication, multi-tenant organization support, protected routing, and a public landing page. Phase 2 bridges Clerk identity with the Prisma database via webhooks and server actions, and adds user profile pages. Phase 3 implements a complete database schema with all core LMS entities: courses, modules, lessons, quizzes, enrollments, progress tracking, and phishing campaigns. Subsequent phases will add the UI and business logic for these features.

The platform serves three primary user roles:
- **Admin**: Belongs to an organization; manages users, courses, and campaigns with full administrative privileges.
- **Manager**: Belongs to an organization; has management privileges for specific areas (between Admin and Learner).
- **Learner**: Belongs to an organization; takes courses, receives phishing simulations, tracks progress.

---

## Glossary

- **Platform**: The SecuraLearn application as a whole.
- **Admin**: An authenticated user with administrative privileges within an Organization.
- **Learner**: An authenticated user enrolled in training within an Organization.
- **Manager**: An authenticated user with management privileges within an Organization (between Admin and Learner).
- **Organization**: A tenant unit (company or team) managed via Clerk Organizations.
- **Middleware**: Next.js Edge Middleware responsible for route protection and redirection.
- **Landing_Page**: The public-facing marketing/entry page at the root route (`/`).
- **Auth_Flow**: The Clerk-powered sign-in and sign-up experience.
- **Dashboard**: The post-login home screen, differentiated by role (Admin or Learner).
- **Env_File**: The `.env.example` file listing all required environment variables.
- **Prisma_Client**: The generated Prisma ORM client used for all database interactions.
- **Server_Action**: A Next.js Server Action function that runs exclusively on the server.
- **Server_Component**: A Next.js React Server Component that renders on the server.
- **Course**: A structured learning path containing multiple modules and lessons.
- **Module**: A logical grouping of lessons within a course.
- **Lesson**: An individual learning unit (video, text, quiz, reading, or SCORM content).
- **Quiz**: An assessment associated with a lesson, containing multiple questions.
- **Enrollment**: A user's registration and progress tracking for a specific course.
- **PhishingCampaign**: A simulated phishing attack sent to users for security awareness training.
- **RLS**: Row Level Security - Supabase's database-level access control mechanism.

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

---

## Phase 2 Requirements

### Requirement 12: Clerk-to-Database User Sync

**User Story:** As a platform operator, I want Clerk identity events to be automatically reflected in the Prisma database, so that application data (courses, progress, campaigns) can be scoped to real user and organization records.

#### Acceptance Criteria

1. THE Platform SHALL expose a webhook endpoint at `/api/webhooks/clerk` that verifies incoming requests using the Svix signature verification library and the `CLERK_WEBHOOK_SECRET` environment variable.
2. WHEN Clerk emits a `user.created` event, THE webhook handler SHALL upsert a `User` record in Prisma using the Clerk user ID, primary email address, and full name.
3. WHEN Clerk emits an `organization.created` event, THE webhook handler SHALL upsert an `Organization` record in Prisma using the Clerk organization ID and name.
4. WHEN Clerk emits an `organizationMembership.created` event, THE webhook handler SHALL link the corresponding `User` to the corresponding `Organization` in Prisma and set the `role` field based on the Clerk organization role (`org:admin` → `ADMIN`, `org:learner` → `LEARNER`).
5. THE Platform SHALL implement a `syncUserToDatabase()` Server Action in `src/actions/user.ts` that upserts the current authenticated user and their active organization into Prisma on dashboard load, serving as a fallback for missed webhook events.
6. THE Env_File SHALL include a `CLERK_WEBHOOK_SECRET` variable with a placeholder value and an inline comment explaining where to obtain it.

---

### Requirement 13: User Profile Pages

**User Story:** As an authenticated user, I want to view and update my profile information, so that I can confirm my account details and keep my display name current.

#### Acceptance Criteria

1. THE Platform SHALL render an admin profile page as a Server_Component at `/admin/profile`.
2. THE Platform SHALL render a learner profile page as a Server_Component at `/learner/profile`.
3. BOTH profile pages SHALL display the user's full name, email address, organization name, and role, sourced from the Prisma database (synced from Clerk).
4. BOTH profile pages SHALL include an edit form (Client Component) that allows the user to update their display name via a Server_Action.
5. THE admin sidebar SHALL include a "Profile" navigation link pointing to `/admin/profile`.
6. THE learner top nav SHALL include a "Profile" navigation link pointing to `/learner/profile`.

---

### Requirement 14: Database Health

**User Story:** As a platform operator, I want the platform to verify its database connection on startup and handle failures gracefully, so that misconfiguration is caught early and users see a meaningful error rather than a crash.

#### Acceptance Criteria

1. THE Platform SHALL verify that Prisma can connect to the Supabase PostgreSQL database on startup or first request.
2. IF the database connection fails, THEN THE Platform SHALL handle the error with a graceful error boundary rather than an unhandled 500 crash.

---

## Phase 3 Requirements

### Requirement 15: Core Data Models Schema Design

**User Story:** As a developer, I want a complete, production-ready Prisma schema with all core LMS entities and proper relationships, so that the platform can support courses, lessons, quizzes, enrollments, progress tracking, and phishing campaigns.

#### Acceptance Criteria

1. THE Platform SHALL define an `Organization` model with fields: `id` (cuid), `clerkOrgId` (unique), `name`, `slug` (unique), `logoUrl` (optional), `createdAt`, `updatedAt`.
2. THE Platform SHALL define a `User` model with fields: `id` (cuid), `clerkUserId` (unique), `organizationId`, `role` (enum: ADMIN/LEARNER/MANAGER), `firstName`, `lastName`, `email`, `avatarUrl` (optional), `createdAt`, `updatedAt`.
3. THE Platform SHALL define a `Course` model with fields: `id` (cuid), `organizationId`, `title`, `description`, `coverImageUrl` (optional), `isPublished` (boolean), `createdById`, `createdAt`, `updatedAt`.
4. THE Platform SHALL define a `Module` model with fields: `id` (cuid), `courseId`, `title`, `description`, `order` (integer), `createdAt`, `updatedAt`.
5. THE Platform SHALL define a `Lesson` model with fields: `id` (cuid), `moduleId`, `title`, `type` (enum: VIDEO/TEXT/QUIZ/READING/SCORM), `content` (text), `videoUrl` (optional), `durationMinutes` (optional integer), `order` (integer), `createdAt`, `updatedAt`.
6. THE Platform SHALL define a `Quiz` model with fields: `id` (cuid), `lessonId` (unique), `title`, `passingScore` (integer, default 80), `createdAt`.
7. THE Platform SHALL define a `QuizQuestion` model with fields: `id` (cuid), `quizId`, `questionText`, `options` (Json), `order` (integer).
8. THE Platform SHALL define an `Enrollment` model with fields: `id` (cuid), `userId`, `courseId`, `enrolledAt`, `completedAt` (optional), `progressPercentage` (integer, default 0).
9. THE Platform SHALL define a `LessonProgress` model with fields: `id` (cuid), `enrollmentId`, `lessonId`, `completed` (boolean, default false), `completedAt` (optional), `lastAccessedAt` (optional).
10. THE Platform SHALL define a `PhishingCampaign` model with fields: `id` (cuid), `organizationId`, `title`, `description`, `status` (enum: DRAFT/SCHEDULED/RUNNING/COMPLETED/PAUSED), `sentAt` (optional), `createdById`, `createdAt`.
11. THE Platform SHALL define a `PhishingAttempt` model with fields: `id` (cuid), `campaignId`, `userId`, `emailTemplateId` (optional), `clicked` (boolean, default false), `clickedAt` (optional), `reported` (boolean, default false), `reportedAt` (optional), `opened` (boolean, default false).

### Requirement 16: Database Relationships and Constraints

**User Story:** As a developer, I want proper foreign key relationships and constraints between all data models, so that data integrity is maintained and cascading operations work correctly.

#### Acceptance Criteria

1. THE User model SHALL have a relation to Organization with `onDelete: Cascade` to ensure users are removed when their organization is deleted.
2. THE Course model SHALL have relations to Organization and User (createdBy) with appropriate cascade behavior.
3. THE Module model SHALL have a relation to Course with `onDelete: Cascade` to ensure modules are removed when their course is deleted.
4. THE Lesson model SHALL have a relation to Module with `onDelete: Cascade` to ensure lessons are removed when their module is deleted.
5. THE Quiz model SHALL have a unique relation to Lesson with `onDelete: Cascade`.
6. THE QuizQuestion model SHALL have a relation to Quiz with `onDelete: Cascade`.
7. THE Enrollment model SHALL have relations to User and Course with appropriate constraints.
8. THE LessonProgress model SHALL have relations to Enrollment and Lesson with `onDelete: Cascade`.
9. THE PhishingCampaign model SHALL have relations to Organization and User (createdBy).
10. THE PhishingAttempt model SHALL have relations to PhishingCampaign and User with `onDelete: Cascade`.

### Requirement 17: Database Enums and Type Safety

**User Story:** As a developer, I want strongly-typed enums for all categorical data, so that invalid values are prevented at the database and application level.

#### Acceptance Criteria

1. THE Platform SHALL define a `Role` enum with values: `ADMIN`, `LEARNER`, `MANAGER`.
2. THE Platform SHALL define a `LessonType` enum with values: `VIDEO`, `TEXT`, `QUIZ`, `READING`, `SCORM`.
3. THE Platform SHALL define a `CampaignStatus` enum with values: `DRAFT`, `SCHEDULED`, `RUNNING`, `COMPLETED`, `PAUSED`.
4. ALL enum fields in models SHALL reference these defined enums for type safety.

### Requirement 18: Database Performance and Indexing

**User Story:** As a platform operator, I want optimized database queries through proper indexing, so that the application performs well as data volume grows.

#### Acceptance Criteria

1. THE Platform SHALL add indexes on `organizationId` fields for all tenant-scoped models to optimize multi-tenant queries.
2. THE Platform SHALL add indexes on frequently queried foreign key relationships (`userId`, `courseId`, `moduleId`, `lessonId`, `campaignId`).
3. THE Platform SHALL add compound indexes on commonly queried field combinations (e.g., `userId + courseId` for enrollments).
4. THE Platform SHALL add indexes on timestamp fields used for sorting and filtering (`createdAt`, `enrolledAt`, `completedAt`).

### Requirement 19: Supabase RLS Compatibility

**User Story:** As a platform operator, I want the database schema to be compatible with future Supabase Row Level Security implementation, so that data isolation can be enforced at the database level.

#### Acceptance Criteria

1. EVERY tenant-scoped model SHALL include an `organizationId` field for RLS policy filtering.
2. THE Platform SHALL use consistent naming conventions compatible with Supabase RLS policies.
3. THE Platform SHALL structure relationships to support efficient RLS policy evaluation.
4. THE Platform SHALL avoid circular dependencies that could complicate RLS policy implementation.

### Requirement 20: Database Migration and Seeding

**User Story:** As a developer, I want a complete database migration and comprehensive seed data, so that the development environment has realistic test data for all features.

#### Acceptance Criteria

1. THE Platform SHALL generate and apply a Prisma migration named "init" that creates all tables, relationships, and indexes.
2. THE Platform SHALL run `prisma generate` successfully to create TypeScript types for all models.
3. THE Platform SHALL implement a comprehensive `seed.ts` script that creates sample data for all models.
4. THE seed script SHALL create at least 2 organizations, 4 users (2 admins, 2 learners), 3 courses with modules and lessons, sample quizzes, enrollments, progress records, and phishing campaigns.
5. THE Platform SHALL verify the seeded data in Prisma Studio without errors.

### Requirement 21: Database Integration Testing

**User Story:** As a developer, I want to verify that the database schema works correctly with the Next.js application, so that all CRUD operations function properly in the development environment.

#### Acceptance Criteria

1. THE Platform SHALL successfully connect to the database when running `npm run dev`.
2. THE Platform SHALL be able to query all models through the Prisma client without TypeScript errors.
3. THE Platform SHALL handle database operations in Server Actions and API routes without connection issues.
4. THE Platform SHALL maintain referential integrity when creating, updating, and deleting related records.

---

## Phase 4 Requirements

### Requirement 22: Course Management (Admin)

**User Story:** As an admin, I want to create, edit, publish, and delete courses with modules and lessons, so that I can build a structured training curriculum for my organization.

#### Acceptance Criteria

1. THE Platform SHALL provide a course management UI at `/admin/courses` listing all courses scoped to the admin's organization.
2. WHEN an admin submits the course creation form, THE Platform SHALL create a `Course` record via a Server Action with the provided title, description, and optional cover image URL, scoped to the admin's `organizationId`.
3. WHEN an admin submits the course edit form, THE Platform SHALL update the `Course` record's title, description, and cover image URL via a Server Action.
4. WHEN an admin clicks "Publish", THE Platform SHALL set `isPublished = true` on the course via a Server Action; WHEN an admin clicks "Unpublish", THE Platform SHALL set `isPublished = false`.
5. WHEN an admin confirms course deletion, THE Platform SHALL delete the `Course` record via a Server Action, which SHALL cascade-delete all associated modules, lessons, quizzes, and enrollments.
6. THE Platform SHALL provide a module management UI within each course, allowing admins to create, edit, reorder, and delete modules.
7. THE Platform SHALL provide a lesson management UI within each module, allowing admins to create, edit, reorder, and delete lessons of types VIDEO, TEXT, READING, and QUIZ.
8. WHEN an admin reorders modules or lessons, THE Platform SHALL update the `order` field on all affected records via a Server Action.
9. ALL course management operations SHALL be scoped to the admin's organization — an admin SHALL NOT be able to view or modify courses belonging to another organization.
10. THE Platform SHALL validate that course title is non-empty before creating or updating a course.

---

### Requirement 23: Learner Course Browsing and Enrollment

**User Story:** As a learner, I want to browse published courses in my organization and self-enroll, so that I can start my security awareness training.

#### Acceptance Criteria

1. THE Platform SHALL render a course catalog at `/learner/courses` listing all published courses scoped to the learner's organization.
2. EACH course card in the catalog SHALL display the course title, description excerpt, module count, total lesson count, and estimated total duration.
3. THE Platform SHALL render a course detail page at `/learner/courses/[courseId]` showing the full course description, module list, lesson list per module, and an "Enroll" button if the learner is not yet enrolled.
4. WHEN a learner clicks "Enroll", THE Platform SHALL create an `Enrollment` record via a Server Action with `progressPercentage = 0` and `enrolledAt = now()`.
5. IF a learner is already enrolled in a course, THE Platform SHALL display a "Continue Learning" button instead of "Enroll" on the course detail page.
6. THE Platform SHALL prevent duplicate enrollments — attempting to enroll a learner who is already enrolled SHALL return an error without creating a duplicate record.
7. ALL course browsing and enrollment operations SHALL be scoped to the learner's organization.
8. THE Platform SHALL display only published courses (`isPublished = true`) in the learner catalog.

---

### Requirement 24: Lesson Viewer

**User Story:** As a learner, I want to view lessons of different types — video, text, and quiz — so that I can complete my training in an engaging, interactive way.

#### Acceptance Criteria

1. THE Platform SHALL render a lesson viewer at `/learner/courses/[courseId]/lessons/[lessonId]`.
2. FOR lessons of type `VIDEO`, THE Platform SHALL render an embedded video player using the lesson's `videoUrl` field.
3. FOR lessons of type `TEXT` or `READING`, THE Platform SHALL render the lesson's `content` field as sanitized HTML or parsed Markdown.
4. FOR lessons of type `QUIZ`, THE Platform SHALL render an interactive quiz with all associated `QuizQuestion` records, each displaying the question text and multiple-choice options from the `options` JSON field.
5. WHEN a learner submits a quiz, THE Platform SHALL calculate the score as `(correctAnswers / totalQuestions) * 100`, rounded to the nearest integer.
6. THE Platform SHALL compare the calculated score against the `Quiz.passingScore` threshold and display a pass or fail result to the learner.
7. WHEN a learner completes a lesson (reaches the end of video/text, or submits a quiz), THE Platform SHALL upsert a `LessonProgress` record via a Server Action with `completed = true` and `completedAt = now()`.
8. THE lesson viewer SHALL display navigation links to the previous and next lesson within the course.
9. THE Platform SHALL enforce that only enrolled learners can access lesson content — unenrolled learners SHALL be redirected to the course detail page.
10. ALL lesson viewer operations SHALL be scoped to the learner's organization.

---

### Requirement 25: Progress Tracking

**User Story:** As a learner, I want my course progress to update automatically as I complete lessons, so that I can track my training completion at a glance.

#### Acceptance Criteria

1. WHEN a `LessonProgress` record is marked complete, THE Platform SHALL recalculate `Enrollment.progressPercentage` as `floor((completedLessons / totalLessons) * 100)` via a Server Action.
2. WHEN `progressPercentage` reaches 100, THE Platform SHALL set `Enrollment.completedAt = now()`.
3. THE learner dashboard SHALL display each enrolled course with its current `progressPercentage` as a progress bar.
4. THE course detail page SHALL display the learner's current progress percentage if they are enrolled.
5. THE Platform SHALL provide an admin view at `/admin/courses/[courseId]/stats` showing total enrollments, number of completions, and completion percentage for the course.
6. ALL progress data SHALL be scoped to the learner's organization — admins SHALL only see stats for courses in their organization.
7. Progress percentage SHALL always be an integer in the range [0, 100].

---

### Requirement 26: Phishing Campaign Management (Admin)

**User Story:** As an admin, I want to create and manage phishing simulation campaigns, so that I can test and improve my organization's security awareness.

#### Acceptance Criteria

1. THE Platform SHALL provide a phishing campaign management UI at `/admin/campaigns` listing all campaigns scoped to the admin's organization.
2. WHEN an admin submits the campaign creation form, THE Platform SHALL create a `PhishingCampaign` record via a Server Action with status `DRAFT`, scoped to the admin's `organizationId`.
3. THE Platform SHALL allow admins to transition campaign status following the allowed state machine: `DRAFT → SCHEDULED`, `SCHEDULED → RUNNING`, `RUNNING → COMPLETED`. No other transitions SHALL be permitted.
4. THE Platform SHALL render a campaign detail page at `/admin/campaigns/[campaignId]` showing campaign metadata and attempt statistics.
5. THE attempt statistics view SHALL display: total recipients, opened count and rate, clicked count and rate, and reported count and rate.
6. Rates SHALL be calculated as `floor((count / totalRecipients) * 100)` percent, where `totalRecipients` is the number of `PhishingAttempt` records for the campaign.
7. ALL phishing campaign operations SHALL be scoped to the admin's organization.
8. THE Platform SHALL validate that campaign title is non-empty before creating a campaign.

---

### Requirement 27: Multi-Tenant Data Isolation (Phase 4)

**User Story:** As a platform operator, I want all Phase 4 data operations to be strictly scoped to the user's organization, so that no data leaks between tenants.

#### Acceptance Criteria

1. ALL Server Actions that read or write `Course`, `Module`, `Lesson`, `Enrollment`, `LessonProgress`, `PhishingCampaign`, or `PhishingAttempt` records SHALL include an `organizationId` filter derived from the authenticated user's Clerk session.
2. THE Platform SHALL verify organization membership before executing any mutation — a user SHALL NOT be able to mutate records belonging to another organization.
3. IF a user attempts to access a resource that does not belong to their organization, THE Platform SHALL return a 404 (not found) response rather than a 403, to avoid leaking the existence of the resource.

---

### Requirement 28: Server Component and Server Action Architecture (Phase 4)

**User Story:** As a developer, I want Phase 4 pages to follow the established Next.js 15 rendering patterns, so that the codebase remains consistent and performant.

#### Acceptance Criteria

1. ALL data-fetching pages in Phase 4 SHALL be implemented as Server Components that query Prisma directly.
2. ALL mutations in Phase 4 SHALL be implemented as Server Actions in `src/actions/` organized by domain (e.g., `src/actions/courses.ts`, `src/actions/enrollments.ts`, `src/actions/campaigns.ts`).
3. Client Components SHALL only be used where interactivity is required (e.g., drag-and-drop reordering, quiz answer selection, form state management).
4. ALL Server Actions SHALL call `auth()` from `@clerk/nextjs/server` and derive `organizationId` from the session before performing any database operation.

---

### Requirement 29: Phase 4 Testing

**User Story:** As a developer, I want comprehensive tests for all Phase 4 pure functions and critical paths, so that correctness is verified and regressions are caught.

#### Acceptance Criteria

1. THE Platform SHALL include property-based tests (using fast-check) for all pure calculation functions: progress percentage calculation, quiz score calculation, quiz pass/fail determination, and phishing attempt rate calculation.
2. THE Platform SHALL include unit tests for all Server Actions covering success paths and error conditions.
3. ALL 95 existing tests SHALL continue to pass after Phase 4 implementation.
4. NEW tests SHALL follow the existing Vitest + fast-check setup in `src/__tests__/`.

---

### Requirement 30: Phase 4 UI Components

**User Story:** As a developer, I want reusable UI components for Phase 4 features built with shadcn/ui and Tailwind CSS, so that the UI is consistent with the existing design system.

#### Acceptance Criteria

1. THE Platform SHALL use shadcn/ui components (Card, Button, Progress, Badge, Dialog, Form) as the foundation for all Phase 4 UI.
2. ALL Phase 4 pages SHALL be fully responsive across mobile (≥ 320px), tablet (≥ 768px), and desktop (≥ 1280px) viewport widths.
3. THE Platform SHALL display loading states (skeleton loaders or spinners) during Server Action execution.
4. THE Platform SHALL display error messages to the user when Server Actions fail.
