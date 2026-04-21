import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    enrollment: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    lessonProgress: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

describe('Enrollment and LessonProgress Models', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Enrollment Model', () => {
    it('should create an enrollment with default values', async () => {
      const mockEnrollment = {
        id: 'enrollment_123',
        userId: 'user_123',
        courseId: 'course_123',
        enrolledAt: new Date(),
        completedAt: null,
        progressPercentage: 0,
      }

      vi.mocked(prisma.enrollment.create).mockResolvedValue(mockEnrollment)

      const result = await prisma.enrollment.create({
        data: {
          userId: 'user_123',
          courseId: 'course_123',
        },
      })

      expect(prisma.enrollment.create).toHaveBeenCalledWith({
        data: {
          userId: 'user_123',
          courseId: 'course_123',
        },
      })
      expect(result).toEqual(mockEnrollment)
      expect(result.progressPercentage).toBe(0)
      expect(result.completedAt).toBeNull()
    })

    it('should find enrollments for a user', async () => {
      const mockEnrollments = [
        {
          id: 'enrollment_1',
          userId: 'user_123',
          courseId: 'course_1',
          enrolledAt: new Date(),
          completedAt: null,
          progressPercentage: 25,
        },
        {
          id: 'enrollment_2',
          userId: 'user_123',
          courseId: 'course_2',
          enrolledAt: new Date(),
          completedAt: new Date(),
          progressPercentage: 100,
        },
      ]

      vi.mocked(prisma.enrollment.findMany).mockResolvedValue(mockEnrollments)

      const result = await prisma.enrollment.findMany({
        where: { userId: 'user_123' },
      })

      expect(prisma.enrollment.findMany).toHaveBeenCalledWith({
        where: { userId: 'user_123' },
      })
      expect(result).toEqual(mockEnrollments)
      expect(result).toHaveLength(2)
    })
  })

  describe('LessonProgress Model', () => {
    it('should create lesson progress with default values', async () => {
      const mockLessonProgress = {
        id: 'progress_123',
        enrollmentId: 'enrollment_123',
        lessonId: 'lesson_123',
        completed: false,
        completedAt: null,
        lastAccessedAt: new Date(),
      }

      vi.mocked(prisma.lessonProgress.create).mockResolvedValue(mockLessonProgress)

      const result = await prisma.lessonProgress.create({
        data: {
          enrollmentId: 'enrollment_123',
          lessonId: 'lesson_123',
          lastAccessedAt: new Date(),
        },
      })

      expect(prisma.lessonProgress.create).toHaveBeenCalledWith({
        data: {
          enrollmentId: 'enrollment_123',
          lessonId: 'lesson_123',
          lastAccessedAt: expect.any(Date),
        },
      })
      expect(result).toEqual(mockLessonProgress)
      expect(result.completed).toBe(false)
      expect(result.completedAt).toBeNull()
    })

    it('should update lesson progress to completed', async () => {
      const completedAt = new Date()
      const mockUpdatedProgress = {
        id: 'progress_123',
        enrollmentId: 'enrollment_123',
        lessonId: 'lesson_123',
        completed: true,
        completedAt,
        lastAccessedAt: completedAt,
      }

      vi.mocked(prisma.lessonProgress.update).mockResolvedValue(mockUpdatedProgress)

      const result = await prisma.lessonProgress.update({
        where: { id: 'progress_123' },
        data: {
          completed: true,
          completedAt,
          lastAccessedAt: completedAt,
        },
      })

      expect(prisma.lessonProgress.update).toHaveBeenCalledWith({
        where: { id: 'progress_123' },
        data: {
          completed: true,
          completedAt,
          lastAccessedAt: completedAt,
        },
      })
      expect(result.completed).toBe(true)
      expect(result.completedAt).toEqual(completedAt)
    })

    it('should find lesson progress for an enrollment', async () => {
      const mockProgressRecords = [
        {
          id: 'progress_1',
          enrollmentId: 'enrollment_123',
          lessonId: 'lesson_1',
          completed: true,
          completedAt: new Date(),
          lastAccessedAt: new Date(),
        },
        {
          id: 'progress_2',
          enrollmentId: 'enrollment_123',
          lessonId: 'lesson_2',
          completed: false,
          completedAt: null,
          lastAccessedAt: new Date(),
        },
      ]

      vi.mocked(prisma.lessonProgress.findMany).mockResolvedValue(mockProgressRecords)

      const result = await prisma.lessonProgress.findMany({
        where: { enrollmentId: 'enrollment_123' },
      })

      expect(prisma.lessonProgress.findMany).toHaveBeenCalledWith({
        where: { enrollmentId: 'enrollment_123' },
      })
      expect(result).toEqual(mockProgressRecords)
      expect(result).toHaveLength(2)
    })
  })
})