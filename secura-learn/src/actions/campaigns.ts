'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { CampaignStatus } from '@prisma/client'
import { Resend } from 'resend'

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

export async function addRecipients(
  campaignId: string,
  userIds: string[]
): Promise<{ added: number; skipped: number }> {
  const user = await getAuthenticatedUser()

  const campaign = await prisma.phishingCampaign.findUnique({
    where: { id: campaignId },
  })
  if (!campaign || campaign.organizationId !== user.organizationId) {
    throw new Error('Campaign not found')
  }

  // Only allow adding recipients to DRAFT or SCHEDULED campaigns
  if (campaign.status === 'COMPLETED') {
    throw new Error('Cannot add recipients to a completed campaign')
  }

  let added = 0
  let skipped = 0

  for (const userId of userIds) {
    try {
      await prisma.phishingAttempt.create({
        data: {
          campaignId,
          userId,
          emailTemplateId: campaign.templateId ?? null,
        },
      })
      added++
    } catch (err: unknown) {
      // P2002 = unique constraint (already a recipient)
      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        (err as { code: string }).code === 'P2002'
      ) {
        skipped++
      } else {
        throw err
      }
    }
  }

  revalidatePath(`/admin/campaigns/${campaignId}`)
  revalidatePath(`/admin/campaigns/${campaignId}/recipients`)
  return { added, skipped }
}

export async function removeRecipient(
  campaignId: string,
  userId: string
): Promise<void> {
  const user = await getAuthenticatedUser()

  const campaign = await prisma.phishingCampaign.findUnique({
    where: { id: campaignId },
  })
  if (!campaign || campaign.organizationId !== user.organizationId) {
    throw new Error('Campaign not found')
  }

  await prisma.phishingAttempt.deleteMany({
    where: { campaignId, userId },
  })

  revalidatePath(`/admin/campaigns/${campaignId}`)
  revalidatePath(`/admin/campaigns/${campaignId}/recipients`)
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

// ─── Send Campaign Emails ─────────────────────────────────────────────────────

export async function sendCampaignEmails(
  campaignId: string
): Promise<{ sent: number; failed: number; error?: string }> {
  const user = await getAuthenticatedUser()

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  const FROM_DOMAIN = process.env.RESEND_FROM_DOMAIN ?? 'onboarding@resend.dev'
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  if (!RESEND_API_KEY) {
    return { sent: 0, failed: 0, error: 'RESEND_API_KEY is not configured' }
  }

  const campaign = await prisma.phishingCampaign.findUnique({
    where: { id: campaignId },
    include: {
      template: true,
      attempts: {
        include: {
          user: { select: { email: true, firstName: true, lastName: true } },
        },
      },
    },
  })

  if (!campaign || campaign.organizationId !== user.organizationId) {
    return { sent: 0, failed: 0, error: 'Campaign not found' }
  }

  if (!campaign.template) {
    return { sent: 0, failed: 0, error: 'No email template assigned to this campaign' }
  }

  if (campaign.attempts.length === 0) {
    return { sent: 0, failed: 0, error: 'No recipients added to this campaign' }
  }

  const resend = new Resend(RESEND_API_KEY)
  let sent = 0
  let failed = 0

  for (const attempt of campaign.attempts) {
    const recipientName = [attempt.user.firstName, attempt.user.lastName]
      .filter(Boolean)
      .join(' ') || attempt.user.email

    // Embed tracking pixel and click link into the HTML body
    const trackingPixel = `<img src="${APP_URL}/api/track/open/${attempt.id}" width="1" height="1" style="display:none" alt="" />`
    const htmlWithTracking = campaign.template.htmlBody
      .replace(/\{\{name\}\}/g, recipientName)
      .replace(/\{\{click_url\}\}/g, `${APP_URL}/api/track/click/${attempt.id}`)
      + trackingPixel

    try {
      await resend.emails.send({
        from: `${campaign.template.senderName} <${FROM_DOMAIN}>`,
        to: attempt.user.email,
        subject: campaign.template.subject,
        html: htmlWithTracking,
      })
      sent++
    } catch {
      failed++
    }
  }

  // Update campaign sentAt timestamp
  await prisma.phishingCampaign.update({
    where: { id: campaignId },
    data: { sentAt: new Date() },
  })

  revalidatePath(`/admin/campaigns/${campaignId}`)
  return { sent, failed }
}
