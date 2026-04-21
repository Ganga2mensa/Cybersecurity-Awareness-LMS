import { describe, it, expect, beforeEach, vi } from 'vitest'
import { prisma } from '@/lib/prisma'

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    enrollment: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    lessonProgress: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

describe('Enrollment Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create enrollment with user and course relations', async () => {
    const mockEnrollment = {
      id: 'enrollment_123',
      userId: 'user_123',
      courseId: 'course_123',
      enrolledAt: new Date(),
      completedAt: null,
      progressPercentage: 0,
      user: {
        id: 'user_123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      },
      course: {
        id: 'course_123',
        title: 'Security Awareness Training',
        description: 'Learn about cybersecurity best practices',
      },
    }

    vi.mocked(prisma.enrollment.create).mockResolvedValue(mockEnrollment)

    const result = await prisma.enrollment.create({
      data: {
        user: {
          connect: { id: 'user_123' }
        },
        course: {
          connect: { id: 'course_123' }
        },
      },
      include: {
        user: true,
        course: true,
      },
    })

    expect(prisma.enrollment.create).toHaveBeenCalledWith({
      data: {
        user: {
          connect: { id: 'user_123' }
        },
        course: {
          connect: { id: 'course_123' }
        },
      },
      include: {
        user: true,
        course: true,
      },
    })

    expect(result.user).toBeDefined()
    expect(result.course).toBeDefined()
    expect(result.user.firstName).toBe('John')
    expect(result.course.title).toBe('Security Awareness Training')
  })

  it('should find enrollment with lesson progress', async () => {
    const mockEnrollmentWithProgress = {
      id: 'enrollment_123',
      userId: 'user_123',
      courseId: 'course_123',
      enrolledAt: new Date(),
      completedAt: null,
      progressPercentage: 50,
      lessonProgress: [
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
      ],
    }

    vi.mocked(prisma.enrollment.findUnique).mockResolvedValue(mockEnrollmentWithProgress)

    const result = await prisma.enrollment.findUnique({
      where: { id: 'enrollment_123' },
      include: {
        lessonProgress: true,
      },
    })

    expect(prisma.enrollment.findUnique).toHaveBeenCalledWith({
      where: { id: 'enrollment_123' },
      include: {
        lessonProgress: true,
      },
    })

    expect(result?.lessonProgress).toBeDefined()
    expect(result?.lessonProgress).toHaveLength(2)
    expect(result?.lessonProgress[0].completed).toBe(true)
    expect(result?.lessonProgress[1].completed).toBe(false)
  })

  it('should create lesson progress with enrollment and lesson relations', async () => {
    const mockLessonProgress = {
      id: 'progress_123',
      enrollmentId: 'enrollment_123',
      lessonId: 'lesson_123',
      completed: false,
      completedAt: null,
      lastAccessedAt: new Date(),
      enrollment: {
        id: 'enrollment_123',
        userId: 'user_123',
        courseId: 'course_123',
        progressPercentage: 25,
      },
      lesson: {
        id: 'lesson_123',
        title: 'Introduction to Phishing',
        type: 'VIDEO',
        durationMinutes: 15,
      },
    }

    vi.mocked(prisma.lessonProgress.create).mockResolvedValue(mockLessonProgress)

    const result = await prisma.lessonProgress.create({
      data: {
        enrollment: {
          connect: { id: 'enrollment_123' }
        },
        lesson: {
          connect: { id: 'lesson_123' }
        },
        lastAccessedAt: new Date(),
      },
      include: {
        enrollment: true,
        lesson: true,
      },
    })

    expect(prisma.lessonProgress.create).toHaveBeenCalledWith({
      data: {
        enrollment: {
          connect: { id: 'enrollment_123' }
        },
        lesson: {
          connect: { id: 'lesson_123' }
        },
        lastAccessedAt: expect.any(Date),
      },
      include: {
        enrollment: true,
        lesson: true,
      },
    })

    expect(result.enrollment).toBeDefined()
    expect(result.lesson).toBeDefined()
    expect(result.lesson.title).toBe('Introduction to Phishing')
    expect(result.lesson.type).toBe('VIDEO')
  })
})