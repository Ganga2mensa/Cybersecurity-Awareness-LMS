import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { calculateOrgCompletionRate, calculateAvgClickRate } from "@/lib/analytics"

export default async function AdminAnalyticsPage() {
  const { userId: clerkUserId } = await auth()

  if (!clerkUserId) {
    redirect("/sign-in")
  }

  const currentDbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { organizationId: true },
  })

  if (!currentDbUser) {
    redirect("/sign-in")
  }

  const { organizationId } = currentDbUser

  // Fetch all stats in parallel
  const [
    totalUsers,
    totalCourses,
    totalEnrollments,
    completedEnrollments,
    courses,
    totalCampaigns,
    totalAttempts,
    totalClicked,
  ] = await Promise.all([
    prisma.user.count({ where: { organizationId } }),
    prisma.course.count({ where: { organizationId } }),
    prisma.enrollment.count({ where: { course: { organizationId } } }),
    prisma.enrollment.count({
      where: { course: { organizationId }, completedAt: { not: null } },
    }),
    prisma.course.findMany({
      where: { organizationId },
      select: {
        id: true,
        title: true,
        isPublished: true,
        _count: { select: { enrollments: true } },
        enrollments: {
          where: { completedAt: { not: null } },
          select: { id: true },
        },
      },
      orderBy: { title: "asc" },
    }),
    prisma.phishingCampaign.count({ where: { organizationId } }),
    prisma.phishingAttempt.count({ where: { campaign: { organizationId } } }),
    prisma.phishingAttempt.count({
      where: { campaign: { organizationId }, clicked: true },
    }),
  ])

  const completionRate = calculateOrgCompletionRate(completedEnrollments, totalEnrollments)
  const avgClickRate = calculateAvgClickRate(totalClicked, totalAttempts)

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Organization-wide training and security metrics
        </p>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-500">{totalUsers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-500">{totalCourses}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-500">{totalEnrollments}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-500">{completionRate}%</p>
            <Progress value={completionRate} className="mt-2 h-1.5" />
            <p className="text-xs text-muted-foreground mt-1">
              {completedEnrollments} of {totalEnrollments} enrollments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Per-Course Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Course Enrollment Stats</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {courses.length === 0 ? (
            <p className="text-muted-foreground text-sm px-4 py-6 text-center">
              No courses found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Course</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Enrollments</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Completions</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Completion %</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => {
                    const courseCompletions = course.enrollments.length
                    const courseEnrollments = course._count.enrollments
                    const courseRate = calculateOrgCompletionRate(courseCompletions, courseEnrollments)
                    return (
                      <tr
                        key={course.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">{course.title}</td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              course.isPublished
                                ? "text-xs font-medium text-orange-500"
                                : "text-xs font-medium text-muted-foreground"
                            }
                          >
                            {course.isPublished ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {courseEnrollments}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {courseCompletions}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress value={courseRate} className="w-16 h-1.5" />
                            <span className="text-muted-foreground w-10 text-right">
                              {courseRate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phishing Campaign Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Phishing Campaign Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Total Campaigns</p>
              <p className="text-2xl font-bold text-orange-500 mt-1">{totalCampaigns}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Attempts</p>
              <p className="text-2xl font-bold text-orange-500 mt-1">{totalAttempts}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Click Rate</p>
              <p className="text-2xl font-bold text-orange-500 mt-1">{avgClickRate}%</p>
              <Progress value={avgClickRate} className="mt-2 h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">
                {totalClicked} of {totalAttempts} clicked
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
