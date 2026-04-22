import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"

export default async function LearnerBadgesPage() {
  const { userId: clerkUserId } = await auth()

  if (!clerkUserId) {
    redirect("/sign-in")
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  })

  const completedEnrollments = dbUser
    ? await prisma.enrollment.findMany({
        where: {
          userId: dbUser.id,
          completedAt: { not: null },
        },
        include: {
          course: { select: { id: true, title: true } },
        },
        orderBy: { completedAt: "desc" },
      })
    : []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Badges</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Badges earned by completing courses
        </p>
      </div>

      {completedEnrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-3">
            <p className="text-4xl">🎯</p>
            <p className="font-semibold text-foreground">No badges yet</p>
            <p className="text-muted-foreground text-sm">
              Complete a course to earn your first badge!
            </p>
            <Link
              href="/learner/courses"
              className="inline-block text-sm bg-orange-500 text-white hover:bg-orange-400 transition-colors rounded-lg px-4 py-2 font-medium mt-2"
            >
              Browse Courses
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            You&apos;ve earned{" "}
            <span className="font-semibold text-orange-500">
              {completedEnrollments.length} badge{completedEnrollments.length !== 1 ? "s" : ""}
            </span>
            . Keep it up!
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {completedEnrollments.map((enrollment) => (
              <Card
                key={enrollment.id}
                className="hover:ring-2 hover:ring-orange-500/30 transition-all"
              >
                <CardContent className="py-6 text-center space-y-3">
                  <div className="text-5xl">🏅</div>
                  <div>
                    <p className="font-semibold text-foreground text-sm leading-tight">
                      {enrollment.course.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Completed{" "}
                      {enrollment.completedAt
                        ? new Date(enrollment.completedAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                  <span className="inline-flex items-center text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full px-2.5 py-0.5 font-medium">
                    Course Complete
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
