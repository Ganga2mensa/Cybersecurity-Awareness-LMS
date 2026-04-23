"use client"

import { useState, useTransition } from "react"
import { completeLessonAndUpdateProgress } from "@/actions/enrollments"

interface CompleteButtonProps {
  enrollmentId: string
  lessonId: string
  isCompleted: boolean
}

export function CompleteButton({ enrollmentId, lessonId, isCompleted }: CompleteButtonProps) {
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

  if (completed) {
    return (
      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
        ✓ Lesson completed
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        onClick={handleComplete}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-lg px-6 h-10 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending ? "Saving..." : "Mark as Complete ✓"}
      </button>
    </div>
  )
}
