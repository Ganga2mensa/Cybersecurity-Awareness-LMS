import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { syncUserToDatabase } from "@/actions/user"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Trophy,
  TrendingUp,
  Clock,
  ChevronRight,
  ShieldCheck,
  Star,
  Target,
} from "lucide-react"

export default async function LearnerDashboardPage() {
  await syncUserToDatabase()

  const { orgId, userId: clerkUserId } = await auth()
  if (!orgId || !clerkUserId) redirect("/sign-in")

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, firstName: true, organization: { select: { name: true } } },
  })

  if (dbUser && dbUser.firstName === null) redirect("/learner/onboarding")

  const orgName = dbUser?.organization?.name ?? null
  const user = await currentUser()
  const fullName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ""}`
    : (user?.emailAddresses?.[0]?.emailAddress ?? "Learner")
  const firstName = dbUser?.firstName ?? user?.firstName ?? null

  let enrollments: Array<{
    id: string
    courseId: string
    enrolledAt: Date
    completedAt: Date | null
    course: {
      id: string
      title: string
      description: string | null
      modules: { lessons: { id: string }[] }[]
    }
    lessonProgress: { lessonId: string }[]
  }> = []

  let badgeCount = 0
  let availableCourseCount = 0

  if (dbUser) {
    const [enrollmentData, badges, available] = await Promise.all([
      prisma.enrollment.findMany({
        where: { userId: dbUser.id },        include: {
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              modules: { select: { lessons: { select: { id: true } } } },
            },
          },
          lessonProgress: {
            where: { completed: true },
            select: { lessonId: true },
          },
        },
        orderBy: { enrolledAt: "desc" },
      }),
      prisma.enrollment.count({
        where: { userId: dbUser.id, completedAt: { not: null } },
      }),
      prisma.course.count({
        where: {
          isPublished: true,
          enrollments: { none: { userId: dbUser.id } },
          modules: { some: {} },
        },
      }),
    ])
    enrollments = enrollmentData
    badgeCount = badges
    availableCourseCount = available
  }

  // Compute live stats
  const totalEnrolled = enrollments.length
  const completedCourses = enrollments.filter((e) => e.completedAt).length
  const inProgressCourses = enrollments.filter((e) => !e.completedAt).length

  const totalLessonsAcrossAll = enrollments.reduce(
    (sum, e) => sum + e.course.modules.reduce((s, m) => s + m.lessons.length, 0), 0
  )
  const completedLessonsAcrossAll = enrollments.reduce(
    (sum, e) => sum + e.lessonProgress.length, 0
  )
  const overallProgress = totalLessonsAcrossAll > 0
    ? Math.floor((completedLessonsAcrossAll / totalLessonsAcrossAll) * 100)
    : 0

  // Get hour of day for greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ── Hero greeting ── */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0F172A] to-[#1e293b] border border-white/10 px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <p className="text-orange-400 text-sm font-medium">{greeting} 👋</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, {firstName ?? fullName}!
          </h1>
          {orgName && (
            <p className="text-slate-400 text-sm">{orgName} · Security Awareness Training</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/learner/courses"
            className="inline-flex items-center gap-2 rounded-lg px-5 h-10 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-400 transition-colors"
          >
            <BookOpen className="size-4" />
            Browse Courses
          </Link>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <BookOpen className="size-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalEnrolled}</p>
                <p className="text-xs text-muted-foreground">Enrolled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-2">
                <Trophy className="size-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{completedCourses}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/10 p-2">
                <TrendingUp className="size-5 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{overallProgress}%</p>
                <p className="text-xs text-muted-foreground">Overall</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-500/10 p-2">
                <Star className="size-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{badgeCount}</p>
                <p className="text-xs text-muted-foreground">Badges</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Overall progress bar ── */}
      {totalEnrolled > 0 && (
        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="size-4 text-orange-500" />
                <span className="text-sm font-semibold text-foreground">Overall Training Progress</span>
              </div>
              <span className="text-sm font-bold text-orange-500">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {completedLessonsAcrossAll} of {totalLessonsAcrossAll} lessons completed across all courses
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── My Courses (2/3 width) ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">My Courses</h2>
            <Link href="/learner/courses" className="text-sm text-orange-500 hover:text-orange-400 flex items-center gap-1">
              View all <ChevronRight className="size-3" />
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center space-y-3">
                <BookOpen className="size-10 text-muted-foreground mx-auto" />
                <p className="font-medium text-foreground">No courses yet</p>
                <p className="text-sm text-muted-foreground">
                  Start your security awareness journey today
                </p>
                <Link
                  href="/learner/courses"
                  className="inline-flex items-center justify-center rounded-lg px-5 h-9 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-400 transition-colors mt-2"
                >
                  Browse Courses
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {enrollments.slice(0, 4).map((enrollment) => {
                const totalLessons = enrollment.course.modules.reduce(
                  (sum, mod) => sum + mod.lessons.length, 0
                )
                const completedCount = enrollment.lessonProgress.length
                const liveProgress = totalLessons > 0
                  ? Math.floor((completedCount / totalLessons) * 100)
                  : 0
                const isCompleted = liveProgress === 100

                return (
                  <Link key={enrollment.id} href={`/learner/courses/${enrollment.courseId}`}>
                    <Card className="hover:ring-2 hover:ring-orange-500/30 transition-all cursor-pointer">
                      <CardContent className="py-4">
                        <div className="flex items-start gap-4">
                          <div className={`rounded-lg p-2.5 shrink-0 ${isCompleted ? "bg-green-500/10" : "bg-orange-500/10"}`}>
                            {isCompleted
                              ? <Trophy className="size-5 text-green-500" />
                              : <BookOpen className="size-5 text-orange-500" />
                            }
                          </div>
                          <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-semibold text-foreground text-sm leading-tight">
                                {enrollment.course.title}
                              </p>
                              {isCompleted
                                ? <Badge variant="success" className="text-xs shrink-0">Done ✓</Badge>
                                : <span className="text-xs font-bold text-orange-500 shrink-0">{liveProgress}%</span>
                              }
                            </div>
                            <Progress value={liveProgress} className="h-1.5" />
                            <p className="text-xs text-muted-foreground">
                              {completedCount} of {totalLessons} lessons
                              {!isCompleted && totalLessons > completedCount && (
                                <span className="text-orange-500 ml-2 font-medium">
                                  · {totalLessons - completedCount} remaining
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Right sidebar (1/3 width) ── */}
        <div className="space-y-4">

          {/* Quick stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Training Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Clock className="size-3.5" /> In Progress
                </span>
                <span className="font-semibold text-orange-500">{inProgressCourses}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Trophy className="size-3.5" /> Completed
                </span>
                <span className="font-semibold text-green-500">{completedCourses}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Star className="size-3.5" /> Badges Earned
                </span>
                <Link href="/learner/badges" className="font-semibold text-yellow-500 hover:underline">
                  {badgeCount}
                </Link>
              </div>
              {availableCourseCount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <BookOpen className="size-3.5" /> Available
                  </span>
                  <Link href="/learner/courses" className="font-semibold text-orange-500 hover:underline">
                    {availableCourseCount} new
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Badges */}
          {badgeCount > 0 && (
            <Link href="/learner/badges">
              <Card className="hover:ring-2 hover:ring-orange-500/30 transition-all cursor-pointer bg-gradient-to-br from-yellow-500/5 to-orange-500/5 border-orange-500/20">
                <CardContent className="py-4 flex items-center gap-3">
                  <span className="text-3xl">🏅</span>
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {badgeCount} Badge{badgeCount !== 1 ? "s" : ""} Earned!
                    </p>
                    <p className="text-xs text-muted-foreground">View your achievements →</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {/* Security tip */}
          <Card className="border-orange-500/20 bg-orange-500/5">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="size-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Security Tip</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Never click links in unexpected emails. Always verify the sender&apos;s address before taking action.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick links */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-0 pb-3">
              {[
                { href: "/learner/courses", label: "Browse Courses", icon: BookOpen },
                { href: "/learner/progress", label: "My Progress", icon: TrendingUp },
                { href: "/learner/badges", label: "My Badges", icon: Trophy },
                { href: "/learner/profile", label: "My Profile", icon: Star },
              ].map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Icon className="size-4 text-orange-500" />
                  {label}
                  <ChevronRight className="size-3 ml-auto" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
