import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CourseForm } from "@/components/courses/CourseForm"
import { ModuleList } from "@/components/courses/ModuleList"
import { publishCourse, unpublishCourse, deleteCourse } from "@/actions/courses"

interface CourseEditPageProps {
  params: Promise<{ courseId: string }>
}

export default async function CourseEditPage({ params }: CourseEditPageProps) {
  const { courseId } = await params
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { organizationId: true },
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
          },
        },
      },
    },
  })

  if (!course || course.organizationId !== user.organizationId) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/courses" className="text-muted-foreground hover:text-foreground text-sm">
            ← Courses
          </Link>
          <h1 className="text-2xl font-bold text-foreground">{course.title}</h1>
          <Badge variant={course.isPublished ? "success" : "outline"}>
            {course.isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/courses/${courseId}/stats`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            Stats
          </Link>
          <form
            action={async () => {
              "use server"
              if (course.isPublished) {
                await unpublishCourse(courseId)
              } else {
                await publishCourse(courseId)
              }
            }}
          >
            <Button type="submit" variant="outline" size="sm">
              {course.isPublished ? "Unpublish" : "Publish"}
            </Button>
          </form>
          <form
            action={async () => {
              "use server"
              await deleteCourse(courseId)
              redirect("/admin/courses")
            }}
          >
            <Button
              type="submit"
              variant="destructive"
              size="sm"
              onClick={(e) => {
                if (!confirm("Delete this course and all its content?")) {
                  e.preventDefault()
                }
              }}
            >
              Delete
            </Button>
          </form>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseForm
            courseId={courseId}
            initialValues={{
              title: course.title,
              description: course.description,
              coverImageUrl: course.coverImageUrl,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modules &amp; Lessons</CardTitle>
        </CardHeader>
        <CardContent>
          <ModuleList
            courseId={courseId}
            initialModules={course.modules.map((mod) => ({
              id: mod.id,
              title: mod.title,
              order: mod.order,
              lessons: mod.lessons.map((lesson) => ({
                id: lesson.id,
                title: lesson.title,
                type: lesson.type,
                order: lesson.order,
                durationMinutes: lesson.durationMinutes,
              })),
            }))}
          />
        </CardContent>
      </Card>
    </div>
  )
}
