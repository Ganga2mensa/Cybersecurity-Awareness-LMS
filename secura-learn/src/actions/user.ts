'use server'

import { auth, currentUser, clerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function syncUserToDatabase(): Promise<void> {
  const { userId, orgId, orgRole } = await auth()

  if (!userId) {
    return
  }

  const clerkUser = await currentUser()

  const email = clerkUser?.emailAddresses[0]?.emailAddress ?? ''
  const firstName = clerkUser?.firstName || null
  const lastName = clerkUser?.lastName || null

  const prismaRole = orgRole === 'org:admin' ? 'ADMIN' : orgRole === 'org:manager' ? 'MANAGER' : 'LEARNER'

  let organizationId: string | undefined

  if (orgId) {
    // Generate a slug from the orgId for now - in a real app this would be more sophisticated
    const slug = orgId.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || orgId
    const org = await prisma.organization.upsert({
      where: { clerkOrgId: orgId },
      update: {},
      create: { clerkOrgId: orgId, name: orgId, slug },
    })
    organizationId = org.id
  }

  // Try to find existing user by clerkUserId first, then fall back to email
  // This handles the case where a user record exists with the email but a different clerkUserId
  const existingByEmail = await prisma.user.findUnique({ where: { email } })

  if (existingByEmail && existingByEmail.clerkUserId !== userId) {
    // Update the existing record to use the correct clerkUserId
    await prisma.user.update({
      where: { email },
      data: {
        clerkUserId: userId,
        ...(firstName ? { firstName } : {}),
        ...(lastName ? { lastName } : {}),
        role: prismaRole,
        ...(organizationId ? { organizationId } : {}),
      },
    })
    return
  }

  await prisma.user.upsert({
    where: { clerkUserId: userId },
    update: {
      email,
      // Only update names from Clerk if not already set in DB (preserve onboarding values)
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      role: prismaRole,
      ...(organizationId ? { organizationId } : {}),
    },
    create: {
      clerkUserId: userId,
      email,
      firstName,
      lastName,
      role: prismaRole,
      organizationId: organizationId ?? '',
    },
  })
}

export async function updateDisplayName(firstName: string, lastName: string): Promise<void> {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthenticated')
  }

  await prisma.user.update({
    where: { clerkUserId: userId },
    data: { firstName, lastName },
  })
}

export async function changeUserRole(
  targetUserId: string,
  newRole: 'ADMIN' | 'LEARNER' | 'MANAGER'
): Promise<{ error?: string }> {
  const { userId: clerkUserId, orgId } = await auth()

  if (!clerkUserId || !orgId) {
    return { error: 'Unauthenticated' }
  }

  // Get the current admin's DB record
  const currentDbUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { id: true, organizationId: true },
  })

  if (!currentDbUser) {
    return { error: 'Current user not found' }
  }

  // Get the target user
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, organizationId: true },
  })

  if (!targetUser) {
    return { error: 'Target user not found' }
  }

  // Verify target user belongs to the same organization
  if (targetUser.organizationId !== currentDbUser.organizationId) {
    return { error: 'User not found in your organization' }
  }

  // Prevent self-role-change
  if (targetUser.id === currentDbUser.id) {
    return { error: 'You cannot change your own role' }
  }

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  })

  const { revalidatePath } = await import('next/cache')
  revalidatePath('/admin/users')

  return {}
}

export async function inviteUser(data: {
  emailAddress: string
  role: 'org:learner' | 'org:manager' | 'org:admin'
  firstName?: string
  lastName?: string
}): Promise<{ error?: string }> {
  const { userId, orgId } = await auth()

  if (!userId || !orgId) {
    return { error: 'Unauthenticated' }
  }

  try {
    const client = await clerkClient()
    await client.organizations.createOrganizationInvitation({
      organizationId: orgId,
      emailAddress: data.emailAddress,
      role: data.role,
      inviterUserId: userId,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/sign-up`,
    })
    return {}
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to send invitation'
    return { error: message }
  }
}
