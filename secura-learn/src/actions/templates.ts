'use server'

import { auth } from '@clerk/nextjs/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'

// ─── Helper ───────────────────────────────────────────────────────────────────

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

// ─── Template Actions ─────────────────────────────────────────────────────────

export async function createTemplate(data: {
  name: string
  subject: string
  htmlBody: string
  senderName: string
  senderEmail: string
}): Promise<{ templateId: string }> {
  const user = await getAuthenticatedUser()

  if (!data.name.trim()) throw new Error('Template name is required')
  if (!data.subject.trim()) throw new Error('Subject is required')
  if (!data.htmlBody.trim()) throw new Error('HTML body is required')
  if (!data.senderName.trim()) throw new Error('Sender name is required')
  if (!data.senderEmail.trim()) throw new Error('Sender email is required')

  const template = await prisma.phishingTemplate.create({
    data: {
      name: data.name.trim(),
      subject: data.subject.trim(),
      htmlBody: data.htmlBody,
      senderName: data.senderName.trim(),
      senderEmail: data.senderEmail.trim(),
      organizationId: user.organizationId,
      createdById: user.id,
    },
  })

  revalidatePath('/admin/templates')
  return { templateId: template.id }
}

export async function updateTemplate(
  templateId: string,
  data: {
    name?: string
    subject?: string
    htmlBody?: string
    senderName?: string
    senderEmail?: string
  }
): Promise<void> {
  const user = await getAuthenticatedUser()

  const template = await prisma.phishingTemplate.findUnique({
    where: { id: templateId },
  })
  if (!template || template.organizationId !== user.organizationId) {
    throw new Error('Template not found')
  }

  await prisma.phishingTemplate.update({
    where: { id: templateId },
    data: {
      ...(data.name !== undefined ? { name: data.name.trim() } : {}),
      ...(data.subject !== undefined ? { subject: data.subject.trim() } : {}),
      ...(data.htmlBody !== undefined ? { htmlBody: data.htmlBody } : {}),
      ...(data.senderName !== undefined ? { senderName: data.senderName.trim() } : {}),
      ...(data.senderEmail !== undefined ? { senderEmail: data.senderEmail.trim() } : {}),
    },
  })

  revalidatePath('/admin/templates')
  revalidatePath(`/admin/templates/${templateId}`)
}

export async function deleteTemplate(templateId: string): Promise<void> {
  const user = await getAuthenticatedUser()

  const template = await prisma.phishingTemplate.findUnique({
    where: { id: templateId },
  })
  if (!template || template.organizationId !== user.organizationId) {
    throw new Error('Template not found')
  }

  await prisma.phishingTemplate.delete({ where: { id: templateId } })

  revalidatePath('/admin/templates')
}

export async function assignTemplateToAttempts(
  campaignId: string,
  templateId: string
): Promise<void> {
  const user = await getAuthenticatedUser()

  const campaign = await prisma.phishingCampaign.findUnique({
    where: { id: campaignId },
  })
  if (!campaign || campaign.organizationId !== user.organizationId) {
    throw new Error('Campaign not found')
  }

  const template = await prisma.phishingTemplate.findUnique({
    where: { id: templateId },
  })
  if (!template || template.organizationId !== user.organizationId) {
    throw new Error('Template not found')
  }

  // Update campaign templateId
  await prisma.phishingCampaign.update({
    where: { id: campaignId },
    data: { templateId },
  })

  // Update all PhishingAttempt records for this campaign
  await prisma.phishingAttempt.updateMany({
    where: { campaignId },
    data: { emailTemplateId: templateId },
  })

  revalidatePath(`/admin/campaigns/${campaignId}`)
}
