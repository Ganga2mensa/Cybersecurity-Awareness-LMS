import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateProgressPercentage } from "@/lib/progress"

interface CourseStatsPageProps {
  params: Promise<{ courseId: string }>
}

export default async function CourseStatsPage({ params }: CourseStatsPageProps) {
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
    select: { id: true, title: true, organizationId: true },
  })

  if (!course || course.organizationId !== user.organizationId) {
    notFound()
  }

  const totalEnrollments = await prisma.enrollment.count({
    where: { courseId },
  })

  const completions = await prisma.enrollment.count({
    where: { courseId, completedAt: { not: null } },
  })

  const completionRate = calculateProgressPercentage(completions, totalEnrollments)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/admin/courses/${courseId}`} className="text-muted-foreground hover:text-foreground text-sm">
          ← {course.title}
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Course Stats</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalEnrollments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Completions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{completions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{completionRate}%</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
