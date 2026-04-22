"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { assignTemplateToAttempts } from "@/actions/templates"

interface Template {
  id: string
  name: string
  subject: string
}

interface TemplateAssignFormProps {
  campaignId: string
  currentTemplateId: string | null
  templates: Template[]
}

export function TemplateAssignForm({
  campaignId,
  currentTemplateId,
  templates,
}: TemplateAssignFormProps) {
  const [selectedId, setSelectedId] = useState(currentTemplateId ?? "")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleAssign = () => {
    if (!selectedId) return
    setError(null)
    setSuccess(false)
    startTransition(async () => {
      try {
        await assignTemplateToAttempts(campaignId, selectedId)
        setSuccess(true)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to assign template")
      }
    })
  }

  if (templates.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No templates available.{" "}
        <a href="/admin/templates/new" className="text-orange-500 hover:text-orange-400">
          Create one
        </a>
      </p>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={selectedId}
        onChange={(e) => setSelectedId(e.target.value)}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        <option value="">— Select a template —</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <Button
        onClick={handleAssign}
        disabled={isPending || !selectedId}
        className="bg-orange-500 text-white hover:bg-orange-400"
        size="sm"
      >
        {isPending ? "Assigning..." : "Assign"}
      </Button>
      {success && <span className="text-sm text-green-600 dark:text-green-400">✓ Assigned</span>}
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  )
}
