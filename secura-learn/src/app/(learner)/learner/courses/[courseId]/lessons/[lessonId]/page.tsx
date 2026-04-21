import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { VideoPlayer } from "@/components/lessons/VideoPlayer"
import { MarkdownRenderer } from "@/components/lessons/MarkdownRenderer"
import { QuizForm } from "@/components/lessons/QuizForm"

interface LessonViewerPageProps {
  params: Promise<{ courseId: string; lessonId: string }>
}

export default async function LessonViewerPage({ params }: LessonViewerPageProps) {
  const { courseId, lessonId } = await params
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, organizationId: true },
  })
  if (!user) redirect("/sign-in")

  // Fetch lesson with full context
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      quiz: {
        include: { questions: { orderBy: { order: "asc" } } },
      },
      module: {
        include: {
          course: {
            select: { id: true, organizationId: true, isPublished: true },
          },
        },
      },
    },
  })

  if (
    !lesson ||
    lesson.module.courseId !== courseId ||
    lesson.module.course.organizationId !== user.organizationId ||
    !lesson.module.course.isPublished
  ) {
    notFound()
  }

  // Verify enrollment
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId } },
    select: { id: true },
  })

  if (!enrollment) {
    redirect(`/learner/courses/${courseId}`)
  }

  // Get lesson progress
  const lessonProgress = await prisma.lessonProgress.findUnique({
    where: {
      enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId },
    },
    select: { completed: true },
  })

  const isCompleted = lessonProgress?.completed ?? false

  // Get all lessons in the course for prev/next navigation
  const allLessons = await prisma.lesson.findMany({
    where: {
      module: { courseId },
    },
    orderBy: [
      { module: { order: "asc" } },
      { order: "asc" },
    ],
    select: { id: true, title: true, moduleId: true },
  })

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/learner/courses" className="hover:text-foreground">Courses</Link>
        <span>/</span>
        <Link href={`/learner/courses/${courseId}`} className="hover:text-foreground">Course</Link>
        <span>/</span>
        <span className="text-foreground">{lesson.title}</span>
      </div>

      {/* Lesson header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">{lesson.title}</h1>
          <Badge variant="outline">{lesson.type}</Badge>
          {isCompleted && <Badge variant="success">Completed</Badge>}
        </div>
      </div>

      {/* Lesson content */}
      <div>
        {lesson.type === "VIDEO" && lesson.videoUrl && (
          <VideoPlayer
            videoUrl={lesson.videoUrl}
            enrollmentId={enrollment.id}
            lessonId={lessonId}
            isCompleted={isCompleted}
          />
        )}

        {(lesson.type === "TEXT" || lesson.type === "READING") && lesson.content && (
          <MarkdownRenderer
            content={lesson.content}
            enrollmentId={enrollment.id}
            lessonId={lessonId}
            isCompleted={isCompleted}
          />
        )}

        {lesson.type === "QUIZ" && lesson.quiz && (
          <QuizForm
            questions={lesson.quiz.questions.map((q) => ({
              id: q.id,
              questionText: q.questionText,
              options: q.options as Record<string, { text: string; isCorrect: boolean }>,
              order: q.order,
            }))}
            passingScore={lesson.quiz.passingScore}
            enrollmentId={enrollment.id}
            lessonId={lessonId}
            isCompleted={isCompleted}
          />
        )}

        {lesson.type === "VIDEO" && !lesson.videoUrl && (
          <p className="text-muted-foreground">No video URL provided for this lesson.</p>
        )}

        {(lesson.type === "TEXT" || lesson.type === "READING") && !lesson.content && (
          <p className="text-muted-foreground">No content provided for this lesson.</p>
        )}

        {lesson.type === "QUIZ" && !lesson.quiz && (
          <p className="text-muted-foreground">No quiz questions available for this lesson.</p>
        )}

        {lesson.type === "SCORM" && (
          <p className="text-muted-foreground">SCORM content is not yet supported.</p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        {prevLesson ? (
          <Link
            href={`/learner/courses/${courseId}/lessons/${prevLesson.id}`}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            ← {prevLesson.title}
          </Link>
        ) : (
          <div />
        )}

        {nextLesson ? (
          <Link
            href={`/learner/courses/${courseId}/lessons/${nextLesson.id}`}
            className="flex items-center gap-2 text-sm text-primary hover:underline"
          >
            {nextLesson.title} →
          </Link>
        ) : (
          <Link
            href={`/learner/courses/${courseId}`}
            className="text-sm text-primary hover:underline"
          >
            Back to Course →
          </Link>
        )}
      </div>
    </div>
  )
}
