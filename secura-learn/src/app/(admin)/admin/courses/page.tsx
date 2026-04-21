import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default async function AdminCoursesPage() {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { organizationId: true },
  })
  if (!user) redirect("/sign-in")

  const courses = await prisma.course.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { modules: true, enrollments: true } },
    },
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your organization&apos;s training courses
          </p>
        </div>
        <Link href="/admin/courses/new" className={cn(buttonVariants())}>
          New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No courses yet.</p>
            <Link href="/admin/courses/new" className={cn(buttonVariants(), "mt-4")}>
              Create your first course
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <Link key={course.id} href={`/admin/courses/${course.id}`}>
              <Card className="hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base">{course.title}</CardTitle>
                    <Badge variant={course.isPublished ? "success" : "outline"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  {course.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>{course._count.modules} module{course._count.modules !== 1 ? "s" : ""}</span>
                    <span>{course._count.enrollments} enrollment{course._count.enrollments !== 1 ? "s" : ""}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
