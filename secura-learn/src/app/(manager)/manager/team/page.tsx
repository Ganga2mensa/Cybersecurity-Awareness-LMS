import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default async function ManagerTeamPage() {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { organizationId: true },
  })
  if (!user) redirect("/sign-in")

  const learners = await prisma.user.findMany({
    where: { organizationId: user.organizationId, role: "LEARNER" },
    include: {
      enrollments: {
        select: { progressPercentage: true, completedAt: true, courseId: true },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team Progress</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {learners.length} learner{learners.length !== 1 ? "s" : ""} in your organization
        </p>
      </div>

      {learners.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground text-sm">No learners in your organization yet.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">All Learners</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Enrollments</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Completions</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Avg Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {learners.map((learner) => {
                    const displayName =
                      learner.firstName || learner.lastName
                        ? [learner.firstName, learner.lastName].filter(Boolean).join(" ")
                        : learner.email
                    const completions = learner.enrollments.filter((e) => e.completedAt !== null).length
                    const avgProgress =
                      learner.enrollments.length > 0
                        ? Math.round(
                            learner.enrollments.reduce((s, e) => s + e.progressPercentage, 0) /
                              learner.enrollments.length
                          )
                        : 0

                    return (
                      <tr
                        key={learner.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <Link
                            href={`/manager/team/${learner.id}`}
                            className="font-medium text-foreground hover:text-orange-500 transition-colors"
                          >
                            {displayName}
                          </Link>
                          {displayName !== learner.email && (
                            <p className="text-xs text-muted-foreground">{learner.email}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {learner.enrollments.length}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{completions}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Progress value={avgProgress} className="h-1.5 w-24" />
                            <span className="text-xs text-muted-foreground">{avgProgress}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
