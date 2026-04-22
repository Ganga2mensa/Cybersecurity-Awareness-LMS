"use client"

import { useTransition, useState } from "react"
import { changeUserRole } from "@/actions/user"

interface RoleChangeFormProps {
  userId: string
  currentRole: "ADMIN" | "LEARNER" | "MANAGER"
  isSelf: boolean
}

const ROLES = ["ADMIN", "LEARNER", "MANAGER"] as const

export function RoleChangeForm({ userId, currentRole, isSelf }: RoleChangeFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as "ADMIN" | "LEARNER" | "MANAGER"
    if (newRole === currentRole) return
    setError(null)
    startTransition(async () => {
      const result = await changeUserRole(userId, newRole)
      if (result.error) {
        setError(result.error)
      }
    })
  }

  if (isSelf) {
    return (
      <span className="text-xs text-muted-foreground italic">Cannot change own role</span>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        defaultValue={currentRole}
        onChange={handleChange}
        disabled={isPending}
        className="text-sm border border-border rounded-md px-2 py-1 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
        aria-label="Change user role"
      >
        {ROLES.map((role) => (
          <option key={role} value={role}>
            {role}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {isPending && <p className="text-xs text-muted-foreground">Saving…</p>}
    </div>
  )
}
