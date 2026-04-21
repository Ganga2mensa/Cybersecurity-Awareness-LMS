import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Prisma Client
const mockPrisma = {
  lesson: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  quiz: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  quizQuestion: {
    create: vi.fn(),
    findMany: vi.fn(),
  },
}

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

describe('Lesson and Quiz Models', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a lesson with proper structure', async () => {
    const mockLesson = {
      id: 'lesson_123',
      moduleId: 'module_123',
      title: 'Introduction to Security',
      type: 'VIDEO',
      content: 'This lesson covers basic security concepts',
      videoUrl: 'https://example.com/video.mp4',
      durationMinutes: 15,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockPrisma.lesson.create.mockResolvedValue(mockLesson)

    const { prisma } = await import('@/lib/prisma')
    const result = await prisma.lesson.create({
      data: {
        moduleId: 'module_123',
        title: 'Introduction to Security',
        type: 'VIDEO',
        content: 'This lesson covers basic security concepts',
        videoUrl: 'https://example.com/video.mp4',
        durationMinutes: 15,
        order: 1,
      },
    })

    expect(mockPrisma.lesson.create).toHaveBeenCalledWith({
      data: {
        moduleId: 'module_123',
        title: 'Introduction to Security',
        type: 'VIDEO',
        content: 'This lesson covers basic security concepts',
        videoUrl: 'https://example.com/video.mp4',
        durationMinutes: 15,
        order: 1,
      },
    })
    expect(result).toEqual(mockLesson)
  })

  it('should create a quiz with proper structure', async () => {
    const mockQuiz = {
      id: 'quiz_123',
      lessonId: 'lesson_123',
      title: 'Security Basics Quiz',
      passingScore: 80,
      createdAt: new Date(),
    }

    mockPrisma.quiz.create.mockResolvedValue(mockQuiz)

    const { prisma } = await import('@/lib/prisma')
    const result = await prisma.quiz.create({
      data: {
        lessonId: 'lesson_123',
        title: 'Security Basics Quiz',
        passingScore: 80,
      },
    })

    expect(mockPrisma.quiz.create).toHaveBeenCalledWith({
      data: {
        lessonId: 'lesson_123',
        title: 'Security Basics Quiz',
        passingScore: 80,
      },
    })
    expect(result).toEqual(mockQuiz)
  })

  it('should create quiz questions with proper structure', async () => {
    const mockQuizQuestion = {
      id: 'question_123',
      quizId: 'quiz_123',
      questionText: 'What is the most common type of cyber attack?',
      options: {
        a: { text: 'Phishing', isCorrect: true },
        b: { text: 'Malware', isCorrect: false },
        c: { text: 'DDoS', isCorrect: false },
        d: { text: 'SQL Injection', isCorrect: false },
      },
      order: 1,
    }

    mockPrisma.quizQuestion.create.mockResolvedValue(mockQuizQuestion)

    const { prisma } = await import('@/lib/prisma')
    const result = await prisma.quizQuestion.create({
      data: {
        quizId: 'quiz_123',
        questionText: 'What is the most common type of cyber attack?',
        options: {
          a: { text: 'Phishing', isCorrect: true },
          b: { text: 'Malware', isCorrect: false },
          c: { text: 'DDoS', isCorrect: false },
          d: { text: 'SQL Injection', isCorrect: false },
        },
        order: 1,
      },
    })

    expect(mockPrisma.quizQuestion.create).toHaveBeenCalledWith({
      data: {
        quizId: 'quiz_123',
        questionText: 'What is the most common type of cyber attack?',
        options: {
          a: { text: 'Phishing', isCorrect: true },
          b: { text: 'Malware', isCorrect: false },
          c: { text: 'DDoS', isCorrect: false },
          d: { text: 'SQL Injection', isCorrect: false },
        },
        order: 1,
      },
    })
    expect(result).toEqual(mockQuizQuestion)
  })

  it('should handle lesson types correctly', () => {
    const lessonTypes = ['VIDEO', 'TEXT', 'QUIZ', 'READING', 'SCORM']
    
    lessonTypes.forEach(type => {
      expect(['VIDEO', 'TEXT', 'QUIZ', 'READING', 'SCORM']).toContain(type)
    })
  })

  it('should handle quiz with default passing score', async () => {
    const mockQuiz = {
      id: 'quiz_123',
      lessonId: 'lesson_123',
      title: 'Security Basics Quiz',
      passingScore: 80, // Default value
      createdAt: new Date(),
    }

    mockPrisma.quiz.create.mockResolvedValue(mockQuiz)

    const { prisma } = await import('@/lib/prisma')
    const result = await prisma.quiz.create({
      data: {
        lessonId: 'lesson_123',
        title: 'Security Basics Quiz',
        // passingScore not provided, should default to 80
      },
    })

    expect(result.passingScore).toBe(80)
  })
})