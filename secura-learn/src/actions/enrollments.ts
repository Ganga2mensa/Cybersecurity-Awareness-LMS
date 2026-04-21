'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { calculateProgressPercentage } from '@/lib/progress'

// ─── Helper: get authenticated user with organizationId ──────────────────────

async function getAuthenticatedUser() {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) throw new Error('Unauthenticated')

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, organizationId: true },
  })
  if (!user) throw new Error('User not found')
  return user
}

// ─── Enrollment Actions ───────────────────────────────────────────────────────

export async function enrollInCourse(courseId: string): Promise<void> {
  const user = await getAuthenticatedUser()

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course || course.organizationId !== user.organizationId) {
    throw new Error('Course not found')
  }
  if (!course.isPublished) {
    throw new Error('Course is not published')
  }

  try {
    await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId,
        progressPercentage: 0,
      },
    })
  } catch (error: unknown) {
    // P2002 = unique constraint violation (already enrolled)
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      // Already enrolled — silently ignore
      return
    }
    throw error
  }

  revalidatePath(`/learner/courses/${courseId}`)
  revalidatePath('/learner/courses')
}

export async function completeLessonAndUpdateProgress(
  enrollmentId: string,
  lessonId: string
): Promise<{ newProgressPercentage: number }> {
  const user = await getAuthenticatedUser()

  // Verify enrollment belongs to the authenticated user
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: { select: { id: true } },
            },
          },
        },
      },
    },
  })

  if (!enrollment || enrollment.userId !== user.id) {
    throw new Error('Enrollment not found')
  }

  // Upsert lesson progress
  await prisma.lessonProgress.upsert({
    where: {
      enrollmentId_lessonId: { enrollmentId, lessonId },
    },
    update: {
      completed: true,
      completedAt: new Date(),
      lastAccessedAt: new Date(),
    },
    create: {
      enrollmentId,
      lessonId,
      completed: true,
      completedAt: new Date(),
      lastAccessedAt: new Date(),
    },
  })

  // Count total lessons in the course
  const totalLessons = enrollment.course.modules.reduce(
    (sum, mod) => sum + mod.lessons.length,
    0
  )

  // Count completed lessons for this enrollment
  const completedCount = await prisma.lessonProgress.count({
    where: {
      enrollmentId,
      completed: true,
    },
  })

  const newProgressPercentage = calculateProgressPercentage(completedCount, totalLessons)

  // Update enrollment progress
  await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: {
      progressPercentage: newProgressPercentage,
      completedAt: newProgressPercentage === 100 ? new Date() : null,
    },
  })

  revalidatePath(`/learner/courses/${enrollment.courseId}`)
  revalidatePath(`/learner/courses/${enrollment.courseId}/lessons/${lessonId}`)

  return { newProgressPercentage }
}
