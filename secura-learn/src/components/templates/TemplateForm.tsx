"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createTemplate, updateTemplate } from "@/actions/templates"

interface TemplateFormProps {
  templateId?: string
  initialValues?: {
    name: string
    subject: string
    htmlBody: string
    senderName: string
    senderEmail: string
  }
}

export function TemplateForm({ templateId, initialValues }: TemplateFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(initialValues?.name ?? "")
  const [subject, setSubject] = useState(initialValues?.subject ?? "")
  const [htmlBody, setHtmlBody] = useState(initialValues?.htmlBody ?? "")
  const [senderName, setSenderName] = useState(initialValues?.senderName ?? "")
  const [senderEmail, setSenderEmail] = useState(initialValues?.senderEmail ?? "")
  const [showPreview, setShowPreview] = useState(false)

  const isEditing = Boolean(templateId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      try {
        if (isEditing && templateId) {
          await updateTemplate(templateId, { name, subject, htmlBody, senderName, senderEmail })
          router.refresh()
        } else {
          const result = await createTemplate({ name, subject, htmlBody, senderName, senderEmail })
          router.push(`/admin/templates/${result.templateId}`)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      }
    })
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
          Template Name <span className="text-destructive">*</span>
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. IT Password Reset"
          required
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="senderName" className="block text-sm font-medium text-foreground mb-1">
            Sender Name <span className="text-destructive">*</span>
          </label>
          <input
            id="senderName"
            type="text"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="IT Support"
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="senderEmail" className="block text-sm font-medium text-foreground mb-1">
            Sender Email <span className="text-destructive">*</span>
          </label>
          <input
            id="senderEmail"
            type="email"
            value={senderEmail}
            onChange={(e) => setSenderEmail(e.target.value)}
            placeholder="it-support@company.com"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-1">
          Email Subject <span className="text-destructive">*</span>
        </label>
        <input
          id="subject"
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Action Required: Reset Your Password"
          required
          className={inputClass}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="htmlBody" className="block text-sm font-medium text-foreground">
            HTML Body <span className="text-destructive">*</span>
          </label>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="text-xs text-orange-500 hover:text-orange-400 transition-colors"
          >
            {showPreview ? "Hide Preview" : "Show Preview"}
          </button>
        </div>
        <textarea
          id="htmlBody"
          value={htmlBody}
          onChange={(e) => setHtmlBody(e.target.value)}
          placeholder="<p>Dear {{name}},</p><p>Please click the link below...</p>"
          rows={10}
          required
          className={`${inputClass} font-mono resize-y`}
        />
      </div>

      {showPreview && htmlBody && (
        <div>
          <p className="text-sm font-medium text-foreground mb-1">Preview</p>
          <div className="rounded-lg border border-border overflow-hidden" style={{ height: "300px" }}>
            <iframe
              srcDoc={htmlBody}
              sandbox="allow-same-origin"
              className="w-full h-full"
              title="Template preview"
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isPending}
          className="bg-orange-500 text-white hover:bg-orange-400"
        >
          {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Template"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
