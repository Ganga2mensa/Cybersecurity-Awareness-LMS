"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateLesson } from "@/actions/courses"
import { LessonType } from "@prisma/client"

interface LessonEditFormProps {
  lessonId: string
  courseId: string
  initialValues: {
    title: string
    type: LessonType
    content: string | null
    videoUrl: string | null
    scormPackageUrl: string | null
    durationMinutes: number | null
  }
}

export function LessonEditForm({ lessonId, courseId, initialValues }: LessonEditFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const [title, setTitle] = useState(initialValues.title)
  const [content, setContent] = useState(initialValues.content ?? "")
  const [videoUrl, setVideoUrl] = useState(initialValues.videoUrl ?? "")
  const [scormPackageUrl, setScormPackageUrl] = useState(initialValues.scormPackageUrl ?? "")
  const [durationMinutes, setDurationMinutes] = useState(
    initialValues.durationMinutes?.toString() ?? ""
  )

  const type = initialValues.type

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaved(false)

    startTransition(async () => {
      try {
        await updateLesson(lessonId, {
          title: title.trim(),
          content: content || undefined,
          videoUrl: videoUrl || undefined,
          scormPackageUrl: scormPackageUrl || undefined,
          durationMinutes: durationMinutes ? parseInt(durationMinutes) : undefined,
        })
        setSaved(true)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save lesson")
      }
    })
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Lesson Title <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputClass}
        />
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Duration (minutes) <span className="text-muted-foreground text-xs">(optional)</span>
        </label>
        <input
          type="number"
          min="1"
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(e.target.value)}
          placeholder="e.g. 10"
          className={`${inputClass} w-32`}
        />
      </div>

      {/* VIDEO */}
      {type === "VIDEO" && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Video URL
          </label>
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/embed/... or https://vimeo.com/..."
            className={inputClass}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Supports YouTube, Vimeo, or any direct video URL (.mp4)
          </p>
        </div>
      )}

      {/* TEXT / READING */}
      {(type === "TEXT" || type === "READING") && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            placeholder={`Write your lesson content here. Supports basic Markdown:\n\n# Heading 1\n## Heading 2\n\n**Bold text** and *italic text*\n\n- Bullet point\n- Another point\n\n\`inline code\``}
            className={`${inputClass} font-mono resize-y`}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Supports Markdown: **bold**, *italic*, # headings, - lists, \`code\`
          </p>
        </div>
      )}

      {/* QUIZ — no content field, quiz questions managed separately */}
      {type === "QUIZ" && (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            Quiz questions are managed separately. Save this lesson first, then add questions from the course page.
          </p>
        </div>
      )}

      {/* SCORM */}
      {type === "SCORM" && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            SCORM Package URL
          </label>
          <input
            type="url"
            value={scormPackageUrl}
            onChange={(e) => setScormPackageUrl(e.target.value)}
            placeholder="https://your-storage.com/scorm-package/index.html"
            className={inputClass}
          />
          <p className="text-xs text-muted-foreground mt-1">
            URL to the SCORM package entry point (index.html). Host the package on Supabase Storage or any CDN.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
      {saved && <p className="text-sm text-green-600 dark:text-green-400">✓ Saved successfully</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg px-6 h-10 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Saving..." : "Save Lesson"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/admin/courses/${courseId}`)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Course
        </button>
      </div>
    </form>
  )
}
