import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string | null
    moduleCount: number
    lessonCount: number
    totalDurationMinutes: number
  }
  enrollment?: {
    progressPercentage: number
  } | null
}

export function CourseCard({ course, enrollment }: CourseCardProps) {
  const descriptionExcerpt = course.description
    ? course.description.length > 120
      ? course.description.slice(0, 120) + "..."
      : course.description
    : null

  const hours = Math.floor(course.totalDurationMinutes / 60)
  const minutes = course.totalDurationMinutes % 60
  const durationLabel =
    course.totalDurationMinutes > 0
      ? hours > 0
        ? `${hours}h ${minutes > 0 ? `${minutes}m` : ""}`.trim()
        : `${minutes}m`
      : null

  return (
    <Link href={`/learner/courses/${course.id}`}>
      <Card className="h-full hover:ring-2 hover:ring-primary/30 transition-all cursor-pointer">
        <CardHeader>
          <CardTitle className="text-base">{course.title}</CardTitle>
          {descriptionExcerpt && (
            <p className="text-sm text-muted-foreground">{descriptionExcerpt}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>{course.moduleCount} module{course.moduleCount !== 1 ? "s" : ""}</span>
            <span>·</span>
            <span>{course.lessonCount} lesson{course.lessonCount !== 1 ? "s" : ""}</span>
            {durationLabel && (
              <>
                <span>·</span>
                <span>{durationLabel}</span>
              </>
            )}
          </div>

          {enrollment !== null && enrollment !== undefined ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{enrollment.progressPercentage}%</span>
              </div>
              <Progress value={enrollment.progressPercentage} />
              {enrollment.progressPercentage === 100 && (
                <Badge variant="success" className="text-xs">Completed</Badge>
              )}
            </div>
          ) : (
            <Badge variant="outline" className="text-xs">Not enrolled</Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
