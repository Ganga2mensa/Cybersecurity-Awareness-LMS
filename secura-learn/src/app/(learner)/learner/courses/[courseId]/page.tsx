import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { enrollInCourse } from "@/actions/enrollments"

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>
}

export default async function LearnerCourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseId } = await params
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, organizationId: true },
  })
  if (!user) redirect("/sign-in")

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            select: { id: true, title: true, type: true, durationMinutes: true, order: true },
          },
        },
      },
      enrollments: {
        where: { userId: user.id },
        include: {
          lessonProgress: {
            where: { completed: true },
            select: { lessonId: true },
          },
        },
      },
    },
  })

  if (!course || course.organizationId !== user.organizationId || !course.isPublished) {
    notFound()
  }

  const enrollment = course.enrollments[0] ?? null
  const completedLessonIds = new Set(enrollment?.lessonProgress.map((lp) => lp.lessonId) ?? [])

  // Find first incomplete lesson for "Continue Learning"
  let firstIncompleteLessonId: string | null = null
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      if (!completedLessonIds.has(lesson.id)) {
        firstIncompleteLessonId = lesson.id
        break
      }
    }
    if (firstIncompleteLessonId) break
  }

  const totalLessons = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/learner/courses" className="hover:text-foreground">
          ← Courses
        </Link>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{course.title}</h1>
        {course.description && (
          <p className="text-muted-foreground">{course.description}</p>
        )}
        <div className="flex gap-3 text-sm text-muted-foreground">
          <span>{course.modules.length} module{course.modules.length !== 1 ? "s" : ""}</span>
          <span>·</span>
          <span>{totalLessons} lesson{totalLessons !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {enrollment ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Your progress</span>
            <span className="font-medium">{enrollment.progressPercentage}%</span>
          </div>
          <Progress value={enrollment.progressPercentage} />
          {firstIncompleteLessonId ? (
            <Link href={`/learner/courses/${courseId}/lessons/${firstIncompleteLessonId}`} className={cn(buttonVariants())}>
              Continue Learning
            </Link>
          ) : (
            <Badge variant="success">Course Completed!</Badge>
          )}
        </div>
      ) : (
        <form
          action={async () => {
            "use server"
            await enrollInCourse(courseId)
            redirect(`/learner/courses/${courseId}`)
          }}
        >
          <Button type="submit">Enroll in Course</Button>
        </form>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Course Content</h2>
        {course.modules.map((mod) => (
          <Card key={mod.id}>
            <CardHeader>
              <CardTitle className="text-base">{mod.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mod.lessons.map((lesson) => {
                  const isCompleted = completedLessonIds.has(lesson.id)
                  return (
                    <li key={lesson.id} className="flex items-center gap-3">
                      <span className={`text-sm ${isCompleted ? "text-muted-foreground line-through" : "text-foreground"}`}>
                        {lesson.title}
                      </span>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {lesson.type}
                      </Badge>
                      {isCompleted && (
                        <Badge variant="success" className="text-xs">Done</Badge>
                      )}
                      {enrollment && (
                        <Link
                          href={`/learner/courses/${courseId}/lessons/${lesson.id}`}
                          className="text-xs text-primary hover:underline"
                        >
                          {isCompleted ? "Review" : "Start"}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
