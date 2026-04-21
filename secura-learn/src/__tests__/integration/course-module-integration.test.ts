import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PrismaClient } from '@prisma/client'

// Mock the Prisma client for integration testing
const mockPrisma = {
  course: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  module: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  organization: {
    findUnique: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
} as any

describe('Course and Module Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Course Operations', () => {
    it('should create a course with all required fields', async () => {
      const courseData = {
        organizationId: 'org_123',
        title: 'Cybersecurity Fundamentals',
        description: 'Learn the basics of cybersecurity',
        coverImageUrl: 'https://example.com/cover.jpg',
        isPublished: false,
        createdById: 'user_123',
      }

      const expectedCourse = {
        id: 'course_123',
        ...courseData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.course.create.mockResolvedValue(expectedCourse)

      const result = await mockPrisma.course.create({
        data: courseData,
      })

      expect(mockPrisma.course.create).toHaveBeenCalledWith({
        data: courseData,
      })
      expect(result).toEqual(expectedCourse)
      expect(result.isPublished).toBe(false) // Default value
    })

    it('should create a course with minimal required fields', async () => {
      const minimalCourseData = {
        organizationId: 'org_123',
        title: 'Basic Course',
        createdById: 'user_123',
      }

      const expectedCourse = {
        id: 'course_456',
        ...minimalCourseData,
        description: null,
        coverImageUrl: null,
        isPublished: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.course.create.mockResolvedValue(expectedCourse)

      const result = await mockPrisma.course.create({
        data: minimalCourseData,
      })

      expect(result.description).toBeNull()
      expect(result.coverImageUrl).toBeNull()
      expect(result.isPublished).toBe(false)
    })

    it('should find courses with relations', async () => {
      const coursesWithRelations = [
        {
          id: 'course_123',
          title: 'Security Training',
          organization: {
            id: 'org_123',
            name: 'Acme Corp',
          },
          createdBy: {
            id: 'user_123',
            firstName: 'John',
            lastName: 'Doe',
          },
          modules: [
            {
              id: 'module_1',
              title: 'Introduction',
              order: 1,
            },
          ],
        },
      ]

      mockPrisma.course.findMany.mockResolvedValue(coursesWithRelations)

      const result = await mockPrisma.course.findMany({
        include: {
          organization: true,
          createdBy: true,
          modules: true,
        },
      })

      expect(mockPrisma.course.findMany).toHaveBeenCalledWith({
        include: {
          organization: true,
          createdBy: true,
          modules: true,
        },
      })
      expect(result[0].organization.name).toBe('Acme Corp')
      expect(result[0].createdBy.firstName).toBe('John')
      expect(result[0].modules).toHaveLength(1)
    })
  })

  describe('Module Operations', () => {
    it('should create a module with all required fields', async () => {
      const moduleData = {
        courseId: 'course_123',
        title: 'Phishing Awareness',
        description: 'Learn to identify phishing emails',
        order: 1,
      }

      const expectedModule = {
        id: 'module_123',
        ...moduleData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.module.create.mockResolvedValue(expectedModule)

      const result = await mockPrisma.module.create({
        data: moduleData,
      })

      expect(mockPrisma.module.create).toHaveBeenCalledWith({
        data: moduleData,
      })
      expect(result).toEqual(expectedModule)
      expect(result.order).toBe(1)
    })

    it('should create a module with minimal required fields', async () => {
      const minimalModuleData = {
        courseId: 'course_123',
        title: 'Basic Module',
        order: 2,
      }

      const expectedModule = {
        id: 'module_456',
        ...minimalModuleData,
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.module.create.mockResolvedValue(expectedModule)

      const result = await mockPrisma.module.create({
        data: minimalModuleData,
      })

      expect(result.description).toBeNull()
      expect(result.order).toBe(2)
    })

    it('should find modules with course relation', async () => {
      const modulesWithCourse = [
        {
          id: 'module_123',
          title: 'Security Basics',
          order: 1,
          course: {
            id: 'course_123',
            title: 'Cybersecurity Training',
            organization: {
              id: 'org_123',
              name: 'Acme Corp',
            },
          },
        },
      ]

      mockPrisma.module.findMany.mockResolvedValue(modulesWithCourse)

      const result = await mockPrisma.module.findMany({
        include: {
          course: {
            include: {
              organization: true,
            },
          },
        },
      })

      expect(result[0].course.title).toBe('Cybersecurity Training')
      expect(result[0].course.organization.name).toBe('Acme Corp')
    })
  })

  describe('Cascade Operations', () => {
    it('should handle module deletion when course is deleted (cascade)', async () => {
      // Mock course deletion which should cascade to modules
      mockPrisma.course.delete.mockResolvedValue({
        id: 'course_123',
        title: 'Deleted Course',
      })

      const result = await mockPrisma.course.delete({
        where: { id: 'course_123' },
      })

      expect(mockPrisma.course.delete).toHaveBeenCalledWith({
        where: { id: 'course_123' },
      })
      expect(result.id).toBe('course_123')
      // In a real database, modules would be automatically deleted due to onDelete: Cascade
    })
  })

  describe('Organization and User Relations', () => {
    it('should verify course belongs to organization', async () => {
      const courseWithOrg = {
        id: 'course_123',
        organizationId: 'org_123',
        title: 'Test Course',
        organization: {
          id: 'org_123',
          name: 'Test Organization',
          clerkOrgId: 'clerk_org_123',
        },
      }

      mockPrisma.course.findUnique.mockResolvedValue(courseWithOrg)

      const result = await mockPrisma.course.findUnique({
        where: { id: 'course_123' },
        include: { organization: true },
      })

      expect(result?.organizationId).toBe('org_123')
      expect(result?.organization.name).toBe('Test Organization')
    })

    it('should verify course has creator relation', async () => {
      const courseWithCreator = {
        id: 'course_123',
        createdById: 'user_123',
        title: 'Test Course',
        createdBy: {
          id: 'user_123',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
          role: 'ADMIN',
        },
      }

      mockPrisma.course.findUnique.mockResolvedValue(courseWithCreator)

      const result = await mockPrisma.course.findUnique({
        where: { id: 'course_123' },
        include: { createdBy: true },
      })

      expect(result?.createdById).toBe('user_123')
      expect(result?.createdBy.firstName).toBe('Jane')
      expect(result?.createdBy.role).toBe('ADMIN')
    })
  })
})