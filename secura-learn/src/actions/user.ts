'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
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

  const prismaRole = orgRole === 'org:admin' ? 'ADMIN' : 'LEARNER'

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

  await prisma.user.upsert({
    where: { clerkUserId: userId },
    update: {
      email,
      firstName,
      lastName,
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
