"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createCourse, updateCourse } from "@/actions/courses"

interface CourseFormProps {
  courseId?: string
  initialValues?: {
    title: string
    description?: string | null
    coverImageUrl?: string | null
  }
}

export function CourseForm({ courseId, initialValues }: CourseFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState(initialValues?.title ?? "")
  const [description, setDescription] = useState(initialValues?.description ?? "")
  const [coverImageUrl, setCoverImageUrl] = useState(initialValues?.coverImageUrl ?? "")

  const isEditing = Boolean(courseId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError("Course title is required")
      return
    }

    startTransition(async () => {
      try {
        if (isEditing && courseId) {
          await updateCourse(courseId, {
            title: title.trim(),
            description: description || undefined,
            coverImageUrl: coverImageUrl || undefined,
          })
          router.refresh()
        } else {
          const result = await createCourse({
            title: title.trim(),
            description: description || undefined,
            coverImageUrl: coverImageUrl || undefined,
          })
          router.push(`/admin/courses/${result.courseId}`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
          Title <span className="text-destructive">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Course title"
          required
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Course description (optional)"
          rows={4}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div>
        <label htmlFor="coverImageUrl" className="block text-sm font-medium text-foreground mb-1">
          Cover Image URL
        </label>
        <input
          id="coverImageUrl"
          type="url"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg (optional)"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Course"}
        </Button>
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
