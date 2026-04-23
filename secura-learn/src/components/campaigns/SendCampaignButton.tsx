"use client"

import { useState, useTransition } from "react"
import { sendCampaignEmails } from "@/actions/campaigns"

interface SendCampaignButtonProps {
  campaignId: string
  recipientCount: number
  hasTemplate: boolean
  sentAt: Date | null
}

export function SendCampaignButton({
  campaignId,
  recipientCount,
  hasTemplate,
  sentAt,
}: SendCampaignButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ sent: number; failed: number; error?: string } | null>(null)

  const canSend = hasTemplate && recipientCount > 0

  const handleSend = () => {
    if (!confirm(`Send phishing simulation emails to ${recipientCount} recipient${recipientCount !== 1 ? "s" : ""}?`)) return

    startTransition(async () => {
      const res = await sendCampaignEmails(campaignId)
      setResult(res)
    })
  }

  if (result) {
    return (
      <div className="space-y-2">
        {result.error ? (
          <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            ✗ {result.error}
          </div>
        ) : (
          <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 px-4 py-3 text-sm text-orange-600 dark:text-orange-400">
            ✓ Sent {result.sent} email{result.sent !== 1 ? "s" : ""}
            {result.failed > 0 && ` · ${result.failed} failed`}
          </div>
        )}
        <button
          onClick={() => setResult(null)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Send again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {sentAt && (
        <p className="text-xs text-muted-foreground">
          Last sent: {new Date(sentAt).toLocaleString()}
        </p>
      )}
      {!canSend && (
        <p className="text-xs text-muted-foreground">
          {!hasTemplate && "Assign a template first. "}
          {recipientCount === 0 && "Add recipients first."}
        </p>
      )}
      <button
        onClick={handleSend}
        disabled={isPending || !canSend}
        className="inline-flex items-center justify-center rounded-lg px-6 h-10 text-sm font-semibold bg-orange-500 text-white hover:bg-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isPending
          ? "Sending..."
          : sentAt
          ? `Resend to ${recipientCount} recipient${recipientCount !== 1 ? "s" : ""}`
          : `Send to ${recipientCount} recipient${recipientCount !== 1 ? "s" : ""}`}
      </button>
    </div>
  )
}
