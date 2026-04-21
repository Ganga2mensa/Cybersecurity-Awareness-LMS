"use client"

import { useState, useTransition } from 'react'
import { updateDisplayName } from '@/actions/user'

interface EditNameFormProps {
  currentFirstName: string | null
  currentLastName: string | null
}

export function EditNameForm({ currentFirstName, currentLastName }: EditNameFormProps) {
  const [firstName, setFirstName] = useState(currentFirstName ?? '')
  const [lastName, setLastName] = useState(currentLastName ?? '')
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSuccess(false)
    startTransition(async () => {
      await updateDisplayName(firstName, lastName)
      setSuccess(true)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="first-name"
            className="text-sm font-medium text-foreground"
          >
            First Name
          </label>
          <input
            id="first-name"
            type="text"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value)
              setSuccess(false)
            }}
            disabled={isPending}
            placeholder="Enter your first name"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="last-name"
            className="text-sm font-medium text-foreground"
          >
            Last Name
          </label>
          <input
            id="last-name"
            type="text"
            value={lastName}
            onChange={(e) => {
              setLastName(e.target.value)
              setSuccess(false)
            }}
            disabled={isPending}
            placeholder="Enter your last name"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Saving...' : 'Save'}
      </button>

      {success && (
        <p className="text-sm font-medium text-green-600 dark:text-green-400">
          Name updated successfully!
        </p>
      )}
    </form>
  )
}
