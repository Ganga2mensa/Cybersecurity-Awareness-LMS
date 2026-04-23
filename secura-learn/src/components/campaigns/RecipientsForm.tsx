"use client"

import { useState, useTransition } from "react"
import { addRecipients, removeRecipient } from "@/actions/campaigns"
import { Trash2 } from "lucide-react"

interface User {
  id: string
  displayName: string
  email: string
  role: string
}

interface RecipientsFormProps {
  campaignId: string
  orgUsers: User[]          // all learners in the org
  currentRecipients: User[] // users already added
}

export function RecipientsForm({
  campaignId,
  orgUsers,
  currentRecipients,
}: RecipientsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const recipientIds = new Set(currentRecipients.map((r) => r.id))
  const available = orgUsers.filter((u) => !recipientIds.has(u.id))

  const toggleSelect = (userId: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const handleAddSelected = () => {
    if (selected.size === 0) return
    setError(null)
    setSuccessMsg(null)
    startTransition(async () => {
      try {
        const result = await addRecipients(campaignId, Array.from(selected))
        setSelected(new Set())
        setSuccessMsg(
          `Added ${result.added} recipient${result.added !== 1 ? "s" : ""}${result.skipped > 0 ? ` (${result.skipped} already added)` : ""}`
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add recipients")
      }
    })
  }

  const handleAddAll = () => {
    setError(null)
    setSuccessMsg(null)
    const allIds = available.map((u) => u.id)
    startTransition(async () => {
      try {
        const result = await addRecipients(campaignId, allIds)
        setSuccessMsg(`Added ${result.added} recipient${result.added !== 1 ? "s" : ""}`)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add recipients")
      }
    })
  }

  const handleRemove = (userId: string) => {
    setError(null)
    setSuccessMsg(null)
    startTransition(async () => {
      try {
        await removeRecipient(campaignId, userId)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to remove recipient")
      }
    })
  }

  const inputClass =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-4 py-3 text-sm text-orange-600 dark:text-orange-400">
          ✓ {successMsg}
        </div>
      )}

      {/* Current recipients */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">
            Current Recipients ({currentRecipients.length})
          </h3>
        </div>

        {currentRecipients.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recipients added yet.</p>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Role</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {currentRecipients.map((recipient) => (
                  <tr key={recipient.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-2 font-medium">{recipient.displayName}</td>
                    <td className="px-4 py-2 text-muted-foreground">{recipient.email}</td>
                    <td className="px-4 py-2 text-muted-foreground text-xs">{recipient.role}</td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => handleRemove(recipient.id)}
                        disabled={isPending}
                        className="text-destructive hover:text-destructive/80 disabled:opacity-50 transition-colors"
                        aria-label="Remove recipient"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add recipients */}
      {available.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              Add Recipients
            </h3>
            <button
              onClick={handleAddAll}
              disabled={isPending}
              className="text-xs text-orange-500 hover:text-orange-400 disabled:opacity-50 transition-colors"
            >
              Add all ({available.length})
            </button>
          </div>

          <div className="rounded-lg border border-border overflow-hidden mb-3">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-2 w-8">
                    <input
                      type="checkbox"
                      checked={selected.size === available.length && available.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) setSelected(new Set(available.map((u) => u.id)))
                        else setSelected(new Set())
                      }}
                      className="accent-orange-500"
                    />
                  </th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Name</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Email</th>
                  <th className="text-left px-4 py-2 font-medium text-muted-foreground">Role</th>
                </tr>
              </thead>
              <tbody>
                {available.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer"
                    onClick={() => toggleSelect(u.id)}
                  >
                    <td className="px-4 py-2">
                      <input
                        type="checkbox"
                        checked={selected.has(u.id)}
                        onChange={() => toggleSelect(u.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="accent-orange-500"
                      />
                    </td>
                    <td className="px-4 py-2 font-medium">{u.displayName}</td>
                    <td className="px-4 py-2 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-2 text-muted-foreground text-xs">{u.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleAddSelected}
            disabled={isPending || selected.size === 0}
            className="inline-flex items-center justify-center rounded-lg px-5 h-9 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Adding..." : `Add Selected (${selected.size})`}
          </button>
        </div>
      )}

      {available.length === 0 && currentRecipients.length > 0 && (
        <p className="text-sm text-muted-foreground">All org users have been added as recipients.</p>
      )}
    </div>
  )
}
