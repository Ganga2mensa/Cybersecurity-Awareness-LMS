import { auth, currentUser, clerkClient } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { UserGreeting } from "@/components/shared/UserGreeting"
import { syncUserToDatabase } from "@/actions/user"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default async function LearnerDashboardPage() {
  await syncUserToDatabase()

  const { orgId, userId: clerkUserId } = await auth()

  if (!orgId || !clerkUserId) {
    redirect("/sign-in")
  }

  const [user, client] = await Promise.all([
    currentUser(),
    clerkClient(),
  ])

  const userName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : (user?.emailAddresses?.[0]?.emailAddress ?? null)

  let orgName: string | null = null
  try {
    const org = await client.organizations.getOrganization({ organizationId: orgId })
    orgName = org.name
  } catch {
    orgName = null
  }

  // Fetch enrollments with course data
  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  })

  let enrollments: Array<{
    id: string
    userId: string
    courseId: string
    enrolledAt: Date
    completedAt: Date | null
    progressPercentage: number
    course: { id: string; title: string; description: string | null }
  }> = []
  let badgeCount = 0

  if (dbUser) {
    const results = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: dbUser.id },
        include: { course: { select: { id: true, title: true, description: true } } },
        orderBy: { enrolledAt: "desc" },
      }),
      prisma.enrollment.count({
        where: { userId: dbUser.id, completedAt: { not: null } },
      }),
    ])
    enrollments = results[0]
    badgeCount = results[1]
  }

  return (
    <div className="max-w-4xl mx-auto">
      <UserGreeting userName={userName} orgName={orgName} />

      {/* Badge count stat */}
      {badgeCount > 0 && (
        <div className="mt-6">
          <Link href="/learner/badges">
            <Card className="hover:ring-2 hover:ring-orange-500/30 transition-all cursor-pointer">
              <CardContent className="py-4 flex items-center gap-4">
                <span className="text-3xl">🏅</span>
                <div>
                  <p className="font-semibold text-foreground">
                    {badgeCount} Badge{badgeCount !== 1 ? "s" : ""} Earned
                  </p>
                  <p className="text-xs text-muted-foreground">
                    View your completed course badges →
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">My Courses</h2>
          <Link href="/learner/courses" className="text-sm text-primary hover:underline">
            Browse all courses →
          </Link>
        </div>

        {enrollments.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-center">
            <p className="text-muted-foreground text-sm">
              You haven&apos;t enrolled in any courses yet.
            </p>
            <Link href="/learner/courses" className="text-sm text-primary hover:underline mt-2 inline-block">
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollments.map((enrollment) => (
              <Link key={enrollment.id} href={`/learner/courses/${enrollment.courseId}`}>
                <Card className="hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="text-base">{enrollment.course.title}</CardTitle>
                    {enrollment.course.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {enrollment.course.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{enrollment.progressPercentage}%</span>
                    </div>
                    <Progress value={enrollment.progressPercentage} />
                    {enrollment.completedAt && (
                      <Badge variant="success" className="text-xs">Completed</Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
