import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CourseCard } from "@/components/courses/CourseCard"

export default async function LearnerCoursesPage() {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, organizationId: true },
  })
  if (!user) redirect("/sign-in")

  const courses = await prisma.course.findMany({
    where: {
      organizationId: user.organizationId,
      isPublished: true,
    },
    orderBy: { createdAt: "desc" },
    include: {
      modules: {
        include: {
          lessons: {
            select: { id: true, durationMinutes: true },
          },
        },
      },
      enrollments: {
        where: { userId: user.id },
        select: { progressPercentage: true },
      },
    },
  })

  const coursesWithStats = courses.map((course) => {
    const lessonCount = course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0)
    const totalDurationMinutes = course.modules.reduce(
      (sum, mod) =>
        sum + mod.lessons.reduce((s, l) => s + (l.durationMinutes ?? 0), 0),
      0
    )
    const enrollment = course.enrollments[0] ?? null

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      moduleCount: course.modules.length,
      lessonCount,
      totalDurationMinutes,
      enrollment,
    }
  })

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Course Catalog</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse and enroll in your organization&apos;s training courses
        </p>
      </div>

      {coursesWithStats.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <p className="text-muted-foreground">No courses available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coursesWithStats.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              enrollment={course.enrollment}
            />
          ))}
        </div>
      )}
    </div>
  )
}
