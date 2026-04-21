'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { CampaignStatus } from '@prisma/client'

// ─── State machine ────────────────────────────────────────────────────────────

const VALID_TRANSITIONS: Record<CampaignStatus, CampaignStatus | null> = {
  DRAFT: 'SCHEDULED',
  SCHEDULED: 'RUNNING',
  RUNNING: 'COMPLETED',
  COMPLETED: null,
  PAUSED: null,
}

// ─── Helper: get authenticated user with organizationId ──────────────────────

async function getAuthenticatedUser() {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) throw new Error('Unauthenticated')

  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, organizationId: true },
  })
  if (!user) throw new Error('User not found')
  return user
}

// ─── Campaign Actions ─────────────────────────────────────────────────────────

export async function createCampaign(data: {
  title: string
  description?: string
}): Promise<{ campaignId: string }> {
  const user = await getAuthenticatedUser()

  if (!data.title || data.title.trim() === '') {
    throw new Error('Campaign title is required')
  }

  const campaign = await prisma.phishingCampaign.create({
    data: {
      title: data.title.trim(),
      description: data.description ?? null,
      status: 'DRAFT',
      organizationId: user.organizationId,
      createdById: user.id,
    },
  })

  revalidatePath('/admin/campaigns')
  return { campaignId: campaign.id }
}

export async function transitionCampaignStatus(
  campaignId: string,
  newStatus: CampaignStatus
): Promise<void> {
  const user = await getAuthenticatedUser()

  const campaign = await prisma.phishingCampaign.findUnique({
    where: { id: campaignId },
  })
  if (!campaign || campaign.organizationId !== user.organizationId) {
    throw new Error('Campaign not found')
  }

  const validNext = VALID_TRANSITIONS[campaign.status]
  if (validNext !== newStatus) {
    throw new Error(
      `Invalid status transition from ${campaign.status} to ${newStatus}`
    )
  }

  await prisma.phishingCampaign.update({
    where: { id: campaignId },
    data: { status: newStatus },
  })

  revalidatePath('/admin/campaigns')
  revalidatePath(`/admin/campaigns/${campaignId}`)
}
