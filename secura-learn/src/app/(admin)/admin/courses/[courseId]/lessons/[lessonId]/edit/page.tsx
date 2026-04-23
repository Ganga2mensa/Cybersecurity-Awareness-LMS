import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LessonEditForm } from "@/components/courses/LessonEditForm"

interface Props {
  params: Promise<{ courseId: string; lessonId: string }>
}

const TYPE_LABELS: Record<string, string> = {
  VIDEO: "Video",
  TEXT: "Text",
  READING: "Reading",
  QUIZ: "Quiz",
  SCORM: "SCORM",
}

export default async function LessonEditPage({ params }: Props) {
  const { courseId, lessonId } = await params
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { organizationId: true },
  })
  if (!user) redirect("/sign-in")

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: { course: { select: { id: true, organizationId: true, title: true } } },
      },
    },
  })

  if (
    !lesson ||
    lesson.module.courseId !== courseId ||
    lesson.module.course.organizationId !== user.organizationId
  ) {
    notFound()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/courses" className="hover:text-foreground">Courses</Link>
        <span>/</span>
        <Link href={`/admin/courses/${courseId}`} className="hover:text-foreground">
          {lesson.module.course.title}
        </Link>
        <span>/</span>
        <span className="text-foreground">{lesson.title}</span>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">Edit Lesson</h1>
        <Badge variant="outline">{TYPE_LABELS[lesson.type] ?? lesson.type}</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lesson Content</CardTitle>
        </CardHeader>
        <CardContent>
          <LessonEditForm
            lessonId={lessonId}
            courseId={courseId}
            initialValues={{
              title: lesson.title,
              type: lesson.type,
              content: lesson.content,
              videoUrl: lesson.videoUrl,
              scormPackageUrl: lesson.scormPackageUrl,
              durationMinutes: lesson.durationMinutes,
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
