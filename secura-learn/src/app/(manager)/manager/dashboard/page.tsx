import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ManagerDashboardPage() {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { organizationId: true, firstName: true, lastName: true },
  })
  if (!user) redirect("/sign-in")

  // Team stats: all LEARNER users in the org
  const learners = await prisma.user.findMany({
    where: { organizationId: user.organizationId, role: "LEARNER" },
    include: {
      enrollments: {
        select: { progressPercentage: true, completedAt: true },
      },
    },
  })

  const totalLearners = learners.length
  const totalEnrollments = learners.reduce((sum, l) => sum + l.enrollments.length, 0)
  const completedEnrollments = learners.reduce(
    (sum, l) => sum + l.enrollments.filter((e) => e.completedAt !== null).length,
    0
  )
  const avgProgress =
    totalEnrollments > 0
      ? Math.round(
          learners.reduce(
            (sum, l) => sum + l.enrollments.reduce((s, e) => s + e.progressPercentage, 0),
            0
          ) / totalEnrollments
        )
      : 0

  // Recent activity: last 5 completed enrollments
  const recentCompletions = await prisma.enrollment.findMany({
    where: {
      user: { organizationId: user.organizationId, role: "LEARNER" },
      completedAt: { not: null },
    },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      course: { select: { title: true } },
    },
    orderBy: { completedAt: "desc" },
    take: 5,
  })

  const displayName = user.firstName ?? "Manager"

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {displayName}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s an overview of your team&apos;s learning progress.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{totalLearners}</p>
          </CardContent>
        </Card>

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
            <p className="text-3xl font-bold text-foreground">{completedEnrollments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Avg Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{avgProgress}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Completions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentCompletions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completions yet.</p>
          ) : (
            <div className="space-y-3">
              {recentCompletions.map((enrollment) => {
                const name =
                  enrollment.user.firstName || enrollment.user.lastName
                    ? [enrollment.user.firstName, enrollment.user.lastName].filter(Boolean).join(" ")
                    : enrollment.user.email
                return (
                  <div key={enrollment.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-foreground">{name}</span>
                      <span className="text-muted-foreground"> completed </span>
                      <span className="font-medium text-foreground">{enrollment.course.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {enrollment.completedAt
                        ? new Date(enrollment.completedAt).toLocaleDateString()
                        : ""}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
