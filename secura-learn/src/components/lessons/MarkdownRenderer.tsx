"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { completeLessonAndUpdateProgress } from "@/actions/enrollments"

interface MarkdownRendererProps {
  content: string
  enrollmentId: string
  lessonId: string
  isCompleted: boolean
}

// Basic HTML sanitization — strips script tags and event handlers
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
}

// Very basic Markdown to HTML conversion for common patterns
function markdownToHtml(content: string): string {
  return content
    // Headers
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Code blocks
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/, "").replace(/```$/, "")
      return `<pre><code>${code}</code></pre>`
    })
    // Inline code
    .replace(/`(.+?)`/g, "<code>$1</code>")
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Paragraphs (double newlines)
    .replace(/\n\n/g, "</p><p>")
    // Wrap in paragraph tags
    .replace(/^(.+)$/, "<p>$1</p>")
}

export function MarkdownRenderer({ content, enrollmentId, lessonId, isCompleted }: MarkdownRendererProps) {
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

  const html = sanitizeHtml(markdownToHtml(content))

  return (
    <div className="space-y-6">
      <div
        className="prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />

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
