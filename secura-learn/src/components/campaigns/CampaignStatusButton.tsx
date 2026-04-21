"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { transitionCampaignStatus } from "@/actions/campaigns"
import { CampaignStatus } from "@prisma/client"

const VALID_TRANSITIONS: Record<CampaignStatus, CampaignStatus | null> = {
  DRAFT: "SCHEDULED",
  SCHEDULED: "RUNNING",
  RUNNING: "COMPLETED",
  COMPLETED: null,
  PAUSED: null,
}

const TRANSITION_LABELS: Record<CampaignStatus, string> = {
  DRAFT: "Schedule",
  SCHEDULED: "Start",
  RUNNING: "Complete",
  COMPLETED: "Completed",
  PAUSED: "Paused",
}

interface CampaignStatusButtonProps {
  campaignId: string
  currentStatus: CampaignStatus
}

export function CampaignStatusButton({ campaignId, currentStatus }: CampaignStatusButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const nextStatus = VALID_TRANSITIONS[currentStatus]

  if (!nextStatus) {
    return (
      <Button disabled variant="outline">
        {TRANSITION_LABELS[currentStatus]}
      </Button>
    )
  }

  const handleTransition = () => {
    startTransition(async () => {
      try {
        await transitionCampaignStatus(campaignId, nextStatus)
        router.refresh()
      } catch (err) {
        console.error("Failed to transition campaign status:", err)
      }
    })
  }

  return (
    <Button onClick={handleTransition} disabled={isPending}>
      {isPending ? "Updating..." : TRANSITION_LABELS[currentStatus]}
    </Button>
  )
}
