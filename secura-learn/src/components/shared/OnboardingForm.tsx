"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateDisplayName } from "@/actions/user"
import { Card, CardContent } from "@/components/ui/card"

export function OnboardingForm() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await updateDisplayName(firstName.trim(), lastName.trim())
      router.push("/learner/dashboard")
    } catch (err: unknown) {
      setLoading(false)
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    }
  }

  return (
    <Card className="max-w-md w-full">
      <CardContent className="pt-6">
        {error && (
          <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First Name */}
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="text-sm font-medium text-foreground">
              First Name <span className="text-destructive">*</span>
            </label>
            <input
              id="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Jane"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <label htmlFor="lastName" className="text-sm font-medium text-foreground">
              Last Name <span className="text-destructive">*</span>
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Smith"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Job Title (informational only) */}
          <div className="space-y-1.5">
            <label htmlFor="jobTitle" className="text-sm font-medium text-foreground">
              Job Title{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </label>
            <input
              id="jobTitle"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Security Engineer"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-colors"
            />
            <p className="text-xs text-muted-foreground">
              Used to personalise your learning experience.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-lg px-4 h-10 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving…" : "Complete Setup →"}
          </button>
        </form>
      </CardContent>
    </Card>
  )
}
