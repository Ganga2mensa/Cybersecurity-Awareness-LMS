import { auth } from "@clerk/nextjs/server"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RecipientsForm } from "@/components/campaigns/RecipientsForm"
import { CampaignStatus } from "@prisma/client"

const STATUS_VARIANTS: Record<CampaignStatus, "default" | "outline" | "success" | "warning" | "destructive" | "secondary"> = {
  DRAFT: "outline",
  SCHEDULED: "warning",
  RUNNING: "default",
  COMPLETED: "success",
  PAUSED: "secondary",
}

interface Props {
  params: Promise<{ campaignId: string }>
}

export default async function CampaignRecipientsPage({ params }: Props) {
  const { campaignId } = await params
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) redirect("/sign-in")

  const adminUser = await prisma.user.findUnique({
    where: { clerkUserId },
    select: { organizationId: true },
  })
  if (!adminUser) redirect("/sign-in")

  const campaign = await prisma.phishingCampaign.findUnique({
    where: { id: campaignId },
    select: {
      id: true,
      title: true,
      status: true,
      organizationId: true,
      attempts: {
        select: { userId: true },
      },
    },
  })

  if (!campaign || campaign.organizationId !== adminUser.organizationId) {
    notFound()
  }

  // All users in the org (excluding admins — typically you only phish learners)
  const orgUsers = await prisma.user.findMany({
    where: { organizationId: adminUser.organizationId },
    select: { id: true, firstName: true, lastName: true, email: true, role: true },
    orderBy: { createdAt: "asc" },
  })

  const recipientUserIds = new Set(campaign.attempts.map((a) => a.userId))

  const formatUser = (u: { id: string; firstName: string | null; lastName: string | null; email: string; role: string }) => ({
    id: u.id,
    displayName: u.firstName || u.lastName
      ? [u.firstName, u.lastName].filter(Boolean).join(" ")
      : u.email,
    email: u.email,
    role: u.role,
  })

  const currentRecipients = orgUsers
    .filter((u) => recipientUserIds.has(u.id))
    .map(formatUser)

  const allOrgUsers = orgUsers.map(formatUser)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/admin/campaigns" className="hover:text-foreground">Campaigns</Link>
        <span>/</span>
        <Link href={`/admin/campaigns/${campaignId}`} className="hover:text-foreground">
          {campaign.title}
        </Link>
        <span>/</span>
        <span className="text-foreground">Recipients</span>
      </div>

      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-foreground">Manage Recipients</h1>
        <Badge variant={STATUS_VARIANTS[campaign.status]}>{campaign.status}</Badge>
      </div>

      {campaign.status === "COMPLETED" && (
        <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 text-sm text-muted-foreground">
          This campaign is completed. Recipients cannot be modified.
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Recipients — {currentRecipients.length} selected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecipientsForm
            campaignId={campaignId}
            orgUsers={allOrgUsers}
            currentRecipients={currentRecipients}
          />
        </CardContent>
      </Card>
    </div>
  )
}
