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

export default async function AdminUserDetailPage({ params }: Props) {
  const { userId: clerkUserId } = await auth()
  const { userId } = await params

  if (!clerkUserId) {
    redirect("/sign-in")
  }

  // Get current admin's org
  const currentDbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { organizationId: true },
  })

  if (!currentDbUser) {
    redirect("/sign-in")
  }

  // Fetch target user, scoped to same org
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      organizationId: currentDbUser.organizationId,
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

  if (!user) {
    notFound()
  }

  const displayName =
    user.firstName || user.lastName
      ? [user.firstName, user.lastName].filter(Boolean).join(" ")
      : user.email

  const roleBadgeVariant = (role: string) => {
    if (role === "ADMIN") return "destructive"
    if (role === "MANAGER") return "secondary"
    return "outline"
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/users" className="hover:text-orange-500 transition-colors">
          Users
        </Link>
        <span>/</span>
        <span className="text-foreground">{displayName}</span>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{displayName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Role</p>
              <Badge variant={roleBadgeVariant(user.role) as "destructive" | "secondary" | "outline"}>
                {user.role}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Member since</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total enrollments</p>
              <p className="font-medium">{user.enrollments.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enrollments */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Enrollments ({user.enrollments.length})
        </h2>

        {user.enrollments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground text-sm">
                This user has not enrolled in any courses yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {user.enrollments.map((enrollment) => (
              <Card key={enrollment.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/admin/courses/${enrollment.courseId}`}
                        className="font-medium text-foreground hover:text-orange-500 transition-colors truncate block"
                      >
                        {enrollment.course.title}
                      </Link>
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
