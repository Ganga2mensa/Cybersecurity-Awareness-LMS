import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CourseForm } from "@/components/courses/CourseForm"

export default function NewCoursePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Create New Course</h1>
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <CourseForm />
        </CardContent>
      </Card>
    </div>
  )
}
