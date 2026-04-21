import { describe, it, expect } from 'vitest'
import type { Course, Module, Organization, User, Role } from '@prisma/client'

describe('Prisma Generated Types', () => {
  it('should have Course type with all required fields', () => {
    // This test verifies that the Course type is correctly generated
    const course: Course = {
      id: 'course_123',
      organizationId: 'org_123',
      title: 'Test Course',
      description: null,
      coverImageUrl: null,
      isPublished: false,
      createdById: 'user_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    expect(course.id).toBe('course_123')
    expect(course.organizationId).toBe('org_123')
    expect(course.title).toBe('Test Course')
    expect(course.isPublished).toBe(false)
    expect(course.createdById).toBe('user_123')
  })

  it('should have Module type with all required fields', () => {
    const module: Module = {
      id: 'module_123',
      courseId: 'course_123',
      title: 'Test Module',
      description: null,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    expect(module.id).toBe('module_123')
    expect(module.courseId).toBe('course_123')
    expect(module.title).toBe('Test Module')
    expect(module.order).toBe(1)
  })

  it('should have proper type relationships', () => {
    // Test that we can create types with relations
    type CourseWithRelations = Course & {
      organization: Organization
      createdBy: User
      modules: Module[]
    }

    type ModuleWithCourse = Module & {
      course: Course
    }

    // These should compile without errors
    const courseWithRelations: Partial<CourseWithRelations> = {
      id: 'course_123',
      title: 'Test Course',
      organization: {
        id: 'org_123',
        clerkOrgId: 'clerk_org_123',
        name: 'Test Org',
        slug: 'test-org',
        logoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }

    const moduleWithCourse: Partial<ModuleWithCourse> = {
      id: 'module_123',
      title: 'Test Module',
      course: {
        id: 'course_123',
        organizationId: 'org_123',
        title: 'Test Course',
        description: null,
        coverImageUrl: null,
        isPublished: false,
        createdById: 'user_123',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }

    expect(courseWithRelations.organization?.name).toBe('Test Org')
    expect(moduleWithCourse.course?.title).toBe('Test Course')
  })

  it('should have correct field types', () => {
    // Test that fields have the correct TypeScript types
    const course: Course = {
      id: 'course_123',
      organizationId: 'org_123',
      title: 'Test Course',
      description: 'Optional description',
      coverImageUrl: 'https://example.com/image.jpg',
      isPublished: true,
      createdById: 'user_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Type assertions to verify correct types
    expect(typeof course.id).toBe('string')
    expect(typeof course.organizationId).toBe('string')
    expect(typeof course.title).toBe('string')
    expect(typeof course.description).toBe('string')
    expect(typeof course.coverImageUrl).toBe('string')
    expect(typeof course.isPublished).toBe('boolean')
    expect(typeof course.createdById).toBe('string')
    expect(course.createdAt).toBeInstanceOf(Date)
    expect(course.updatedAt).toBeInstanceOf(Date)

    const module: Module = {
      id: 'module_123',
      courseId: 'course_123',
      title: 'Test Module',
      description: 'Optional description',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    expect(typeof module.id).toBe('string')
    expect(typeof module.courseId).toBe('string')
    expect(typeof module.title).toBe('string')
    expect(typeof module.description).toBe('string')
    expect(typeof module.order).toBe('number')
    expect(module.createdAt).toBeInstanceOf(Date)
    expect(module.updatedAt).toBeInstanceOf(Date)
  })

  it('should allow null values for optional fields', () => {
    const courseWithNulls: Course = {
      id: 'course_123',
      organizationId: 'org_123',
      title: 'Test Course',
      description: null, // Optional field
      coverImageUrl: null, // Optional field
      isPublished: false,
      createdById: 'user_123',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const moduleWithNulls: Module = {
      id: 'module_123',
      courseId: 'course_123',
      title: 'Test Module',
      description: null, // Optional field
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    expect(courseWithNulls.description).toBeNull()
    expect(courseWithNulls.coverImageUrl).toBeNull()
    expect(moduleWithNulls.description).toBeNull()
  })
})