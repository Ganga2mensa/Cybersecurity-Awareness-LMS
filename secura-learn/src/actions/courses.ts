'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { LessonType } from '@prisma/client'

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

// ─── Course Actions ───────────────────────────────────────────────────────────

export async function createCourse(data: {
  title: string
  description?: string
  coverImageUrl?: string
}): Promise<{ courseId: string }> {
  const user = await getAuthenticatedUser()

  if (!data.title || data.title.trim() === '') {
    throw new Error('Course title is required')
  }

  const course = await prisma.course.create({
    data: {
      title: data.title.trim(),
      description: data.description ?? null,
      coverImageUrl: data.coverImageUrl ?? null,
      organizationId: user.organizationId,
      createdById: user.id,
    },
  })

  revalidatePath('/admin/courses')
  return { courseId: course.id }
}

export async function updateCourse(
  courseId: string,
  data: { title?: string; description?: string; coverImageUrl?: string }
): Promise<void> {
  const user = await getAuthenticatedUser()

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course || course.organizationId !== user.organizationId) {
    throw new Error('Course not found')
  }

  if (data.title !== undefined && data.title.trim() === '') {
    throw new Error('Course title cannot be empty')
  }

  await prisma.course.update({
    where: { id: courseId },
    data: {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.coverImageUrl !== undefined ? { coverImageUrl: data.coverImageUrl } : {}),
    },
  })

  revalidatePath('/admin/courses')
  revalidatePath(`/admin/courses/${courseId}`)
}

export async function publishCourse(courseId: string): Promise<void> {
  const user = await getAuthenticatedUser()

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course || course.organizationId !== user.organizationId) {
    throw new Error('Course not found')
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { isPublished: true },
  })

  revalidatePath('/admin/courses')
  revalidatePath(`/admin/courses/${courseId}`)
}

export async function unpublishCourse(courseId: string): Promise<void> {
  const user = await getAuthenticatedUser()

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course || course.organizationId !== user.organizationId) {
    throw new Error('Course not found')
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { isPublished: false },
  })

  revalidatePath('/admin/courses')
  revalidatePath(`/admin/courses/${courseId}`)
}

export async function deleteCourse(courseId: string): Promise<void> {
  const user = await getAuthenticatedUser()

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course || course.organizationId !== user.organizationId) {
    throw new Error('Course not found')
  }

  await prisma.course.delete({ where: { id: courseId } })

  revalidatePath('/admin/courses')
}

// ─── Module Actions ───────────────────────────────────────────────────────────

export async function createModule(
  courseId: string,
  data: { title: string; description?: string }
): Promise<{ moduleId: string }> {
  const user = await getAuthenticatedUser()

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course || course.organizationId !== user.organizationId) {
    throw new Error('Course not found')
  }

  const count = await prisma.module.count({ where: { courseId } })

  const module = await prisma.module.create({
    data: {
      courseId,
      title: data.title,
      description: data.description ?? null,
      order: count + 1,
    },
  })

  revalidatePath(`/admin/courses/${courseId}`)
  return { moduleId: module.id }
}

export async function updateModule(
  moduleId: string,
  data: { title?: string; description?: string }
): Promise<void> {
  const user = await getAuthenticatedUser()

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: { select: { organizationId: true } } },
  })
  if (!module || module.course.organizationId !== user.organizationId) {
    throw new Error('Module not found')
  }

  await prisma.module.update({
    where: { id: moduleId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.description !== undefined ? { description: data.description } : {}),
    },
  })

  revalidatePath(`/admin/courses/${module.courseId}`)
}

export async function deleteModule(moduleId: string): Promise<void> {
  const user = await getAuthenticatedUser()

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: { select: { organizationId: true, id: true } } },
  })
  if (!module || module.course.organizationId !== user.organizationId) {
    throw new Error('Module not found')
  }

  await prisma.module.delete({ where: { id: moduleId } })

  revalidatePath(`/admin/courses/${module.courseId}`)
}

export async function reorderModules(
  courseId: string,
  orderedModuleIds: string[]
): Promise<void> {
  const user = await getAuthenticatedUser()

  const course = await prisma.course.findUnique({ where: { id: courseId } })
  if (!course || course.organizationId !== user.organizationId) {
    throw new Error('Course not found')
  }

  await prisma.$transaction(
    orderedModuleIds.map((moduleId, index) =>
      prisma.module.update({
        where: { id: moduleId },
        data: { order: index + 1 },
      })
    )
  )

  revalidatePath(`/admin/courses/${courseId}`)
}

// ─── Lesson Actions ───────────────────────────────────────────────────────────

export async function createLesson(
  moduleId: string,
  data: {
    title: string
    type: LessonType
    content?: string
    videoUrl?: string
    durationMinutes?: number
  }
): Promise<{ lessonId: string }> {
  const user = await getAuthenticatedUser()

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: { select: { organizationId: true, id: true } } },
  })
  if (!module || module.course.organizationId !== user.organizationId) {
    throw new Error('Module not found')
  }

  const count = await prisma.lesson.count({ where: { moduleId } })

  const lesson = await prisma.lesson.create({
    data: {
      moduleId,
      title: data.title,
      type: data.type,
      content: data.content ?? null,
      videoUrl: data.videoUrl ?? null,
      durationMinutes: data.durationMinutes ?? null,
      order: count + 1,
    },
  })

  revalidatePath(`/admin/courses/${module.courseId}`)
  return { lessonId: lesson.id }
}

export async function updateLesson(
  lessonId: string,
  data: {
    title?: string
    content?: string
    videoUrl?: string
    durationMinutes?: number
  }
): Promise<void> {
  const user = await getAuthenticatedUser()

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: { course: { select: { organizationId: true, id: true } } },
      },
    },
  })
  if (!lesson || lesson.module.course.organizationId !== user.organizationId) {
    throw new Error('Lesson not found')
  }

  await prisma.lesson.update({
    where: { id: lessonId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.videoUrl !== undefined ? { videoUrl: data.videoUrl } : {}),
      ...(data.durationMinutes !== undefined ? { durationMinutes: data.durationMinutes } : {}),
    },
  })

  revalidatePath(`/admin/courses/${lesson.module.courseId}`)
}

export async function deleteLesson(lessonId: string): Promise<void> {
  const user = await getAuthenticatedUser()

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: { course: { select: { organizationId: true, id: true } } },
      },
    },
  })
  if (!lesson || lesson.module.course.organizationId !== user.organizationId) {
    throw new Error('Lesson not found')
  }

  await prisma.lesson.delete({ where: { id: lessonId } })

  revalidatePath(`/admin/courses/${lesson.module.courseId}`)
}

export async function reorderLessons(
  moduleId: string,
  orderedLessonIds: string[]
): Promise<void> {
  const user = await getAuthenticatedUser()

  const module = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: { select: { organizationId: true, id: true } } },
  })
  if (!module || module.course.organizationId !== user.organizationId) {
    throw new Error('Module not found')
  }

  await prisma.$transaction(
    orderedLessonIds.map((lessonId, index) =>
      prisma.lesson.update({
        where: { id: lessonId },
        data: { order: index + 1 },
      })
    )
  )

  revalidatePath(`/admin/courses/${module.courseId}`)
}
