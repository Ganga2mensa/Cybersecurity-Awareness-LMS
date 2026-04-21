import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET
  if (!WEBHOOK_SECRET) {
    return new Response('Webhook secret not configured', { status: 500 })
  }

  // Read Svix headers
  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing Svix headers', { status: 400 })
  }

  // Verify signature
  const payload = await req.text()
  const wh = new Webhook(WEBHOOK_SECRET)
  let event: WebhookEvent

  try {
    event = wh.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as WebhookEvent
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  // Handle events
  try {
    switch (event.type) {
      case 'user.created': {
        const { id, email_addresses, first_name, last_name } = event.data
        const email = email_addresses[0]?.email_address ?? ''
        const firstName = first_name || null
        const lastName = last_name || null
        await prisma.user.upsert({
          where: { clerkUserId: id },
          update: { email, firstName, lastName },
          create: { 
            clerkUserId: id, 
            email, 
            firstName, 
            lastName, 
            role: 'LEARNER', 
            organizationId: '' 
          },
        })
        break
      }
      case 'organization.created': {
        const { id, name } = event.data
        // Generate a slug from the organization name, fallback to id if name is empty
        const slug = name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || id : id
        await prisma.organization.upsert({
          where: { clerkOrgId: id },
          update: { name },
          create: { clerkOrgId: id, name, slug },
        })
        break
      }
      case 'organizationMembership.created': {
        const { public_user_data, organization, role } = event.data
        const clerkUserId = public_user_data.user_id
        const clerkOrgId = organization.id
        const prismaRole = role === 'org:admin' ? 'ADMIN' : 'LEARNER'
        const org = await prisma.organization.findUnique({
          where: { clerkOrgId },
        })
        if (org) {
          await prisma.user.update({
            where: { clerkUserId: clerkUserId },
            data: { organizationId: org.id, role: prismaRole },
          })
        }
        break
      }
    }
    return new Response('OK', { status: 200 })
  } catch {
    return new Response('Database error', { status: 500 })
  }
}
