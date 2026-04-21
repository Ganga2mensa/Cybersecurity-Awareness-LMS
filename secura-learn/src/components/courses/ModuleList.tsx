"use client"

import { useState, useTransition } from "react"
import { ChevronUp, ChevronDown, Trash2, Pencil, Check, X, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  createModule,
  updateModule,
  deleteModule,
  reorderModules,
} from "@/actions/courses"
import { LessonList } from "./LessonList"
import { LessonType } from "@prisma/client"

interface Lesson {
  id: string
  title: string
  type: LessonType
  order: number
  durationMinutes: number | null
}

interface Module {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

interface ModuleListProps {
  courseId: string
  initialModules: Module[]
}

export function ModuleList({ courseId, initialModules }: ModuleListProps) {
  const [modules, setModules] = useState<Module[]>(
    [...initialModules].sort((a, b) => a.order - b.order)
  )
  const [isPending, startTransition] = useTransition()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [showAddForm, setShowAddForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [error, setError] = useState<string | null>(null)

  const toggleExpand = (moduleId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  const moveModule = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= modules.length) return

    const reordered = [...modules]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, moved)
    const updated = reordered.map((m, i) => ({ ...m, order: i + 1 }))
    setModules(updated)

    startTransition(async () => {
      try {
        await reorderModules(courseId, updated.map((m) => m.id))
      } catch {
        setModules([...initialModules].sort((a, b) => a.order - b.order))
      }
    })
  }

  const startEdit = (mod: Module) => {
    setEditingId(mod.id)
    setEditTitle(mod.title)
  }

  const saveEdit = (moduleId: string) => {
    if (!editTitle.trim()) return
    startTransition(async () => {
      try {
        await updateModule(moduleId, { title: editTitle.trim() })
        setModules((prev) =>
          prev.map((m) => (m.id === moduleId ? { ...m, title: editTitle.trim() } : m))
        )
        setEditingId(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update module")
      }
    })
  }

  const handleDelete = (moduleId: string) => {
    if (!confirm("Delete this module and all its lessons?")) return
    startTransition(async () => {
      try {
        await deleteModule(moduleId)
        setModules((prev) => prev.filter((m) => m.id !== moduleId))
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete module")
      }
    })
  }

  const handleAddModule = () => {
    if (!newTitle.trim()) return
    startTransition(async () => {
      try {
        const result = await createModule(courseId, { title: newTitle.trim() })
        setModules((prev) => [
          ...prev,
          { id: result.moduleId, title: newTitle.trim(), order: prev.length + 1, lessons: [] },
        ])
        setNewTitle("")
        setShowAddForm(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create module")
      }
    })
  }

  return (
    <div className="space-y-3">
      {modules.map((mod, index) => (
        <div key={mod.id} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 p-3">
            <div className="flex flex-col gap-0.5">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => moveModule(index, "up")}
                disabled={index === 0 || isPending}
                aria-label="Move module up"
              >
                <ChevronUp className="size-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => moveModule(index, "down")}
                disabled={index === modules.length - 1 || isPending}
                aria-label="Move module down"
              >
                <ChevronDown className="size-3" />
              </Button>
            </div>

            <button
              onClick={() => toggleExpand(mod.id)}
              className="flex items-center gap-1 flex-1 min-w-0 text-left"
            >
              <ChevronRight
                className={`size-4 shrink-0 transition-transform ${expandedIds.has(mod.id) ? "rotate-90" : ""}`}
              />
              {editingId === mod.id ? (
                <div className="flex items-center gap-2 flex-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(mod.id)
                      if (e.key === "Escape") setEditingId(null)
                    }}
                    autoFocus
                  />
                  <Button variant="ghost" size="icon-xs" onClick={() => saveEdit(mod.id)} disabled={isPending}>
                    <Check className="size-3" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" onClick={() => setEditingId(null)}>
                    <X className="size-3" />
                  </Button>
                </div>
              ) : (
                <span className="text-sm font-medium truncate">{mod.title}</span>
              )}
            </button>

            <span className="text-xs text-muted-foreground shrink-0">
              {mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}
            </span>

            {editingId !== mod.id && (
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => startEdit(mod)}
                  disabled={isPending}
                  aria-label="Edit module"
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(mod.id)}
                  disabled={isPending}
                  aria-label="Delete module"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            )}
          </div>

          {expandedIds.has(mod.id) && (
            <div className="px-3 pb-3">
              <LessonList
                moduleId={mod.id}
                courseId={courseId}
                initialLessons={mod.lessons}
              />
            </div>
          )}
        </div>
      ))}

      {showAddForm ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border p-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Module title"
            className="flex-1 rounded border border-border bg-background px-3 py-2 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddModule()
              if (e.key === "Escape") setShowAddForm(false)
            }}
          />
          <Button onClick={handleAddModule} disabled={isPending || !newTitle.trim()}>
            Add Module
          </Button>
          <Button variant="ghost" onClick={() => setShowAddForm(false)}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowAddForm(true)}
          disabled={isPending}
          className="w-full"
        >
          + Add Module
        </Button>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
