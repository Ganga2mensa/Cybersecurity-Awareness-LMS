import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export default async function LearnerProgressPage() {
  const { userId: clerkUserId } = await auth()

  if (!clerkUserId) {
    redirect("/sign-in")
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true },
  })

  const enrollments = dbUser
    ? await prisma.enrollment.findMany({
        where: { userId: dbUser.id },
        include: {
          course: { select: { id: true, title: true } },
          lessonProgress: {
            where: { completed: true },
            include: {
              lesson: { select: { id: true, title: true, type: true } },
            },
          },
        },
        orderBy: { enrolledAt: "desc" },
      })
    : []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Progress</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Track your training completion across all enrolled courses
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              You haven&apos;t enrolled in any courses yet.
            </p>
            <a
              href="/learner/courses"
              className="text-sm text-orange-500 hover:underline mt-2 inline-block"
            >
              Browse courses →
            </a>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {enrollments.map((enrollment) => {
            const completedQuizzes = enrollment.lessonProgress.filter(
              (lp) => lp.lesson.type === "QUIZ"
            )

            return (
              <Card key={enrollment.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-base font-semibold">
                      {enrollment.course.title}
                    </CardTitle>
                    {enrollment.completedAt && (
                      <Badge variant="success" className="shrink-0 text-xs">
                        Completed
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold text-orange-500">
                        {enrollment.progressPercentage}%
                      </span>
                    </div>
                    <Progress value={enrollment.progressPercentage} className="h-2" />
                  </div>

                  {/* Dates */}
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span>
                      Enrolled:{" "}
                      <span className="text-foreground font-medium">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </span>
                    </span>
                    {enrollment.completedAt && (
                      <span>
                        Completed:{" "}
                        <span className="text-orange-500 font-medium">
                          {new Date(enrollment.completedAt).toLocaleDateString()}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Quiz completions */}
                  {completedQuizzes.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1.5">
                        Completed Quizzes
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {completedQuizzes.map((lp) => (
                          <span
                            key={lp.id}
                            className="inline-flex items-center gap-1 text-xs bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full px-2.5 py-0.5 font-medium"
                          >
                            ✓ {lp.lesson.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
