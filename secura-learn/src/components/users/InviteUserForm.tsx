"use client"

import { useState } from "react"
import { inviteUser } from "@/actions/user"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Role = "org:learner" | "org:manager" | "org:admin"

const roleOptions: { value: Role; label: string }[] = [
  { value: "org:learner", label: "Course Access (Learner)" },
  { value: "org:manager", label: "Course Management (Manager)" },
  { value: "org:admin", label: "Admin" },
]

export function InviteUserForm() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<Role>("org:learner")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successEmail, setSuccessEmail] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessEmail(null)

    const result = await inviteUser({
      emailAddress: email,
      role,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccessEmail(email)
      setEmail("")
      setFirstName("")
      setLastName("")
      setRole("org:learner")
    }
  }

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-base">Invitation Details</CardTitle>
      </CardHeader>
      <CardContent>
        {successEmail && (
          <div className="mb-4 rounded-lg bg-orange-500/10 border border-orange-500/20 px-4 py-3 text-sm text-orange-500">
            Invitation sent to <span className="font-semibold">{successEmail}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Work Email <span className="text-destructive">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label htmlFor="role" className="text-sm font-medium text-foreground">
              Role <span className="text-destructive">*</span>
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
            >
              {roleOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* First Name */}
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="text-sm font-medium text-foreground">
              First Name <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jane"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <label htmlFor="lastName" className="text-sm font-medium text-foreground">
              Last Name <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Smith"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-lg px-4 h-10 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Sending Invitation…" : "Send Invitation"}
          </button>
        </form>
      </CardContent>
    </Card>
  )
}
