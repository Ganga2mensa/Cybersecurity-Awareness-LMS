-- Phase 3 Migration: SecuraLearn Core Data Models
-- Run this in Supabase Dashboard → SQL Editor

-- ─── Enums ────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('ADMIN', 'LEARNER', 'MANAGER');
EXCEPTION WHEN duplicate_object THEN
  -- Add MANAGER if it doesn't exist yet
  ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MANAGER';
END $$;

DO $$ BEGIN
  CREATE TYPE "LessonType" AS ENUM ('VIDEO', 'TEXT', 'QUIZ', 'READING', 'SCORM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'RUNNING', 'COMPLETED', 'PAUSED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── Update Organization table ────────────────────────────────────────────────

ALTER TABLE "Organization"
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;

-- Backfill slug for existing rows (use clerkOrgId as slug base)
UPDATE "Organization"
SET "slug" = LOWER(REGEXP_REPLACE("clerkOrgId", '[^a-z0-9]+', '-', 'g'))
WHERE "slug" IS NULL;

-- Now make slug NOT NULL and UNIQUE
ALTER TABLE "Organization" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "Organization" DROP CONSTRAINT IF EXISTS "Organization_slug_key";
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_slug_key" UNIQUE ("slug");

-- ─── Update User table ────────────────────────────────────────────────────────

-- Rename clerkId to clerkUserId if it exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'clerkId'
  ) THEN
    ALTER TABLE "User" RENAME COLUMN "clerkId" TO "clerkUserId";
  END IF;
END $$;

-- Add new columns
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "firstName" TEXT,
  ADD COLUMN IF NOT EXISTS "lastName" TEXT,
  ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;

-- Migrate existing name → firstName if name column exists
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'User' AND column_name = 'name'
  ) THEN
    UPDATE "User" SET "firstName" = "name" WHERE "firstName" IS NULL AND "name" IS NOT NULL;
    ALTER TABLE "User" DROP COLUMN IF EXISTS "name";
  END IF;
END $$;

-- Update role column type to use new enum (if it was text before)
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING "role"::"Role";

-- Add index on organizationId
CREATE INDEX IF NOT EXISTS "User_organizationId_idx" ON "User"("organizationId");

-- ─── Course table ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Course" (
  "id"             TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "title"          TEXT NOT NULL,
  "description"    TEXT,
  "coverImageUrl"  TEXT,
  "isPublished"    BOOLEAN NOT NULL DEFAULT false,
  "createdById"    TEXT NOT NULL,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Course_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Course_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
  CONSTRAINT "Course_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS "Course_organizationId_idx" ON "Course"("organizationId");
CREATE INDEX IF NOT EXISTS "Course_createdById_idx" ON "Course"("createdById");
CREATE INDEX IF NOT EXISTS "Course_createdAt_idx" ON "Course"("createdAt");

-- ─── Module table ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Module" (
  "id"          TEXT NOT NULL,
  "courseId"    TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "description" TEXT,
  "order"       INTEGER NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Module_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Module_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Module_courseId_idx" ON "Module"("courseId");

-- ─── Lesson table ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Lesson" (
  "id"              TEXT NOT NULL,
  "moduleId"        TEXT NOT NULL,
  "title"           TEXT NOT NULL,
  "type"            "LessonType" NOT NULL,
  "content"         TEXT,
  "videoUrl"        TEXT,
  "durationMinutes" INTEGER,
  "order"           INTEGER NOT NULL,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Lesson_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Lesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "Module"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Lesson_moduleId_idx" ON "Lesson"("moduleId");

-- ─── Quiz table ───────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Quiz" (
  "id"           TEXT NOT NULL,
  "lessonId"     TEXT NOT NULL,
  "title"        TEXT NOT NULL,
  "passingScore" INTEGER NOT NULL DEFAULT 80,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Quiz_lessonId_key" UNIQUE ("lessonId"),
  CONSTRAINT "Quiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE
);

-- ─── QuizQuestion table ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "QuizQuestion" (
  "id"           TEXT NOT NULL,
  "quizId"       TEXT NOT NULL,
  "questionText" TEXT NOT NULL,
  "options"      JSONB NOT NULL,
  "order"        INTEGER NOT NULL,
  CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "QuizQuestion_quizId_idx" ON "QuizQuestion"("quizId");

-- ─── Enrollment table ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "Enrollment" (
  "id"                 TEXT NOT NULL,
  "userId"             TEXT NOT NULL,
  "courseId"           TEXT NOT NULL,
  "enrolledAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt"        TIMESTAMP(3),
  "progressPercentage" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Enrollment_userId_courseId_key" UNIQUE ("userId", "courseId"),
  CONSTRAINT "Enrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "Enrollment_userId_idx" ON "Enrollment"("userId");
CREATE INDEX IF NOT EXISTS "Enrollment_courseId_idx" ON "Enrollment"("courseId");
CREATE INDEX IF NOT EXISTS "Enrollment_enrolledAt_idx" ON "Enrollment"("enrolledAt");
CREATE INDEX IF NOT EXISTS "Enrollment_completedAt_idx" ON "Enrollment"("completedAt");

-- ─── LessonProgress table ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "LessonProgress" (
  "id"             TEXT NOT NULL,
  "enrollmentId"   TEXT NOT NULL,
  "lessonId"       TEXT NOT NULL,
  "completed"      BOOLEAN NOT NULL DEFAULT false,
  "completedAt"    TIMESTAMP(3),
  "lastAccessedAt" TIMESTAMP(3),
  CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "LessonProgress_enrollmentId_lessonId_key" UNIQUE ("enrollmentId", "lessonId"),
  CONSTRAINT "LessonProgress_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE CASCADE,
  CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "LessonProgress_enrollmentId_idx" ON "LessonProgress"("enrollmentId");
CREATE INDEX IF NOT EXISTS "LessonProgress_lessonId_idx" ON "LessonProgress"("lessonId");

-- ─── PhishingCampaign table ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "PhishingCampaign" (
  "id"             TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "title"          TEXT NOT NULL,
  "description"    TEXT,
  "status"         "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
  "sentAt"         TIMESTAMP(3),
  "createdById"    TEXT NOT NULL,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PhishingCampaign_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PhishingCampaign_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE,
  CONSTRAINT "PhishingCampaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS "PhishingCampaign_organizationId_idx" ON "PhishingCampaign"("organizationId");
CREATE INDEX IF NOT EXISTS "PhishingCampaign_createdById_idx" ON "PhishingCampaign"("createdById");
CREATE INDEX IF NOT EXISTS "PhishingCampaign_createdAt_idx" ON "PhishingCampaign"("createdAt");

-- ─── PhishingAttempt table ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS "PhishingAttempt" (
  "id"              TEXT NOT NULL,
  "campaignId"      TEXT NOT NULL,
  "userId"          TEXT NOT NULL,
  "emailTemplateId" TEXT,
  "clicked"         BOOLEAN NOT NULL DEFAULT false,
  "clickedAt"       TIMESTAMP(3),
  "reported"        BOOLEAN NOT NULL DEFAULT false,
  "reportedAt"      TIMESTAMP(3),
  "opened"          BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "PhishingAttempt_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PhishingAttempt_campaignId_userId_key" UNIQUE ("campaignId", "userId"),
  CONSTRAINT "PhishingAttempt_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "PhishingCampaign"("id") ON DELETE CASCADE,
  CONSTRAINT "PhishingAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "PhishingAttempt_campaignId_idx" ON "PhishingAttempt"("campaignId");
CREATE INDEX IF NOT EXISTS "PhishingAttempt_userId_idx" ON "PhishingAttempt"("userId");

-- ─── Update FK on User → Organization (add CASCADE) ──────────────────────────

ALTER TABLE "User" DROP CONSTRAINT IF EXISTS "User_organizationId_fkey";
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey"
  FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE;

-- Done!
SELECT 'Phase 3 migration complete ✓' AS result;
