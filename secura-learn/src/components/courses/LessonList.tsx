"use client"

import { useState, useTransition } from "react"
import { ChevronUp, ChevronDown, Trash2, Pencil, Check, X, FileEdit } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} from "@/actions/courses"
import { LessonType } from "@prisma/client"

interface Lesson {
  id: string
  title: string
  type: LessonType
  order: number
  durationMinutes: number | null
}

interface LessonListProps {
  moduleId: string
  courseId: string
  initialLessons: Lesson[]
}

const LESSON_TYPE_LABELS: Record<LessonType, string> = {
  VIDEO: "Video",
  TEXT: "Text",
  QUIZ: "Quiz",
  READING: "Reading",
  SCORM: "SCORM",
}

export function LessonList({ moduleId, courseId, initialLessons }: LessonListProps) {
  const [lessons, setLessons] = useState<Lesson[]>(
    [...initialLessons].sort((a, b) => a.order - b.order)
  )
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newType, setNewType] = useState<LessonType>("TEXT")
  const [error, setError] = useState<string | null>(null)

  const moveLesson = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= lessons.length) return

    const reordered = [...lessons]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, moved)
    const updated = reordered.map((l, i) => ({ ...l, order: i + 1 }))
    setLessons(updated)

    startTransition(async () => {
      try {
        await reorderLessons(moduleId, updated.map((l) => l.id))
      } catch {
        setLessons([...initialLessons].sort((a, b) => a.order - b.order))
      }
    })
  }

  const startEdit = (lesson: Lesson) => {
    setEditingId(lesson.id)
    setEditTitle(lesson.title)
  }

  const saveEdit = (lessonId: string) => {
    if (!editTitle.trim()) return
    startTransition(async () => {
      try {
        await updateLesson(lessonId, { title: editTitle.trim() })
        setLessons((prev) =>
          prev.map((l) => (l.id === lessonId ? { ...l, title: editTitle.trim() } : l))
        )
        setEditingId(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update lesson")
      }
    })
  }

  const handleDelete = (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return
    startTransition(async () => {
      try {
        await deleteLesson(lessonId)
        setLessons((prev) => prev.filter((l) => l.id !== lessonId))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete lesson")
      }
    })
  }

  const handleAddLesson = () => {
    if (!newTitle.trim()) return
    startTransition(async () => {
      try {
        const result = await createLesson(moduleId, {
          title: newTitle.trim(),
          type: newType,
        })
        setLessons((prev) => [
          ...prev,
          { id: result.lessonId, title: newTitle.trim(), type: newType, order: prev.length + 1, durationMinutes: null },
        ])
        setNewTitle("")
        setNewType("TEXT")
        setShowAddForm(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create lesson")
      }
    })
  }

  return (
    <div className="space-y-2 pl-4 border-l border-border ml-2">
      {lessons.map((lesson, index) => (
        <div
          key={lesson.id}
          className="flex items-center gap-2 rounded-lg border border-border bg-background p-2"
        >
          <div className="flex flex-col gap-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => moveLesson(index, "up")}
              disabled={index === 0 || isPending}
              aria-label="Move up"
            >
              <ChevronUp className="size-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => moveLesson(index, "down")}
              disabled={index === lessons.length - 1 || isPending}
              aria-label="Move down"
            >
              <ChevronDown className="size-3" />
            </Button>
          </div>

          <div className="flex-1 min-w-0">
            {editingId === lesson.id ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit(lesson.id)
                    if (e.key === "Escape") setEditingId(null)
                  }}
                  autoFocus
                />
                <Button variant="ghost" size="icon-xs" onClick={() => saveEdit(lesson.id)} disabled={isPending}>
                  <Check className="size-3" />
                </Button>
                <Button variant="ghost" size="icon-xs" onClick={() => setEditingId(null)}>
                  <X className="size-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm truncate">{lesson.title}</span>
                <Badge variant="outline" className="text-xs shrink-0">
                  {LESSON_TYPE_LABELS[lesson.type]}
                </Badge>
              </div>
            )}
          </div>

          {editingId !== lesson.id && (
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href={`/admin/courses/${courseId}/lessons/${lesson.id}/edit`}
                title="Edit content"
                className="inline-flex items-center justify-center rounded size-6 text-muted-foreground hover:text-orange-500 hover:bg-muted transition-colors"
              >
                <FileEdit className="size-3" />
              </Link>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => startEdit(lesson)}
                disabled={isPending}
                aria-label="Rename lesson"
              >
                <Pencil className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => handleDelete(lesson.id)}
                disabled={isPending}
                aria-label="Delete lesson"
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          )}
        </div>
      ))}

      {showAddForm ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Lesson title"
            className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm"
            autoFocus
          />
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as LessonType)}
            className="rounded border border-border bg-background px-2 py-1 text-sm"
          >
            {Object.entries(LESSON_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <Button size="sm" onClick={handleAddLesson} disabled={isPending || !newTitle.trim()}>
            Add
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowAddForm(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAddForm(true)}
          disabled={isPending}
          className="w-full"
        >
          + Add Lesson
        </Button>
      )}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
