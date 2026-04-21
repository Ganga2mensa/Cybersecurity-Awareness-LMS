"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { completeLessonAndUpdateProgress } from "@/actions/enrollments"

interface VideoPlayerProps {
  videoUrl: string
  enrollmentId: string
  lessonId: string
  isCompleted: boolean
}

export function VideoPlayer({ videoUrl, enrollmentId, lessonId, isCompleted }: VideoPlayerProps) {
  const [isPending, startTransition] = useTransition()
  const [completed, setCompleted] = useState(isCompleted)
  const [error, setError] = useState<string | null>(null)

  const handleComplete = () => {
    startTransition(async () => {
      try {
        await completeLessonAndUpdateProgress(enrollmentId, lessonId)
        setCompleted(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to mark as complete")
      }
    })
  }

  // Determine if it's an embeddable URL (YouTube, Vimeo, etc.) or a direct video
  const isEmbeddable =
    videoUrl.includes("youtube.com") ||
    videoUrl.includes("youtu.be") ||
    videoUrl.includes("vimeo.com")

  return (
    <div className="space-y-4">
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
        {isEmbeddable ? (
          <iframe
            src={videoUrl}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="Lesson video"
          />
        ) : (
          <video
            src={videoUrl}
            controls
            className="w-full h-full"
            onEnded={handleComplete}
          >
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!completed ? (
        <Button onClick={handleComplete} disabled={isPending}>
          {isPending ? "Marking complete..." : "Mark as Complete"}
        </Button>
      ) : (
        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
          ✓ Lesson completed
        </p>
      )}
    </div>
  )
}
