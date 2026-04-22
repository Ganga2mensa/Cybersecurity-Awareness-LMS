import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Props {
  params: Promise<{ userId: string }>
}

export default async function ManagerLearnerDetailPage({ params }: Props) {
  const { userId: targetUserId } = await params
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect("/sign-in")

  const currentUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { organizationId: true },
  })
  if (!currentUser) redirect("/sign-in")

  const learner = await prisma.user.findFirst({
    where: {
      id: targetUserId,
      organizationId: currentUser.organizationId,
      role: "LEARNER",
    },
    include: {
      enrollments: {
        include: {
          course: { select: { id: true, title: true } },
        },
        orderBy: { enrolledAt: "desc" },
      },
    },
  })

  if (!learner) notFound()

  const displayName =
    learner.firstName || learner.lastName
      ? [learner.firstName, learner.lastName].filter(Boolean).join(" ")
      : learner.email

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/manager/team" className="hover:text-orange-500 transition-colors">
          Team
        </Link>
        <span>/</span>
        <span className="text-foreground">{displayName}</span>
      </div>

      {/* Learner Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{displayName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{learner.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <Badge variant="outline">LEARNER</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Member since</p>
              <p className="font-medium">{new Date(learner.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total enrollments</p>
              <p className="font-medium">{learner.enrollments.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments (read-only) */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Enrollments ({learner.enrollments.length})
        </h2>

        {learner.enrollments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground text-sm">
                This learner has not enrolled in any courses yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {learner.enrollments.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {enrollment.course.title}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>
                          Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </span>
                        {enrollment.completedAt && (
                          <span className="text-orange-500 font-medium">
                            Completed: {new Date(enrollment.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{enrollment.progressPercentage}%</span>
                        </div>
                        <Progress value={enrollment.progressPercentage} className="h-1.5" />
                      </div>
                    </div>
                    {enrollment.completedAt && (
                      <Badge variant="success" className="shrink-0 text-xs">
                        Completed
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
