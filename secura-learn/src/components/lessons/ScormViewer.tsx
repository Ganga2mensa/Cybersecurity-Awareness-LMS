"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { completeLessonAndUpdateProgress } from "@/actions/enrollments"

interface ScormViewerProps {
  scormPackageUrl: string
  enrollmentId: string
  lessonId: string
  isCompleted: boolean
}

export function ScormViewer({
  scormPackageUrl,
  enrollmentId,
  lessonId,
  isCompleted,
}: ScormViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [completed, setCompleted] = useState(isCompleted)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleComplete = () => {
    if (completed) return
    startTransition(async () => {
      try {
        await completeLessonAndUpdateProgress(enrollmentId, lessonId)
        setCompleted(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to mark as complete")
      }
    })
  }

  useEffect(() => {
    // SCORM 1.2 API shim injected into the parent window so the iframe can access it
    // via window.parent.API (standard SCORM 1.2 discovery)
    const cmiData: Record<string, string> = {
      "cmi.core.lesson_status": "not attempted",
      "cmi.core.score.raw": "",
      "cmi.core.score.min": "",
      "cmi.core.score.max": "",
      "cmi.core.student_id": enrollmentId,
      "cmi.core.student_name": "",
      "cmi.core.session_time": "",
      "cmi.core.total_time": "",
      "cmi.core.lesson_location": "",
      "cmi.suspend_data": "",
    }

    let lastError = "0"

    const API = {
      LMSInitialize: (_param: string): string => {
        lastError = "0"
        return "true"
      },
      LMSFinish: (_param: string): string => {
        lastError = "0"
        return "true"
      },
      LMSGetValue: (element: string): string => {
        lastError = "0"
        return cmiData[element] ?? ""
      },
      LMSSetValue: (element: string, value: string): string => {
        lastError = "0"
        cmiData[element] = value
        // Fire completion when lesson_status is passed or completed
        if (
          element === "cmi.core.lesson_status" &&
          (value === "passed" || value === "completed")
        ) {
          handleComplete()
        }
        return "true"
      },
      LMSCommit: (_param: string): string => {
        lastError = "0"
        return "true"
      },
      LMSGetLastError: (): string => {
        return lastError
      },
      LMSGetErrorString: (errorCode: string): string => {
        const errors: Record<string, string> = {
          "0": "No error",
          "101": "General exception",
          "201": "Invalid argument error",
          "202": "Element cannot have children",
          "203": "Element not an array — cannot have count",
          "301": "Not initialized",
          "401": "Not implemented error",
          "402": "Invalid set value, element is a keyword",
          "403": "Element is read only",
          "404": "Element is write only",
          "405": "Incorrect data type",
        }
        return errors[errorCode] ?? "Unknown error"
      },
      LMSGetDiagnostic: (errorCode: string): string => {
        return `Diagnostic for error ${errorCode}`
      },
    }

    // Attach to window so SCORM content in the iframe can find it via window.parent.API
    ;(window as unknown as Record<string, unknown>)["API"] = API

    return () => {
      delete (window as unknown as Record<string, unknown>)["API"]
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentId, lessonId])

  return (
    <div className="space-y-4">
      <div className="w-full rounded-xl overflow-hidden border border-border bg-black" style={{ height: "600px" }}>
        <iframe
          ref={iframeRef}
          src={scormPackageUrl}
          className="w-full h-full"
          title="SCORM lesson content"
          allow="fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation-by-user-activation"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {completed ? (
        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
          ✓ Lesson completed
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {isPending ? "Saving progress..." : "Complete the SCORM activity to mark this lesson as done."}
        </p>
      )}
    </div>
  )
}
